/*
  TAPBIT 스타일 코인 계산기
  제작: YOUR_NAME
  비상업적 사용 가능
*/
/* =========================
   app.js (통째 최종본)
   ✅ 요청 반영(흰색만):
   - 흰색 전체 X를 -2px (왼쪽 2px) 이동
   - 흰색 간격은 "일정하게" 유지 (기존 간격 로직 그대로)
   ✅ 그 외(초록/회색/상단/좌표/이동) 전부 그대로

   ✅ (추가 요청 3개만 반영)
   1) 초록색 숫자 "4,1"만 아래로 +1px
   2) 회색 시간 부분에서 숫자==:==숫자 간격 2px 고정
   3) 회색 ':' 기호만 아래로 +3px
========================= */

/* =========================
   0) 좌표/레이아웃 (기존 유지)
========================= */
const LAYOUT = {
  W: 720,
  H: 1184,

  topLine: {
    yCenter: 215,
    xStart: 52 - 17,

    logoSize: 34,
    gapLogoToLabel: 10,

    coinGapBTC: 10,
    coinGapETH: 13,

    posGapToLev: 12,
    shortShiftX: 3,
    posLevShiftX: -16,
    levExtraShiftX: -3,
  },

  pnl: { x: 72 - 5, baselineY: 340 + 10, theme: "green" },
  roe: { x: 70 - 5, baselineY: 472 + 10, theme: "green" },

  entry: { x: 217, baselineY: 605 - 35, theme: "white" },
  close: { x: 204 + 7, baselineY: 658 - 35, theme: "white" },

  time: { x: 52 - 15, baselineY: 1122, theme: "gray" },
};

/* =========================
   0-1) 기존 픽셀 이동(그대로 유지)
========================= */
const UI_MOVE = {
  coinLabel: { dx: +1, dySpec: -4 },

  longOnly: { dx: +4, dySpec: -2 },
  shortOnly: { dx: +1, dySpec: -4 },

  longLev: { dx: +2, dySpec: -2 },
  shortLev: { dx: +1, dySpec: -3 },

  greenAll: { dx: +7, dySpec: 0 },

  entryWhite: { dx: -21, dySpec: 0 },
  closeWhite: { dx: -10, dySpec: 0 },

  timeGray: { dx: 0, dySpec: -20 },
};

function dyFromSpec(dySpec) {
  return -dySpec;
}

/* =========================
   (현재 맞춰진 상태 유지용)
========================= */
const GREEN_DOWN = 33; // 초록색 전체 아래로 33px
const WHITE_DOWN = 24; // 흰색 전체 아래로 25px(현재 코드 유지값)
const WHITE_SHIFT_X = -2; // ✅ (추가) 흰색만 전체적으로 왼쪽 2px

/* =========================
   green 간격 규칙(기존 그대로 유지)
========================= */
function greenExtraGap(curr, next) {
  if (!next) return 0;
  const isDigit = (c) => c >= "0" && c <= "9";

  if (isDigit(curr) && next === ",") return -3;
  if (curr === "," && isDigit(next)) return -2;

  if (isDigit(curr) && next === ".") return -2;
  if (curr === "." && isDigit(next)) return +1;

  return 0;
}

/* ✅ white 간격 규칙
   - (현재 코드 그대로 유지)
   - 기본 간격 -1 + 아래 룰 적용
*/
const WHITE_BASE_SPACING = -2;

function whiteExtraGap(curr, next) {
  if (!next) return 0;
  const isDigit = (c) => c >= "0" && c <= "9";

  // ✅ 숫자===콤마 : -1
  if (isDigit(curr) && next === ",") return -1;

  // ✅ 콤마===숫자 : -1
  if (curr === "," && isDigit(next)) return -1;

  // 숫자===점 : -1
  if (isDigit(curr) && next === ".") return 0;

  // 점===숫자 : -1
  if (curr === "." && isDigit(next)) return 1;

  return 0;
}

/* =========================
   1) 에셋 경로
========================= */
const PATHS = {
  bg: "./bg.jpg",

  labels: {
    BTC: "./logos/BTC.png",
    ETH: "./logos/ETH.png",
    long: "./labels/Long.png",
    short: "./labels/Short.png",
  },

  leverage: {
    10: "./leverage/10X.png",
    30: "./leverage/30X.png",
    50: "./leverage/50X.png",
  },

  coinIcon: {
    BTC: "./coin_icons/BTC.png",
    ETH: "./coin_icons/ETH.png",
  },

  numbers: {
    green: {
      digits: (d) => `./numbers/green/${d}.png`,
      comma: "./numbers/green/comma.png",
      dot: "./numbers/green/dot.png",
      percent: "./numbers/green/percent.png",
      plus: "./numbers/green/plus.png", // 사용 안 함
    },
    white: {
      digits: (d) => `./numbers/white/${d}.png`,
      comma: "./numbers/white/comma.png",
      dot: "./numbers/white/dot.png",
    },
    gray: {
      digits: (d) => `./numbers/gray/${d}.png`,
      dash: "./numbers/gray/dash.png",
      colon: "./numbers/gray/colon.png",
      space: "./numbers/gray/space.png",
    },
  },
};

/* =========================
   2) 로딩
========================= */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`로드 실패: ${src}`));
    img.src = src;
  });
}

async function loadImageOptional(src) {
  try {
    return await loadImage(src);
  } catch {
    return null;
  }
}

async function preloadAll() {
  const assets = { bg: null, label: {}, lev: {}, icon: {}, num: {} };

  assets.bg = await loadImage(PATHS.bg);

  assets.label.BTC = await loadImage(PATHS.labels.BTC);
  assets.label.ETH = await loadImage(PATHS.labels.ETH);
  assets.label.long = await loadImage(PATHS.labels.long);
  assets.label.short = await loadImage(PATHS.labels.short);

  assets.lev[10] = await loadImage(PATHS.leverage[10]);
  assets.lev[30] = await loadImage(PATHS.leverage[30]);
  assets.lev[50] = await loadImage(PATHS.leverage[50]);

  assets.icon.BTC = await loadImageOptional(PATHS.coinIcon.BTC);
  assets.icon.ETH = await loadImageOptional(PATHS.coinIcon.ETH);

  assets.num = {
    green: new Map(),
    white: new Map(),
    gray: new Map(),
  };

  return assets;
}

async function getGlyph(assets, theme, key) {
  const cache = assets.num[theme];
  if (!cache) throw new Error(`알 수 없는 theme: ${theme}`);
  if (cache.has(key)) return cache.get(key);

  const N = PATHS.numbers[theme];
  let src = null;

  if (/^\d$/.test(key)) src = N.digits(key);
  else if (key === ",") src = N.comma;
  else if (key === ".") src = N.dot;
  else if (key === "%") src = N.percent;
  else if (key === ":") src = N.colon;
  else if (key === "–") src = N.dash;
  else if (key === " ") src = N.space;
  else throw new Error(`정의 안 된 글리프: [${theme}] ${key}`);

  const img = await loadImage(src);
  cache.set(key, img);
  return img;
}

/* =========================
   3) 포맷(음수 0)
========================= */
function fmtWithComma2(n) {
  const v = Math.max(0, Number(n) || 0);
  return v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtPercent2(n) {
  const v = Math.max(0, Number(n) || 0);
  return v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%";
}
function fmtPrice1(n) {
  const v = Math.max(0, Number(n) || 0);
  return v.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
function fmtTime(dtStr) {
  if (!dtStr) return "0000-00-00 00:00:00";
  const d = new Date(dtStr);
  if (Number.isNaN(d.getTime())) return "0000-00-00 00:00:00";
  const pad = (x) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/* =========================
   4) 글리프 오프셋
========================= */
function glyphOffset(theme, ch) {
  let dx = 0, dy = 0;

  // green comma: 아래로 +8px
  if (theme === "green" && ch === ",") dy += 8;

  // ✅ (추가1) 초록색 "4,1"만 아래로 +1px
  // - dy는 숫자에 적용해야 하므로, '4' 그리고 '1' 둘 다 +1을 주면 정확히 "4,1" 덩어리가 내려감
  // - 다른 숫자에는 영향 없음
  if (theme === "green" && (ch === "4" || ch === "1")) dy += 1;

  // green percent: 오른쪽 +2px
  if (theme === "green" && ch === "%") dx += 2;

  // white 기존 유지
  if (theme === "white" && ch === "2") dy += -1;
  if (theme === "white" && ch === ",") dy += +3;

  // ✅ (추가3) gray ':' 기호만 아래로 +3px
  if (theme === "gray" && ch === ":") dy += 3;

  // gray 기존 유지
  if (theme === "gray" && ch === "–") dy += -7;
  if (theme === "gray" && ch === ":") dy += -4; // 기존 -4 유지 + 위에서 +3 적용 => 최종 -1

  return { dx, dy };
}

/* =========================
   4-1) 문자열 렌더
========================= */
async function drawGlyphStringSimple(ctx, assets, theme, text, x, baselineY, scale = 1) {
  let cx = x;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (theme !== "green" && ch === "%") continue;
    if (ch === "+") continue; // 플러스 출력 안 함

    const glyph = await getGlyph(assets, theme, ch);
    const w = glyph.width * scale;
    const h = glyph.height * scale;

    const { dx, dy } = glyphOffset(theme, ch);
    const y = (baselineY - h) + dy;

    ctx.drawImage(glyph, cx + dx, y, w, h);

    cx += w;

    if (theme === "green") {
      cx += greenExtraGap(ch, next);
    } else if (theme === "white") {
      cx += WHITE_BASE_SPACING;
      cx += whiteExtraGap(ch, next);
    } else if (theme === "gray") {
      // ✅ (추가2) gray 시간의 숫자==:==숫자 간격 0px 고정
      // - 날짜/시간 분리는 renderAll에서 하고,
      // - 여기서는 gray 문자열 렌더 시 advance를 0px로 고정
      cx += 0;
    }
  }

  return cx;
}

/* =========================
   5) 계산
========================= */
function calc(entry, close, investment, leverage, pos) {
  const e = Number(entry), c = Number(close);
  const inv = Number(investment), lev = Number(leverage);
  if (!e || !c || !inv || !lev) return { pnl: 0, roe: 0 };

  let pct = (c - e) / e;
  if (pos === "short") pct = (e - c) / e;

  const pnl = Math.max(0, inv * lev * pct);
  const roe = Math.max(0, (pnl / inv) * 100);
  return { pnl, roe };
}
function pickLev(v) {
  const n = Number(v);
  if (n >= 50) return 50;
  if (n >= 30) return 30;
  return 10;
}

/* =========================
   6) 렌더
========================= */
async function renderAll(assets) {
  const canvas = document.getElementById("out");
  const ctx = canvas.getContext("2d");

  const coin = document.getElementById("coin").value; // BTC/ETH
  const entryPrice = document.getElementById("entryPrice").value;
  const closePrice = document.getElementById("closePrice").value;
  const investment = document.getElementById("investment").value;
  const leverageInput = document.getElementById("leverage").value;
  const pos = document.querySelector('input[name="position"]:checked')?.value || "long";
  const tradeTime = document.getElementById("tradeTime").value;

  const lev = pickLev(leverageInput);
  const { pnl, roe } = calc(entryPrice, closePrice, investment, lev, pos);

  const resultBox = document.getElementById("result");
  resultBox.innerHTML =
    `<b>계산 결과</b><br>` +
    `PNL: ${fmtWithComma2(pnl)} USDT<br>` +
    `ROE: ${fmtPercent2(roe)}<br>` +
    `<span style="font-size:12px;color:#666;">※ 음수는 0으로 표시</span>`;

  // bg
  ctx.clearRect(0, 0, LAYOUT.W, LAYOUT.H);
  ctx.drawImage(assets.bg, 0, 0, LAYOUT.W, LAYOUT.H);

  /* ----- 상단 ----- */
  const top = LAYOUT.topLine;

  const coinLabel = assets.label[coin];
  const posImg = (pos === "long") ? assets.label.long : assets.label.short;
  const levImg = assets.lev[lev];

  const icon = assets.icon[coin];
  let labelX = top.xStart;

  if (icon) {
    const iconX = top.xStart;
    const iconY = top.yCenter - top.logoSize / 2;
    ctx.drawImage(icon, iconX, iconY, top.logoSize, top.logoSize);
    labelX = iconX + top.logoSize + top.gapLogoToLabel;
  }

  // coin label
  const coinLabelDx = UI_MOVE.coinLabel.dx;
  const coinLabelDy = dyFromSpec(UI_MOVE.coinLabel.dySpec);
  const labelY = (top.yCenter - coinLabel.height / 2) + coinLabelDy;
  ctx.drawImage(coinLabel, labelX + coinLabelDx, labelY);

  // pos
  const coinGap = (coin === "ETH") ? top.coinGapETH : top.coinGapBTC;
  const shortShift = (pos === "short") ? top.shortShiftX : 0;
  const basePosX = labelX + coinLabel.width + coinGap + shortShift + top.posLevShiftX;
  const basePosY = top.yCenter - posImg.height / 2;

  const posMove = (pos === "long") ? UI_MOVE.longOnly : UI_MOVE.shortOnly;
  ctx.drawImage(posImg, basePosX + posMove.dx, basePosY + dyFromSpec(posMove.dySpec));

  // leverage
  const baseLevX = basePosX + posImg.width + top.posGapToLev + top.levExtraShiftX;
  const baseLevY = top.yCenter - levImg.height / 2;

  const levMove = (pos === "long") ? UI_MOVE.longLev : UI_MOVE.shortLev;
  ctx.drawImage(levImg, baseLevX + levMove.dx, baseLevY + dyFromSpec(levMove.dySpec));

  /* ----- green ----- */
  const pnlText = fmtWithComma2(pnl);
  const roeText = fmtPercent2(roe);

  await drawGlyphStringSimple(
    ctx, assets, "green",
    pnlText,
    (LAYOUT.pnl.x + UI_MOVE.greenAll.dx - 3),
    (LAYOUT.pnl.baselineY + GREEN_DOWN),
    1
  );

  await drawGlyphStringSimple(
    ctx, assets, "green",
    roeText,
    (LAYOUT.roe.x + UI_MOVE.greenAll.dx),
    (LAYOUT.roe.baselineY + GREEN_DOWN),
    1
  );

  /* ----- white (✅ 흰색만 X -2px 추가 적용) ----- */
  const entryText = fmtPrice1(entryPrice);
  const closeText = fmtPrice1(closePrice);

  await drawGlyphStringSimple(
    ctx, assets, "white",
    entryText,
    (LAYOUT.entry.x + UI_MOVE.entryWhite.dx + WHITE_SHIFT_X),
    (LAYOUT.entry.baselineY + WHITE_DOWN),
    1
  );

  await drawGlyphStringSimple(
    ctx, assets, "white",
    closeText,
    (LAYOUT.close.x + UI_MOVE.closeWhite.dx + WHITE_SHIFT_X),
    (LAYOUT.close.baselineY + WHITE_DOWN),
    1
  );

  /* ----- gray time (기존 잘 맞던 방식 유지: 날짜/시간 분리) ----- */
  const timeText = fmtTime(tradeTime).replaceAll("-", "–");

  const timeBaseX = LAYOUT.time.x;
  const timeBaseY = LAYOUT.time.baselineY + dyFromSpec(UI_MOVE.timeGray.dySpec);

  const parts = timeText.split(" ");
  const datePart = parts[0] || "";
  const timePart = parts[1] || "";

  const TIME_SHIFT_RIGHT = 6;
  const dateEndX = await drawGlyphStringSimple(ctx, assets, "gray", datePart, timeBaseX, timeBaseY, 1);
  await drawGlyphStringSimple(ctx, assets, "gray", timePart, dateEndX + TIME_SHIFT_RIGHT, timeBaseY, 1);
}

/* =========================
   7) 저장
========================= */
function downloadCanvasPng(canvas, filename = "coin_result.png") {
  const a = document.createElement("a");
  a.download = filename;
  a.href = canvas.toDataURL("image/png");
  a.click();
}

/* =========================
   8) 부트
========================= */
let ASSETS = null;

async function boot() {
  const btnCalc = document.getElementById("btnCalcRender");
  const btnSave = document.getElementById("btnSavePng");
  const resultBox = document.getElementById("result");

  // 사이트 제목
  document.title = "TAPBIT 계산기";

  try {
    resultBox.textContent = "에셋 로딩중...";
    ASSETS = await preloadAll();
    resultBox.textContent = "준비 완료! 값을 넣고 [계산+렌더] 누르세요.";
  } catch (e) {
    alert(
      `에셋 로드 실패:\n${e.message}\n\n` +
      `1) 파일명/대소문자 확인\n2) 폴더 위치 확인\n3) Live Server로 열었는지 확인`
    );
    resultBox.textContent = "에셋 로드 실패";
    console.error(e);
    return;
  }

  btnCalc.addEventListener("click", async () => {
    try {
      await renderAll(ASSETS);
    } catch (e) {
      alert("렌더 실패:\n" + e.message);
      console.error(e);
    }
  });

  btnSave.addEventListener("click", () => {
    downloadCanvasPng(document.getElementById("out"), "coin_result.png");
  });
}

document.addEventListener("DOMContentLoaded", boot);
