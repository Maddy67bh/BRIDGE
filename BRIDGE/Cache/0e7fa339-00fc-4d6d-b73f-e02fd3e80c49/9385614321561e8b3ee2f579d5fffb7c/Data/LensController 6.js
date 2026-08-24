// Main Controller
//
// Made with Easy Lens

//@input Component.ScriptComponent bridge_canvas
//@input Component.ScriptComponent bridge_title
//@input Component.ScriptComponent bridge_instructions
//@input Component.ScriptComponent linkspace_title
//@input Component.ScriptComponent linkspace_subtitle
//@input Component.ScriptComponent linkspace_hint
//@input Component.ScriptComponent sik_tap_safety
//@input Component.ScriptComponent touch_events


try {

// Spatial Organizer — Week 1 refactor using Canvas + Touch Events (no direct .onTap on SceneObjects)

// ─────────────────────────────────────────────────────────────────────────────
// Tunable parameters (surfaced controls)
// ─────────────────────────────────────────────────────────────────────────────
const CARD_COUNT = 3;                          // TODAY, IMPORTANT, LATER
const CARDS_TOP_FRACTION = 0.22;               // Top offset for cards band
const CARDS_ROW_FRACTION = 0.56;               // Vertical band for cards
const CARD_WIDTH_FRAC = 0.70;                  // Card width as fraction of canvas width
const CARD_HEIGHT_FRAC = 0.12;                 // Card height fraction of canvas height
const CARD_CORNER_FRAC = 0.22;                 // Corner radius as fraction of card height
const CARD_GUTTER_FRAC = 0.045;                // Vertical spacing between cards
const TITLE_TEXT_FRAC = 0.050;                 // Not drawn on canvas; Text block handles title
const LABEL_TEXT_FRAC = 0.038;                 // Card label text size fraction
const EDGE_HIT_PAD_FRAC = 0.012;               // Hit padding around card for taps
const PULSE_DURATION_MS = 220;                 // Pulse tween duration
const PULSE_SCALE_ADD = 0.04;                  // Additional scale amount during pulse

// Colors (0-255 via canvas API; vec4 used for clarity)
const COL_BG_CLEAR = new vec4(0, 0, 0, 0);
const COL_CARD_IDLE = new vec4(28, 28, 34, 210);
const COL_CARD_STROKE = new vec4(180, 180, 200, 180);
const COL_CARD_ACTIVE = new vec4(60, 140, 255, 220);   // highlight
const COL_CARD_ACTIVE_STROKE = new vec4(220, 235, 255, 235);
const COL_TEXT_MAIN = new vec4(255, 255, 255, 255);
const COL_TEXT_SUB = new vec4(210, 220, 235, 255);

// Flags
const SHOW_TITLE_TEXT = true;

// ─────────────────────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────────────────────
let canvas = null;
let W = 0, H = 0;

let cardRects = [];        // [{x,y,w,h,label,selected,scale}]
let selectedIndex = -1;

// Cache for hit padding and dimensions
let cardWidth = 0;
let cardHeight = 0;
let cardCorner = 0;
let cardGutter = 0;
let marginX = 0;
let edgePad = 0;

// Pulse tween runtime object (shared)
let pulseObj = { s: 1 };
let pulseTween = null;

// ─────────────────────────────────────────────────────────────────────────────
// Initialization
// ─────────────────────────────────────────────────────────────────────────────
script.createEvent("OnStartEvent").bind(function() {
    // Create full-screen onscreen canvas
    canvas = script.bridge_canvas.createOnScreenCanvas();
    W = canvas.getWidth();
    H = canvas.getHeight();

    // Precompute dimensions
    marginX = Math.round(W * 0.06);
    cardWidth = Math.round(W * CARD_WIDTH_FRAC);
    cardHeight = Math.round(H * CARD_HEIGHT_FRAC);
    cardCorner = Math.round(cardHeight * CARD_CORNER_FRAC);
    cardGutter = Math.round(H * CARD_GUTTER_FRAC);
    edgePad = Math.round(H * EDGE_HIT_PAD_FRAC);

    // Text blocks: show only Spatial Organizer title, hide others to prevent overlap
    if (script.bridge_title) { script.bridge_title.enabled = false; }
    if (script.bridge_instructions) { script.bridge_instructions.enabled = false; }
    if (script.linkspace_subtitle) { script.linkspace_subtitle.enabled = false; }
    if (script.linkspace_hint) { script.linkspace_hint.enabled = false; }
    if (script.linkspace_title) {
        script.linkspace_title.text = "Spatial Organizer";
        script.linkspace_title.forceSafeRegion(true);
    }

    // Touch Events — single source for taps
    if (script.touch_events) {
        script.touch_events.blockDefaultTouches = true;
        script.touch_events.allowDoubleTap = false;
        script.touch_events.enableHint = false;
        if (script.touch_events.onTap) {
            script.touch_events.onTap.add(function(tapX, tapY) {
                const px = Math.round(tapX * W);
                const py = Math.round(tapY * H);
                handleCanvasTap(px, py);
            });
        }
    }

    // SIK safety — keep enabled with a no-op tap listener
    if (script.sik_tap_safety) {
        script.sik_tap_safety.blockDefaultTouches = false;
        script.sik_tap_safety.allowDoubleTap = false;
        script.sik_tap_safety.enableHint = false;
        if (script.sik_tap_safety.onTap) {
            script.sik_tap_safety.onTap.add(function(x, y) {});
        }
    }

    buildCardsLayout();
    drawUI();
});

// ─────────────────────────────────────────────────────────────────────────────
// Layout
// ─────────────────────────────────────────────────────────────────────────────
function buildCardsLayout() {
    cardRects = [];
    selectedIndex = -1;

    const bandH = Math.round(H * CARDS_ROW_FRACTION);
    const topY = Math.round(H * CARDS_TOP_FRACTION);

    const totalH = CARD_COUNT * cardHeight + (CARD_COUNT - 1) * cardGutter;
    const startY = Math.round(topY + (bandH - totalH) * 0.5);
    const x = Math.round(W * 0.5 - cardWidth * 0.5);

    const labels = ["TODAY", "IMPORTANT", "LATER"];

    for (let i = 0; i < CARD_COUNT; i++) {
        const y = startY + i * (cardHeight + cardGutter);
        cardRects.push({ x: x, y: y, w: cardWidth, h: cardHeight, label: labels[i], selected: false, scale: 1 });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Interaction
// ─────────────────────────────────────────────────────────────────────────────
function handleCanvasTap(px, py) {
    for (let i = 0; i < cardRects.length; i++) {
        const r = cardRects[i];
        if (pointInRect(px, py, r.x - edgePad, r.y - edgePad, r.w + 2 * edgePad, r.h + 2 * edgePad)) {
            // Toggle selection logic: only one selected at a time
            if (selectedIndex === i) {
                r.selected = false;
                selectedIndex = -1;
            } else {
                if (selectedIndex >= 0) { cardRects[selectedIndex].selected = false; }
                r.selected = true;
                selectedIndex = i;
                triggerPulse(r);
            }
            drawUI();
            return;
        }
    }
}

function pointInRect(px, py, rx, ry, rw, rh) {
    return (px >= rx && px <= rx + rw && py >= ry && py <= ry + rh);
}

function triggerPulse(r) {
    // Reset shared pulse object and tween
    pulseObj.s = 1;
    if (pulseTween && pulseTween.isPlaying()) { pulseTween.stop(); }
    pulseTween = new TWEEN.Tween(pulseObj)
        .to({ s: 1 + PULSE_SCALE_ADD }, PULSE_DURATION_MS)
        .yoyo(true)
        .repeat(1)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(function() {
            r.scale = pulseObj.s;
            drawUI();
        })
        .onComplete(function() {
            r.scale = 1;
            drawUI();
        })
        .start();
}

// ─────────────────────────────────────────────────────────────────────────────
// Drawing
// ─────────────────────────────────────────────────────────────────────────────
function drawUI() {
    canvas.background(COL_BG_CLEAR.x, COL_BG_CLEAR.y, COL_BG_CLEAR.z, COL_BG_CLEAR.w);

    for (let i = 0; i < cardRects.length; i++) {
        drawCard(cardRects[i]);
    }
}

function drawCard(card) {
    const cx = card.x + card.w * 0.5;
    const cy = card.y + card.h * 0.5;

    // Apply scale around center using push/translate/scale/pop
    canvas.push();
    canvas.translate(cx, cy);
    canvas.scale(card.scale, card.scale);
    const x = -card.w * 0.5;
    const y = -card.h * 0.5;

    // Background
    canvas.noStroke();
    const bg = card.selected ? COL_CARD_ACTIVE : COL_CARD_IDLE;
    canvas.fill(bg.x, bg.y, bg.z, bg.w);
    canvas.rect(x, y, card.w, card.h, cardCorner);

    // Outline
    canvas.noFill();
    const sc = card.selected ? COL_CARD_ACTIVE_STROKE : COL_CARD_STROKE;
    canvas.stroke(sc.x, sc.y, sc.z, sc.w);
    canvas.strokeWeight(Math.max(2, Math.round(cardHeight * 0.10)));
    canvas.rect(x, y, card.w, card.h, cardCorner);

    // Label
    const padX = Math.round(card.h * 0.20);
    const padY = Math.round(card.h * 0.18);
    const labelSlotW = card.w - padX * 2;
    const labelSlotH = Math.round(card.h * 0.64);
    const labelSize = Math.round(H * LABEL_TEXT_FRAC);
    canvas.textSize(Math.min(labelSize, canvas.fitTextSize(card.label, labelSlotW, labelSlotH)));
    canvas.stroke(0, 0, 0);
    canvas.strokeWeight(Math.max(2, Math.round(canvas.textLineHeight() * 0.10)));
    canvas.fill(COL_TEXT_MAIN.x, COL_TEXT_MAIN.y, COL_TEXT_MAIN.z, COL_TEXT_MAIN.w);
    canvas.textAlign('center', 'middle');
    canvas.textBox(card.label, -labelSlotW * 0.5 + (card.w - labelSlotW) * 0.5 - card.w * 0.5 + padX, -labelSlotH * 0.5 + (card.h - labelSlotH) * 0.5 - card.h * 0.5 + padY, labelSlotW, labelSlotH, 0);

    canvas.pop();
}

} catch(e) {
  print("error in controller");
  print(e);
}
