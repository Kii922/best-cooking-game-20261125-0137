// Sizzle & Serve — entry: game loop, screens, shot staging and self-test.
// One job: wire the canvas, the clock and the input together, and run the game.

import { VIEW_W, VIEW_H, SHIFT_SECONDS } from './config.js';
import { createGame, tick, spawnOrder } from './state.js';
import { drawKitchen } from './render.js';
import { drawChef, chefPose } from './chef.js';
import { drawHeader, drawOrders, drawHintBar, drawPopups, drawTitle, drawPaused, drawGameOver } from './hud.js';
import { attachInput } from './input.js';
import { stageShot } from './shots.js';
import { pickUp, useBoard, useGrill, usePot, usePlate, clickTicket } from './actions.js';

const params = new URLSearchParams(window.location.search);
const seed = Number(params.get('seed') || 7);
const shotName = params.get('shot');
const testMode = params.get('test') === '1';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let game;
let mouse;

function restart() {
  game = shotName ? stageShot(shotName, seed) : createGame((Date.now() % 2147483647) || 7);
  if (shotName) game.frozen = true; // staged shots never tick
  mouse = attachInput(canvas, game, restart);
}

function render() {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  drawKitchen(ctx, game, mouse);
  drawHeader(ctx, game);
  drawOrders(ctx, game, mouse);
  drawHintBar(ctx, game);
  drawPopups(ctx, game);
  if (game.screen === 'title') {
    drawTitle(ctx, game);
    // the chef welcomes the player beside the title panel
    drawChef(ctx, 130, 648, 0.95, 'wave', game.elapsed);
  } else if (game.screen === 'paused') drawPaused(ctx);
  else if (game.screen === 'over') drawGameOver(ctx, game);
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  if (!game.frozen) tick(game, dt);
  render();
  requestAnimationFrame(loop);
}

// ---- self-test: plays a full salad end to end, reports PASS/FAIL in the DOM ----
function selfTest() {
  const lines = [];
  const ok = (name, cond) => lines.push(`${cond ? 'PASS' : 'FAIL'} ${name}`);
  try {
    const g = createGame(7);
    g.screen = 'playing';
    ok('starts with empty hands', g.hands === null);
    pickUp(g, 'tomato');
    ok('picked up tomato', g.hands === 'tomato');
    useBoard(g);
    ok('tomato on board chopping', g.board.item === 'tomato' && g.board.chopping);
    tick(g, 3);
    ok('tomato chopped', g.board.item === 'tomatoChopped' && !g.board.chopping);
    useBoard(g);
    ok('chopped tomato in hands', g.hands === 'tomatoChopped');
    usePlate(g, 'A');
    ok('tomato on plate A', g.plates[0].items.includes('tomatoChopped'));
    pickUp(g, 'lettuce');
    usePlate(g, 'A');
    ok('lettuce on plate A', g.plates[0].items.includes('lettuce'));
    spawnOrder(g);
    // force the spawned order to be a salad so the plate matches
    g.orders[0].recipe = 'salad';
    const before = g.score;
    clickTicket(g, g.orders[0]);
    ok('salad served for points', g.score > before && g.served === 1);
    ok('plate cleared after serve', g.plates[0].items.length === 0);

    // grill path: raw patty -> grilled
    const g2 = createGame(8);
    g2.screen = 'playing';
    pickUp(g2, 'patty');
    useGrill(g2);
    tick(g2, 7);
    ok('patty grilled', g2.grill.item === 'pattyGrilled');
    tick(g2, 6);
    ok('patty burns if left', g2.grill.item === 'burnt');

    // pot path: dry pasta -> cooked
    const g3 = createGame(9);
    g3.screen = 'playing';
    pickUp(g3, 'pasta');
    usePot(g3);
    tick(g3, 6);
    ok('pasta cooked', g3.pot.item === 'pastaCooked');

    // order expiry resets combo
    const g4 = createGame(10);
    g4.screen = 'playing';
    g4.combo = 3;
    spawnOrder(g4);
    g4.orders[0].patience = 0.05;
    tick(g4, 0.1);
    ok('expired order missed + combo reset', g4.missed === 1 && g4.combo === 0);

    // shift ends at 150s
    const g5 = createGame(11);
    g5.screen = 'playing';
    tick(g5, SHIFT_SECONDS + 1);
    ok('shift ends', g5.screen === 'over');

    // chef poses follow the kitchen state
    const g6 = createGame(12);
    g6.screen = 'playing';
    ok('chef idle with empty kitchen', chefPose(g6) === 'idle');
    g6.board.chopping = true;
    ok('chef chops at the board', chefPose(g6) === 'chop');
    g6.board.chopping = false;
    pickUp(g6, 'patty');
    useGrill(g6);
    ok('chef grills at the grill', chefPose(g6) === 'grill');
    g6.grill.item = null;
    g6.grill.cooking = false;
    g6.plates[0].items = ['lettuce', 'tomatoChopped'];
    spawnOrder(g6);
    g6.orders[0].recipe = 'salad';
    ok('chef celebrates a ready dish', chefPose(g6) === 'serve');
  } catch (err) {
    lines.push(`FAIL exception: ${err.message}`);
  }
  const text = lines.join('\n');
  document.title = lines.every((l) => l.startsWith('PASS')) ? 'SELFTEST ALL PASS' : 'SELFTEST FAILURES';
  const pre = document.getElementById('test-result');
  if (pre) pre.textContent = text;
  return text;
}

restart();
if (testMode) {
  // run the test once, then freeze on a mid-play frame for the screenshot
  const result = selfTest();
  console.log(result);
  game = stageShot('play', seed);
  game.frozen = true;
  mouse = attachInput(canvas, game, restart);
  render();
} else {
  requestAnimationFrame(loop);
}
