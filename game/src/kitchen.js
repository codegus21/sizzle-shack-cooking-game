// Sizzle Shack — the kitchen: stations, the chef's hands, processing.
// The chef carries one thing at a time. Each station takes an item, works
// on it over time (chop / grill / fry / pour), and gives it back changed.
// The plate (assembly counter) collects ingredients in build order; the
// serve window hands the finished plate to the matching ticket.

import {
  STATIONS, INGREDIENTS, COOK_TIME, BURN_AFTER, POUR_TIME,
} from './config.js';
import { sfx } from './audio.js';

export function makeKitchen() {
  return {
    // What the chef is carrying: an ingredient id, or null.
    carry: null,
    // Processing slots: one per working station.
    board: null,   // { item, t, total }
    grill: null,   // { item, t, total, burnt }
    fryer: null,   // { item, t, total, burnt }
    drinks: null,  // { kind: 'cola'|'shake', t, total }
    // The assembly plate: ingredient ids in build order.
    plate: [],
    // Toast messages shown over the kitchen.
    toast: null, toastT: 0,
  };
}

export function setToast(k, msg) {
  k.toast = msg;
  k.toastT = 2.2;
}

function rawOf(cookedId) {
  for (const [id, def] of Object.entries(INGREDIENTS)) {
    if (def.cooked === cookedId) return id;
  }
  return null;
}

export function updateKitchen(k, dt) {
  if (k.toastT > 0) k.toastT -= dt;
  // Chopping finishes on its own; the chopped item waits on the board.
  if (k.board) {
    k.board.t += dt;
    if (k.board.t >= k.board.total && !k.board.done) {
      k.board.done = true;
      sfx.ding();
    }
  }
  // Grill: cooks, then burns if left too long.
  if (k.grill) {
    k.grill.t += dt;
    if (k.grill.t >= k.grill.total && !k.grill.done) {
      k.grill.done = true;
      sfx.ding();
    }
    if (k.grill.t >= k.grill.total + BURN_AFTER) k.grill.burnt = true;
  }
  // Fryer: same rhythm as the grill.
  if (k.fryer) {
    k.fryer.t += dt;
    if (k.fryer.t >= k.fryer.total && !k.fryer.done) {
      k.fryer.done = true;
      sfx.ding();
    }
    if (k.fryer.t >= k.fryer.total + BURN_AFTER) k.fryer.burnt = true;
  }
  // Drinks: the pour fills, then the cup is ready.
  if (k.drinks) {
    k.drinks.t += dt;
    if (k.drinks.t >= k.drinks.total && !k.drinks.done) {
      k.drinks.done = true;
      sfx.ding();
    }
  }
}

// Which station (if any) the chef stands next to. The chef interacts with
// the nearest station whose rectangle is within reach of their position.
export function stationAt(px, py) {
  const REACH = 26;
  let best = null;
  let bestD = Infinity;
  for (const [id, s] of Object.entries(STATIONS)) {
    const cx = s.x + s.w / 2;
    const cy = s.y + s.h / 2;
    const dx = Math.max(Math.abs(px - cx) - s.w / 2, 0);
    const dy = Math.max(Math.abs(py - cy) - s.h / 2, 0);
    const d = Math.hypot(dx, dy);
    if (d < bestD) { bestD = d; best = id; }
  }
  return bestD <= REACH + 30 ? best : null;
}

// The chef presses E at a station. Returns a short label of what happened.
export function interact(k, station) {
  switch (station) {
    case 'fridge':
    case 'drawer': {
      if (k.carry) return 'hands full';
      // Fridge: raw food; drawer: buns, cheese, sauce, cups. Cycle the
      // station's items with repeated presses? No — the station hands out
      // the item the chef needs most: cycle through its list each press.
      const list = station === 'fridge'
        ? ['patty', 'chicken', 'lettuce', 'tomato', 'potato', 'nuggets']
        : ['bun', 'cheese', 'sauce', 'cup'];
      k._cycle = k._cycle || {};
      const i = (k._cycle[station] || 0) % list.length;
      k._cycle[station] = (k._cycle[station] || 0) + 1;
      k.carry = list[i];
      sfx.pickup();
      return INGREDIENTS[k.carry].label;
    }
    case 'board': {
      if (k.board) {
        if (!k.board.done) return 'still chopping';
        if (k.carry) return 'hands full';
        k.carry = INGREDIENTS[k.board.item].cooked;
        k.board = null;
        sfx.pickup();
        return INGREDIENTS[k.carry].label;
      }
      if (!k.carry) return 'need something to chop';
      const def = INGREDIENTS[k.carry];
      if (def.process !== 'chop') return 'cannot chop that';
      k.board = { item: k.carry, t: 0, total: COOK_TIME.chop, done: false };
      k.carry = null;
      sfx.chop();
      return 'chopping…';
    }
    case 'grill': {
      if (k.grill) {
        if (!k.grill.done) return 'still cooking';
        if (k.grill.burnt) { k.grill = null; sfx.wrong(); return 'burnt! tossed'; }
        if (k.carry) return 'hands full';
        k.carry = INGREDIENTS[k.grill.item].cooked;
        k.grill = null;
        sfx.pickup();
        return INGREDIENTS[k.carry].label;
      }
      if (!k.carry) return 'need something to grill';
      const def = INGREDIENTS[k.carry];
      if (def.process !== 'grill') return 'cannot grill that';
      k.grill = { item: k.carry, t: 0, total: COOK_TIME.grill, done: false, burnt: false };
      k.carry = null;
      sfx.sizzle();
      return 'on the grill…';
    }
    case 'fryer': {
      if (k.fryer) {
        if (!k.fryer.done) return 'still frying';
        if (k.fryer.burnt) { k.fryer = null; sfx.wrong(); return 'burnt! tossed'; }
        if (k.carry) return 'hands full';
        k.carry = INGREDIENTS[k.fryer.item].cooked;
        k.fryer = null;
        sfx.pickup();
        return INGREDIENTS[k.carry].label;
      }
      if (!k.carry) return 'need something to fry';
      const def = INGREDIENTS[k.carry];
      if (def.process !== 'fry') return 'cannot fry that';
      k.fryer = { item: k.carry, t: 0, total: COOK_TIME.fry, done: false, burnt: false };
      k.carry = null;
      sfx.sizzle();
      return 'in the fryer…';
    }
    case 'drinks': {
      if (k.drinks) {
        if (!k.drinks.done) return 'still pouring';
        if (k.carry) return 'hands full';
        k.carry = k.drinks.kind;
        k.drinks = null;
        sfx.pickup();
        return INGREDIENTS[k.carry].label;
      }
      if (k.carry !== 'cup') return 'need a cup first';
      // Alternate tap each pour: cola, then shake, then cola…
      k._tap = k._tap === 'cola' ? 'shake' : 'cola';
      k.drinks = { kind: k._tap, t: 0, total: POUR_TIME, done: false };
      k.carry = null;
      sfx.pour();
      return 'pouring ' + k._tap + '…';
    }
    case 'assemble': {
      if (!k.carry) return 'carry an ingredient first';
      k.plate.push(k.carry);
      const label = INGREDIENTS[k.carry].label;
      k.carry = null;
      sfx.place();
      return label + ' on the plate';
    }
    case 'trash': {
      if (k.carry) { k.carry = null; sfx.place(); return 'tossed'; }
      if (k.plate.length) { k.plate = []; sfx.place(); return 'plate cleared'; }
      return 'nothing to toss';
    }
    default:
      return null;
  }
}

// Take the finished plate off the assembly counter (for serving).
export function takePlate(k) {
  if (!k.plate.length) return null;
  const plate = k.plate.slice();
  k.plate = [];
  return plate;
}

export { rawOf };
