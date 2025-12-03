/* ========================
    p5.js 그림일기 (sketch.js)
======================== */

/* ===== Canvas (responsive) ===== */
let W = 0,
  H = 0;

/* ===== Page margin / spacing ===== */
const PAGE = {
  marginX: 120, // 화면 좌우 여백
  gapCol: 10, // 좌/중앙/우 컬럼 간 가로 간격
  gapStack: 20, // 같은 컬럼 내 위아래 간격
};

/* ===== UI layout (responsive via updateLayout) ===== */
const UI = {
  frameMenu: null, // (우측 위)
  stickerPanel: null, // (좌측 위)
  webcamPanel: null, // (우측 아래)
  toolPanel: null, // (좌측 아래)
  diaryFrameRect: null, // (중앙)
};

// 스티커 패널 5×3 고정 그리드
const STICKER_GRID = {
  cols: 3,
  rows: 5,
  cell: 100,
  gap: 12,
  padX: 40,
  padY: 40,
};

// 이미지 버튼용 전역
let penImg = null;
let eraserImg = null;

// ==== 전역 버튼 rect 저장용 ====
let penBtnRect = null;
let eraserBtnRect = null;
let sizeBtnRects = [];
let colorBtnRects = [];

/* ========================
   Layout (좌/중/우 세 컬럼 세로 중앙 정렬)
======================== */
function updateLayout() {
  W = windowWidth;
  H = windowHeight;

  const { marginX, gapCol, gapStack } = PAGE;

  /* ── 좌측(스티커 패널) 최소 필요 폭: padX 기준 */
  const spWMin =
    STICKER_GRID.padX * 2 +
    STICKER_GRID.cols * STICKER_GRID.cell +
    (STICKER_GRID.cols - 1) * STICKER_GRID.gap;

  // 좌/우 컬럼 폭
  const leftColW = Math.max(spWMin, Math.min(380, Math.floor(W * 0.26)));
  const rightColW = 260;

  /* ── 프레임 폭(가운데는 무조건 중앙 정렬) */
  const MIN_FRAME_W = 720; // 최소로 유지하고 싶은 프레임 폭
  const TARGET_FRAME_W = 1100; // 이상적으로 두고 싶은 폭
  const MIN_FALLBACK_W = 320; // 아주 좁은 화면에서의 하한(겹침 방지용 완충)

  // 좌우 패널/여백을 제외하고 프레임에 실제로 쓸 수 있는 최대 폭
  const availableAfterPanels =
    W - (marginX * 2 + leftColW + rightColW + gapCol * 2);

  // 너무 작아지지 않도록 완충치 적용
  const maxFrameW = Math.max(MIN_FALLBACK_W, availableAfterPanels);

  // centerW를 [minBound, maxFrameW] 범위로 제한
  const minBound = Math.min(MIN_FRAME_W, maxFrameW);
  let centerW = Math.min(TARGET_FRAME_W, maxFrameW);
  centerW = Math.max(centerW, minBound);

  // 프레임은 화면 가로 중앙
  const centerX = (W - centerW) / 2;

  // 좌/우 패널은 프레임을 기준으로 배치
  const leftX = Math.max(marginX, centerX - gapCol - leftColW);
  const rightX = Math.min(W - marginX - rightColW, centerX + centerW + gapCol);

  /* ── 중앙 프레임 높이 */
  const framePad = 16;
  const contentMaxH = Math.max(560, H - 120);
  const centerH = Math.min(contentMaxH, H - 80);

  /* ── 스티커 패널 높이(타이틀/하단설명 제거 버전) */
  const stickerH =
    STICKER_GRID.padY * 2 +
    STICKER_GRID.rows * STICKER_GRID.cell +
    (STICKER_GRID.rows - 1) * STICKER_GRID.gap;

  /* ── 우측 패널 고정 높이 */
  const frameMenuH = 140;
  const webcamH = 240;

  /* ── 좌측 툴패널 */
  const toolH = 150;

  /* ── 세 컬럼 총 높이 */
  const leftColH = stickerH + gapStack + toolH;
  const rightColH = frameMenuH + gapStack + webcamH;
  const centerColH = centerH;

  // 화면 세로 중앙 정렬을 위한 기준
  const contentH = Math.max(leftColH, rightColH, centerColH);
  const contentTop = Math.max(20, (H - contentH) / 2);

  const leftTop = contentTop + (contentH - leftColH) / 2;
  const rightTop = contentTop + (contentH - rightColH) / 2;
  const midTop = contentTop + (contentH - centerColH) / 2;

  /* ── 좌측 */
  UI.stickerPanel = {
    x: leftX,
    y: leftTop,
    w: leftColW,
    h: stickerH,
    padX: STICKER_GRID.padX,
    padY: STICKER_GRID.padY,
    cell: STICKER_GRID.cell,
    gap: STICKER_GRID.gap,
    cols: STICKER_GRID.cols,
    rows: STICKER_GRID.rows,
  };
  UI.toolPanel = {
    x: leftX,
    y: UI.stickerPanel.y + UI.stickerPanel.h + gapStack,
    w: Math.max(leftColW, 380),
    h: toolH,
    pad: 10,
  };

  /* ── 우측 */
  UI.frameMenu = {
    x: rightX,
    y: rightTop,
    w: rightColW,
    h: frameMenuH,
    itemH: 36,
    pad: 10,
  };
  UI.webcamPanel = {
    x: rightX,
    y: UI.frameMenu.y + UI.frameMenu.h + gapStack,
    w: rightColW,
    h: webcamH,
    pad: 10,
  };

  /* ── 중앙(프레임) */
  UI.diaryFrameRect = {
    x: centerX,
    y: midTop,
    w: centerW,
    h: centerH,
    pad: framePad,
  };
}

/* ===== Frames & Stickers ===== */
const frameDefs = [
  {
    key: "ribbon",
    label: "크리스마스 리본",
    src: "assets/frames/frame_ribbon.png",
  },
  {
    key: "universe",
    label: "우주 소행성",
    src: "assets/frames/frame_universe.png",
  },
  {
    key: "todolist",
    label: "To Do List",
    src: "assets/frames/frame_todolist.png",
  },
];

const stickerDefs = [
  {
    key: "twinkleGreen",
    label: "반짝(초록)",
    src: "assets/stickers/sticker_twinkle_green.png",
  },
  { key: "tree", label: "트리", src: "assets/stickers/sticker_tree.png" },
  {
    key: "ornament",
    label: "오너먼트",
    src: "assets/stickers/sticker_ornament.png",
  },
  { key: "cookie", label: "쿠키", src: "assets/stickers/sticker_cookie.png" },
  { key: "coffee", label: "커피", src: "assets/stickers/sticker_coffee.png" },
  { key: "twinkle", label: "반짝", src: "assets/stickers/sticker_twinkle.png" },
  { key: "sun", label: "해", src: "assets/stickers/sticker_sun.png" },
  { key: "logo", label: "로고", src: "assets/stickers/sticker_logo.png" },
  { key: "bell", label: "방울", src: "assets/stickers/sticker_bell.png" },
  { key: "bird", label: "새", src: "assets/stickers/sticker_bird.png" },
  { key: "pop", label: "팝", src: "assets/stickers/sticker_pop.png" },
  { key: "spring", label: "띠용", src: "assets/stickers/sticker_spring.png" },
  { key: "cloud", label: "구름", src: "assets/stickers/sticker_cloud.png" },
  { key: "snow", label: "눈", src: "assets/stickers/sticker_snow.png" },
  { key: "book", label: "책", src: "assets/stickers/sticker_book.png" },
];

let frames = {};
let stickers = {};
let currentFrameIdx = 0;
let bgImg = null;

/* ===== Drawing tool & layers ===== */
let drawingBelow,
  drawingAbove,
  currentStrokeLayer = null;
let drawTool = "pen";
let penSize = 8;
let eraserSize = 16;
let brushColor = "#1f2937";
const palette = ["#FF8A9B", "#7A4100", "#6BC743", "#79BADB"];

/* ===== Webcam ===== */
let cam,
  webcamReady = false;

/* ===== Draggables (stickers/photos) ===== */
let draggables = [];
let draggingIdx = -1;

/* transform state */
let activeMode = null;
let startMouse = { x: 0, y: 0 };
let startPos = { x: 0, y: 0 };
let startScale = 1;
let startAngle = 0;

let blockDrawThisPress = false;
let drawingThisStroke = false;
let pressedOnItemIndex = -1;
let pressStart = { x: 0, y: 0 };
const PRESS_MOVE_THRESHOLD = 6;
let spawnDrag = null;

/* ========================
    Utils
======================== */
function drawPanel(x, y, w, h, title) {
  push();
  noStroke();
  fill(255);
  rect(x, y, w, h, 14);
  fill(17, 24, 39);
  textSize(14);
  textStyle(BOLD);
  text(title, x + 12, y + 22);
  pop();
}
function inRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}
function loadOrPlaceholder(src) {
  return new Promise((res) =>
    loadImage(
      src,
      (img) => res(img),
      (_) => res(null)
    )
  );
}
function drawImageOrPlaceholder(img, x, y, w, h, label = "Image") {
  if (img) {
    image(img, x, y, w, h);
    return;
  }
  push();
  stroke(200);
  fill(245);
  rect(x, y, w, h, 10);
  stroke(150);
  line(x, y, x + w, y + h);
  line(x + w, y, x, y + h);
  noStroke();
  fill(120);
  textSize(12);
  textAlign(CENTER, CENTER);
  text(label, x + w / 2, y + h / 2);
  pop();
}
function drawCoverImage(img, w, h) {
  if (!img) {
    background("#e5e7eb");
    return;
  }
  const ir = img.width / img.height,
    cr = w / h;
  let dw, dh;
  if (cr > ir) {
    dw = w;
    dh = w / ir;
  } else {
    dh = h;
    dw = h * ir;
  }
  image(img, (width - dw) / 2, (height - dh) / 2, dw, dh);
}
function needsResizeCursorSwap(a) {
  let d = ((a * 180) / Math.PI) % 180;
  if (d < 0) d += 180;
  return d >= 45 && d < 135;
}
function topmostItemAt(mx, my) {
  for (let i = draggables.length - 1; i >= 0; i--) {
    if (draggables[i].contains(mx, my)) return i;
  }
  return -1;
}

/* ========================
    Class: DraggableItem
======================== */
class DraggableItem {
  constructor({ type, key = null, img = null, x, y, w, h }) {
    this.type = type;
    this.key = key;
    this.img = img;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.scale = 1;
    this.angle = 0;
    this.selected = false;
    this.handleSize = 10;
    this.rotHandleR = 7;
    this.rotHandleGap = 18;
    this.delSize = 14;
  }
  draw() {
    const hovered =
      this.contains(mouseX, mouseY) &&
      !this.selected &&
      draggingIdx < 0 &&
      !activeMode;
    const hoverScale = hovered ? 1.06 : 1.0;
    push();
    translate(this.x + this.w / 2, this.y + this.h / 2);
    rotate(this.angle);
    scale(this.scale * hoverScale);
    drawImageOrPlaceholder(
      this.img,
      -this.w / 2,
      -this.h / 2,
      this.w,
      this.h,
      this.type.toUpperCase()
    );
    if (this.selected) {
      noFill();
      stroke("#3b82f6");
      strokeWeight(2);
      rectMode(CENTER);
      rect(0, 0, this.w, this.h);
      const s = this.handleSize;
      noStroke();
      fill("#3b82f6");
      rect(-this.w / 2, -this.h / 2, s, s);
      rect(this.w / 2, this.h / 2, s, s);
      rect(-this.w / 2, this.h / 2, s, s);
      const topY = -this.h / 2,
        cy = topY - this.rotHandleGap;
      stroke("#3b82f6");
      strokeWeight(2);
      line(0, topY, 0, cy);
      noStroke();
      fill("#3b82f6");
      circle(0, cy, this.rotHandleR * 2);
      const ds = this.delSize,
        cxDel = this.w / 2,
        cyDel = -this.h / 2;
      push();
      rectMode(CENTER);
      noStroke();
      fill("#ef4444");
      rect(cxDel, cyDel, ds, ds);
      stroke(255);
      strokeWeight(2);
      line(
        cxDel - ds * 0.3,
        cyDel - ds * 0.3,
        cxDel + ds * 0.3,
        cyDel + ds * 0.3
      );
      line(
        cxDel - ds * 0.3,
        cyDel + ds * 0.3,
        cxDel + ds * 0.3,
        cyDel - ds * 0.3
      );
      pop();
    }
    pop();
  }
  screenToLocal(mx, my) {
    const cx = this.x + this.w / 2,
      cy = this.y + this.h / 2;
    let px = mx - cx,
      py = my - cy;
    const c = Math.cos(-this.angle),
      s = Math.sin(-this.angle);
    const rx = px * c - py * s,
      ry = px * s + py * c;
    return { x: rx / this.scale, y: ry / this.scale };
  }
  contains(mx, my) {
    const p = this.screenToLocal(mx, my);
    return (
      p.x >= -this.w / 2 &&
      p.x <= this.w / 2 &&
      p.y >= -this.h / 2 &&
      p.y <= this.h / 2
    );
  }
  hitWhat(mx, my) {
    if (!this.selected) return null;
    const p = this.screenToLocal(mx, my),
      s = this.handleSize,
      half = s / 2;
    const ds = this.delSize,
      cxDel = this.w / 2,
      cyDel = -this.h / 2;
    if (Math.abs(p.x - cxDel) <= ds / 2 && Math.abs(p.y - cyDel) <= ds / 2)
      return { type: "delete" };
    const corners = {
      nw: { x: -this.w / 2, y: -this.h / 2 },
      se: { x: this.w / 2, y: this.h / 2 },
      sw: { x: -this.w / 2, y: this.h / 2 },
    };
    for (const k of ["nw", "se", "sw"]) {
      const c = corners[k];
      if (
        p.x >= c.x - half &&
        p.x <= c.x + half &&
        p.y >= c.y - half &&
        p.y <= c.y + half
      )
        return { type: "resize", corner: k };
    }
    const topY = -this.h / 2,
      cy = topY - this.rotHandleGap,
      d = dist(p.x, p.y, 0, cy);
    if (d <= this.rotHandleR + 2) return { type: "rotate" };
    return null;
  }
}

/* ========================
    p5 lifecycle
======================== */
function preload() {
  bgImg = loadImage("assets/background.png");
  for (const f of frameDefs) {
    frames[f.key] = loadImage(f.src);
  }
  for (const s of stickerDefs) {
    stickers[s.key] = loadImage(s.src);
  }

  penImg = loadImage("assets/pen2.png");
  eraserImg = loadImage("assets/eraser2.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  updateLayout();
  recreateDrawingLayers(null, null);
  cam = createCapture(VIDEO, () => {
    webcamReady = true;
  });
  cam.hide();
  textFont(
    "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans KR, Apple SD Gothic Neo, Malgun 고딕, 맑은 고딕, sans-serif"
  );
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  const ob = drawingBelow,
    oa = drawingAbove;
  updateLayout();
  recreateDrawingLayers(ob, oa);
}
function recreateDrawingLayers(oldBelow, oldAbove) {
  const newW = UI.diaryFrameRect.w - UI.diaryFrameRect.pad * 2;
  const newH = UI.diaryFrameRect.h - UI.diaryFrameRect.pad * 2;
  const nb = createGraphics(newW, newH);
  nb.clear();
  const na = createGraphics(newW, newH);
  na.clear();
  if (oldBelow) nb.image(oldBelow, 0, 0, newW, newH);
  if (oldAbove) na.image(oldAbove, 0, 0, newW, newH);
  drawingBelow = nb;
  drawingAbove = na;
}
function draw() {
  // 배경은 화면 꽉 채움
  drawCoverImage(bgImg, width, height);

  // 프레임
  const frameKey = frameDefs[currentFrameIdx].key;
  drawImageOrPlaceholder(
    frames[frameKey],
    UI.diaryFrameRect.x,
    UI.diaryFrameRect.y,
    UI.diaryFrameRect.w,
    UI.diaryFrameRect.h,
    "Frame"
  );

  // 레이어
  const gx = UI.diaryFrameRect.x + UI.diaryFrameRect.pad;
  const gy = UI.diaryFrameRect.y + UI.diaryFrameRect.pad;
  image(drawingBelow, gx, gy);
  for (const d of draggables) d.draw();
  image(drawingAbove, gx, gy);

  // 패널
  drawStickerPanel();
  drawToolPanel();
  drawFrameMenu();
  drawWebcamPanel();

  handleDrawing();

  if (spawnDrag) {
    const img = stickers[spawnDrag.key];
    const dw = spawnDrag.w,
      dh = spawnDrag.h,
      dx = mouseX - dw / 2,
      dy = mouseY - dh / 2;
    push();
    if (img) tint(255, 200);
    drawImageOrPlaceholder(img, dx, dy, dw, dh, "STICKER");
    pop();
  }
  setCursorSmart();
}

/* ========================
    Panels
======================== */
function drawFrameMenu() {
  const { x, y, w, h, pad, itemH } = UI.frameMenu;
  drawPanel(x, y, w, h, "<일기 프레임 선택>");
  push();
  textSize(13);
  textStyle(NORMAL);
  let yy = y + 32;
  for (let i = 0; i < frameDefs.length; i++) {
    const r = { x: x + pad, y: yy - 20, w: w - pad * 2, h: itemH };
    const hovered = inRect(mouseX, mouseY, r);
    fill(i === currentFrameIdx ? "#1f2937" : hovered ? "#111827" : "#374151");
    noStroke();
    rect(r.x, r.y, r.w, r.h, 8);
    fill(255);
    text(`(${["J", "K", "L"][i]}) ${frameDefs[i].label}`, r.x + 10, r.y + 23);
    yy += itemH + 8;
  }
  pop();
}

// 패널 내부에서 (제목/하단 도움말 제외) 영역 기준으로 그리드를 가로·세로 모두 중앙 배치
function computeStickerGridOrigin() {
  const { x, y, w, h, padX, padY, cell, gap, cols, rows } = UI.stickerPanel;

  const innerW = w - padX * 2;
  const innerH = h - padY * 2;

  const gridW = cols * cell + (cols - 1) * gap;
  const gridH = rows * cell + (rows - 1) * gap;

  const offsetX = Math.max(0, (innerW - gridW) / 2);
  const offsetY = Math.max(0, (innerH - gridH) / 2);

  const startX = x + padX + offsetX;
  const startY = y + padY + offsetY;

  return { startX, startY };
}

function drawStickerPanel() {
  const { x, y, w, h, padX, padY, cell, gap, cols, rows } = UI.stickerPanel;
  drawPanel(x, y, w, h);

  const { startX, startY } = computeStickerGridOrigin();

  push();
  for (let i = 0; i < Math.min(stickerDefs.length, cols * rows); i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const r = {
      x: startX + col * (cell + gap),
      y: startY + row * (cell + gap),
      w: cell,
      h: cell,
    };

    const hovered = inRect(mouseX, mouseY, r);
    const img = stickers[stickerDefs[i].key];

    const m = 8; // 셀 안쪽 여백
    const baseW = cell - 2 * m;
    const baseH = cell - 2 * m;
    const s = hovered ? 1.06 : 1.0; // 호버 확대
    const dw = baseW * s,
      dh = baseH * s;
    const dx = r.x + m + (baseW - dw) / 2;
    const dy = r.y + m + (baseH - dh) / 2;

    drawImageOrPlaceholder(img, dx, dy, dw, dh, stickerDefs[i].label);
  }
}

function drawWebcamPanel() {
  const { x, y, w, h } = UI.webcamPanel;
  drawPanel(x, y, w, h, "웹캠 (P: 사진 찍기)");
  const vw = w - 20,
    vh = h - 50,
    vx = x + 10,
    vy = y + 32;
  if (webcamReady) {
    const ir = (cam.width || 4) / (cam.height || 3),
      pr = vw / vh;
    let dw, dh;
    if (pr > ir) {
      dh = vh;
      dw = vh * ir;
    } else {
      dw = vw;
      dh = vw / ir;
    }
    image(cam, vx + (vw - dw) / 2, vy + (vh - dh) / 2, dw, dh);
  } else {
    drawImageOrPlaceholder(null, vx, vy, vw, vh, "Webcam");
  }
  fill("#6b7280");
  noStroke();
  textSize(12);
  text("P 키로 사진을 찍어\n프레임에 붙일 수 있어요.", x + 10, y + h - 10);
}

function drawToolPanel() {
  const { x, y, w, h, pad } = UI.toolPanel;

  drawPanel(x, y, w, h, "");

  // ---------------------------------------------------
  // 1) 펜/지우개 버튼 rect 계산 (전역 저장)
  // ---------------------------------------------------
  const btnSize = 150;
  const startX = x + pad;
  const baseY = y + pad + 10;

  penBtnRect = { x: startX, y: baseY, w: btnSize, h: btnSize };
  eraserBtnRect = {
    x: startX + btnSize + 6,
    y: baseY,
    w: btnSize,
    h: btnSize,
  };

  drawImageOnlyButton(penBtnRect, penImg, drawTool === "pen");
  drawImageOnlyButton(eraserBtnRect, eraserImg, drawTool === "eraser");

  // ---------------------------------------------------
  // 2) 굵기 버튼 rect 계산 (전역 저장)
  // ---------------------------------------------------
  sizeBtnRects = [];

  const sizes = [6, 9, 12, 16];
  const spacing = 12;
  const baseDot = 20;

  const sizeX = eraserBtnRect.x + btnSize + 30;
  let sizeY = baseY;

  for (const s of sizes) {
    const r = { x: sizeX, y: sizeY, w: baseDot, h: baseDot };
    sizeBtnRects.push({ rect: r, size: s });

    const hovered = inRect(mouseX, mouseY, r);
    const active =
      (drawTool === "pen" && penSize === s) ||
      (drawTool === "eraser" && eraserSize === s);

    const scaleFactor = hovered ? 1.25 : 1.0;

    push();
    translate(r.x + baseDot / 2, r.y + baseDot / 2);
    scale(scaleFactor);

    if (active) {
      stroke("#ff6666");
      strokeWeight(2);
    } else noStroke();

    fill("#111827");
    circle(0, 0, s * 1.4);
    pop();

    sizeY += baseDot + spacing;
  }

  // ---------------------------------------------------
  // 3) 색상 버튼 rect 계산 (전역 저장) — Hover scale + Active red border
  // ---------------------------------------------------
  colorBtnRects = [];

  let px = sizeX + 60;
  let py = baseY;

  for (const c of palette) {
    const base = 28;
    const r = { x: px, y: py, w: base, h: base };
    colorBtnRects.push({ rect: r, color: c });

    const hovered = inRect(mouseX, mouseY, r);
    const active = c === brushColor;
    const scaleFactor = hovered ? 1.15 : 1.0;

    // 그림: 중앙 기준으로 스케일
    push();
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    translate(cx, cy);
    scale(scaleFactor);
    rectMode(CENTER);

    // 선택(활성) 시 빨간 테두리, 아니면 연회색/호버시 조금 진한 테두리
    if (active) {
      stroke("#ff6666");
      strokeWeight(2);
    } else {
      stroke(hovered ? "#9ca3af" : "#d1d5db");
      strokeWeight(1);
    }

    fill(c);
    rect(0, 0, r.w, r.h, 6);
    pop();

    py += 34;
  }
}

function drawButton(r, label, active = false) {
  const hovered = inRect(mouseX, mouseY, r);
  push();
  noStroke();
  fill(active ? "#1f2937" : hovered ? "#374151" : "#4b5563");
  rect(r.x, r.y, r.w, r.h, 10);
  fill(255);
  textSize(13);
  textAlign(CENTER, CENTER);
  text(label, r.x + r.w / 2, r.y + r.h / 2);
  pop();
}

/* ========================
    Input
======================== */
function mousePressed() {
  // 우측 프레임 메뉴
  const { x, y, w, h, pad, itemH } = UI.frameMenu;
  if (inRect(mouseX, mouseY, { x, y, w, h })) {
    let yy = y + 32;
    for (let i = 0; i < frameDefs.length; i++) {
      const r = { x: x + pad, y: yy - 20, w: w - pad * 2, h: itemH };
      if (inRect(mouseX, mouseY, r)) {
        currentFrameIdx = i;
        return;
      }
      yy += itemH + 8;
    }
  }

  // 좌측 스티커 패널
  if (inRect(mouseX, mouseY, UI.stickerPanel)) {
    const slot = locateStickerSlot(mouseX, mouseY);
    if (slot) {
      const sd = stickerDefs[slot.idx];
      spawnDrag = { type: "sticker", key: sd.key, w: 96, h: 96 };
      return;
    }
  }

  // 툴 패널
  if (inRect(mouseX, mouseY, UI.toolPanel)) {
    handleToolPanelClick();
    return;
  }

  // 선택/드로잉 초기화
  blockDrawThisPress = false;
  drawingThisStroke = false;
  currentStrokeLayer = null;
  pressedOnItemIndex = -1;

  // 선택된 스티커의 핸들/삭제
  for (let i = draggables.length - 1; i >= 0; i--) {
    const sel = draggables[i];
    const hit = sel.hitWhat(mouseX, mouseY);
    if (hit) {
      if (hit.type === "delete") {
        draggables.splice(i, 1);
        draggingIdx = -1;
        activeMode = null;
        blockDrawThisPress = true;
        return;
      }
      draggables.forEach((d) => (d.selected = false));
      sel.selected = true;
      draggingIdx = i;
      activeMode = hit.type === "resize" ? `resize-${hit.corner}` : "rotate";
      startMouse.x = mouseX;
      startMouse.y = mouseY;
      startPos.x = sel.x;
      startPos.y = sel.y;
      startScale = sel.scale;
      startAngle = sel.angle;
      return;
    }
  }

  // 선택된 스티커 본체 이동
  for (let i = draggables.length - 1; i >= 0; i--) {
    const sel = draggables[i];
    if (sel.selected && sel.contains(mouseX, mouseY)) {
      draggingIdx = i;
      activeMode = "move";
      startMouse.x = mouseX;
      startMouse.y = mouseY;
      startPos.x = sel.x;
      startPos.y = sel.y;
      return;
    }
  }

  // 미선택 스티커 위 클릭 → 나중에 판별
  const topIdx = topmostItemAt(mouseX, mouseY);
  if (topIdx >= 0) {
    pressedOnItemIndex = topIdx;
    pressStart.x = mouseX;
    pressStart.y = mouseY;
    blockDrawThisPress = true;
    return;
  }

  // 선택 해제
  let had = false;
  draggables.forEach((d) => {
    if (d.selected) had = true;
    d.selected = false;
  });
  if (had) {
    blockDrawThisPress = true;
    activeMode = null;
    draggingIdx = -1;
    return;
  }

  // 프레임 내부 드로잉
  const f = UI.diaryFrameRect,
    gx = f.x + f.pad,
    gy = f.y + f.pad;
  const inside =
    mouseX >= gx &&
    mouseX <= gx + drawingBelow.width &&
    mouseY >= gy &&
    mouseY <= gy + drawingBelow.height;
  if (inside && (drawTool === "pen" || drawTool === "eraser")) {
    drawingThisStroke = true;
    currentStrokeLayer = "below";
    return;
  }
}

function mouseDragged() {
  if (spawnDrag) return;

  if (draggingIdx >= 0 && activeMode) {
    const item = draggables[draggingIdx];
    if (activeMode === "move") {
      const dx = mouseX - startMouse.x,
        dy = mouseY - startMouse.y;
      item.x = startPos.x + dx;
      item.y = startPos.y + dy;
      return;
    }
    if (activeMode.startsWith("resize-")) {
      const cx = item.x + item.w / 2,
        cy = item.y + item.h / 2;
      const d0 = Math.hypot(startMouse.x - cx, startMouse.y - cy),
        d1 = Math.hypot(mouseX - cx, mouseY - cy);
      let s = startScale * (d1 / Math.max(30, d0));
      item.scale = constrain(s, 0.2, 5.0);
      return;
    }
    if (activeMode === "rotate") {
      const cx = item.x + item.w / 2,
        cy = item.y + item.h / 2;
      const a0 = Math.atan2(startMouse.y - cy, startMouse.x - cx),
        a1 = Math.atan2(mouseY - cy, mouseX - cx);
      item.angle = startAngle + (a1 - a0);
      return;
    }
  }

  if (pressedOnItemIndex >= 0 && !activeMode) {
    const distMoved = Math.hypot(mouseX - pressStart.x, mouseY - pressStart.y);
    if (
      (drawTool === "pen" || drawTool === "eraser") &&
      distMoved > PRESS_MOVE_THRESHOLD
    ) {
      drawingThisStroke = true;
      currentStrokeLayer = "above";
      pressedOnItemIndex = -1;
      return;
    }
  }
}

function mouseReleased() {
  if (spawnDrag) {
    const { x, y, w, h } = UI.diaryFrameRect;
    if (inRect(mouseX, mouseY, { x, y, w, h })) {
      const key = spawnDrag.key,
        img = stickers[key];
      const nx = mouseX - spawnDrag.w / 2,
        ny = mouseY - spawnDrag.h / 2;
      draggables.push(
        new DraggableItem({
          type: "sticker",
          key,
          img,
          x: nx,
          y: ny,
          w: spawnDrag.w,
          h: spawnDrag.h,
        })
      );
    }
    spawnDrag = null;
  }

  if (!activeMode && !drawingThisStroke && pressedOnItemIndex >= 0) {
    draggables.forEach((d) => (d.selected = false));
    draggables[pressedOnItemIndex].selected = true;
  }

  draggingIdx = -1;
  activeMode = null;
  blockDrawThisPress = false;
  drawingThisStroke = false;
  currentStrokeLayer = null;
  pressedOnItemIndex = -1;
}

function keyPressed() {
  if (key === "J" || key === "j") currentFrameIdx = 0;
  if (key === "K" || key === "k") currentFrameIdx = 1;
  if (key === "L" || key === "l") currentFrameIdx = 2;
  if (key === "P" || key === "p") takePhotoIntoCanvas();
}

/* ========================
    Helpers
======================== */
function locateStickerSlot(mx, my) {
  const { cell, gap, cols, rows } = UI.stickerPanel;
  const { startX, startY } = computeStickerGridOrigin();
  for (let i = 0; i < Math.min(stickerDefs.length, cols * rows); i++) {
    const col = i % cols,
      row = Math.floor(i / cols);
    const r = {
      x: startX + col * (cell + gap),
      y: startY + row * (cell + gap),
      w: cell,
      h: cell,
    };
    if (inRect(mx, my, r)) return { idx: i, rect: r };
  }
  return null;
}
function handleToolPanelClick() {
  // 1) 펜 / 지우개 클릭
  if (penBtnRect && inRect(mouseX, mouseY, penBtnRect)) {
    drawTool = "pen";
    return;
  }
  if (eraserBtnRect && inRect(mouseX, mouseY, eraserBtnRect)) {
    drawTool = "eraser";
    return;
  }

  // 2) 굵기 버튼 클릭
  for (const sBtn of sizeBtnRects) {
    if (inRect(mouseX, mouseY, sBtn.rect)) {
      if (drawTool === "pen") penSize = sBtn.size;
      else eraserSize = sBtn.size;
      return;
    }
  }

  // 3) 색상 버튼 클릭
  for (const cBtn of colorBtnRects) {
    if (inRect(mouseX, mouseY, cBtn.rect)) {
      brushColor = cBtn.color;
      drawTool = "pen"; // 색 선택하면 펜 모드로 전환
      return;
    }
  }
}

function isMouseOverPanelSticker(mx, my) {
  const { cell, gap, cols, rows } = UI.stickerPanel;
  const { startX, startY } = computeStickerGridOrigin();
  for (let i = 0; i < Math.min(stickerDefs.length, cols * rows); i++) {
    const col = i % cols,
      row = Math.floor(i / cols);
    const r = {
      x: startX + col * (cell + gap),
      y: startY + row * (cell + gap),
      w: cell,
      h: cell,
    };
    if (inRect(mx, my, r)) return true;
  }
  return false;
}
function isMouseInFrame(mx, my) {
  const f = UI.diaryFrameRect,
    gx = f.x + f.pad,
    gy = f.y + f.pad;
  return (
    mx >= gx &&
    mx <= gx + drawingBelow.width &&
    my >= gy &&
    my <= gy + drawingBelow.height
  );
}
function handleDrawing() {
  if (pressedOnItemIndex >= 0 && !drawingThisStroke) return;
  if (
    (draggingIdx >= 0 || spawnDrag || activeMode || blockDrawThisPress) &&
    !drawingThisStroke
  )
    return;
  if (!mouseIsPressed) return;
  if (!(drawTool === "pen" || drawTool === "eraser")) return;
  if (!isMouseInFrame(mouseX, mouseY)) return;

  const layer = currentStrokeLayer === "above" ? drawingAbove : drawingBelow;
  const f = UI.diaryFrameRect,
    gx = f.x + f.pad,
    gy = f.y + f.pad;
  const pmx = constrain(pmouseX - gx, 0, layer.width),
    pmy = constrain(pmouseY - gy, 0, layer.height);
  const mx = constrain(mouseX - gx, 0, layer.width),
    my = constrain(mouseY - gy, 0, layer.height);

  if (drawTool === "pen") {
    layer.noErase();
    layer.stroke(brushColor);
    layer.strokeWeight(penSize); // ← 변경
    layer.strokeCap(ROUND);
    layer.line(pmx, pmy, mx, my);
  } else if (drawTool === "eraser") {
    layer.erase();
    layer.strokeWeight(eraserSize); // ← 변경 (기존 16 고정 제거)
    layer.line(pmx, pmy, mx, my);
    layer.noErase();
  }
}
// 이미지 자체를 버튼으로 쓰는 헬퍼 (배경 없음)
function drawImageOnlyButton(r, img, active = false) {
  if (!img) return;

  const hovered = inRect(mouseX, mouseY, r);
  const lift = active ? 6 : hovered ? 3 : 0; // 위로 떠오르기(px)

  // 아이콘 비율 유지해 r 영역 안에 맞춤(cover 아님, contain)
  const iw = r.w,
    ih = r.h;
  const ir = img.width / img.height;
  const rr = iw / ih;
  let dw = iw,
    dh = ih;
  if (rr > ir) {
    // 가로가 넓은 버튼 → 높이에 맞춤
    dh = ih;
    dw = ih * ir;
  } else {
    // 세로가 높은 버튼 → 너비에 맞춤
    dw = iw;
    dh = iw / ir;
  }
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2 - lift;

  // (선택) 살짝 그림자 느낌을 주려면 아래 3줄 주석 해제
  // push(); noStroke(); fill(0, 40); ellipse(cx, cy + dh/2 + 4, dw * 0.8, 6); pop();

  image(img, cx - dw / 2, cy - dh / 2, dw, dh);
}
function drawIconButton(r, img, active = false) {
  const hovered = inRect(mouseX, mouseY, r);
  // 떠오르는 정도
  const lift = active ? 6 : hovered ? 3 : 0;

  // 배경(라운드) & 약한 그림자
  push();
  noStroke();
  // 활성/호버에 따라 톤 다르게
  fill(active ? "#1f2937" : hovered ? "#374151" : "#4b5563");
  rect(r.x, r.y, r.w, r.h, 10);

  // 아이콘 배치 (정가운데, 위로 lift)
  const pad = 8;
  const iw = r.w - pad * 2;
  const ih = r.h - pad * 2;
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2 - lift;

  if (img) {
    // 이미지 비율 맞춰 최대한 채우기
    const ir = img.width / img.height;
    let dw = iw,
      dh = ih;
    const rr = iw / ih;
    if (rr > ir) {
      dw = ih * ir;
      dh = ih;
    } else {
      dh = iw / ir;
      dw = iw;
    }
    image(img, cx - dw / 2, cy - dh / 2, dw, dh);
  } else {
    // 플레이스홀더
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(12);
    text("Icon", cx, cy);
  }
  pop();
}

function takePhotoIntoCanvas() {
  if (!webcamReady) return;
  const snap = cam.get(),
    Wmax = 240,
    Hmax = 180,
    ratio = Math.min(Wmax / snap.width, Hmax / snap.height);
  const w = snap.width * ratio,
    h = snap.height * ratio;
  const cx = UI.diaryFrameRect.x + UI.diaryFrameRect.w / 2 - w / 2;
  const cy = UI.diaryFrameRect.y + UI.diaryFrameRect.h / 2 - h / 2;
  draggables.push(
    new DraggableItem({ type: "photo", img: snap, x: cx, y: cy, w, h })
  );
}
function setCursorSmart() {
  let cursorSet = false;
  if (spawnDrag) {
    cursor(HAND);
    return;
  }
  for (let i = draggables.length - 1; i >= 0 && !cursorSet; i--) {
    const item = draggables[i],
      hit = item.hitWhat(mouseX, mouseY);
    if (hit) {
      if (hit.type === "delete") {
        cursor(HAND);
        cursorSet = true;
        break;
      }
      if (hit.type === "rotate") {
        cursor("grab");
        cursorSet = true;
        break;
      }
    }
  }
  if (!cursorSet) {
    for (let i = draggables.length - 1; i >= 0 && !cursorSet; i--) {
      const item = draggables[i],
        hit = item.hitWhat(mouseX, mouseY);
      if (hit && hit.type === "resize") {
        const swap = needsResizeCursorSwap(item.angle);
        let diag = hit.corner === "nw" || hit.corner === "se" ? "nwse" : "nesw";
        if (swap) diag = diag === "nwse" ? "nesw" : "nwse";
        cursor(diag + "-resize");
        cursorSet = true;
        break;
      } else if (item.contains(mouseX, mouseY)) {
        cursor(HAND);
        cursorSet = true;
        break;
      }
    }
  }
  if (!cursorSet && isMouseOverPanelSticker(mouseX, mouseY)) {
    cursor(HAND);
    cursorSet = true;
  }
  if (!cursorSet) cursor(ARROW);
}
