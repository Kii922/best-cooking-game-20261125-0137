// Sizzle & Serve — player actions: what a click or a key does in the kitchen.
// One job: every rule for picking up, chopping, grilling, boiling, plating,
// serving and discarding, in one place so the game plays the same by mouse or keys.

import { ITEMS, BINS, BIN_W, BIN_H, BIN_Y, STATIONS, PLATES, RECIPES } from './config.js';
import { findMatchingPlate, serveOrder, say, finishChop } from './state.js';

function inside(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

export function hitZones() {
  const zones = [];
  for (const bin of BINS) {
    zones.push({ kind: 'bin', item: bin.item, key: bin.key, x: bin.x, y: BIN_Y, w: BIN_W, h: BIN_H });
  }
  zones.push({ kind: 'board', ...STATIONS.board });
  zones.push({ kind: 'grill', ...STATIONS.grill });
  zones.push({ kind: 'pot', ...STATIONS.pot });
  zones.push({ kind: 'trash', ...STATIONS.trash });
  for (const plate of PLATES) {
    zones.push({ kind: 'plate', plate: plate.id, ...plate });
  }
  return zones;
}

export function zoneAt(x, y) {
  return hitZones().find((z) => inside(x, y, z)) || null;
}

// ---- the verb: click a zone ----
export function clickZone(game, zone) {
  if (!zone || game.screen !== 'playing') return;
  if (zone.kind === 'bin') return pickUp(game, zone.item);
  if (zone.kind === 'board') return useBoard(game);
  if (zone.kind === 'grill') return useGrill(game);
  if (zone.kind === 'pot') return usePot(game);
  if (zone.kind === 'trash') return useTrash(game);
  if (zone.kind === 'plate') return usePlate(game, zone.plate);
}

export function pickUp(game, item) {
  if (game.hands) {
    say(game, `Hands full — serve or trash the ${ITEMS[game.hands].name} first.`);
    return;
  }
  game.hands = item;
  say(game, `Picked up ${ITEMS[item].name}.`);
}

function takeFromStation(game, station, label) {
  if (game.hands) {
    say(game, `Hands full — your hands hold ${ITEMS[game.hands].name}.`);
    return;
  }
  if (!station.item) return;
  game.hands = station.item;
  station.item = null;
  station.progress = 0;
  station.cooking = false;
  station.since = 0;
  say(game, `Picked up ${ITEMS[game.hands].name} from the ${label}.`);
}

// ---- chopping board: place a choppable item, clicks speed the chop ----
export function useBoard(game) {
  const board = game.board;
  if (board.item) {
    if (board.chopping) {
      board.progress = Math.min(1, board.progress + 0.25);
      if (board.progress >= 1) {
        finishChop(game);
        say(game, 'Chopped! Click the board to pick it up.');
      }
      return;
    }
    takeFromStation(game, board, 'chopping board');
    return;
  }
  if (!game.hands) {
    say(game, 'The board is empty — bring a tomato to chop.');
    return;
  }
  const def = ITEMS[game.hands];
  if (!def.prep || def.prep !== 'board') {
    say(game, `The ${def.name} needs no chopping.`);
    return;
  }
  board.item = game.hands;
  board.progress = 0;
  board.chopping = true;
  game.hands = null;
  say(game, 'Chopping… click the board to chop faster.');
}

// ---- grill: place a raw patty, take it when the ring turns green ----
export function useGrill(game) {
  const grill = game.grill;
  if (grill.item) {
    takeFromStation(game, grill, 'grill');
    return;
  }
  if (!game.hands) {
    say(game, 'The grill is empty — bring a raw patty.');
    return;
  }
  const def = ITEMS[game.hands];
  if (!def.prep || def.prep !== 'grill') {
    say(game, `The ${def.name} does not go on the grill.`);
    return;
  }
  grill.item = game.hands;
  grill.progress = 0;
  grill.cooking = true;
  grill.since = 0;
  game.hands = null;
  say(game, 'Patty on the grill — watch the ring, take it when green.');
}

// ---- pot: place dry pasta, take it when the ring turns green ----
export function usePot(game) {
  const pot = game.pot;
  if (pot.item) {
    takeFromStation(game, pot, 'pot');
    return;
  }
  if (!game.hands) {
    say(game, 'The pot is empty — bring dry pasta.');
    return;
  }
  const def = ITEMS[game.hands];
  if (!def.prep || def.prep !== 'pot') {
    say(game, `The ${def.name} does not go in the pot.`);
    return;
  }
  pot.item = game.hands;
  pot.progress = 0;
  pot.cooking = true;
  pot.since = 0;
  game.hands = null;
  say(game, 'Pasta in the pot — take it out before it burns.');
}

// ---- trash: discard what you carry ----
export function useTrash(game) {
  if (!game.hands) {
    say(game, 'Nothing to throw away — your hands are empty.');
    return;
  }
  say(game, `Threw away the ${ITEMS[game.hands].name}.`);
  game.hands = null;
}

// ---- plates: add what you carry, or take the top item back ----
export function usePlate(game, plateId) {
  const plate = game.plates.find((p) => p.id === plateId);
  if (!plate) return;
  if (game.hands) {
    if (game.hands === 'burnt') {
      say(game, 'Burnt food goes in the trash, not on a plate.');
      return;
    }
    if (plate.items.length >= 4) {
      say(game, `Plate ${plateId} is full — serve it or take items back.`);
      return;
    }
    plate.items.push(game.hands);
    say(game, `Added ${ITEMS[game.hands].name} to Plate ${plateId}.`);
    game.hands = null;
    return;
  }
  if (plate.items.length === 0) {
    say(game, `Plate ${plateId} is empty — bring an ingredient.`);
    return;
  }
  game.hands = plate.items.pop();
  say(game, `Took back the ${ITEMS[game.hands].name} from Plate ${plateId}.`);
}

// ---- orders: click a ticket to serve the plate that matches it ----
export function clickTicket(game, order) {
  const plate = findMatchingPlate(game, order.recipe);
  if (!plate) {
    game.shake = 0.35;
    say(game, `No plate matches the ${RECIPES[order.recipe].name} yet — check the recipe.`);
    return null;
  }
  const result = serveOrder(game, order);
  say(game, `Served the ${RECIPES[order.recipe].name} — +${result.points}!`);
  return result;
}

// ---- keyboard: 1-6 pick, Space chop, S serve, T trash, R restart, P pause ----
export function pressKey(game, key) {
  if (game.screen === 'title' && (key === 'Enter' || key === ' ')) {
    game.screen = 'playing';
    return;
  }
  if (game.screen === 'over' && (key === 'r' || key === 'R' || key === 'Enter')) {
    return 'restart';
  }
  if (key === 'p' || key === 'P') {
    if (game.screen === 'playing') game.screen = 'paused';
    else if (game.screen === 'paused') game.screen = 'playing';
    return;
  }
  if (game.screen !== 'playing') return;
  const bin = BINS.find((b) => b.key === key);
  if (bin) {
    pickUp(game, bin.item);
    return;
  }
  if (key === ' ') {
    useBoard(game);
    return;
  }
  if (key === 's' || key === 'S') {
    for (const order of game.orders) {
      if (findMatchingPlate(game, order.recipe)) {
        clickTicket(game, order);
        return;
      }
    }
    say(game, 'No plate matches any order yet.');
    return;
  }
  if (key === 't' || key === 'T') {
    useTrash(game);
    return;
  }
}
