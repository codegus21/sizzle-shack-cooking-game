// Sizzle Shack — fast-food kitchen rush.
// Shared constants: canvas, palette, the menu (original fast-food dishes,
// researched from a real fast-food menu but renamed — no trademarks here)
// and the kitchen station layout. Every other module reads from here.

export const VIEW_W = 960;
export const VIEW_H = 640;
export const TILE = 32;

// Warm diner palette: cream tiles, red awning, teal counters, wooden floor.
export const PAL = {
  floorA: '#c98f5f', floorB: '#bd8252',
  wall: '#f2e3c6', wallTrim: '#d94f3d',
  counter: '#2e7f7b', counterTop: '#3fa39d', counterEdge: '#1f5c59',
  board: '#fff6dd', boardEdge: '#8a6d3b',
  ink: '#26221c', paper: '#fff6dd', red: '#d94f3d', redDark: '#a83226',
  green: '#4c9a4c', gold: '#f2b234', blue: '#3d7ea6', cream: '#f7ead0',
  steel: '#b9c4c9', steelDark: '#7d8b91', dark: '#3a3230',
};

export const SHIFT_SECONDS = 180; // one 3-minute shift
export const MAX_ORDERS = 3;      // tickets on the board at once

// --- Ingredients ---------------------------------------------------------
// id, label, where it comes from, what processing it needs (null = ready).
export const INGREDIENTS = {
  bun:     { label: 'BUN',     from: 'drawer', process: null },
  cheese:  { label: 'CHEESE',  from: 'drawer', process: null },
  sauce:   { label: 'SAUCE',   from: 'drawer', process: null },
  cup:     { label: 'CUP',     from: 'drawer', process: null },
  patty:   { label: 'PATTY',   from: 'fridge', process: 'grill', cooked: 'grilledPatty' },
  chicken: { label: 'CHICKEN', from: 'fridge', process: 'grill', cooked: 'grilledChicken' },
  lettuce: { label: 'LETTUCE', from: 'fridge', process: 'chop',  cooked: 'choppedLettuce' },
  tomato:  { label: 'TOMATO',  from: 'fridge', process: 'chop',  cooked: 'choppedTomato' },
  potato:  { label: 'POTATO',  from: 'fridge', process: 'fry',   cooked: 'fries' },
  nuggets: { label: 'NUGGETS', from: 'fridge', process: 'fry',   cooked: 'friedNuggets' },
  grilledPatty:    { label: 'PATTY*',   from: 'grill', process: null },
  grilledChicken:  { label: 'CHICKEN*', from: 'grill', process: null },
  choppedLettuce:  { label: 'LETTUCE*', from: 'board', process: null },
  choppedTomato:   { label: 'TOMATO*',  from: 'board', process: null },
  fries:      { label: 'FRIES',   from: 'fryer', process: null },
  friedNuggets:{ label: 'NUGGETS*', from: 'fryer', process: null },
  cola:  { label: 'COLA',  from: 'drinks', process: null },
  shake: { label: 'SHAKE', from: 'drinks', process: null },
};

// --- Menu (original names, fast-food style) ------------------------------
// recipe: ingredient ids in build order; price: base pay in coins.
export const MENU = [
  { id: 'shackBurger', name: 'SHACK BURGER', short: 'BURGER',
    recipe: ['bun', 'grilledPatty', 'choppedLettuce', 'choppedTomato', 'cheese'],
    price: 6, color: '#d94f3d', blurb: 'bun + patty + lettuce + tomato + cheese' },
  { id: 'doubleStack', name: 'DOUBLE STACK', short: 'DOUBLE',
    recipe: ['bun', 'grilledPatty', 'grilledPatty', 'cheese', 'cheese'],
    price: 8, color: '#a83226', blurb: 'bun + double patty + double cheese' },
  { id: 'crispyClucker', name: 'CRISPY CLUCKER', short: 'CLUCKER',
    recipe: ['bun', 'grilledChicken', 'choppedLettuce', 'sauce'],
    price: 7, color: '#f2b234', blurb: 'bun + crispy chicken + lettuce + sauce' },
  { id: 'goldenFries', name: 'GOLDEN FRIES', short: 'FRIES',
    recipe: ['fries'], price: 3, color: '#f2b234', blurb: 'potato, fried golden' },
  { id: 'nuggyBites', name: 'NUGGY BITES', short: 'NUGGIES',
    recipe: ['friedNuggets', 'sauce'], price: 4, color: '#e08a3c', blurb: 'fried nuggets + dip sauce' },
  { id: 'fizzyCola', name: 'FIZZY COLA', short: 'COLA',
    recipe: ['cola'], price: 2, color: '#3d7ea6', blurb: 'ice-cold cola, poured' },
  { id: 'chocoShake', name: 'CHOCO SHAKE', short: 'SHAKE',
    recipe: ['shake'], price: 3, color: '#8a5a3b', blurb: 'thick chocolate shake' },
];

export function dishById(id) {
  return MENU.find((d) => d.id === id);
}

// --- Kitchen layout ------------------------------------------------------
// Stations are rectangles on the floor plan (x, y, w, h in pixels).
// The player walks the open floor; stations sit along the walls.
export const STATIONS = {
  fridge:   { x: 24,  y: 96,  w: 96, h: 64, label: 'FRIDGE',  sub: 'raw food' },
  drawer:   { x: 136, y: 96,  w: 96, h: 64, label: 'DRAWER',  sub: 'pantry goods' },
  board:    { x: 248, y: 96,  w: 96, h: 64, label: 'CHOP BOARD', sub: 'chop it' },
  grill:    { x: 360, y: 96,  w: 128, h: 64, label: 'GRILL',   sub: 'cook it' },
  fryer:    { x: 504, y: 96,  w: 112, h: 64, label: 'FRYER',   sub: 'fry it' },
  drinks:   { x: 632, y: 96,  w: 96, h: 64, label: 'DRINKS',   sub: 'cola / shake' },
  assemble: { x: 744, y: 96,  w: 96, h: 64, label: 'PLATE',   sub: 'build it' },
  serve:    { x: 856, y: 96,  w: 80, h: 64, label: 'SERVE',   sub: 'hand it over' },
  trash:    { x: 856, y: 480, w: 80, h: 64, label: 'TRASH',   sub: 'toss it' },
};

// Order board (tickets) sits on the top wall, above the stations.
// The shift timer panel sits beside it (x 708..936), so the board stops at 696.
export const BOARD = { x: 24, y: 16, w: 672, h: 68 };

// Processing times (seconds).
export const COOK_TIME = { grill: 6, fry: 5, chop: 2.5 };
export const BURN_AFTER = 8; // cooked food left on grill/fryer burns after this long
export const POUR_TIME = 1.6;

// Order pacing: first order at 4s, then a new one every interval (shrinks).
export const ORDER_FIRST_AT = 4;
export const ORDER_INTERVAL_START = 20;
export const ORDER_INTERVAL_MIN = 11;
export const ORDER_TIME_START = 55; // seconds a ticket lives
export const ORDER_TIME_MIN = 32;

// Scoring.
export const TIP_MAX_FRAC = 0.5; // up to +50% for a fast serve
export const WRONG_PENALTY = 2;  // coins lost for serving the wrong dish
export const EXPIRED_PENALTY = 1;
