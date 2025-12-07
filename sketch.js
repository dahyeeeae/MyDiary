/* ===== Canvas (responsive) ===== */
let W = 0,
  H = 0;

/* ===== Page margin / spacing ===== */
const PAGE = {
  marginX: 90, // 화면 좌우 여백
  gapCol: 90, // 좌/중앙/우 컬럼 간 가로 간격
  gapStack: 20, // 같은 컬럼 내 위아래 간격
};

/* ===== UI layout ===== */
const UI = {
  frameMenu: null, // (우측 위)
  stickerPanel: null, // (좌측 위)
  webcamPanel: null, // (우측 아래)
  guidelinePanel: null, // (웹캠 하단)
  toolPanel: null, // (좌측 아래)
  saveButton: null, // (우측 하단)
  diaryFrameRect: null, // (중앙)
  resetButton: null,
  photoEditorPanel: null,
};

// 스티커 패널 3열 × 6행 그리드
const STICKER_GRID = {
  cols: 3,
  rows: 6,
  cell: 104,
  gap: 8,
  padX: 32,
  padY: 32,
};
const PHOTO_BORDER_OPTIONS = [
  { key: "none", label: "none" },
  { key: "circle", label: "circle" },
  { key: "square", label: "square" },
  { key: "line", label: "직선" },
  { key: "christmas", label: "크리스마스" },
  { key: "flower", label: "꽃" },
];
const PHOTO_BORDER_COLUMNS = [
  ["none", "circle", "square"],
  ["christmas", "flower"],
];
const PHOTO_BORDER_ICON_PATHS = {
  none: "assets/photo_edit/borderBtn_none.png",
  circle: "assets/photo_edit/borderBtn_circle.png",
  square: "assets/photo_edit/borderBtn_square.png",
  christmas: "assets/photo_edit/borderBtn_christmas.png",
  flower: "assets/photo_edit/borderBtn_flower.png",
};

// 이미지 버튼용 전역
let penImg = null;
let eraserImg = null;
let cameraBg = null;
let shutterAudio = null;
let backgroundMusic = null;
let backgroundMusicStarted = false;
let photoFlowerBorderImg = null;
let photoChristmasBorderImg = null;

// 전역 버튼 rect 저장용
let penBtnRect = null;
let eraserBtnRect = null;
let sizeBtnRects = [];
let colorBtnRects = [];
let frameBtnRects = [];
let photoBorderOptionRects = [];
let photoBorderIcons = {};

let myFont;

/* ===== Frames & Stickers ===== */
const frameDefs = [
  {
    key: "todolist",
    label: "To Do List",
    src: "assets/frames/frame_todolist2.png",
  },
  {
    key: "universe",
    label: "우주 소행성",
    src: "assets/frames/frame_universe2.png",
  },
  {
    key: "ribbon",
    label: "크리스마스 리본",
    src: "assets/frames/frame_ribbon2.png",
  },
  {
    key: "diary",
    label: "그림일기",
    src: "assets/frames/frame_diary2.png",
  },
];
const FRAME_MENU_GRID = { cols: 2, rows: 2, gap: 8 };
const FRAME_BTN_HEIGHT_SCALE = 0.96;
const FRAME_MENU_TITLE_LINE = 20;
const PANEL_BG_ALPHA = Math.round(255 * 0.8);
const PANEL_BG_COLOR = [255, 254, 242, PANEL_BG_ALPHA];
const PANEL_CORNER_RADIUS = 12;
const PANEL_TITLE_COLOR = "#7A4100";
const FRAME_MENU_TITLE = "> 속지를 골라보세요";
const GUIDELINE_TITLE = "> 다이어리 활용법";
const GUIDELINE_TEXT =
  "1. 속지를 선택 후 스티커, 펜툴을 활용해 나만의 다이어리를 꾸며보세요\n 2. 키보드에서 P 키를 눌러 카메라로 촬영 후 다이어리에서 꾸며보세요\n 3. '저장하기'를 눌러 로딩된 QR 코드를 스캔하면 사진을 저장할 수 있어요";
const RIGHT_PANEL_TITLE_FONT_SIZE = 16;
const RIGHT_PANEL_BODY_FONT_SIZE = 11;
const RIGHT_PANEL_BUTTON_FONT_SIZE = 14;
const GUIDELINE_TEXT_LEADING = 22;
const GUIDELINE_TITLE_FONT_SIZE = RIGHT_PANEL_TITLE_FONT_SIZE;
const GUIDELINE_BODY_LINE_HEIGHT = GUIDELINE_TEXT_LEADING;
const GUIDELINE_PARAGRAPH_GAP = 20;
const GUIDELINE_TITLE_LINE = FRAME_MENU_TITLE_LINE;
const PARAGRAPH_GAP = 10;
const BASE_LAYOUT = {
  LEFT_COL_WIDTH: Math.max(
    420,
    STICKER_GRID.padX * 2 +
      STICKER_GRID.cols * STICKER_GRID.cell +
      (STICKER_GRID.cols - 1) * STICKER_GRID.gap
  ),
  RIGHT_COL_WIDTH: Math.max(
    420,
    STICKER_GRID.padX * 2 +
      STICKER_GRID.cols * STICKER_GRID.cell +
      (STICKER_GRID.cols - 1) * STICKER_GRID.gap
  ),
  CENTER_HEIGHT: 920,
  CENTER_ASPECT: 20 / 13,
  FRAME_MENU_HEIGHT: 210,
  WEBCAM_HEIGHT: 340,
  TOOL_HEIGHT: 270,
  FRAME_PAD: 16,
  GUIDELINE_PAD_X: 20,
  GUIDELINE_PAD_Y: 20,
  GUIDELINE_TITLE_GAP: GUIDELINE_PARAGRAPH_GAP,
  PARAGRAPH_GAP: GUIDELINE_PARAGRAPH_GAP,
  VERTICAL_MARGIN: 40,
  SAVE_BUTTON_HEIGHT: 56,
};
const DEFAULT_FRAME_KEY = "ribbon";

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
  { key: "blush", label: "블러쉬", src: "assets/stickers/sticker_blush.png" },
  { key: "tape", label: "테이프", src: "assets/stickers/sticker_tape.png" },
  { key: "heart", label: "하트", src: "assets/stickers/sticker_heart.png" },
];

let frames = {};
let stickers = {};
let currentFrameIdx = frameDefs.findIndex(
  (frame) => frame.key === DEFAULT_FRAME_KEY
);
if (currentFrameIdx === -1) {
  currentFrameIdx = 0;
}
let bgImg = null;

/* ===== Drawing tool & layers ===== */
let drawingBelow = null;
let drawingAbove = null;
let currentStrokeLayer = null;
let drawTool = "pen";
let penSize = 9;
let eraserSize = 9;
let brushColor = "#7A4100";
const palette = ["#FF8A9B", "#7A4100", "#6BC743", "#79BADB"];

/* ===== Webcam ===== */
let cam,
  webcamReady = false;
const PHOTO_COUNTDOWN_SECONDS = 3;
const CAMERA_FLASH_DURATION = 0.6;
const PHOTO_CAPTURE_DELAY = 1000;
let photoCountdown = null;
let webcamFlashTime = 0;

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
let spawnDrag = null;

/* ========================
   Layout (좌/중/우 세 컬럼 세로 중앙 정렬)
======================== */
function updateLayout() {
  W = windowWidth;
  H = windowHeight;

  const baseStickerW =
    STICKER_GRID.padX * 2 +
    STICKER_GRID.cols * STICKER_GRID.cell +
    (STICKER_GRID.cols - 1) * STICKER_GRID.gap;
  const baseStickerH =
    STICKER_GRID.padY * 2 +
    STICKER_GRID.rows * STICKER_GRID.cell +
    (STICKER_GRID.rows - 1) * STICKER_GRID.gap;
  const baseLeftW = Math.max(BASE_LAYOUT.LEFT_COL_WIDTH, baseStickerW);
  const baseRightW = Math.max(BASE_LAYOUT.RIGHT_COL_WIDTH, baseStickerW);

  const baseGuidelineTextH = measureGuidelineTextHeight(
    GUIDELINE_TEXT,
    baseRightW,
    BASE_LAYOUT.GUIDELINE_PAD_X,
    GUIDELINE_TEXT_LEADING,
    BASE_LAYOUT.PARAGRAPH_GAP,
    RIGHT_PANEL_TITLE_FONT_SIZE
  );
  const baseGuidelineH =
    BASE_LAYOUT.GUIDELINE_PAD_Y +
    FRAME_MENU_TITLE_LINE +
    BASE_LAYOUT.GUIDELINE_TITLE_GAP +
    baseGuidelineTextH +
    BASE_LAYOUT.GUIDELINE_PAD_Y;

  const baseLeftColH = baseStickerH + PAGE.gapStack + BASE_LAYOUT.TOOL_HEIGHT;
  const baseRightColH =
    BASE_LAYOUT.FRAME_MENU_HEIGHT +
    PAGE.gapStack +
    BASE_LAYOUT.WEBCAM_HEIGHT +
    PAGE.gapStack +
    baseGuidelineH +
    PAGE.gapStack +
    BASE_LAYOUT.SAVE_BUTTON_HEIGHT;
  const baseCenterH = BASE_LAYOUT.CENTER_HEIGHT;

  const baseCenterW = BASE_LAYOUT.CENTER_HEIGHT / BASE_LAYOUT.CENTER_ASPECT;
  const baseTotalWidth =
    PAGE.marginX * 2 + baseLeftW + baseRightW + PAGE.gapCol * 2 + baseCenterW;
  const baseContentH = Math.max(baseLeftColH, baseRightColH, baseCenterH);
  const baseTotalHeight = baseContentH + BASE_LAYOUT.VERTICAL_MARGIN * 2;

  const scale = Math.min(W / baseTotalWidth, H / baseTotalHeight);
  const fontScale = Math.min(Math.max(scale, 0.75), 1.3);

  const minMarginX = 24 * scale;
  let marginX = Math.max(minMarginX, PAGE.marginX * scale);
  let gapCol = PAGE.gapCol * scale;
  const gapStack = PAGE.gapStack * scale;
  const leftColW = baseLeftW * scale;
  const rightColW = baseRightW * scale;
  const centerH = BASE_LAYOUT.CENTER_HEIGHT * scale;
  const centerW = centerH / BASE_LAYOUT.CENTER_ASPECT;
  const framePad = BASE_LAYOUT.FRAME_PAD * scale;

  const stickerCell = STICKER_GRID.cell * scale;
  const stickerPadX = STICKER_GRID.padX * scale;
  const stickerPadY = STICKER_GRID.padY * scale;
  const stickerGap = STICKER_GRID.gap * scale;
  const stickerH =
    stickerPadY * 2 +
    STICKER_GRID.rows * stickerCell +
    (STICKER_GRID.rows - 1) * stickerGap;

  const toolH = BASE_LAYOUT.TOOL_HEIGHT * scale;
  const frameMenuH = BASE_LAYOUT.FRAME_MENU_HEIGHT * scale;
  const webcamH = BASE_LAYOUT.WEBCAM_HEIGHT * scale;
  const webcamGap = gapStack + 12 * scale;

  const guidePadX = BASE_LAYOUT.GUIDELINE_PAD_X * scale;
  const guidePadY = BASE_LAYOUT.GUIDELINE_PAD_Y * scale;
  const titleLine = FRAME_MENU_TITLE_LINE * fontScale;
  const titleGapBelow = BASE_LAYOUT.GUIDELINE_TITLE_GAP * scale;
  const paragraphGap = BASE_LAYOUT.PARAGRAPH_GAP * scale;
  const bodyLineHeight = GUIDELINE_TEXT_LEADING * fontScale;
  const panelFontSize = RIGHT_PANEL_TITLE_FONT_SIZE * fontScale;
  const buttonFontSize = RIGHT_PANEL_BUTTON_FONT_SIZE * fontScale;

  const guidelineTextH = measureGuidelineTextHeight(
    GUIDELINE_TEXT,
    rightColW,
    guidePadX,
    bodyLineHeight,
    paragraphGap,
    panelFontSize
  );
  const guidelineH =
    guidePadY + titleLine + titleGapBelow + guidelineTextH + guidePadY;

  const leftColH = stickerH + gapStack + toolH;
  const saveButtonH = BASE_LAYOUT.SAVE_BUTTON_HEIGHT * scale;
  const rightColH =
    frameMenuH +
    webcamGap +
    webcamH +
    gapStack +
    guidelineH +
    gapStack +
    saveButtonH;
  const contentH = Math.max(leftColH, rightColH, centerH);
  const contentTop = Math.max(
    (H - contentH) / 2,
    (BASE_LAYOUT.VERTICAL_MARGIN * scale) / 2
  );

  const leftTop = contentTop + (contentH - leftColH) / 2;
  const rightTop = contentTop + (contentH - rightColH) / 2;
  const midTop = contentTop + (contentH - centerH) / 2;

  let totalWidthWithMargins =
    marginX * 2 + leftColW + rightColW + centerW + gapCol * 2;
  if (totalWidthWithMargins < W) {
    const extraWidth = W - totalWidthWithMargins;
    const gapBoost = extraWidth * 0.4;
    gapCol += gapBoost / 2;
    marginX += (extraWidth - gapBoost) / 2;
  } else {
    marginX = minMarginX;
  }
  const totalContentW = leftColW + rightColW + centerW + gapCol * 2;
  const leftX = (W - totalContentW) / 2;
  const centerX = leftX + leftColW + gapCol;
  const rightX = centerX + centerW + gapCol;

  UI.stickerPanel = {
    x: leftX,
    y: leftTop,
    w: leftColW,
    h: stickerH,
    padX: stickerPadX,
    padY: stickerPadY,
    cell: stickerCell,
    gap: stickerGap,
    cols: STICKER_GRID.cols,
    rows: STICKER_GRID.rows,
  };
  UI.toolPanel = {
    x: leftX,
    y: UI.stickerPanel.y + UI.stickerPanel.h + gapStack,
    w: leftColW,
    h: toolH,
    padX: 18 * scale,
    padY: 20 * scale,
  };
  const gapStartX = leftX + leftColW;
  const gapWidth = gapCol;
  const resetInset = Math.min(gapWidth * 0.15, 18 * scale);
  const usableGap = Math.max(0, gapWidth - resetInset * 2);
  const desiredReset =
    usableGap > 0
      ? Math.min(
          Math.max(44 * scale, Math.min(toolH * 0.45, 90 * scale)),
          usableGap
        )
      : 0;
  if (desiredReset > 0) {
    const resetX = gapStartX + (gapWidth - desiredReset) / 2;
    const offsetY = Math.max(10 * scale, 6);
    let resetY = UI.toolPanel.y + UI.toolPanel.h - desiredReset - offsetY;
    const minResetY = UI.toolPanel.y + offsetY;
    if (resetY < minResetY) resetY = minResetY;
    UI.resetButton = {
      x: resetX,
      y: resetY,
      w: desiredReset,
      h: desiredReset,
      fontSize: desiredReset * 0.25,
    };
  } else {
    UI.resetButton = null;
  }

  UI.frameMenu = {
    x: rightX,
    y: rightTop,
    w: rightColW,
    h: frameMenuH,
    padX: 20 * scale,
    padY: 20 * scale,
    titleFontSize: panelFontSize,
    buttonFontSize,
  };
  UI.webcamPanel = {
    x: rightX,
    y: UI.frameMenu.y + UI.frameMenu.h + webcamGap,
    w: rightColW,
    h: webcamH,
  };
  UI.guidelinePanel = {
    x: rightX,
    y: UI.webcamPanel.y + UI.webcamPanel.h + gapStack,
    w: rightColW,
    h: guidelineH,
    padX: guidePadX,
    padY: guidePadY,
    titleLine,
    titleGap: titleGapBelow,
    bodyLineHeight,
    paragraphGap,
    fontSize: panelFontSize,
  };
  UI.saveButton = {
    x: rightX,
    y: UI.guidelinePanel.y + UI.guidelinePanel.h + gapStack,
    w: rightColW,
    h: saveButtonH,
    fontSize: buttonFontSize,
  };

  UI.diaryFrameRect = {
    x: centerX,
    y: midTop,
    w: centerW,
    h: centerH,
    pad: framePad,
  };
}

/* ========================
    Utils
======================== */
function drawPanel(
  x,
  y,
  w,
  h,
  title = "",
  bgColor = PANEL_BG_COLOR,
  titleColor = "#111827",
  titlePadX = 12,
  titlePadY = 18,
  titleFontSize = 14
) {
  push();
  if (bgColor === null) {
    noFill();
    stroke(255);
    strokeWeight(1.2);
    rect(x, y, w, h, PANEL_CORNER_RADIUS);
  } else {
    noStroke();
    if (Array.isArray(bgColor)) {
      fill(...bgColor);
    } else {
      fill(bgColor);
    }
    rect(x, y, w, h, PANEL_CORNER_RADIUS);
  }
  fill(titleColor);
  textSize(titleFontSize);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text(title, x + titlePadX, y + titlePadY);
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
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
function clampDraggableToFrame(item) {
  if (!UI.diaryFrameRect) return;
  const f = UI.diaryFrameRect;
  const innerX = f.x + f.pad;
  const innerY = f.y + f.pad;
  const innerW =
    drawingBelow && drawingBelow.width
      ? drawingBelow.width
      : Math.max(0, f.w - f.pad * 2);
  const innerH =
    drawingBelow && drawingBelow.height
      ? drawingBelow.height
      : Math.max(0, f.h - f.pad * 2);
  if (innerW <= 0 || innerH <= 0) return;
  const halfDiag = (Math.max(item.w, item.h) * item.scale) / 2;
  const effHalfX = Math.min(halfDiag, innerW / 2);
  const effHalfY = Math.min(halfDiag, innerH / 2);
  const minCX = innerX + effHalfX;
  const maxCX = innerX + innerW - effHalfX;
  const minCY = innerY + effHalfY;
  const maxCY = innerY + innerH - effHalfY;
  const centerX = clamp(item.x + item.w / 2, minCX, maxCX);
  const centerY = clamp(item.y + item.h / 2, minCY, maxCY);
  item.x = centerX - item.w / 2;
  item.y = centerY - item.h / 2;
}
function getCameraAspect() {
  // camera.png 로딩 전에도 동작하도록 기본 16:9 가정
  return cameraBg && cameraBg.width && cameraBg.height
    ? cameraBg.width / cameraBg.height
    : 16 / 9;
}
// 단락을 maxWidth에 맞춰 줄바꿈해서 라인 배열로 반환
function wrapLinesByWidth(text, maxWidth) {
  if (!text || maxWidth <= 0) return [""];
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";

  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (textWidth(test) <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      // 단어가 너무 길어 한 줄에도 못 들어가면 강제 끊기
      if (textWidth(w) > maxWidth) {
        let acc = "";
        for (const ch of w) {
          const t = acc + ch;
          if (textWidth(t) <= maxWidth) acc = t;
          else {
            if (acc) lines.push(acc);
            acc = ch;
          }
        }
        line = acc;
      } else {
        line = w;
      }
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

// 가이드라인 본문(개행으로 단락 구분)의 총 높이(px) 계산
function measureGuidelineTextHeight(
  textStr,
  panelW,
  padX,
  lineHeight,
  paragraphGap,
  fontSize = RIGHT_PANEL_TITLE_FONT_SIZE
) {
  const maxWidth = panelW - padX * 2;
  const paragraphs = textStr.split("\n");
  if (!myFont) {
    let fallbackH = 0;
    paragraphs.forEach((_, idx) => {
      fallbackH += lineHeight;
      if (idx < paragraphs.length - 1) fallbackH += paragraphGap;
    });
    return fallbackH;
  }
  textFont(myFont);
  textSize(fontSize);

  let totalH = 0;
  paragraphs.forEach((p, idx) => {
    const lines = wrapLinesByWidth(p, maxWidth);
    totalH += Math.max(1, lines.length) * lineHeight;
    if (idx < paragraphs.length - 1) totalH += paragraphGap; // 단락 간 간격
  });

  return totalH;
}

function renderParagraphs(
  textStr,
  x,
  y,
  maxWidth,
  maxHeight,
  lineHeight,
  paragraphGap
) {
  const paragraphs = textStr.split("\n"); // 개행만 단락 구분
  let cy = y;

  for (let p = 0; p < paragraphs.length; p++) {
    const para = paragraphs[p];
    const lines = wrapLinesByWidth(para, maxWidth);

    for (const ln of lines) {
      if (cy + lineHeight - y > maxHeight) return;
      text(ln, x, cy);
      cy += lineHeight;
    }

    if (p < paragraphs.length - 1) {
      cy += paragraphGap;
    }
  }
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
    this.borderStyle = "none";
  }
  draw() {
    const hovered =
      this.contains(mouseX, mouseY) &&
      !this.selected &&
      draggingIdx < 0 &&
      !activeMode;
    const hoverScale = hovered ? 1.06 : 1.0;
    const effectiveScale = this.scale * hoverScale;
    push();
    translate(this.x + this.w / 2, this.y + this.h / 2);
    rotate(this.angle);
    scale(effectiveScale);
    const drewPhoto = this.drawPhotoContent();
    if (!drewPhoto) {
      drawImageOrPlaceholder(
        this.img,
        -this.w / 2,
        -this.h / 2,
        this.w,
        this.h,
        this.type.toUpperCase()
      );
    }
    this.renderPhotoBorder(null, effectiveScale);
    if (this.selected) {
      const { w: selW, h: selH } = this.getSelectionBounds();
      const selHalfW = selW / 2;
      const selHalfH = selH / 2;
      noFill();
      stroke("#3b82f6");
      strokeWeight(2);
      rectMode(CENTER);
      rect(0, 0, selW, selH);
      const s = this.handleSize;
      noStroke();
      fill("#3b82f6");
      rect(-selHalfW, -selHalfH, s, s);
      rect(selHalfW, selHalfH, s, s);
      rect(-selHalfW, selHalfH, s, s);
      const topY = -selHalfH,
        cy = topY - this.rotHandleGap;
      stroke("#3b82f6");
      strokeWeight(2);
      line(0, topY, 0, cy);
      noStroke();
      fill("#3b82f6");
      circle(0, cy, this.rotHandleR * 2);
      const ds = this.delSize,
        cxDel = selHalfW,
        cyDel = -selHalfH;
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
  getSelectionBounds() {
    if (this.type === "photo") {
      const style = this.borderStyle || "none";
      if (style === "circle" || style === "square") {
        const clip = Math.min(this.w, this.h);
        return { w: clip, h: clip };
      }
    }
    return { w: this.w, h: this.h };
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
      sel = this.getSelectionBounds(),
      selHalfW = sel.w / 2,
      selHalfH = sel.h / 2,
      cxDel = selHalfW,
      cyDel = -selHalfH;
    if (Math.abs(p.x - cxDel) <= ds / 2 && Math.abs(p.y - cyDel) <= ds / 2)
      return { type: "delete" };
    const corners = {
      nw: { x: -selHalfW, y: -selHalfH },
      se: { x: selHalfW, y: selHalfH },
      sw: { x: -selHalfW, y: selHalfH },
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
    const topY = -selHalfH,
      cy = topY - this.rotHandleGap,
      d = dist(p.x, p.y, 0, cy);
    if (d <= this.rotHandleR + 2) return { type: "rotate" };
    return null;
  }

  // === 오프스크린 그래픽(p5.Graphics)에 그리기 (내보내기용) ===
  drawTo(pg) {
    const hoverScale = 1.0; // 내보내기는 hover 효과 없이
    pg.push();
    pg.translate(this.x + this.w / 2, this.y + this.h / 2);
    pg.rotate(this.angle);
    const effectiveScale = this.scale * hoverScale;
    pg.scale(effectiveScale);
    const drewPhoto = this.drawPhotoContent(pg);
    if (!drewPhoto) {
      if (this.img) {
        pg.image(this.img, -this.w / 2, -this.h / 2, this.w, this.h);
      } else {
        pg.push();
        pg.noStroke();
        pg.fill(245);
        pg.rect(-this.w / 2, -this.h / 2, this.w, this.h, 10);
        pg.pop();
      }
    }
    this.renderPhotoBorder(pg, effectiveScale);
    pg.pop();
  }
  drawPhotoContent(renderer = null) {
    if (this.type !== "photo") return false;
    const ctx = renderer || window;
    if (!this.img) {
      this.drawPhotoPlaceholder(ctx);
      return true;
    }
    const style = this.borderStyle || "none";
    const needsMask = style === "circle" || style === "square";
    if (needsMask) {
      const dc = ctx.drawingContext;
      if (dc && dc.save) {
        const clipSize = Math.min(this.w, this.h);
        const radius = style === "square" ? clipSize * 0.1 : clipSize / 2;
        dc.save();
        dc.beginPath();
        if (style === "circle") {
          dc.arc(0, 0, clipSize / 2, 0, Math.PI * 2);
          dc.closePath();
        } else {
          dc.moveTo(-clipSize / 2 + radius, -clipSize / 2);
          dc.lineTo(clipSize / 2 - radius, -clipSize / 2);
          dc.quadraticCurveTo(
            clipSize / 2,
            -clipSize / 2,
            clipSize / 2,
            -clipSize / 2 + radius
          );
          dc.lineTo(clipSize / 2, clipSize / 2 - radius);
          dc.quadraticCurveTo(
            clipSize / 2,
            clipSize / 2,
            clipSize / 2 - radius,
            clipSize / 2
          );
          dc.lineTo(-clipSize / 2 + radius, clipSize / 2);
          dc.quadraticCurveTo(
            -clipSize / 2,
            clipSize / 2,
            -clipSize / 2,
            clipSize / 2 - radius
          );
          dc.lineTo(-clipSize / 2, -clipSize / 2 + radius);
          dc.quadraticCurveTo(
            -clipSize / 2,
            -clipSize / 2,
            -clipSize / 2 + radius,
            -clipSize / 2
          );
          dc.closePath();
        }
        dc.clip();
        ctx.image(this.img, -this.w / 2, -this.h / 2, this.w, this.h);
        dc.restore();
        return true;
      }
    }
    ctx.image(this.img, -this.w / 2, -this.h / 2, this.w, this.h);
    return true;
  }
  drawPhotoPlaceholder(renderer = null) {
    const ctx = renderer || window;
    ctx.push();
    ctx.rectMode(CENTER);
    ctx.noStroke();
    ctx.fill(245);
    ctx.rect(0, 0, this.w, this.h, 10);
    ctx.stroke(150);
    ctx.strokeWeight(1);
    ctx.line(-this.w / 2, -this.h / 2, this.w / 2, this.h / 2);
    ctx.line(this.w / 2, -this.h / 2, -this.w / 2, this.h / 2);
    ctx.pop();
  }
  renderPhotoBorder(renderer = null, effectiveScale = this.scale) {
    if (this.type !== "photo") return;
    const style = this.borderStyle || "none";
    if (style === "none") return;
    if (style === "circle" || style === "square") return;
    const ctx = renderer || window;
    const strokeBase = 3.6;
    const strokeW = strokeBase / Math.max(0.001, effectiveScale);
    const halfW = this.w / 2;
    const halfH = this.h / 2;
    if (style === "line") {
      ctx.push();
      ctx.noFill();
      ctx.stroke(0);
      ctx.strokeWeight(strokeW);
      ctx.rectMode(CENTER);
      ctx.rect(0, 0, this.w, this.h);
      ctx.pop();
      return;
    }
    if (style === "christmas") {
      if (!photoChristmasBorderImg) return;
      ctx.push();
      const scale = 1.2;
      const drawW = this.w * scale;
      const drawH = this.h * scale;
      ctx.image(photoChristmasBorderImg, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.pop();
      return;
    }
    if (style === "flower") {
      if (!photoFlowerBorderImg) return;
      ctx.push();
      const scale = 1.4;
      const drawW = this.w * scale;
      const drawH = this.h * scale;
      ctx.image(photoFlowerBorderImg, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.pop();
      return;
    }
  }
}

/* ========================
    p5 lifecycle
======================== */
function preload() {
  bgImg = loadImage("assets/background.png");
  myFont = loadFont("assets/Jalnan2.otf");

  for (const f of frameDefs) {
    frames[f.key] = loadImage(f.src);
  }
  for (const s of stickerDefs) {
    stickers[s.key] = loadImage(s.src);
  }

  penImg = loadImage("assets/pen2.png");
  eraserImg = loadImage("assets/eraser2.png");
  cameraBg = loadImage("assets/camera2.png");
  for (const opt of PHOTO_BORDER_OPTIONS) {
    const path = PHOTO_BORDER_ICON_PATHS[opt.key];
    if (path) {
      photoBorderIcons[opt.key] = loadImage(path);
    }
  }
  photoFlowerBorderImg = loadImage("assets/photo_edit/border_flower.png");
  photoChristmasBorderImg = loadImage("assets/photo_edit/border_christmas.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(myFont);
  textSize(32);
  updateLayout();
  recreateDrawingLayers(null, null);
  cam = createCapture(VIDEO, () => {
    webcamReady = true;
  });
  cam.hide();
  prepareShutterAudio();
  prepareBackgroundMusic();
  ensureBackgroundMusicPlaying();
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
  updatePhotoCountdown();
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

  const gx = UI.diaryFrameRect.x + UI.diaryFrameRect.pad;
  const gy = UI.diaryFrameRect.y + UI.diaryFrameRect.pad;

  const photoItems = [];
  const stickerItems = [];
  for (const d of draggables) {
    if (d.type === "photo") photoItems.push(d);
    else stickerItems.push(d);
  }

  // 1) 사진을 먼저 그려서 펜이 위에 오도록 함
  for (const photo of photoItems) photo.draw();

  // 2) 펜/지우개 레이어
  image(drawingBelow, gx, gy);

  // 3) 스티커 등 나머지 드래그 아이템
  for (const item of stickerItems) item.draw();

  image(drawingAbove, gx, gy);

  // 패널
  drawStickerPanel();
  drawToolPanel();
  drawResetButton();
  drawPhotoEditorPanel();
  drawFrameMenu();
  drawWebcamPanel();
  drawGuidelinePanel();
  drawSaveButton();

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
function getFrameButtonRects() {
  const {
    x,
    y,
    w,
    h,
    padX = 10,
    padY = 10,
    titleLine = FRAME_MENU_TITLE_LINE,
    titleGap = FRAME_MENU_TITLE_LINE * 0.35,
  } = UI.frameMenu;
  const { cols, rows, gap } = FRAME_MENU_GRID;
  const titleArea = titleLine + titleGap;

  const innerW = w - padX * 2;
  const innerH = h - padY * 2 - titleArea;

  const btnW = (innerW - gap * (cols - 1)) / cols;
  const btnH = (innerH - gap * (rows - 1)) / rows;

  const btnHScaled = btnH * FRAME_BTN_HEIGHT_SCALE;
  const yPaddingEach = (btnH - btnHScaled) / 2;

  const startX = x + padX;
  const startY = y + padY + titleLine + titleGap;

  const rects = [];
  for (let i = 0; i < Math.min(frameDefs.length, cols * rows); i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    rects.push({
      rect: {
        x: startX + col * (btnW + gap),
        y: startY + row * (btnH + gap) + yPaddingEach, // 가운데 정렬되게 보정
        w: btnW,
        h: btnHScaled,
      },
      index: i,
    });
  }
  return rects;
}

function drawFrameMenu() {
  const {
    x,
    y,
    w,
    h,
    padX = 20,
    padY = 20,
    titleFontSize = RIGHT_PANEL_TITLE_FONT_SIZE,
    buttonFontSize = RIGHT_PANEL_BUTTON_FONT_SIZE,
    titleGap = FRAME_MENU_TITLE_LINE * 0.25,
  } = UI.frameMenu;
  drawPanel(
    x,
    y,
    w,
    h,
    FRAME_MENU_TITLE,
    PANEL_BG_COLOR,
    PANEL_TITLE_COLOR,
    padX,
    padY,
    titleFontSize
  );
  const btnRects = getFrameButtonRects();
  frameBtnRects = btnRects;

  push();
  textSize(buttonFontSize);
  textStyle(NORMAL);
  rectMode(CORNER);

  for (const { rect: btnRect, index } of btnRects) {
    const hovered = inRect(mouseX, mouseY, btnRect);
    const active = index === currentFrameIdx;
    const baseColor = active ? "#7A4100" : hovered ? "#FFD859" : "#FDE7C7";
    const textColor = active ? "#FFFFFF" : "#7A4100";

    noStroke();
    fill(baseColor);
    rect(btnRect.x, btnRect.y, btnRect.w, btnRect.h, 12);

    fill(textColor);
    textAlign(CENTER, CENTER);
    text(
      frameDefs[index].label,
      btnRect.x + btnRect.w / 2,
      btnRect.y + btnRect.h / 2
    );
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
    const s = hovered ? 1.06 : 1.0;
    const dw = baseW * s,
      dh = baseH * s;
    const dx = r.x + m + (baseW - dw) / 2;
    const dy = r.y + m + (baseH - dh) / 2;

    drawImageOrPlaceholder(img, dx, dy, dw, dh, stickerDefs[i].label);
  }
}

function drawWebcamPanel() {
  const { x, y, w, h } = UI.webcamPanel;

  const framePad = Math.min(
    32,
    Math.max(18, Math.floor(Math.min(w, h) * 0.08))
  );
  const innerX = x + framePad;
  const innerY = y + framePad;
  const innerW = w - framePad * 2;
  const innerH = h - framePad * 2;

  if (!UI.webcamRects) UI.webcamRects = {};
  const R = UI.webcamRects;

  push();
  translate(innerX, innerY);

  // 1) camera.png: cover + 오버스케일
  let bgRect = { x: 0, y: 0, w: innerW, h: innerH };
  if (cameraBg) {
    const ir = cameraBg.width / cameraBg.height;
    const boxR = innerW / innerH;
    let dw, dh;
    if (boxR > ir) {
      dw = innerW;
      dh = innerW / ir;
    } else {
      dh = innerH;
      dw = innerH * ir;
    }

    const OVER = 1.3; // 배경을 더 크게
    dw *= OVER;
    dh *= OVER;

    const bgX = (innerW - dw) / 2;
    const bgY = (innerH - dh) / 2;
    image(cameraBg, bgX, bgY, dw, dh);
    bgRect = { x: bgX, y: bgY, w: dw, h: dh };
  } else {
    push();
    noStroke();
    fill(255, 240, 220, 180);
    rect(0, 0, innerW, innerH, 12);
    pop();
  }
  R.bgRect = { ...bgRect, absX: innerX + bgRect.x, absY: innerY + bgRect.y };

  // 2) 웹캠: 배경 대비 1/1.8 배(= 약 0.556)로 고정, 중앙 정렬
  const webcamOffsetY = 4; // 필요시 아래로 내리기
  const VIEW_REL = 1 / 1.8;

  // 배경 사각형의 크기에 대한 상대 크기
  let viewW = Math.max(20, bgRect.w * VIEW_REL);
  let viewH = Math.max(20, bgRect.h * VIEW_REL);

  // 중앙 정렬 + 약간 아래로
  const vx = bgRect.x + (bgRect.w - viewW) / 2;
  const vy = bgRect.y + (bgRect.h - viewH) / 2 + webcamOffsetY;

  // 3) 카메라 영상: viewRect 안에 contain
  if (webcamReady) {
    const camIR = (cam.width || 4) / (cam.height || 3);
    const boxR = viewW / viewH;
    let dw2, dh2;
    if (boxR > camIR) {
      dh2 = viewH;
      dw2 = dh2 * camIR;
    } else {
      dw2 = viewW;
      dh2 = dw2 / camIR;
    }

    const destX = vx + (viewW - dw2) / 2;
    const destY = vy + (viewH - dh2) / 2;
    push();
    translate(destX + dw2, destY);
    scale(-1, 1);
    image(cam, 0, 0, dw2, dh2);
    pop();
  } else {
    push();
    noStroke();
    fill(0, 0, 0, 110);
    rect(vx, vy, viewW, viewH, 20);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(RIGHT_PANEL_BODY_FONT_SIZE);
    text("웹캠 준비중", vx + viewW / 2, vy + viewH / 2);
    pop();
  }

  R.viewRect = {
    x: vx,
    y: vy,
    w: viewW,
    h: viewH,
    absX: innerX + vx,
    absY: innerY + vy,
  };
  const countdownValue = getPhotoCountdownDisplayValue();
  if (countdownValue) {
    const centerX = vx + viewW / 2;
    const centerY = vy + viewH / 2;
    const size = Math.min(viewW, viewH) * 0.48;
    push();
    textAlign(CENTER, CENTER);
    textSize(size);
    noStroke();
    fill(255, 248, 230);
    text(countdownValue, centerX, centerY);
    pop();
  }
  if (webcamFlashTime) {
    const flashElapsed = (millis() - webcamFlashTime) / 1000;
    if (flashElapsed >= CAMERA_FLASH_DURATION) {
      webcamFlashTime = 0;
    } else if (flashElapsed >= 0) {
      const flashAlpha = map(
        flashElapsed,
        0,
        CAMERA_FLASH_DURATION,
        220,
        0,
        true
      );
      push();
      noStroke();
      fill(255, flashAlpha);
      rect(vx, vy, viewW, viewH);
      pop();
    }
  }
  pop();
}

function drawGuidelinePanel() {
  const panel = UI.guidelinePanel;
  if (!panel) return;
  const {
    x,
    y,
    w,
    h,
    padX = 20,
    padY = 20,
    titleLine = FRAME_MENU_TITLE_LINE,
    titleGap = PARAGRAPH_GAP,
    bodyLineHeight = GUIDELINE_TEXT_LEADING,
    paragraphGap = PARAGRAPH_GAP,
    fontSize = RIGHT_PANEL_TITLE_FONT_SIZE,
  } = panel;
  drawPanel(
    x,
    y,
    w,
    h,
    GUIDELINE_TITLE,
    PANEL_BG_COLOR,
    PANEL_TITLE_COLOR,
    padX,
    padY,
    fontSize
  );
  const contentX = x + padX;
  const contentY = y + padY + titleLine + titleGap;
  const contentW = w - padX * 2;
  const contentH = h - (contentY - y) - padY;
  push();
  fill(PANEL_TITLE_COLOR);
  textSize(fontSize);
  textAlign(LEFT, TOP);
  textLeading(bodyLineHeight);
  renderParagraphs(
    GUIDELINE_TEXT,
    contentX,
    contentY,
    contentW,
    contentH,
    bodyLineHeight,
    paragraphGap
  );
  pop();
}

function drawSaveButton() {
  const btn = UI.saveButton;
  if (!btn) return;
  const { x, y, w, h, fontSize = RIGHT_PANEL_BUTTON_FONT_SIZE } = btn;
  const hovered = isMouseOverSaveButton(mouseX, mouseY);
  const pressed = hovered && mouseIsPressed;
  let baseColor = "#FDE7C7";
  let textColor = "#7A4100";
  if (pressed) {
    baseColor = "#7A4100";
    textColor = "#FFFFFF";
  } else if (hovered) {
    baseColor = "#FFD859";
  }
  push();
  noStroke();
  fill(baseColor);
  rect(x, y, w, h, 12);
  fill(textColor);
  textAlign(CENTER, CENTER);
  textSize(fontSize);
  text("저장하기", x + w / 2, y + h / 2 + fontSize * 0.05);
  pop();
}

function drawToolPanel() {
  const { x, y, w, h, padX = 12, padY = 12 } = UI.toolPanel;

  drawPanel(x, y, w, h, "");

  const innerX = x + padX;
  const innerY = y + padY;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;

  const sizes = [6, 9, 12, 16];
  const sizeBoxBase = 26;
  const sizeSpacingBase = 12;
  const colorSizeBase = 26;
  const colorSpacingBase = 12;

  const groupGap = 4;
  const groupCount = 2;
  const minGroupWidth = 120;
  let groupWidth = (innerW - groupGap * (groupCount - 1)) / groupCount;
  if (groupWidth < minGroupWidth) {
    groupWidth = minGroupWidth;
  }
  const layoutWidth = groupWidth * groupCount + groupGap * (groupCount - 1);
  const startX = innerX + Math.max(0, (innerW - layoutWidth) / 2);

  const toolGroupX = startX;
  const paletteGroupX = toolGroupX + groupWidth + groupGap;

  const PALETTE_WIDTH_FACTOR = 0.4;
  const palettePadXBase = 12;
  const palettePadYBase = 12;

  const sizeHeightBase =
    sizes.length * sizeBoxBase + (sizes.length - 1) * sizeSpacingBase;
  const colorHeightBase =
    palette.length * colorSizeBase + (palette.length - 1) * colorSpacingBase;
  const paletteInnerHeightBase = Math.max(sizeHeightBase, colorHeightBase);
  const paletteBoxHeightBase = paletteInnerHeightBase + palettePadYBase * 2;
  const TOOL_BTN_SCALE = 1.08;
  const toolBtnHeightPlanned = Math.min(
    paletteBoxHeightBase * TOOL_BTN_SCALE,
    innerH
  );
  const paletteScale = Math.min(1, toolBtnHeightPlanned / paletteBoxHeightBase);
  const sizeBox = sizeBoxBase * paletteScale;
  const sizeSpacing = sizeSpacingBase * paletteScale;
  const colorSize = colorSizeBase * paletteScale;
  const colorSpacing = colorSpacingBase * paletteScale;
  const palettePadX = palettePadXBase * paletteScale;
  const palettePadY = palettePadYBase * paletteScale;
  const paletteGapBase = 16;
  const paletteGap = Math.max(8, paletteGapBase * paletteScale);
  const sizeHeight = sizeHeightBase * paletteScale;
  const colorHeight = colorHeightBase * paletteScale;
  const paletteInnerHeight = Math.max(sizeHeight, colorHeight);
  const paletteBoxHeight = Math.max(
    paletteInnerHeight + palettePadY * 2,
    sizeBox * 2
  );

  const contentHeight = Math.max(paletteBoxHeight, toolBtnHeightPlanned);
  const baseY = innerY + Math.max(0, (innerH - contentHeight) / 2);

  const toolButtonsGap = 8;
  const toolBtnHeight = toolBtnHeightPlanned * 1.05;
  const toolBtnWidth = Math.min(
    (groupWidth - toolButtonsGap) / 2,
    toolBtnHeight
  );
  const totalToolWidth = toolBtnWidth * 2 + toolButtonsGap;
  const toolBtnX = toolGroupX + (groupWidth - totalToolWidth) / 2;
  const toolStartY = baseY;

  penBtnRect = {
    x: toolBtnX,
    y: toolStartY,
    w: toolBtnWidth,
    h: toolBtnHeight,
  };
  eraserBtnRect = {
    x: toolBtnX + toolBtnWidth + toolButtonsGap,
    y: toolStartY,
    w: toolBtnWidth,
    h: toolBtnHeight,
  };

  drawImageOnlyButton(penBtnRect, penImg, drawTool === "pen");
  drawImageOnlyButton(eraserBtnRect, eraserImg, drawTool === "eraser");

  const paletteWidth = Math.max(
    Math.min(groupWidth * PALETTE_WIDTH_FACTOR, groupWidth - 40 * paletteScale),
    90
  );
  const paletteRect = {
    x: paletteGroupX + (groupWidth - paletteWidth) / 2,
    y: baseY,
    w: paletteWidth,
    h: paletteBoxHeight,
  };
  push();
  noStroke();
  fill("#FFEEDA");
  rect(paletteRect.x, paletteRect.y, paletteRect.w, paletteRect.h, 7);
  pop();

  sizeBtnRects = [];
  const paletteInnerWidth = paletteRect.w - palettePadX * 2;
  const paletteUsedWidth = sizeBox + colorSize + paletteGap;
  const paletteOffset = Math.max(0, (paletteInnerWidth - paletteUsedWidth) / 2);
  const sizeX = paletteRect.x + palettePadX + paletteOffset;
  let sizeY =
    paletteRect.y + palettePadY + (paletteInnerHeight - sizeHeight) / 2;

  sizes.forEach((s) => {
    const r = { x: sizeX, y: sizeY, w: sizeBox, h: sizeBox };
    sizeBtnRects.push({ rect: r, size: s });

    const hovered = inRect(mouseX, mouseY, r);
    const active =
      (drawTool === "pen" && penSize === s) ||
      (drawTool === "eraser" && eraserSize === s);
    const scaleFactor = hovered ? 1.25 : 1.0;

    push();
    translate(r.x + r.w / 2, r.y + r.h / 2);
    scale(scaleFactor);

    if (active) {
      stroke("#ff6666");
      strokeWeight(2);
    } else {
      noStroke();
    }

    fill("#111827");
    circle(0, 0, s * 1.4);
    pop();

    sizeY += sizeBox + sizeSpacing;
  });

  colorBtnRects = [];
  const colorX = sizeX + sizeBox + paletteGap;
  let colorY =
    paletteRect.y + palettePadY + (paletteInnerHeight - colorHeight) / 2;

  const colorDisabled = drawTool === "eraser";

  palette.forEach((c) => {
    const r = { x: colorX, y: colorY, w: colorSize, h: colorSize };
    colorBtnRects.push({ rect: r, color: c });

    const hovered = !colorDisabled && inRect(mouseX, mouseY, r);
    const active = !colorDisabled && c === brushColor;
    const scaleFactor = hovered ? 1.15 : 1.0;

    push();
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    translate(cx, cy);
    scale(scaleFactor);
    rectMode(CENTER);

    if (active) {
      stroke("#ff6666");
      strokeWeight(2);
    } else {
      noStroke();
    }

    fill(c);
    rect(0, 0, r.w, r.h, 6);
    pop();

    colorY += colorSize + colorSpacing;
  });
}
function drawPhotoEditorPanel() {
  const target = getSelectedPhotoItem();
  if (!target || target.type !== "photo") {
    UI.photoEditorPanel = null;
    photoBorderOptionRects = [];
    return;
  }
  const bounds = getItemScreenBounds(target);
  if (!bounds) {
    UI.photoEditorPanel = null;
    photoBorderOptionRects = [];
    return;
  }
  const padX = 12;
  const padY = 12;
  const buttonSize = 30;
  const gapX = 8;
  const gapY = 8;
  const columns = PHOTO_BORDER_COLUMNS;
  const colHeights = columns.map((col) => col.length);
  const maxColHeight = colHeights.length ? Math.max(...colHeights) : 1;
  const colCount = columns.length || 1;
  const panelW =
    padX * 2 + colCount * buttonSize + Math.max(0, colCount - 1) * gapX;
  const panelH =
    padY * 2 + maxColHeight * buttonSize + Math.max(0, maxColHeight - 1) * gapY;
  const margin = 16;
  let panelX = bounds.maxX + 16;
  if (panelX + panelW > width - margin) {
    panelX = bounds.minX - panelW - 16;
  }
  panelX = constrain(panelX, margin, width - margin - panelW);
  let panelY = bounds.minY;
  panelY = constrain(panelY, margin, height - margin - panelH);
  const targetIndex = draggables.indexOf(target);
  UI.photoEditorPanel = {
    x: panelX,
    y: panelY,
    w: panelW,
    h: panelH,
    targetIndex,
  };
  photoBorderOptionRects = [];

  push();
  noStroke();
  fill(...PANEL_BG_COLOR);
  rect(panelX, panelY, panelW, panelH, 12);
  columns.forEach((col, colIdx) => {
    const btnX = panelX + padX + colIdx * (buttonSize + gapX);
    let btnY = panelY + padY;
    col.forEach((key) => {
      const opt = PHOTO_BORDER_OPTIONS.find((o) => o.key === key);
      if (!opt) return;
      const rectDef = { x: btnX, y: btnY, w: buttonSize, h: buttonSize };
      const hovered = inRect(mouseX, mouseY, rectDef);
      const active = target.borderStyle === opt.key;
      const baseColor = active ? "#7A4100" : hovered ? "#FFD859" : "#FDE7C7";
      const textColor = active ? "#FFFFFF" : "#7A4100";
      noStroke();
      fill(baseColor);
      rect(rectDef.x, rectDef.y, rectDef.w, rectDef.h, 6);
      const icon = photoBorderIcons[opt.key];
      if (icon) {
        const pad = Math.max(3, buttonSize * 0.18);
        image(
          icon,
          rectDef.x + pad,
          rectDef.y + pad,
          rectDef.w - pad * 2,
          rectDef.h - pad * 2
        );
      } else {
        fill(textColor);
        textAlign(CENTER, CENTER);
        text(
          opt.label,
          rectDef.x + rectDef.w / 2,
          rectDef.y + rectDef.h / 2 + RIGHT_PANEL_BUTTON_FONT_SIZE * 0.05
        );
      }
      photoBorderOptionRects.push({
        rect: rectDef,
        option: opt.key,
        targetIndex,
      });
      btnY += buttonSize + gapY;
    });
  });
  pop();
}
function drawResetButton() {
  const btn = UI.resetButton;
  if (!btn) return;
  const { x, y, w, h, fontSize = h * 0.3 } = btn;
  const hovered = isMouseOverResetButton(mouseX, mouseY);
  const pressed = hovered && mouseIsPressed;
  let baseColor = "#FDE7C7";
  let textColor = "#7A4100";
  if (pressed) {
    baseColor = "#7A4100";
    textColor = "#FFFFFF";
  } else if (hovered) {
    baseColor = "#FFD859";
  }
  push();
  noStroke();
  fill(baseColor);
  rect(x, y, w, h, 12);
  fill(textColor);
  textAlign(CENTER, CENTER);
  textSize(fontSize);
  text("초기화", x + w / 2, y + h / 2 + fontSize * 0.05);
  pop();
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
  ensureBackgroundMusicPlaying();
  // 우측 프레임 메뉴
  const { x, y, w, h } = UI.frameMenu;
  if (inRect(mouseX, mouseY, { x, y, w, h })) {
    const candidates = frameBtnRects.length
      ? frameBtnRects
      : getFrameButtonRects();
    for (const { rect, index } of candidates) {
      if (inRect(mouseX, mouseY, rect)) {
        currentFrameIdx = index;
        return;
      }
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

  if (handlePhotoPanelClick(mouseX, mouseY)) {
    blockDrawThisPress = true;
    return;
  }

  if (UI.resetButton && inRect(mouseX, mouseY, UI.resetButton)) {
    resetWorkspace();
    return;
  }

  // 툴 패널
  if (inRect(mouseX, mouseY, UI.toolPanel)) {
    handleToolPanelClick();
    return;
  }

  if (UI.saveButton && inRect(mouseX, mouseY, UI.saveButton)) {
    handleSaveAction();
    return;
  }

  // 선택/드로잉 초기화
  blockDrawThisPress = false;
  drawingThisStroke = false;
  currentStrokeLayer = null;

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

  // 스티커 본체 선택/이동 (handles 외 영역)
  for (let i = draggables.length - 1; i >= 0; i--) {
    const sel = draggables[i];
    if (sel.contains(mouseX, mouseY)) {
      draggables.forEach((d, idx) => {
        d.selected = idx === i;
      });
      draggingIdx = i;
      activeMode = "move";
      startMouse.x = mouseX;
      startMouse.y = mouseY;
      startPos.x = sel.x;
      startPos.y = sel.y;
      clampDraggableToFrame(sel);
      blockDrawThisPress = true;
      return;
    }
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
      clampDraggableToFrame(item);
      return;
    }
    if (activeMode.startsWith("resize-")) {
      const cx = item.x + item.w / 2,
        cy = item.y + item.h / 2;
      const d0 = Math.hypot(startMouse.x - cx, startMouse.y - cy),
        d1 = Math.hypot(mouseX - cx, mouseY - cy);
      let s = startScale * (d1 / Math.max(30, d0));
      item.scale = constrain(s, 0.2, 5.0);
      clampDraggableToFrame(item);
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
}

function mouseReleased() {
  if (spawnDrag) {
    const { x, y, w, h } = UI.diaryFrameRect;
    if (inRect(mouseX, mouseY, { x, y, w, h })) {
      const key = spawnDrag.key,
        img = stickers[key];
      const nx = mouseX - spawnDrag.w / 2,
        ny = mouseY - spawnDrag.h / 2;
      const newItem = new DraggableItem({
        type: "sticker",
        key,
        img,
        x: nx,
        y: ny,
        w: spawnDrag.w,
        h: spawnDrag.h,
      });
      clampDraggableToFrame(newItem);
      draggables.push(newItem);
    }
    spawnDrag = null;
  }

  draggingIdx = -1;
  activeMode = null;
  blockDrawThisPress = false;
  drawingThisStroke = false;
  currentStrokeLayer = null;
}

function keyPressed() {
  const numericIdx = parseInt(key, 10) - 1;
  if (
    !Number.isNaN(numericIdx) &&
    numericIdx >= 0 &&
    numericIdx < frameDefs.length
  ) {
    currentFrameIdx = numericIdx;
    return;
  }
  if (key === "P" || key === "p") startPhotoCountdown();
  // 저장 단축키
  if (key === "S" || key === "s") {
    handleSaveAction();
  }
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
function getSelectedPhotoItem() {
  for (const item of draggables) {
    if (item.selected && item.type === "photo") {
      return item;
    }
  }
  return null;
}
function getItemScreenBounds(item) {
  if (!item) return null;
  const cx = item.x + item.w / 2;
  const cy = item.y + item.h / 2;
  const cosA = Math.cos(item.angle);
  const sinA = Math.sin(item.angle);
  const halfW = item.w / 2;
  const halfH = item.h / 2;
  const pts = [
    { x: -halfW, y: -halfH },
    { x: halfW, y: -halfH },
    { x: halfW, y: halfH },
    { x: -halfW, y: halfH },
  ];
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const p of pts) {
    const sx = p.x * item.scale;
    const sy = p.y * item.scale;
    const rx = sx * cosA - sy * sinA;
    const ry = sx * sinA + sy * cosA;
    const wx = cx + rx;
    const wy = cy + ry;
    if (wx < minX) minX = wx;
    if (wx > maxX) maxX = wx;
    if (wy < minY) minY = wy;
    if (wy > maxY) maxY = wy;
  }
  return { minX, maxX, minY, maxY };
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

  // 3) 색상 버튼 클릭 (펜 모드일 때만 동작)
  if (drawTool !== "eraser") {
    for (const cBtn of colorBtnRects) {
      if (inRect(mouseX, mouseY, cBtn.rect)) {
        brushColor = cBtn.color;
        drawTool = "pen"; // 색 선택하면 펜 모드로 전환
        return;
      }
    }
  }
}
function handlePhotoPanelClick(mx, my) {
  const panel = UI.photoEditorPanel;
  if (!panel) return false;
  let consumed = false;
  if (inRect(mx, my, panel)) consumed = true;
  for (const entry of photoBorderOptionRects) {
    if (inRect(mx, my, entry.rect)) {
      const target = draggables[entry.targetIndex];
      if (target && target.type === "photo") {
        target.borderStyle = entry.option;
      }
      return true;
    }
  }
  return consumed;
}

function resetWorkspace() {
  draggables = [];
  draggingIdx = -1;
  activeMode = null;
  spawnDrag = null;
  drawingThisStroke = false;
  blockDrawThisPress = false;
  currentStrokeLayer = null;
  photoCountdown = null;
  webcamFlashTime = 0;
  if (drawingBelow) drawingBelow.clear();
  if (drawingAbove) drawingAbove.clear();
  UI.photoEditorPanel = null;
  photoBorderOptionRects = [];
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
function isMouseOverToolButtons(mx, my) {
  if (penBtnRect && inRect(mx, my, penBtnRect)) return true;
  if (eraserBtnRect && inRect(mx, my, eraserBtnRect)) return true;
  return false;
}
function isMouseOverResetButton(mx, my) {
  return UI.resetButton ? inRect(mx, my, UI.resetButton) : false;
}
function isMouseOverPhotoPanel(mx, my) {
  if (UI.photoEditorPanel && inRect(mx, my, UI.photoEditorPanel)) return true;
  for (const entry of photoBorderOptionRects) {
    if (inRect(mx, my, entry.rect)) return true;
  }
  return false;
}
function isMouseOverSizeButtons(mx, my) {
  for (const btn of sizeBtnRects) {
    if (inRect(mx, my, btn.rect)) return true;
  }
  return false;
}
function isMouseOverColorButtons(mx, my) {
  for (const btn of colorBtnRects) {
    if (inRect(mx, my, btn.rect)) return true;
  }
  return false;
}
function isMouseOverFrameButtons(mx, my) {
  for (const btn of frameBtnRects) {
    if (inRect(mx, my, btn.rect)) return true;
  }
  return false;
}

function handleSaveAction() {
  if (!window.__fb?.storage) {
    alert("Firebase가 아직 초기화되지 않았어요. 잠시 후 다시 시도해주세요.");
    return;
  }
  if (typeof window.exportFrameToFirebase !== "function") {
    alert("내보내기 기능을 준비 중입니다.");
    return;
  }
  window.exportFrameToFirebase();
}
function isMouseOverSaveButton(mx, my) {
  return UI.saveButton && inRect(mx, my, UI.saveButton);
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
    layer.strokeWeight(penSize);
    layer.strokeCap(ROUND);
    layer.line(pmx, pmy, mx, my);
  } else if (drawTool === "eraser") {
    layer.erase();
    layer.strokeWeight(eraserSize);
    layer.line(pmx, pmy, mx, my);
    layer.noErase();
  }
}
// 이미지 자체를 버튼으로 쓰는 헬퍼 (배경 없음)
function drawImageOnlyButton(r, img, active = false) {
  if (!img) return;

  const hovered = inRect(mouseX, mouseY, r);
  const lift = active ? 30 : hovered ? 5 : 0; // 위로 떠오르기(px)

  // 아이콘 비율 유지해 r 영역 안에 맞춤
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

  image(img, cx - dw / 2, cy - dh / 2, dw, dh);
}
function drawIconButton(r, img, active = false) {
  const hovered = inRect(mouseX, mouseY, r);
  const lift = active ? 6 : hovered ? 3 : 0;

  push();
  noStroke();
  fill(active ? "#1f2937" : hovered ? "#374151" : "#4b5563");
  rect(r.x, r.y, r.w, r.h, 10);

  const pad = 8;
  const iw = r.w - pad * 2;
  const ih = r.h - pad * 2;
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2 - lift;

  if (img) {
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
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(12);
    text("Icon", cx, cy);
  }
  pop();
}

function startPhotoCountdown() {
  if (!webcamReady) {
    alert("웹캠이 아직 준비되지 않았어요.");
    return;
  }
  if (photoCountdown) return;
  photoCountdown = { startMillis: millis() };
}
function updatePhotoCountdown() {
  if (!photoCountdown) return;
  const elapsed = (millis() - photoCountdown.startMillis) / 1000;
  if (elapsed >= PHOTO_COUNTDOWN_SECONDS - 0.3 && !photoCountdown.soundPlayed) {
    playShutterSound();
    photoCountdown.soundPlayed = true;
  }
  if (elapsed >= PHOTO_COUNTDOWN_SECONDS) {
    photoCountdown = null;
    takePhotoIntoCanvas();
  }
}
function getPhotoCountdownDisplayValue() {
  if (!photoCountdown) return null;
  const elapsed = (millis() - photoCountdown.startMillis) / 1000;
  const remaining = Math.ceil(PHOTO_COUNTDOWN_SECONDS - elapsed);
  return remaining > 0 ? remaining : null;
}

function takePhotoIntoCanvas() {
  if (!webcamReady) return;
  webcamFlashTime = millis();
  setTimeout(() => {
    const snap = cam.get();
    const mirrored = createGraphics(snap.width, snap.height);
    mirrored.push();
    mirrored.translate(mirrored.width, 0);
    mirrored.scale(-1, 1);
    mirrored.image(snap, 0, 0);
    mirrored.pop();
    const Wmax = 240,
      Hmax = 180,
      ratio = Math.min(Wmax / mirrored.width, Hmax / mirrored.height);
    const w = mirrored.width * ratio,
      h = mirrored.height * ratio;
    const cx = UI.diaryFrameRect.x + UI.diaryFrameRect.w / 2 - w / 2;
    const cy = UI.diaryFrameRect.y + UI.diaryFrameRect.h / 2 - h / 2;
    const newItem = new DraggableItem({
      type: "photo",
      img: mirrored,
      x: cx,
      y: cy,
      w,
      h,
    });
    clampDraggableToFrame(newItem);
    draggables.push(newItem);
  }, PHOTO_CAPTURE_DELAY);
}
function playShutterSound() {
  try {
    prepareShutterAudio();
    shutterAudio.currentTime = 0;
    const playPromise = shutterAudio.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise.catch(() => {});
    }
  } catch (err) {
    console.warn("Failed to play shutter sound", err);
  }
}
function prepareShutterAudio() {
  if (!shutterAudio) {
    shutterAudio = new Audio("assets/shutter_sound.mp3");
    shutterAudio.preload = "auto";
    shutterAudio.load();
  }
}
function ensureBackgroundMusicPlaying() {
  try {
    prepareBackgroundMusic();
    if (!backgroundMusic) return;
    if (!backgroundMusicStarted || backgroundMusic.paused) {
      const playPromise = backgroundMusic.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => {
            backgroundMusicStarted = true;
          })
          .catch(() => {});
      } else {
        backgroundMusicStarted = true;
      }
    }
  } catch (err) {
    console.warn("Failed to play background music", err);
  }
}
function prepareBackgroundMusic() {
  if (!backgroundMusic) {
    backgroundMusic = new Audio("assets/background_music.mp3");
    backgroundMusic.loop = true;
    backgroundMusic.preload = "auto";
    backgroundMusic.load();
  }
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
  if (
    !cursorSet &&
    (isMouseOverPanelSticker(mouseX, mouseY) ||
      isMouseOverToolButtons(mouseX, mouseY) ||
      isMouseOverSizeButtons(mouseX, mouseY) ||
      isMouseOverColorButtons(mouseX, mouseY) ||
      isMouseOverFrameButtons(mouseX, mouseY) ||
      isMouseOverResetButton(mouseX, mouseY) ||
      isMouseOverPhotoPanel(mouseX, mouseY) ||
      isMouseOverSaveButton(mouseX, mouseY))
  ) {
    cursor(HAND);
    cursorSet = true;
  }
  if (!cursorSet) cursor(ARROW);
}

/* ========================
   Export (Frame → PNG → Firebase → QR)
======================== */

// 프레임 콘텐츠만 오프스크린으로 합성해서 반환
function renderFrameToGraphic() {
  const f = UI.diaryFrameRect;
  const innerW = f.w - f.pad * 2;
  const innerH = f.h - f.pad * 2;

  const g = createGraphics(f.w, f.h);
  g.clear();

  // 1) 프레임 이미지
  const frameKey = frameDefs[currentFrameIdx].key;
  if (frames[frameKey]) {
    g.image(frames[frameKey], 0, 0, f.w, f.h);
  } else {
    g.push();
    g.noStroke();
    g.fill(245);
    g.rect(0, 0, f.w, f.h, 12);
    g.pop();
  }

  // 2) 내부 패딩 영역으로 이동
  g.push();
  g.translate(f.pad, f.pad);

  // 3) 아래 레이어
  if (drawingBelow) g.image(drawingBelow, 0, 0, innerW, innerH);

  // 4) 스티커/사진 (화면 좌표 → 프레임 기준으로 보정)
  for (const d of draggables) {
    g.push();
    g.translate(-f.x, -f.y); // 화면 전역 좌표에서 프레임 기준으로 이동
    d.drawTo(g);
    g.pop();
  }

  // 5) 위 레이어
  if (drawingAbove) g.image(drawingAbove, 0, 0, innerW, innerH);

  g.pop();
  return g;
}

// p5.Graphics → Blob → Firebase Storage 업로드
async function uploadGraphicToFirebase(g) {
  if (!window.__fb) {
    alert("Firebase가 초기화되지 않았어요 (index.html 설정 확인)");
    return null;
  }
  const { storage, ref, uploadBytes, getDownloadURL } = window.__fb;

  const blob = await new Promise((resolve) => {
    g.canvas.toBlob((b) => resolve(b), "image/png");
  });
  if (!blob) return null;

  const now = new Date();
  const y = now.getFullYear(),
    m = String(now.getMonth() + 1).padStart(2, "0"),
    d = String(now.getDate()).padStart(2, "0");
  const ts = `${now.getHours()}${String(now.getMinutes()).padStart(
    2,
    "0"
  )}${String(now.getSeconds()).padStart(2, "0")}_${now.getTime()}`;

  const objectPath = `diary/${y}-${m}-${d}/frame_${ts}.png`;

  const storageRef = ref(storage, objectPath);
  await uploadBytes(storageRef, blob, { contentType: "image/png" });
  const url = await getDownloadURL(storageRef);
  return { url, objectPath };
}

// QR 표시
function showQR(url) {
  const wrap = document.getElementById("qrWrap");
  const box = document.getElementById("qrcode");
  const link = document.getElementById("downloadLink");
  if (!wrap || !box || !link) {
    console.warn("QR UI elements not found in DOM");
    return;
  }
  box.innerHTML = "";
  new QRCode(box, {
    text: url,
    width: 168,
    height: 168,
    correctLevel: QRCode.CorrectLevel.M,
  });
  link.href = url;
  link.textContent = url;
  wrap.classList.add("is-open");
  if (typeof window.playConfettiOnce === "function") {
    window.playConfettiOnce();
  }
}

// 공개: 버튼/단축키에서 호출
window.exportFrameToFirebase = async function () {
  try {
    if (typeof window.showLoadingOverlay === "function") {
      window.showLoadingOverlay();
    }
    // 1) 프레임만 오프스크린 렌더
    const g = renderFrameToGraphic();

    // 2) Firebase 업로드
    const res = await uploadGraphicToFirebase(g);
    if (!res) {
      alert("업로드 실패");
      return;
    }

    // 3) QR 표시
    showQR(res.url);
    console.log("Uploaded to:", res.objectPath);
  } catch (err) {
    console.error("Failed to export frame", err);
    alert("업로드 중 오류가 발생했습니다.");
  } finally {
    if (typeof window.hideLoadingOverlay === "function") {
      window.hideLoadingOverlay();
    }
  }
};
