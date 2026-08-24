// CanvasGradient.js
//
// Color gradients for the Canvas API. A gradient holds a geometry (linear,
// radial or conic) plus an ordered list of color stops, and resolves a color
// for any canvas-pixel coordinate via _evalAt(). Gradients are evaluated
// per-vertex in pixel space by the renderer, so no shader or texture is needed.

const TYPE_LINEAR = 'linear';
const TYPE_RADIAL = 'radial';
const TYPE_CONIC = 'conic';

const TWO_PI = Math.PI * 2;

// ---- Oklab color interpolation ---------------------------------------------
// Gradient stops are blended in Oklab (a perceptual color space) rather than raw
// sRGB. sRGB interpolation drags colors through a muddy gray midpoint at the wrong
// lightness (blue->yellow passes through gray); Oklab keeps lightness and chroma
// perceptually even, so blends stay clean. It interpolates on a straight line in
// L/a/b (NOT around the hue wheel like polar OkLCh), so near-complementary pairs
// (magenta<->green) fade through a muted neutral instead of detouring through
// unrelated hues. Stop colors are exact; only the blend changes. The cost is paid
// in the cached 256-entry LUT bake, so per-pixel sampling stays free.
function srgbToLinear(c) {
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function linearToSrgb(c) {
    return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}
function cbrt(x) {
    return x < 0 ? -Math.pow(-x, 1 / 3) : Math.pow(x, 1 / 3);
}
// sRGB vec4 -> Oklab { L, a, b }
function rgbToOklab(col) {
    const r = srgbToLinear(col.r), g = srgbToLinear(col.g), b = srgbToLinear(col.b);
    const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
    const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
    const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
    const l_ = cbrt(l), m_ = cbrt(m), s_ = cbrt(s);
    return {
        L: 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
        a: 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
        b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
    };
}
// Oklab { L, a, b } -> sRGB { r, g, b } in 0..1 (clamped to gamut)
function oklabToRgb(L, A, B) {
    const l_ = L + 0.3963377774 * A + 0.2158037573 * B;
    const m_ = L - 0.1055613458 * A - 0.0638541728 * B;
    const s_ = L - 0.0894841775 * A - 1.2914855480 * B;
    const l = l_ * l_ * l_, m = m_ * m_ * m_, s = s_ * s_ * s_;
    let r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    let b = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
    r = Math.max(0, Math.min(1, linearToSrgb(r)));
    g = Math.max(0, Math.min(1, linearToSrgb(g)));
    b = Math.max(0, Math.min(1, linearToSrgb(b)));
    return { r: r, g: g, b: b };
}
// Blend two stops on a straight line in Oklab at factor f. Alpha is linear.
function mixOklab(s0, s1, f) {
    const A = s0.lab, B = s1.lab;
    const rgb = oklabToRgb(
        A.L + (B.L - A.L) * f,
        A.a + (B.a - A.a) * f,
        A.b + (B.b - A.b) * f
    );
    const alpha = s0.color.a + (s1.color.a - s0.color.a) * f;
    return new vec4(rgb.r, rgb.g, rgb.b, alpha);
}

class CanvasGradient {
    constructor(type, geometry) {
        this.type = type;
        this.geometry = geometry;
        // Stops kept sorted by offset; each is { offset: number, color: vec4 }
        this.stops = [];
        // Memoized stop signature for the canvas-level LUT cache (see _signature);
        // cleared whenever the stops change.
        this._sig = null;
    }

    static linear(x0, y0, x1, y1) {
        return new CanvasGradient(TYPE_LINEAR, { x0, y0, x1, y1 });
    }

    static radial(x0, y0, r0, x1, y1, r1) {
        return new CanvasGradient(TYPE_RADIAL, { x0, y0, r0, x1, y1, r1 });
    }

    static conic(startAngle, x, y) {
        return new CanvasGradient(TYPE_CONIC, { startAngle, x, y });
    }

    /**
     * Adds a color stop. offset is clamped to [0, 1]; color must be a vec4
     * (normalized 0-1), e.g. from canvas.color(). Stops stay sorted by offset.
     * @param {number} offset - Position along the gradient in [0, 1]
     * @param {vec4} color - Stop color as a normalized vec4
     * @returns {CanvasGradient} this, for chaining
     */
    addColorStop(offset, color) {
        if (typeof offset !== 'number' || isNaN(offset) || !(color instanceof vec4)) {
            return this;
        }
        const clamped = Math.max(0, Math.min(1, offset));
        const stop = { offset: clamped, color, lab: rgbToOklab(color) };
        // Insertion sort keeps the small stop list ordered without a per-eval sort
        let i = this.stops.length;
        while (i > 0 && this.stops[i - 1].offset > clamped) {
            i--;
        }
        this.stops.splice(i, 0, stop);
        this._sig = null; // stops changed; new signature rebakes on next use
        return this;
    }

    /**
     * Resolves the gradient color at a canvas-pixel coordinate.
     * Falls back to opaque white when no stops are defined.
     * @param {number} px - X in canvas pixel space
     * @param {number} py - Y in canvas pixel space
     * @returns {vec4} The resolved color (normalized 0-1)
     */
    _evalAt(px, py) {
        if (this.stops.length === 0) {
            return new vec4(1, 1, 1, 1);
        }
        const t = this._paramAt(px, py);
        return this._colorAtParam(t);
    }

    _paramAt(px, py) {
        const g = this.geometry;
        if (this.type === TYPE_LINEAR) {
            const dx = g.x1 - g.x0;
            const dy = g.y1 - g.y0;
            const lenSq = dx * dx + dy * dy;
            if (lenSq < 1e-9) {
                return 0;
            }
            const t = ((px - g.x0) * dx + (py - g.y0) * dy) / lenSq;
            return Math.max(0, Math.min(1, t));
        }
        if (this.type === TYPE_RADIAL) {
            const dr = g.r1 - g.r0;
            if (Math.abs(dr) < 1e-9) {
                return 0;
            }
            const dx = px - g.x1;
            const dy = py - g.y1;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const t = (dist - g.r0) / dr;
            return Math.max(0, Math.min(1, t));
        }
        // Conic: sweep angle around the center, normalized to [0, 1)
        let angle = Math.atan2(py - g.y, px - g.x) - g.startAngle;
        angle = angle % TWO_PI;
        if (angle < 0) {
            angle += TWO_PI;
        }
        return angle / TWO_PI;
    }

    // Interpolates between the two stops bracketing t, in Oklab (clamped at the ends).
    _colorAtParam(t) {
        const stops = this.stops;
        if (t <= stops[0].offset) {
            return stops[0].color;
        }
        const last = stops[stops.length - 1];
        if (t >= last.offset) {
            return last.color;
        }
        for (let i = 0; i < stops.length - 1; i++) {
            const a = stops[i];
            const b = stops[i + 1];
            if (t <= b.offset) {
                const span = b.offset - a.offset;
                const f = span < 1e-9 ? 0 : (t - a.offset) / span;
                return mixOklab(a, b, f);
            }
        }
        return last.color;
    }

    /**
     * A cheap key identifying this gradient's color ramp (stops only; geometry and
     * type do not affect the baked LUT). The canvas uses it to share one LUT texture
     * across gradients with identical stops (see Canvas._lutForGradient), so
     * recreating the same gradient every frame does not re-bake a GPU texture.
     * @returns {string} signature
     */
    _signature() {
        if (this._sig !== null) {
            return this._sig;
        }
        let sig = '';
        for (let i = 0; i < this.stops.length; i++) {
            const st = this.stops[i], c = st.color;
            sig += st.offset.toFixed(4) + ':' + c.r.toFixed(3) + ',' + c.g.toFixed(3) + ',' + c.b.toFixed(3) + ',' + c.a.toFixed(3) + ';';
        }
        this._sig = sig;
        return sig;
    }

    /**
     * Bakes the stops into a 256x1 LUT texture (param t -> color) so the renderer can
     * sample the gradient PER-PIXEL via UVs, giving exact multi-stop fills on any shape
     * (matching HTML5 Canvas / p5). Interior stops land on the nearest of 256 texels
     * (a stop at offset 0.5 maps to texel 127.5, so it is reproduced to ~1 LSB, not
     * exactly). Callers should cache by _signature() rather than re-bake (Canvas does).
     * @returns {Texture} The LUT texture (row of 256 RGBA8 texels).
     */
    _bakeLUT() {
        const N = 256;
        const tex = ProceduralTextureProvider.createWithFormat(N, 1, TextureFormat.RGBA8Unorm);
        const data = new Uint8Array(N * 4);
        const denom = N - 1;
        const hasStops = this.stops.length > 0;
        for (let i = 0; i < N; i++) {
            const c = hasStops ? this._colorAtParam(i / denom) : new vec4(1, 1, 1, 1);
            data[i * 4 + 0] = Math.max(0, Math.min(255, Math.round(c.r * 255)));
            data[i * 4 + 1] = Math.max(0, Math.min(255, Math.round(c.g * 255)));
            data[i * 4 + 2] = Math.max(0, Math.min(255, Math.round(c.b * 255)));
            data[i * 4 + 3] = Math.max(0, Math.min(255, Math.round(c.a * 255)));
        }
        tex.control.setPixels(0, 0, N, 1, data);
        return tex;
    }
}

module.exports = { CanvasGradient };
