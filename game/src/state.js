// Sizzle & Serve — game state: orders, plates, stations, score, timer.
// One job: the whole kitchen as data, and the rules that change it over time.

import {
  ITEMS, RECIPES, SHIFT_SECONDS, MAX_ORDERS, UNLOCKS,
  ORDER_INTERVAL_START, ORDER_INTERVAL_END,
  TIME_BONUS_MAX, COMBO_STEP,
} from './config.js';
import { mulberry32, pickFrom } from './random.js';

export function createGame(seed) {
  return {
    seed,
    rng: mulberry32(seed),
    screen: 'title', // title | playing | paused | over
    elapsed: 0,
    timeLeft: SHIFT_SECONDS,
    score: 0,
    served: 0,
    missed: 0,
    combo: 0,
    bestCombo: 0,
    hands: null, // item id the player carries, or null
    orders: [], // { id, recipe, patience, maxPatience, born }
    nextOrderId: 1,
    orderTimer: 6, // first order arrives 6s after start
    board: { item: null, progress: 0, chopping: false }, // chopping board slot
    grill: { item: null, progress: 0, cooking: false, since: 0 }, // grill slot
    pot: { item: null, progress: 0, cooking: false, since: 0 }, // pot slot
    plates: [
      { id: 'A', items: [] },
      { id: 'B', items: [] },
    ],
    popups: [], // { x, y, text, color, born, life }
    shake: 0, // ticket shake timer for a failed serve
    message: '', // hint line for the player
    messageBorn: 0,
  };
}

export function unlockedRecipes(elapsed) {
  let list = ['salad'];
  for (const u of UNLOCKS) if (elapsed >= u.at) list = u.recipes;
  return list;
}

export function orderInterval(elapsed) {
  const t = Math.min(1, elapsed / SHIFT_SECONDS);
  return ORDER_INTERVAL_START + (ORDER_INTERVAL_END - ORDER_INTERVAL_START) * t;
}

export function spawnOrder(game) {
  if (game.orders.length >= MAX_ORDERS) return null;
  const recipe = pickFrom(game.rng, unlockedRecipes(game.elapsed));
  const def = RECIPES[recipe];
  const order = {
    id: game.nextOrderId++,
    recipe,
    patience: def.patience,
    maxPatience: def.patience,
    born: game.elapsed,
  };
  game.orders.push(order);
  return order;
}

// Plate contents match a recipe when they hold exactly the same items.
export function plateMatches(plateItems, recipe) {
  const needs = RECIPES[recipe].needs.slice().sort();
  const got = plateItems.slice().sort();
  return needs.length === got.length && needs.every((n, i) => n === got[i]);
}

export function findMatchingPlate(game, recipe) {
  return game.plates.find((p) => plateMatches(p.items, recipe)) || null;
}

export function serveOrder(game, order) {
  const plate = findMatchingPlate(game, order.recipe);
  if (!plate) return null;
  const def = RECIPES[order.recipe];
  const timeBonus = Math.round((order.patience / order.maxPatience) * TIME_BONUS_MAX);
  const mult = 1 + game.combo * COMBO_STEP;
  const points = Math.round((def.base + timeBonus) * mult);
  game.score += points;
  game.served += 1;
  game.combo += 1;
  game.bestCombo = Math.max(game.bestCombo, game.combo);
  plate.items = [];
  game.orders = game.orders.filter((o) => o.id !== order.id);
  game.popups.push({
    x: 640, y: 200, text: `+${points}`, color: '#2c7a3a', born: game.elapsed, life: 1.4,
  });
  return { points, plate };
}

export function expireOrder(game, order) {
  game.orders = game.orders.filter((o) => o.id !== order.id);
  game.missed += 1;
  game.combo = 0;
  game.popups.push({
    x: 640, y: 240, text: 'Order walked out!', color: '#c22e22', born: game.elapsed, life: 1.6,
  });
}

// Advance the clock by dt seconds: timers, order spawns, cooking, expiry.
export function tick(game, dt) {
  if (game.screen !== 'playing') return;
  game.elapsed += dt;
  game.timeLeft = Math.max(0, SHIFT_SECONDS - game.elapsed);
  if (game.timeLeft <= 0) {
    game.screen = 'over';
    return;
  }

  // New orders arrive on a shrinking interval.
  game.orderTimer -= dt;
  if (game.orderTimer <= 0) {
    spawnOrder(game);
    game.orderTimer = orderInterval(game.elapsed);
  }

  // Orders lose patience; an empty one walks out.
  for (const order of game.orders.slice()) {
    order.patience -= dt;
    if (order.patience <= 0) expireOrder(game, order);
  }

  // Chopping finishes on its own (clicks speed it up in actions.js).
  if (game.board.chopping && game.board.item) {
    game.board.progress += dt / 2.4;
    if (game.board.progress >= 1) finishChop(game);
  }

  // Grill and pot cook on their own; leave them too long and they burn.
  cookStation(game, game.grill, 6.0, 12.0, dt);
  cookStation(game, game.pot, 5.0, 11.0, dt);

  // Popups and shake fade.
  game.popups = game.popups.filter((p) => game.elapsed - p.born < p.life);
  if (game.shake > 0) game.shake = Math.max(0, game.shake - dt);
}

function cookStation(game, station, cookTime, burnAfter, dt) {
  if (!station.item || !station.cooking) return;
  station.since += dt;
  station.progress = Math.min(1, station.since / cookTime);
  // Cooked through: the raw item becomes its prepared form (once only).
  const def = ITEMS[station.item];
  if (def && def.prepped && station.since >= cookTime) {
    station.item = def.prepped;
  }
  if (station.since >= burnAfter) {
    station.item = 'burnt';
    station.cooking = false;
    station.progress = 1;
  }
}

export function finishChop(game) {
  const def = { tomato: 'tomatoChopped' };
  if (game.board.item && def[game.board.item]) {
    game.board.item = def[game.board.item];
  }
  game.board.chopping = false;
  game.board.progress = 1;
}

export function say(game, text) {
  game.message = text;
  game.messageBorn = game.elapsed;
}

export function rankFor(score) {
  if (score >= 1200) return 'HEAD CHEF';
  if (score >= 800) return 'SOUS CHEF';
  if (score >= 400) return 'LINE COOK';
  return 'TRAINEE';
}
