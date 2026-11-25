// Sizzle & Serve — input: mouse position/clicks and keyboard, mapped to the
// 1280x720 playfield no matter how the page scales the canvas.
// One job: turn browser events into game actions.

import { clickZone, zoneAt, pressKey, clickTicket } from './actions.js';
import { VIEW_W, VIEW_H } from './config.js';

export function attachInput(canvas, game, restart) {
  const mouse = { x: -100, y: -100 };

  function toGame(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * VIEW_W,
      y: ((e.clientY - rect.top) / rect.height) * VIEW_H,
    };
  }

  canvas.addEventListener('mousemove', (e) => {
    const p = toGame(e);
    mouse.x = p.x;
    mouse.y = p.y;
  });
  canvas.addEventListener('mouseleave', () => {
    mouse.x = -100;
    mouse.y = -100;
  });

  canvas.addEventListener('click', (e) => {
    const p = toGame(e);
    if (game.screen === 'title') {
      game.screen = 'playing';
      return;
    }
    if (game.screen === 'over') {
      restart();
      return;
    }
    if (game.screen === 'paused') {
      game.screen = 'playing';
      return;
    }
    // order tickets live in the strip y 122..188, x 24..1240
    if (p.y >= 122 && p.y <= 188) {
      const tw = 392;
      const gap = 20;
      const idx = Math.floor((p.x - 24) / (tw + gap));
      if (idx >= 0 && idx < game.orders.length && p.x - 24 - idx * (tw + gap) <= tw) {
        clickTicket(game, game.orders[idx]);
        return;
      }
    }
    const zone = zoneAt(p.x, p.y);
    clickZone(game, zone);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key.startsWith('Arrow')) e.preventDefault();
    const action = pressKey(game, e.key);
    if (action === 'restart') restart();
  });

  return mouse;
}
