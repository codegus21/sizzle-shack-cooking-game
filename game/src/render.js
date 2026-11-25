// Sizzle Shack — rendering: the kitchen, the order board, the chef, the HUD.
// Everything is drawn with rectangles and the in-code pixel sprites, in a
// warm diner palette, scaled so the pixel art stays crisp.

import { PAL, VIEW_W, VIEW_H, STATIONS, BOARD, INGREDIENTS, MENU, SHIFT_SECONDS } from './config.js';
import { CHEF, ING_SPRITES, DISH_SPRITES, UTENSILS, DRAWER_FACE, drawSprite } from './sprites.js';
import { dishOf } from './orders.js';

const FONT = '"Courier New", monospace';

// The colour of each ingredient as a layer on the assembly plate.
const ING_COLORS = {
  bun: '#e0a458', cheese: '#f2c531', sauce: '#d94f3d', cup: '#fff6dd',
  patty: '#d98a7a', chicken: '#f2b8a0', lettuce: '#4c9a4c', tomato: '#d94f3d',
  potato: '#b98a5a', nuggets: '#f2d0a0', grilledPatty: '#7a4a2b',
  grilledChicken: '#d98a3c', choppedLettuce: '#5cb85c', choppedTomato: '#e05a4a',
  fries: '#f2c531', friedNuggets: '#e0a03c', cola: '#3a2a2a', shake: '#8a5a3b',
};

function text(ctx, s, x, y, size, color, align = 'left', bold = false) {
  ctx.fillStyle = color;
  ctx.font = (bold ? 'bold ' : '') + size + 'px ' + FONT;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.fillText(s, x, y);
}

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
}

function bar(ctx, x, y, w, h, frac, fill, bg = '#3a3230') {
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, Math.max(0, Math.min(1, frac)) * w, h);
}

// --- The floor and walls ---------------------------------------------------
function drawRoom(ctx) {
  // Floor: checkerboard tiles.
  const t = 32;
  for (let y = 0; y < VIEW_H / t; y++) {
    for (let x = 0; x < VIEW_W / t; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? PAL.floorA : PAL.floorB;
      ctx.fillRect(x * t, y * t, t, t);
    }
  }
  // Top wall with a red awning stripe.
  ctx.fillStyle = PAL.wall;
  ctx.fillRect(0, 0, VIEW_W, 96);
  ctx.fillStyle = PAL.wallTrim;
  ctx.fillRect(0, 88, VIEW_W, 8);
  // Awning scallops.
  for (let x = 0; x < VIEW_W; x += 48) {
    ctx.fillStyle = (x / 48) % 2 === 0 ? PAL.red : PAL.paper;
    ctx.beginPath();
    ctx.arc(x + 24, 88, 12, 0, Math.PI);
    ctx.fill();
  }
  // A rug in the middle of the floor and two potted plants, so the open
  // floor reads as a kitchen rather than an empty checkerboard. They are
  // decoration only — the chef walks over the rug and past the plants.
  ctx.fillStyle = '#a83226';
  ctx.fillRect(300, 300, 360, 160);
  ctx.fillStyle = '#f2e3c6';
  ctx.fillRect(312, 312, 336, 136);
  ctx.fillStyle = '#d94f3d';
  ctx.fillRect(324, 324, 312, 112);
  ctx.fillStyle = '#f7ead0';
  ctx.fillRect(336, 336, 288, 88);
  ctx.fillStyle = '#2e7f7b';
  ctx.fillRect(348, 348, 264, 64);
  for (const px of [60, 700]) {
    ctx.fillStyle = '#8a5a3b';
    ctx.fillRect(px, 520, 28, 24);
    ctx.fillStyle = '#4c9a4c';
    ctx.beginPath();
    ctx.arc(px + 14, 512, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5cb85c';
    ctx.beginPath();
    ctx.arc(px + 6, 506, 10, 0, Math.PI * 2);
    ctx.arc(px + 22, 506, 10, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = PAL.wall;
  ctx.fillRect(0, VIEW_H - 64, VIEW_W, 64);
  ctx.fillStyle = PAL.wallTrim;
  ctx.fillRect(0, VIEW_H - 64, VIEW_W, 8);
  text(ctx, 'SIZZLE SHACK — FAST FOOD, FASTER HANDS', 16, VIEW_H - 48, 18, PAL.ink, 'left', true);
  text(ctx, 'WASD / ARROWS move   •   E interact   •   R restart', 16, VIEW_H - 24, 13, PAL.ink);
}

// --- Stations --------------------------------------------------------------
function drawStation(ctx, id, s, k, now) {
  const hover = false;
  // Counter body.
  ctx.fillStyle = PAL.counter;
  ctx.fillRect(s.x, s.y, s.w, s.h);
  ctx.fillStyle = PAL.counterTop;
  ctx.fillRect(s.x, s.y, s.w, 10);
  ctx.fillStyle = PAL.counterEdge;
  ctx.fillRect(s.x, s.y + s.h - 4, s.w, 4);
  // Label.
  text(ctx, s.label, s.x + s.w / 2, s.y + 16, 11, PAL.paper, 'center', true);
  text(ctx, s.sub, s.x + s.w / 2, s.y + 30, 9, '#cfe8e5', 'center');

  if (id === 'fridge') {
    ctx.fillStyle = PAL.steel;
    ctx.fillRect(s.x + 8, s.y + 42, s.w - 16, 16);
    ctx.fillStyle = PAL.steelDark;
    ctx.fillRect(s.x + 8, s.y + 50, s.w - 16, 2);
    // Next item preview.
    const list = ['patty', 'chicken', 'lettuce', 'tomato', 'potato', 'nuggets'];
    const i = ((k._cycle && k._cycle.fridge) || 0) % list.length;
    drawSprite(ctx, ING_SPRITES[list[i]], s.x + s.w / 2 - 16, s.y + 40, 2);
  }
  if (id === 'drawer') {
    drawSprite(ctx, DRAWER_FACE, s.x + 16, s.y + 40, 1.5);
    const list = ['bun', 'cheese', 'sauce', 'cup'];
    const i = ((k._cycle && k._cycle.drawer) || 0) % list.length;
    drawSprite(ctx, ING_SPRITES[list[i]], s.x + s.w - 34, s.y + 40, 2);
  }
  if (id === 'board') {
    // Wooden chopping board + the knife.
    ctx.fillStyle = '#d9b380';
    ctx.fillRect(s.x + 12, s.y + 42, s.w - 24, 14);
    drawSprite(ctx, UTENSILS.knife, s.x + 14, s.y + 38, 1.5);
    if (k.board) {
      const frac = Math.min(1, k.board.t / k.board.total);
      bar(ctx, s.x + 10, s.y + 58, s.w - 20, 5, frac, k.board.done ? PAL.green : PAL.gold);
      if (!k.board.done) drawSprite(ctx, ING_SPRITES[k.board.item], s.x + s.w / 2 - 16, s.y + 40, 2);
      else drawSprite(ctx, ING_SPRITES[INGREDIENTS[k.board.item].cooked], s.x + s.w / 2 - 16, s.y + 40, 2);
    }
  }
  if (id === 'grill') {
    // Flat-top grill + the frying pan.
    ctx.fillStyle = '#2b2b2b';
    ctx.fillRect(s.x + 10, s.y + 42, s.w - 20, 14);
    drawSprite(ctx, UTENSILS.pan, s.x + 12, s.y + 36, 1.5);
    if (k.grill) {
      const frac = Math.min(1, k.grill.t / k.grill.total);
      bar(ctx, s.x + 10, s.y + 58, s.w - 20, 5, frac, k.grill.burnt ? PAL.red : (k.grill.done ? PAL.green : PAL.gold));
      const item = k.grill.burnt ? k.grill.item : (k.grill.done ? INGREDIENTS[k.grill.item].cooked : k.grill.item);
      drawSprite(ctx, ING_SPRITES[item], s.x + s.w / 2 - 16, s.y + 38, 2);
      if (k.grill.burnt) text(ctx, 'BURNT!', s.x + s.w / 2, s.y + 40, 10, PAL.red, 'center', true);
    }
  }
  if (id === 'fryer') {
    // Fryer basket, bubbling.
    ctx.fillStyle = '#8a6a42';
    ctx.fillRect(s.x + 10, s.y + 42, s.w - 20, 14);
    ctx.fillStyle = '#f2c531';
    const bub = Math.floor(now * 6) % 3;
    for (let b = 0; b < 3; b++) ctx.fillRect(s.x + 20 + b * 28, s.y + 46 - ((b + bub) % 3), 6, 6);
    if (k.fryer) {
      const frac = Math.min(1, k.fryer.t / k.fryer.total);
      bar(ctx, s.x + 10, s.y + 58, s.w - 20, 5, frac, k.fryer.burnt ? PAL.red : (k.fryer.done ? PAL.green : PAL.gold));
      const item = k.fryer.burnt ? k.fryer.item : (k.fryer.done ? INGREDIENTS[k.fryer.item].cooked : k.fryer.item);
      drawSprite(ctx, ING_SPRITES[item], s.x + s.w / 2 - 16, s.y + 38, 2);
      if (k.fryer.burnt) text(ctx, 'BURNT!', s.x + s.w / 2, s.y + 40, 10, PAL.red, 'center', true);
    }
  }
  if (id === 'drinks') {
    // Two taps: cola (red) and shake (brown).
    ctx.fillStyle = PAL.red;
    ctx.fillRect(s.x + 16, s.y + 42, 14, 14);
    ctx.fillStyle = '#8a5a3b';
    ctx.fillRect(s.x + s.w - 30, s.y + 42, 14, 14);
    text(ctx, 'COLA', s.x + 23, s.y + 44, 8, '#fff', 'center', true);
    text(ctx, 'SHAKE', s.x + s.w - 23, s.y + 44, 8, '#fff', 'center', true);
    if (k.drinks) {
      const frac = Math.min(1, k.drinks.t / k.drinks.total);
      bar(ctx, s.x + 10, s.y + 58, s.w - 20, 5, frac, k.drinks.done ? PAL.green : PAL.blue);
      text(ctx, k.drinks.kind.toUpperCase(), s.x + s.w / 2, s.y + 40, 9, PAL.paper, 'center', true);
    }
  }
  if (id === 'assemble') {
    // The plate: ingredients stack up as coloured layers, so a dish
    // mid-assembly reads at a glance. When the plate matches a menu dish,
    // the finished dish shows on it instead.
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(s.x + s.w / 2, s.y + 50, 30, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c9c9c9';
    ctx.stroke();
    const n = k.plate.length;
    if (n === 0) {
      text(ctx, 'empty plate', s.x + s.w / 2, s.y + 46, 9, '#8a6d3b', 'center');
    } else {
      const sorted = k.plate.slice().sort().join('|');
      const match = MENU.find((d) => d.recipe.slice().sort().join('|') === sorted);
      if (match) {
        drawSprite(ctx, DISH_SPRITES[match.id], s.x + s.w / 2 - 16, s.y + 14, 2);
      } else {
        for (let i = 0; i < n; i++) {
          const col = ING_COLORS[k.plate[i]] || '#8a6d3b';
          ctx.fillStyle = col;
          const w = 40 - i * 2;
          ctx.fillRect(s.x + s.w / 2 - w / 2, s.y + 46 - (i + 1) * 5, w, 5);
        }
      }
    }
  }
  if (id === 'serve') {
    // Serving window with a bell.
    ctx.fillStyle = PAL.gold;
    ctx.beginPath();
    ctx.arc(s.x + s.w / 2, s.y + 48, 9, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(s.x + s.w / 2 - 9, s.y + 48, 18, 3);
  }
  if (id === 'trash') {
    ctx.fillStyle = '#5a5a5a';
    ctx.fillRect(s.x + 16, s.y + 42, s.w - 32, 14);
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(s.x + 12, s.y + 40, s.w - 24, 4);
  }
  if (hover) return;
}

// Utensil rail on the wall between the stations (spatula, ladle, tongs, whisk).
function drawRail(ctx) {
  const x0 = 248;
  const y = 170;
  ctx.fillStyle = '#8a6a42';
  ctx.fillRect(x0, y, 360, 4);
  const tools = [UTENSILS.spatula, UTENSILS.ladle, UTENSILS.tongs, UTENSILS.whisk];
  tools.forEach((t, i) => drawSprite(ctx, t, x0 + 20 + i * 90, y + 8, 2));
}

// --- Order board -------------------------------------------------------------
function drawBoard(ctx, orders) {
  const b = BOARD;
  roundRect(ctx, b.x, b.y, b.w, b.h, 8, PAL.board, PAL.boardEdge);
  text(ctx, 'ORDERS', b.x + 12, b.y + 10, 16, PAL.ink, 'left', true);
  const slotW = 190;
  orders.list.forEach((t, i) => {
    const x = b.x + 92 + i * slotW;
    const y = b.y + 8;
    // Ticket.
    roundRect(ctx, x, y, slotW - 12, b.h - 16, 6, '#fff', t.color);
    drawSprite(ctx, DISH_SPRITES[t.dishId], x + 6, y + 8, 2);
    text(ctx, t.name, x + 42, y + 6, 11, PAL.ink, 'left', true);
    text(ctx, '$' + t.price, x + 42, y + 24, 11, PAL.ink);
    // Countdown: bar + seconds.
    const frac = Math.max(0, t.left / t.life);
    const col = frac > 0.5 ? PAL.green : frac > 0.25 ? PAL.gold : PAL.red;
    bar(ctx, x + 42, y + 40, slotW - 58, 8, frac, col);
    text(ctx, Math.ceil(t.left) + 's', x + slotW - 20, y + 38, 10, PAL.ink, 'right', true);
    // Recipe icons under the ticket.
    t.recipe.forEach((ing, j) => {
      drawSprite(ctx, ING_SPRITES[ing], x + 42 + j * 18, y + 50 - 6, 1);
    });
  });
  if (!orders.list.length) {
    text(ctx, 'no orders — the rush is coming…', b.x + 130, b.y + 26, 13, '#8a6d3b');
  }
}

// --- Chef --------------------------------------------------------------------
function drawChef(ctx, p, now) {
  const bob = Math.abs(Math.sin(now * 10)) * (p.moving ? 2 : 0);
  // Soft shadow under the chef.
  ctx.fillStyle = 'rgba(38,34,28,0.25)';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + 20, 20, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  drawSprite(ctx, CHEF, p.x - 24, p.y - 24 - bob, 3);
  if (p.carry) {
    drawSprite(ctx, ING_SPRITES[p.carry], p.x - 16, p.y - 56 - bob, 2);
  }
  // Interaction prompt.
  if (p.near) {
    const s = STATIONS[p.near];
    text(ctx, '[E] ' + s.label, p.x, p.y - 66 - bob, 11, PAL.ink, 'center', true);
  }
}

// --- HUD -----------------------------------------------------------------------
// The shift timer and coins live in their own panel beside the order board,
// so they never cover a ticket.
function drawHUD(ctx, state, now) {
  const left = Math.max(0, SHIFT_SECONDS - state.orders.elapsed);
  const mm = Math.floor(left / 60);
  const ss = String(Math.floor(left % 60)).padStart(2, '0');
  const hx = 708, hy = 16, hw = 228, hh = 68;
  roundRect(ctx, hx, hy, hw, hh, 8, 'rgba(38,34,28,0.92)', '#8a6d3b');
  text(ctx, 'SHIFT ' + mm + ':' + ss, hx + 14, hy + 10, 16, left < 30 ? '#ff6b5e' : '#fff', 'left', true);
  text(ctx, 'COINS $' + state.orders.coins, hx + 14, hy + 34, 13, PAL.gold, 'left', true);
  if (state.orders.combo >= 2) {
    text(ctx, 'COMBO x' + state.orders.combo, hx + 130, hy + 34, 13, '#ff8a5e', 'left', true);
  }
  // Toast message.
  if (state.kitchen.toast && state.kitchen.toastT > 0) {
    const a = Math.min(1, state.kitchen.toastT);
    ctx.globalAlpha = a;
    roundRect(ctx, VIEW_W / 2 - 150, 84, 300, 26, 8, 'rgba(38,34,28,0.9)');
    text(ctx, state.kitchen.toast, VIEW_W / 2, 90, 13, '#fff', 'center', true);
    ctx.globalAlpha = 1;
  }
  // Last serve feedback.
  if (state.feedback && state.feedbackT > 0) {
    const a = Math.min(1, state.feedbackT);
    ctx.globalAlpha = a;
    text(ctx, state.feedback, VIEW_W / 2, 130, 20, state.feedbackGood ? PAL.green : PAL.red, 'center', true);
    ctx.globalAlpha = 1;
  }
}

// --- Screens -------------------------------------------------------------------
function drawTitle(ctx) {
  ctx.fillStyle = 'rgba(38,34,28,0.75)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  roundRect(ctx, VIEW_W / 2 - 300, 150, 600, 300, 16, PAL.board, PAL.boardEdge);
  text(ctx, 'SIZZLE SHACK', VIEW_W / 2, 180, 52, PAL.red, 'center', true);
  text(ctx, 'FAST FOOD, FASTER HANDS', VIEW_W / 2, 240, 20, PAL.ink, 'center', true);
  text(ctx, 'Take the tickets. Cook the food. Serve it hot.', VIEW_W / 2, 280, 15, PAL.ink, 'center');
  text(ctx, 'Fridge + drawer give ingredients — chop, grill, fry, pour —', VIEW_W / 2, 312, 13, PAL.ink, 'center');
  text(ctx, 'build the dish on the plate and serve it before the timer runs out.', VIEW_W / 2, 332, 13, PAL.ink, 'center');
  text(ctx, 'Press ENTER or click to start your shift', VIEW_W / 2, 392, 16, PAL.red, 'center', true);
  // A sample ticket.
  drawSprite(ctx, DISH_SPRITES.shackBurger, VIEW_W / 2 - 80, 352, 3);
  drawSprite(ctx, DISH_SPRITES.goldenFries, VIEW_W / 2 - 16, 352, 3);
  drawSprite(ctx, DISH_SPRITES.fizzyCola, VIEW_W / 2 + 48, 352, 3);
}

function drawEnd(ctx, state) {
  ctx.fillStyle = 'rgba(38,34,28,0.8)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  roundRect(ctx, VIEW_W / 2 - 280, 160, 560, 280, 16, PAL.board, PAL.boardEdge);
  text(ctx, 'SHIFT OVER!', VIEW_W / 2, 190, 44, PAL.red, 'center', true);
  text(ctx, 'Coins earned: $' + state.orders.coins, VIEW_W / 2, 260, 22, PAL.ink, 'center', true);
  text(ctx, 'Dishes served: ' + state.orders.served + '   •   best combo x' + state.orders.bestCombo, VIEW_W / 2, 296, 16, PAL.ink, 'center');
  text(ctx, 'Expired: ' + state.orders.expired + '   •   wrong serves: ' + state.orders.wrong, VIEW_W / 2, 324, 16, PAL.ink, 'center');
  const rank = state.orders.coins >= 120 ? 'HEAD CHEF!' : state.orders.coins >= 80 ? 'SOUS CHEF' : state.orders.coins >= 40 ? 'LINE COOK' : 'DISHWASHER (for now)';
  text(ctx, 'Rank: ' + rank, VIEW_W / 2, 360, 20, PAL.green, 'center', true);
  text(ctx, 'Press R to work another shift', VIEW_W / 2, 404, 15, PAL.red, 'center', true);
}

export function render(ctx, state, now) {
  drawRoom(ctx);
  for (const [id, s] of Object.entries(STATIONS)) drawStation(ctx, id, s, state.kitchen, now);
  drawRail(ctx);
  drawBoard(ctx, state.orders);
  if (state.phase === 'play') {
    drawChef(ctx, state.player, now);
    drawHUD(ctx, state, now);
  } else if (state.phase === 'title') {
    drawTitle(ctx);
  } else if (state.phase === 'end') {
    drawChef(ctx, state.player, now);
    drawHUD(ctx, state, now);
    drawEnd(ctx, state);
  }
}

export { dishOf, MENU };
