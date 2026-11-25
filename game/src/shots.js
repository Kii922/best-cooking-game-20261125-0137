// Sizzle & Serve — staged screenshots: deterministic kitchen states for ?shot=.
// One job: build a fixed, good-looking game state per shot name, so the
// screenshots are real renders of the game's own code, frozen in time.

import { createGame, spawnOrder } from './state.js';
import { SHIFT_SECONDS } from './config.js';

function baseStaged(seed) {
  const game = createGame(seed);
  game.screen = 'playing';
  return game;
}

// A ticket the board shows: push an order of a recipe with fixed patience.
function stagedOrder(game, recipe, patience, maxPatience) {
  const order = {
    id: game.nextOrderId++,
    recipe,
    patience,
    maxPatience,
    born: 0,
  };
  game.orders.push(order);
  return order;
}

export function stageShot(name, seed) {
  const game = baseStaged(seed);
  if (name === 'start') {
    game.screen = 'title';
    game.elapsed = 0;
    game.score = 0;
    game.timeLeft = SHIFT_SECONDS;
    stagedOrder(game, 'burger', 48, 60);
    stagedOrder(game, 'salad', 30, 50);
    game.plates[0].items = ['bun', 'cheese'];
    game.plates[1].items = ['lettuce'];
    game.board.item = 'tomato';
    game.board.chopping = true;
    game.board.progress = 0.45;
    return game;
  }
  if (name === 'play') {
    game.elapsed = 43;
    game.timeLeft = 107;
    game.score = 340;
    game.combo = 2;
    game.bestCombo = 2;
    game.hands = 'tomato';
    stagedOrder(game, 'burger', 38, 60);
    stagedOrder(game, 'salad', 22, 50);
    game.board.item = 'tomato';
    game.board.chopping = true;
    game.board.progress = 0.5;
    game.grill.item = 'patty';
    game.grill.cooking = true;
    game.grill.progress = 0.6;
    game.grill.since = 3.6;
    game.plates[0].items = ['bun', 'cheese'];
    game.message = 'Picked up Tomato — chop it on the board, then build the burger.';
    return game;
  }
  if (name === 'assembly') {
    game.elapsed = 78;
    game.timeLeft = 72;
    game.score = 520;
    game.combo = 3;
    game.bestCombo = 3;
    stagedOrder(game, 'burger', 41, 60);
    stagedOrder(game, 'pasta', 30, 55);
    game.board.item = 'tomato';
    game.board.chopping = true;
    game.board.progress = 0.7;
    game.grill.item = 'pattyGrilled';
    game.grill.progress = 1;
    game.pot.item = 'pasta';
    game.pot.cooking = true;
    game.pot.progress = 0.55;
    game.pot.since = 2.75;
    game.plates[0].items = ['bun', 'pattyGrilled', 'cheese'];
    game.message = 'Burger nearly done — add the grilled patty and a lettuce, then serve.';
    return game;
  }
  if (name === 'serve') {
    game.elapsed = 92;
    game.timeLeft = 58;
    game.score = 784;
    game.combo = 4;
    game.bestCombo = 4;
    stagedOrder(game, 'burger', 44, 60);
    stagedOrder(game, 'salad', 18, 50);
    game.grill.item = 'pattyGrilled';
    game.grill.progress = 1;
    game.plates[0].items = ['bun', 'pattyGrilled', 'cheese', 'lettuce'];
    game.lastServeAt = 91; // a serve just happened — the waiter carries it off
    game.popups.push({ x: 640, y: 200, text: '+264', color: '#2c7a3a', born: 92, life: 99 });
    game.message = 'Burger complete — click its ticket to serve it now!';
    return game;
  }
  // unknown shot name: plain mid-play state
  game.elapsed = 30;
  game.timeLeft = 120;
  spawnOrder(game);
  return game;
}
