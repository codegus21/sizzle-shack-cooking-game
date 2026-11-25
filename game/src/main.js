// Sizzle Shack — the game loop: state, input, movement, serving.
// One shift: take tickets off the order board, cook the food at the
// stations, build each dish on the plate, serve it before its timer ends.

import { VIEW_W, VIEW_H, STATIONS, SHIFT_SECONDS } from './config.js';
import { makeKitchen, updateKitchen, stationAt, interact, setToast, takePlate } from './kitchen.js';
import { makeOrders, updateOrders, servePlate } from './orders.js';
import { render } from './render.js';
import { sfx } from './audio.js';
import { parseShot, stageShot } from './shots.js';

// Small seeded RNG (mulberry32) so ?seed= stages deterministically.
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

function resize() {
  canvas.width = VIEW_W;
  canvas.height = VIEW_H;
  ctx.imageSmoothingEnabled = false;
}
resize();

function newState(seed) {
  return {
    phase: 'title', // title | play | end
    shot: null,
    frozen: false,
    rng: mulberry32(seed),
    kitchen: makeKitchen(),
    orders: makeOrders(mulberry32(seed)),
    player: { x: 480, y: 340, vx: 0, vy: 0, speed: 230, moving: false, carry: null, near: null },
    feedback: null,
    feedbackT: 0,
    feedbackGood: true,
    now: 0,
  };
}

const { shot, seed } = parseShot();
let state = newState(seed);
if (shot) stageShot(state, shot);

// --- Input -------------------------------------------------------------------
const keys = {};
window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
  keys[e.key.toLowerCase()] = true;
  if (e.repeat) return;
  if (e.key === 'Enter' && state.phase === 'title') startShift();
  if (e.key.toLowerCase() === 'r' && state.phase === 'end') restart();
  if (e.key.toLowerCase() === 'e' && state.phase === 'play') doInteract();
});
window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });
canvas.addEventListener('click', () => {
  if (state.phase === 'title') startShift();
  else if (state.phase === 'end') restart();
  else if (state.phase === 'play') doInteract();
});

function startShift() {
  state.phase = 'play';
  sfx.start();
  setStatus('Shift started. Take the tickets, cook, serve!');
}

function restart() {
  const keepShot = state.shot;
  state = newState(seed);
  if (keepShot) stageShot(state, keepShot);
  else state.phase = 'title';
}

function setStatus(msg) {
  if (statusEl) statusEl.textContent = msg;
}

function doInteract() {
  const p = state.player;
  const k = state.kitchen;
  const station = p.near;
  if (!station) return;
  if (station === 'serve') {
    const plate = takePlate(k);
    if (!plate || !plate.length) {
      setToast(k, 'the plate is empty');
      return;
    }
    const res = servePlate(state.orders, plate);
    if (res.ok) {
      state.feedback = '+' + res.earned + ' coins — ' + res.ticket.name + ' served!' + (res.tip ? ' (tip $' + res.tip + ')' : '');
      state.feedbackGood = true;
      state.feedbackT = 2.4;
      sfx.serve();
      setStatus('Served ' + res.ticket.name + ' for $' + res.earned + '.');
    } else {
      state.feedback = 'Wrong dish! Nobody ordered that. -$2';
      state.feedbackGood = false;
      state.feedbackT = 2.4;
      sfx.wrong();
    }
    return;
  }
  const msg = interact(k, station);
  if (msg) {
    setToast(k, msg);
    p.carry = k.carry;
    // Keep the player's carried item in sync with the kitchen's hands.
    if (station === 'assemble' || station === 'trash') p.carry = k.carry;
  }
}

// --- Movement ------------------------------------------------------------------
function collide(p, nx, ny) {
  // Walls: the walkable floor is y 176..560, x 16..944.
  const x = Math.max(20, Math.min(VIEW_W - 20, nx));
  const y = Math.max(184, Math.min(556, ny));
  // Stations are solid blocks (except the serve window's counter front,
  // which the chef can stand at).
  for (const s of Object.values(STATIONS)) {
    if (x > s.x - 14 && x < s.x + s.w + 14 && y > s.y - 10 && y < s.y + s.h + 6) {
      return { x: p.x, y: p.y };
    }
  }
  return { x, y };
}

// --- Loop ------------------------------------------------------------------------
let last = performance.now();
function frame(t) {
  const dt = Math.min(0.05, (t - last) / 1000);
  last = t;
  state.now = t / 1000;
  if (state.phase === 'play' && !state.frozen) {
    const p = state.player;
    let dx = 0;
    let dy = 0;
    if (keys['a'] || keys['arrowleft']) dx -= 1;
    if (keys['d'] || keys['arrowright']) dx += 1;
    if (keys['w'] || keys['arrowup']) dy -= 1;
    if (keys['s'] || keys['arrowdown']) dy += 1;
    p.moving = dx !== 0 || dy !== 0;
    if (p.moving) {
      const len = Math.hypot(dx, dy);
      const stepX = (dx / len) * p.speed * dt;
      const stepY = (dy / len) * p.speed * dt;
      // Move one axis at a time so sliding along a counter still works.
      const px = collide(p, p.x + stepX, p.y);
      p.x = px.x;
      const py = collide(p, p.x, p.y + stepY);
      p.y = py.y;
    }
    p.carry = state.kitchen.carry;
    p.near = stationAt(p.x, p.y);
    updateKitchen(state.kitchen, dt);
    updateOrders(
      state.orders, dt,
      () => sfx.newOrder(),
      (ticket) => {
        state.feedback = 'Order expired: ' + ticket.name + ' — -$1';
        state.feedbackGood = false;
        state.feedbackT = 2.2;
        sfx.expired();
      },
    );
    if (state.feedbackT > 0) state.feedbackT -= dt;
    // The shift ends when the clock runs out.
    if (state.orders.elapsed >= SHIFT_SECONDS) {
      state.phase = 'end';
      sfx.end();
      setStatus('Shift over. Coins: $' + state.orders.coins + '.');
    }
    // A ticking warning when a ticket is nearly out of time.
    const urgent = state.orders.list.some((o) => o.left < 8);
    if (urgent && Math.floor(t / 500) !== Math.floor((t - dt * 1000) / 500)) sfx.tick();
  }
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  render(ctx, state, state.now);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
