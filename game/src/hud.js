// Sizzle & Serve — HUD and screens: header, order board, hint bar, popups,
// title / pause / game-over overlays.
// One job: everything that is not the kitchen floor itself.

import { COLORS, RECIPES, ITEMS, VIEW_W, SHIFT_SECONDS, RANKS } from './config.js';
import { findMatchingPlate, rankFor } from './state.js';
import { drawItemIcon, roundRect, circle } from './render.js';

function fmtTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function drawHeader(ctx, game) {
  ctx.fillStyle = COLORS.header;
  ctx.fillRect(0, 0, VIEW_W, 86);
  ctx.fillStyle = COLORS.gold;
  ctx.fillRect(0, 86, VIEW_W, 4);

  // title
  ctx.fillStyle = COLORS.headerText;
  ctx.font = '900 30px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('SIZZLE & SERVE', 24, 40);
  ctx.fillStyle = COLORS.gold;
  ctx.font = '800 13px Arial, sans-serif';
  ctx.fillText('RUSH HOUR KITCHEN', 24, 62);

  // shift timer, centre
  const urgent = game.timeLeft <= 30 && game.screen === 'playing';
  ctx.fillStyle = urgent ? '#ff6b5e' : COLORS.headerText;
  ctx.font = '900 40px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(fmtTime(game.timeLeft), 640, 48);
  ctx.fillStyle = urgent ? '#ff6b5e' : '#9aa5b1';
  ctx.font = '800 12px Arial, sans-serif';
  ctx.fillText('SHIFT TIMER', 640, 70);
  // timer bar
  const bw = 260;
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  roundRect(ctx, 640 - bw / 2, 76, bw, 6, 3);
  ctx.fill();
  ctx.fillStyle = urgent ? '#ff6b5e' : COLORS.gold;
  roundRect(ctx, 640 - bw / 2, 76, bw * (game.timeLeft / SHIFT_SECONDS), 6, 3);
  ctx.fill();

  // score, right
  ctx.fillStyle = COLORS.headerText;
  ctx.font = '900 34px Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(String(game.score), 1256, 44);
  ctx.fillStyle = '#9aa5b1';
  ctx.font = '800 12px Arial, sans-serif';
  ctx.fillText('SCORE', 1256, 66);
  if (game.combo >= 2) {
    ctx.fillStyle = COLORS.gold;
    roundRect(ctx, 1000, 22, 96, 26, 13);
    ctx.fill();
    ctx.fillStyle = COLORS.header;
    ctx.font = '900 15px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`COMBO x${game.combo}`, 1048, 40);
  }
}

// ---- order board: three ticket cards under the header ----
export function drawOrders(ctx, game, mouse) {
  ctx.fillStyle = COLORS.ink;
  ctx.font = '900 15px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('ORDERS — click a ticket to serve its dish', 24, 112);
  ctx.fillStyle = COLORS.muted;
  ctx.font = '700 13px Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('serve the matching plate before patience runs out', 1256, 112);

  const tw = 392;
  const gap = 20;
  const x0 = 24;
  game.orders.forEach((order, i) => {
    const x = x0 + i * (tw + gap);
    const y = 122;
    const h = 66;
    const recipe = RECIPES[order.recipe];
    const plate = findMatchingPlate(game, order.recipe);
    const shakeX = game.shake > 0 ? Math.sin(game.elapsed * 40) * 4 : 0;
    const hover = mouse && mouse.x >= x && mouse.x <= x + tw && mouse.y >= y && mouse.y <= y + h;

    ctx.save();
    ctx.translate(shakeX, 0);
    ctx.fillStyle = plate ? '#e9f7ec' : COLORS.ticket;
    ctx.strokeStyle = plate ? COLORS.green : hover ? COLORS.gold : 'rgba(34,49,78,0.3)';
    ctx.lineWidth = plate || hover ? 3 : 2;
    roundRect(ctx, x, y, tw, h, 10);
    ctx.fill();
    ctx.stroke();

    // dish name + patience bar
    ctx.fillStyle = COLORS.ink;
    ctx.font = '900 17px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(recipe.name, x + 14, y + 24);
    ctx.fillStyle = COLORS.muted;
    ctx.font = '700 12px Arial, sans-serif';
    ctx.fillText(recipe.blurb, x + 14, y + 42);
    const bw = 180;
    const frac = order.patience / order.maxPatience;
    ctx.fillStyle = 'rgba(34,49,78,0.15)';
    roundRect(ctx, x + 14, y + 50, bw, 7, 3);
    ctx.fill();
    ctx.fillStyle = frac > 0.5 ? COLORS.green : frac > 0.25 ? COLORS.gold : COLORS.red;
    roundRect(ctx, x + 14, y + 50, bw * frac, 7, 3);
    ctx.fill();

    // needed ingredient icons
    recipe.needs.forEach((item, j) => {
      drawItemIcon(ctx, item, x + 240 + j * 34, y + 26, 28);
    });

    // serve badge
    if (plate) {
      ctx.fillStyle = COLORS.green;
      roundRect(ctx, x + tw - 92, y + 40, 80, 20, 10);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 12px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SERVE!', x + tw - 52, y + 54);
    } else {
      ctx.fillStyle = COLORS.muted;
      ctx.font = '800 12px Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${Math.ceil(order.patience)}s`, x + tw - 12, y + 24);
    }
    ctx.restore();
  });

  if (game.orders.length === 0) {
    ctx.fillStyle = COLORS.muted;
    ctx.font = '700 15px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No orders yet — the first customer is on the way…', 640, 158);
  }
}

// ---- hint bar at the bottom ----
export function drawHintBar(ctx, game) {
  ctx.fillStyle = COLORS.header;
  ctx.fillRect(0, 656, VIEW_W, 64);
  const hint = game.message || 'Click an ingredient bin to pick it up, then build the dish on a plate.';
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 16px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(hint, 24, 682);
  ctx.fillStyle = '#9aa5b1';
  ctx.font = '700 13px Arial, sans-serif';
  ctx.fillText('1–6 pick up · Space chop · S serve · T trash · P pause · R restart', 24, 706);
  if (game.hands) {
    ctx.fillStyle = COLORS.gold;
    roundRect(ctx, 1050, 668, 206, 40, 10);
    ctx.fill();
    ctx.fillStyle = COLORS.header;
    ctx.font = '900 15px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`HANDS: ${ITEMS[game.hands].name.toUpperCase()}`, 1153, 694);
  }
}

// ---- floating score popups ----
export function drawPopups(ctx, game) {
  for (const p of game.popups) {
    const age = game.elapsed - p.born;
    const alpha = Math.max(0, 1 - age / p.life);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.font = '900 34px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(p.text, p.x, p.y - age * 30);
    ctx.restore();
  }
}

function overlay(ctx) {
  ctx.fillStyle = 'rgba(20,28,46,0.78)';
  ctx.fillRect(0, 0, VIEW_W, 720);
}

export function drawTitle(ctx, game) {
  overlay(ctx);
  // solid panel so the title never collides with the kitchen behind it
  ctx.fillStyle = '#1d2b45';
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 3;
  roundRect(ctx, 240, 120, 800, 470, 20);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 64px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SIZZLE & SERVE', 640, 210);
  ctx.fillStyle = COLORS.gold;
  ctx.font = '900 26px Arial, sans-serif';
  ctx.fillText('RUSH HOUR KITCHEN', 640, 250);
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 19px Arial, sans-serif';
  ctx.fillText('Orders fly in. Chop, grill, boil — and serve before patience runs out.', 640, 305);
  ctx.font = '700 18px Arial, sans-serif';
  ctx.fillStyle = '#d7dee9';
  ctx.fillText('1  Pick ingredients from the bins    2  Chop · grill · boil at the stations', 640, 350);
  ctx.fillText('3  Build the dish on a plate    4  Click its ticket to serve', 640, 380);
  const pulse = 0.65 + 0.35 * Math.sin(game.elapsed * 4);
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = COLORS.gold;
  roundRect(ctx, 490, 415, 300, 56, 14);
  ctx.fill();
  ctx.fillStyle = COLORS.header;
  ctx.font = '900 22px Arial, sans-serif';
  ctx.fillText('CLICK TO START', 640, 451);
  ctx.restore();
  ctx.fillStyle = '#9aa5b1';
  ctx.font = '700 14px Arial, sans-serif';
  ctx.fillText('Mouse + keyboard · 150-second shift · no network, just you and the kitchen', 640, 510);
}

export function drawPaused(ctx) {
  overlay(ctx);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 48px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PAUSED', 640, 340);
  ctx.font = '700 20px Arial, sans-serif';
  ctx.fillStyle = '#d7dee9';
  ctx.fillText('Press P or click to keep cooking.', 640, 380);
}

export function drawGameOver(ctx, game) {
  overlay(ctx);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 52px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SHIFT OVER!', 640, 190);
  ctx.fillStyle = COLORS.gold;
  ctx.font = '900 30px Arial, sans-serif';
  ctx.fillText(`RANK: ${rankFor(game.score)}`, 640, 240);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 64px Arial, sans-serif';
  ctx.fillText(String(game.score), 640, 320);
  ctx.font = '700 16px Arial, sans-serif';
  ctx.fillStyle = '#9aa5b1';
  ctx.fillText('POINTS', 640, 344);
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 20px Arial, sans-serif';
  ctx.fillText(`Dishes served: ${game.served}    Orders missed: ${game.missed}    Best combo: x${game.bestCombo}`, 640, 400);
  const pulse = 0.65 + 0.35 * Math.sin(game.elapsed * 4);
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = COLORS.gold;
  roundRect(ctx, 480, 440, 320, 56, 14);
  ctx.fill();
  ctx.fillStyle = COLORS.header;
  ctx.font = '900 22px Arial, sans-serif';
  ctx.fillText('PLAY AGAIN  (R)', 640, 476);
  ctx.restore();
}
