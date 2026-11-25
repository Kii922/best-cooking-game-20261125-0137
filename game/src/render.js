// Sizzle & Serve — kitchen rendering: floor, bins, stations, plates, hands.
// One job: draw the kitchen itself on the canvas. HUD and screens live in hud.js.

import { COLORS, ITEMS, BINS, BIN_W, BIN_H, BIN_Y, STATIONS, PLATES, VIEW_W } from './config.js';

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

export function progressRing(ctx, x, y, r, progress, color, width = 7) {
  ctx.lineWidth = width;
  ctx.strokeStyle = 'rgba(34,49,78,0.15)';
  circle(ctx, x, y, r);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
  ctx.stroke();
}

// ---- one recognizable food icon, drawn from shapes (no images, no network) ----
export function drawItemIcon(ctx, item, cx, cy, s) {
  ctx.save();
  ctx.translate(cx, cy);
  const u = s / 2;
  if (item === 'tomato' || item === 'tomatoChopped') {
    ctx.fillStyle = '#e0392f';
    if (item === 'tomato') {
      circle(ctx, 0, 0, u * 0.85);
      ctx.fill();
      ctx.fillStyle = '#3e9b4f';
      ctx.beginPath();
      ctx.moveTo(0, -u * 0.85);
      ctx.lineTo(-u * 0.35, -u * 0.35);
      ctx.lineTo(u * 0.35, -u * 0.35);
      ctx.closePath();
      ctx.fill();
    } else {
      // two slices
      ctx.beginPath();
      ctx.arc(-u * 0.35, 0, u * 0.55, 0, Math.PI * 2);
      ctx.arc(u * 0.4, u * 0.1, u * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f0837a';
      circle(ctx, -u * 0.35, 0, u * 0.28);
      ctx.fill();
      circle(ctx, u * 0.4, u * 0.1, u * 0.28);
      ctx.fill();
    }
  } else if (item === 'lettuce') {
    ctx.fillStyle = '#4da34d';
    for (const dx of [-u * 0.45, 0, u * 0.45]) {
      ctx.beginPath();
      ctx.ellipse(dx, u * 0.1, u * 0.45, u * 0.62, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#79c47a';
    ctx.beginPath();
    ctx.ellipse(0, -u * 0.15, u * 0.4, u * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (item === 'cheese') {
    ctx.fillStyle = '#f2b705';
    ctx.beginPath();
    ctx.moveTo(-u * 0.85, u * 0.6);
    ctx.lineTo(u * 0.85, u * 0.6);
    ctx.lineTo(0, -u * 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#d99600';
    circle(ctx, -u * 0.25, u * 0.2, u * 0.14);
    ctx.fill();
    circle(ctx, u * 0.3, u * 0.3, u * 0.11);
    ctx.fill();
  } else if (item === 'bun') {
    ctx.fillStyle = '#e0a458';
    ctx.beginPath();
    ctx.arc(0, u * 0.35, u * 0.85, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c98a3e';
    roundRect(ctx, -u * 0.85, u * 0.3, u * 1.7, u * 0.3, u * 0.12);
    ctx.fill();
    ctx.fillStyle = '#fff3d6';
    circle(ctx, -u * 0.35, -u * 0.25, u * 0.09);
    ctx.fill();
    circle(ctx, u * 0.3, -u * 0.4, u * 0.09);
    ctx.fill();
    circle(ctx, u * 0.05, -u * 0.1, u * 0.09);
    ctx.fill();
  } else if (item === 'patty' || item === 'pattyGrilled') {
    ctx.fillStyle = item === 'patty' ? '#8a5a3b' : '#6b4423';
    roundRect(ctx, -u * 0.9, -u * 0.45, u * 1.8, u * 0.9, u * 0.4);
    ctx.fill();
    if (item === 'pattyGrilled') {
      ctx.strokeStyle = '#4a2c14';
      ctx.lineWidth = 3;
      for (const dx of [-u * 0.45, 0, u * 0.45]) {
        ctx.beginPath();
        ctx.moveTo(dx, -u * 0.4);
        ctx.lineTo(dx, u * 0.4);
        ctx.stroke();
      }
    }
  } else if (item === 'pasta' || item === 'pastaCooked') {
    ctx.strokeStyle = item === 'pasta' ? '#e8c97a' : '#f0d48a';
    ctx.lineWidth = u * 0.22;
    ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(-u * 0.8, i * u * 0.45);
      ctx.bezierCurveTo(-u * 0.3, i * u * 0.45 - u * 0.35, u * 0.3, i * u * 0.45 + u * 0.35, u * 0.8, i * u * 0.45);
      ctx.stroke();
    }
    if (item === 'pastaCooked') {
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-u * 0.3, -u * 0.9);
      ctx.quadraticCurveTo(-u * 0.1, -u * 1.2, -u * 0.3, -u * 1.45);
      ctx.stroke();
    }
  } else if (item === 'burnt') {
    ctx.fillStyle = '#2b2b2b';
    circle(ctx, 0, u * 0.1, u * 0.8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(120,120,120,0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -u * 0.7);
    ctx.quadraticCurveTo(u * 0.25, -u * 1.1, 0, -u * 1.4);
    ctx.stroke();
  }
  ctx.restore();
}

function stationLabel(ctx, x, y, w, text) {
  ctx.fillStyle = COLORS.ink;
  ctx.font = '800 15px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, x + w / 2, y + 22);
}

// ---- the whole kitchen floor and stations ----
export function drawKitchen(ctx, game, mouse) {
  // tile floor
  const tile = 64;
  for (let y = 196; y < 720; y += tile) {
    for (let x = 0; x < VIEW_W; x += tile) {
      ctx.fillStyle = ((x / tile + y / tile) % 2 === 0) ? COLORS.floorLight : COLORS.floorDark;
      ctx.fillRect(x, y, tile, tile);
    }
  }

  // ---- ingredient bins ----
  for (const bin of BINS) {
    const hover = mouse && mouse.x >= bin.x && mouse.x <= bin.x + BIN_W && mouse.y >= BIN_Y && mouse.y <= BIN_Y + BIN_H;
    ctx.fillStyle = hover ? '#ffffff' : COLORS.card;
    ctx.strokeStyle = hover ? COLORS.gold : 'rgba(34,49,78,0.25)';
    ctx.lineWidth = hover ? 3 : 2;
    roundRect(ctx, bin.x, BIN_Y, BIN_W, BIN_H, 12);
    ctx.fill();
    ctx.stroke();
    drawItemIcon(ctx, bin.item, bin.x + 34, BIN_Y + 44, 52);
    ctx.fillStyle = COLORS.ink;
    ctx.font = '800 17px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(bin.label, bin.x + 66, BIN_Y + 38);
    ctx.fillStyle = COLORS.muted;
    ctx.font = '700 13px Arial, sans-serif';
    ctx.fillText(`key ${bin.key} · click`, bin.x + 66, BIN_Y + 60);
  }

  drawBoard(ctx, game, mouse);
  drawGrill(ctx, game, mouse);
  drawPot(ctx, game, mouse);
  drawTrash(ctx, game, mouse);
  drawPlates(ctx, game, mouse);
  drawHands(ctx, game, mouse);
}

function drawBoard(ctx, game, mouse) {
  const s = STATIONS.board;
  const hover = mouse && mouse.x >= s.x && mouse.x <= s.x + s.w && mouse.y >= s.y && mouse.y <= s.y + s.h;
  ctx.fillStyle = COLORS.card;
  ctx.strokeStyle = hover ? COLORS.gold : 'rgba(34,49,78,0.25)';
  ctx.lineWidth = hover ? 3 : 2;
  roundRect(ctx, s.x, s.y, s.w, s.h, 12);
  ctx.fill();
  ctx.stroke();
  stationLabel(ctx, s.x, s.y, s.w, s.label);
  // wooden board
  ctx.fillStyle = COLORS.board;
  roundRect(ctx, s.x + 30, s.y + 34, s.w - 60, 78, 10);
  ctx.fill();
  ctx.fillStyle = COLORS.woodDark;
  roundRect(ctx, s.x + 30, s.y + 34, s.w - 60, 10, 5);
  ctx.fill();
  const b = game.board;
  if (b.item) {
    drawItemIcon(ctx, b.item, s.x + s.w / 2, s.y + 74, 56);
    if (b.chopping) {
      progressRing(ctx, s.x + s.w / 2, s.y + 74, 40, b.progress, COLORS.gold, 7);
      ctx.fillStyle = COLORS.ink;
      ctx.font = '800 13px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CHOPPING…', s.x + s.w / 2, s.y + 132);
    } else if (b.progress >= 1) {
      ctx.fillStyle = COLORS.greenDark;
      ctx.font = '800 14px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('READY — click to take', s.x + s.w / 2, s.y + 132);
    }
  } else {
    ctx.fillStyle = COLORS.muted;
    ctx.font = '700 14px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('bring a tomato to chop', s.x + s.w / 2, s.y + 78);
  }
}

function drawGrill(ctx, game, mouse) {
  const s = STATIONS.grill;
  const hover = mouse && mouse.x >= s.x && mouse.x <= s.x + s.w && mouse.y >= s.y && mouse.y <= s.y + s.h;
  ctx.fillStyle = COLORS.card;
  ctx.strokeStyle = hover ? COLORS.gold : 'rgba(34,49,78,0.25)';
  ctx.lineWidth = hover ? 3 : 2;
  roundRect(ctx, s.x, s.y, s.w, s.h, 12);
  ctx.fill();
  ctx.stroke();
  stationLabel(ctx, s.x, s.y, s.w, s.label);
  // grill body
  ctx.fillStyle = COLORS.steelDark;
  roundRect(ctx, s.x + 30, s.y + 34, s.w - 60, 78, 10);
  ctx.fill();
  ctx.strokeStyle = '#3c4654';
  ctx.lineWidth = 3;
  for (let i = 1; i < 5; i++) {
    const gx = s.x + 30 + ((s.w - 60) / 5) * i;
    ctx.beginPath();
    ctx.moveTo(gx, s.y + 38);
    ctx.lineTo(gx, s.y + 108);
    ctx.stroke();
  }
  const g = game.grill;
  if (g.item) {
    drawItemIcon(ctx, g.item, s.x + s.w / 2, s.y + 74, 56);
    const color = g.item === 'burnt' ? COLORS.red : g.progress >= 1 ? COLORS.green : COLORS.gold;
    progressRing(ctx, s.x + s.w / 2, s.y + 74, 40, g.progress, color, 7);
    ctx.fillStyle = g.item === 'burnt' ? COLORS.red : g.progress >= 1 ? COLORS.greenDark : COLORS.ink;
    ctx.font = '800 13px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(g.item === 'burnt' ? 'BURNT — take it to trash' : g.progress >= 1 ? 'READY — click to take' : 'GRILLING…', s.x + s.w / 2, s.y + 132);
  } else {
    ctx.fillStyle = COLORS.muted;
    ctx.font = '700 14px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('bring a raw patty', s.x + s.w / 2, s.y + 78);
  }
}

function drawPot(ctx, game, mouse) {
  const s = STATIONS.pot;
  const hover = mouse && mouse.x >= s.x && mouse.x <= s.x + s.w && mouse.y >= s.y && mouse.y <= s.y + s.h;
  ctx.fillStyle = COLORS.card;
  ctx.strokeStyle = hover ? COLORS.gold : 'rgba(34,49,78,0.25)';
  ctx.lineWidth = hover ? 3 : 2;
  roundRect(ctx, s.x, s.y, s.w, s.h, 12);
  ctx.fill();
  ctx.stroke();
  stationLabel(ctx, s.x, s.y, s.w, s.label);
  // pot
  ctx.fillStyle = COLORS.steel;
  roundRect(ctx, s.x + 45, s.y + 40, s.w - 90, 66, 12);
  ctx.fill();
  ctx.fillStyle = '#7fc4e8';
  roundRect(ctx, s.x + 52, s.y + 46, s.w - 104, 18, 8);
  ctx.fill();
  const p = game.pot;
  if (p.item) {
    drawItemIcon(ctx, p.item, s.x + s.w / 2, s.y + 74, 52);
    const color = p.item === 'burnt' ? COLORS.red : p.progress >= 1 ? COLORS.green : COLORS.gold;
    progressRing(ctx, s.x + s.w / 2, s.y + 74, 38, p.progress, color, 7);
    ctx.fillStyle = p.item === 'burnt' ? COLORS.red : p.progress >= 1 ? COLORS.greenDark : COLORS.ink;
    ctx.font = '800 13px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(p.item === 'burnt' ? 'BURNT — take it to trash' : p.progress >= 1 ? 'READY — click to take' : 'BOILING…', s.x + s.w / 2, s.y + 132);
  } else {
    ctx.fillStyle = COLORS.muted;
    ctx.font = '700 14px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('bring dry pasta', s.x + s.w / 2, s.y + 124);
  }
}

function drawTrash(ctx, game, mouse) {
  const s = STATIONS.trash;
  const hover = mouse && mouse.x >= s.x && mouse.x <= s.x + s.w && mouse.y >= s.y && mouse.y <= s.y + s.h;
  ctx.fillStyle = hover ? '#fdeceb' : COLORS.card;
  ctx.strokeStyle = hover ? COLORS.red : 'rgba(34,49,78,0.25)';
  ctx.lineWidth = hover ? 3 : 2;
  roundRect(ctx, s.x, s.y, s.w, s.h, 12);
  ctx.fill();
  ctx.stroke();
  stationLabel(ctx, s.x, s.y, s.w, s.label);
  // bin
  ctx.fillStyle = COLORS.steel;
  roundRect(ctx, s.x + s.w / 2 - 34, s.y + 44, 68, 56, 8);
  ctx.fill();
  ctx.fillStyle = COLORS.steelDark;
  roundRect(ctx, s.x + s.w / 2 - 40, s.y + 36, 80, 12, 6);
  ctx.fill();
  ctx.fillStyle = COLORS.muted;
  ctx.font = '700 13px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('click to discard', s.x + s.w / 2, s.y + 126);
}

function drawPlates(ctx, game, mouse) {
  for (const plateDef of PLATES) {
    const plate = game.plates.find((p) => p.id === plateDef.id);
    const hover = mouse && mouse.x >= plateDef.x && mouse.x <= plateDef.x + plateDef.w && mouse.y >= plateDef.y && mouse.y <= plateDef.y + plateDef.h;
    ctx.fillStyle = COLORS.card;
    ctx.strokeStyle = hover ? COLORS.gold : 'rgba(34,49,78,0.25)';
    ctx.lineWidth = hover ? 3 : 2;
    roundRect(ctx, plateDef.x, plateDef.y, plateDef.w, plateDef.h, 12);
    ctx.fill();
    ctx.stroke();
    stationLabel(ctx, plateDef.x, plateDef.y, plateDef.w, plateDef.label);
    // plate ellipse
    const cx = plateDef.x + plateDef.w / 2;
    const cy = plateDef.y + 92;
    ctx.fillStyle = '#e8e2d4';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 108, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.plate;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 96, 28, 0, 0, Math.PI * 2);
    ctx.fill();
    // stacked ingredients on the plate
    const items = plate.items;
    items.forEach((item, i) => {
      const ix = cx + (i - (items.length - 1) / 2) * 44;
      drawItemIcon(ctx, item, ix, cy - 6 - i * 4, 40);
    });
    if (items.length === 0) {
      ctx.fillStyle = COLORS.muted;
      ctx.font = '700 13px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('empty — add ingredients', cx, cy + 2);
    }
  }
}

function drawHands(ctx, game, mouse) {
  if (!game.hands || !mouse) return;
  ctx.save();
  ctx.globalAlpha = 0.95;
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  circle(ctx, mouse.x, mouse.y - 26, 24);
  ctx.fill();
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 2;
  circle(ctx, mouse.x, mouse.y - 26, 24);
  ctx.stroke();
  drawItemIcon(ctx, game.hands, mouse.x, mouse.y - 26, 34);
  ctx.restore();
}
