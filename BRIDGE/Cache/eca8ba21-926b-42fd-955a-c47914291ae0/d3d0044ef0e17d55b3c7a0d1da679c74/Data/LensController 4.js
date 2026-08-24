// Main Controller
//
// Made with Easy Lens

//@input Component.ScriptComponent bridge_title
//@input Component.ScriptComponent bridge_instructions
//@input Component.ScriptComponent bridge_canvas
//@input Component.ScriptComponent sik_tap_safety
//@input Component.ScriptComponent touch_events


try {

// BRIDGE — Spatial workflow prototype using Canvas + UI Buttons + Touch Events

// ─────────────────────────────────────────────────────────────────────────────
// Tunable parameters (surfaced controls)
// ─────────────────────────────────────────────────────────────────────────────
const NODE_COUNT = 4;                         // Person, Task, Deadline, Recipient
const NODE_ROW_FRACTION = 0.62;               // Vertical band for nodes (of canvas height)
const NODE_TOP_FRACTION = 0.22;               // Top offset for nodes band
const NODE_WIDTH_FRAC = 0.60;                 // Node box width as fraction of canvas width
const NODE_HEIGHT_FRAC = 0.10;                // Single node slot height fraction relative to canvas height
const NODE_CORNER_FRAC = 0.18;                // Corner radius as fraction of node height
const NODE_GUTTER_FRAC = 0.030;               // Vertical spacing between nodes (fraction of canvas height)
const ARROW_THICK_PX_FRAC = 0.004;            // Connector thickness fraction of canvas height
const TITLE_TEXT_FRAC = 0.050;                // Title text size as fraction of canvas height
const INSTR_TEXT_FRAC = 0.024;                // Instructions text size as fraction of canvas height
const NODE_LABEL_TEXT_FRAC = 0.030;           // Node label text size fraction
const NODE_META_TEXT_FRAC = 0.028;            // Node value text size fraction
const CHECK_SIZE_FRAC = 0.040;                // Checkmark size fraction (box size)
const BANNER_HEIGHT_FRAC = 0.14;              // Handoff banner height fraction
const BANNER_TEXT_FRAC = 0.050;               // Handoff banner headline size
const SUMMARY_TEXT_FRAC = 0.028;              // Handoff summary size
const SAFE_MARGIN_FRAC = 0.06;                // Horizontal screen margin fraction
const EDGE_HIT_PAD_FRAC = 0.010;              // Hit padding around node for taps

// Colors (0-255 via canvas API; use vec4 for clarity but we will pass numbers)
const COL_BG_CLEAR = new vec4(0, 0, 0, 0);
const COL_NODE_IDLE = new vec4(28, 28, 34, 210);
const COL_NODE_STROKE = new vec4(180, 180, 200, 200);
const COL_NODE_HOVER = new vec4(60, 90, 255, 200);
const COL_NODE_DONE = new vec4(70, 200, 120, 220);
const COL_TEXT_MAIN = new vec4(255, 255, 255, 255);
const COL_TEXT_SUB = new vec4(210, 220, 235, 255);
const COL_TITLE = new vec4(255, 255, 255, 255);
const COL_INSTR = new vec4(200, 210, 225, 255);
const COL_ARROW = new vec4(160, 170, 185, 180);
const COL_BANNER = new vec4(70, 200, 120, 230);
const COL_BANNER_TEXT = new vec4(10, 25, 18, 255);
const COL_CHECK = new vec4(255, 255, 255, 255);

// Flags
const SHOW_TITLE_TEXT = true;
const SHOW_INSTRUCTIONS_TEXT = true;

// ─────────────────────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────────────────────
let canvas = null;
let W = 0, H = 0;

let currentMessage = null; // full sentence string
let parsed = null;         // { person, task, deadline, recipient, action }
let nodeRects = [];        // [{x,y,w,h,label,value,complete}]
let allComplete = false;

// Cache for hit padding and dimensions
let nodeWidth = 0;
let nodeHeight = 0;
let nodeCorner = 0;
let nodeGutter = 0;
let arrowThick = 0;
let checkSize = 0;
let marginX = 0;
let edgePad = 0;

// ─────────────────────────────────────────────────────────────────────────────
// Demo messages and deterministic parsing
// ─────────────────────────────────────────────────────────────────────────────
const demos = [
    {
        sentence: "Ahsan will test the RAG pipeline tomorrow and send the results to Madiha.",
        parse: function() {
            return {
                person: "AHSAN",
                task: "TEST RAG PIPELINE",
                deadline: "TOMORROW",
                recipient: "MADIHA",
                action: "SEND RESULTS"
            };
        }
    },
    {
        sentence: "Sara will prepare the presentation by Friday and send it to the marketing team.",
        parse: function() {
            return {
                person: "SARA",
                task: "PREPARE PRESENTATION",
                deadline: "FRIDAY",
                recipient: "MARKETING TEAM",
                action: "SEND"
            };
        }
    },
    {
        sentence: "Madiha will finish the dashboard today and share it with the team.",
        parse: function() {
            return {
                person: "MADIHA",
                task: "FINISH DASHBOARD",
                deadline: "TODAY",
                recipient: "TEAM",
                action: "SHARE"
            };
        }
    }
];

// ─────────────────────────────────────────────────────────────────────────────
// Initialization
// ─────────────────────────────────────────────────────────────────────────────
script.createEvent("OnStartEvent").bind(function() {
    // Create full-screen onscreen canvas for the graph UI
    canvas = script.bridge_canvas.createOnScreenCanvas();
    W = canvas.getWidth();
    H = canvas.getHeight();

    // Precompute dimensions
    marginX = Math.round(W * SAFE_MARGIN_FRAC);
    nodeWidth = Math.round(W * NODE_WIDTH_FRAC);
    nodeHeight = Math.round(H * NODE_HEIGHT_FRAC);
    nodeCorner = Math.round(nodeHeight * NODE_CORNER_FRAC);
    nodeGutter = Math.round(H * NODE_GUTTER_FRAC);
    arrowThick = Math.max(2, Math.round(H * ARROW_THICK_PX_FRAC));
    checkSize = Math.round(H * CHECK_SIZE_FRAC);
    edgePad = Math.round(H * EDGE_HIT_PAD_FRAC);

    // Text blocks (we only set runtime values; design-time defaults already set)
    if (SHOW_TITLE_TEXT) {
        script.bridge_title.text = "BRIDGE — Spatial AI Handoff";
        script.bridge_title.forceSafeRegion(true);
    }
    if (SHOW_INSTRUCTIONS_TEXT) {
        script.bridge_instructions.text = "Pick a demo message to build the action graph. Tap nodes to mark complete.";
        script.bridge_instructions.forceSafeRegion(true);
    }

    // Bind UI Button taps using component events with null-safe guards
    if (script.msg_btn_1 && script.msg_btn_1.onTap) {
        script.msg_btn_1.onTap.add(function() {
            loadDemo(0);
        });
    } else { debugWarnOnce("msg_btn_1 missing or no onTap; ensure UI Button block is wired"); }

    if (script.msg_btn_2 && script.msg_btn_2.onTap) {
        script.msg_btn_2.onTap.add(function() {
            loadDemo(1);
        });
    } else { debugWarnOnce("msg_btn_2 missing or no onTap; ensure UI Button block is wired"); }

    if (script.msg_btn_3 && script.msg_btn_3.onTap) {
        script.msg_btn_3.onTap.add(function() {
            loadDemo(2);
        });
    } else { debugWarnOnce("msg_btn_3 missing or no onTap; ensure UI Button block is wired"); }

    if (script.reset_btn && script.reset_btn.onTap) {
        script.reset_btn.onTap.add(function() {
            resetWorkflow();
        });
    } else { debugWarnOnce("reset_btn missing or no onTap; ensure UI Button block is wired"); }

    // Set up touch events for node taps (primary)
    if (script.touch_events) {
        script.touch_events.blockDefaultTouches = true;
        script.touch_events.allowDoubleTap = false;
        script.touch_events.enableHint = false;
        if (script.touch_events.onTap) {
            script.touch_events.onTap.add(function(tapX, tapY) {
                // tapX, tapY are normalized [0..1]; convert to canvas pixels
                if (!parsed) { return; }
                const px = Math.round(tapX * W);
                const py = Math.round(tapY * H);
                handleCanvasTap(px, py);
            });
        } else {
            debugWarnOnce("touch_events.onTap unavailable; canvas hit-test disabled");
        }
    } else {
        debugWarnOnce("touch_events block missing; canvas hit-test disabled");
    }

    // SIK tap safety: ensure at least one valid onTap source exists for validator
    if (script.sik_tap_safety) {
        // Keep it enabled and with hint off; do not interfere with main interactions
        script.sik_tap_safety.blockDefaultTouches = false;
        script.sik_tap_safety.allowDoubleTap = false;
        script.sik_tap_safety.enableHint = false;
        if (script.sik_tap_safety.onTap) {
            // No-op listener satisfies ConfigurationValidator expecting a bound target
            script.sik_tap_safety.onTap.add(function(x, y) {
                // Intentionally left blank — safety listener
            });
        } else {
            debugWarnOnce("sik_tap_safety.onTap unavailable; validator safety listener not bound");
        }
    } else {
        debugWarnOnce("sik_tap_safety block missing; validator safety not available");
    }

    // Initial draw
    drawUI();
});

// ─────────────────────────────────────────────────────────────────────────────
// Utilities (logging)
// ─────────────────────────────────────────────────────────────────────────────
var _warned = {};
function debugWarnOnce(msg) {
    if (_warned[msg]) { return; }
    _warned[msg] = true;
    // Use print if available in the environment; otherwise no-op.
    if (typeof print === 'function') { print('[BRIDGE] ' + msg); }
}

// ─────────────────────────────────────────────────────────────────────────────
// Workflow control
// ─────────────────────────────────────────────────────────────────────────────
function loadDemo(index) {
    const entry = demos[index];
    currentMessage = entry.sentence;
    parsed = entry.parse();

    // Build node rectangles positions (vertical chain)
    buildNodeLayout(parsed);

    // Redraw
    drawUI();
}

function resetWorkflow() {
    currentMessage = null;
    parsed = null;
    nodeRects = [];
    allComplete = false;
    drawUI();
}

// ─────────────────────────────────────────────────────────────────────────────
// Layout
// ─────────────────────────────────────────────────────────────────────────────
function buildNodeLayout(p) {
    nodeRects = [];
    allComplete = false;

    const bandH = Math.round(H * NODE_ROW_FRACTION);
    const topY = Math.round(H * NODE_TOP_FRACTION);

    // Compute total occupied height of nodes + gutters
    const totalNodesH = NODE_COUNT * nodeHeight + (NODE_COUNT - 1) * nodeGutter;
    // Center within band
    const startY = Math.round(topY + (bandH - totalNodesH) * 0.5);
    const x = Math.round(W * 0.5 - nodeWidth * 0.5);

    const labels = ["PERSON", "TASK", "DEADLINE", "RECIPIENT"];
    const values = [p.person, p.task, p.deadline, p.recipient];

    for (let i = 0; i < NODE_COUNT; i++) {
        const y = startY + i * (nodeHeight + nodeGutter);
        nodeRects.push({
            x: x,
            y: y,
            w: nodeWidth,
            h: nodeHeight,
            label: labels[i],
            value: values[i],
            complete: false
        });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Interaction
// ─────────────────────────────────────────────────────────────────────────────
function handleCanvasTap(px, py) {
    // Hit-test nodes in order
    for (let i = 0; i < nodeRects.length; i++) {
        const r = nodeRects[i];
        if (pointInRect(px, py, r.x - edgePad, r.y - edgePad, r.w + 2 * edgePad, r.h + 2 * edgePad)) {
            r.complete = !r.complete;
            // After toggle, check completion
            allComplete = nodeRects.length > 0 && nodeRects.every(n => n.complete);
            drawUI();
            return;
        }
    }
}

function pointInRect(px, py, rx, ry, rw, rh) {
    return (px >= rx && px <= rx + rw && py >= ry && py <= ry + rh);
}

// ─────────────────────────────────────────────────────────────────────────────
// Drawing
// ─────────────────────────────────────────────────────────────────────────────
function drawUI() {
    // Clear
    canvas.background(COL_BG_CLEAR.x, COL_BG_CLEAR.y, COL_BG_CLEAR.z, COL_BG_CLEAR.w);

    // Title and instructions are separate Text blocks; still add on-canvas guidance if needed (we keep canvas minimal)

    // Draw graph area if we have a parsed message
    if (parsed) {
        drawNodeChain();
        if (allComplete) {
            drawHandoffBanner();
        }
    } else {
        // Idle instruction on canvas to nudge selection
        drawIdlePrompt();
    }
}

function drawNodeChain() {
    // Connectors
    canvas.noFill();
    canvas.stroke(COL_ARROW.x, COL_ARROW.y, COL_ARROW.z, COL_ARROW.w);
    canvas.strokeWeight(arrowThick);
    for (let i = 0; i < nodeRects.length - 1; i++) {
        const a = nodeRects[i];
        const b = nodeRects[i + 1];
        const ax = a.x + a.w * 0.5;
        const ay = a.y + a.h;
        const bx = b.x + b.w * 0.5;
        const by = b.y;
        // vertical line
        canvas.line(ax, ay, bx, by);

        // small arrow head at 'by'
        const head = Math.max(6, Math.round(arrowThick * 3));
        const half = Math.max(4, Math.round(arrowThick * 2));
        canvas.stroke(COL_ARROW.x, COL_ARROW.y, COL_ARROW.z, COL_ARROW.w);
        canvas.line(bx, by, bx - half, by - head);
        canvas.line(bx, by, bx + half, by - head);
    }

    // Nodes
    for (let i = 0; i < nodeRects.length; i++) {
        drawNode(nodeRects[i]);
    }
}

function drawNode(node) {
    // Box
    canvas.noStroke();
    const bg = node.complete ? COL_NODE_DONE : COL_NODE_IDLE;
    canvas.fill(bg.x, bg.y, bg.z, bg.w);
    canvas.rect(node.x, node.y, node.w, node.h, nodeCorner);

    // Outline
    canvas.noFill();
    const strokeCol = node.complete ? COL_NODE_DONE : COL_NODE_STROKE;
    canvas.stroke(strokeCol.x, strokeCol.y, strokeCol.z, strokeCol.w);
    canvas.strokeWeight(Math.max(2, Math.round(nodeHeight * 0.08)));
    canvas.rect(node.x, node.y, node.w, node.h, nodeCorner);

    // Label (top-left inside node)
    const padX = Math.round(node.h * 0.22);
    const padY = Math.round(node.h * 0.18);

    // Label text sizing
    const labelSlotW = Math.round(node.w * 0.48);
    const labelSlotH = Math.round(node.h * 0.40);
    const labelSize = Math.round(H * NODE_LABEL_TEXT_FRAC);
    canvas.textSize(Math.min(labelSize, canvas.fitTextSize(node.label, labelSlotW, labelSlotH)));
    canvas.stroke(0, 0, 0); // outline for readability
    canvas.strokeWeight(Math.max(2, Math.round(canvas.textLineHeight() * 0.08)));
    canvas.fill(COL_TEXT_SUB.x, COL_TEXT_SUB.y, COL_TEXT_SUB.z, COL_TEXT_SUB.w);
    canvas.textAlign('left', 'top');
    canvas.textBox(node.label, node.x + padX, node.y + padY, labelSlotW, labelSlotH, 0);

    // Value (main)
    const valueSlotY = node.y + Math.round(node.h * 0.42);
    const valueSlotH = Math.round(node.h * 0.44);
    const valueSlotW = node.w - padX * 2 - checkSize - Math.round(node.h * 0.10);
    const valueSize = Math.round(H * NODE_META_TEXT_FRAC);
    canvas.textSize(Math.min(valueSize, canvas.fitTextSize(node.value, valueSlotW, valueSlotH)));
    canvas.stroke(0, 0, 0);
    canvas.strokeWeight(Math.max(2, Math.round(canvas.textLineHeight() * 0.10)));
    canvas.fill(COL_TEXT_MAIN.x, COL_TEXT_MAIN.y, COL_TEXT_MAIN.z, COL_TEXT_MAIN.w);
    canvas.textAlign('left', 'middle');
    canvas.textBox(node.value, node.x + padX, valueSlotY, valueSlotW, valueSlotH, 0);

    // Checkmark (right side), draw whether complete or as a faint badge
    const cx = node.x + node.w - padX - checkSize * 0.5;
    const cy = node.y + node.h * 0.5;
    drawCheck(cx, cy, checkSize, node.complete);
}

function drawCheck(cx, cy, size, active) {
    // Draw a circle background
    const r = size * 0.5;
    canvas.noStroke();
    const baseAlpha = active ? 220 : 90;
    canvas.fill(255, 255, 255, baseAlpha);
    canvas.circle(cx, cy, size);

    // Checkmark path
    const thick = Math.max(2, Math.round(size * 0.16));
    canvas.noFill();
    canvas.stroke(COL_CHECK.x, COL_CHECK.y, COL_CHECK.z, COL_CHECK.w);
    canvas.strokeWeight(thick);

    // Coordinates for a check: start low-left to mid, then up-right
    const x0 = cx - r * 0.45;
    const y0 = cy + r * 0.05;
    const x1 = cx - r * 0.10;
    const y1 = cy + r * 0.35;
    const x2 = cx + r * 0.50;
    const y2 = cy - r * 0.35;

    if (active) {
        canvas.line(x0, y0, x1, y1);
        canvas.line(x1, y1, x2, y2);
    } else {
        // faint "pending" glyph (shorter)
        canvas.globalAlpha(0.5);
        canvas.line(x0, y0, x1, y1);
        canvas.globalAlpha(1.0);
    }
}

function drawHandoffBanner() {
    const bannerH = Math.round(H * BANNER_HEIGHT_FRAC);
    const bannerY = Math.round(H * 0.05);
    const bannerX = marginX;
    const bannerW = W - marginX * 2;
    const radius = Math.round(bannerH * 0.25);

    // Banner plate
    canvas.noStroke();
    canvas.fill(COL_BANNER.x, COL_BANNER.y, COL_BANNER.z, COL_BANNER.w);
    canvas.rect(bannerX, bannerY, bannerW, bannerH, radius);

    // Headline
    const headline = "HANDOFF READY";
    const headSlotX = bannerX + Math.round(bannerW * 0.04);
    const headSlotY = bannerY + Math.round(bannerH * 0.10);
    const headSlotW = Math.round(bannerW * 0.92);
    const headSlotH = Math.round(bannerH * 0.45);
    const headSize = Math.round(H * BANNER_TEXT_FRAC);
    canvas.textSize(Math.min(headSize, canvas.fitTextSize(headline, headSlotW, headSlotH)));
    canvas.stroke(0, 0, 0);
    canvas.strokeWeight(Math.max(2, Math.round(canvas.textLineHeight() * 0.10)));
    canvas.fill(COL_BANNER_TEXT.x, COL_BANNER_TEXT.y, COL_BANNER_TEXT.z, COL_BANNER_TEXT.w);
    canvas.textAlign('center', 'middle');
    canvas.textBox(headline, headSlotX, headSlotY, headSlotW, headSlotH, 0);

    // Summary (full sentence)
    const summary = currentMessage || "";
    const sumSlotY = headSlotY + headSlotH;
    const sumSlotH = Math.max(1, bannerH - (sumSlotY - bannerY) - Math.round(bannerH * 0.10));
    const sumSize = Math.round(H * SUMMARY_TEXT_FRAC);
    canvas.textSize(Math.min(sumSize, canvas.fitTextSize(summary, headSlotW, sumSlotH)));
    canvas.stroke(0, 0, 0);
    canvas.strokeWeight(Math.max(2, Math.round(canvas.textLineHeight() * 0.08)));
    canvas.fill(COL_BANNER_TEXT.x, COL_BANNER_TEXT.y, COL_BANNER_TEXT.z, COL_BANNER_TEXT.w);
    canvas.textAlign('center', 'top');
    canvas.textBox(summary, headSlotX, sumSlotY, headSlotW, sumSlotH, 0);
}

function drawIdlePrompt() {
    const prompt = "Select a demo message to build a BRIDGE action graph";
    const slotW = Math.round(W * 0.74);
    const slotH = Math.round(H * 0.12);
    const slotX = Math.round((W - slotW) * 0.5);
    const slotY = Math.round(H * 0.32);

    canvas.textSize(Math.round(H * INSTR_TEXT_FRAC));
    canvas.stroke(0, 0, 0);
    canvas.strokeWeight(Math.max(2, Math.round(canvas.textLineHeight() * 0.08)));
    canvas.fill(COL_INSTR.x, COL_INSTR.y, COL_INSTR.z, COL_INSTR.w);
    canvas.textAlign('center', 'middle');
    canvas.textBox(prompt, slotX, slotY, slotW, slotH, 0);

    // Decorative faint placeholders for nodes (indicating upcoming layout)
    const demoNodeW = nodeWidth;
    const demoNodeH = nodeHeight;
    const bandH = Math.round(H * NODE_ROW_FRACTION);
    const topY = Math.round(H * NODE_TOP_FRACTION);
    const totalNodesH = NODE_COUNT * demoNodeH + (NODE_COUNT - 1) * nodeGutter;
    const startY = Math.round(topY + (bandH - totalNodesH) * 0.5);
    const x = Math.round(W * 0.5 - demoNodeW * 0.5);

    canvas.noFill();
    canvas.stroke(255, 255, 255, 40);
    canvas.strokeWeight(Math.max(2, Math.round(demoNodeH * 0.08)));
    for (let i = 0; i < NODE_COUNT; i++) {
        const y = startY + i * (demoNodeH + nodeGutter);
        canvas.rect(x, y, demoNodeW, demoNodeH, nodeCorner);
    }
}

} catch(e) {
  print("error in controller");
  print(e);
}
