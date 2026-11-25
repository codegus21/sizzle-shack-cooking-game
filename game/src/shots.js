// Sizzle Shack — screenshot staging.
// ?shot=<name> sets the game up in a fixed, deterministic scene so the
// screenshots are real renders of the game's own code, staged by its maker:
//   kitchen  — the full kitchen with the order board and three tickets
//   counter  — ingredients laid out on the counter, chef holding a patty
//   assembly — a Shack Burger mid-assembly on the plate
//   serve    — the finished plate, ready to serve, timer running
// ?seed=<n> fixes the random order stream (default 1).

import { MENU } from './config.js';

export function parseShot() {
  const q = new URLSearchParams(window.location.search);
  return { shot: q.get('shot'), seed: Number(q.get('seed') || 1) };
}

export function stageShot(state, name) {
  const k = state.kitchen;
  const o = state.orders;
  const p = state.player;
  // A calm kitchen to start from: no timers running down in the shots.
  state.phase = 'play';
  if (name === 'kitchen') {
    o.list = [
      { id: 101, dishId: 'shackBurger', name: 'SHACK BURGER', short: 'BURGER', color: '#d94f3d', price: 6, recipe: ['bun', 'grilledPatty', 'choppedLettuce', 'choppedTomato', 'cheese'], life: 55, left: 42, born: 0 },
      { id: 102, dishId: 'goldenFries', name: 'GOLDEN FRIES', short: 'FRIES', color: '#f2b234', price: 3, recipe: ['fries'], life: 45, left: 31, born: 0 },
      { id: 103, dishId: 'fizzyCola', name: 'FIZZY COLA', short: 'COLA', color: '#3d7ea6', price: 2, recipe: ['cola'], life: 40, left: 24, born: 0 },
    ];
    o.elapsed = 30;
    o.coins = 24;
    p.x = 480; p.y = 320;
    p.carry = null;
    k.plate = [];
  } else if (name === 'counter') {
    o.list = [
      { id: 101, dishId: 'shackBurger', name: 'SHACK BURGER', short: 'BURGER', color: '#d94f3d', price: 6, recipe: ['bun', 'grilledPatty', 'choppedLettuce', 'choppedTomato', 'cheese'], life: 55, left: 48, born: 0 },
    ];
    o.elapsed = 12;
    o.coins = 6;
    p.x = 180; p.y = 300;
    p.carry = 'patty';
    k.plate = [];
    // Ingredients laid out on the stations: raw patty on the grill pan,
    // lettuce on the board, buns and cheese by the drawer.
    k.grill = { item: 'patty', t: 3, total: 6, done: false, burnt: false };
    k.board = { item: 'lettuce', t: 1.2, total: 2.5, done: false };
  } else if (name === 'assembly') {
    o.list = [
      { id: 101, dishId: 'shackBurger', name: 'SHACK BURGER', short: 'BURGER', color: '#d94f3d', price: 6, recipe: ['bun', 'grilledPatty', 'choppedLettuce', 'choppedTomato', 'cheese'], life: 55, left: 35, born: 0 },
      { id: 102, dishId: 'crispyClucker', name: 'CRISPY CLUCKER', short: 'CLUCKER', color: '#f2b234', price: 7, recipe: ['bun', 'grilledChicken', 'choppedLettuce', 'sauce'], life: 50, left: 28, born: 0 },
    ];
    o.elapsed = 48;
    o.coins = 31;
    p.x = 780; p.y = 300;
    p.carry = 'choppedTomato';
    // The burger mid-assembly: bun + patty + lettuce on the plate, tomato
    // in the chef's hand, cheese still to come.
    k.plate = ['bun', 'grilledPatty', 'choppedLettuce'];
    k.grill = null;
    k.board = null;
  } else if (name === 'serve') {
    o.list = [
      { id: 101, dishId: 'doubleStack', name: 'DOUBLE STACK', short: 'DOUBLE', color: '#a83226', price: 8, recipe: ['bun', 'grilledPatty', 'grilledPatty', 'cheese', 'cheese'], life: 50, left: 18, born: 0 },
    ];
    o.elapsed = 72;
    o.coins = 47;
    o.combo = 3;
    p.x = 880; p.y = 300;
    p.carry = null;
    // The finished Double Stack on the plate, timer still running.
    k.plate = ['bun', 'grilledPatty', 'grilledPatty', 'cheese', 'cheese'];
  }
  state.shot = name;
  // Freeze the staged scene: orders and timers hold still for the shot.
  state.frozen = true;
}

export { MENU };
