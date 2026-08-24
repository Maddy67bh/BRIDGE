/**
 * Canvas API for Lens Studio
 * A 2D drawing API inspired by Processing and p5.js
 */

/**
** IMPORTANT: All examples below assume Canvas API block name is "canvasAPI", use a different name when needed **
*/

/**
** IMPORTANT: When using Canvas API make sure that all code executes on start, which means that you need to create "OnStartEvent" event and call all initialization from there, especially, device real resolution is only available after "OnStartEvent" so any measurements done before it can be imprecise **
Example:
script.createEvent("OnStartEvent").bind(() => {
    // put initialization, canvas creation, screen size retrieval code here
    ...
});
*/

// ============================================================================
// DRAWING TEXT ON A CANVAS: READ THIS FIRST
// ============================================================================

// These rules cover ANY text drawn on a canvas: a HUD, letter tiles, a speech bubble, a leaderboard,
// a caption baked into an offscreen canvas used as a sprite texture. Only rule 3 is about the camera.
// The block guarantees one thing outright: text is NEVER painted below 0.011 *
// canvas.getHeight(), on every draw call including text(), so a layout cannot ship as specks. Where
// a rect cannot hold its string at that size the CONTENT gives way, wrapped or trimmed, and a box too
// small for one legible line spills past it and prints a warning. Five rules are left, and each one
// is something only you can decide.

// 1. BOUND EVERY STRING WITH textBox(), NOT text(). textBox(str, x, y, w, h, pad) wraps at the rect's
//    width and shrinks only as far as the legibility floor. text(str, x, y) has no rect, so it cannot be
//    bounded by anything: it draws one line wherever it lands, and a value one digit longer runs off the
//    frame. Reach for text() only for a string you have already measured and placed - a label before a
//    row of pips, a mark on a ruler, a caption anchored to a tracked point.
//    textBox() INSETS the rect you pass it unless you pass pad yourself, which changes the size the
//    string ends up at; THE PATTERN under TEXT LAYOUT has that arithmetic.
//    textBox's x, y is always the rect's TOP-LEFT. textAlign() positions the text INSIDE that rect,
//    never the rect around an anchor point: to right-align a readout, pass the full rect and
//    textAlign('right', ...), do not pass the right edge as x.

// 2. ONE SIZE FOR A GROUP OF PEERS. Peers are strings the reader compares - four answers, three stat
//    labels, a row of tiles. Fit each one to ITS OWN budget, take the SMALLEST answer and set that once.
//    A fitTextSize per string gives each string its own size, which reads as broken even when nothing
//    overflows. Fit a VALUE against the widest value it will ever hold ("1000000"), not against the one
//    it holds right now, or the HUD resizes itself as the number grows.
//    A FITTED SIZE IS A CEILING. fitTextSize() already returns the biggest size that fits, so never push
//    its answer back up with Math.max or a minimum of your own: that re-creates the exact overflow the
//    fit prevented, and the excess is trimmed to an ellipsis. If the fitted size looks
//    too small, the budget is too narrow - widen the budget or drop content, never inflate the size; for
//    an instruction sentence, dropping content means a SHORTER STRING, not a smaller box.
//    THE WIDTH YOU PASS IS THE WIDTH THE STRING WILL ACTUALLY GET, NOT THE ROW OR THE FRAME IT SITS IN.
//    The width you pass fitTextSize() and the w you pass textBox() for that string are the SAME number.
//    Fitting "SCORE 000" to the whole row and drawing it in half the row still ends in an ellipsis;
//    fitting two peers each to the whole row makes both row-sized and they draw superimposed. Divide
//    the row between its peers BEFORE fitting anything.
//    AND FIT ON BOTH AXES WHENEVER THE HEIGHT IS SPENT TOO. A width-only fit also spends HEIGHT, through
//    textLineHeight(), so a stack of individually legal rows runs off the bottom of the frame. Divide the
//    column FIRST and fit each slot on both axes; the stack under THE BUILDING BLOCKS is the worked example.
//    fitTextSize IS SINGLE-LINE: it answers for the whole string on ONE row. Text that will WRAP must
//    not be sized with it, or it comes back small enough to fit the entire caption across the width in
//    one line. Size wrapping text at 0.03 to 0.045 * getHeight() and let textBox() do the wrapping.

// 3. WHEN THE TEXT SITS OVER THE LIVE CAMERA, EVERY STRING EARNS ITS LEGIBILITY, ONE OF TWO WAYS, AND THE
//    OUTLINE IS THE DEFAULT. A REAL OUTLINE on the glyphs - strokeWeight about 0.09 * textSize, never
//    under 0.04 * textSize, against a contrasting fill - reads over anything the camera does and costs
//    none of the frame, so
//    reach for it first and reach for it most. A PLATE, a rounded panel at alpha >= 180 drawn FIRST and
//    under the string, is the answer for one string the outline cannot carry, or for a panel the lens
//    genuinely needs. The block draws neither for you. Bare text at the default hairline is never
//    acceptable: over a face it is unreadable. TEXT ON A CAMERA IS NOT A DASHBOARD OVER ONE: size a plate
//    from the TEXT, never from the region it sits in, and draw as few of them as the frame can be read with.

// 4. noStroke() BEFORE YOUR OWN SHAPES. A canvas starts with a 1px white stroke enabled, so a
//    hand-drawn rect or circle comes out with a white hairline round it.
//    THEN SET THE STROKE BACK. noStroke() persists, so the next string drawn after a shape has no
//    outline at all unless you re-arm it, which is a bare readout over live camera.

// 5. A WIDTH YOU GOT BY SUBTRACTION HAS TO COME OUT COMFORTABLY POSITIVE. fitTextSize() returns 0 and
//    textBox() draws nothing for a non-positive rect, and neither says a word, so a row that divided
//    badly is simply absent from the frame: the one layout mistake with no signal but the render.
//    Clamping to 0 does not rescue it, it only renames it - re-divide the row and draw FEWER things.

// ============================================================================
// CANVAS CREATION
// ============================================================================

// Create an offscreen canvas (for textures)
const offscreenCanvas = script.canvasAPI.createCanvas(500, 500);
const fullscreenOffscreen = script.canvasAPI.createCanvas(); // fullscreen

// Create an onscreen canvas (for display)
// Note that once a canvas is created its width and height are static so canvas.getWidth() and canvas.getHeight() won't change.
const fullscreenOnscreen = script.canvasAPI.createOnScreenCanvas(); // fullscreen

// Destroy canvas when done, also destroys the canvas texture
canvas.destroy();

// ============================================================================
// BASIC DRAWING SHAPES
// ============================================================================

// Line: line(x1, y1, x2, y2)
canvas.stroke(255);
canvas.strokeWeight(2);
canvas.line(0, 0, 100, 100);

// Circle: circle(x, y, diameter)
// x, y is the center of the circle
canvas.fill(255, 0, 0);
canvas.circle(100, 100, 50);

// Ellipse: ellipse(x, y, width, height)
// x, y is the center of the ellipse
canvas.fill(0, 255, 0);
canvas.ellipse(100, 100, 80, 50);

// Triangle: triangle(p1x, p1y, p2x, p2y, p3x, p3y)
canvas.fill(0, 0, 255);
canvas.triangle(100, 50, 50, 150, 150, 150); // Blue triangle

// Rectangle: rect(x, y, width, height, [r1], [r2], [r3], [r4])
// Optional corner radii: r1=top-left, r2=top-right, r3=bottom-right, r4=bottom-left
canvas.rect(10, 10, 100, 50);           // Simple rectangle
canvas.rect(10, 70, 100, 50, 10);       // All corners rounded
canvas.rect(10, 130, 100, 50, 10, 5, 0, 15); // Different corner radii

// ============================================================================
// COLORS AND STYLING
// ============================================================================

// Fill: fill(r, [g], [b], [a])
// If only one value: grayscale. Default alpha: 255
canvas.fill(255);           // White
canvas.fill(255, 0, 0);     // Red
canvas.fill(0, 255, 0, 128); // Semi-transparent green
canvas.noFill();            // Disable fill

// Stroke: stroke(r, [g], [b], [a])
canvas.stroke(255);           // White stroke
canvas.stroke(255, 0, 0);     // Red stroke
canvas.stroke(0, 255, 0, 128); // Semi-transparent green
canvas.noStroke();            // Disable stroke

// Stroke settings
canvas.strokeWeight(5);  // Line thickness in pixels
canvas.strokeCap('round');  // 'round' or 'square'
canvas.strokeJoin('miter'); // 'miter', 'bevel', or 'round'

// Background: background(r, [g], [b], [a])
// Fills entire canvas
canvas.background(255);           // White
canvas.background(0, 0, 0);       // Black
canvas.background(255, 0, 0, 128); // Semi-transparent red

// Create color value
const myColor = canvas.color(255, 0, 0);
canvas.fill(myColor);

// Color modes: RGB (default), HSB, HSL
canvas.colorMode('rgb', 255);  // RGB 0-255
canvas.colorMode('hsb', 360);  // HSB with hue 0-360
canvas.colorMode('hsl', 100);  // HSL 0-100
// After setting HSB:
canvas.fill(180, 360, 360); // Cyan in HSB

// Blend modes
canvas.blendMode('normal');    // Default blending
canvas.blendMode('add');       // Additive blending
canvas.blendMode('multiply');  // Multiply blending
canvas.blendMode('screen');    // Screen blending
canvas.blendMode('lighten');   // Keep the lighter color (alias 'lightest')
canvas.blendMode('darken');    // Keep the darker color (alias 'darkest')
// Unsupported modes log a warning and fall back to 'normal'.
//
// Note for 'add': a shape drawn as a CHAIN of separate line() calls puts a round
// cap at every joint, and in additive mode those caps composite over the line
// again, so the chain reads as a string of bright beads rather than one stroke.
// Draw a continuous stroke as a single beginShape()/vertex()/endShape(false)
// polyline instead.
//
// A single polyline is not enough on its own: a round JOIN also overlaps itself at
// every bend, so any stroke drawn at globalAlpha below 1 shows a bright hairline
// rung at each vertex even in 'normal' mode, where the doubled pixels resolve to
// 1-(1-a)^2. Measured on a 20 px stroke at alpha 0.6: body 119-131/255 with a 1 px
// ridge at 231. Use 'lighten' for any semi-transparent stroked path that crosses
// itself or its neighbours: it takes max(src, dst), so overlapping geometry cannot
// composite twice and the seams disappear. 'add' does not help here, it doubles too.
// Note that under 'lighten' a stroke at alpha below 1 resolves to max(src * a, dst),
// so it can be beaten by a brighter background - fade such a stroke by shrinking or
// darkening it rather than by dropping alpha if it must stay visible.

// Global alpha: a multiplier applied to every fill, stroke and image tint.
// Clamped to [0, 1]; invalid values reset it to 1.0 (opaque).
canvas.globalAlpha(0.4);  // Draw subsequent shapes at 40% opacity
canvas.globalAlpha(1.0);  // Back to fully opaque

// Anti-aliasing
canvas.fringeWidth(2.0);  // Default anti-aliasing
canvas.fringeWidth(0);    // Disable anti-aliasing

// Gradients: create a gradient, add color stops (offset 0-1, color from canvas.color()),
// then pass it to fill() or stroke(). Passing a normal color clears the gradient.
const lg = canvas.createLinearGradient(0, 0, canvas.getWidth(), 0); // start -> end point
lg.addColorStop(0, canvas.color(255, 0, 0));
lg.addColorStop(1, canvas.color(0, 0, 255));
canvas.fill(lg);
canvas.rect(0, 0, canvas.getWidth(), 100);

const rg = canvas.createRadialGradient(100, 100, 0, 100, 100, 80); // inner (x,y,r) -> outer (x,y,r)
// Concentric from the outer circle center: the inner circle center (x0,y0) is not used, so non-concentric/focal radial gradients are not supported.
rg.addColorStop(0, canvas.color(255, 255, 0));
rg.addColorStop(1, canvas.color(255, 0, 0));
canvas.fill(rg);
canvas.circle(100, 100, 160);

const cg = canvas.createConicGradient(0, 100, 100); // startAngle (in angleMode), center x, y
// The sweep goes clockwise from the start angle in canvas (Y-down) space, matching HTML5 conic gradients.
cg.addColorStop(0, canvas.color(255, 0, 0));
cg.addColorStop(1, canvas.color(255, 0, 0));
canvas.stroke(cg);   // gradients work for stroke too
canvas.strokeWeight(12);
canvas.noFill();
canvas.circle(100, 100, 160);

// Gradient notes:
// - A gradient is defined in the shape's LOCAL space, so it tracks push/translate/rotate/
//   scale/pop: it rotates and scales WITH the shape, matching HTML5 Canvas / p5.
// - Stops blend in Oklab (a perceptual color space), so a gradient stays clean through the
//   middle instead of the muddy gray sRGB produces. It blends on a straight line (not around
//   the hue wheel), so near-opposite colors (e.g. magenta<->green) fade through a muted
//   neutral rather than detouring through other hues. Stop colors are exact; only the blend changes.
// - Linear and radial FILL gradients are sampled per pixel (via a baked LUT), so the multi-stop
//   color ramp is exact on any shape, even a low-vertex one like a rect (no stops are lost). The
//   gradient PARAM is interpolated between vertices: a linear gradient is geometrically exact
//   everywhere, but a radial gradient's rings are only as round as the shape's vertices -- on a
//   low-vertex shape like a rect the radial falloff is faceted, not perfectly circular (fill a
//   many-vertex shape, e.g. a circle, for round rings).
// - Conic FILL gradients are sampled per VERTEX (no LUT), so filling a shape with one is
//   coarse: a filled circle shows a hard edge plus a center hub, not a soft glow. Use conic
//   on strokes or large many-vertex shapes; for a soft round glow prefer a radial gradient.
// - Fill-gradient LUT textures are cached per canvas by their stops, so recreating the same
//   gradient every frame is cheap (it reuses the baked texture). Gradients whose stops change
//   every frame still re-bake, so prefer stable stops in tight loops.
// - A gradient STROKE on a single straight line() interpolates only between the two endpoint
//   colors (a GPU vertex-color blend, not the per-pixel LUT), so multi-stop stroke gradients
//   need a multi-segment shape or curve to resolve their middle stops.
// - Text fill/stroke gradients are sampled once at the text anchor and applied as a flat
//   tint: an LS text fill is a single color, so a gradient cannot sweep across the glyphs.

// ============================================================================
// TRANSFORMATIONS
// ============================================================================

// Translate: translate(x, y)
canvas.translate(100, 50);
canvas.circle(0, 0, 25); // Circle appears at (100, 50)

// Rotate: rotate(angle)
// Angle in degrees or radians depending on angleMode
canvas.angleMode('degrees'); // Default
canvas.rotate(45); // Rotate 45 degrees

canvas.angleMode('radians');
canvas.rotate(Math.PI / 2); // Rotate π/2 radians

// Scale: scale(sx, [sy])
// If sy omitted, uses sx for uniform scaling
canvas.scale(2);       // Double size
canvas.scale(2, 0.5);  // Stretch horizontally, compress vertically
// NEGATIVE scale factors draw NOTHING

// Save/restore state: push() and pop()
canvas.push();
canvas.translate(100, 100);
canvas.rotate(45);
canvas.circle(0, 0, 25);
canvas.pop(); // Restore previous state

// Reset transformations
canvas.resetMatrix(); // Back to identity matrix

// Apply custom matrix
const customMatrix = mat3.identity();
canvas.applyMatrix(customMatrix);

// ============================================================================
// CUSTOM SHAPES
// ============================================================================

// Create custom shape with vertices
canvas.beginShape();
canvas.vertex(100, 100);
canvas.vertex(200, 100);
canvas.vertex(150, 200);
canvas.endShape(true); // true = close shape

// Bezier curves in shapes (p5.js compatible)
// bezierVertex(cp1x, cp1y, cp2x, cp2y, x, y)
// Draws a cubic bezier from the previous vertex to (x, y)
// cp1 = control point near previous vertex, cp2 = control point near new anchor
// Requires a preceding vertex() call
canvas.beginShape();
canvas.vertex(100, 100);
canvas.bezierVertex(150, 50, 200, 150, 250, 100);
canvas.endShape();

// Standalone bezier curve
canvas.bezier(50, 100, 100, 50, 200, 150, 250, 100);
// bezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2)

// Control bezier smoothness
canvas.bezierDetail(20); // Default: 20 segments (smooth)
canvas.bezierDetail(5);  // 5 segments (angular)

// ============================================================================
// IMAGES
// ============================================================================

// Draw image: image(texture, x, y, [w], [h], [sx], [sy], [sWidth], [sHeight])
canvas.image(myTexture, 0, 0);                      // Draw entire texture
canvas.image(myTexture, 0, 0, 200, 100);            // Scale to 200x100
canvas.image(myTexture, 0, 0, 50, 50, 100, 100, 50, 50); // Draw portion (sprite sheet)

// MIRRORING: negative scale factors and a negative destination w/h render NOTHING (back-face culled).
// mirror via negative sWidth/sHeight
canvas.image(myTexture, x, y, w, h, sx + sw, sy, -sw, sh);  // mirrored horizontally
canvas.image(myTexture, x, y, w, h, sx, sy + sh, sw, -sh);  // mirrored vertically

// Image positioning modes
canvas.imageMode('corner');  // x,y = top-left corner (default)
canvas.imageMode('center');  // x,y = center
canvas.imageMode('corners'); // x,y = top-left, w,h = bottom-right

// ============================================================================
// TEXT
// ============================================================================

// Draw text: text(str, x, y)
canvas.textSize(24);
canvas.textAlign('center', 'middle');
canvas.fill(255);
canvas.text("Hello World", width/2, height/2);
canvas.text(score, 10, 10); // Numbers are converted to strings

// Text alignment
canvas.textAlign('left', 'top');       // Top-left
canvas.textAlign('center', 'middle');  // Center
canvas.textAlign('right', 'bottom');   // Bottom-right

// Text with stroke (outline)
canvas.fill(255, 255, 0);
canvas.stroke(0);
canvas.strokeWeight(2);
canvas.text("Outlined Text", 100, 100);

// Fonts: textFont(selector) — sets the font for subsequent text() calls.
// Selector can be a style name, a font family name, a custom slot, or a style index (0-10).
// Matching is case-insensitive and ignores spaces/punctuation ('Art Deco' works).
canvas.textFont('headline');   // style name
canvas.text("BIG NEWS", width/2, 100);
canvas.textFont('Bangers');    // same font, selected by family name
canvas.textFont('custom1');    // user-provided font (if one was uploaded)
canvas.textFont('default');    // back to the default font (Fredoka)

// Available font styles (same set as the Text on Screen block):
// | style          | family       | look                    |
// |----------------|--------------|-------------------------|
// | 'regular'      | OpenSans     | clean sans-serif (bold) |
// | 'casual'       | Oswald       | condensed sans          |
// | 'headline'     | Bangers      | loud comic caps         |
// | 'comic'        | ComicNeue    | friendly comic          |
// | 'bold'         | RubikMonoOne | heavy mono block        |
// | 'playful'      | Fredoka      | rounded, soft (default) |
// | 'retro'        | OdibeeSans   | tall retro display      |
// | 'handwritten'  | GochiHand    | casual handwriting      |
// | 'grandElegant' | Rochester    | elegant script          |
// | 'artDeco'      | Limelight    | art-deco display        |
// | 'quirky'       | AmaticSC     | thin quirky caps        |
// Custom slots: 'custom1'..'custom4' — fonts the user uploaded (bound at build time).
// textSize() maps directly to the font's point size; fonts can differ slightly in
// visual size at the same textSize. Unknown names keep the current font.

// FONT: 'casual' is condensed but has the tallest line box (2.33x the size), so a stack in it costs more
// height per row. 'bold' reads as a debug overlay.

// TEXT LAYOUT (score / timer / question / answers / tiles / captions)
//
// A string's width depends on its value AND its font, so you can NOT hand-pick x offsets and hope they
// fit: labels overlap ("SCORE 0TIME 29") or run off the edge. measureText, textLineHeight, fitTextSize
// and textBox remove the guessing; their signatures are in the API reference below.
//
// textBox() INSETS THE RECT YOU PASS IT. Omit pad and it takes 0.16 of the box's SHORTER side off EACH
// side, so a box built to exactly one line keeps 68% of a line inside it and the string draws at 68% of
// the size you just fitted; a row at the default size lands on the floor that way. Pass the pad
// EXPLICITLY and fit the INNER box - fitTextSize(str, w - 2 * pad, h - 2 * pad), then
// textBox(str, x, y, w, h, pad).
//
// THE PATTERN. Decide the rect first, fit the type to the rect MINUS the pad, then draw into that same
// rect with that same pad. Three steps, in this order, every time:
var W = canvas.getWidth();
var H = canvas.getHeight();
var margin = Math.round(Math.min(W, H) * 0.045);       // keep off the cropped edge

// 1. THE RECT. Take it from the canvas, not from numbers you invented.
var rowW = W - 2 * margin;

// 2. THE SIZE, fitted to that rect and set ONCE.
canvas.textSize(canvas.fitTextSize("SCORE 1000000", rowW));   // the WIDEST value, not the current one
var rowH = canvas.textLineHeight();                           // exactly as tall as one line needs

// 3. THE OUTLINE, THEN THE TEXT, in the same rect at pad 0 so the fit and the box agree exactly.
canvas.stroke(0, 0, 0, 217);
canvas.strokeWeight(canvas.textSize() * 0.09);
canvas.fill(255, 255, 255);
canvas.textBox("SCORE " + score, margin, margin, rowW, rowH, 0);

// A BLOCK OF PROSE - a question, a caption, a hint. Pass the WHOLE string and let it wrap; do not split it
// into lines yourself, and do not size it with fitTextSize. Count the lines the
// string needs and give the box exactly those.
var qy = margin + Math.round(rowH * 1.28);             // one row below the readout above
var qLines = Math.max(1, Math.ceil(canvas.measureText(question) / rowW));
canvas.textBox(question, margin, qy, rowW, qLines * canvas.textLineHeight(), 0);

// Use ONE font for the whole lens, set before you fit: textFont() changes every width, and two fonts in
// one HUD read as two HUDs.
//
// ============================================================================
// TEXT LAYOUT: THE BUILDING BLOCKS
// ============================================================================

// --- GEOMETRY, continuing from the pattern above (W, H, margin, rowH). There is no safe-area call, so
// the safe rect comes off the canvas.
var safe = { x: margin, y: margin, w: W - 2 * margin, h: H - 2 * margin };
var gut = Math.round(rowH * 0.28);

// --- TWO HELPERS, SEPARATE ON PURPOSE: size() chooses type, outline() makes it legible over the camera.
// Both calls account for the outline armed WHEN THEY RUN, so arm it before fitting, not after.
// The glyph colour is yours; the outline comes out opposite, which is why it reads over anything.
// Text drawn into an OFFSCREEN canvas needs the same fitting and no outline: nothing moves behind it.
function size(px) {
    canvas.textSize(px);
    canvas.strokeWeight(px * 0.09);
}
function isLight(r, g, b) { return 0.2126 * r + 0.7152 * g + 0.0722 * b > 128; }
function outline(r, g, b) {
    if (r === undefined) { r = 255; g = 255; b = 255; }
    canvas.fill(r, g, b);
    if (isLight(r, g, b)) { canvas.stroke(0, 0, 0, 217); }
    else { canvas.stroke(255, 255, 255, 217); }
}

// --- ONE SIZE SCALE FOR THE WHOLE FRAME, DECIDED ONCE, before anything draws. Every draw picks an entry.
// Where a group needs its own fit, fit the group's widest member and store it as one more entry.
// At most four entries in a frame, and the most important string gets the biggest one.
var TYPE = {};
TYPE.hero = canvas.fitTextSize(widestHero, safe.w, safe.h * 0.16);   // the one value the lens is about
var rowShare = (safe.w - gut) / 2;      // peers on one row SPLIT the row; two readouts -> two budgets
TYPE.row = Math.min(TYPE.hero * 0.45, canvas.fitTextSize(widestRow, rowShare));
TYPE.label = TYPE.row * 0.62;                                        // labels are about rows, so smaller

// --- EXAMPLE: A STACK OF ROWS - answers, a leaderboard. SPEND ROWS, NOT SIZE: cap the count by what one
// legible row needs and draw FEWER rows, then divide the band between the rows that survived, then fit
// each slot on BOTH axes and take the smallest answer as the shared size. A row squeezed to make the
// whole list fit is a row nobody can read.
rowH = canvas.textLineHeight();   // re-derive after ANY textSize() change, including size()
var stackH = safe.h * 0.45, rowGut = Math.round(stackH * 0.04);
var n = Math.min(items.length, Math.floor((stackH + rowGut) / (rowH + rowGut)));
var slotH = (stackH - (n - 1) * rowGut) / n;
var stackY = safe.y + (safe.h - stackH) / 2;      // the band the stack occupies, centred in safe
var px = Infinity;
for (var i = 0; i < n; i++) { px = Math.min(px, canvas.fitTextSize(items[i], safe.w, slotH)); }
TYPE.item = px;
size(TYPE.item); outline();
canvas.textAlign('left', 'middle');
for (var i = 0; i < n; i++) {
    canvas.textBox(items[i], safe.x, stackY + i * (slotH + rowGut), safe.w, slotH, 0);
}

// --- LAST RESORT: A BACKING PLATE. Size it from the text - measured width plus both pads, one line plus
// both pads - never from a region, or the line sits marooned in a slab. The plate colour is yours; it
// hands back the glyph colour and outline that read on it, so do not set fill() again after calling it.
function plate(x, y, w, h, r, pr, pg, pb, pa) {
    if (!(w > 0) || !(h > 0)) { return; }
    var radius = (r === undefined || r === null) ? Math.min(h * 0.42, w * 0.5) : r;
    canvas.noStroke();
    canvas.fill(pr, pg, pb, pa);
    canvas.rect(x, y, w, h, radius);
    if (isLight(pr, pg, pb)) { outline(12, 13, 18); }
    else { outline(255, 255, 255); }
}
var pad = Math.round(rowH * 0.28);
var plateW = canvas.measureText(title) + 2 * pad;
plate(safe.x, safe.y, plateW, rowH + 2 * pad, null, 8, 9, 14, 214);
canvas.textBox(title, safe.x, safe.y, plateW, rowH + 2 * pad, pad);   // same rect, same pad: exact fit

// ============================================================================
// GLOW / BLOOM
// ============================================================================

// glow() adds a soft, round additive bloom: pixels bleed a halo. Because it is
// additive it reads best on a dark or transparent background, and it suits neon,
// lightning, sparks, and glowing UI. Its cost is independent of how many shapes you
// draw. glow(intensity, radius) takes two optional args: a brightness multiplier
// (>= 0, default 1) and a halo width multiplier (clamped to 0.3 tight - 1.6 wide,
// default 1).

// glow() is NOT a thresholded bloom -- it does not pick out only the bright
// pixels. It blurs the WHOLE canvas and adds it back, so every pixel is
// brightened by its own surroundings. In a large flat area the result is about
// base * (1 + intensity): a mid-grey fill at glow(1.4) comes out near white.
//
// Practical rule: give glowing content its OWN canvas. Do not enable glow() on a
// canvas that also holds artwork you want left alone -- that artwork will wash
// out. Draw the glowing shapes on a dedicated canvas over a dark or transparent
// background and composite it with image(canvas.getTexture(), ...).

const glowCanvas = script.canvasAPI.createOnScreenCanvas();
glowCanvas.glow();           // enable the bloom (call once; it persists across frames)
// glowCanvas.glow(2.0);     // brighter bloom
// glowCanvas.glow(1.0, 1.6); // same brightness, widest halo
// glowCanvas.noGlow();      // disable it later
// glow(0) keeps the whole blur chain running while contributing nothing (measured
// pixel-identical to never calling glow()), so switch the effect off with noGlow().

// glow() works on both on-screen (createOnScreenCanvas) and offscreen
// (createCanvas) canvases: the halo is baked into the canvas's own texture, so an
// offscreen canvas drawn elsewhere with image(canvas.getTexture(), ...) carries
// its glow too, over any background (transparent or opaque). getTexture() returns the
// same texture object whether or not glow is on, so it can be cached in any order
// relative to glow() / noGlow(). On-screen canvases glow over a transparent background
// as well (glow over the camera). The halo scales with a pixel's own brightness (there
// is no cutoff -- see the note above), so draw bright strokes/fills over a dark or
// transparent background:
const gw = glowCanvas.getWidth(), gh = glowCanvas.getHeight();
glowCanvas.background(8, 8, 16);     // dark bg (or background(0,0,0,0) to glow over the camera)
glowCanvas.stroke(120, 230, 255);   // bright neon stroke
glowCanvas.strokeWeight(4);
glowCanvas.line(gw * 0.2, gh * 0.3, gw * 0.8, gh * 0.7);

// Reuse one glowing canvas rather than creating and destroying them in a loop: each
// glowing canvas permanently claims 3 render layers (the supply is ~65,000, so only an
// unbounded loop can exhaust it). Keep one alive and clear/redraw it, or noGlow() it.
// glow() also roughly doubles the canvas's render-target memory, and noGlow() frees
// none of it (so re-enabling is cheap).

// A canvas's render order is when its texture becomes readable, glowing or not: glow()
// uses the 3 orders BEFORE the canvas's own for its downsample, blur and composite, so
// anything that reads this canvas at a later order still sees the current frame.
// That shift applies to what a glowing canvas READS too: its own drawing, including
// image() of another canvas, happens 3 orders before its number. So leave 4 orders
// between a producer and a GLOWING consumer, not 1, or the consumer samples the
// producer's previous frame. The defaults are already 10 apart (-10 offscreen, 0
// on-screen), so this only comes up if you set both orders by hand.

// Making the glow actually READ. Five limits that are easy to hit:
//
// 1. Minimum feature size. The blur runs at 12% of the canvas resolution, so a
//    stroke thinner than roughly 10 px at full resolution is sub-pixel once
//    blurred and bleeds almost no halo. Measured on a 720x1280 canvas: a 3 px
//    neon stroke stayed nearly flat, the same stroke at 10 px read as a lit
//    filament. Draw glowing detail thick, or scale the whole drawing up.
//
// 2. On an ON-SCREEN canvas the camera is the background, and the camera is
//    usually bright. Additive light adds nothing visible to an already-bright
//    pixel: a full-screen effect over a sunlit selfie measured a mean lift of
//    about 3/255, effectively invisible. Dim the camera first, on a SEPARATE
//    non-glowing canvas at a LOWER render order (a dark radial vignette drawn
//    once works well). Do NOT darken with a fill on the glowing canvas itself:
//    that fill is blurred and added back to itself, which brightens the frame
//    instead of darkening it.
//
// 3. radius trades halo width for brightness, it does not add energy. The blur
//    conserves energy, so at the same intensity glow(i, 0.4) gives a narrow
//    BRIGHT halo and glow(i, 1.6) a wide soft one. For punch go tighter and
//    raise intensity, not wider.
//
// 4. intensity scales halo BRIGHTNESS, not halo REACH, and it clips. Measured on
//    a 720x1280 canvas at radius 1.6, the halo around a bright stroke is gone by
//    about 45 px from it, and every pixel past that is identical with glow on and
//    off; raising intensity from 3 to 9 only saturated the near band to white. The
//    reach is a roughly fixed pixel budget (about 55 px on a 256x256 canvas at
//    radius 1.0), not a fraction of the canvas. To make a glow cover real area,
//    widen or multiply the glowing CONTENT so those bands overlap.
//
// 5. TEXT glows well, and the glyph style decides whether it stays readable. On a
//    dark canvas at glow(3.0, 1.0), filled text lifted its band mean by 17/255 at
//    textSize 34 and 55 at 64. Filled text past roughly textSize 100 starts to
//    fill in: two thirds of the band went past 50/255 and the counters closed up.
//    An OUTLINED glyph - a real stroke with a DARK fill, which is the recommended
//    style for camera legibility anyway - blooms only on the rim (12% of the band
//    past 50/255 versus 40% for filled text at the same size), so it reads as a
//    neon sign and stays legible. Stroke-only with noFill() is the brightest sign
//    look. Small text still blooms proportionally (textSize 18 gained about 4 halo
//    pixels per lit pixel) but its absolute lift is only about 5/255, so it needs
//    a dark background - see limit 2.

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Get canvas properties
const texture = canvas.getTexture(); // Returns Asset.Texture
const size = canvas.getSize();       // Returns vec2(width, height)
const width = canvas.getWidth();     // Returns number
const height = canvas.getHeight();   // Returns number

// Use canvas texture on sprite
sprite.texture = canvas.getTexture();

// Convert touch coordinates to canvas pixel coordinates (this only works when the canvas is stretched on the entire screen)
// Touch coords from touchManager are normalized (0-1)
script.touchManager.onTouchDown.add((id, x, y) => {
    const pixelPos = new vec2(x, y).mult(canvas.getSize());
    // Now pixelPos is in canvas pixel coordinates
});

// ============================================================================
// STRING CONSTANTS
// ============================================================================

// All functions accept string literals

// Line caps
'round'   // Rounded line endpoints
'square'  // Square line endpoints

// Line joins
'miter'  // Sharp corners
'bevel'  // Beveled corners
'round'  // Rounded corners

// Color modes
'rgb'  // Red, Green, Blue (default)
'hsb'  // Hue, Saturation, Brightness
'hsl'  // Hue, Saturation, Lightness

// Angle modes
'degrees'  // Angles in degrees (default)
'radians'  // Angles in radians

// Blend modes
'normal'    // Standard blending (default)
'add'       // Additive blending
'multiply'  // Multiply blending
'screen'    // Screen blending
'lighten'   // Keep the lighter color (alias 'lightest')
'darken'    // Keep the darker color (alias 'darkest')

// Image modes
'corner'   // Position from corner (default)
'center'   // Position from center
'corners'  // Position from opposite corners

// Text alignment - Horizontal
'left'    // Left aligned
'center'  // Center aligned
'right'   // Right aligned

// Text alignment - Vertical
'top'     // Top aligned
'middle'  // Middle aligned
'bottom'  // Bottom aligned

// Font styles (textFont) — also accepts family names and 'custom1'..'custom4'
'regular' 'casual' 'headline' 'comic' 'bold' 'playful'
'retro' 'handwritten' 'grandElegant' 'artDeco' 'quirky'
'default'  // restore the default font

// ============================================================================
// COMMON PATTERNS
// ============================================================================

// Pattern: Drawing centered shapes
const w = canvas.getWidth();
const h = canvas.getHeight();
canvas.translate(w/2, h/2);
canvas.circle(0, 0, 100); // Circle at canvas center (after translate)

// Pattern: Rotating around a point
canvas.push();
canvas.translate(200, 200);
canvas.rotate(45);
canvas.rect(-25, -25, 50, 50); // Draw centered on rotation point
canvas.pop();

// Pattern: Animating canvas
script.createEvent("UpdateEvent").bind(() => {
    canvas.background(255,255,255,0);
    const time = getTime();
    const x = width/2 + Math.sin(time * 2) * 100;
    const y = height/2 + Math.cos(time * 2) * 100;
    canvas.circle(x, y, 50); // Circle follows circular path around center
});

// Pattern: Creating healthbar
function drawHealthbar(canvas, x, y, w, h, healthPercent) {
    canvas.noStroke();
    // Background (red)
    canvas.fill(180, 50, 50);
    canvas.rect(x, y, w, h, h * 0.5);
    // Foreground (green)
    canvas.fill(50, 255, 50);
    canvas.rect(x, y, w * healthPercent, h, h * 0.5);
    // Border
    canvas.noFill();
    canvas.strokeWeight(2);
    canvas.stroke(255);
    canvas.rect(x, y, w, h, h * 0.5);
}

// Pattern: Using offscreen canvas for sprite textures
// Note that we add some padding to the canvas size so stroke will not be cut by the boundaries
const pad = 4;
const myCanvas = script.canvasAPI.createCanvas(200+2*pad, 200+2*pad);
myCanvas.background(255, 0, 0);
myCanvas.fill(255, 255, 0);
myCanvas.circle(0.5*myCanvas.getWidth(), 0.5*myCanvas.getHeight(), 80); // Centered circle

const sprite = script.spriteMgr.createSprite("MySprite");
sprite.texture = myCanvas.getTexture();
sprite.size = myCanvas.getSize();
sprite.position = new vec2(540, 960);

// Pattern: Full-screen HUD / overlay (resolution-independent)
// Draw the HUD into a FIXED-SIZE offscreen canvas and stretch it onto a full-screen sprite.
// Size and position everything off the canvas's OWN dimensions so the HUD looks identical on
// every device. Do NOT derive draw sizes (including textSize) from getScreenSize()/device pixels —
// that couples the layout to device resolution and makes text overflow on low-resolution devices.
const hud = script.canvasAPI.createCanvas(1080, 1920);   // fixed logical canvas; pick any size/aspect
const HW = hud.getWidth(), HH = hud.getHeight();         // fixed — these never change with resolution
function tx(frac) { return HW * frac; }                  // x as a fraction of the canvas
function ty(frac) { return HH * frac; }                  // y as a fraction of the canvas
function ts(frac) { return HH * frac; }                  // text size as a fraction of the canvas height
const hudSprite = script.spriteMgr.createSprite("HUD");
hudSprite.texture = hud.getTexture();
hudSprite.size = script.spriteMgr.getScreenSize();       // sprite uses screen space; the canvas does NOT
hudSprite.position = script.spriteMgr.getScreenSize().mult(new vec2(0.5, 0.5));
function drawHud() {
    hud.background(0, 0, 0, 0);
    // Button sized as a fraction of the canvas — identical relative size on every device
    hud.fill(255); hud.rect(tx(0.25), ty(0.45), tx(0.50), ty(0.10), ty(0.05));
    hud.fill(0); hud.textAlign('center', 'middle');
    hud.textSize(ts(0.045));                             // NOT ts(...) * any screen-derived scale
    hud.text("TAP TO START", tx(0.5), ty(0.5));
}
drawHud();

// Pattern: Dynamic canvas (updates each frame)
const dynamicCanvas = script.canvasAPI.createCanvas(300, 300);
script.createEvent("UpdateEvent").bind(() => {
    dynamicCanvas.background(255, 255, 255, 0);
    dynamicCanvas.fill(255);
    dynamicCanvas.textSize(12);
    dynamicCanvas.text("Score: " + score, 150, 150);
    // Sprite texture automatically updates
});
sprite.texture = dynamicCanvas.getTexture();

// Pattern: Custom shape (polygon)
canvas.beginShape();
for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    canvas.vertex(x, y);
}
canvas.endShape(true); // Close shape

// Pattern: Bezier curve shape
canvas.beginShape();
canvas.vertex(100, 200);
canvas.bezierVertex(100, 100, 200, 100, 200, 200);
canvas.bezierVertex(200, 300, 300, 300, 300, 200);
canvas.endShape();

// ============================================================================
// COMPLETE API REFERENCE
// ============================================================================

/**
 * Canvas Creation (CanvasManager)
 */
script.canvasAPI.createCanvas(width, height)        // Offscreen canvas (texture)
script.canvasAPI.createOnScreenCanvas()             // Creates full-screen, onscreen canvas (display)
canvas.destroy()                                     // Clean up resources

/**
 * Canvas Properties
 */
canvas.getTexture()   // Returns Asset.Texture - render target
canvas.getSize()      // Returns vec2 - canvas dimensions
canvas.getWidth()     // Returns number - canvas width
canvas.getHeight()    // Returns number - canvas height

/**
 * Basic Shapes
 */
canvas.line(x1, y1, x2, y2)              // Draw line
canvas.triangle(p1x, p1y, p2x, p2y, p3x, p3y) // Draw triangle from three vertices
canvas.circle(x, y, diameter)            // Draw circle (x,y = CENTER of circle)
canvas.ellipse(x, y, width, height)      // Draw ellipse (x,y = CENTER of ellipse)
canvas.rect(x, y, w, h, [r1], [r2], [r3], [r4]) // Draw rectangle (x,y = top-left, optional corner radii)

/**
 * Fill and Stroke
 */
canvas.fill(r, [g], [b], [a])      // Set fill color (g,b,a optional), fill color is also used as image tint color; pass a gradient to fill with it
canvas.noFill()                    // Disable fill
canvas.stroke(r, [g], [b], [a])    // Set stroke color (g,b,a optional); pass a gradient to stroke with it
canvas.noStroke()                  // Disable stroke
canvas.globalAlpha(a)              // Set global alpha multiplier in [0,1] for all fills, strokes and image tints
canvas.strokeWeight(weight)        // Set stroke thickness in pixels
canvas.strokeCap(cap)              // Set line cap: 'round' or 'square'
canvas.strokeJoin(join)            // Set line join: 'miter', 'bevel', or 'round'
canvas.fringeWidth(width)          // Set anti-aliasing width (default: 2.0)

/**
 * Background
 */
canvas.background(r, [g], [b], [a]) // Fill entire canvas with color

/**
 * Color Utilities
 */
canvas.color(r, [g], [b], [a])     // Create color value (returns vec4)
canvas.colorMode(mode, [maxValue]) // Set color mode: 'rgb', 'hsb', or 'hsl'

/**
 * Gradients — create, add stops (offset 0-1 + color), then pass to fill()/stroke()
 */
canvas.createLinearGradient(x0, y0, x1, y1)             // Gradient along a line (start -> end)
canvas.createRadialGradient(x0, y0, r0, x1, y1, r1)     // Gradient between two circles (inner -> outer)
canvas.createConicGradient(startAngle, x, y)            // Angular sweep; startAngle uses the current angleMode
gradient.addColorStop(offset, color)                    // offset 0-1, color from canvas.color()

/**
 * Blend Modes
 */
canvas.blendMode(mode) // Set blend mode: 'normal', 'add', 'multiply', 'screen', 'lighten'/'lightest', 'darken'/'darkest'

/**
 * Transformations
 */
canvas.translate(x, y)       // Move coordinate system
canvas.rotate(angle)         // Rotate coordinate system (clockwise)
canvas.scale(sx, [sy])       // Scale coordinate system (sy defaults to sx)
canvas.push()                // Save current transform state
canvas.pop()                 // Restore saved transform state
canvas.resetMatrix()         // Reset to identity (no transforms)
canvas.applyMatrix(matrix)   // Apply custom mat3 matrix
canvas.angleMode(mode)       // Set angle mode: 'degrees' or 'radians'

/**
 * Custom Shapes
 */
canvas.beginShape()            // Start recording shape vertices
canvas.vertex(x, y)            // Add vertex to shape
canvas.bezierVertex(cp1x, cp1y, cp2x, cp2y, x, y) // Cubic bezier from previous vertex to (x,y), requires preceding vertex()
canvas.endShape([close])       // Finish and draw shape (close = true to close)
canvas.bezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2) // Draw standalone bezier curve
canvas.bezierDetail(detail)    // Set bezier curve smoothness (segments)

/**
 * Images
 */
canvas.image(texture, x, y, [w], [h], [sx], [sy], [sWidth], [sHeight])
// Draw texture at position with optional scaling and source cropping
canvas.imageMode(mode) // Set image positioning: 'corner', 'center', or 'corners'
// Fill color will be used as image tint color, so to render the image fully opaque with its original colors make sure fill color is set to white like so:
canvas.fill(255)
// fill()/stroke()/background() are 0-255. A color/vec4 SCRIPT INPUT arrives 0-1, so passing it
// straight through gives a near-black, ~0.4%-alpha tint and the image renders invisible - a
// silent black screen, no error. Always scale, or switch the canvas to 0-1 once:
canvas.fill(c.r * 255, c.g * 255, c.b * 255, c.a * 255);  // canvas stays 0-255

/**
 * Text
 */
canvas.text(str, x, y)              // Draw text (str can be string or number)
canvas.textSize([size])             // Set text size in pixels; with NO argument returns the current size
canvas.textAlign(horizAlign, [vertAlign]) // Set text alignment
canvas.measureText(str)             // Rendered width of str in canvas pixels at current textSize/textFont (no draw)
canvas.fitTextSize(str, w, [h])     // Largest textSize at which str fits in w (and h, if given); no draw, does not set textSize
canvas.textLineHeight()             // Height ONE line needs at the current textSize/textFont; use it to size a row or a plate
canvas.textBox(str, x, y, w, h, [pad]) // Draw str bounded by the box: wraps at its width, floors the size and ellipsizes rather than going under it; textSize is a ceiling, pad insets per side

/**
 * Glow / Bloom
 */
canvas.glow([intensity], [radius])  // Enable a soft additive bloom (on-screen and offscreen; intensity >= 0, default 1; radius 0.3-1.6, default 1)
canvas.noGlow()  // Disable the glow

/**
 * String Constants (use directly)
 */
// Line caps
'round', 'square'

// Line joins
'miter', 'bevel', 'round'

// Color modes
'rgb', 'hsb', 'hsl'

// Angle modes
'degrees', 'radians'

// Blend modes
'normal', 'add', 'multiply', 'screen', 'lighten', 'lightest', 'darken', 'darkest'

// Image modes
'corner', 'center', 'corners'

// Text alignment - Horizontal
'left', 'center', 'right'

// Text alignment - Vertical
'top', 'middle', 'bottom'

// ============================================================================
// EXAMPLE: COMPLETE DRAWING
// ============================================================================

// Create canvas
const canvas = script.canvasAPI.createCanvas(500, 500);

// Setup
canvas.background(255);
canvas.noStroke();

// Draw red circle (x,y is the center)
canvas.fill(255, 0, 0);
canvas.circle(100, 100, 80);

// Draw green rectangle with rounded corners
canvas.fill(0, 255, 0);
canvas.rect(200, 200, 100, 50, 10);

// Draw blue triangle
canvas.fill(0, 0, 255);
canvas.triangle(300, 300, 400, 300, 350, 400);

// Draw text
canvas.fill(0);
canvas.textSize(24);
canvas.textAlign('center', 'middle');
canvas.text("Hello Canvas!", 250, 250);

// Use canvas as sprite texture
const sprite = script.spriteMgr.createSprite("MySprite");
sprite.texture = canvas.getTexture();
sprite.size = canvas.getSize();
sprite.position = script.spriteMgr.getScreenSize().mult(new vec2(0.5, 0.5));

// ============================================================================
// EXAMPLE: CUSTOM JOYSTICK
// ============================================================================

const joystickSize = 200;
const joystickCanvas = script.canvasAPI.createCanvas(joystickSize, joystickSize);
const joystickSprite = script.spriteMgr.createSprite("Joystick");
joystickSprite.texture = joystickCanvas.getTexture();
joystickSprite.size = joystickCanvas.getSize();
joystickSprite.position = new vec2(150, 1700);
joystickSprite.alpha = 0.7;

function drawJoystick(knobOffsetX, knobOffsetY) {
    const centerX = joystickSize * 0.5;
    const centerY = joystickSize * 0.5;
    const radius = joystickSize * 0.4;
    const knobRadius = radius * 0.4;
    
    joystickCanvas.background(255, 255, 255, 0);
    
    // Outer circle
    joystickCanvas.noFill();
    joystickCanvas.strokeWeight(4);
    joystickCanvas.stroke(255, 255, 255, 150);
    joystickCanvas.circle(centerX, centerY, radius * 2);
    
    // Knob
    const knobX = centerX + knobOffsetX * (radius - knobRadius);
    const knobY = centerY + knobOffsetY * (radius - knobRadius);
    joystickCanvas.fill(255, 255, 255, 200);
    joystickCanvas.noStroke();
    joystickCanvas.circle(knobX, knobY, knobRadius * 2);
}

drawJoystick(0, 0); // Initial draw

// ============================================================================
// BEST PRACTICES
// ============================================================================

// 1. Offscreen vs Onscreen:
//    - Use createCanvas() for offscreen rendering (textures for sprites)
//    - Use createOnScreenCanvas() for direct display on screen

// 2. Using Canvas API with Sprite Manager
//    - Sprite Manager and Canvas API use different coordinate spaces, when creating a full-screen canvas it does not necessarily share the same size reported by Sprite Manager getScreenSize. Make sure you follow these rules:
//      1. When drawing inside a canvas use the canvas size (reported by canvas.getWidth(), canvas.getHeight(), or canvas.getSize()).
//      2. When using a Sprite to render a canvas texture, use Sprite Manager's coordinate space for .size and .position (taken from getScreenSize()).
//      3. getScreenSize() returns DEVICE PIXELS and changes with device resolution. NEVER feed it (or any device/screen dimension) into what you draw, including textSize. Mixing screen dimensions into canvas coordinates — e.g. building a scale like (canvasWidth / screenWidth) and multiplying draw sizes by it — couples your layout to resolution, so a HUD that fits on one device overflows on another. Size and position everything you draw as a fraction of the canvas's OWN fixed dimensions (getWidth()/getHeight()) instead.

// 2. Resource Management:
//    - Call canvas.destroy() when done to free resources
//    - Reuse textures when possible instead of creating new canvases
//    - The engine DOES NOT retain canvas textures, only destroy a canvas when its texture is not needed

// 3. Performance — per-frame rendering:
//    - Canvas automatically batches draw calls by blend mode
//    - Use noStroke() and noFill() to skip unnecessary rendering
//    - Lower bezierDetail() for better performance on curves
//    - Skip the per-frame redraw entirely when no state has changed since the last frame.
//    - State setters and transforms (fill, stroke, strokeWeight, push/translate/rotate/pop, color-channel conversions) carry per-call overhead. Precompute and cache anything that does not vary per frame; do not recompute it inside the render loop.
//    - Per-frame cost scales with (elements × ops per element). Move everything that does not depend on the current frame out of the render loop.

// 4. Static vs Dynamic Layers:
//    - This split is required, not optional, whenever the per-frame render loop would otherwise iterate visually unchanging elements. Without it, unchanging draw work stays in the hot path and frame rate degrades even when redraws are gated by a dirty flag.
//    - Render every element whose appearance does not change every frame on a separate offscreen canvas (createCanvas), built once at initialization and rebuilt only from the events that change its inputs. Display it on the onscreen canvas via image() each frame.
//    - The onscreen canvas's per-frame render path should only contain draw calls for elements that genuinely change each frame.

// 5. Transformations:
//    - Always use push()/pop() to isolate transform changes

// 6. Touch handling:
//    - Touch coords from touchManager are normalized (0-1)
//    - Convert to canvas pixels: new vec2(x, y).mult(canvas.getSize())
//    - Finding canvas coordinates for touches inside sprites: use hitTest() then toLocalPosition() then convert to canvas coords
//      Example:
//      const pixel = script.spriteMgr.unitToPixel(new vec2(x, y));
//      const hits = script.spriteMgr.hitTest(pixel);
//      if (hits.length > 0) {
//          const sprite = hits[0];
//          const localPos = sprite.toLocalPosition(pixel); // Local to sprite (0,0 = sprite center)
//          const canvasPos = localPos.add(new vec2(sprite.size.x * 0.5, sprite.size.y * 0.5)); // Canvas coords (0,0 = top-left)
//      }
//    - When using canvas to create UI widgets check touch within widget only on touch down,, then, on touch move act as if the touch should belong to the widget even if its outside of its bounds. For example, when creating a circular dial widget check touch inside the ring only on touch down, then on touch move calculate the angle without checking that the touch is inside the ring (same for slider, etc.)

// 7. Text Sizing:
//    - Text size is in pixels and consistent across different canvas sizes and device resolutions (for a fixed-size canvas it renders at a constant size regardless of the device's resolution)
//    - Use reasonable values like 12, 24, 48 for text size, or a fraction of the canvas height (e.g. canvas.getHeight() * 0.045) so text keeps the same relative size on every device
//    - Do NOT multiply textSize by a screen-derived scale factor. textSize is already in canvas pixels; multiplying it by something like (canvasWidth / screenWidth) re-introduces the device resolution and makes text grow on low-resolution devices and overflow its layout. Anti-pattern vs fix:
//        var sx = canvas.getWidth() / screenW;
//        canvas.textSize(56 * sx);                     // WRONG — 56 * canvasW / screenW depends on device resolution
//        canvas.textSize(56);                          // RIGHT — constant in canvas pixels
//        canvas.textSize(canvas.getHeight() * 0.045);  // RIGHT — scales with the canvas, not the device
//    - The same rule applies to every pixel-based call (strokeWeight, translate, line/point coordinates, rect/circle sizes): derive them from the canvas's own dimensions, never from screen/device dimensions.

// 8. Clearing Background:
//    - When clearing the background to transparent color set the color to a value that is close to colors that will be rendered on top of it with 0 alpha.
//      For example:
//      if we expect white lines to be drawn use white: canvas.background(255,255,255,0)
//      if we expect black lines use black: canvas.background(0,0,0,0)
//      if we expect many colors use gray: canvas.background(128,128,128,0)


// ============================================================================
// NOTES
// ============================================================================

// - Coordinate system: (0,0) is top-left, positive x is right, positive y is down
// - Color values default to 0-255 range, configurable with colorMode()
// - Transformations affect all subsequent draw calls until reset or pop()
// - Canvas uses element pooling for efficient rendering across frames
// - Anti-aliasing is enabled by default (fringeWidth = 2.0)
// - When creating off-screen canvas for a game element, increase its size with some padding so the entire shape that is drawn will fit inside its boundaries. This is important when drawing shapes with a stroke because the stroke extends by half of its width outside of the given coordinates.
// - You can query a texture size by using texture.getWidth() and texture.getHeight(). Use that when needed for textures provided by Sprite Store. This is especially useful when splitting textures into smaller pieces.
// - Do not try to read changes from the canvas using getWidth() or getHeight() in an update event or loop because they do not change after a canvas is created.
// - glow() adds a soft additive bloom on both on-screen and offscreen canvases; it reads best on a dark background. On an offscreen canvas the halo is baked into getTexture() so it carries wherever the texture is drawn, over any background (transparent or opaque). getTexture() returns the same object with glow on or off, so the call order does not matter.
// - glow() blooms EVERYTHING on its canvas, not just bright shapes (there is no
//   brightness threshold): a mid-tone fill will lighten a lot. Put glowing content on a
//   dedicated canvas over a dark/transparent background; never enable glow() on a canvas
//   that also holds artwork that must stay unchanged.
