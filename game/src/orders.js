// Sizzle Shack — orders: the ticket queue on the order board.
// Tickets arrive on a shrinking interval, each with a countdown; serving
// the right dish before it runs out pays the dish price plus a speed tip.
// A wrong serve or an expired ticket costs coins and breaks the combo.

import {
  MENU, dishById, MAX_ORDERS, ORDER_FIRST_AT, ORDER_INTERVAL_START,
  ORDER_INTERVAL_MIN, ORDER_TIME_START, ORDER_TIME_MIN,
  TIP_MAX_FRAC, WRONG_PENALTY, EXPIRED_PENALTY,
} from './config.js';

let nextId = 1;

export function makeOrders(rng) {
  return {
    rng,
    list: [],
    elapsed: 0,
    nextAt: ORDER_FIRST_AT,
    interval: ORDER_INTERVAL_START,
    served: 0,
    expired: 0,
    wrong: 0,
    coins: 0,
    combo: 0,
    bestCombo: 0,
  };
}

// Weighted pick: cheap fast dishes early, the full menu once the rush builds.
function pickDish(state, rng) {
  const t = state.elapsed;
  let pool = MENU;
  if (t < 40) pool = MENU.filter((d) => d.recipe.length <= 2);
  else if (t < 90) pool = MENU.filter((d) => d.recipe.length <= 4);
  const weights = pool.map((d) => 1 / d.recipe.length);
  let sum = 0;
  for (const w of weights) sum += w;
  let r = rng() * sum;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

export function updateOrders(state, dt, onNew, onExpired) {
  state.elapsed += dt;
  // Spawn a new ticket when due and the board has room.
  if (state.elapsed >= state.nextAt && state.list.length < MAX_ORDERS) {
    const dish = pickDish(state, state.rng);
    const life = Math.max(
      ORDER_TIME_MIN,
      ORDER_TIME_START - Math.floor(state.elapsed / 30) * 4,
    );
    state.list.push({
      id: nextId++, dishId: dish.id, name: dish.name, short: dish.short,
      color: dish.color, price: dish.price, recipe: dish.recipe.slice(),
      life, left: life, born: state.elapsed,
    });
    state.nextAt = state.elapsed + state.interval;
    state.interval = Math.max(ORDER_INTERVAL_MIN, state.interval - 0.7);
    if (onNew) onNew();
  }
  // Tick every ticket's countdown.
  for (let i = state.list.length - 1; i >= 0; i--) {
    const t = state.list[i];
    t.left -= dt;
    if (t.left <= 0) {
      state.list.splice(i, 1);
      state.expired++;
      state.coins = Math.max(0, state.coins - EXPIRED_PENALTY);
      state.combo = 0;
      if (onExpired) onExpired(t);
    }
  }
}

// Serve a finished plate (array of ingredient ids) at the window.
// Returns { ok, ticket, earned, tip } — ok is false when no ticket matches.
export function servePlate(state, plate) {
  const sorted = plate.slice().sort().join('|');
  const idx = state.list.findIndex(
    (t) => t.recipe.slice().sort().join('|') === sorted,
  );
  if (idx === -1) {
    state.wrong++;
    state.coins = Math.max(0, state.coins - WRONG_PENALTY);
    state.combo = 0;
    return { ok: false, earned: -WRONG_PENALTY };
  }
  const t = state.list[idx];
  state.list.splice(idx, 1);
  const frac = Math.max(0, t.left / t.life);
  const tip = Math.round(t.price * TIP_MAX_FRAC * frac);
  const comboBonus = Math.min(state.combo, 5);
  const earned = t.price + tip + comboBonus;
  state.coins += earned;
  state.served++;
  state.combo++;
  if (state.combo > state.bestCombo) state.bestCombo = state.combo;
  return { ok: true, ticket: t, earned, tip, comboBonus };
}

export function dishOf(ticket) {
  return dishById(ticket.dishId);
}
