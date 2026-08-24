// Main Controller
//
// Made with Easy Lens

//@input Component.ScriptComponent bridge_canvas
//@input Component.ScriptComponent linkspace_title
//@input Component.ScriptComponent linkspace_subtitle
//@input Component.ScriptComponent linkspace_hint
//@input Component.ScriptComponent sik_tap_safety
//@input Component.ScriptComponent touch_events


try {

// BRIDGE — Spatial Communication Assistant (Canvas + TouchEvents only)
// Clean state machine UI; no direct .onTap on SceneObjects; SIK safety listener enabled.

// ─────────────────────────────────────────────────────────────────────────────
// Tunable parameters (surfaced controls)
// ─────────────────────────────────────────────────────────────────────────────
// Layout scales
const UI_SAFE_MARGIN_FRAC = 0.06;
const BUTTON_HEIGHT_FRAC = 0.10;
const BUTTON_WIDTH_FRAC = 0.72;
const BUTTON_CORNER_FRAC = 0.22;
const BUTTON_GUTTER_FRAC = 0.035;
const SECTION_TOP_HOME = 0.26;
const SECTION_HEIGHT_HOME = 0.58;
const EDGE_HIT_PAD_FRAC = 0.014;

// Text sizes (fractions of H)
const LABEL_TEXT_FRAC = 0.040;            // main button labels
const SMALL_TEXT_FRAC = 0.026;            // chips, status, small labels
const HEADER_TEXT_FRAC = 0.046;           // headers within canvas

// Animation timings
const PULSE_DURATION_MS = 220;
const PULSE_SCALE_ADD = 0.06;
const ENTER_DURATION_MS = 320;
const TOAST_DURATION_SEC = 0.9;
const DEMO_STEP_DELAY = 0.9;              // seconds between demo scripted actions

// Colors (0-255 via Canvas API)
const COL_BG_CLEAR = new vec4(0, 0, 0, 0);
const COL_PANEL = new vec4(20, 22, 28, 200);
const COL_CARD = new vec4(28, 30, 36, 210);
const COL_CARD_DIM = new vec4(22, 24, 28, 180);
const COL_ACCENT = new vec4(72, 170, 255, 235);       // cyan/blue accent
const COL_ACCENT_SOFT = new vec4(72, 170, 255, 140);
const COL_STROKE = new vec4(185, 195, 210, 185);
const COL_STROKE_ACCENT = new vec4(220, 238, 255, 235);
const COL_TEXT = new vec4(255, 255, 255, 255);
const COL_TEXT_SUB = new vec4(210, 220, 235, 255);
const COL_TEXT_DIM = new vec4(170, 182, 196, 255);

// ─────────────────────────────────────────────────────────────────────────────
// State machine
// ─────────────────────────────────────────────────────────────────────────────
const STATE_HOME = 0;
const STATE_NEW = 1;
const STATE_PLACE = 2;        // confirmation screen (Place Message)
const STATE_CARD = 3;         // card focus
const STATE_BOARD = 4;        // message board
const STATE_DEMO = 5;         // demo sequence

let state = STATE_HOME;

// Session data
let messages = []; // { id, presetType, status, createdLabel }
let focusedId = null; // message id when in CARD state
let selectedPreset = null; // string from presets
let idCounter = 1;

// Canvas + dims
let canvas = null; let W = 0, H = 0; let marginX = 0; let edgePad = 0;

// Per-screen hit regions (rebuilt each draw)
let hits = []; // { id: string, rect: {x,y,w,h} }

// Entrance / pulse anim
let pulseObj = { s: 1 };
let pulseTween = null;
let enterObj = { a: 0, s: 0.92 };
let enterTween = null;

// Demo control
let demoTimer = null; let demoStep = 0; let demoRunning = false;

// Presets
const PRESETS = ["MEET HERE", "REVIEW THIS", "IMPORTANT", "FOLLOW UP", "DONE"];

// Utility: message status enum
const STATUS_ACTIVE = "ACTIVE";
const STATUS_ACK = "ACKNOWLEDGED";
const STATUS_DONE = "COMPLETED";

// ─────────────────────────────────────────────────────────────────────────────
// Init
// ─────────────────────────────────────────────────────────────────────────────
script.createEvent("OnStartEvent").bind(function() {
    // Canvas (guard against missing block) — ensure block exists and init occurs after OnStart
    if (script.bridge_canvas && script.bridge_canvas.createOnScreenCanvas) {
        canvas = script.bridge_canvas.createOnScreenCanvas();
    } else if (script.bridge_canvas && script.bridge_canvas.createCanvas) {
        // Fallback: create an onscreen-equivalent by drawing to a fullscreen-sized offscreen canvas
        canvas = script.bridge_canvas.createCanvas();
    } else {
        // Fail gracefully: disable drawing/taps to avoid runtime errors
        canvas = null;
        // Log once for diagnostics
        // print("[BRIDGE] Canvas API block missing: script.bridge_canvas is undefined");
    }
    if (!canvas) {
        // If canvas creation failed, bail out of interactive drawing safely
        W = 0; H = 0; marginX = 0; edgePad = 0;
    } else {
        W = canvas.getWidth(); H = canvas.getHeight();
        marginX = Math.round(W * UI_SAFE_MARGIN_FRAC);
        edgePad = Math.round(H * EDGE_HIT_PAD_FRAC);
    }

    // Text blocks setup (no overlap) — removed legacy blocks are guarded
    if (script.linkspace_title) {
        script.linkspace_title.text = "BRIDGE";
        script.linkspace_title.forceSafeRegion(true);
    }
    if (script.linkspace_subtitle) { script.linkspace_subtitle.text = "Connect conversations to the world around you."; }
    if (script.linkspace_hint) { script.linkspace_hint.text = "BUILT WITH CLAD • SPECS"; }

    // Touch source — single subscription
    if (script.touch_events && script.touch_events.onTap) {
        script.touch_events.blockDefaultTouches = true;
        script.touch_events.allowDoubleTap = false;
        script.touch_events.enableHint = false;
        script.touch_events.onTap.add(function(tapX, tapY) {
            if (!canvas || W === 0 || H === 0) { return; }
            const px = Math.round(tapX * W); const py = Math.round(tapY * H);
            handleTap(px, py);
        });
    }
    // SIK safety no-op
    if (script.sik_tap_safety && script.sik_tap_safety.onTap) {
        script.sik_tap_safety.blockDefaultTouches = false;
        script.sik_tap_safety.allowDoubleTap = false;
        script.sik_tap_safety.enableHint = false;
        script.sik_tap_safety.onTap.add(function(x, y) {});
    }

    // First draw
    if (canvas) { draw(); }
});

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function addHit(id, x, y, w, h) { hits.push({ id: id, rect: { x: x, y: y, w: w, h: h } }); }
function inRect(px, py, r) { return (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h); }
function nowLabel() { return "JUST NOW"; }
function byId(id) { for (let i = 0; i < messages.length; i++) { if (messages[i].id === id) { return messages[i]; } } return null; }
function setState(s) { state = s; draw(); }

// ── Minimal in-script tween runner (no external TWEEN dependency)
let _tweens = [];
let _tweenUpdaterCreated = false;
function _ensureTweenUpdater() {
    if (_tweenUpdaterCreated) { return; }
    _tweenUpdaterCreated = true;
    var upd = script.createEvent("UpdateEvent");
    upd.bind(function() {
        if (_tweens.length === 0) { return; }
        const dt = getDeltaTime();
        for (let i = _tweens.length - 1; i >= 0; i--) {
            const tw = _tweens[i];
            tw.t += dt;
            let localT = tw.t - tw.segmentStart;
            let segDur = tw.dur;
            // handle yoyo second half
            let phase = 0; // 0 forward, 1 backward
            if (tw.yoyo && localT > segDur) { phase = 1; localT -= segDur; }
            let k = MathUtils.clamp(localT / segDur, 0, 1);
            // Quadratic.Out easing
            let e = 1 - (1 - k) * (1 - k);
            let val;
            if (phase === 0) {
                val = tw.from + (tw.to - tw.from) * e;
            } else { // backward
                // reverse from target back to start
                val = tw.to + (tw.from - tw.to) * e;
            }
            tw.target[tw.key] = val;
            if (tw.onUpdate) { tw.onUpdate(); }
            const segs = tw.yoyo ? 2 : 1;
            if (tw.t >= tw.segmentStart + segDur * segs - 1e-6) {
                // finished one cycle
                if (tw.repeats > 0) {
                    tw.repeats -= 1;
                    tw.segmentStart = tw.t; // next loop
                } else {
                    // finalize to exact end value
                    tw.target[tw.key] = (tw.yoyo ? tw.from : tw.to);
                    if (tw.onComplete) { tw.onComplete(); }
                    _tweens.splice(i, 1);
                }
            }
        }
    });
}
function _startTween(opts) {
    _ensureTweenUpdater();
    // Stop any existing tween on same target+key if requested
    if (opts.replaceKey) {
        for (let i = _tweens.length - 1; i >= 0; i--) {
            const tw = _tweens[i];
            if (tw.target === opts.target && tw.key === opts.key) { _tweens.splice(i, 1); }
        }
    }
    const tw = {
        target: opts.target,
        key: opts.key,
        from: opts.from,
        to: opts.to,
        dur: Math.max(0.0001, opts.durationSec || 0.2),
        yoyo: !!opts.yoyo,
        repeats: Math.max(0, opts.repeats || 0),
        t: 0,
        segmentStart: 0,
        onUpdate: opts.onUpdate,
        onComplete: opts.onComplete
    };
    _tweens.push(tw);
    return tw;
}

function pulseOnce() {
    // 1 -> 1+PULSE_SCALE_ADD -> 1 with Quadratic.Out feel
    const from = 1;
    const peak = 1 + PULSE_SCALE_ADD;
    // forward then yoyo back once (no extra repeats)
    _startTween({
        target: pulseObj,
        key: 's',
        from: from,
        to: peak,
        durationSec: PULSE_DURATION_MS / 1000,
        yoyo: true,
        repeats: 0,
        replaceKey: true,
        onUpdate: function() { draw(); },
        onComplete: function() { pulseObj.s = 1; draw(); }
    });
}

function playEnter() {
    // animate alpha and scale in parallel
    enterObj.a = 0; enterObj.s = 0.92;
    _startTween({
        target: enterObj,
        key: 'a',
        from: 0,
        to: 1,
        durationSec: ENTER_DURATION_MS / 1000,
        yoyo: false,
        repeats: 0,
        replaceKey: true,
        onUpdate: function(){ draw(); }
    });
    _startTween({
        target: enterObj,
        key: 's',
        from: 0.92,
        to: 1,
        durationSec: ENTER_DURATION_MS / 1000,
        yoyo: false,
        repeats: 0,
        replaceKey: true,
        onUpdate: function(){ draw(); }
    });
}

function createMessage(preset) {
    const m = { id: idCounter++, presetType: preset, status: STATUS_ACTIVE, createdLabel: nowLabel() };
    messages.push(m); focusedId = m.id; playEnter();
}

function acknowledgeFocused() {
    const m = byId(focusedId); if (!m) { return; }
    if (m.status === STATUS_ACTIVE) { m.status = STATUS_ACK; showToast("BRIDGED"); }
    draw();
}

function completeFocused() {
    const m = byId(focusedId); if (!m) { return; }
    m.status = STATUS_DONE; pulseOnce(); draw();
}

function showToast(text) {
    // Simple timed overlay flag
    _toastText = text; if (!_toastTimer) { _toastTimer = script.createEvent("DelayedCallbackEvent"); _toastTimer.bind(function(){ _toastText = null; draw(); }); }
    _toastTimer.reset(TOAST_DURATION_SEC);
    draw();
}
let _toastText = null; let _toastTimer = null;

// ─────────────────────────────────────────────────────────────────────────────
// TAP handling
// ─────────────────────────────────────────────────────────────────────────────
function handleTap(px, py) {
    // Single-fire guard per frame
    if (handleTap._busy) { return; }
    handleTap._busy = true;
    for (let i = 0; i < hits.length; i++) {
        const h = hits[i]; if (inRect(px, py, h.rect)) { routeTap(h.id); handleTap._busy = false; return; }
    }
    handleTap._busy = false;
}

function routeTap(id) {
    // Global buttons
    if (id === "home:new") { selectedPreset = null; setState(STATE_NEW); return; }
    if (id === "home:board") { setState(STATE_BOARD); return; }
    if (id === "home:demo") { startDemo(); return; }

    if (id === "back:home") { stopDemo(); setState(STATE_HOME); return; }

    // New message flow
    if (id.indexOf("preset:") === 0) {
        selectedPreset = id.substring(7); draw(); return;
    }
    if (id === "place:message") {
        if (selectedPreset) { createMessage(selectedPreset); setState(STATE_CARD); }
        return;
    }

    // Card actions
    if (id === "card:ack") { acknowledgeFocused(); return; }
    if (id === "card:done") { completeFocused(); return; }

    // Board
    if (id.indexOf("board:open:") === 0) {
        const sid = parseInt(id.substring(11)); focusedId = sid; playEnter(); setState(STATE_CARD); return;
    }
    if (id === "board:new") { selectedPreset = null; setState(STATE_NEW); return; }

    // Demo
    if (id === "demo:skip") { stopDemo(); setState(STATE_HOME); return; }
    if (id === "demo:home") { stopDemo(); setState(STATE_HOME); return; }
}

// ─────────────────────────────────────────────────────────────────────────────
// DEMO
// ─────────────────────────────────────────────────────────────────────────────
function startDemo() {
    stopDemo(); demoRunning = true; demoStep = 0; setState(STATE_DEMO);
    stepDemo();
}
function stepDemo() {
    if (!demoRunning) { return; }
    const d = script.createEvent("DelayedCallbackEvent"); d.bind(function(){
        if (!demoRunning) { return; }
        demoStep++;
        if (demoStep === 1) { /* intro shown by STATE_DEMO draw */ }
        else if (demoStep === 2) { createMessage("MEET HERE"); }
        else if (demoStep === 3) { acknowledgeFocused(); }
        else if (demoStep === 4) { createMessage("REVIEW THIS"); }
        else if (demoStep === 5) { completeFocused(); }
        else if (demoStep === 6) { showToast("Communication, anchored."); }
        else if (demoStep >= 8) { /* hold */ }
        draw(); stepDemo();
    }); d.reset(DEMO_STEP_DELAY);
}
function stopDemo() { demoRunning = false; }

// ─────────────────────────────────────────────────────────────────────────────
// DRAWING
// ─────────────────────────────────────────────────────────────────────────────
function draw() {
    hits = [];
    if (!canvas) { return; }
    canvas.background(COL_BG_CLEAR.x, COL_BG_CLEAR.y, COL_BG_CLEAR.z, COL_BG_CLEAR.w);

    if (state === STATE_HOME) { drawHome(); }
    else if (state === STATE_NEW) { drawNewMessage(); }
    else if (state === STATE_PLACE) { drawPlaceConfirm(); }
    else if (state === STATE_CARD) { drawCardFocus(); }
    else if (state === STATE_BOARD) { drawBoard(); }
    else if (state === STATE_DEMO) { drawDemo(); }

    // Toast overlay
    if (_toastText) { drawToast(_toastText); }
}

function drawButton(x, y, w, h, label, active) {
    const corner = Math.round(h * BUTTON_CORNER_FRAC);
    // plate
    canvas.noStroke(); const bg = active ? COL_ACCENT : COL_CARD;
    canvas.fill(bg.x, bg.y, bg.z, active ? Math.min(255, bg.w) : bg.w);
    canvas.rect(x, y, w, h, corner);
    // outline
    canvas.noFill(); const sc = active ? COL_STROKE_ACCENT : COL_STROKE;
    canvas.stroke(sc.x, sc.y, sc.z, sc.w); canvas.strokeWeight(Math.max(2, Math.round(h * 0.10)));
    canvas.rect(x, y, w, h, corner);
    // label
    const size = Math.round(H * LABEL_TEXT_FRAC);
    canvas.textSize(Math.min(size, canvas.fitTextSize(label, Math.round(w * 0.88), Math.round(h * 0.7))));
    canvas.stroke(0,0,0); canvas.strokeWeight(Math.max(2, Math.round(canvas.textLineHeight()*0.10)));
    canvas.fill(COL_TEXT.x, COL_TEXT.y, COL_TEXT.z, COL_TEXT.w);
    canvas.textAlign('center','middle');
    canvas.textBox(label, x + Math.round(w*0.06), y + Math.round(h*0.15), Math.round(w*0.88), Math.round(h*0.7), 0);
}

function drawHome() {
    const bandH = Math.round(H * SECTION_HEIGHT_HOME);
    const topY = Math.round(H * SECTION_TOP_HOME);

    const w = Math.round(W * BUTTON_WIDTH_FRAC);
    const h = Math.round(H * BUTTON_HEIGHT_FRAC);
    const gutter = Math.round(H * BUTTON_GUTTER_FRAC);
    const x = Math.round(W * 0.5 - w * 0.5);

    const total = h*3 + gutter*2; const startY = Math.round(topY + (bandH - total)*0.5);

    // NEW MESSAGE
    const y1 = startY; drawButton(x, y1, w, h, "NEW MESSAGE", false); addHit("home:new", x - edgePad, y1 - edgePad, w + edgePad*2, h + edgePad*2);
    // MESSAGE BOARD
    const y2 = y1 + h + gutter; drawButton(x, y2, w, h, "MESSAGE BOARD", false); addHit("home:board", x - edgePad, y2 - edgePad, w + edgePad*2, h + edgePad*2);
    // DEMO
    const y3 = y2 + h + gutter; drawButton(x, y3, w, h, "DEMO", false); addHit("home:demo", x - edgePad, y3 - edgePad, w + edgePad*2, h + edgePad*2);
}

function drawChipsRow(labels, selected) {
    const w = Math.round(W * BUTTON_WIDTH_FRAC);
    const h = Math.round(H * 0.085);
    const gutter = Math.round(H * 0.020);
    const x = Math.round(W * 0.5 - w * 0.5);
    let y = Math.round(H * 0.30);

    for (let i = 0; i < labels.length; i++) {
        const active = (labels[i] === selected);
        drawButton(x, y, w, h, labels[i], active);
        addHit("preset:" + labels[i], x - edgePad, y - edgePad, w + edgePad*2, h + edgePad*2);
        y += h + gutter;
    }
    // PLACE MESSAGE button
    const placeH = Math.round(H * 0.10);
    const placeY = y + Math.round(H * 0.02);
    const disabled = !selected;
    const corner = Math.round(placeH * BUTTON_CORNER_FRAC);
    const bg = disabled ? COL_CARD_DIM : COL_ACCENT;
    const stroke = disabled ? COL_STROKE : COL_STROKE_ACCENT;
    // plate
    canvas.noStroke(); canvas.fill(bg.x, bg.y, bg.z, bg.w); canvas.rect(x, placeY, w, placeH, corner);
    // outline
    canvas.noFill(); canvas.stroke(stroke.x, stroke.y, stroke.z, stroke.w); canvas.strokeWeight(Math.max(2, Math.round(placeH * 0.10))); canvas.rect(x, placeY, w, placeH, corner);
    // label
    const size = Math.round(H * LABEL_TEXT_FRAC);
    const label = "PLACE MESSAGE";
    canvas.textSize(Math.min(size, canvas.fitTextSize(label, Math.round(w*0.88), Math.round(placeH*0.7))));
    canvas.stroke(0,0,0); canvas.strokeWeight(Math.max(2, Math.round(canvas.textLineHeight()*0.10)));
    canvas.fill(COL_TEXT.x, COL_TEXT.y, COL_TEXT.z, COL_TEXT.w);
    canvas.textAlign('center','middle');
    canvas.textBox(label, x + Math.round(w*0.06), placeY + Math.round(placeH*0.15), Math.round(w*0.88), Math.round(placeH*0.7), 0);

    if (!disabled) { addHit("place:message", x - edgePad, placeY - edgePad, w + edgePad*2, placeH + edgePad*2); }

    // back
    const backH = Math.round(H * 0.07); const backY = Math.round(H * 0.86);
    drawButton(x, backY, w, backH, "BACK", false); addHit("back:home", x - edgePad, backY - edgePad, w + edgePad*2, backH + edgePad*2);
}

function drawNewMessage() { drawChipsRow(PRESETS, selectedPreset); }

function drawPlaceConfirm() { /* kept simple — merged into drawChipsRow flow */ }

function drawCardPlate(x, y, w, h, dimmed) {
    const r = Math.round(h * 0.18);
    const bg = dimmed ? COL_CARD_DIM : COL_CARD;
    canvas.noStroke(); canvas.fill(bg.x, bg.y, bg.z, bg.w); canvas.rect(x, y, w, h, r);
    canvas.noFill(); const sc = dimmed ? COL_STROKE : COL_STROKE_ACCENT;
    canvas.stroke(sc.x, sc.y, sc.z, sc.w); canvas.strokeWeight(Math.max(2, Math.round(h*0.10)));
    canvas.rect(x, y, w, h, r);
}

function drawSmallLabel(text, x, y, w, h, center) {
    const size = Math.round(H * SMALL_TEXT_FRAC);
    canvas.textSize(Math.min(size, canvas.fitTextSize(text, w, h)));
    canvas.stroke(0,0,0); canvas.strokeWeight(Math.max(2, Math.round(canvas.textLineHeight()*0.08)));
    canvas.fill(COL_TEXT_SUB.x, COL_TEXT_SUB.y, COL_TEXT_SUB.z, COL_TEXT_SUB.w);
    canvas.textAlign(center ? 'center' : 'left', 'middle');
    canvas.textBox(text, x, y, w, h, 0);
}

function drawPrimaryLabel(text, x, y, w, h) {
    const size = Math.round(H * HEADER_TEXT_FRAC);
    canvas.textSize(Math.min(size, canvas.fitTextSize(text, w, h)));
    canvas.stroke(0,0,0); canvas.strokeWeight(Math.max(2, Math.round(canvas.textLineHeight()*0.10)));
    canvas.fill(COL_TEXT.x, COL_TEXT.y, COL_TEXT.z, COL_TEXT.w);
    canvas.textAlign('center','middle');
    canvas.textBox(text, x, y, w, h, 0);
}

function drawCardFocus() {
    const m = byId(focusedId); if (!m) { setState(STATE_HOME); return; }
    const w = Math.round(W * 0.78); const h = Math.round(H * 0.36);
    const x = Math.round(W * 0.5 - w * 0.5); const y = Math.round(H * 0.28);

    // Entrance transform
    const s = enterObj.s || 1; const a = (enterObj.a != null) ? enterObj.a : 1;
    canvas.push(); canvas.translate(x + w*0.5, y + h*0.5); canvas.scale(s, s); canvas.globalAlpha(Math.max(0.4, a));
    drawCardPlate(-w*0.5, -h*0.5, w, h, m.status === STATUS_DONE);

    // Title
    drawPrimaryLabel(m.presetType, -w*0.5 + Math.round(w*0.06), -h*0.5 + Math.round(h*0.10), Math.round(w*0.88), Math.round(h*0.24));

    // Status + time row
    const rowY = -h*0.5 + Math.round(h*0.26);
    drawSmallLabel(m.status, -w*0.5 + Math.round(w*0.06), rowY, Math.round(w*0.44), Math.round(h*0.14), false);
    drawSmallLabel(m.createdLabel, -w*0.5 + Math.round(w*0.50), rowY, Math.round(w*0.44), Math.round(h*0.14), true);

    // Buttons
    const bw = Math.round(w * 0.42); const bh = Math.round(h * 0.22);
    const bx1 = -w*0.5 + Math.round(w*0.06); const bx2 = w*0.5 - Math.round(w*0.06) - bw;
    const by = -h*0.5 + Math.round(h*0.58);
    drawButton(bx1, by, bw, bh, "ACKNOWLEDGE", false);
    addHit("card:ack", x + bx1 - edgePad + w*0.5, y + by - edgePad + h*0.5, bw + edgePad*2, bh + edgePad*2);
    drawButton(bx2, by, bw, bh, "COMPLETE", false);
    addHit("card:done", x + bx2 - edgePad + w*0.5, y + by - edgePad + h*0.5, bw + edgePad*2, bh + edgePad*2);

    canvas.pop();

    // Bridge effect (subtle pulse from hub to card top-left)
    const hubX = Math.round(W * 0.5); const hubY = Math.round(H * 0.82);
    const cardTopX = x + Math.round(w * 0.12); const cardTopY = y - Math.round(h * 0.06);
    canvas.noFill(); canvas.stroke(COL_ACCENT_SOFT.x, COL_ACCENT_SOFT.y, COL_ACCENT_SOFT.z, COL_ACCENT_SOFT.w);
    canvas.strokeWeight(Math.max(2, Math.round(H * 0.006)));
    canvas.line(hubX, hubY, cardTopX, cardTopY);
    // moving pulse as small circle along the line based on pulseObj.s
    const t = (pulseObj.s - 1) / PULSE_SCALE_ADD; // 0..1 during pulse
    const px = Math.round(hubX + (cardTopX - hubX) * Math.max(0, Math.min(1, t)));
    const py = Math.round(hubY + (cardTopY - hubY) * Math.max(0, Math.min(1, t)));
    canvas.noStroke(); canvas.fill(COL_ACCENT.x, COL_ACCENT.y, COL_ACCENT.z, 200);
    canvas.circle(px, py, Math.max(6, Math.round(H * 0.012)));

    // Back
    const bw2 = Math.round(W * 0.72), bh2 = Math.round(H * 0.07);
    const bx = Math.round(W * 0.5 - bw2 * 0.5); const by2 = Math.round(H * 0.88);
    drawButton(bx, by2, bw2, bh2, "BACK", false); addHit("back:home", bx - edgePad, by2 - edgePad, bw2 + edgePad*2, bh2 + edgePad*2);
}

function drawBoard() {
    const padding = marginX; const listW = Math.round(W * 0.86);
    const x = Math.round(W * 0.5 - listW * 0.5); let y = Math.round(H * 0.24);

    // Header
    const active = messages.filter(m=>m.status!==STATUS_DONE).length; const done = messages.filter(m=>m.status===STATUS_DONE).length;
    drawPrimaryLabel("YOUR BRIDGE", x, y - Math.round(H*0.12), listW, Math.round(H*0.08));
    drawSmallLabel(active + " ACTIVE • " + done + " COMPLETED", x, y - Math.round(H*0.06), listW, Math.round(H*0.06), true);

    if (messages.length === 0) {
        drawSmallLabel("No messages yet.", x, y, listW, Math.round(H*0.08), true);
        drawSmallLabel("Create your first bridge.", x, y + Math.round(H*0.06), listW, Math.round(H*0.08), true);
        const bw = Math.round(W * 0.72), bh = Math.round(H * 0.08); const by = Math.round(H * 0.70);
        const bx = Math.round(W * 0.5 - bw * 0.5);
        drawButton(bx, by, bw, bh, "NEW MESSAGE", false); addHit("board:new", bx - edgePad, by - edgePad, bw + edgePad*2, bh + edgePad*2);
    } else {
        // List cards compact
        const itemH = Math.round(H * 0.14); const gap = Math.round(H * 0.018);
        for (let i = 0; i < messages.length; i++) {
            const m = messages[i];
            const ih = itemH; const iw = listW; const ix = x; const iy = y;
            drawCardPlate(ix, iy, iw, ih, m.status === STATUS_DONE);
            drawSmallLabel(m.presetType, ix + Math.round(iw*0.04), iy + Math.round(ih*0.22), Math.round(iw*0.50), Math.round(ih*0.28), false);
            drawSmallLabel(m.status + "  •  " + m.createdLabel, ix + Math.round(iw*0.04), iy + Math.round(ih*0.58), Math.round(iw*0.60), Math.round(ih*0.28), false);
            addHit("board:open:" + m.id, ix - edgePad, iy - edgePad, iw + edgePad*2, ih + edgePad*2);
            y += ih + gap;
        }
        // Back
        const bw = Math.round(W * 0.72), bh = Math.round(H * 0.07); const by = Math.round(H * 0.88);
        const bx = Math.round(W * 0.5 - bw * 0.5);
        drawButton(bx, by, bw, bh, "BACK", false); addHit("back:home", bx - edgePad, by - edgePad, bw + edgePad*2, bh + edgePad*2);
    }
}

function drawDemo() {
    // Intro copy handled by text blocks; show skip and return-home when complete
    const bw = Math.round(W * 0.60), bh = Math.round(H * 0.07);
    const bx = Math.round(W * 0.5 - bw * 0.5);
    const by = Math.round(H * 0.86);
    drawButton(bx, by, bw, bh, demoStep >= 8 ? "RETURN HOME" : "SKIP", false);
    addHit(demoStep >= 8 ? "demo:home" : "demo:skip", bx - edgePad, by - edgePad, bw + edgePad*2, bh + edgePad*2);

    // Visualize when a focused card exists during demo
    if (focusedId != null) { drawCardFocus(); }
}

function drawToast(text) {
    const w = Math.round(W * 0.64); const h = Math.round(H * 0.10);
    const x = Math.round(W * 0.5 - w * 0.5); const y = Math.round(H * 0.10);
    canvas.noStroke(); canvas.fill(COL_ACCENT.x, COL_ACCENT.y, COL_ACCENT.z, 220); canvas.rect(x, y, w, h, Math.round(h*0.35));
    const size = Math.round(H * HEADER_TEXT_FRAC);
    canvas.textSize(Math.min(size, canvas.fitTextSize(text, Math.round(w*0.90), Math.round(h*0.7))));
    canvas.stroke(0,0,0); canvas.strokeWeight(Math.max(2, Math.round(canvas.textLineHeight()*0.10)));
    canvas.fill(COL_TEXT.x, COL_TEXT.y, COL_TEXT.z, COL_TEXT.w); canvas.textAlign('center','middle');
    canvas.textBox(text, x + Math.round(w*0.05), y + Math.round(h*0.15), Math.round(w*0.90), Math.round(h*0.7), 0);
}

} catch(e) {
  print("error in controller");
  print(e);
}
