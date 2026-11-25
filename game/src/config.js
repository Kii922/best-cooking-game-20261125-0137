// Sizzle & Serve — configuration: sizes, palette, recipes, stations, timings.
// One job: every tunable number for the kitchen lives here, nowhere else.

export const VIEW_W = 1280;
export const VIEW_H = 720;

// ---- palette (warm kitchen, strong contrast, readable at a glance) ----
export const COLORS = {
  floorLight: '#f7ead2',
  floorDark: '#efdcbb',
  header: '#1d2b45',
  headerText: '#ffffff',
  gold: '#f2a93b',
  cream: '#fff6e8',
  card: '#ffffff',
  ink: '#22314e',
  muted: '#6b7280',
  red: '#d9382b',
  green: '#3e9b4f',
  greenDark: '#2c7a3a',
  wood: '#b07a45',
  woodDark: '#8a5a2b',
  board: '#d9a066',
  steel: '#9aa5b1',
  steelDark: '#6e7a88',
  ticket: '#fffdf5',
  danger: '#c22e22',
  plate: '#ffffff',
  shadow: 'rgba(34,49,78,0.18)',
};

// ---- items: id -> display facts. `prep` is the station that prepares it. ----
export const ITEMS = {
  tomato:        { name: 'Tomato',  short: 'Tomato', color: '#e0392f', prep: 'board', prepTime: 2.4, prepped: 'tomatoChopped' },
  tomatoChopped: { name: 'Chopped Tomato', short: 'Tomato', color: '#e0392f', prep: null },
  lettuce:       { name: 'Lettuce', short: 'Lettuce', color: '#4da34d', prep: null },
  cheese:        { name: 'Cheese',  short: 'Cheese',  color: '#f2b705', prep: null },
  bun:           { name: 'Bun',     short: 'Bun',     color: '#e0a458', prep: null },
  patty:         { name: 'Raw Patty', short: 'Patty',  color: '#8a5a3b', prep: 'grill', prepTime: 6.0, prepped: 'pattyGrilled', burnAfter: 12.0 },
  pattyGrilled:  { name: 'Grilled Patty', short: 'Patty', color: '#6b4423', prep: null },
  pasta:         { name: 'Dry Pasta', short: 'Pasta',  color: '#e8c97a', prep: 'pot', prepTime: 5.0, prepped: 'pastaCooked', burnAfter: 11.0 },
  pastaCooked:   { name: 'Cooked Pasta', short: 'Pasta', color: '#f0d48a', prep: null },
  burnt:         { name: 'Burnt!',  short: 'Burnt',   color: '#2b2b2b', prep: null },
};

// ---- recipes: what each order asks for, and what it pays ----
export const RECIPES = {
  salad: {
    name: 'Garden Salad', base: 100, patience: 50,
    needs: ['lettuce', 'tomatoChopped'],
    blurb: 'Fresh & fast',
  },
  burger: {
    name: 'Classic Burger', base: 180, patience: 60,
    needs: ['bun', 'pattyGrilled', 'cheese', 'lettuce'],
    blurb: 'The house favourite',
  },
  pasta: {
    name: 'Margherita Pasta', base: 150, patience: 55,
    needs: ['pastaCooked', 'cheese'],
    blurb: 'Comfort in a bowl',
  },
};

// ---- ingredient bins across the top of the kitchen (key, item, x, label) ----
export const BINS = [
  { key: '1', item: 'tomato',  x: 60,  label: 'Tomato' },
  { key: '2', item: 'lettuce', x: 250, label: 'Lettuce' },
  { key: '3', item: 'cheese',  x: 440, label: 'Cheese' },
  { key: '4', item: 'bun',     x: 630, label: 'Bun' },
  { key: '5', item: 'patty',   x: 820, label: 'Patty' },
  { key: '6', item: 'pasta',   x: 1010, label: 'Pasta' },
];
export const BIN_W = 150;
export const BIN_H = 88;
export const BIN_Y = 212;

// ---- work stations (chopping board, grill, pot, trash) ----
export const STATIONS = {
  board: { x: 60,  y: 322, w: 270, h: 148, label: 'CHOPPING BOARD', hint: 'Chop tomato here' },
  grill: { x: 360, y: 322, w: 280, h: 148, label: 'GRILL',         hint: 'Grill the patty' },
  pot:   { x: 670, y: 322, w: 280, h: 148, label: 'POT — BOILING', hint: 'Boil the pasta' },
  trash: { x: 980, y: 322, w: 240, h: 148, label: 'TRASH',         hint: 'Discard what you carry' },
};

// ---- assembly plates ----
export const PLATES = [
  { id: 'A', x: 200, y: 492, w: 360, h: 148, label: 'PLATE A' },
  { id: 'B', x: 720, y: 492, w: 360, h: 148, label: 'PLATE B' },
];

// ---- shift / difficulty ----
export const SHIFT_SECONDS = 150;
export const ORDER_INTERVAL_START = 14;
export const ORDER_INTERVAL_END = 9;
export const MAX_ORDERS = 3;
// Recipes unlock as the shift goes on: salad first, burger from 20s, pasta from 50s.
export const UNLOCKS = [
  { at: 0, recipes: ['salad'] },
  { at: 20, recipes: ['salad', 'burger'] },
  { at: 50, recipes: ['salad', 'burger', 'pasta'] },
];

// ---- scoring ----
export const TIME_BONUS_MAX = 50;   // extra points for serving with patience to spare
export const COMBO_STEP = 0.1;      // +10% per combo level
export const RANKS = [
  { min: 1200, name: 'HEAD CHEF' },
  { min: 800, name: 'SOUS CHEF' },
  { min: 400, name: 'LINE COOK' },
  { min: 0, name: 'TRAINEE' },
];
