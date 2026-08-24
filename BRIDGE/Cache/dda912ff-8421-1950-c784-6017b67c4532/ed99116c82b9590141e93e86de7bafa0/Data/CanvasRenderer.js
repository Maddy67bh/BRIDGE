// Canvas Rendering Functions
// Basic vector rendering with fringe anti-aliasing
// Optimized with vec2/vec3 API

// Import triangulator for non-convex polygon filling
const { triangulate } = require('./Triangulator');

// Line cap style constants
const CAP_ROUND = 'round';
const CAP_SQUARE = 'square';

// Line join style constants
const JOIN_MITER = 'miter';
const JOIN_BEVEL = 'bevel';
const JOIN_ROUND = 'round';

// Threshold constants (squared for performance)
const EPSILON = 0.0001;
const EPSILON_SQ = EPSILON * EPSILON;

// Pre-computed constants
const PI = Math.PI;
const TWO_PI = PI * 2;
const HALF_PI = PI / 2;

// ============================================================================
// Color Resolution
// ============================================================================

// Returns the color scaled by the canvas global alpha. Fast path: when the
// global alpha is >= 1 the input vec4 is returned unchanged (zero alloc), so a
// canvas with no gradient and full alpha produces byte-identical geometry.
function applyGlobalAlpha(canvas, color) {
    const ga = canvas.globalAlphaValue;
    if (ga >= 1) {
        return color;
    }
    return new vec4(color.r, color.g, color.b, color.a * ga);
}

// Evaluate per-vertex in PIXEL space (before the world transform).
function fillColorAt(canvas, px, py) {
    const base = canvas.fillGradient ? canvas.fillGradient._evalAt(px, py) : canvas.fillColor;
    return applyGlobalAlpha(canvas, base);
}

// Resolves the stroke color at a canvas-pixel coordinate (see fillColorAt).
function strokeColorAt(canvas, px, py) {
    const base = canvas.strokeGradient ? canvas.strokeGradient._evalAt(px, py) : canvas.strokeColor;
    return applyGlobalAlpha(canvas, base);
}

// Allocates the LUT texture slot for the current fill gradient when it can be
// sampled per-pixel (linear/radial). Conic stays on the per-vertex path (its
// center vertex has no well-defined angle, so UV interpolation would seam).
// Returns -1 when there is no per-pixel gradient fill. Call this BEFORE reading
// canvas.vertexCount for a shape: it may flush a full texture batch.
function fillGradTexId(canvas) {
    const g = canvas.fillGradient;
    if (g && g.type !== 'conic') {
        const id = canvas._getTextureSlot(canvas._lutForGradient(g));
        // _getTextureSlot may flush + null the current element when the texture batch
        // is full; re-ensure it before the caller adds vertices (mirrors image()).
        canvas._ensureVectorElement();
        return id;
    }
    return -1.0;
}

// Resolves the paint for a FILL vertex at local pixel (px, py). For a flat fill or
// a conic gradient (gradTexId < 0) it returns the per-vertex color. For a linear/
// radial gradient it returns white plus the LUT texId and uv = gradient param, so
// the shader samples the gradient per-pixel (exact multi-stop on any shape).
function fillPaintAt(canvas, px, py, gradTexId) {
    if (gradTexId >= 0) {
        const t = canvas.fillGradient._paramAt(px, py);
        // Inset to the 256-texel LUT centers so u=0/1 (and clamped-extrapolation regions
        // where t saturates) sample the edge texel instead of blending 50% with the
        // ClampToBorderColor (transparent) border under linear filtering.
        const u = (t * 255 + 0.5) / 256;
        return { r: 1, g: 1, b: 1, a: canvas.globalAlphaValue, u: u, v: 0.5, texId: gradTexId };
    }
    const c = fillColorAt(canvas, px, py);
    return { r: c.r, g: c.g, b: c.b, a: c.a, u: 0, v: 0, texId: -1.0 };
}

// ============================================================================
// Rendering Functions
// ============================================================================

function renderLine(canvas, x1, y1, x2, y2) {
    // Convert to world coordinates
    const p1 = canvas._toWorld(x1, y1);
    const p2 = canvas._toWorld(x2, y2);
    
    // Calculate line direction using vec2 API
    const delta = p2.sub(p1);
    const lenSq = delta.lengthSquared;
    
    if (lenSq < EPSILON_SQ) return;
    
    const len = Math.sqrt(lenSq);
    const dir = delta.uniformScale(1 / len);
    const norm = new vec2(-dir.y, dir.x);
    
    // Half width and fringe in world units (converted from pixels)
    const halfWidth = canvas._pixelsToWorld(canvas._getScaledStrokeWidth());
    const fringeW = canvas._pixelsToWorld(canvas.currentFringeWidth);
    
    // Resolve the stroke color at EACH endpoint so a gradient stroke interpolates
    // along the line. A single midpoint sample would paint the whole line one color.
    const c1 = canvas.doStroke ? strokeColorAt(canvas, x1, y1) : new vec4(0, 0, 0, 0);
    const c2 = canvas.doStroke ? strokeColorAt(canvas, x2, y2) : new vec4(0, 0, 0, 0);
    const useFringe = fringeW > 0;

    // Create stroke with fringe for anti-aliasing
    const w0 = halfWidth + fringeW;  // outer (fringe)
    const w1 = halfWidth;             // inner (solid)

    // For CAP_SQUARE caps, extend the line endpoints by halfWidth
    let ep1 = p1;
    let ep2 = p2;
    if (canvas.lineCapStyle === CAP_SQUARE) {
        ep1 = p1.sub(dir.uniformScale(halfWidth));
        ep2 = p2.add(dir.uniformScale(halfWidth));
    }

    const startIdx = canvas.vertexCount;

    if (useFringe) {
        // Outer fringe vertices (transparent), endpoint colors so the fringe edge matches the core
        const normW0 = norm.uniformScale(w0);
        const normW1 = norm.uniformScale(w1);

        canvas._addVertex(ep1.x + normW0.x, ep1.y + normW0.y, 0, c1.r, c1.g, c1.b, 0, 0, 0, -1.0, 1.0);
        canvas._addVertex(ep1.x - normW0.x, ep1.y - normW0.y, 0, c1.r, c1.g, c1.b, 0, 0, 0, -1.0, 1.0);
        canvas._addVertex(ep2.x + normW0.x, ep2.y + normW0.y, 0, c2.r, c2.g, c2.b, 0, 0, 0, -1.0, 1.0);
        canvas._addVertex(ep2.x - normW0.x, ep2.y - normW0.y, 0, c2.r, c2.g, c2.b, 0, 0, 0, -1.0, 1.0);

        // Inner solid vertices
        canvas._addVertex(ep1.x + normW1.x, ep1.y + normW1.y, 0, c1.r, c1.g, c1.b, c1.a, 0, 0, -1.0, 0.0);
        canvas._addVertex(ep1.x - normW1.x, ep1.y - normW1.y, 0, c1.r, c1.g, c1.b, c1.a, 0, 0, -1.0, 0.0);
        canvas._addVertex(ep2.x + normW1.x, ep2.y + normW1.y, 0, c2.r, c2.g, c2.b, c2.a, 0, 0, -1.0, 0.0);
        canvas._addVertex(ep2.x - normW1.x, ep2.y - normW1.y, 0, c2.r, c2.g, c2.b, c2.a, 0, 0, -1.0, 0.0);

        // Fringe triangles (top and bottom edges)
        canvas.indices.push(startIdx+0, startIdx+4, startIdx+2);
        canvas.indices.push(startIdx+4, startIdx+6, startIdx+2);
        canvas.indices.push(startIdx+1, startIdx+3, startIdx+5);
        canvas.indices.push(startIdx+5, startIdx+3, startIdx+7);

        // Core triangles
        canvas.indices.push(startIdx+4, startIdx+5, startIdx+6);
        canvas.indices.push(startIdx+5, startIdx+7, startIdx+6);
    } else {
        const normW1 = norm.uniformScale(w1);

        // No fringe - just solid vertices and triangles
        canvas._addVertex(ep1.x + normW1.x, ep1.y + normW1.y, 0, c1.r, c1.g, c1.b, c1.a, 0, 0, -1.0, 0.0);
        canvas._addVertex(ep1.x - normW1.x, ep1.y - normW1.y, 0, c1.r, c1.g, c1.b, c1.a, 0, 0, -1.0, 0.0);
        canvas._addVertex(ep2.x + normW1.x, ep2.y + normW1.y, 0, c2.r, c2.g, c2.b, c2.a, 0, 0, -1.0, 0.0);
        canvas._addVertex(ep2.x - normW1.x, ep2.y - normW1.y, 0, c2.r, c2.g, c2.b, c2.a, 0, 0, -1.0, 0.0);

        // Core triangles only
        canvas.indices.push(startIdx+0, startIdx+1, startIdx+2);
        canvas.indices.push(startIdx+1, startIdx+3, startIdx+2);
    }

    // Add caps based on style (each cap takes its own endpoint color)
    if (canvas.lineCapStyle === CAP_ROUND) {
        // Round caps at both ends (use original p1/p2)
        renderRoundCap(canvas, p1.x, p1.y, dir.x, dir.y, halfWidth, fringeW, c1, false, useFringe);
        renderRoundCap(canvas, p2.x, p2.y, dir.x, dir.y, halfWidth, fringeW, c2, true, useFringe);
    } else if (canvas.lineCapStyle === CAP_SQUARE && useFringe) {
        // Square caps - add end fringe at extended endpoints (only if using fringe)
        renderSquareCapFringe(canvas, ep1.x, ep1.y, -dir.x, -dir.y, norm.x, norm.y, halfWidth, fringeW, c1);
        renderSquareCapFringe(canvas, ep2.x, ep2.y, dir.x, dir.y, norm.x, norm.y, halfWidth, fringeW, c2);
    }
}

// Render a round cap (semicircle) at the given point
// isEnd: true for end cap (faces forward), false for start cap (faces backward)
// useFringe: if false, skip fringe rendering
function renderRoundCap(canvas, cx, cy, dirX, dirY, halfWidth, fringeW, color, isEnd, useFringe = true) {
    const segments = 8;
    const angleStep = PI / segments;
    
    // Calculate the base angle - the direction the cap faces
    const capDirX = isEnd ? dirX : -dirX;
    const capDirY = isEnd ? dirY : -dirY;
    
    const baseAngle = Math.atan2(capDirY, capDirX);
    const startAngle = baseAngle - HALF_PI;
    
    const w0 = halfWidth + fringeW;
    const w1 = halfWidth;
    
    const centerIdx = canvas.vertexCount;
    
    // Center vertex
    canvas._addVertex(cx, cy, 0, color.r, color.g, color.b, color.a, 0, 0, -1.0, 0.0);
    
    // Inner arc vertices (solid)
    for (let i = 0; i <= segments; i++) {
        const angle = startAngle + i * angleStep;
        const x = cx + Math.cos(angle) * w1;
        const y = cy + Math.sin(angle) * w1;
        canvas._addVertex(x, y, 0, color.r, color.g, color.b, color.a, 0, 0, -1.0, 0.0);
    }
    
    if (useFringe) {
        // Outer arc vertices (fringe - transparent)
        for (let i = 0; i <= segments; i++) {
            const angle = startAngle + i * angleStep;
            const x = cx + Math.cos(angle) * w0;
            const y = cy + Math.sin(angle) * w0;
            canvas._addVertex(x, y, 0, color.r, color.g, color.b, 0, 0, 0, -1.0, 1.0);
        }
    }
    
    // Triangles for fill (fan from center)
    for (let i = 0; i < segments; i++) {
        canvas.indices.push(centerIdx, centerIdx + 1 + i, centerIdx + 1 + i + 1);
    }
    
    if (useFringe) {
        // Triangles for fringe
        for (let i = 0; i < segments; i++) {
            const i0 = centerIdx + 1 + i;
            const i1 = centerIdx + 1 + i + 1;
            const i2 = centerIdx + 1 + segments + 1 + i;
            const i3 = centerIdx + 1 + segments + 1 + i + 1;
            canvas.indices.push(i0, i2, i1);
            canvas.indices.push(i1, i2, i3);
        }
    }
}

// Render end fringe for square cap
function renderSquareCapFringe(canvas, cx, cy, dirX, dirY, normX, normY, halfWidth, fringeW, color) {
    const w0 = halfWidth + fringeW;
    const w1 = halfWidth;
    
    const startIdx = canvas.vertexCount;
    
    // The end point of the fringe
    const endX = cx + dirX * fringeW;
    const endY = cy + dirY * fringeW;
    
    // 4 vertices for the end fringe quad
    // At cap edge (solid)
    canvas._addVertex(cx + normX * w1, cy + normY * w1, 0, color.r, color.g, color.b, color.a, 0, 0, -1.0, 0.0);
    canvas._addVertex(cx - normX * w1, cy - normY * w1, 0, color.r, color.g, color.b, color.a, 0, 0, -1.0, 0.0);
    // At fringe edge (transparent)
    canvas._addVertex(endX + normX * w1, endY + normY * w1, 0, color.r, color.g, color.b, 0, 0, 0, -1.0, 1.0);
    canvas._addVertex(endX - normX * w1, endY - normY * w1, 0, color.r, color.g, color.b, 0, 0, 0, -1.0, 1.0);
    
    // Corner fringe vertices (outer corners)
    canvas._addVertex(cx + normX * w0, cy + normY * w0, 0, color.r, color.g, color.b, 0, 0, 0, -1.0, 1.0);
    canvas._addVertex(cx - normX * w0, cy - normY * w0, 0, color.r, color.g, color.b, 0, 0, 0, -1.0, 1.0);
    canvas._addVertex(endX + normX * w0, endY + normY * w0, 0, color.r, color.g, color.b, 0, 0, 0, -1.0, 1.0);
    canvas._addVertex(endX - normX * w0, endY - normY * w0, 0, color.r, color.g, color.b, 0, 0, 0, -1.0, 1.0);
    
    // End fringe quad (center)
    canvas.indices.push(startIdx+0, startIdx+2, startIdx+1);
    canvas.indices.push(startIdx+1, startIdx+2, startIdx+3);
    
    // Side fringes
    canvas.indices.push(startIdx+0, startIdx+4, startIdx+2);
    canvas.indices.push(startIdx+2, startIdx+4, startIdx+6);
    canvas.indices.push(startIdx+1, startIdx+3, startIdx+5);
    canvas.indices.push(startIdx+3, startIdx+7, startIdx+5);
    
    // Corner triangles
    canvas.indices.push(startIdx+2, startIdx+6, startIdx+3);
    canvas.indices.push(startIdx+3, startIdx+6, startIdx+7);
}

function renderCircle(canvas, cx, cy, radius) {
    // Convert center to world coordinates
    const center = canvas._toWorld(cx, cy);
    
    // Radius, fringe, and stroke width in world units
    const r = canvas._pixelsToWorld(radius);
    const fringeW = canvas._pixelsToWorld(canvas.currentFringeWidth);
    const strokeW = canvas._pixelsToWorld(canvas._getScaledStrokeWidth());
    
    const useFringe = fringeW > 0;
    
    // Number of segments based on radius (in pixels for quality)
    const segments = Math.max(12, Math.min(64, Math.floor(radius)));
    const angleStep = TWO_PI / segments;
    
    if (canvas.doFill) {
        const gradTexId = fillGradTexId(canvas);
        const startIdx = canvas.vertexCount;

        // Center vertex (resolved at the pixel center)
        const centerPaint = fillPaintAt(canvas, cx, cy, gradTexId);
        canvas._addVertex(center.x, center.y, 0, centerPaint.r, centerPaint.g, centerPaint.b, centerPaint.a, centerPaint.u, centerPaint.v, centerPaint.texId, 0.0);

        // Inner edge vertices (solid). The matching fringe vertex at each angle
        // reuses this paint's RGB/uv with alpha 0, so resolve once per angle.
        const edgePaints = [];
        for (let i = 0; i <= segments; i++) {
            const angle = i * angleStep;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const c = fillPaintAt(canvas, cx + cos * radius, cy + sin * radius, gradTexId);
            edgePaints.push(c);
            canvas._addVertex(center.x + cos * r, center.y + sin * r, 0, c.r, c.g, c.b, c.a, c.u, c.v, c.texId, 0.0);
        }

        if (useFringe) {
            const rFringe = r + fringeW;
            for (let i = 0; i <= segments; i++) {
                const angle = i * angleStep;
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                const c = edgePaints[i];
                canvas._addVertex(center.x + cos * rFringe, center.y + sin * rFringe, 0, c.r, c.g, c.b, 0, c.u, c.v, c.texId, 1.0);
            }
        }
        
        // Fill triangles
        for (let i = 0; i < segments; i++) {
            canvas.indices.push(startIdx, startIdx + 1 + i, startIdx + 1 + i + 1);
        }
        
        if (useFringe) {
            for (let i = 0; i < segments; i++) {
                const i0 = startIdx + 1 + i;
                const i1 = startIdx + 1 + i + 1;
                const i2 = startIdx + 1 + segments + 1 + i;
                const i3 = startIdx + 1 + segments + 1 + i + 1;
                canvas.indices.push(i0, i2, i1);
                canvas.indices.push(i1, i2, i3);
            }
        }
    }
    
    if (canvas.doStroke) {
        const startIdx = canvas.vertexCount;
        const halfStrokeW = strokeW / 2;
        const innerR = r - halfStrokeW;
        const outerR = r + halfStrokeW;

        // Resolve the stroke color once per angle at the stroke centerline (pixel
        // radius), shared across all rings at that angle (fringe rings use alpha 0).
        const ringColors = [];
        for (let i = 0; i <= segments; i++) {
            const angle = i * angleStep;
            ringColors.push(strokeColorAt(canvas, cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius));
        }

        if (useFringe) {
            const fringeR = outerR + fringeW;
            const innerFringeR = innerR - fringeW;

            // 4 rings of vertices
            for (let i = 0; i <= segments; i++) {
                const angle = i * angleStep;
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                const c = ringColors[i];
                canvas._addVertex(center.x + cos * innerFringeR, center.y + sin * innerFringeR, 0, c.r, c.g, c.b, 0, 0, 0, -1.0, 1.0);
            }
            for (let i = 0; i <= segments; i++) {
                const angle = i * angleStep;
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                const c = ringColors[i];
                canvas._addVertex(center.x + cos * innerR, center.y + sin * innerR, 0, c.r, c.g, c.b, c.a, 0, 0, -1.0, 0.0);
            }
            for (let i = 0; i <= segments; i++) {
                const angle = i * angleStep;
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                const c = ringColors[i];
                canvas._addVertex(center.x + cos * outerR, center.y + sin * outerR, 0, c.r, c.g, c.b, c.a, 0, 0, -1.0, 0.0);
            }
            for (let i = 0; i <= segments; i++) {
                const angle = i * angleStep;
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                const c = ringColors[i];
                canvas._addVertex(center.x + cos * fringeR, center.y + sin * fringeR, 0, c.r, c.g, c.b, 0, 0, 0, -1.0, 1.0);
            }
            
            // 3 quad strips
            for (let i = 0; i < segments; i++) {
                // Inner fringe
                const i0 = startIdx + i;
                const i1 = startIdx + i + 1;
                const i2 = startIdx + segments + 1 + i;
                const i3 = startIdx + segments + 1 + i + 1;
                canvas.indices.push(i0, i2, i1);
                canvas.indices.push(i1, i2, i3);
                
                // Solid stroke
                const s0 = startIdx + segments + 1 + i;
                const s1 = startIdx + segments + 1 + i + 1;
                const s2 = startIdx + (segments + 1) * 2 + i;
                const s3 = startIdx + (segments + 1) * 2 + i + 1;
                canvas.indices.push(s0, s2, s1);
                canvas.indices.push(s1, s2, s3);
                
                // Outer fringe
                const o0 = startIdx + (segments + 1) * 2 + i;
                const o1 = startIdx + (segments + 1) * 2 + i + 1;
                const o2 = startIdx + (segments + 1) * 3 + i;
                const o3 = startIdx + (segments + 1) * 3 + i + 1;
                canvas.indices.push(o0, o2, o1);
                canvas.indices.push(o1, o2, o3);
            }
        } else {
            // No fringe - 2 rings
            for (let i = 0; i <= segments; i++) {
                const angle = i * angleStep;
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                const c = ringColors[i];
                canvas._addVertex(center.x + cos * innerR, center.y + sin * innerR, 0, c.r, c.g, c.b, c.a, 0, 0, -1.0, 0.0);
            }
            for (let i = 0; i <= segments; i++) {
                const angle = i * angleStep;
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                const c = ringColors[i];
                canvas._addVertex(center.x + cos * outerR, center.y + sin * outerR, 0, c.r, c.g, c.b, c.a, 0, 0, -1.0, 0.0);
            }

            for (let i = 0; i < segments; i++) {
                const i0 = startIdx + i;
                const i1 = startIdx + i + 1;
                const i2 = startIdx + segments + 1 + i;
                const i3 = startIdx + segments + 1 + i + 1;
                canvas.indices.push(i0, i2, i1);
                canvas.indices.push(i1, i2, i3);
            }
        }
    }
}

function renderEllipse(canvas, cx, cy, width, height) {
    const center = canvas._toWorld(cx, cy);
    
    const rx = canvas._pixelsToWorld(width / 2);
    const ry = canvas._pixelsToWorld(height / 2);
    const fringeW = canvas._pixelsToWorld(canvas.currentFringeWidth);
    const strokeW = canvas._pixelsToWorld(canvas._getScaledStrokeWidth());
    
    const useFringe = fringeW > 0;
    
    const rxPix = width / 2;
    const ryPix = height / 2;
    const maxRadius = Math.max(width, height) / 2;
    const segments = Math.max(12, Math.min(64, Math.floor(maxRadius)));
    const angleStep = TWO_PI / segments;

    if (canvas.doFill) {
        const gradTexId = fillGradTexId(canvas);
        const startIdx = canvas.vertexCount;

        const centerPaint = fillPaintAt(canvas, cx, cy, gradTexId);
        canvas._addVertex(center.x, center.y, 0, centerPaint.r, centerPaint.g, centerPaint.b, centerPaint.a, centerPaint.u, centerPaint.v, centerPaint.texId, 0.0);

        const edgePaints = [];
        for (let i = 0; i <= segments; i++) {
            const angle = i * angleStep;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const c = fillPaintAt(canvas, cx + cos * rxPix, cy + sin * ryPix, gradTexId);
            edgePaints.push(c);
            canvas._addVertex(center.x + cos * rx, center.y + sin * ry, 0, c.r, c.g, c.b, c.a, c.u, c.v, c.texId, 0.0);
        }

        if (useFringe) {
            for (let i = 0; i <= segments; i++) {
                const angle = i * angleStep;
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                // Normal direction for ellipse
                const nx = cos / rx;
                const ny = sin / ry;
                const nVec = new vec2(nx, ny).normalize();
                const x = center.x + cos * rx + nVec.x * fringeW;
                const y = center.y + sin * ry + nVec.y * fringeW;
                const c = edgePaints[i];
                canvas._addVertex(x, y, 0, c.r, c.g, c.b, 0, c.u, c.v, c.texId, 1.0);
            }
        }
        
        for (let i = 0; i < segments; i++) {
            canvas.indices.push(startIdx, startIdx + 1 + i, startIdx + 1 + i + 1);
        }
        
        if (useFringe) {
            for (let i = 0; i < segments; i++) {
                const i0 = startIdx + 1 + i;
                const i1 = startIdx + 1 + i + 1;
                const i2 = startIdx + 1 + segments + 1 + i;
                const i3 = startIdx + 1 + segments + 1 + i + 1;
                canvas.indices.push(i0, i2, i1);
                canvas.indices.push(i1, i2, i3);
            }
        }
    }
    
    if (canvas.doStroke) {
        const startIdx = canvas.vertexCount;
        const halfStrokeW = strokeW / 2;

        // Stroke color per angle, resolved at the ellipse edge (pixel space).
        const ringColors = [];
        for (let i = 0; i <= segments; i++) {
            const angle = i * angleStep;
            ringColors.push(strokeColorAt(canvas, cx + Math.cos(angle) * rxPix, cy + Math.sin(angle) * ryPix));
        }

        if (useFringe) {
            // 4 rings
            for (let ring = 0; ring < 4; ring++) {
                for (let i = 0; i <= segments; i++) {
                    const angle = i * angleStep;
                    const cos = Math.cos(angle);
                    const sin = Math.sin(angle);

                    const nx = cos / rx;
                    const ny = sin / ry;
                    const nVec = new vec2(nx, ny).normalize();

                    const c = ringColors[i];
                    let offset, alpha, edgeDist;
                    if (ring === 0) {
                        offset = -halfStrokeW - fringeW;
                        alpha = 0;
                        edgeDist = 1.0;
                    } else if (ring === 1) {
                        offset = -halfStrokeW;
                        alpha = c.a;
                        edgeDist = 0.0;
                    } else if (ring === 2) {
                        offset = halfStrokeW;
                        alpha = c.a;
                        edgeDist = 0.0;
                    } else {
                        offset = halfStrokeW + fringeW;
                        alpha = 0;
                        edgeDist = 1.0;
                    }

                    const x = center.x + cos * rx + nVec.x * offset;
                    const y = center.y + sin * ry + nVec.y * offset;
                    canvas._addVertex(x, y, 0, c.r, c.g, c.b, alpha, 0, 0, -1.0, edgeDist);
                }
            }
            
            for (let strip = 0; strip < 3; strip++) {
                for (let i = 0; i < segments; i++) {
                    const i0 = startIdx + strip * (segments + 1) + i;
                    const i1 = startIdx + strip * (segments + 1) + i + 1;
                    const i2 = startIdx + (strip + 1) * (segments + 1) + i;
                    const i3 = startIdx + (strip + 1) * (segments + 1) + i + 1;
                    canvas.indices.push(i0, i2, i1);
                    canvas.indices.push(i1, i2, i3);
                }
            }
        } else {
            // 2 rings
            for (let ring = 0; ring < 2; ring++) {
                for (let i = 0; i <= segments; i++) {
                    const angle = i * angleStep;
                    const cos = Math.cos(angle);
                    const sin = Math.sin(angle);

                    const nx = cos / rx;
                    const ny = sin / ry;
                    const nVec = new vec2(nx, ny).normalize();

                    const c = ringColors[i];
                    const offset = ring === 0 ? -halfStrokeW : halfStrokeW;
                    const x = center.x + cos * rx + nVec.x * offset;
                    const y = center.y + sin * ry + nVec.y * offset;
                    canvas._addVertex(x, y, 0, c.r, c.g, c.b, c.a, 0, 0, -1.0, 0.0);
                }
            }
            
            for (let i = 0; i < segments; i++) {
                const i0 = startIdx + i;
                const i1 = startIdx + i + 1;
                const i2 = startIdx + (segments + 1) + i;
                const i3 = startIdx + (segments + 1) + i + 1;
                canvas.indices.push(i0, i2, i1);
                canvas.indices.push(i1, i2, i3);
            }
        }
    }
}

function renderRect(canvas, x, y, w, h, r1, r2, r3, r4) {
    const fringeW = canvas._pixelsToWorld(canvas.currentFringeWidth);
    const strokeW = canvas._pixelsToWorld(canvas._getScaledStrokeWidth());

    const useFringe = fringeW > 0;

    // Clamp corner radii (pixel space)
    const maxR = Math.min(w, h) / 2;
    r1 = Math.min(r1, maxR);
    r2 = Math.min(r2, maxR);
    r3 = Math.min(r3, maxR);
    r4 = Math.min(r4, maxR);

    // Build geometry in pixel space (Y-down) so it survives any canvas rotation,
    // then map each path vertex to world space via _toWorld.
    // Precompute the pixel->world linear basis so we can transform normals too.
    const wOrigin = canvas._toWorld(0, 0);
    const wDx = canvas._toWorld(1, 0);
    const wDy = canvas._toWorld(0, 1);
    const basisXx = wDx.x - wOrigin.x;
    const basisXy = wDx.y - wOrigin.y;
    const basisYx = wDy.x - wOrigin.x;
    const basisYy = wDy.y - wOrigin.y;

    function pxDirToWorld(nx, ny) {
        const dx = nx * basisXx + ny * basisYx;
        const dy = nx * basisXy + ny * basisYy;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 1e-9) return { x: 0, y: 0 };
        return { x: dx / len, y: dy / len };
    }

    // Corner centers and angles in pixel space (Y-down). Sweep direction matches
    // the original world-space (Y-up) winding once mapped through _toWorld.
    const corners = [
        { cx: x + r1, cy: y + r1, r: r1, startAngle: PI, endAngle: PI * 1.5 },         // TL
        { cx: x + w - r2, cy: y + r2, r: r2, startAngle: PI * 1.5, endAngle: TWO_PI }, // TR
        { cx: x + w - r3, cy: y + h - r3, r: r3, startAngle: 0, endAngle: PI * 0.5 },  // BR
        { cx: x + r4, cy: y + h - r4, r: r4, startAngle: PI * 0.5, endAngle: PI }      // BL
    ];

    const segmentsPerCorner = 8;

    function buildPath() {
        const path = [];
        // Outward edge normals at sharp corners (pixel space, Y-down).
        const edgeNormalsPx = [
            [new vec2(-1, 0), new vec2(0, -1)], // TL: left, top
            [new vec2(0, -1), new vec2(1, 0)],  // TR: top, right
            [new vec2(1, 0), new vec2(0, 1)],   // BR: right, bottom
            [new vec2(0, 1), new vec2(-1, 0)]   // BL: bottom, left
        ];

        for (let c = 0; c < 4; c++) {
            const corner = corners[c];
            if (corner.r > 0.001) {
                const angleRange = corner.endAngle - corner.startAngle;
                for (let i = 0; i <= segmentsPerCorner; i++) {
                    const t = i / segmentsPerCorner;
                    const angle = corner.startAngle + t * angleRange;
                    const cosA = Math.cos(angle);
                    const sinA = Math.sin(angle);
                    const pxX = corner.cx + cosA * corner.r;
                    const pxY = corner.cy + sinA * corner.r;
                    const wp = canvas._toWorld(pxX, pxY);
                    const wn = pxDirToWorld(cosA, sinA);
                    path.push({ x: wp.x, y: wp.y, nx: wn.x, ny: wn.y, px: pxX, py: pxY });
                }
            } else {
                const wp = canvas._toWorld(corner.cx, corner.cy);
                const wn1 = pxDirToWorld(edgeNormalsPx[c][0].x, edgeNormalsPx[c][0].y);
                const wn2 = pxDirToWorld(edgeNormalsPx[c][1].x, edgeNormalsPx[c][1].y);
                path.push({ x: wp.x, y: wp.y, nx: wn1.x, ny: wn1.y, px: corner.cx, py: corner.cy });
                path.push({ x: wp.x, y: wp.y, nx: wn2.x, ny: wn2.y, px: corner.cx, py: corner.cy });
            }
        }
        path.push(path[0]);
        return path;
    }

    if (canvas.doFill) {
        const gradTexId = fillGradTexId(canvas);
        const startIdx = canvas.vertexCount;
        const center = canvas._toWorld(x + w / 2, y + h / 2);
        const centerPaint = fillPaintAt(canvas, x + w / 2, y + h / 2, gradTexId);
        canvas._addVertex(center.x, center.y, 0, centerPaint.r, centerPaint.g, centerPaint.b, centerPaint.a, centerPaint.u, centerPaint.v, centerPaint.texId, 0.0);

        const innerPath = buildPath();
        const pathLen = innerPath.length;

        const edgePaints = [];
        for (const p of innerPath) {
            const c = fillPaintAt(canvas, p.px, p.py, gradTexId);
            edgePaints.push(c);
            canvas._addVertex(p.x, p.y, 0, c.r, c.g, c.b, c.a, c.u, c.v, c.texId, 0.0);
        }

        if (useFringe) {
            for (let i = 0; i < pathLen; i++) {
                const p = innerPath[i];
                const c = edgePaints[i];
                canvas._addVertex(p.x + p.nx * fringeW, p.y + p.ny * fringeW, 0, c.r, c.g, c.b, 0, c.u, c.v, c.texId, 1.0);
            }
        }
        
        for (let i = 0; i < pathLen - 1; i++) {
            canvas.indices.push(startIdx, startIdx + 1 + i + 1, startIdx + 1 + i);
        }
        
        if (useFringe) {
            for (let i = 0; i < pathLen - 1; i++) {
                const i0 = startIdx + 1 + i;
                const i1 = startIdx + 1 + i + 1;
                const i2 = startIdx + 1 + pathLen + i;
                const i3 = startIdx + 1 + pathLen + i + 1;
                canvas.indices.push(i0, i1, i2);
                canvas.indices.push(i2, i1, i3);
            }
        }
    }
    
    if (canvas.doStroke) {
        const startIdx = canvas.vertexCount;
        const halfStrokeW = strokeW / 2;
        const path = buildPath();
        const pathLen = path.length;

        // Stroke color per path vertex (pixel space); fringe rings reuse the RGB.
        const pathColors = path.map(p => strokeColorAt(canvas, p.px, p.py));

        if (useFringe) {
            const offsets = [-halfStrokeW - fringeW, -halfStrokeW, halfStrokeW, halfStrokeW + fringeW];
            const edgeDists = [1.0, 0.0, 0.0, 1.0];
            const ringAlphaSolid = [false, true, true, false];

            for (let ring = 0; ring < 4; ring++) {
                for (let i = 0; i < pathLen; i++) {
                    const p = path[i];
                    const c = pathColors[i];
                    const alpha = ringAlphaSolid[ring] ? c.a : 0;
                    canvas._addVertex(p.x + p.nx * offsets[ring], p.y + p.ny * offsets[ring], 0, c.r, c.g, c.b, alpha, 0, 0, -1.0, edgeDists[ring]);
                }
            }

            for (let strip = 0; strip < 3; strip++) {
                for (let i = 0; i < pathLen - 1; i++) {
                    const i0 = startIdx + strip * pathLen + i;
                    const i1 = startIdx + strip * pathLen + i + 1;
                    const i2 = startIdx + (strip + 1) * pathLen + i;
                    const i3 = startIdx + (strip + 1) * pathLen + i + 1;
                    canvas.indices.push(i0, i1, i2);
                    canvas.indices.push(i2, i1, i3);
                }
            }
        } else {
            const offsets = [-halfStrokeW, halfStrokeW];

            for (let ring = 0; ring < 2; ring++) {
                for (let i = 0; i < pathLen; i++) {
                    const p = path[i];
                    const c = pathColors[i];
                    canvas._addVertex(p.x + p.nx * offsets[ring], p.y + p.ny * offsets[ring], 0, c.r, c.g, c.b, c.a, 0, 0, -1.0, 0.0);
                }
            }

            for (let i = 0; i < pathLen - 1; i++) {
                const i0 = startIdx + i;
                const i1 = startIdx + i + 1;
                const i2 = startIdx + pathLen + i;
                const i3 = startIdx + pathLen + i + 1;
                canvas.indices.push(i0, i1, i2);
                canvas.indices.push(i2, i1, i3);
            }
        }
    }
}

// Fast check if a polygon is convex
function isConvexPolygon(path) {
    if (path.length < 3) return true;
    
    let sign = 0;
    const n = path.length;
    
    for (let i = 0; i < n; i++) {
        const p1 = path[i];
        const p2 = path[(i + 1) % n];
        const p3 = path[(i + 2) % n];
        
        // Cross product
        const dx1 = p2.x - p1.x;
        const dy1 = p2.y - p1.y;
        const dx2 = p3.x - p2.x;
        const dy2 = p3.y - p2.y;
        const cross = dx1 * dy2 - dy1 * dx2;
        
        if (Math.abs(cross) > EPSILON) {
            if (sign === 0) {
                sign = cross > 0 ? 1 : -1;
            } else if ((cross > 0 ? 1 : -1) !== sign) {
                return false;
            }
        }
    }
    
    return true;
}

function renderShape(canvas, shapeVertices, close) {
    if (shapeVertices.length < 2) return;
    
    const fringeW = canvas._pixelsToWorld(canvas.currentFringeWidth);
    const strokeW = canvas._pixelsToWorld(canvas._getScaledStrokeWidth());
    const useFringe = fringeW > 0;
    
    // Convert all vertices to world coordinates
    const worldVerts = shapeVertices.map(v => canvas._toWorld(v.x, v.y));
    
    // Detect winding order using signed area
    let signedArea = 0;
    for (let i = 0; i < worldVerts.length; i++) {
        const p1 = worldVerts[i];
        const p2 = worldVerts[(i + 1) % worldVerts.length];
        signedArea += (p2.x - p1.x) * (p2.y + p1.y);
    }
    const isClockwise = signedArea > 0;
    const normalDirection = isClockwise ? 1 : -1;
    
    // Build path with normals
    const path = [];
    const n = worldVerts.length;
    
    for (let i = 0; i < n; i++) {
        const curr = worldVerts[i];
        const prev = worldVerts[(i - 1 + n) % n];
        const next = worldVerts[(i + 1) % n];
        // Source pixel position for this vertex, carried through for gradient eval
        const px = shapeVertices[i].x;
        const py = shapeVertices[i].y;

        // Edge vectors using vec2
        const e1 = new vec2(curr.x - prev.x, curr.y - prev.y);
        const e2 = new vec2(next.x - curr.x, next.y - curr.y);
        
        // Normals
        const len1Sq = e1.lengthSquared;
        const len2Sq = e2.lengthSquared;
        
        let n1 = new vec2(0, 0);
        let n2 = new vec2(0, 0);
        
        if (len1Sq > EPSILON_SQ) {
            const len1 = Math.sqrt(len1Sq);
            n1 = new vec2(-e1.y / len1 * normalDirection, e1.x / len1 * normalDirection);
        }
        if (len2Sq > EPSILON_SQ) {
            const len2 = Math.sqrt(len2Sq);
            n2 = new vec2(-e2.y / len2 * normalDirection, e2.x / len2 * normalDirection);
        }
        
        // Join style handling
        let nx, ny, scale = 1.0;
        if (close || (i > 0 && i < n - 1)) {
            if (canvas.lineJoinStyle === JOIN_BEVEL) {
                path.push({ x: curr.x, y: curr.y, nx: n1.x, ny: n1.y, scale: 1.0, isBevel: true, isFirst: true, px, py });
                path.push({ x: curr.x, y: curr.y, nx: n2.x, ny: n2.y, scale: 1.0, isBevel: true, isFirst: false, px, py });
                continue;
            } else if (canvas.lineJoinStyle === JOIN_ROUND) {
                const angle1 = Math.atan2(n1.y, n1.x);
                const angle2 = Math.atan2(n2.y, n2.x);
                
                let angleDiff = angle2 - angle1;
                while (angleDiff > PI) angleDiff -= TWO_PI;
                while (angleDiff < -PI) angleDiff += TWO_PI;
                
                const segments = Math.max(2, Math.ceil(Math.abs(angleDiff) / (PI / 8)));
                
                for (let j = 0; j <= segments; j++) {
                    const t = j / segments;
                    const angle = angle1 + angleDiff * t;
                    path.push({ x: curr.x, y: curr.y, nx: Math.cos(angle), ny: Math.sin(angle), scale: 1.0, isRound: true, px, py });
                }
                continue;
            } else {
                // Miter join
                const combined = n1.add(n2);
                const nlen = combined.length;
                if (nlen > EPSILON) {
                    const normalized = combined.uniformScale(1 / nlen);
                    nx = normalized.x;
                    ny = normalized.y;
                    
                    const dot = nx * n1.x + ny * n1.y;
                    if (dot > EPSILON) {
                        scale = 1.0 / dot;
                    }
                } else {
                    nx = n1.x;
                    ny = n1.y;
                }
            }
        } else if (i === 0) {
            nx = n2.x;
            ny = n2.y;
        } else {
            nx = n1.x;
            ny = n1.y;
        }
        
        path.push({ x: curr.x, y: curr.y, nx: nx, ny: ny, scale: scale, isBevel: false, px, py });
    }
    
    // Fill the shape
    if (canvas.doFill && path.length >= 3) {
        const gradTexId = fillGradTexId(canvas);
        const startIdx = canvas.vertexCount;
        const pathLen = path.length;

        const useTriangulation = !isConvexPolygon(worldVerts);

        if (useTriangulation) {
            const fillPaints = path.map(p => fillPaintAt(canvas, p.px, p.py, gradTexId));
            for (let i = 0; i < pathLen; i++) {
                const p = path[i];
                const c = fillPaints[i];
                canvas._addVertex(p.x, p.y, 0, c.r, c.g, c.b, c.a, c.u, c.v, c.texId, 0.0);
            }

            if (useFringe) {
                for (let i = 0; i < pathLen; i++) {
                    const p = path[i];
                    const c = fillPaints[i];
                    canvas._addVertex(p.x + p.nx * fringeW, p.y + p.ny * fringeW, 0, c.r, c.g, c.b, 0, c.u, c.v, c.texId, 1.0);
                }
            }
            
            const flatVertices = [];
            if (isClockwise) {
                for (let i = pathLen - 1; i >= 0; i--) {
                    flatVertices.push(path[i].x, path[i].y);
                }
            } else {
                for (const p of path) {
                    flatVertices.push(p.x, p.y);
                }
            }
            
            const triangleIndices = triangulate(flatVertices);
            
            if (isClockwise) {
                for (let i = 0; i < triangleIndices.length; i += 3) {
                    canvas.indices.push(
                        startIdx + (pathLen - 1 - triangleIndices[i]),
                        startIdx + (pathLen - 1 - triangleIndices[i + 1]),
                        startIdx + (pathLen - 1 - triangleIndices[i + 2])
                    );
                }
            } else {
                for (let i = 0; i < triangleIndices.length; i += 3) {
                    canvas.indices.push(
                        startIdx + triangleIndices[i],
                        startIdx + triangleIndices[i + 1],
                        startIdx + triangleIndices[i + 2]
                    );
                }
            }
            
            if (useFringe) {
                if (isClockwise) {
                    for (let i = 0; i < pathLen; i++) {
                        const i0 = startIdx + i;
                        const i1 = startIdx + ((i + 1) % pathLen);
                        const i2 = startIdx + pathLen + i;
                        const i3 = startIdx + pathLen + ((i + 1) % pathLen);
                        canvas.indices.push(i0, i1, i2);
                        canvas.indices.push(i2, i1, i3);
                    }
                } else {
                    for (let i = 0; i < pathLen; i++) {
                        const i0 = startIdx + i;
                        const i1 = startIdx + ((i + 1) % pathLen);
                        const i2 = startIdx + pathLen + i;
                        const i3 = startIdx + pathLen + ((i + 1) % pathLen);
                        canvas.indices.push(i0, i2, i1);
                        canvas.indices.push(i2, i3, i1);
                    }
                }
            }
        } else {
            // Triangle fan from centroid
            let cx = 0, cy = 0;
            let pcx = 0, pcy = 0;
            for (const p of path) {
                cx += p.x;
                cy += p.y;
                pcx += p.px;
                pcy += p.py;
            }
            cx /= pathLen;
            cy /= pathLen;
            pcx /= pathLen;
            pcy /= pathLen;

            const centerPaint = fillPaintAt(canvas, pcx, pcy, gradTexId);
            canvas._addVertex(cx, cy, 0, centerPaint.r, centerPaint.g, centerPaint.b, centerPaint.a, centerPaint.u, centerPaint.v, centerPaint.texId, 0.0);

            const fillPaints = path.map(p => fillPaintAt(canvas, p.px, p.py, gradTexId));
            for (let i = 0; i < pathLen; i++) {
                const p = path[i];
                const c = fillPaints[i];
                canvas._addVertex(p.x, p.y, 0, c.r, c.g, c.b, c.a, c.u, c.v, c.texId, 0.0);
            }
            const c0 = fillPaints[0];
            canvas._addVertex(path[0].x, path[0].y, 0, c0.r, c0.g, c0.b, c0.a, c0.u, c0.v, c0.texId, 0.0);

            if (useFringe) {
                for (let i = 0; i < pathLen; i++) {
                    const p = path[i];
                    const c = fillPaints[i];
                    canvas._addVertex(p.x + p.nx * fringeW, p.y + p.ny * fringeW, 0, c.r, c.g, c.b, 0, c.u, c.v, c.texId, 1.0);
                }
                canvas._addVertex(path[0].x + path[0].nx * fringeW, path[0].y + path[0].ny * fringeW, 0, c0.r, c0.g, c0.b, 0, c0.u, c0.v, c0.texId, 1.0);
            }
            
            if (isClockwise) {
                for (let i = 0; i < pathLen; i++) {
                    canvas.indices.push(startIdx + 1 + i, startIdx, startIdx + 1 + ((i + 1) % pathLen));
                }
            } else {
                for (let i = 0; i < pathLen; i++) {
                    canvas.indices.push(startIdx, startIdx + 1 + i, startIdx + 1 + ((i + 1) % pathLen));
                }
            }
            
            if (useFringe) {
                if (isClockwise) {
                    for (let i = 0; i < pathLen; i++) {
                        const i0 = startIdx + 1 + i;
                        const i1 = startIdx + 1 + ((i + 1) % pathLen);
                        const i2 = startIdx + 1 + pathLen + 1 + i;
                        const i3 = startIdx + 1 + pathLen + 1 + ((i + 1) % pathLen);
                        canvas.indices.push(i0, i1, i2);
                        canvas.indices.push(i2, i1, i3);
                    }
                } else {
                    for (let i = 0; i < pathLen; i++) {
                        const i0 = startIdx + 1 + i;
                        const i1 = startIdx + 1 + ((i + 1) % pathLen);
                        const i2 = startIdx + 1 + pathLen + 1 + i;
                        const i3 = startIdx + 1 + pathLen + 1 + ((i + 1) % pathLen);
                        canvas.indices.push(i0, i2, i1);
                        canvas.indices.push(i2, i3, i1);
                    }
                }
            }
        }
    }
    
    // Stroke the shape
    if (canvas.doStroke && path.length >= 2) {
        const startIdx = canvas.vertexCount;
        const halfStrokeW = strokeW / 2;
        
        const strokePath = [...path];
        if (close) {
            strokePath.push(path[0]);
        }

        // For open paths with CAP_SQUARE, extend the endpoint vertices outward
        // by halfStrokeW so the solid stroke geometry covers the square cap.
        // (renderLine does the same; without this, the solid stroke ends at the
        // exact endpoint and the cap degenerates to a butt cap or is missed entirely
        // when useFringe is false.)
        if (!close && canvas.lineCapStyle === CAP_SQUARE && strokePath.length >= 2) {
            const first = strokePath[0];
            const second = strokePath[1];
            const startDx = second.x - first.x;
            const startDy = second.y - first.y;
            const startLen = Math.sqrt(startDx * startDx + startDy * startDy);
            if (startLen > EPSILON) {
                const k = halfStrokeW / startLen;
                strokePath[0] = Object.assign({}, first, {
                    x: first.x - startDx * k,
                    y: first.y - startDy * k
                });
            }
            const lastIdx = strokePath.length - 1;
            const last = strokePath[lastIdx];
            const prev = strokePath[lastIdx - 1];
            const endDx = last.x - prev.x;
            const endDy = last.y - prev.y;
            const endLen = Math.sqrt(endDx * endDx + endDy * endDy);
            if (endLen > EPSILON) {
                const k = halfStrokeW / endLen;
                strokePath[lastIdx] = Object.assign({}, last, {
                    x: last.x + endDx * k,
                    y: last.y + endDy * k
                });
            }
        }

        // Stroke color per stroke-path vertex (pixel space); fringe rings reuse RGB.
        const strokePathColors = strokePath.map(p => strokeColorAt(canvas, p.px, p.py));

        if (useFringe) {
            const offsets = [-halfStrokeW - fringeW, -halfStrokeW, halfStrokeW, halfStrokeW + fringeW];
            const edgeDists = [1.0, 0.0, 0.0, 1.0];
            const ringAlphaSolid = [false, true, true, false];

            for (let ring = 0; ring < 4; ring++) {
                for (let i = 0; i < strokePath.length; i++) {
                    const p = strokePath[i];
                    const c = strokePathColors[i];
                    const scaledOffset = offsets[ring] * (p.scale || 1.0);
                    const alpha = ringAlphaSolid[ring] ? c.a : 0;
                    canvas._addVertex(p.x + p.nx * scaledOffset, p.y + p.ny * scaledOffset, 0, c.r, c.g, c.b, alpha, 0, 0, -1.0, edgeDists[ring]);
                }
            }

            const pathLen = strokePath.length;
            
            if (isClockwise) {
                for (let strip = 0; strip < 3; strip++) {
                    for (let i = 0; i < pathLen - 1; i++) {
                        const i0 = startIdx + strip * pathLen + i;
                        const i1 = startIdx + strip * pathLen + i + 1;
                        const i2 = startIdx + (strip + 1) * pathLen + i;
                        const i3 = startIdx + (strip + 1) * pathLen + i + 1;
                        canvas.indices.push(i0, i1, i2);
                        canvas.indices.push(i2, i1, i3);
                    }
                }
            } else {
                for (let strip = 0; strip < 3; strip++) {
                    for (let i = 0; i < pathLen - 1; i++) {
                        const i0 = startIdx + strip * pathLen + i;
                        const i1 = startIdx + strip * pathLen + i + 1;
                        const i2 = startIdx + (strip + 1) * pathLen + i;
                        const i3 = startIdx + (strip + 1) * pathLen + i + 1;
                        canvas.indices.push(i0, i2, i1);
                        canvas.indices.push(i2, i3, i1);
                    }
                }
            }
        } else {
            const offsets = [-halfStrokeW, halfStrokeW];

            for (let ring = 0; ring < 2; ring++) {
                for (let i = 0; i < strokePath.length; i++) {
                    const p = strokePath[i];
                    const c = strokePathColors[i];
                    const scaledOffset = offsets[ring] * (p.scale || 1.0);
                    canvas._addVertex(p.x + p.nx * scaledOffset, p.y + p.ny * scaledOffset, 0, c.r, c.g, c.b, c.a, 0, 0, -1.0, 0.0);
                }
            }

            const pathLen = strokePath.length;
            
            if (isClockwise) {
                for (let i = 0; i < pathLen - 1; i++) {
                    const i0 = startIdx + i;
                    const i1 = startIdx + i + 1;
                    const i2 = startIdx + pathLen + i;
                    const i3 = startIdx + pathLen + i + 1;
                    canvas.indices.push(i0, i1, i2);
                    canvas.indices.push(i2, i1, i3);
                }
            } else {
                for (let i = 0; i < pathLen - 1; i++) {
                    const i0 = startIdx + i;
                    const i1 = startIdx + i + 1;
                    const i2 = startIdx + pathLen + i;
                    const i3 = startIdx + pathLen + i + 1;
                    canvas.indices.push(i0, i2, i1);
                    canvas.indices.push(i2, i3, i1);
                }
            }
        }
        
        // Add caps for open shapes
        if (!close && canvas.lineCapStyle === CAP_ROUND) {
            const first = path[0];
            const second = path[1];
            const last = path[path.length - 1];
            const secondLast = path[path.length - 2];
            
            // Start cap
            const startDir = new vec2(second.x - first.x, second.y - first.y);
            const startLen = startDir.length;
            if (startLen > EPSILON) {
                const dir = startDir.uniformScale(1 / startLen);
                renderRoundCap(canvas, first.x, first.y, dir.x, dir.y, halfStrokeW, fringeW, strokeColorAt(canvas, first.px, first.py), false, useFringe);
            }

            // End cap
            const endDir = new vec2(last.x - secondLast.x, last.y - secondLast.y);
            const endLen = endDir.length;
            if (endLen > EPSILON) {
                const dir = endDir.uniformScale(1 / endLen);
                renderRoundCap(canvas, last.x, last.y, dir.x, dir.y, halfStrokeW, fringeW, strokeColorAt(canvas, last.px, last.py), true, useFringe);
            }
        } else if (!close && canvas.lineCapStyle === CAP_SQUARE && useFringe) {
            const first = path[0];
            const second = path[1];
            const last = path[path.length - 1];
            const secondLast = path[path.length - 2];

            // Start cap: the solid stroke has been extended by halfStrokeW past `first`
            // (see strokePath fix-up above), so place the cap fringe at the extended tip.
            const startDir = new vec2(second.x - first.x, second.y - first.y);
            const startLen = startDir.length;
            if (startLen > EPSILON) {
                const dir = startDir.uniformScale(1 / startLen);
                const norm = new vec2(-dir.y, dir.x);
                const tipX = first.x - dir.x * halfStrokeW;
                const tipY = first.y - dir.y * halfStrokeW;
                renderSquareCapFringe(canvas, tipX, tipY, -dir.x, -dir.y, norm.x, norm.y, halfStrokeW, fringeW, strokeColorAt(canvas, first.px, first.py));
            }

            // End cap
            const endDir = new vec2(last.x - secondLast.x, last.y - secondLast.y);
            const endLen = endDir.length;
            if (endLen > EPSILON) {
                const dir = endDir.uniformScale(1 / endLen);
                const norm = new vec2(-dir.y, dir.x);
                const tipX = last.x + dir.x * halfStrokeW;
                const tipY = last.y + dir.y * halfStrokeW;
                renderSquareCapFringe(canvas, tipX, tipY, dir.x, dir.y, norm.x, norm.y, halfStrokeW, fringeW, strokeColorAt(canvas, last.px, last.py));
            }
        }
    }
}

// ============================================================================
// Image Rendering Helper
// ============================================================================

/**
 * Renders an image quad with optional fringe anti-aliasing
 */
function renderImageQuad(canvas, tl, tr, bl, br, u0, u1, v0, v1, color, textureId) {
    const fringeW = canvas._pixelsToWorld(canvas.currentFringeWidth);
    const useFringe = fringeW > 0;
    
    const startIdx = canvas.vertexCount;
    
    if (useFringe) {
        // Calculate edge normals using vec2
        const topEdge = tr.sub(tl);
        const topLen = topEdge.length;
        const topNorm = topLen > 0 ? new vec2(-topEdge.y / topLen, topEdge.x / topLen) : new vec2(0, 0);
        
        const rightEdge = br.sub(tr);
        const rightLen = rightEdge.length;
        const rightNorm = rightLen > 0 ? new vec2(-rightEdge.y / rightLen, rightEdge.x / rightLen) : new vec2(0, 0);
        
        const bottomEdge = bl.sub(br);
        const bottomLen = bottomEdge.length;
        const bottomNorm = bottomLen > 0 ? new vec2(-bottomEdge.y / bottomLen, bottomEdge.x / bottomLen) : new vec2(0, 0);
        
        const leftEdge = tl.sub(bl);
        const leftLen = leftEdge.length;
        const leftNorm = leftLen > 0 ? new vec2(-leftEdge.y / leftLen, leftEdge.x / leftLen) : new vec2(0, 0);
        
        // Corner normals (averaged)
        const tlNorm = leftNorm.add(topNorm).normalize();
        const trNorm = topNorm.add(rightNorm).normalize();
        const blNorm = bottomNorm.add(leftNorm).normalize();
        const brNorm = rightNorm.add(bottomNorm).normalize();
        
        // Outer fringe vertices
        const tlOuter = tl.add(tlNorm.uniformScale(fringeW));
        const trOuter = tr.add(trNorm.uniformScale(fringeW));
        const blOuter = bl.add(blNorm.uniformScale(fringeW));
        const brOuter = br.add(brNorm.uniformScale(fringeW));
        
        canvas._addVertex(tlOuter.x, tlOuter.y, 0, color.r, color.g, color.b, 0, u0, v0, textureId, 1.0);
        canvas._addVertex(trOuter.x, trOuter.y, 0, color.r, color.g, color.b, 0, u1, v0, textureId, 1.0);
        canvas._addVertex(blOuter.x, blOuter.y, 0, color.r, color.g, color.b, 0, u0, v1, textureId, 1.0);
        canvas._addVertex(brOuter.x, brOuter.y, 0, color.r, color.g, color.b, 0, u1, v1, textureId, 1.0);
        
        // Inner solid vertices
        canvas._addVertex(tl.x, tl.y, 0, color.r, color.g, color.b, color.a, u0, v0, textureId, 0.0);
        canvas._addVertex(tr.x, tr.y, 0, color.r, color.g, color.b, color.a, u1, v0, textureId, 0.0);
        canvas._addVertex(bl.x, bl.y, 0, color.r, color.g, color.b, color.a, u0, v1, textureId, 0.0);
        canvas._addVertex(br.x, br.y, 0, color.r, color.g, color.b, color.a, u1, v1, textureId, 0.0);
        
        // Core triangles
        canvas.indices.push(startIdx + 4, startIdx + 6, startIdx + 5);
        canvas.indices.push(startIdx + 5, startIdx + 6, startIdx + 7);
        
        // Fringe triangles
        canvas.indices.push(startIdx + 0, startIdx + 4, startIdx + 1);
        canvas.indices.push(startIdx + 1, startIdx + 4, startIdx + 5);
        canvas.indices.push(startIdx + 6, startIdx + 2, startIdx + 7);
        canvas.indices.push(startIdx + 7, startIdx + 2, startIdx + 3);
        canvas.indices.push(startIdx + 0, startIdx + 2, startIdx + 4);
        canvas.indices.push(startIdx + 4, startIdx + 2, startIdx + 6);
        canvas.indices.push(startIdx + 5, startIdx + 7, startIdx + 1);
        canvas.indices.push(startIdx + 1, startIdx + 7, startIdx + 3);
    } else {
        canvas._addVertex(tl.x, tl.y, 0, color.r, color.g, color.b, color.a, u0, v0, textureId, 0.0);
        canvas._addVertex(tr.x, tr.y, 0, color.r, color.g, color.b, color.a, u1, v0, textureId, 0.0);
        canvas._addVertex(bl.x, bl.y, 0, color.r, color.g, color.b, color.a, u0, v1, textureId, 0.0);
        canvas._addVertex(br.x, br.y, 0, color.r, color.g, color.b, color.a, u1, v1, textureId, 0.0);
        
        canvas.indices.push(startIdx, startIdx + 2, startIdx + 1);
        canvas.indices.push(startIdx + 1, startIdx + 2, startIdx + 3);
    }
}

// Export rendering functions
module.exports = {
    // Constants
    CAP_ROUND,
    CAP_SQUARE,
    JOIN_MITER,
    JOIN_BEVEL,
    JOIN_ROUND,
    
    // Rendering functions
    renderLine,
    renderRoundCap,
    renderSquareCapFringe,
    renderCircle,
    renderEllipse,
    renderRect,
    renderShape,
    renderImageQuad,

    applyGlobalAlpha
};
