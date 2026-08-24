// CanvasAPI.js
//
// Procedural Vector Graphics API for Lens Studio

//@input Asset.Material vectorMaterial
//@input Asset.Material backgroundMaterial
//@input Asset.Material onscreenMaterial
//@input Asset.Material gaussBlurMaterial
//@input Asset.Texture overlayRT
//@input Asset.Font[] fonts
//@input Asset.Font customFont1
//@input Asset.Font customFont2
//@input Asset.Font customFont3
//@input Asset.Font customFont4
//@input int baseRenderOrder = -3000

const scriptSo = script.getSceneObject();
const scriptLayer = scriptSo.layer;

const MAX_VERTICES_PER_BATCH = 60000; // Leave some margin

// measureText(): Text.getBoundingBox()->syncState() is rate-limited per frame per Text
// component by the engine (throws past it). Cap real measurements of NEW strings per frame
// and fall back to a proportional estimate beyond that; cached values are always free.
const CANVAS_MEASURE_COMP_POOL = 20;       // hidden measuring Text comps; the engine's syncState rate limit is PER
                                           // component, so a pool multiplies the per-frame measure headroom
                                           // (POOL*BUDGET_PER_COMP = 80 new strings/frame). This is a CEILING, not an
                                           // allocation: comps are created on demand, one per 4 new strings measured
                                           // in a frame, so a light HUD still uses just one. Beyond the ceiling the
                                           // over-reporting estimate keeps text from clipping (only sizes it small).
const CANVAS_MEASURE_BUDGET_PER_COMP = 4;  // per comp per frame: engine RateLimit(5) minus its own render syncState
const CANVAS_TEXT_FALLBACK_ADVANCE = 1.834; // fallback width per char, as a fraction of textSize. NOT ~1 em: one em
                                          // renders at ~1.368 * textSize here, so a 1.0 value under-reports (and clipped)
                                          // most glyphs. 1.834 is the smallest value that bounds the widest single glyph
                                          // in every shipped font (the binding case is a 1-char string, Rochester "W");
                                          // that also covers every longer string, since the widest per-char advance is
                                          // only ~1.489. Derived from the font files over ASCII 32-126; a rare non-ASCII
                                          // glyph can exceed it. Over-reports normal text ~2.3x, so text fit from this
                                          // estimate renders small - acceptable because it never clips and this path is
                                          // only reached past the per-frame measurement budget.
const CANVAS_TEXT_FALLBACK_LINE_HEIGHT = 2.4; // fallback line-box height as a fraction of textSize, for the same
                                          // estimate path as CANVAS_TEXT_FALLBACK_ADVANCE. The real ratio is a per-font
                                          // constant (it does not vary with the string): measured 1.7701 for 'headline'
                                          // up to 2.3287 for 'casual' across the shipped fonts, ink allowance included.
                                          // 2.4 bounds the largest of those, so on the estimate path fitTextSize()
                                          // under-estimates the size that fits rather than over-.
const CANVAS_LINE_HEIGHT_PROBE = "0"; // string textLineHeight() measures; the line-box ratio is per-font, not per-string
const CANVAS_MEASURE_CACHE_MAX = 256; // bound the width cache (dynamic HUD strings would grow it unboundedly otherwise)
const TEXT_FIXED_SCALE = 3; // extra scale text() applies to drawn Text; measureText mirrors it
// Engine constants needed to measure on the same raster grid text() draws on (see _textMeasureSize).
// Both are LensCore internals, so a change there silently shifts measured widths: TEXT_SDF_PPEM is
// SDFPixelSize (the fixed pixels/em of the SDF raster) and TEXT_FONT_SIZE_TO_WORLD_UNIT is
// fontSizeToWorldUnit. TEXT_SIZE_MIN/MAX are the clamp the engine applies to Text.size.
const TEXT_SDF_PPEM = 93;
// Ask for a hair ABOVE the integer ppem. The engine's raster grid steps exactly AT 93, and which side
// of that step a canvas lands on depends on float rounding inside the engine: a 720x1280 canvas landed
// one step low while 512x910 landed correctly, so the two disagreed by ~1% on the same string. Biasing
// up puts every canvas shape on the higher grid, which is the one the drawn SDF glyphs use. The bias
// must be >= ~1e-5 relative to survive float32; 1e-9 was measured to be a no-op.
const TEXT_SDF_PPEM_BIAS = 1 + 1e-5;
const TEXT_FONT_SIZE_TO_WORLD_UNIT = 43.88571429;
const TEXT_SIZE_MIN = 2;
const TEXT_SIZE_MAX = 800;
// getBoundingBox() trims per-glyph padding, so it reports ~advance width; heavy/script/display
// glyphs' ink can overhang the advance by a fraction of the font size. measureText is used to
// keep HUD text from clipping/overlapping, where UNDER-reporting is the unsafe direction, so add
// a small allowance (as a fraction of textSize) to conservatively bound the rendered ink.
const TEXT_MEASURE_INK_PAD = 0.3;
const CANVAS_TEXTBOX_PAD_RATIO = 0.16;   // textBox inset per side, as a fraction of the box's SHORTER side
// Of the canvas HEIGHT: 14px on a 1280-tall canvas, the floor a phone reads at, held on the em
// (textSize) rather than on the line box, which is ~2x it per font. Every draw path clamps the em up
// to this before it paints, so a box too small to hold one legible line ellipsizes instead of
// shrinking to a speck (VerticalOverflow.Shrink has no floor of its own). Calibrated on measured
// sizes, not on ink estimates: the smallest string in a HUD judged readable was 14.9px (0.0116) and
// the ones judged too small were 9.7px and 10.3px (0.0076, 0.0081), so this separates them.
const CANVAS_TEXT_MIN_SIZE_FRACTION = 0.011;

let manager;

// Import rendering functions
const {
    CAP_ROUND,
    CAP_SQUARE,
    JOIN_MITER,
    JOIN_BEVEL,
    JOIN_ROUND,
    renderLine,
    renderCircle,
    renderEllipse,
    renderRect,
    renderShape,
    renderImageQuad,
    applyGlobalAlpha
} = require('./CanvasRenderer');
const { triangulate } = require('./Triangulator');
const { CanvasGradient } = require('./CanvasGradient');

// Color mode constants
const RGB = 'rgb';
const HSB = 'hsb';
const HSL = 'hsl';

// Angle mode constants
const RADIANS = 'radians';
const DEGREES = 'degrees';

// Blend Modes
const NORMAL = 'normal';
const ADD = 'add';
const MULTIPLY = 'multiply';
const SCREEN = 'screen';
const LIGHTEN = 'lighten';
const LIGHTEST = 'lightest';
const DARKEN = 'darken';
const DARKEST = 'darkest';

// All blend mode strings blendMode() understands, for the unsupported-mode warning
const SUPPORTED_BLEND_MODES = [NORMAL, ADD, MULTIPLY, SCREEN, LIGHTEN, LIGHTEST, DARKEN, DARKEST];

// Max distinct fill-gradient LUT textures cached per canvas (FIFO eviction). Bounds
// GPU memory when gradients are recreated each frame; see Canvas._lutForGradient.
const MAX_GRADIENT_LUTS = 32;

// Glow: downscale the canvas to this fraction, blur it with a multi-tap Gaussian
// at that low res, then additively upscale. Smaller scale = wider, cheaper glow.
const GLOW_RESOLUTION_SCALE = 0.12;

// Bounds for glow()'s radius argument, pushed to the blur shader's `blurFactor`. The
// kernel reaches +/-R*blurFactor texels, so past ~1.6 the 13-tap kernel undersamples
// and the halo bands; below ~0.3 the taps collapse onto the centre texel.
const GLOW_RADIUS_MIN = 0.3;
const GLOW_RADIUS_MAX = 1.6;

// Image Modes
const CORNER = 'corner';
const CORNERS = 'corners';
const CENTER = 'center';

// Font styles — same set as the Text on Screen block (style name -> slot in script.fonts).
// family is the underlying font's family name, accepted as an alias by textFont().
const FONT_STYLES = {
    regular:      { index: 0,  family: 'opensans' },
    casual:       { index: 1,  family: 'oswald' },
    headline:     { index: 2,  family: 'bangers' },
    comic:        { index: 3,  family: 'comicneue' },
    bold:         { index: 4,  family: 'rubikmonoone' },
    playful:      { index: 5,  family: 'fredoka' },
    retro:        { index: 6,  family: 'odibeesans' },
    handwritten:  { index: 7,  family: 'gochihand' },
    grandelegant: { index: 8,  family: 'rochester' },
    artdeco:      { index: 9,  family: 'limelight' },
    quirky:       { index: 10, family: 'amaticsc' },
};

// The default font's slot in script.fonts: 'playful' (Fredoka), the block's historical default
const DEFAULT_FONT_INDEX = 5;

function getDefaultFont() {
    return script.fonts ? script.fonts[DEFAULT_FONT_INDEX] : null;
}

// Custom font slots (user-provided assets bound at build time)
const CUSTOM_FONTS = {
    custom1: () => script.customFont1,
    custom2: () => script.customFont2,
    custom3: () => script.customFont3,
    custom4: () => script.customFont4,
};

// Text Alignment - Horizontal
const LEFT = 'left';
const RIGHT = 'right';
const CENTER_ALIGN = 'center';

// Text Alignment - Vertical
const TOP = 'top';
const MIDDLE = 'middle';
const BOTTOM = 'bottom';

// textAlign string constant -> engine enum, built once and reused. Lazy so the engine enums resolve
// at call time (not module-eval) and so the maps aren't re-allocated on every text()/textBox() draw.
let _textAlignMaps = null;
function textAlignMaps() {
    if (!_textAlignMaps) {
        _textAlignMaps = {
            h: { [LEFT]: HorizontalAlignment.Left, [CENTER_ALIGN]: HorizontalAlignment.Center, [RIGHT]: HorizontalAlignment.Right },
            v: { [TOP]: VerticalAlignment.Top, [MIDDLE]: VerticalAlignment.Center, [BOTTOM]: VerticalAlignment.Bottom },
        };
    }
    return _textAlignMaps;
}

// Matrix helper functions using built-in mat3 class
function createTranslateMatrix(tx, ty) {
    const m = new mat3();
    m.column0 = new vec3(1, 0, 0);
    m.column1 = new vec3(0, 1, 0);
    m.column2 = new vec3(tx, ty, 1);
    return m;
}

function createScaleMatrix(sx, sy) {
    const m = new mat3();
    m.column0 = new vec3(sx, 0, 0);
    m.column1 = new vec3(0, sy, 0);
    m.column2 = new vec3(0, 0, 1);
    return m;
}

function createRotateMatrix(angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const m = new mat3();
    m.column0 = new vec3(c, s, 0);
    m.column1 = new vec3(-s, c, 0);
    m.column2 = new vec3(0, 0, 1);
    return m;
}

function transformPoint(mat, x, y) {
    // Apply 2D affine transform using mat3
    // mat3 is column-major: column0, column1, column2
    const col0 = mat.column0;
    const col1 = mat.column1;
    const col2 = mat.column2;
    
    return {
        x: col0.x * x + col1.x * y + col2.x,
        y: col0.y * x + col1.y * y + col2.y
    };
}

function getMatrixScale(mat) {
    // Extract scale from transform matrix using vec2 length
    const col0 = mat.column0;
    const col1 = mat.column1;
    const sx = new vec2(col0.x, col0.y).length;
    const sy = new vec2(col1.x, col1.y).length;
    return new vec2(sx, sy);
}

function isIdentityTransform(mat) {
    // Check if matrix is identity (no transforms applied)
    const col0 = mat.column0;
    const col1 = mat.column1;
    const col2 = mat.column2;
    
    return Math.abs(col0.x - 1) < 0.001 && Math.abs(col0.y) < 0.001 &&
           Math.abs(col1.x) < 0.001 && Math.abs(col1.y - 1) < 0.001 &&
           Math.abs(col2.x) < 0.001 && Math.abs(col2.y) < 0.001;
}

// Color conversion helpers
function hsbToRgb(h, s, b) {
    // h, s, b are all in range [0, 1]
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = b * (1 - s);
    const q = b * (1 - f * s);
    const t = b * (1 - (1 - f) * s);
    
    let r, g, b_out;
    switch (i % 6) {
        case 0: r = b; g = t; b_out = p; break;
        case 1: r = q; g = b; b_out = p; break;
        case 2: r = p; g = b; b_out = t; break;
        case 3: r = p; g = q; b_out = b; break;
        case 4: r = t; g = p; b_out = b; break;
        case 5: r = b; g = p; b_out = q; break;
    }
    
    return { r, g, b: b_out };
}

function hslToRgb(h, s, l) {
    // h, s, l are all in range [0, 1]
    let r, g, b;
    
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    
    return { r, g, b };
}

function toLSBlendMode(mode) {
    switch(mode) {
        case ADD:
            return BlendMode.Add;
        case MULTIPLY:
            return BlendMode.Multiply;
        case SCREEN:
            return BlendMode.Screen;
        case LIGHTEN:
        case LIGHTEST:
            return BlendMode.Max;
        case DARKEN:
        case DARKEST:
            return BlendMode.Min;
        case NORMAL:
        default:
            return BlendMode.PremultipliedAlphaHardware;
    }
}

// Canvas for vector graphics using MeshBuilder
class Canvas {
    constructor(fullscreen, width, height) {
        this.size = new vec2(0,0);
        this.doStroke = true;
        this.strokeColor = new vec4(1,1,1,1);
        this.strokeWidth = 1;
        this.lineCapStyle = CAP_ROUND;
        this.lineJoinStyle = JOIN_MITER;
        this.doFill = true;
        this.fillColor = new vec4(1,1,1,1);

        // Glow (additive bloom). Lazily created on first glow() call.
        this.glowEnabled = false;
        this.glowIntensity = 1.0;
        this.glowRadius = 1.0;
        this.glowSo = null;
        this.glowTexture = null;
        this.glowBlurSo = null;
        this.glowBlurTexture = null;
        this.glowCompositeSo = null;
        // Private RT the main camera renders into while glow is on, so this.texture can
        // be the composite destination and stay the single public texture.
        this.glowBaseTexture = null;
        // One-shot blit that seeds glowBaseTexture from this.texture when glow is
        // enabled, so content drawn before glow() is not lost. See _ensureGlow.
        this.glowMigrateSo = null;
        this.glowSeedEvt = null;
        // Which texture the pending seed blit copies FROM, and the scene time it was armed
        // at. Both are needed to spot two opposite seeds armed in the same update (see
        // _armGlowSeed); glowSeedSource is cleared with the event so it never outlives it.
        this.glowSeedSource = null;
        this.glowSeedTime = -1;
        this.glowBlurPass = null;

        // Gradient fill/stroke (null = use the flat fillColor/strokeColor)
        this.fillGradient = null;
        this.strokeGradient = null;

        // Global alpha multiplier applied to every drawn color (1.0 = opaque)
        this.globalAlphaValue = 1.0;

        // Color mode settings (default: RGB 0-255)
        this.currentColorMode = RGB;
        this.colorMaxValue = 255;

        // Blend mode settings (default NORMAL)
        this.currentBlendMode = NORMAL;
        this.lastBlendMode = NORMAL;
        
        // Transform settings
        this.currentAngleMode = DEGREES;
        this.transformMatrix = mat3.identity();
        this.matrixStack = [];
        
        // Current mesh building state
        this.vertices = [];
        this.indices = [];
        this.vertexCount = 0;
        this.currentVectorElement = null;
        
        // Element pooling (like Canvas.js)
        this.elements = {};        // Pool of unused elements by type
        this.activeElements = [];  // Elements used this frame
        this.lastElementType = null;
        
        // Anti-aliasing fringe width in pixels
        this.currentFringeWidth = 2.0;
        
        // Triangulation mode (true = proper triangulation for non-convex, false = triangle fan for convex only)
        this.useTriangulation = true;
        
        // Shape building state
        this.shapeVertices = null;
        this.lastShapeVertex = null;
        
        // Bezier curve detail (number of segments)
        this.bezierDetailValue = 20;
        
        // Multi-texture batching state
        this.maxTexturesPerBatch = 8;  // Conservative for mobile compatibility
        this.textureSlots = [];         // Array of textures in current batch
        this.textureIdMap = new Map();  // texture -> slot index mapping
        this.gradientLuts = new Map();  // gradient signature -> cached LUT texture (bounded; see _lutForGradient)
        
        // Image mode settings (default CORNER)
        this.currentImageMode = CORNER;
        
        // Text settings
        this.currentTextSize = 20;
        this.currentTextAlignH = CENTER;
        this.currentTextAlignV = MIDDLE;
        // Current font; null = the block's default font (fonts[DEFAULT_FONT_INDEX], Fredoka)
        this.currentTextFont = null;
        
        this._init(fullscreen, Math.ceil(width), Math.ceil(height));
        this.background(200,200,200,0);
        
        this.lateUpdateEvt = script.createEvent("LateUpdateEvent");
        this.lateUpdateEvt.bind(() => {
            this._updateWorldCorners();
            script.removeEvent(this.lateUpdateEvt);
            this.lateUpdateEvt = null;
        });

        // Render accumulated geometry at end of frame
        this.updateEvt = script.createEvent("LateUpdateEvent");
        this.updateEvt.bind(() => {
            this._endFrame();
        });
    }

    /**
     * Gets/Sets this layer render order
    /* lower values render first
    */
    getRenderOrder() {
        return this.renderOrderValue;
    }
    setRenderOrder(value) {
        this.renderOrderValue = value;
        this._applyRenderOrder();
    }

    // A canvas's render order means "when this canvas's texture becomes readable", so it
    // belongs to the LAST pass that writes the texture: the main camera without glow, the
    // composite with it. Hence the whole glow chain sits at publish-3/-2/-1.
    //
    // Anchoring on the main camera instead moved publication 3 slots later the moment
    // glow() was called while getRenderOrder() still reported the old number, so a
    // consumer canvas ordered in between read the previous frame's texture forever.
    _applyRenderOrder() {
        const publish = script.baseRenderOrder + this.renderOrderValue;
        // Only an ACTIVE chain publishes. The scene objects survive noGlow(), so keying off
        // their existence would leave the main camera 3 slots early once glow was disabled.
        const chainPublishes = this.glowEnabled && this.glowCompositeSo;
        this.cameraComp.renderOrder = chainPublishes ? publish - 3 : publish;
        if (this.glowSo) {
            this.glowSo.getComponent("Component.Camera").renderOrder = publish - 2;
        }
        if (this.glowBlurSo) {
            this.glowBlurSo.getComponent("Component.Camera").renderOrder = publish - 1;
        }
        if (this.glowCompositeSo) {
            this.glowCompositeSo.getComponent("Component.Camera").renderOrder = publish;
        }
    }

    /**
     * Enables an additive glow (bloom) on the canvas. The canvas content is
     * downscaled, blurred, and composited back over the base into the canvas's own
     * texture (base rgb + halo rgb, base alpha preserved), so bright shapes bleed a soft
     * round add-light halo. Cost is independent of the number of shapes. Works for
     * both on-screen and offscreen canvases by a single path: the composite writes into
     * the canvas's own texture, so an offscreen canvas drawn elsewhere with
     * image(canvas.getTexture(), ...) carries its glow, the on-screen base Image reads
     * the same texture, and getTexture() can be called and cached in any order relative
     * to glow() / noGlow(). Over a transparent background the
     * on-screen halo adds onto the camera as light rather than occluding it. An
     * offscreen canvas carries its halo through image(getTexture()) over any
     * background, transparent or opaque.
     * NOT a thresholded bloom: there is no bright-pass, so the WHOLE canvas is blurred
     * and added back (out = base + intensity * blur(base)). In a large flat area that
     * collapses to base * (1 + intensity), so mid-tone artwork washes out. Give glowing
     * content its own canvas over a dark or transparent background.
     * @param {number} [intensity=1.0] - Brightness multiplier for the bloom (>= 0).
     * @param {number} [radius=1.0] - Halo width multiplier, clamped to 0.3 (tight) - 1.6 (wide).
     * @example
     * canvas.glow();          // soft additive bloom (default intensity and radius)
     * canvas.glow(2.0);       // brighter bloom
     * canvas.glow(1.0, 1.6);  // same brightness, widest halo
     * canvas.noGlow();        // disable
     */
    glow(intensity = 1.0, radius = 1.0) {
        const wasEnabled = this.glowEnabled;
        this.glowEnabled = true;
        // Both defaults are applied on every call, so a bare glow() resets intensity and
        // radius as documented. Non-numeric input falls back to them rather than throwing.
        const isNum = (v) => typeof v === 'number' && !isNaN(v);
        this.glowIntensity = isNum(intensity) ? Math.max(0, intensity) : 1.0;
        // Store the CLAMPED radius so glowRadius always reads back what the shader uses.
        this.glowRadius = isNum(radius)
            ? Math.max(GLOW_RADIUS_MIN, Math.min(GLOW_RADIUS_MAX, radius))
            : 1.0;
        this._ensureGlow(!wasEnabled);
        this._applyGlowParams();
    }

    /**
     * Disables the glow enabled by glow().
     */
    noGlow() {
        const wasEnabled = this.glowEnabled;
        this.glowEnabled = false;
        this._syncGlowCameras();
        // The main camera publishes this canvas's texture again, so it moves back onto
        // the requested order.
        this._applyRenderOrder();

        // Hand this.texture back to the main camera and restore its clear policy. No
        // consumer is touched: this.texture is what getTexture() returned all along, it
        // just changes which camera fills it. Without this the composite camera is off
        // and nothing writes this.texture, so it would freeze on its last glowing frame.
        if (wasEnabled && this.glowBaseTexture) {
            this.cameraComp.renderTarget = this.texture;
            this.texture.control.clearColorOption = ClearColorOption.None;
            this.texture.control.clearDepthEnabled = false;
            // Seed the other way for the same reason (see _ensureGlow): this.texture
            // currently holds the last COMPOSITED frame, so without this the halo stays
            // baked into it for any content that is not redrawn every frame. The base RT
            // holds the same content without the halo, which is what we want back.
            this._armGlowSeed(this.glowBaseTexture);
        }
    }

    // Run the seed blit for exactly one rendered frame, copying `source` into whichever
    // RT the main camera currently targets. A DelayedCallbackEvent(0) fires in the NEXT
    // frame's update phase, which is before that frame renders, so the blit draws once
    // and once only. A frame counter decremented in _endFrame cannot do this reliably:
    // _endFrame is a LateUpdate handler, so whether it has already run for the current
    // frame depends on handler registration order, and being one frame out lets the
    // composited result feed back into the base.
    _armGlowSeed(source) {
        if (!this.glowMigrateSo) {
            return;
        }
        // Two OPPOSITE seeds armed in the same update cancel out, they do not queue.
        // noGlow(); glow(); (or glow(); noGlow();) in one update renders nothing in
        // between, so both render targets still hold exactly what the last rendered frame
        // left, and running either blit copies the wrong side: this.texture's COMPOSITED
        // base+halo into the base RT (the base is never cleared, so the halo is baked in
        // permanently and compounds on every repeat), or a never-rendered base RT over the
        // visible texture. Dropping both leaves the pair a no-op, which is what it means.
        //
        // The time stamp is what makes this exact: getTime() is constant for all handlers
        // in one update, so it separates "armed in this same update" (0 frames rendered)
        // from "armed last update and the disable callback has not run yet" (1 frame
        // rendered, the blit already did its job, so a new seed is legitimate).
        if (this.glowSeedEvt && this.glowSeedSource !== source && this.glowSeedTime === getTime()) {
            this._cancelGlowSeed();
            return;
        }
        this.glowMigrateSo.getComponent("Component.Image").mainPass.baseTex = source;
        this.glowMigrateSo.enabled = true;
        if (this.glowSeedEvt) {
            script.removeEvent(this.glowSeedEvt);
        }
        this.glowSeedSource = source;
        this.glowSeedTime = getTime();
        this.glowSeedEvt = script.createEvent("DelayedCallbackEvent");
        this.glowSeedEvt.bind(() => {
            if (this.glowMigrateSo) {
                this.glowMigrateSo.enabled = false;
            }
            script.removeEvent(this.glowSeedEvt);
            this.glowSeedEvt = null;
            this.glowSeedSource = null;
        });
        this.glowSeedEvt.reset(0);
    }

    // The only rule about the three chain cameras' enabled state, stated once: they run
    // exactly when this canvas glows AND the component is enabled. The scene objects
    // survive noGlow(), so every flow that changes either half calls this instead of
    // repeating the triple (glow/noGlow here, OnEnableEvent/OnDisableEvent on the manager).
    _syncGlowCameras() {
        const on = this.glowEnabled && manager.componentEnabled;
        if (this.glowSo) {
            this.glowSo.enabled = on;
        }
        if (this.glowBlurSo) {
            this.glowBlurSo.enabled = on;
        }
        if (this.glowCompositeSo) {
            this.glowCompositeSo.enabled = on;
        }
    }

    // Drop a seed that must not run: disable the blit and forget the pending event.
    _cancelGlowSeed() {
        if (this.glowMigrateSo) {
            this.glowMigrateSo.enabled = false;
        }
        if (this.glowSeedEvt) {
            script.removeEvent(this.glowSeedEvt);
            this.glowSeedEvt = null;
        }
        this.glowSeedSource = null;
    }

    // Both names are the graph Parameter nodes' ScriptNames, checked once in _ensureGlow;
    // a write to any other name is an inert JS property, not an error. Only glow() calls
    // this, immediately after _ensureGlow, so glowBlurPass is always set by now.
    _applyGlowParams() {
        this.glowBlurPass.Intensity = this.glowIntensity;
        this.glowBlurPass.blurFactor = this.glowRadius;
    }

    /**
     * Destroys the canvas and cleans up all associated resources.
     * @example
     * const myCanvas = canvasMgr.createCanvas(500, 500);
     * // ... use canvas ...
     * myCanvas.destroy(); // Clean up when done
     */
    destroy() {
        manager.destroyCanvas(this);
    }

    /**
     * Sets the color mode for interpreting color values.
     * @param {string} mode - The color mode: RGB, HSB, or HSL
     * @param {number} [maxValue=255] - Maximum value for color components
     * @example
     * canvas.colorMode('rgb', 255);  // Default: RGB 0-255
     * canvas.colorMode('hsb', 360);  // HSB with hue 0-360
     * canvas.colorMode('hsl', 100);  // HSL with 0-100 range
     */
    colorMode(mode, maxValue) {
        this.currentColorMode = mode;
        this.colorMaxValue = maxValue !== undefined ? maxValue : 255;
    }

    /**
     * Sets the blend mode for drawing operations.
     * Supported: 'normal', 'add', 'multiply', 'screen', 'lighten' (alias 'lightest'),
     * 'darken' (alias 'darkest'). Unsupported modes are ignored (the current mode is kept).
     * @param {string} mode - The blend mode string
     * @example
     * canvas.blendMode('normal');    // Default blending
     * canvas.blendMode('add');       // Additive blending
     * canvas.blendMode('multiply');  // Multiply blending
     * canvas.blendMode('screen');    // Screen blending
     * canvas.blendMode('lighten');   // Keep the lighter color
     * canvas.blendMode('darken');    // Keep the darker color
     */
    blendMode(mode) {
        if (SUPPORTED_BLEND_MODES.indexOf(mode) === -1) {
            print("CanvasAPI: unsupported blend mode '" + mode + "', keeping current mode '" + this.currentBlendMode + "'. Supported: " + SUPPORTED_BLEND_MODES.join(", "));
            return;
        }
        this.currentBlendMode = mode;
    }

    /**
     * Sets how images are positioned when drawn with image().
     * @param {string} mode - The image mode: CORNER, CENTER, or CORNERS
     * @example
     * canvas.imageMode('corner');  // x,y is top-left corner (default)
     * canvas.imageMode('center');  // x,y is center point
     * canvas.imageMode('corners'); // x,y is top-left, w,h is bottom-right
     */
    imageMode(mode) {
        this.currentImageMode = mode;
    }

    /**
     * Sets the text size for subsequent text() calls, or reads the current one.
     *
     * Called with no argument this is a GETTER and does not mutate anything, matching p5.js. That
     * matters because a fitted size is normally computed once and read back later: without the
     * getter, textSize() set the size to undefined and every arithmetic result downstream was NaN,
     * so the text silently vanished instead of failing loudly.
     * @param {number} [size] - The text size in pixels; omit to read the current size
     * @returns {number|undefined} The current text size when called with no argument
     * @example
     * canvas.textSize(24);
     * canvas.text("Hello", 100, 100); // Renders at size 24
     * const px = canvas.textSize();   // 24
     */
    textSize(size) {
        if (size === undefined) {
            return this.currentTextSize;
        }
        this.currentTextSize = size;
    }

    /**
     * Sets the text alignment for subsequent text() calls.
     * @param {string} horizAlign - Horizontal alignment: LEFT, CENTER, or RIGHT
     * @param {string} [vertAlign] - Vertical alignment: TOP, MIDDLE, or BOTTOM
     * @example
     * canvas.textAlign('center', 'middle');
     * canvas.text("Centered", width/2, height/2);
     */
    textAlign(horizAlign, vertAlign) {
        if (horizAlign !== undefined) {
            this.currentTextAlignH = horizAlign;
        }
        if (vertAlign !== undefined) {
            this.currentTextAlignV = vertAlign;
        }
    }

    /**
     * Sets the font for subsequent text() calls.
     * Accepts a style name, a font family name, a custom-font slot, or a style index.
     * Style names: 'regular', 'casual', 'headline', 'comic', 'bold', 'playful',
     * 'retro', 'handwritten', 'grandElegant', 'artDeco', 'quirky'.
     * Family names: 'OpenSans', 'Oswald', 'Bangers', 'ComicNeue', 'RubikMonoOne',
     * 'Fredoka', 'OdibeeSans', 'GochiHand', 'Rochester', 'Limelight', 'AmaticSC'.
     * Custom slots: 'custom1'..'custom4' (user-provided fonts, if bound).
     * Matching is case-insensitive and ignores spaces/punctuation ('Art Deco' works).
     * 'default' (or null) restores the block's default font.
     * Unknown names keep the current font.
     * @param {string|number} selector - Font style/family name, custom slot, or index 0-10
     * @example
     * canvas.textFont('headline');
     * canvas.text("BIG NEWS", width/2, 100);
     * canvas.textFont('custom1'); // user-uploaded font
     * canvas.textFont('default'); // back to the default font
     */
    textFont(selector) {
        if (selector === undefined || selector === null || selector === 'default') {
            this.currentTextFont = null;
            return;
        }

        let style = null;
        if (typeof selector === 'number') {
            for (const key in FONT_STYLES) {
                if (FONT_STYLES[key].index === selector) {
                    style = FONT_STYLES[key];
                    break;
                }
            }
        } else if (typeof selector === 'string') {
            // Normalize: lowercase, strip spaces/punctuation ('Art Deco', 'art-deco' -> 'artdeco')
            const name = selector.toLowerCase().replace(/[^a-z0-9]/g, '');

            if (name === 'default') {
                this.currentTextFont = null;
                return;
            }

            // hasOwnProperty: a dynamic selector like 'constructor' must not hit
            // Object.prototype members through the lookup tables
            if (Object.prototype.hasOwnProperty.call(CUSTOM_FONTS, name)) {
                const customFont = CUSTOM_FONTS[name]();
                if (customFont) {
                    this.currentTextFont = customFont;
                } else {
                    print("CanvasAPI: no custom font bound to '" + selector + "', keeping current font");
                }
                return;
            }

            style = Object.prototype.hasOwnProperty.call(FONT_STYLES, name) ? FONT_STYLES[name] : null;
            if (!style) {
                for (const key in FONT_STYLES) {
                    if (FONT_STYLES[key].family === name) {
                        style = FONT_STYLES[key];
                        break;
                    }
                }
            }
        }

        if (!style) {
            print("CanvasAPI: unknown font '" + selector + "', keeping current font");
            return;
        }

        const fontAsset = script.fonts ? script.fonts[style.index] : null;
        if (!fontAsset) {
            print("CanvasAPI: font slot " + style.index + " is not bound, keeping current font");
            return;
        }

        this.currentTextFont = fontAsset;
    }

    /**
     * Sets the stroke color for shapes and lines.
     * Pass a gradient (from createLinearGradient/createRadialGradient/createConicGradient)
     * as the first argument to stroke with a gradient instead of a flat color.
     * @param {number|CanvasGradient} r - Red component, grayscale value, or a gradient
     * @param {number} [g=r] - Green component
     * @param {number} [b=g] - Blue component
     * @param {number} [a=255] - Alpha (transparency)
     * @example
     * canvas.stroke(255);           // White stroke
     * canvas.stroke(255, 0, 0);     // Red stroke
     * canvas.stroke(0, 255, 0, 128); // Semi-transparent green
     * canvas.stroke(canvas.createLinearGradient(0, 0, 100, 0)); // Gradient stroke
     */
    stroke(r,g=r,b=g,a=255) {
        if (r instanceof CanvasGradient) {
            this.strokeGradient = r;
            this.doStroke = true;
            return;
        }
        this.strokeGradient = null;
        this.strokeColor = this._convertColor(r, g, b, a);
        this.doStroke = true;
    }

    /**
     * Sets the stroke weight (line thickness) in pixels.
     * @param {number} weight - The stroke weight in pixels
     * @example
     * canvas.strokeWeight(1);  // Thin line (default)
     * canvas.strokeWeight(5);  // Thick line
     */
    strokeWeight(weight) {
        this.strokeWidth = weight;
    }

    /**
     * Sets the anti-aliasing fringe width in pixels.
     * @param {number} w - The fringe width in pixels
     * @example
     * canvas.fringeWidth(2.0);  // Default anti-aliasing
     * canvas.fringeWidth(0);    // Disable anti-aliasing
     */
    fringeWidth(w) {
        this.currentFringeWidth = w;
    }

    /**
     * Sets the line cap style for stroke endpoints.
     * @param {string} cap - The cap style: CAP_ROUND or CAP_SQUARE
     * @example
     * canvas.strokeCap('round');  // Rounded ends
     * canvas.strokeCap('square'); // Square ends
     */
    strokeCap(cap) {
        this.lineCapStyle = cap;
    }

    /**
     * Sets the line join style for stroke corners.
     * @param {string} join - The join style: JOIN_MITER, JOIN_BEVEL, or JOIN_ROUND
     * @example
     * canvas.strokeJoin('miter'); // Sharp corners
     * canvas.strokeJoin('round'); // Rounded corners
     */
    strokeJoin(join) {
        this.lineJoinStyle = join;
    }

    /**
     * Sets the fill color for shapes.
     * Pass a gradient (from createLinearGradient/createRadialGradient/createConicGradient)
     * as the first argument to fill with a gradient instead of a flat color.
     * @param {number|CanvasGradient} r - Red component, grayscale value, or a gradient
     * @param {number} [g=r] - Green component
     * @param {number} [b=g] - Blue component
     * @param {number} [a=255] - Alpha (transparency)
     * @example
     * canvas.fill(255);           // White fill
     * canvas.fill(255, 0, 0);     // Red fill
     * canvas.fill(0, 255, 0, 128); // Semi-transparent green
     * canvas.fill(canvas.createRadialGradient(100, 100, 0, 100, 100, 80)); // Gradient fill
     */
    fill(r,g=r,b=g,a=255) {
        if (r instanceof CanvasGradient) {
            this.fillGradient = r;
            this.doFill = true;
            return;
        }
        this.fillGradient = null;
        this.fillColor = this._convertColor(r, g, b, a);
        this.doFill = true;
    }

    /**
     * Disables filling shapes (shapes will only have strokes).
     * @example
     * canvas.noFill();
     * canvas.circle(100, 100, 50); // Only outline, no fill
     */
    noFill() {
        this.doFill = false;
    }

    /**
     * Disables stroking shapes (shapes will only be filled).
     * @example
     * canvas.noStroke();
     * canvas.circle(100, 100, 50); // Only fill, no outline
     */
    noStroke() {
        this.doStroke = false;
    }

    /**
     * Sets a global alpha multiplier applied to every fill, stroke and image tint.
     * Clamped to [0, 1]; invalid values reset it to fully opaque.
     * @param {number} a - Alpha multiplier in [0, 1] (1 = opaque, 0 = invisible)
     * @example
     * canvas.globalAlpha(0.4);
     * canvas.circle(100, 100, 50); // Drawn at 40% opacity
     * canvas.globalAlpha(1.0);     // Back to fully opaque
     */
    globalAlpha(a) {
        if (typeof a !== 'number' || isNaN(a)) {
            this.globalAlphaValue = 1.0;
            return;
        }
        this.globalAlphaValue = Math.max(0, Math.min(1, a));
    }

    /**
     * Creates a color value that can be used with fill() or stroke().
     * @param {number} r - Red component (or grayscale value)
     * @param {number} [g] - Green component
     * @param {number} [b] - Blue component
     * @param {number} [a] - Alpha (transparency)
     * @returns {vec4} Color as a vec4 (normalized 0-1)
     * @example
     * const myColor = canvas.color(255, 0, 0);
     * canvas.fill(myColor);
     */
    color(r, g, b, a) {
        // Return a normalized vec4 (0-1) for shader use
        return this._convertColor(r, g, b, a);
    }

    /**
     * Creates a linear gradient between two points (in canvas pixel coordinates).
     * Add color stops with addColorStop(offset, color), then pass the gradient to
     * fill() or stroke(). Coordinates are in canvas pixel space; a linear/radial fill
     * samples the color ramp per pixel (baked LUT), while conic fills and strokes are per-vertex.
     * @param {number} x0 - X of the gradient start point
     * @param {number} y0 - Y of the gradient start point
     * @param {number} x1 - X of the gradient end point
     * @param {number} y1 - Y of the gradient end point
     * @returns {CanvasGradient} A gradient to use with fill()/stroke()
     * @example
     * const g = canvas.createLinearGradient(0, 0, canvas.getWidth(), 0);
     * g.addColorStop(0, canvas.color(255, 0, 0));
     * g.addColorStop(1, canvas.color(0, 0, 255));
     * canvas.fill(g);
     * canvas.rect(0, 0, canvas.getWidth(), 100);
     */
    createLinearGradient(x0, y0, x1, y1) {
        return CanvasGradient.linear(x0, y0, x1, y1);
    }

    /**
     * Creates a radial gradient between two circles (in canvas pixel coordinates).
     * The gradient is concentric from the outer circle center: the inner circle center (x0,y0)
     * is not used, so non-concentric/focal radial gradients are not supported.
     * @param {number} x0 - X of the inner circle center
     * @param {number} y0 - Y of the inner circle center
     * @param {number} r0 - Radius of the inner circle (offset 0)
     * @param {number} x1 - X of the outer circle center
     * @param {number} y1 - Y of the outer circle center
     * @param {number} r1 - Radius of the outer circle (offset 1)
     * @returns {CanvasGradient} A gradient to use with fill()/stroke()
     * @example
     * const g = canvas.createRadialGradient(100, 100, 0, 100, 100, 80);
     * g.addColorStop(0, canvas.color(255, 255, 0));
     * g.addColorStop(1, canvas.color(255, 0, 0));
     * canvas.fill(g);
     * canvas.circle(100, 100, 160);
     */
    createRadialGradient(x0, y0, r0, x1, y1, r1) {
        return CanvasGradient.radial(x0, y0, r0, x1, y1, r1);
    }

    /**
     * Creates a conic (angular) gradient sweeping around a center point.
     * startAngle is interpreted in the current angleMode (degrees or radians).
     * The sweep goes clockwise from the start angle in canvas (Y-down) space, matching HTML5 conic gradients.
     * @param {number} startAngle - Angle where the gradient starts (in the current angleMode)
     * @param {number} x - X of the center point
     * @param {number} y - Y of the center point
     * @returns {CanvasGradient} A gradient to use with fill()/stroke()
     * @example
     * const g = canvas.createConicGradient(0, 100, 100);
     * g.addColorStop(0, canvas.color(255, 0, 0));
     * g.addColorStop(0.5, canvas.color(0, 255, 0));
     * g.addColorStop(1, canvas.color(255, 0, 0));
     * canvas.fill(g);
     * canvas.circle(100, 100, 160);
     */
    createConicGradient(startAngle, x, y) {
        const radians = this.currentAngleMode === DEGREES ? startAngle * Math.PI / 180 : startAngle;
        return CanvasGradient.conic(radians, x, y);
    }

    // Transform functions
    /**
     * Sets the angle mode for rotate() function.
     * @param {string} mode - The angle mode: DEGREES or RADIANS
     * @example
     * canvas.angleMode('degrees'); // Default
     * canvas.rotate(90); // Rotate 90 degrees
     *
     * canvas.angleMode('radians');
     * canvas.rotate(Math.PI / 2); // Rotate π/2 radians
     */
    angleMode(mode) {
        this.currentAngleMode = mode;
    }

    /**
     * Translates (moves) the coordinate system.
     * @param {number} x - Horizontal translation in pixels
     * @param {number} y - Vertical translation in pixels
     * @example
     * canvas.translate(100, 50);
     * canvas.circle(0, 0, 25); // Circle appears at (100, 50)
     */
    translate(x, y) {
        this.transformMatrix = this.transformMatrix.mult(createTranslateMatrix(x, y));
    }

    /**
     * Scales the coordinate system.
     * @param {number} sx - Horizontal scale factor
     * @param {number} [sy=sx] - Vertical scale factor (defaults to sx for uniform scaling)
     * @example
     * canvas.scale(2);       // Double size (uniform)
     * canvas.scale(2, 0.5);  // Stretch horizontally, compress vertically
     */
    scale(sx, sy) {
        if (sy === undefined) sy = sx;
        this.transformMatrix = this.transformMatrix.mult(createScaleMatrix(sx, sy));
    }

    /**
     * Rotates the coordinate system.
     * @param {number} angle - Rotation angle (in degrees or radians depending on angleMode)
     * @example
     * canvas.angleMode('degrees');
     * canvas.rotate(45); // Rotate 45 degrees clockwise
     */
    rotate(angle) {
        // Convert to radians if in degrees mode
        const radians = this.currentAngleMode === DEGREES ? angle * Math.PI / 180 : angle;
        this.transformMatrix = this.transformMatrix.mult(createRotateMatrix(radians));
    }

    /**
     * Saves the current transformation matrix onto the stack. Only the transform is
     * saved -- paint state (fill/stroke color & gradient, strokeWeight, globalAlpha,
     * blendMode) is NOT captured and must be reset by hand if you change it. Pair with pop().
     * @example
     * canvas.push();
     * canvas.translate(100, 100);
     * canvas.rotate(45);
     * canvas.circle(0, 0, 25);
     * canvas.pop(); // Restore previous transform
     */
    push() {
        // Push current transform matrix to stack by copying columns
        const copy = new mat3();
        copy.column0 = this.transformMatrix.column0;
        copy.column1 = this.transformMatrix.column1;
        copy.column2 = this.transformMatrix.column2;
        this.matrixStack.push(copy);
    }

    /**
     * Restores the transformation matrix saved by the matching push(). Only the
     * transform is restored -- paint state (fill/stroke color & gradient, strokeWeight,
     * globalAlpha, blendMode) is left as-is, unlike HTML5 canvas save()/restore().
     * @example
     * canvas.push();
     * canvas.rotate(45);
     * canvas.rect(0, 0, 50, 50);
     * canvas.pop(); // Back to previous rotation
     */
    pop() {
        // Pop matrix from stack
        if (this.matrixStack.length > 0) {
            this.transformMatrix = this.matrixStack.pop();
        } else {
            print("WARNING: pop() called with empty matrix stack");
        }
    }

    /**
     * Resets the transformation matrix to identity (no transformations).
     * @example
     * canvas.translate(100, 100);
     * canvas.rotate(45);
     * canvas.resetMatrix(); // Back to no transformations
     */
    resetMatrix() {
        this.transformMatrix = mat3.identity();
    }

    /**
     * Replaces the current transformation matrix with a custom matrix.
     * @param {mat3} matrix - A mat3 transformation matrix
     * @example
     * const customMatrix = mat3.identity();
     * canvas.applyMatrix(customMatrix);
     */
    applyMatrix(matrix) {
        // Replace current matrix with given mat3
        if (matrix instanceof mat3) {
            this.transformMatrix = matrix;
        } else {
            print("ERROR: applyMatrix requires a mat3 object");
        }
    }

    /**
     * Fills the canvas with a solid color.
     * @param {number} r - Red component (or grayscale value)
     * @param {number} [g=r] - Green component
     * @param {number} [b=g] - Blue component
     * @param {number} [a=255] - Alpha (transparency)
     * @example
     * canvas.background(255);           // White background
     * canvas.background(0, 0, 0);       // Black background
     * canvas.background(255, 0, 0, 128); // Semi-transparent red
     */
    background(r,g=r,b=g,a=255) {
        // Flush current vector if any
        this._flushCurrentVector();
        
        // Get or create background element
        const bg = this._getOrCreateElement("background");
        // The canvas RT holds PREMULTIPLIED color everywhere else: the vector shader
        // outputs rgb*alpha, and _init registers the RT as premultiplied so image()
        // skips a second premultiply. background() is the one path that writes the RT
        // verbatim (BlendMode.Disabled, no blend to do the multiply for us), so it must
        // premultiply here too. Without it a semi-transparent background lands straight
        // and image() divides it by an alpha it was never multiplied by, coming out
        // 1/alpha too bright (2x at a=128), and exactly right at a=255 and a=0.
        const bgColor = this._convertColor(r, g, b, a);
        bg.imageComp.mainPass.baseColor = new vec4(
            bgColor.x * bgColor.w, bgColor.y * bgColor.w, bgColor.z * bgColor.w, bgColor.w);
        bg.imageComp.mainPass.blendMode = BlendMode.Disabled;
        this.lastElementType = "background";
    }

    /**
     * Draws a line between two points.
     * @param {number} x1 - X coordinate of first point
     * @param {number} y1 - Y coordinate of first point
     * @param {number} x2 - X coordinate of second point
     * @param {number} y2 - Y coordinate of second point
     * @example
     * canvas.stroke(255);
     * canvas.strokeWeight(2);
     * canvas.line(0, 0, 100, 100); // Diagonal line
     */
    line(x1,y1,x2,y2) {
        this._ensureVectorElement();
        renderLine(this, x1, y1, x2, y2);
    }

    /**
     * Draws a triangle defined by three points.
     * @param {number} p1x - X coordinate of the first vertex
     * @param {number} p1y - Y coordinate of the first vertex
     * @param {number} p2x - X coordinate of the second vertex
     * @param {number} p2y - Y coordinate of the second vertex
     * @param {number} p3x - X coordinate of the third vertex
     * @param {number} p3y - Y coordinate of the third vertex
     * @example
     * canvas.fill(255, 0, 0);
     * canvas.triangle(100, 50, 50, 150, 150, 150); // Red triangle
     */
    triangle(p1x, p1y, p2x, p2y, p3x, p3y) {
        this.beginShape();
        this.vertex(p1x, p1y);
        this.vertex(p2x, p2y);
        this.vertex(p3x, p3y);
        this.endShape(true);
    }

    /**
     * Draws a point at the specified coordinates.
     * Uses the current stroke color and strokeWeight.
     * @param {number} x - X coordinate of the point
     * @param {number} y - Y coordinate of the point
     * @example
     * canvas.stroke(255, 0, 0);
     * canvas.strokeWeight(3);
     * canvas.point(100, 100); // Red point, 3 pixels wide
     */
    point(x, y) {
        if (!this.doStroke) {
            return;
        }

        const oldDoStroke = this.doStroke;
        const oldStroke = this.strokeColor;
        const oldDoFill = this.doFill;
        const oldFill = this.fillColor;
        const oldFillGradient = this.fillGradient;
        const oldFringe = this.currentFringeWidth;
        const s = 2*this._getScaledStrokeWidth();
        this.doFill = true;
        // Sample the stroke gradient at the point when one is active, else use the flat stroke color
        this.fillColor = this.strokeGradient ? this.strokeGradient._evalAt(x, y) : oldStroke;
        this.fillGradient = null; // a point uses the flat stroke color, never a fill gradient
        this.doStroke = false;
        this.currentFringeWidth = 0;
        this.circle(x, y, s);
        // Restore state directly — the stored colors are already normalized vec4s,
        // round-tripping through stroke()/fill() would re-normalize them.
        this.doStroke = oldDoStroke;
        this.strokeColor = oldStroke;
        this.doFill = oldDoFill;
        this.fillColor = oldFill;
        this.fillGradient = oldFillGradient;
        this.currentFringeWidth = oldFringe;
    }

    /**
     * Draws a circle.
     * @param {number} x - X coordinate of the center
     * @param {number} y - Y coordinate of the center
     * @param {number} d - Diameter of the circle
     * @example
     * canvas.fill(255, 0, 0);
     * canvas.circle(100, 100, 50); // Red circle, 50px diameter
     */
    circle(x, y, d) {
        this._ensureVectorElement();
        
        const radius = d / 2;
        
        // If transform is not identity, convert circle to ellipse/shape for proper transformation
        if (!isIdentityTransform(this.transformMatrix)) {
            // Draw circle as polygon (which will be transformed)
            const segments = Math.max(12, Math.min(64, Math.floor(d * 0.5)));
            this.beginShape();
            for (let i = 0; i < segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                const px = x + Math.cos(angle) * radius;
                const py = y + Math.sin(angle) * radius;
                this.vertex(px, py);
            }
            this.endShape(true);
        } else {
            renderCircle(this, x, y, radius);
        }
        if (this._probe) { this._probe.shape(x - radius, y - radius, d, d, this); }
    }

    /**
     * Draws an ellipse.
     * @param {number} x - X coordinate of the center
     * @param {number} y - Y coordinate of the center
     * @param {number} w - Width of the ellipse
     * @param {number} h - Height of the ellipse
     * @example
     * canvas.fill(0, 255, 0);
     * canvas.ellipse(100, 100, 80, 50); // Green ellipse, 80px wide, 50px tall
     */
    ellipse(x, y, w, h) {
        this._ensureVectorElement();
        
        // If transform is not identity, convert ellipse to shape for proper transformation
        if (!isIdentityTransform(this.transformMatrix)) {
            const rx = w / 2;
            const ry = h / 2;
            const segments = Math.max(12, Math.min(64, Math.floor(Math.max(w, h) * 0.5)));
            
            this.beginShape();
            for (let i = 0; i < segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                const px = x + Math.cos(angle) * rx;
                const py = y + Math.sin(angle) * ry;
                this.vertex(px, py);
            }
            this.endShape(true);
        } else {
            renderEllipse(this, x, y, w, h);
        }
        if (this._probe) { this._probe.shape(x - w / 2, y - h / 2, w, h, this); }
    }

    /**
     * Draws a rectangle with optional rounded corners.
     * @param {number} x - X coordinate of top-left corner
     * @param {number} y - Y coordinate of top-left corner
     * @param {number} w - Width of the rectangle
     * @param {number} h - Height of the rectangle
     * @param {number} [r1=0] - Radius of top-left corner
     * @param {number} [r2=r1] - Radius of top-right corner
     * @param {number} [r3=r2] - Radius of bottom-right corner
     * @param {number} [r4=r3] - Radius of bottom-left corner
     * @example
     * canvas.rect(10, 10, 100, 50);           // Simple rectangle
     * canvas.rect(10, 10, 100, 50, 10);       // All corners rounded
     * canvas.rect(10, 10, 100, 50, 10, 5, 0); // Different corner radii
     */
    rect(x, y, w, h, r1=0, r2=r1, r3=r2, r4=r3) {
        this._ensureVectorElement();
        
        // If transform is not identity, convert rect to shape for proper transformation
        if (!isIdentityTransform(this.transformMatrix)) {
            // Clamp corner radii
            const maxR = Math.min(w, h) / 2;
            r1 = Math.min(r1, maxR);
            r2 = Math.min(r2, maxR);
            r3 = Math.min(r3, maxR);
            r4 = Math.min(r4, maxR);
            
            this.beginShape();
            
            // Generate vertices for rounded rect
            const segmentsPerCorner = 8;
            
            // Top-left corner (r1)
            if (r1 > 0) {
                for (let i = 0; i <= segmentsPerCorner; i++) {
                    const angle = Math.PI + (Math.PI / 2) * (i / segmentsPerCorner);
                    const cx = x + r1;
                    const cy = y + r1;
                    this.vertex(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
                }
            } else {
                this.vertex(x, y);
            }
            
            // Top-right corner (r2)
            if (r2 > 0) {
                for (let i = 0; i <= segmentsPerCorner; i++) {
                    const angle = Math.PI * 1.5 + (Math.PI / 2) * (i / segmentsPerCorner);
                    const cx = x + w - r2;
                    const cy = y + r2;
                    this.vertex(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
                }
            } else {
                this.vertex(x + w, y);
            }
            
            // Bottom-right corner (r3)
            if (r3 > 0) {
                for (let i = 0; i <= segmentsPerCorner; i++) {
                    const angle = 0 + (Math.PI / 2) * (i / segmentsPerCorner);
                    const cx = x + w - r3;
                    const cy = y + h - r3;
                    this.vertex(cx + Math.cos(angle) * r3, cy + Math.sin(angle) * r3);
                }
            } else {
                this.vertex(x + w, y + h);
            }
            
            // Bottom-left corner (r4)
            if (r4 > 0) {
                for (let i = 0; i <= segmentsPerCorner; i++) {
                    const angle = Math.PI / 2 + (Math.PI / 2) * (i / segmentsPerCorner);
                    const cx = x + r4;
                    const cy = y + h - r4;
                    this.vertex(cx + Math.cos(angle) * r4, cy + Math.sin(angle) * r4);
                }
            } else {
                this.vertex(x, y + h);
            }
            
            this.endShape(true);
        } else {
            renderRect(this, x, y, w, h, r1, r2, r3, r4);
        }
        if (this._probe) { this._probe.shape(x, y, w, h, this); }
    }

    /**
     * Begins recording vertices for a custom shape.
     * Use with vertex() or bezierVertex() and endShape().
     * @example
     * canvas.beginShape();
     * canvas.vertex(100, 100);
     * canvas.vertex(200, 150);
     * canvas.vertex(150, 250);
     * canvas.endShape(true); // Close the shape
     */
    beginShape() {
        this.shapeVertices = [];
        this.lastShapeVertex = null;
    }

    /**
     * Finishes recording vertices and draws the custom shape.
     * @param {boolean} [close=false] - Whether to close the shape by connecting the last vertex to the first
     * @example
     * canvas.beginShape();
     * canvas.vertex(100, 100);
     * canvas.vertex(200, 100);
     * canvas.vertex(150, 200);
     * canvas.endShape(true); // Draw closed triangle
     */
    endShape(close = false) {
        if (!this.shapeVertices || this.shapeVertices.length < 2) {
            this.shapeVertices = null;
            this.lastShapeVertex = null;
            return;
        }
        
        this._ensureVectorElement();
        renderShape(this, this.shapeVertices, close);
        this.shapeVertices = null;
        this.lastShapeVertex = null;
    }

    /**
     * Adds a vertex to the current shape being recorded.
     * Must be called between beginShape() and endShape().
     * @param {number} x - X coordinate of the vertex
     * @param {number} y - Y coordinate of the vertex
     * @example
     * canvas.beginShape();
     * canvas.vertex(100, 100);
     * canvas.vertex(200, 100);
     * canvas.vertex(150, 200);
     * canvas.endShape();
     */
    vertex(x, y) {
        if (this.shapeVertices) {
            this.shapeVertices.push({ x, y });
            this.lastShapeVertex = { x, y };
        }
    }

    /**
     * Adds a cubic bezier curve segment to the current shape.
     * Must be called between beginShape() and endShape(), after at least one vertex().
     * The curve starts at the previous vertex and ends at (x, y).
     * Compatible with the p5.js bezierVertex signature.
     * @param {number} cp1x - X coordinate of control point near the previous vertex
     * @param {number} cp1y - Y coordinate of control point near the previous vertex
     * @param {number} cp2x - X coordinate of control point near the new anchor
     * @param {number} cp2y - Y coordinate of control point near the new anchor
     * @param {number} x - X coordinate of the new anchor point
     * @param {number} y - Y coordinate of the new anchor point
     * @example
     * canvas.beginShape();
     * canvas.vertex(50, 50);
     * canvas.bezierVertex(100, 25, 150, 75, 200, 50);
     * canvas.endShape();
     */
    bezierVertex(cp1x, cp1y, cp2x, cp2y, x, y) {
        if (!this.shapeVertices) {
            print("ERROR: bezierVertex() must be called between beginShape() and endShape()");
            return;
        }
        
        const startVertex = this.lastShapeVertex || (this.shapeVertices.length > 0 ? this.shapeVertices[this.shapeVertices.length - 1] : null);
        
        if (!startVertex) {
            print("ERROR: bezierVertex() requires a previous vertex. Call vertex() first.");
            return;
        }
        
        const x0 = startVertex.x;
        const y0 = startVertex.y;
        
        for (let i = 1; i <= this.bezierDetailValue; i++) {
            const t = i / this.bezierDetailValue;
            const px = this._cubicBezier(x0, cp1x, cp2x, x, t);
            const py = this._cubicBezier(y0, cp1y, cp2y, y, t);
            this.shapeVertices.push({ x: px, y: py });
        }
        
        this.lastShapeVertex = { x, y };
    }

    /**
     * Sets the resolution for bezier curve rendering.
     * @param {number} detail - Number of line segments to use (higher = smoother curves)
     * @example
     * canvas.bezierDetail(20); // Default: smooth curves
     * canvas.bezierDetail(5);  // Lower detail: angular curves
     */
    bezierDetail(detail) {
        this.bezierDetailValue = Math.max(1, detail);
    }

    /**
     * Draws a cubic bezier curve.
     * @param {number} x1 - X coordinate of start point
     * @param {number} y1 - Y coordinate of start point
     * @param {number} cx1 - X coordinate of first control point
     * @param {number} cy1 - Y coordinate of first control point
     * @param {number} cx2 - X coordinate of second control point
     * @param {number} cy2 - Y coordinate of second control point
     * @param {number} x2 - X coordinate of end point
     * @param {number} y2 - Y coordinate of end point
     * @example
     * canvas.noFill();
     * canvas.stroke(255);
     * canvas.bezier(50, 100, 100, 50, 200, 150, 250, 100);
     */
    bezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2) {
        this._ensureVectorElement();
        
        // Create a temporary shape with bezier curve points
        const points = [];
        for (let i = 0; i <= this.bezierDetailValue; i++) {
            const t = i / this.bezierDetailValue;
            const x = this._cubicBezier(x1, cx1, cx2, x2, t);
            const y = this._cubicBezier(y1, cy1, cy2, y2, t);
            points.push({ x, y });
        }
        
        // Render as a line (open shape)
        renderShape(this, points, false);
    }

    /**
     * Gets the render target texture of this canvas.
     * Use this to display the canvas on a sprite or image component.
     *
     * The returned object is stable for the life of the canvas and is unaffected by
     * glow() / noGlow(), so it is safe to cache on a sprite or material in any order.
     * @returns {Asset.Texture} The canvas texture
     * @example
     * const canvas = canvasMgr.createCanvas(500, 500);
     * canvas.rect(0, 0, 100, 100);
     * sprite.texture = canvas.getTexture();
     * canvas.glow();                       // glow shows up through the cached handle
     */
    getTexture() {
        // Stable for the canvas's whole lifetime, in both glow states: glow() moves the
        // main camera to a private base RT and makes the composite camera write this
        // texture, rather than swapping which texture is returned. Caching the result is
        // safe (see _ensureGlow).
        return this.texture;
    }

    /**
     * Gets the size of the canvas in pixels.
     * @returns {vec2} Canvas size as vec2(width, height)
     * @example
     * const size = canvas.getSize();
     * print("Canvas: " + size.x + "x" + size.y);
     */
    getSize() {
        return this.size;
    }

    /**
     * Gets the width of the canvas in pixels.
     * @returns {number} Canvas width
     * @example
     * const width = canvas.getWidth();
     * canvas.line(0, 100, width, 100); // Horizontal line across canvas
     */
    getWidth() {
        return this.getSize().x;
    }

    /**
     * Gets the height of the canvas in pixels.
     * @returns {number} Canvas height
     * @example
     * const height = canvas.getHeight();
     * canvas.line(100, 0, 100, height); // Vertical line across canvas
     */
    getHeight() {
        return this.getSize().y;
    }

    // Image rendering with multi-texture batching
    /**
     * Draws an image/texture on the canvas.
     * @param {Asset.Texture} texture - The texture to draw
     * @param {number} x - X coordinate (meaning depends on imageMode)
     * @param {number} y - Y coordinate (meaning depends on imageMode)
     * @param {number} [w] - Width to draw (defaults to texture width)
     * @param {number} [h] - Height to draw (defaults to texture height)
     * @param {number} [sx=0] - Source X coordinate in texture
     * @param {number} [sy=0] - Source Y coordinate in texture
     * @param {number} [sWidth] - Source width (defaults to texture width)
     * @param {number} [sHeight] - Source height (defaults to texture height)
     * @example
     * // Draw entire texture
     * canvas.image(myTexture, 0, 0);
     * 
     * // Draw texture scaled to specific size
     * canvas.image(myTexture, 0, 0, 200, 100);
     * 
     * // Draw portion of texture (sprite sheet)
     * canvas.image(myTexture, 0, 0, 50, 50, 100, 100, 50, 50);
     */
    image(texture, x, y, w, h, sx, sy, sWidth, sHeight) {
        if (!texture) {
            print("image called with a missing texture");
            return;
        }
        // Handle optional parameters
        if (sx === undefined) {
            sx = 0;
            sy = 0;
            sWidth = texture.getWidth();
            sHeight = texture.getHeight();
        }
        if (w === undefined) {
            w = texture.getWidth();
            h = texture.getHeight();
        }
               
        // Ensure we have a vector element for the CURRENT blend mode first. A
        // blend-mode change (e.g. NORMAL base -> ADD overlay) makes this flush
        // the previous element and CLEAR the texture batch, so it must happen
        // BEFORE we reserve a texture slot -- otherwise the texture we register
        // gets bound to the previous element and this element's sampler is left
        // unbound (renders the missing-texture pattern). See _flushCurrentVector.
        this._ensureVectorElement();

        // Reserve a texture slot in the (now correct) batch. This may itself
        // flush when the batch is full, nulling the current element, so ensure
        // the element again afterwards to re-create it for the pending quad.
        let textureId = this._getTextureSlot(texture);
        // Canvas RTs (from getTexture()) are premultiplied; flag them by offsetting the
        // slot past the real slot range (texId + 8, matching VectorShader's 8 samplers
        // baseTex0-7) so the shader skips the second premultiply. Sprite-store, gradient
        // LUTs and other straight-alpha textures keep slot 0-7 and the normal path.
        if (manager.premultipliedTextures.has(texture)) {
            textureId += 8;
        }
        this._ensureVectorElement();

        // Calculate UV coordinates for source rectangle
        const texWidth = texture.getWidth();
        const texHeight = texture.getHeight();
        const u0 = sx / texWidth;
        const u1 = (sx + sWidth) / texWidth;
        const v1 = (texHeight - (sy + sHeight)) / texHeight;
        const v0 = (texHeight - sy) / texHeight;
        
        // Adjust x, y, w, h based on image mode
        let drawX = x;
        let drawY = y;
        let drawW = w;
        let drawH = h;
        
        if (this.currentImageMode === CENTER) {
            // x,y is the center - calculate top-left corner
            drawX = x - w / 2;
            drawY = y - h / 2;
        } else if (this.currentImageMode === CORNERS) {
            // x,y is top-left, w,h is bottom-right position - calculate size
            drawW = w - x;
            drawH = h - y;
        }
        // CORNER mode: use as-is (x,y is top-left, w,h is size)
        
        // Transform corners to world space
        const tl = this._toWorld(drawX, drawY);
        const tr = this._toWorld(drawX + drawW, drawY);
        const bl = this._toWorld(drawX, drawY + drawH);
        const br = this._toWorld(drawX + drawW, drawY + drawH);
        
        // Color/tint (use fill color if set), scaled by the global alpha. A gradient
        // fill is sampled at the image center for a uniform tint (parity with text();
        // the image already owns the quad's texture slot, so it can't be per-pixel).
        const fillBase = this.fillGradient ? this.fillGradient._evalAt(drawX + drawW / 2, drawY + drawH / 2) : this.fillColor;
        const tint = this.doFill ? fillBase : new vec4(1, 1, 1, 1);
        const color = applyGlobalAlpha(this, tint);
        
        // Use the optimized renderImageQuad function from CanvasRenderer
        renderImageQuad(this, tl, tr, bl, br, u0, u1, v0, v1, color, textureId);
    }

    // Text rendering using Lens Studio Text component
    /**
     * Draws text on the canvas.
     * Gradients are sampled once at the text anchor (x,y): text is a single flat color, not per-glyph.
     * @param {string|number} str - The text to display (will be converted to string)
     * @param {number} x - X coordinate (meaning depends on textAlign)
     * @param {number} y - Y coordinate (meaning depends on textAlign)
     * @example
     * canvas.textSize(24);
     * canvas.textAlign('center', 'middle');
     * canvas.fill(255);
     * canvas.text("Hello World", width/2, height/2);
     * 
     * // Draw number
     * canvas.text(score, 10, 10);
     */
    text(str, x, y) {
        if (str === undefined || str === null) {
            return;
        }
        // One auto-sized line anchored at (x, y). text() and textBox() share _drawTextElement so a
        // pooled element never carries leftover state from the other; defaults are left/bottom, and the
        // legibility floor is applied there, so this draws at the floor rather than at a speck if the
        // caller's textSize is below it. No layout rect, so both overflow modes are Overflow: a bare
        // text() draws exactly one line at exactly that size, wherever that lands. Bounding a string to
        // a rect - wrapping it, ellipsizing it - is textBox()'s job.
        this._drawTextElement(String(str), x, y, new vec2(0, 0), false,
            HorizontalAlignment.Left, VerticalAlignment.Bottom,
            HorizontalOverflow.Overflow, VerticalOverflow.Overflow);
    }

    /**
     * Draws `str` BOUNDED by the box (x, y, w, h) in canvas pixels: the text word-WRAPS at the box's
     * width and, only if the wrapped block is still too tall, SHRINKS until it fits the height. It
     * therefore cannot overflow the box in either axis, and it cannot draw off the canvas if the box is
     * on the canvas. This is the one call to reach for whenever a string's length is not known in
     * advance - a question, a caption, an ingredient name, a hint line.
     *
     * The current textSize is a CEILING, not a target: text that already fits is drawn at exactly that
     * size, so several boxes fitted to one size stay consistent with each other. Only a box whose
     * content genuinely does not fit renders smaller than its peers, which is the honest outcome -
     * nothing is clipped and nothing is thrown away. Multi-line content needs no manual splitting:
     * pass the whole string and let it wrap.
     *
     * Uses the current textFont/fill/stroke and honours the current textAlign inside the box
     * (defaults to centred both ways). Wrapping is what bounds the WIDTH, so a string with no space
     * in it - a score, a lap time - has nothing to wrap at and its ceiling has to be right: fit it
     * with fitTextSize(str, w, h) against the same rect and pass that rect's pad, and the two agree
     * exactly. That pair is how you draw the one big value a lens is read from.
     * @param {string|number} str - Text to draw (numbers are converted to strings)
     * @param {number} x - box left edge in canvas pixels
     * @param {number} y - box top edge in canvas pixels
     * @param {number} w - box width in canvas pixels
     * @param {number} h - box height in canvas pixels
     * @param {number} [pad] - inset per side in canvas pixels; defaults to a proportional margin so
     *                         the SAME rect can back a plate and bound this without the glyphs running
     *                         into the plate's rounded corners. Pass 0 to fill the rect edge to edge.
     * @example
     * canvas.textSize(canvas.fitTextSize("Which planet has the most moons?", w));   // a ceiling
     * canvas.fill(14, 16, 24, 232);
     * canvas.rect(x, y, w, boxH, boxH * 0.42);      // the plate, drawn FIRST
     * canvas.fill(255, 255, 255);
     * canvas.textBox(question, x, y, w, boxH);      // wraps inside the plate, never spills
     */
    textBox(str, x, y, w, h, pad) {
        if (str === undefined || str === null) {
            return;
        }
        if (!(w > 0) || !(h > 0)) {
            return;   // a degenerate box makes the engine render nothing; skip instead
        }
        // Text drawn flush to a box's edge reads as broken, and a plate's rect is the rect callers
        // actually have in hand, so inset by default rather than documenting a manual inset. Scaled by
        // the box's SHORTER side: a fraction of the height alone swallows the width of a box narrower
        // than it is tall - one cell of a letter slot, one column of a table - leaving a few pixels to
        // wrap into and glyphs shrunk to nothing. For a box wider than it is tall this is unchanged.
        let inset = (pad === undefined || pad === null)
            ? Math.min(w, h) * CANVAS_TEXTBOX_PAD_RATIO : pad;
        // An inset that leaves no room for a readable line is not padding, it is the box thrown away. A
        // pad picked as a fraction of the REGION rather than of the row is the shape that does it: 0.39
        // of a row's height on each side leaves 22% of the row to draw in, and the string then wraps and
        // shrinks inside that band. The caller's OUTER rect is what the layout committed to and is left
        // exactly as passed; the margin inside it is the term that gives way, down to zero. Measured on
        // a quiz HUD whose four answers sat in 22% of their own plates, and on an earlier one whose pad
        // of 41.4px against a 32.6px row drove the inner box negative so nothing was drawn at all.
        if (inset > 0) {
            const minInner = this._lineRatio() * this._legibleFloor();
            if (h - 2 * inset < minInner && h >= minInner) {
                inset = Math.max(0, (h - minInner) / 2);
            }
        }
        // The width-wise twin of the rescue above, for a different failure: a string that fits the
        // caller's rect on one line but not the INSET rect wraps at the margin it never budgeted for,
        // and the wrapped block then ellipsizes. This is exactly what the canonical pair produces -
        // fitTextSize(str, w, h) fills the outer rect, textBox() insets it - so "SCORE 0" fitted to its
        // slot came back "SCOR...". The inset is cosmetic; deleting glyphs to keep a margin inverts its
        // job, so the margin is the term that gives way, down to zero. Only a one-line rescue: a string
        // wider than the outer rect wraps regardless, and there the margin harms nothing.
        if (inset > 0) {
            const ratios = this._textRatios(String(str));
            if (ratios) {
                const lineW = ratios.w * this.currentTextSize + this._strokeMargin();
                if (lineW > w - 2 * inset && lineW <= w) {
                    inset = Math.max(0, (w - lineW) / 2);
                }
            }
        }
        if (inset > 0) {
            const availW = w - 2 * inset;
            const availH = h - 2 * inset;
            if (!(availW > 0) || !(availH > 0)) {
                return;   // the inset swallowed the box; drawing a sliver of scaled text is worse
            }
            x += inset;
            y += inset;
            w = availW;
            h = availH;
        }
        // Box (canvas px) -> layout rect in local units: px = local * TEXT_FIXED_SCALE * pixelSize,
        // so local = _pixelsToWorld(px) / TEXT_FIXED_SCALE. The element is placed at the box center,
        // so the centered rect spans [x, x+w] x [y, y+h].
        const rectSize = new vec2(
            this._pixelsToWorld(w) / TEXT_FIXED_SCALE,
            this._pixelsToWorld(h) / TEXT_FIXED_SCALE
        );
        // Wrap at the rect's width, then Shrink only if the wrapped block is taller than the rect.
        // sizeToFit is deliberately FALSE: it scales the mesh to FILL the rect, which grows a short
        // string and makes two boxes fitted to one size disagree. Leaving it off makes the current
        // textSize a ceiling instead, so peers stay consistent and only genuine overflow costs size.
        const drawn = this._boundToLegibleSize(String(str), w, h);
        const askedSize = this.currentTextSize;
        this.currentTextSize = drawn.size;
        // A box with room for exactly ONE line hands the cut to the engine: HorizontalOverflow.Ellipsis
        // trims at the glyph the width actually runs out on, which is exact where a character-count cut
        // can only be proportional. Wrap and Ellipsis are the same property, so a box with room for two
        // or more lines must wrap, and _boundToLegibleSize does that cut itself.
        this._drawTextElement(drawn.str, x + w / 2, y + h / 2, rectSize, false,
            HorizontalAlignment.Center, VerticalAlignment.Center,
            drawn.lines === 1 ? HorizontalOverflow.Ellipsis : HorizontalOverflow.Wrap,
            VerticalOverflow.Shrink);
        this.currentTextSize = askedSize;   // a lift applies to this box, not to the calls after it
    }

    /**
     * What textBox() will actually draw inside a w x h box: the em to draw it at, how many lines the box
     * holds at that em, and - only when the box wraps - an ellipsized prefix of the string.
     *
     * This exists because VerticalOverflow.Shrink has no floor. A box holding more text than it has room
     * for is not reported by the engine and is not visible to a caller: Shrink keeps scaling the wrapped
     * block down until it fits, so the failure comes out as glyphs a few pixels tall rather than as an
     * error. Four quiz answers fitted to one common size, one of them long, is the shape that produces
     * it, and it renders as a panel of unreadable specks.
     *
     * Deciding the em HERE is what stops the engine deciding it. The bound is the box's HEIGHT and
     * nothing about the string, because the string is not what the size may depend on: peers sharing a
     * box height share a size. An earlier version bounded it by the box's AREA, which brought the
     * string's own length into the size and gave four peer answers four different sizes.
     *
     * Only WIDTH overflow is left after that, and the CONTENT is what pays for it, never the size. A box
     * with room for one line leaves that cut to HorizontalOverflow.Ellipsis, which trims at the glyph the
     * width runs out on. A box that wraps cannot use Ellipsis - it is the same property as Wrap - so the
     * cut is made here, proportionally, off the ratios measureText already caches.
     *
     * @param {string} str The string as the caller passed it
     * @param {number} w Inner box width in canvas pixels, insets already removed
     * @param {number} h Inner box height in canvas pixels, insets already removed
     * @returns {{str: string, size: number, lines: number}} What to draw, the em, and the line count
     */
    _boundToLegibleSize(str, w, h) {
        const asked = this.currentTextSize;
        const floor = this._legibleFloor();
        const lineH = this._lineRatio();
        const size = Math.max(floor, Math.min(asked, h / lineH));
        const lines = Math.max(1, Math.floor(h / (lineH * size)));
        // A box too short for one line at the floor cannot be both legible and contained, and the two
        // remedies left - overflowing the box, or shrinking under the floor - each damage something the
        // caller did not ask to lose. Legibility wins: the glyphs stay at the floor and spill past the
        // box instead. Say so once, naming the outcome the caller actually gets, since this is a layout
        // defect they can fix and the engine will never mention it.
        if (h < lineH * floor) {
            print("CanvasAPI: textBox box is " + h.toFixed(1) + "px tall, under the "
                + (lineH * floor).toFixed(1) + "px one legible line needs; the text will overflow it");
        }
        if (!str.length || lines === 1) {
            return { str: str, size: size, lines: lines };
        }
        const ratios = this._textRatios(str);
        if (!ratios || !(ratios.w > 0)) {
            return { str: str, size: size, lines: lines };
        }
        const budget = w * lines;
        const needed = ratios.w * size;
        if (needed <= budget) {
            return { str: str, size: size, lines: lines };
        }
        // Ratios are close to linear in character count for a given font, so a proportional cut lands
        // within a character or two of the budget, and the ellipsis absorbs the rest.
        const keep = Math.max(1, Math.floor(str.length * (budget / needed)) - 1);
        if (keep >= str.length) {
            return { str: str, size: size, lines: lines };
        }
        // The cut lands on the last word boundary at or before the bound wherever there is one: a string
        // that stops mid-word reads as a bug rather than as a deliberate bound. A single word longer than
        // the whole budget has no boundary to find, and is cut where it runs out.
        const cut = str.slice(0, keep);
        const lastSpace = cut.lastIndexOf(" ");
        const trimmed = lastSpace > 0 ? cut.slice(0, lastSpace) : cut.replace(/\s+$/, "");
        return { str: trimmed + "\u2026", size: size, lines: lines };
    }

    // Local layout size for the pooled Text component, matching how text() sizes the drawn glyphs
    // (measureText mirrors this so measured widths agree with what text() renders). Takes the em rather
    // than reading currentTextSize so a DRAW can pass the floored em while a MEASURE passes the asked-for
    // one: measured widths must describe the size the caller set, not the size the floor lifted it to.
    _textLocalSize(em) {
        const size = em === undefined ? this.currentTextSize : em;
        return this._pixelsToWorld(size) * 20;
    }

    // The smallest em this canvas will DRAW text at, in canvas pixels. Held on the em rather than on the
    // line box, which is ~2x it and varies per font. Every draw path clamps up to this, so the floor is a
    // property of the API rather than a rule the caller has to remember and re-derive per call site.
    _legibleFloor() {
        return this.getHeight() * CANVAS_TEXT_MIN_SIZE_FRACTION;
    }

    // An enabled outline (strokeWeight) extends drawn text ~strokeWidth px beyond the glyph fill on each
    // side. measureText adds it to what it reports and fitTextSize subtracts it from the slot, so the two
    // have to agree on the number; one owner is how they stay agreeing.
    _strokeMargin() {
        return this.doStroke ? 2 * this.strokeWidth : 0;
    }

    // Line-box height as a fraction of the em. A per-font constant, not per-string, so one fixed probe
    // recovers it and a font costs a single cache entry however many boxes ask.
    _lineRatio() {
        const ratios = this._textRatios(CANVAS_LINE_HEIGHT_PROBE);
        return ratios ? ratios.h : CANVAS_TEXT_FALLBACK_LINE_HEIGHT;
    }

    // Size for the MEASURING Text component, chosen so it rasterises on the SAME grid as drawn glyphs.
    // text() scales its drawn element by TEXT_FIXED_SCALE, which fails the engine's pixel-perfect layout
    // gate, so drawn glyphs always rasterise on the SDF grid at TEXT_SDF_PPEM pixels/em. The measuring
    // comp has unit scale and DOES pass that gate, so it would otherwise rasterise at the canvas's own
    // ppem - a different rounding grid (glyph advances round up per pixel, and hinting switches on at
    // ppem 26), which under-reports long strings at small text sizes. Solving
    //     ppem = texture.height * (Text.size / fontSizeToWorldUnit) / camera.size
    // for ppem == TEXT_SDF_PPEM gives the size below; widths are linear in size, so the caller rescales.
    // Returns 0 when that size falls outside the engine's Text.size clamp, so the caller falls back to
    // measuring in text()'s own layout space.
    _textMeasureSize() {
        if (!this.cameraComp || !this.texture) {
            return 0;
        }
        // A useScreenResolution target has no resolution until the render pass assigns one, and that runs
        // after the script update AND after LateUpdate, so on the canvas's first frame the height reads 0.
        // Without a height we can't hit the SDF grid and fall back to text()'s layout space, which on that
        // first frame reports text up to (1 + 0.333em/width) too wide. The canvas already resolved its own
        // size, so state it here; the render pass overwrites it from the real screen resolution every
        // frame, so nothing is pinned. Priming at the only consumer also covers a pooled render target.
        let texHeight = this.texture.getHeight();
        if (!texHeight && this.size.x >= 1 && this.size.y >= 1) {
            this.texture.control.resolution = new vec2(this.size.x, this.size.y);
            texHeight = this.size.y;
        }
        if (!texHeight) {
            return 0;
        }
        const measureSize =
            TEXT_SDF_PPEM * TEXT_SDF_PPEM_BIAS * TEXT_FONT_SIZE_TO_WORLD_UNIT * this.cameraComp.size / texHeight;
        return (measureSize >= TEXT_SIZE_MIN && measureSize <= TEXT_SIZE_MAX) ? measureSize : 0;
    }

    // Single owner of the pooled Text element's per-draw setup: EVERY stateful field is set here on
    // every draw, so a reused element carries no leftover state from a prior text()/textBox() call.
    // rectSize is the layout rect in local units (vec2(0,0) = auto-size one line); sizeToFit scales
    // the glyph mesh to fill it; alignment falls back to (hDefault, vDefault) when textAlign is unset;
    // fill/stroke gradients and the world position are sampled at (ax, ay). hOverflow/vOverflow decide
    // what happens at the layout rect's edges, so they must be set on every draw too - a pooled
    // element that kept a box draw's Wrap would silently wrap the next one-line text() call.
    _drawTextElement(str, ax, ay, rectSize, sizeToFit, hDefault, vDefault, hOverflow, vOverflow) {
        this._flushCurrentVector();
        const el = this._getOrCreateElement("text");

        // ONE legibility floor, applied where every draw path already converges. text(), textBox() and
        // anything added later inherit it from here, so no call site carries a floor of its own and the
        // notes do not have to state one. A caller's textSize is a request; this is the answer.
        const em = Math.max(this.currentTextSize, this._legibleFloor());

        el.textComp.text = str;
        el.textComp.font = this.currentTextFont || getDefaultFont();
        el.textComp.size = this._textLocalSize(em);
        el.textComp.sizeToFit = sizeToFit;
        el.textComp.horizontalOverflow = hOverflow;
        el.textComp.verticalOverflow = vOverflow;
        el.textComp.worldSpaceRect.setCenter(new vec2(0, 0));
        el.textComp.worldSpaceRect.setSize(rectSize);

        // Left / Bottom are 0 (falsy), so resolve with an explicit undefined check, not `|| default`.
        const maps = textAlignMaps();
        const hAlign = maps.h[this.currentTextAlignH];
        const vAlign = maps.v[this.currentTextAlignV];
        el.textComp.horizontalAlignment = hAlign !== undefined ? hAlign : hDefault;
        el.textComp.verticalAlignment = vAlign !== undefined ? vAlign : vDefault;

        if (this.doFill) {
            const fillBase = this.fillGradient ? this.fillGradient._evalAt(ax, ay) : this.fillColor;
            el.textComp.textFill.color = applyGlobalAlpha(this, fillBase);
            el.textComp.textFill.enabled = true;
        } else {
            el.textComp.textFill.enabled = false;
        }
        if (this.doStroke) {
            const strokeBase = this.strokeGradient ? this.strokeGradient._evalAt(ax, ay) : this.strokeColor;
            el.textComp.outlineSettings.enabled = true;
            el.textComp.outlineSettings.fill.color = applyGlobalAlpha(this, strokeBase);
            el.textComp.outlineSettings.size = Math.max(0.01, this.strokeWidth / em);
        } else {
            el.textComp.outlineSettings.enabled = false;
        }

        const worldPos = this._toWorld(ax, ay);
        const transform = el.so.getTransform();
        transform.setWorldPosition(new vec3(worldPos.x, worldPos.y, 0));
        const scale = getMatrixScale(this.transformMatrix);
        transform.setLocalScale(new vec3(TEXT_FIXED_SCALE * scale.x, TEXT_FIXED_SCALE * scale.y, 1));
        const col0 = this.transformMatrix.column0;
        const rotation = -Math.atan2(col0.y, col0.x);
        transform.setLocalRotation(quat.fromEulerAngles(0, 0, rotation));

        this.lastElementType = "text";
        // Development harnesses attach a _probe to score a rendered layout (see .claude/tmp/hud_audit.js).
        // The hook is HERE, and not on text()/textBox(), because this is the only place that knows what
        // was really drawn: the string after any ellipsis, the em after the floor, and the layout rect the
        // engine got. Reading those off the public calls instead reports what the CALLER asked for, which
        // is how a panel of 10px glyphs went on scoring as 30px text. Nothing ships enabled: no _probe,
        // no cost beyond this one property read.
        if (this._probe) {
            this._probe.text(str, ax, ay, rectSize, em, this);
        }
    }

    /**
     * Measures the rendered width of a string at the current textSize and textFont,
     * WITHOUT drawing anything. Returned width is in canvas pixels, the same units as
     * getWidth()/getHeight() and the x,y you pass to text(), so it can be compared
     * against layout budgets directly (e.g. laying out several HUD labels without overlap).
     * Call textSize()/textFont() first; measureText reflects whatever is current.
     * @param {string|number} str - Text to measure (numbers are converted to strings)
     * @returns {number} Rendered width in canvas pixels (0 for empty input)
     * For a fixed-width edge anchor, prefer textAlign('right')/textBox() over measuring; use
     * measureText when you need the actual width, e.g. to place one label just past another.
     * @example
     * canvas.textSize(48);
     * const w = canvas.measureText("SCORE: " + score);      // width in canvas px, no draw
     * canvas.text("LIVES: " + lives, 20 + w + 30, 20);       // placed past the score, never overlaps
     */
    measureText(str) {
        if (str === undefined || str === null) {
            return 0;
        }
        str = String(str);
        if (str.length === 0) {
            return 0;
        }

        const ratios = this._textRatios(str);
        // An enabled outline (strokeWeight) extends the drawn text ~strokeWidth px beyond the glyph
        // fill on each side; add it so the returned width matches what text()/textBox() actually draw.
        // Kept OUT of the cache (which stores fill-only ratios) and added per-call, so strokeWeight()
        // changes take effect immediately without invalidating cached measurements.
        const strokeMargin = this._strokeMargin();
        if (ratios) {
            return ratios.w * this.currentTextSize + strokeMargin;
        }
        return str.length * this.currentTextSize * CANVAS_TEXT_FALLBACK_ADVANCE
            + TEXT_MEASURE_INK_PAD * this.currentTextSize + strokeMargin;
    }

    /**
     * Returns the textSize at which text() would draw str inside a w x h box, WITHOUT drawing and
     * without changing any canvas state. Use it to fit a GROUP of related strings at ONE shared
     * size: take Math.min of a fitTextSize per member, each against its own slot, then textSize()
     * that once. Fitting each string on its own (a textBox per label) gives each its own size,
     * which reads as broken even when nothing overflows.
     * @param {string|number} str - Text to fit (numbers are converted to strings)
     * @param {number} w - usable slot width in canvas pixels (already minus any padding)
     * @param {number} [h] - usable slot height in canvas pixels; OMIT to fit on width alone
     * @returns {number} The largest textSize that fits, 0 for a degenerate slot
     * The result is conservative by the same ink allowance measureText uses, so it can come out a
     * hair small but never overflows. Deliberately has NO min/max parameter: clamping a fitted size
     * up to a "readable" floor un-fits the text and recreates the overflow this exists to prevent.
     * This bounds WIDTH only unless you pass h, and a size that fits a width still overflows a box
     * that is not tall enough for its line box - which is how text fitted to a plate's width ends up
     * crossing the plate's top and bottom edges. So:
     *   - DERIVING the slot height afterwards, from textLineHeight()? Omit h.
     *   - Slot height ALREADY FIXED, because you have a plate or a cell? Pass h, and draw with
     *     textBox(str, x, y, w, h, pad) against the SAME rect and pad. They agree exactly, so the
     *     glyphs fill the box and cannot cross its edges.
     * What is never right is fitting to a height you invented and then placing the baseline yourself:
     * a line box is ~1.8-2.3x textSize, so a size chosen against h * 0.6 with a baseline at h * 0.58
     * looks fitted and still crosses the rim.
     * @example
     * const px = Math.min(canvas.fitTextSize("SCORE: 1000000", slotW),   // widest legal value,
     *                     canvas.fitTextSize("TIME: 00:00", slotW));     // not the current one
     * canvas.textSize(px);                                               // one size, whole group
     */
    fitTextSize(str, w, h) {
        if (str === undefined || str === null) {
            str = "";
        }
        str = String(str);
        if (!(w > 0)) {
            return 0;   // degenerate slot: draw nothing rather than guess a size
        }
        const strokeMargin = this._strokeMargin();
        const availW = w - strokeMargin;
        // h is optional: absent means width-only, which is the shape that fills a HUD row.
        const boundHeight = h !== undefined && h !== null;
        if (boundHeight && !(h > 0)) {
            return 0;
        }
        const availH = boundHeight ? h - strokeMargin : Infinity;
        if (!(availW > 0) || !(availH > 0)) {
            return 0;
        }
        // An empty member is height-limited only, so it can never drag a group's Math.min to 0.
        const ratios = str.length === 0 ? null : this._textRatios(str);
        const widthRatio = ratios ? ratios.w
            : str.length * CANVAS_TEXT_FALLBACK_ADVANCE + TEXT_MEASURE_INK_PAD;
        const heightRatio = ratios ? ratios.h : CANVAS_TEXT_FALLBACK_LINE_HEIGHT;
        const byHeight = availH / heightRatio;
        return widthRatio > 0 ? Math.min(availW / widthRatio, byHeight) : byHeight;
    }

    /**
     * Height of one line of text in canvas pixels at the current textSize and textFont, i.e. the
     * row height to reserve for it. This is the line BOX (ascent + descent + gap, plus the ink
     * allowance), not cap height, so it is ~1.8-2.3x textSize depending on the font and does not
     * vary with the string.
     * @returns {number} Line height in canvas pixels
     * Use it to size a HUD row from its text rather than fitting text into a guessed row: pick the
     * size with fitTextSize on width, then make the row this tall plus padding.
     * @example
     * canvas.textSize(canvas.fitTextSize("SCORE: 1000000", slotW));
     * const rowH = canvas.textLineHeight();                 // exact height this row needs
     */
    textLineHeight() {
        return this._lineRatio() * this.currentTextSize;
    }

    /**
     * Size-invariant canvas-pixels-per-textSize ratios ({w, h}, fill only) for (font, str), or null
     * when no real measurement is available this frame. measureText and fitTextSize both go through
     * here so they can never disagree about what text() will draw.
     */
    _textRatios(str) {
        const size = this.currentTextSize;
        const font = this.currentTextFont || getDefaultFont();
        if (!this._measureCache) {
            this._measureCache = new Map();
        }
        // Cache the per-textSize RATIOS keyed by (font, string) only. Both scale linearly with
        // textSize, so cached ratios serve every size — changing textSize never forces a new native
        // measurement (matters for size animations and fit-to-width scaling).
        const key = this._measureFontId(font) + "|" + str;
        const cached = this._measureCache.get(key);
        if (cached !== undefined) {
            return cached;
        }

        // A cache miss reads Text.getBoundingBox(), which drives Text.syncState() — the engine
        // rate-limits that to RateLimit calls per frame per Text component and THROWS past it.
        // Do at most CANVAS_MEASURE_BUDGET_PER_COMP real measurements per measuring comp per frame,
        // spread across a pool of CANVAS_MEASURE_COMP_POOL comps (each has its own rate limit), so up
        // to POOL*BUDGET new strings/frame get a real measurement. Anything beyond (or a rate-limit
        // throw) uses a conservative estimate that never under-reports. The cache persists (bounded),
        // so a stable HUD measures each value once and rarely approaches the ceiling.
        if (this._measureBudgetUsed === undefined) {
            this._measureBudgetUsed = 0;
        }
        const localSize = this._textLocalSize();
        const measureBudget = CANVAS_MEASURE_COMP_POOL * CANVAS_MEASURE_BUDGET_PER_COMP;
        if (localSize && this._measureBudgetUsed < measureBudget) {
            // Fill one comp's budget before spilling to the next, so the common case
            // (<= BUDGET measures/frame) only ever creates a single comp.
            const compIndex = Math.floor(this._measureBudgetUsed / CANVAS_MEASURE_BUDGET_PER_COMP);
            this._measureBudgetUsed++;
            let boxWidth = 0;
            let boxHeight = 0;
            let measureSize = 0;
            try {
                const textComp = this._ensureMeasureTextComp(compIndex);
                textComp.text = str;
                textComp.font = font;
                // Measure on the raster grid text() actually draws on (see _textMeasureSize), falling
                // back to text()'s own layout size when that grid size is outside Text.size's clamp.
                measureSize = this._textMeasureSize() || localSize;
                textComp.size = measureSize;
                const boxSize = textComp.getBoundingBox().getSize();
                boxWidth = boxSize.x;
                boxHeight = boxSize.y;
            } catch (e) {
                boxWidth = 0;   // rate-limit throw or layout not ready -> conservative estimate below
            }
            if (boxWidth > 0) {
                // Rescale the box from the measuring size into text()'s layout space (both axes are
                // linear in size), then to canvas pixels: text() scales the drawn glyphs by
                // TEXT_FIXED_SCALE and maps world->pixels by pixelSize. Plus a small ink allowance so
                // heavy/script faces (whose ink overhangs the advance) are never under-reported.
                const toPixels = (local) => local * (localSize / measureSize) * TEXT_FIXED_SCALE * this.pixelSize;
                const ratios = {
                    w: (toPixels(boxWidth) + TEXT_MEASURE_INK_PAD * size) / size,
                    // Height comes from the same getBoundingBox() call, so it costs nothing extra. It
                    // is the LINE BOX (ascent+descent+gap), which measures as a per-font constant -
                    // identical across every string tested - not per-glyph ink. Hence textLineHeight
                    // can recover a font's row height from any one string.
                    h: (toPixels(boxHeight) + TEXT_MEASURE_INK_PAD * size) / size,
                };
                // _textMeasureSize primes the render target resolution so the first frame already measures
                // on the grid-fitted path, but that only holds when the primed size IS the real screen
                // size - on the deviceResolution fallback path it may not be, and a wrong size makes the
                // first frame under-report (which clips). So return this measurement but DON'T cache it on
                // the first frame: the next call re-measures and caches the settled width, rather than
                // pinning a possibly-wrong first-frame value for the whole session.
                if (this._measureFrameIndex) {
                    this._measureCache.set(key, ratios);   // size-invariant ratios
                    if (this._measureCache.size > CANVAS_MEASURE_CACHE_MAX) {
                        this._measureCache.delete(this._measureCache.keys().next().value);   // bound memory (oldest-out)
                    }
                }
                return ratios;
            }
            // Layout not ready this frame (glyphs still loading -> empty box): fall through to the
            // estimate and DON'T cache, so a later frame measures and caches the real width.
        }
        // Over budget, degenerate size, layout not ready, or rate-limit throw: the caller falls back
        // to a conservative estimate that over-reports width (never clips). The estimate runs ~2.3x
        // the real width for typical HUD text (it has to bound the widest glyph in any shipped font),
        // so text fit from it renders noticeably small. That only happens once more than the per-frame
        // budget of NEW strings is measured in one frame, which is otherwise silent; warn once so a
        // developer can see the size drop is an estimate, not a real measurement.
        if (localSize && this._measureBudgetUsed >= measureBudget && !this._measureFallbackWarned) {
            this._measureFallbackWarned = true;
            print("CanvasAPI: measureText exceeded " + measureBudget + " new-string measurements in one frame; estimating widths for the rest (text may size wrong). Measure fewer distinct strings per frame, or use textBox() for fit-to-region layout.");
        }
        return null;
    }

    // Stable per-font id (reference identity, no property mutation) for the measure cache key.
    _measureFontId(font) {
        if (!this._measureFonts) {
            this._measureFonts = [];
        }
        let idx = this._measureFonts.indexOf(font);
        if (idx < 0) {
            idx = this._measureFonts.length;
            this._measureFonts.push(font);
        }
        return idx;
    }

    _convertColor(v1, v2, v3, a) {
        // If a normalized vec4 was passed in (e.g. from canvas.color()), use it as-is
        if (v1 instanceof vec4) {
            return v1;
        }

        const alpha = (a === undefined) ? 1 : a / this.colorMaxValue;

        // Normalize input values based on maxValue
        const c1 = v1 / this.colorMaxValue;
        const c2 = v2 / this.colorMaxValue;
        const c3 = v3 / this.colorMaxValue;
        
        let r, g, b;
        
        if (this.currentColorMode === HSB) {
            // HSB mode: c1=hue, c2=saturation, c3=brightness
            const rgb = hsbToRgb(c1, c2, c3);
            r = rgb.r;
            g = rgb.g;
            b = rgb.b;
        } else if (this.currentColorMode === HSL) {
            // HSL mode: c1=hue, c2=saturation, c3=lightness
            const rgb = hslToRgb(c1, c2, c3);
            r = rgb.r;
            g = rgb.g;
            b = rgb.b;
        } else {
            // RGB mode (default)
            r = c1;
            g = c2;
            b = c3;
        }
        
        return new vec4(r, g, b, alpha);
    }

    _cubicBezier(p0, p1, p2, p3, t) {
        // Cubic Bezier formula: B(t) = (1-t)³P0 + 3(1-t)²tP1 + 3(1-t)t²P2 + t³P3
        const mt = 1 - t;
        const mt2 = mt * mt;
        const mt3 = mt2 * mt;
        const t2 = t * t;
        const t3 = t2 * t;
        
        return mt3 * p0 + 3 * mt2 * t * p1 + 3 * mt * t2 * p2 + t3 * p3;
    }

    // Get or allocate a texture slot in current batch
    // Returns a cached 256x1 LUT texture for a fill gradient, baking it by stop
    // signature on first use. Bounds the live LUT set to MAX_GRADIENT_LUTS (FIFO),
    // so recreating gradients every frame reuses textures instead of growing memory.
    _lutForGradient(gradient) {
        const sig = gradient._signature();
        const cached = this.gradientLuts.get(sig);
        if (cached) {
            return cached;
        }
        const tex = gradient._bakeLUT();
        this.gradientLuts.set(sig, tex);
        if (this.gradientLuts.size > MAX_GRADIENT_LUTS) {
            const oldest = this.gradientLuts.keys().next().value;
            this.gradientLuts.delete(oldest); // drop ref so the texture can be reclaimed
        }
        return tex;
    }

    _getTextureSlot(texture) {
        // Check if texture is already in batch
        if (this.textureIdMap.has(texture)) {
            return this.textureIdMap.get(texture);
        }
        
        // Check if we have room for another texture
        if (this.textureSlots.length >= this.maxTexturesPerBatch) {
            // Batch is full - flush and start new batch
            this._flushCurrentVector();
            this.currentVectorElement = null;
            this.lastElementType = null;    
        }
        
        // Add texture to batch
        const slotIndex = this.textureSlots.length;
        this.textureSlots.push(texture);
        this.textureIdMap.set(texture, slotIndex);
        
        return slotIndex;
    }

    _addVertex(x, y, z, r, g, b, a, u, v, textureId, edgeDist) {
        // Vertex format: position(3) + color(4) + uv(2) + textureId(1) + edgeDistance(1) = 11 components
        this.vertices.push(x, y, z, r, g, b, a, u, v, textureId, edgeDist);
        this.vertexCount++;
    }

    _toWorld(x, y) {
        // Apply transformation matrix first (in pixel space)
        const transformed = transformPoint(this.transformMatrix, x, y);
        
        // Convert screen coordinates (0,0 top-left to width,height bottom-right) to world coordinates
        const canvasSize = this.getSize();
        const tx = transformed.x / canvasSize.x;  // 0 to 1
        const ty = transformed.y / canvasSize.y;  // 0 to 1
        
        return new vec2(
            this.worldTL.x + tx * (this.worldTR.x - this.worldTL.x),
            this.worldTL.y + ty * (this.worldBL.y - this.worldTL.y)
        );
    }

    _pixelsToWorld(pixels) {
        // Convert pixel distance to world units
        return pixels / this.pixelSize;
    }

    _getScaledStrokeWidth() {
        // Get stroke width scaled by transform
        const scale = getMatrixScale(this.transformMatrix);
        // Use average of x and y scale
        const avgScale = (scale.x + scale.y) / 2;
        return this.strokeWidth * avgScale;
    }

    // Get or create an element from the pool
    _getOrCreateElement(type) {
        let element;
        
        if (this.elements[type] && this.elements[type].length > 0) {
            // Reuse from pool
            element = this.elements[type].pop();
            element.so.setParent(this.rootSo);
            element.so.enabled = true;
        } else {
            // Create new element
            element = this._createElement(type);
        }
        element.frameCount=1;

        // Make sure elements are rendered from first to last
        if (element.imageComp) {
            element.imageComp.renderOrder = this.activeElements.length;
        } else if (element.textComp) {
            element.textComp.renderOrder = this.activeElements.length;
        } else if (element.meshVisual) {
            element.meshVisual.renderOrder = this.activeElements.length;
        }
    
        this.activeElements.push(element);
        return element;
    }

    // Create a new element of the given type
    _createElement(type) {
        const so = global.scene.createSceneObject("Canvas " + type);
        so.setParent(this.rootSo);
        so.layer = this.rootSo.layer;
        
        const element = { so: so, type: type };
        
        if (type === "background") {
            so.createComponent("Component.ScreenTransform");
            const img = so.createComponent("Component.Image");
            img.clearMaterials();
            img.addMaterial(script.backgroundMaterial.clone());
            element.imageComp = img;
        } else if (type === "vector") {
            // Create MeshBuilder for this vector element with texture support
            const meshBuilder = new MeshBuilder([
                { name: "position", components: 3 },
                { name: "color", components: 4 },
                { name: "texture0", components: 2 },   // UV coordinates
                { name: "textureId", components: 1 },  // Texture slot index
                { name: "edgeDist", components: 1 }
            ]);
            meshBuilder.topology = MeshTopology.Triangles;
            meshBuilder.indexType = MeshIndexType.UInt16;
            
            const meshVisual = so.createComponent("Component.RenderMeshVisual");
            meshVisual.mainMaterial = script.vectorMaterial.clone();
            meshBuilder.updateMesh();
            meshVisual.mesh = meshBuilder.getMesh();
            
            element.meshBuilder = meshBuilder;
            element.meshVisual = meshVisual;
        } else if (type === "text") {
            // Create Text component (uses regular Transform, not ScreenTransform)
            const textComp = so.createComponent("Component.Text");
            textComp.text = "";
            textComp.size = 20;
            textComp.font = getDefaultFont();
            
            element.textComp = textComp;
        }
        
        return element;
    }

    // Lazily create the `index`-th hidden Text component used only by measureText() to read text
    // extents. Each must sit under an ENABLED object for the engine to lay its glyphs out (a disabled
    // object reports a zero-size bounding box), so they live under the render root with fill and
    // outline disabled — they compute layout but draw nothing, and are never added to activeElements,
    // so element pooling leaves them untouched. The engine rate-limits syncState PER component, so
    // measureText spreads measurements across a small pool (comps created on demand); each comp's
    // render pass spends one syncState/frame, which CANVAS_MEASURE_BUDGET_PER_COMP accounts for.
    _ensureMeasureTextComp(index) {
        if (!this.measureTextComps) {
            this.measureTextComps = [];
        }
        if (!this.measureTextComps[index]) {
            const so = global.scene.createSceneObject("Canvas measureText " + index);
            so.setParent(this.rootSo);
            so.layer = this.rootSo.layer;
            const textComp = so.createComponent("Component.Text");
            textComp.text = "";
            textComp.size = 20;
            textComp.font = getDefaultFont();
            // Must draw NOTHING: this comp sits on the canvas camera's render layer and stays enabled
            // (a disabled object reports a zero-size bounding box, so it cannot be turned off). Note
            // textFill has no `enabled` property - only outline/shadow/background settings do - so the
            // fill is hidden by making it fully transparent, and _endFrame clears the measured string.
            textComp.textFill.color = new vec4(0, 0, 0, 0);
            if (textComp.outlineSettings) {
                textComp.outlineSettings.enabled = false;
            }
            // Zero the layout rect (same as text()) so the box auto-sizes to a single
            // unwrapped line; otherwise a default rect could wrap long text and under-report width.
            textComp.worldSpaceRect.setCenter(new vec2(0, 0));
            textComp.worldSpaceRect.setSize(new vec2(0, 0));
            this.measureTextComps[index] = textComp;
        }
        return this.measureTextComps[index];
    }

    // Ensure we have a current vector element to draw into with the correct blend mode
    _ensureVectorElement() {
        // Check if we need to flush due to vertex limit (UInt16 max = 65535)
        const needsFlushDueToLimit = this.vertexCount >= MAX_VERTICES_PER_BATCH;
        
        if (this.lastElementType !== "vector" || !this.currentVectorElement ||
            this.lastBlendMode != this.currentBlendMode || needsFlushDueToLimit)
        {
            // Need a new vector element
            this._flushCurrentVector();
            this.currentVectorElement = this._getOrCreateElement("vector");
            this.currentVectorElement.meshVisual.mainPass.blendMode = toLSBlendMode(this.currentBlendMode);
            this.lastBlendMode = this.currentBlendMode;
            this.lastElementType = "vector";
        }
    }

    // Flush current vector element's mesh data
    _flushCurrentVector() {
        if (!this.currentVectorElement || this.vertices.length === 0) {
            return;
        }
        
        const mb = this.currentVectorElement.meshBuilder;
        
        // Clear previous mesh data
        if (mb.getVerticesCount() > 0) {
            mb.eraseVertices(0, mb.getVerticesCount());
        }
        if (mb.getIndicesCount() > 0) {
            mb.eraseIndices(0, mb.getIndicesCount());
        }
        
        // Upload new data
        mb.appendVerticesInterleaved(this.vertices);
        mb.appendIndices(this.indices);
        mb.updateMesh();
        
        // Bind all textures in the batch to their respective slots
        if (this.textureSlots.length > 0) {
            const material = this.currentVectorElement.meshVisual.mainMaterial;
            
            // Bind textures to slots
            for (let i = 0; i < this.textureSlots.length; i++) {
                const samplerName = `baseTex${i}`;
                if (material.mainPass[samplerName] !== undefined) {
                    material.mainPass[samplerName] = this.textureSlots[i];
                }
            }
            
            // Optional: Set texture count uniform for debugging
            if (material.mainPass.textureCount !== undefined) {
                material.mainPass.textureCount = this.textureSlots.length;
            }
        }
        
        // Reset vertex data for next batch
        this.vertices = [];
        this.indices = [];
        this.vertexCount = 0;
        this.textureSlots = [];
        this.textureIdMap.clear();
    }

    // End of frame - flush and move elements to pool
    _endFrame() {
        // Flush any pending vector data
        this._flushCurrentVector();

        // Move all active elements to unused pool
        for (let i = this.activeElements.length-1; i>=0; i--) {
            const element = this.activeElements[i];
            if (element.frameCount-- <= 0) {
                element.so.setParent(this.unusedSo);
                element.so.enabled = false;
                
                if (!this.elements[element.type]) {
                    this.elements[element.type] = [];
                }
                this.elements[element.type].push(element);
                this.activeElements.splice(i, 1);
            }
        }
        
        // Reset for next frame
        // this.activeElements = [];
        this.currentVectorElement = null;
        this.lastElementType = null;
        this.transformMatrix = mat3.identity();
        this._measureBudgetUsed = 0;   // replenish measureText's per-frame syncState budget
        this._measureFrameIndex = (this._measureFrameIndex || 0) + 1;   // >0 once a frame has completed
        if (this._probe) { this._probe.frame(this); }

        // Drop the string each measuring comp is holding: with no glyphs it cannot render, and the
        // engine releases its layout/mesh and unpins the glyph atlas entries. Runs before the render
        // pass (LateUpdate) and costs no measure budget, since only getBoundingBox is rate-limited.
        if (this.measureTextComps) {
            for (const comp of this.measureTextComps) {
                if (comp) {
                    comp.text = "";
                }
            }
        }
    }

    _init(fullscreen, width, height) {
        this.fullscreen = fullscreen;
        // Create camera
        this.rendererSo = global.scene.createSceneObject("Canvas Camera");
        this.cameraComp = this.rendererSo.createComponent("Component.Camera");
        this.cameraComp.type = Camera.Type.Orthographic;
        this.cameraComp.near = -1;
        this.cameraComp.far = 200;
        this.cameraComp.renderLayer = LayerSet.makeUnique();
        if (fullscreen) {
            this.cameraComp.devicePropertyUsage = Camera.DeviceProperty.All;
            if (manager.deviceResolution.x == -1) {
                // when manager's device resolution is not ready, take resolution from overlayRT directly
                this.size = new vec2(script.overlayRT.getWidth(), script.overlayRT.getHeight());
            } else {
                this.size = manager.deviceResolution;
            }
        } else {
            this.cameraComp.devicePropertyUsage = Camera.DeviceProperty.None;
            this.cameraComp.aspect = width/height;
            this.size = new vec2(width, height);
        }
        
        this.texture = this._getOrCreateRenderTarget(fullscreen, width, height);
        manager.premultipliedTextures.add(this.texture);
        this.cameraComp.renderTarget = this.texture;
        this.rendererSo.layer = this.cameraComp.renderLayer;
        this.renderLayer = this.cameraComp.renderLayer;

        // Create screen region (parent for all elements)
        this.regionSo = global.scene.createSceneObject("Canvas Region");
        this.regionSo.setParent(this.rendererSo);
        this.regionSo.layer = this.cameraComp.renderLayer;
        this.regionSt = this.regionSo.createComponent("Component.ScreenTransform");
        const regionComp = this.regionSo.createComponent("Component.ScreenRegionComponent");
        regionComp.region = ScreenRegionType.FullFrame;

        // Create root container for active elements
        this.rootSo = global.scene.createSceneObject("Canvas Root");
        this.rootSo.setParent(this.regionSo);
        this.rootSo.layer = this.cameraComp.renderLayer;
        this.rootSo.createComponent("Component.ScreenTransform");

        // Create unused pool container (disabled, holds pooled elements)
        this.unusedSo = global.scene.createSceneObject("Canvas Unused");
        this.unusedSo.setParent(this.regionSo);
        this.unusedSo.layer = this.cameraComp.renderLayer;
        this.unusedSo.enabled = false;

        this._updateWorldCorners();
    }

    _getOrCreateRenderTarget(fullscreen, width, height) {
        // Check if we have one in the pool
        const rt = manager.getUnusedRt(fullscreen, width, height);
        if (rt) {
            // A pooled RT keeps whatever clear state its previous owner left. A glowing
            // canvas sets this.texture to CustomColor (0,0,0,0) because the composite
            // camera owns it, so reset the policy here or the next canvas's main camera
            // inherits a per-frame transparent clear it never asked for.
            rt.control.clearColorOption = ClearColorOption.None;
            rt.control.clearDepthEnabled = false;
            return rt;
        }

        // No, create a new one
        const renderTarget = global.scene.createRenderTargetTexture();    
        renderTarget.control.useScreenResolution = fullscreen;
        renderTarget.control.resolutionScale = 1;
        if (!fullscreen) {
            renderTarget.control.resolution = new vec2(width, height);
        }
        renderTarget.control.clearColorOption = ClearColorOption.None;
        renderTarget.control.clearDepthEnabled = false;
        return renderTarget;
    }

    // Lazily creates the downscaled glow camera/target and (for on-screen canvases)
    // the additive composite image; re-enables them if previously disabled.
    _ensureGlow(seedBase) {
        if (!this.glowBaseTexture) {
            // Move the MAIN camera onto a private base RT and hand this.texture to the
            // composite camera. this.texture therefore stays the one public texture in
            // both glow states, so getTexture() never changes identity and a handle
            // cached before glow() keeps working (see getTexture()).
            //
            // Read-after-write invariant, do not break it: the composite camera must stay
            // the ONLY writer of this.texture, because consumers (the on-screen Image's
            // overlay sample, another canvas's image()) sample it strictly later.
            // Same shape and clear policy as a canvas texture, so it comes from (and goes
            // back to) the shared pool: identical arguments to the this.texture call above,
            // which is what keeps the pool's fullscreen/size matching symmetric. A recycled
            // RT arrives with the previous owner's pixels, which is harmless here because
            // the seed blit below overwrites every pixel with BlendMode.Disabled.
            this.glowBaseTexture = this._getOrCreateRenderTarget(
                this.fullscreen, this.size.x, this.size.y);

            // Carry the canvas's existing pixels over to the new base RT, ONCE.
            //
            // A canvas RT is deliberately never cleared, and drawing elements are pooled
            // ~2 frames after being issued (_endFrame), so "draw once and leave it"
            // content exists only as RT pixels. Without this blit, moving the main camera
            // to a fresh base RT would lose it all and the composite would publish an
            // uninitialized RT. It runs on the CANVAS's layer so the main camera draws it
            // into the base; BlendMode.Disabled also initialises those pixels.
            //
            // EXACTLY one frame, via _armGlowSeed: from the second frame on this.texture
            // holds base+halo, and copying that back into the base compounds the halo.
            this.glowMigrateSo = global.scene.createSceneObject("Canvas Glow Base Seed");
            this.glowMigrateSo.setParent(this.regionSo);
            this.glowMigrateSo.layer = this.cameraComp.renderLayer;
            this.glowMigrateSo.createComponent("Component.ScreenTransform");
            const seedImg = this.glowMigrateSo.createComponent("Component.Image");
            seedImg.clearMaterials();
            seedImg.addMaterial(script.onscreenMaterial.clone());
            seedImg.stretchMode = StretchMode.Stretch;
            seedImg.mainPass.baseTex = this.texture;
            seedImg.mainPass.blendMode = BlendMode.Disabled;
            seedImg.renderOrder = -1000;
        }

        // Seed on the off->on TRANSITION only. Content drawn while glow was off went to
        // this.texture, so the base RT has to pick it up — but this.texture is also the
        // composite destination, so re-seeding while glow is already on would copy
        // base+halo back into base and compound the halo on every call. While glow is on
        // the main camera already renders new content straight into the base RT, so there
        // is nothing to carry over.
        if (seedBase) {
            this._armGlowSeed(this.texture);
        }
        // Re-applied on every enable (not just first build) so glow() after noGlow()
        // re-points the main camera and re-arms this.texture's clear.
        this.cameraComp.renderTarget = this.glowBaseTexture;
        // this.texture is now the composite destination and nothing else clears it. The
        // base blit is a premultiplied Normal blend, which leaves dst untouched wherever
        // base.a == 0, so without an explicit clear the transparent regions keep last
        // frame's halo. CustomColor (0,0,0,0), not None.
        this.texture.control.clearColorOption = ClearColorOption.CustomColor;
        this.texture.control.clearColor = new vec4(0, 0, 0, 0);
        this.texture.control.clearDepthEnabled = false;

        if (!this.glowSo) {
            this.glowTexture = global.scene.createRenderTargetTexture();
            this.glowTexture.control.useScreenResolution = this.fullscreen;
            this.glowTexture.control.resolutionScale = this.fullscreen ? GLOW_RESOLUTION_SCALE : 1;
            if (!this.fullscreen) {
                const gw = Math.max(1, Math.ceil(this.size.x * GLOW_RESOLUTION_SCALE));
                const gh = Math.max(1, Math.ceil(this.size.y * GLOW_RESOLUTION_SCALE));
                this.glowTexture.control.resolution = new vec2(gw, gh);
            }
            // Clear to transparent (not None): with a transparent canvas the blit
            // writes nothing, so an uncleared RT would composite uninitialized
            // (magenta) pixels and wash the whole frame additively. CustomColor +
            // (0,0,0,0) keeps glow-over-the-camera clean; opaque canvases overwrite it.
            this.glowTexture.control.clearColorOption = ClearColorOption.CustomColor;
            this.glowTexture.control.clearColor = new vec4(0, 0, 0, 0);
            this.glowTexture.control.clearDepthEnabled = false;

            // Separate layer so the glow camera renders only ONE blit quad (the
            // finished canvas RT downsampled), not the vector geometry a second
            // time. Keeps glow O(1) in shape count. Renders after the main camera
            // so it samples this frame's canvas RT.
            // Cost note: glow allocates 3 unique render layers (glow/blur/composite)
            // on top of the canvas's own. LayerSet.makeUnique() has no release API in
            // LS, so destroyCanvas cannot reclaim them (the main-camera layer already
            // leaks the same way). Ceiling: makeUnique() supplies ~65,000 layers, so at 4
            // per glowing canvas only an unbounded create+glow+destroy loop (~16,000
            // cycles) can exhaust it.
            const glowLayer = LayerSet.makeUnique();
            this.glowSo = global.scene.createSceneObject("Canvas Glow Camera");
            this.glowSo.layer = glowLayer;
            const cam = this.glowSo.createComponent("Component.Camera");
            cam.type = Camera.Type.Orthographic;
            cam.near = -1;
            cam.far = 200;
            cam.renderLayer = glowLayer;
            cam.devicePropertyUsage = this.cameraComp.devicePropertyUsage;
            if (!this.fullscreen) {
                cam.aspect = this.cameraComp.aspect;
            }
            cam.renderTarget = this.glowTexture;

            const glowRegionSo = global.scene.createSceneObject("Canvas Glow Region");
            glowRegionSo.setParent(this.glowSo);
            glowRegionSo.layer = glowLayer;
            glowRegionSo.createComponent("Component.ScreenTransform");
            const glowRegion = glowRegionSo.createComponent("Component.ScreenRegionComponent");
            glowRegion.region = ScreenRegionType.FullFrame;
            const blitSo = global.scene.createSceneObject("Canvas Glow Blit");
            blitSo.setParent(glowRegionSo);
            blitSo.layer = glowLayer;
            blitSo.createComponent("Component.ScreenTransform");
            const blitImg = blitSo.createComponent("Component.Image");
            blitImg.clearMaterials();
            blitImg.addMaterial(script.onscreenMaterial.clone());
            blitImg.stretchMode = StretchMode.Stretch;
            blitImg.mainPass.baseTex = this.glowBaseTexture;
            // OnScreenMaterial's baseTex sampler wraps (wrapMode: Repeat), which is wrong
            // for a blit: these quads sample the source over exactly [0,1], so a filter tap
            // landing outside returns the opposite edge and paints a bright column that is
            // not there. Override on the CLONE so the shared material asset stays untouched.
            blitImg.mainPass.samplers.baseTex.wrap = WrapMode.ClampToEdge;

            // Blur the downsampled glow at LOW resolution, then composite with a
            // 1-tap upscale — the multi-tap cost is paid on ~1.4% of the pixels.
            this.glowBlurTexture = global.scene.createRenderTargetTexture();
            this.glowBlurTexture.control.useScreenResolution = this.fullscreen;
            this.glowBlurTexture.control.resolutionScale = this.fullscreen ? GLOW_RESOLUTION_SCALE : 1;
            if (!this.fullscreen) {
                this.glowBlurTexture.control.resolution = new vec2(
                    Math.max(1, Math.ceil(this.size.x * GLOW_RESOLUTION_SCALE)),
                    Math.max(1, Math.ceil(this.size.y * GLOW_RESOLUTION_SCALE)));
            }
            this.glowBlurTexture.control.clearColorOption = ClearColorOption.CustomColor;
            this.glowBlurTexture.control.clearColor = new vec4(0, 0, 0, 0);
            this.glowBlurTexture.control.clearDepthEnabled = false;

            const blurLayer = LayerSet.makeUnique();
            this.glowBlurSo = global.scene.createSceneObject("Canvas Glow Blur Camera");
            this.glowBlurSo.layer = blurLayer;
            const blurCam = this.glowBlurSo.createComponent("Component.Camera");
            blurCam.type = Camera.Type.Orthographic;
            blurCam.near = -1;
            blurCam.far = 200;
            blurCam.renderLayer = blurLayer;
            blurCam.devicePropertyUsage = this.cameraComp.devicePropertyUsage;
            if (!this.fullscreen) {
                blurCam.aspect = this.cameraComp.aspect;
            }
            blurCam.renderTarget = this.glowBlurTexture;

            const blurRegionSo = global.scene.createSceneObject("Canvas Glow Blur Region");
            blurRegionSo.setParent(this.glowBlurSo);
            blurRegionSo.layer = blurLayer;
            blurRegionSo.createComponent("Component.ScreenTransform");
            const blurRegion = blurRegionSo.createComponent("Component.ScreenRegionComponent");
            blurRegion.region = ScreenRegionType.FullFrame;
            const blurBlitSo = global.scene.createSceneObject("Canvas Glow Blur Blit");
            blurBlitSo.setParent(blurRegionSo);
            blurBlitSo.layer = blurLayer;
            blurBlitSo.createComponent("Component.ScreenTransform");
            const blurBlit = blurBlitSo.createComponent("Component.Image");
            blurBlit.clearMaterials();
            blurBlit.addMaterial(script.gaussBlurMaterial.clone());
            blurBlit.stretchMode = StretchMode.Stretch;
            const bpass = blurBlit.mainPass;
            this.glowBlurPass = bpass;
            // The pass exposes `screenTexture` (input sampler), `Intensity` and
            // `blurFactor` — the graph Parameter nodes' ScriptNames. The capitalised
            // Texture/PixelSize/BlurFactor names GaussBlurMaterial.mat also lists are
            // dead: they are the code node's internal port names, and writing them is a
            // silent no-op. PixelSize needs no write anyway — the Texture 2D Object
            // Parameter node derives the texel step from the bound texture as an output.
            // A wrong name is silent, so check all three ONCE here, at build time, rather
            // than guarding each write: a missing screenTexture samples a magenta
            // missing-texture default and washes the frame, while a missing Intensity or
            // blurFactor leaves the halo stuck at the material's defaults and looks like a
            // tuning problem. _applyGlowParams then writes both names unguarded.
            if (bpass.screenTexture === undefined) {
                print("CanvasAPI: glow blur pass has no 'screenTexture' uniform - " +
                    "the halo will render as a magenta wash. Check GaussBlurMaterial.");
            }
            if (bpass.Intensity === undefined || bpass.blurFactor === undefined) {
                print("CanvasAPI: glow blur pass is missing 'Intensity' or 'blurFactor' - " +
                    "glow()'s intensity/radius arguments will do nothing. Check the " +
                    "GaussBlurShader parameter ScriptNames.");
            }
            bpass.screenTexture = this.glowTexture;
        }

        // Composite the base canvas + blurred halo into this.texture with one camera
        // (last in the chain, after main/downsample/blur). Every consumer — the on-screen
        // base Image AND any offscreen canvas drawn elsewhere via image(getTexture()) —
        // reads this.texture in both glow states, so the halo travels with the canvas by
        // a single unified path and no consumer has to re-fetch when glow toggles.
        //
        // Read-after-write: the main camera writes glowBaseTexture, so this composite is
        // this.texture's only writer and every consumer reads at a strictly later order.
        //
        // The camera does two full-frame blits into this.texture each frame:
        //   1. base   = glowBaseTexture             (Normal, copies rgb+alpha)
        //   2. + halo = glowBlurTexture             (Add, alpha write masked off)
        // giving out.rgb = base.rgb + glow.rgb, out.a = base.a. Preserving base alpha
        // is what makes the halo behave as true add-light when the on-screen Image
        // blends it over the camera (premultiplied-normal out = tex.rgb + cam*(1-tex.a)):
        // in a transparent halo region base.a=0 so out = cam + glow.rgb. Plain Add
        // would also raise alpha, occluding the camera and collapsing the bloom into
        // a faint fringe. this.texture is CustomColor-cleared to (0,0,0,0) while glow is
        // on (see the top of this method) so it does not accumulate across frames.
        if (!this.glowCompositeSo) {
            this.glowCompositeSo = global.scene.createSceneObject("Canvas Glow Composite Camera");
            const compLayer = LayerSet.makeUnique();
            this.glowCompositeSo.layer = compLayer;
            const compCam = this.glowCompositeSo.createComponent("Component.Camera");
            compCam.type = Camera.Type.Orthographic;
            compCam.near = -1;
            compCam.far = 200;
            compCam.renderLayer = compLayer;
            compCam.devicePropertyUsage = this.cameraComp.devicePropertyUsage;
            if (!this.fullscreen) {
                compCam.aspect = this.cameraComp.aspect;
            }
            compCam.renderTarget = this.texture;

            const compRegionSo = global.scene.createSceneObject("Canvas Glow Composite Region");
            compRegionSo.setParent(this.glowCompositeSo);
            compRegionSo.layer = compLayer;
            compRegionSo.createComponent("Component.ScreenTransform");
            const compRegion = compRegionSo.createComponent("Component.ScreenRegionComponent");
            compRegion.region = ScreenRegionType.FullFrame;

            // Blit 1: private base RT -> this.texture (copy rgb+alpha).
            const baseBlitSo = global.scene.createSceneObject("Canvas Glow Composite Base");
            baseBlitSo.setParent(compRegionSo);
            baseBlitSo.layer = compLayer;
            baseBlitSo.createComponent("Component.ScreenTransform");
            const baseImg = baseBlitSo.createComponent("Component.Image");
            baseImg.clearMaterials();
            baseImg.addMaterial(script.onscreenMaterial.clone());
            baseImg.stretchMode = StretchMode.Stretch;
            baseImg.mainPass.baseTex = this.glowBaseTexture;
            baseImg.mainPass.samplers.baseTex.wrap = WrapMode.ClampToEdge;  // see blit 0
            baseImg.mainPass.blendMode = BlendMode.Normal;
            baseImg.renderOrder = 0;

            // Blit 2: blurred halo -> this.texture (add-light, alpha write off).
            const compBlitSo = global.scene.createSceneObject("Canvas Glow Composite Blit");
            compBlitSo.setParent(compRegionSo);
            compBlitSo.layer = compLayer;
            compBlitSo.createComponent("Component.ScreenTransform");
            const compImg = compBlitSo.createComponent("Component.Image");
            compImg.clearMaterials();
            compImg.addMaterial(script.onscreenMaterial.clone());
            compImg.stretchMode = StretchMode.Stretch;
            compImg.mainPass.baseTex = this.glowBlurTexture;
            // Doubly important here: this is the upscale, so a wrapped tap is not even
            // softened by a later blur — it lands as a hard 1-2px column at the edge.
            compImg.mainPass.samplers.baseTex.wrap = WrapMode.ClampToEdge;
            compImg.mainPass.blendMode = BlendMode.Add;
            // Alpha-write policy differs by consumer:
            //  - on-screen: mask alpha OFF so base.a is preserved. The on-screen Image
            //    blends the canvas texture over the camera as add-light (out = tex.rgb +
            //    cam*(1-tex.a)); bumping alpha there would occlude the camera.
            //  - offscreen: mask alpha ON so the halo also writes coverage. Offscreen
            //    canvases are consumed via image()/sprite (premultiplied blend), which
            //    re-multiplies rgb by alpha — with alpha 0 the soft halo fringe over a
            //    transparent background would vanish. Writing alpha lets it carry.
            compImg.mainPass.colorMask = this.onScreenSo
                ? new vec4b(true, true, true, false)
                : new vec4b(true, true, true, true);
            compImg.renderOrder = 1;
        }

        // No on-screen Image re-pointing: it was bound to this.texture at creation and
        // this.texture is the composite destination, so the halo reaches the screen
        // without touching the consumer.
        // The chain now publishes this canvas's texture, so re-anchor the orders.
        this._applyRenderOrder();

        // Not unconditionally on: while the component is disabled the cameras must stay
        // off, and OnEnableEvent turns them back on from glowEnabled.
        this._syncGlowCameras();
    }

    _updateWorldCorners() {
        if (!this.regionSt) {
            return;
        }
        this.worldTL = this.regionSt.localPointToWorldPoint(new vec2(-1,1));
        this.worldTR = this.regionSt.localPointToWorldPoint(new vec2(1,1));
        this.worldBL = this.regionSt.localPointToWorldPoint(new vec2(-1,-1));
        this.worldBR = this.regionSt.localPointToWorldPoint(new vec2(1,-1));
        this.worldWidth = Math.abs(this.worldTR.x - this.worldTL.x);
        this.worldHeight = Math.abs(this.worldTL.y - this.worldBL.y);
        this.pixelSize = this.getSize().x / this.worldWidth;
    }
}

class CanvasManager {
    constructor() {
        this.unusedRTs = [];
        // Mirrors the ScriptComponent's own enabled state (see OnDisableEvent below).
        // _ensureGlow consults it so glow() cannot switch the glow cameras back on
        // while the component is disabled.
        this.componentEnabled = true;
        this.canvases = [];
        // Canvas render targets are stored PREMULTIPLIED (the vector shader outputs
        // rgb*alpha). image() consults this set so it doesn't premultiply them a second
        // time (which double-darkens partial-alpha content, e.g. a glow halo fringe).
        this.premultipliedTextures = new Set();

        // Device resolution workaround
        this.deviceResolution = new vec2(script.overlayRT.getWidth(), script.overlayRT.getHeight());
        this.selfAssignedOverlay = false;
        if (!global.scene.liveOverlayTarget) {
            global.scene.liveOverlayTarget = script.overlayRT;
            this.selfAssignedOverlay = true;
        }
        script.createEvent("OnStartEvent").bind(() => {
            if (global.deviceResolutionWorkaround) {
                this.deviceResolution = global.deviceResolutionWorkaround;
            } else {
                const overlay = global.scene.liveOverlayTarget;
                if (overlay) {
                    this.deviceResolution = new vec2(overlay.getWidth(), overlay.getHeight());
                    global.deviceResolutionWorkaround = this.deviceResolution;
                    if (this.selfAssignedOverlay) {
                        global.scene.liveOverlayTarget = null;
                    }
                }
            }
        });

        this.onScreenRootSo = global.scene.createSceneObject("Canvas OnScreen Root");
        this.onScreenRootSo.layer = scriptLayer;
        this.onScreenRootSo.createComponent("Component.ScreenTransform");
        this.onScreenRootSo.setParent(scriptSo);

        script.createEvent("OnDisableEvent").bind(() => {
            this.componentEnabled = false;
            // disable all rendering cameras, including the glow cameras (they are
            // root SceneObjects outside onScreenRootSo, so they would otherwise keep
            // blitting into their render targets while the component is disabled)
            for (const i in this.canvases) {
                const canvas = this.canvases[i];
                canvas.rendererSo.enabled = false;
                canvas._syncGlowCameras();
            }
            // disable on-screen canvases
            this.onScreenRootSo.enabled = false;
        });

        script.createEvent("OnEnableEvent").bind(() => {
            this.componentEnabled = true;
            // re-enable rendering cameras; restore each canvas's glow cameras only
            // when glow was left on (glowEnabled), so a noGlow()'d canvas stays off
            for (const i in this.canvases) {
                const canvas = this.canvases[i];
                canvas.rendererSo.enabled = true;
                canvas._syncGlowCameras();
            }
            // enable on-screen canvases
            this.onScreenRootSo.enabled = true;
        });
    }

    createCanvas(width=-1, height=-1) {
        return this._createCanvas({
            offscreen: true,
            fullscreen: (width==-1 && height==-1),
            width: width,
            height: height
        });
    }

    createOnScreenCanvas(width=-1, height=-1) {
        return this._createCanvas({
            offscreen: false,
            fullscreen: (width==-1 && height==-1),
            width: width,
            height: height
        });
    }

    _createCanvas(settings) {
        if (!settings.fullscreen && (settings.width > 0) != (settings.height > 0)) {
            // One dimension given: derive the other from the screen's aspect, so a
            // createOnScreenCanvas(1080) call gets a screen-shaped canvas instead of
            // an invalid render target.
            const sw = manager.deviceResolution.x != -1 ? manager.deviceResolution.x : script.overlayRT.getWidth();
            const sh = manager.deviceResolution.x != -1 ? manager.deviceResolution.y : script.overlayRT.getHeight();
            if (settings.width > 0) {
                settings.height = Math.round(settings.width * sh / sw);
            } else {
                settings.width = Math.round(settings.height * sw / sh);
            }
        }
        const canvas = new Canvas(settings.fullscreen, settings.width, settings.height);
        if (!settings.offscreen) {
            canvas.onScreenSo = global.scene.createSceneObject("Canvas Image");
            canvas.onScreenSo.setParent(this.onScreenRootSo);
            canvas.onScreenSo.layer = scriptLayer;
            canvas.onScreenSo.createComponent("Component.ScreenTransform");
            const imgComp = canvas.onScreenSo.createComponent("Component.Image");
            imgComp.clearMaterials();
            imgComp.addMaterial(script.onscreenMaterial.clone());
            imgComp.stretchMode = StretchMode.Stretch;
            imgComp.mainPass.baseTex = canvas.getTexture();
        }
        canvas.setRenderOrder(settings.offscreen?-10:0);
        this.canvases.push(canvas);
        return canvas;
    }

    destroyCanvas(canvas) {
        if (canvas.lateUpdateEvt) {
            script.removeEvent(canvas.lateUpdateEvt);
        }
        if (canvas.updateEvt) {
            script.removeEvent(canvas.updateEvt);
        }
        canvas.regionSt = null;
        if (canvas.onScreenSo) {
            canvas.onScreenSo.destroy();
        }
        // Destroy the composite camera before recycling canvas.texture below: it RENDERS
        // INTO canvas.texture, so it must stop before the RT re-enters the pool and is
        // bound to another canvas's main camera. _getOrCreateRenderTarget resets the
        // clear state this canvas left on it.
        if (canvas.glowCompositeSo) {
            canvas.glowCompositeSo.destroy();
        }
        if (canvas.glowBlurSo) {
            canvas.glowBlurSo.destroy();
        }
        if (canvas.glowSo) {
            canvas.glowSo.destroy();
        }
        if (canvas.rendererSo) {
            canvas.rendererSo.destroy();
        }
        if (canvas.texture) {
            this.unusedRTs.push(canvas.texture);
        }
        // The private base RT has a canvas texture's exact shape and clear policy (it came
        // from this pool), so hand it back for reuse instead of making the next canvas
        // allocate a full-res RT. Same trade as canvas.texture above: the pool keeps it
        // resident rather than releasing it. Safe here because the cameras that wrote it
        // are already destroyed above.
        if (canvas.glowBaseTexture) {
            this.unusedRTs.push(canvas.glowBaseTexture);
        }
        // The downsample/blur RTs are scaled by GLOW_RESOLUTION_SCALE, so they are not
        // shape-compatible with the pool. Drop every reference, plus the blur pass handle,
        // so nothing is retained past the canvas.
        canvas.glowTexture = null;
        canvas.glowBlurTexture = null;
        canvas.glowBaseTexture = null;
        canvas.glowBlurPass = null;
        // The seed blit is a child of the canvas region, so rendererSo.destroy() above
        // already took it with it; just drop the reference.
        canvas.glowMigrateSo = null;
        if (canvas.glowSeedEvt) {
            script.removeEvent(canvas.glowSeedEvt);
            canvas.glowSeedEvt = null;
        }
        canvas.glowSeedSource = null;

        if (canvas.gradientLuts) {
            canvas.gradientLuts.clear(); // drop cached LUT textures so they can be reclaimed
        }

        // Remove canvas from the canvases array
        const index = this.canvases.indexOf(canvas);
        if (index !== -1) {
            this.canvases.splice(index, 1);
        }
    }

    getUnusedRt(fullscreen, width, height) {
        for (let i=0; i<this.unusedRTs.length; i++) {
            const rt = this.unusedRTs[i];
            // Fullscreen RTs use device resolution, so getWidth()/getHeight() won't be -1.
            // Match them by the useScreenResolution flag instead.
            if (fullscreen) {
                if (rt.control.useScreenResolution) {
                    this.unusedRTs.splice(i, 1);
                    return rt;
                }
            } else if (!rt.control.useScreenResolution && rt.getWidth() == width && rt.getHeight() == height) {
                this.unusedRTs.splice(i, 1);
                return rt;
            }
        }

        return null;
    }
}

manager = new CanvasManager();
script.createCanvas = (width, height) => manager.createCanvas(width, height);
script.createOnScreenCanvas = (width, height) => manager.createOnScreenCanvas(width, height);
script.destroyCanvas = (canvas) => manager.destroyCanvas(canvas);
