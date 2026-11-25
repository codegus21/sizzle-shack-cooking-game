// Sizzle Shack — in-code pixel art.
// Every sprite is drawn in code (rows of characters mapped to colours), so
// the game ships no image files at all: light, original, and licence-clean.
// Sprites are 16 cells wide; drawSprite scales them by whole pixels.

export function makeSprite(rows, pal) {
  return { rows, pal, w: Math.max(...rows.map((r) => r.length)), h: rows.length };
}

export function drawSprite(ctx, spr, x, y, scale = 2) {
  const { rows, pal } = spr;
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      if (ch === '.' || ch === ' ') continue;
      const col = pal[ch];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(Math.round(x + c * scale), Math.round(y + r * scale), scale, scale);
    }
  }
}

// --- The chef (player) ---------------------------------------------------
export const CHEF = makeSprite(
  [
    '....wwwwww......',
    '...wwwwwwww.....',
    '..wwwwwwwwww....',
    '..wwwwwwwwww....',
    '...wwwwwwww.....',
    '....hhhhhh......',
    '....ssssss......',
    '....se..es......',
    '....ssmmss......',
    '.....rrrr.......',
    '...wwwwwwww.....',
    '..wwwwwwwwww....',
    '..wwwwkwwwww....',
    '..wwwwkwwwww....',
    '..wwwwwwwwww....',
    '..dddddddddd....',
  ],
  {
    w: '#ffffff', h: '#c9c9c9', s: '#f2c79b', e: '#26221c',
    m: '#a83226', r: '#d94f3d', k: '#26221c', d: '#3a3230',
  },
);

// --- Ingredients (16x16 icons) -------------------------------------------
export const ING_SPRITES = {
  bun: makeSprite(
    [
      '.....bbbbbb.....',
      '...bbbbbbbbbb...',
      '..bbbbbbbbbbbb..',
      '..bssbssbssbsb..',
      '..bbbbbbbbbbbb..',
      '...bbbbbbbbbb...',
      '....bbbbbbbb....',
    ],
    { b: '#e0a458', s: '#fff6dd' },
  ),
  cheese: makeSprite(
    [
      '................',
      '..yyyyyyyyyyyy..',
      '..yhyyyyyyhyyy..',
      '..yyyyyhyyyyyy..',
      '..yyyyyyyyyyhy..',
      '..yhyyyyyyyyyy..',
      '..yyyyyyyyyyyy..',
      '................',
    ],
    { y: '#f2c531', h: '#d9a521' },
  ),
  sauce: makeSprite(
    [
      '.......ww.......',
      '.......ww.......',
      '......rrrr......',
      '.....rrrrrr.....',
      '.....rrrrrr.....',
      '.....rrrrrr.....',
      '.....rrrrrr.....',
      '....rrrrrrrr....',
    ],
    { w: '#fff6dd', r: '#d94f3d' },
  ),
  cup: makeSprite(
    [
      '.........ss.....',
      '........ss......',
      '....wwwwwwww....',
      '....wrrrrrrw....',
      '....wrrrrrrw....',
      '....wrrrrrrw....',
      '....wwwwwwww....',
      '.....wwwwww.....',
    ],
    { w: '#fff6dd', r: '#d94f3d', s: '#3d7ea6' },
  ),
  patty: makeSprite(
    [
      '................',
      '....pppppppp....',
      '..pppppppppppp..',
      '..pppppppppppp..',
      '..pppppppppppp..',
      '....pppppppp....',
    ],
    { p: '#d98a7a' },
  ),
  grilledPatty: makeSprite(
    [
      '................',
      '....bbbbbbbb....',
      '..bbgbbbbbgb....',
      '..bbbbbbbbbbbb..',
      '..bbgbbbbbgb....',
      '....bbbbbbbb....',
    ],
    { b: '#7a4a2b', g: '#4a2b1a' },
  ),
  chicken: makeSprite(
    [
      '......ww........',
      '.....wwww.......',
      '....pppppp......',
      '...pppppppp.....',
      '...pppppppp.....',
      '....pppppp......',
      '.....pppp.......',
    ],
    { w: '#fff6dd', p: '#f2b8a0' },
  ),
  grilledChicken: makeSprite(
    [
      '......ww........',
      '.....wwww.......',
      '....gggggg......',
      '...gggggggg.....',
      '...ggdggggg.....',
      '....gggggg......',
      '.....gggg.......',
    ],
    { w: '#fff6dd', g: '#d98a3c', d: '#a86428' },
  ),
  lettuce: makeSprite(
    [
      '......gg........',
      '....gggggg......',
      '...ggvggggg.....',
      '..ggggvggggg....',
      '..ggggggvggg....',
      '...gggggggg.....',
      '.....gggg.......',
    ],
    { g: '#4c9a4c', v: '#7bc47b' },
  ),
  choppedLettuce: makeSprite(
    [
      '................',
      '..gg..gg..gg....',
      '...gg..gg..g....',
      '..g.gg..gg......',
      '....gg..gg..g...',
      '..gg..g..gg.....',
      '................',
    ],
    { g: '#5cb85c' },
  ),
  tomato: makeSprite(
    [
      '.......gg.......',
      '......gggg......',
      '....rrrrrrrr....',
      '...rrrrrrrrrr...',
      '...rrrrrrrrrr...',
      '....rrrrrrrr....',
      '.....rrrrrr.....',
    ],
    { g: '#4c9a4c', r: '#d94f3d' },
  ),
  choppedTomato: makeSprite(
    [
      '................',
      '..rr...rr...r...',
      '..rrr..rr..rr...',
      '...rr...rrr.....',
      '..r.rr...rr.....',
      '................',
    ],
    { r: '#e05a4a' },
  ),
  potato: makeSprite(
    [
      '................',
      '.....bbbbbb.....',
      '...bbbbbbbbbb...',
      '...bbebbebbbb...',
      '...bbbbbbbbbb...',
      '....bbbbbbbb....',
      '................',
    ],
    { b: '#b98a5a', e: '#8a6a42' },
  ),
  fries: makeSprite(
    [
      '..y..y..y..y....',
      '..y..y..y..y....',
      '..y..y..y..y....',
      '..rrrrrrrrrr....',
      '..rrrrrrrrrr....',
      '..rrrrrrrrrr....',
      '..rrrrrrrrrr....',
      '...rrrrrrrr.....',
    ],
    { y: '#f2c531', r: '#d94f3d' },
  ),
  nuggets: makeSprite(
    [
      '................',
      '...ppp....pp....',
      '..ppppp..pppp...',
      '..ppppp..pppp...',
      '...ppp....pp....',
      '................',
    ],
    { p: '#f2d0a0' },
  ),
  friedNuggets: makeSprite(
    [
      '................',
      '...ggg....gg....',
      '..ggggg..gggg...',
      '..ggdgg..ggdg...',
      '...ggg....gg....',
      '................',
    ],
    { g: '#e0a03c', d: '#b57a28' },
  ),
  cola: makeSprite(
    [
      '.........ss.....',
      '........ss......',
      '....wwwwwwww....',
      '....wddddddw....',
      '....wdbddddw....',
      '....wddddbdw....',
      '....wwwwwwww....',
      '.....wwwwww.....',
    ],
    { w: '#d94f3d', d: '#3a2a2a', b: '#6b4a4a', s: '#fff6dd' },
  ),
  shake: makeSprite(
    [
      '....wwwwwwww....',
      '....wwwwwwww....',
      '....wssssssw....',
      '....wssssssw....',
      '....wssssssw....',
      '....wssssssw....',
      '....wwwwwwww....',
      '.....wwwwww.....',
    ],
    { w: '#fff6dd', s: '#8a5a3b' },
  ),
};

// --- Dishes on a plate (what the order board and the plate show) ---------
export const DISH_SPRITES = {
  shackBurger: makeSprite(
    [
      '.....bbbbbb.....',
      '...bbbbbbbbbb...',
      '..gggggggggggg..',
      '..pppppppppppp..',
      '..yyyyyyyyyyyy..',
      '..bbbbbbbbbbbb..',
      '...wwwwwwwwww...',
    ],
    { b: '#e0a458', g: '#4c9a4c', p: '#7a4a2b', y: '#f2c531', w: '#d8d8d8' },
  ),
  doubleStack: makeSprite(
    [
      '.....bbbbbb.....',
      '...bbbbbbbbbb...',
      '..pppppppppppp..',
      '..yyyyyyyyyyyy..',
      '..pppppppppppp..',
      '..yyyyyyyyyyyy..',
      '..bbbbbbbbbbbb..',
      '...wwwwwwwwww...',
    ],
    { b: '#e0a458', p: '#7a4a2b', y: '#f2c531', w: '#d8d8d8' },
  ),
  crispyClucker: makeSprite(
    [
      '.....bbbbbb.....',
      '...bbbbbbbbbb...',
      '..gggggggggggg..',
      '..gggggggggggg..',
      '..rrrrrrrrrrrr..',
      '..bbbbbbbbbbbb..',
      '...wwwwwwwwww...',
    ],
    { b: '#e0a458', g: '#d98a3c', r: '#d94f3d', w: '#d8d8d8' },
  ),
  goldenFries: makeSprite(
    [
      '..y..y..y..y....',
      '..y..y..y..y....',
      '..y..y..y..y....',
      '..rrrrrrrrrr....',
      '..rrrrrrrrrr....',
      '..rrrrrrrrrr....',
      '...wwwwwwwwww...',
    ],
    { y: '#f2c531', r: '#d94f3d', w: '#d8d8d8' },
  ),
  nuggyBites: makeSprite(
    [
      '...ggg....gg....',
      '..ggggg..gggg...',
      '..ggggg..gggg...',
      '...ggg....gg....',
      '.....rrrrrr.....',
      '...wwwwwwwwww...',
    ],
    { g: '#e0a03c', r: '#d94f3d', w: '#d8d8d8' },
  ),
  fizzyCola: makeSprite(
    [
      '.........ss.....',
      '........ss......',
      '....wwwwwwww....',
      '....wddddddw....',
      '....wdbddddw....',
      '....wwwwwwww....',
      '...wwwwwwwwww...',
    ],
    { w: '#d94f3d', d: '#3a2a2a', b: '#6b4a4a', s: '#fff6dd' },
  ),
  chocoShake: makeSprite(
    [
      '....wwwwwwww....',
      '....wwwwwwww....',
      '....wssssssw....',
      '....wssssssw....',
      '....wwwwwwww....',
      '...wwwwwwwwww...',
    ],
    { w: '#fff6dd', s: '#8a5a3b' },
  ),
};

// --- Utensils (the tools the user asked for, drawn in code) -------------
export const UTENSILS = {
  // Frying pan, as it sits on the grill.
  pan: makeSprite(
    [
      '................',
      '...kkkkkkkkk....',
      '..kkkkkkkkkkk...',
      '..kdddddddddk...',
      '..kkkkkkkkkkk...',
      '...kkkkkkkkk....',
      '............hhhh',
      '............hhhh',
    ],
    { k: '#2b2b2b', d: '#4a4a4a', h: '#8a5a3b' },
  ),
  // Chef's knife, as it rests on the chopping board.
  knife: makeSprite(
    [
      '..............ss',
      '............ssss',
      '..........ssss..',
      '........ssss....',
      '......ssss......',
      '....ssss........',
      '..hhhh..........',
      '..hhhh..........',
    ],
    { s: '#c9d4d8', h: '#3a3230' },
  ),
  // Spatula on the utensil rail.
  spatula: makeSprite(
    [
      '.......hh.......',
      '.......hh.......',
      '.......hh.......',
      '.....ssssss.....',
      '.....ssssss.....',
      '.....ssssss.....',
      '................',
    ],
    { h: '#8a5a3b', s: '#7d8b91' },
  ),
  // Ladle on the utensil rail.
  ladle: makeSprite(
    [
      '.......hh.......',
      '.......hh.......',
      '......oooo......',
      '.....oooooo.....',
      '.....oooooo.....',
      '......oooo......',
      '................',
    ],
    { h: '#8a5a3b', o: '#b9c4c9' },
  ),
  // Tongs on the utensil rail.
  tongs: makeSprite(
    [
      '....s......s....',
      '....s......s....',
      '....ss....ss....',
      '.....s....s.....',
      '.....s....s.....',
      '.....ss..ss.....',
      '................',
    ],
    { s: '#b9c4c9' },
  ),
  // Whisk on the utensil rail.
  whisk: makeSprite(
    [
      '.......hh.......',
      '.......hh.......',
      '......s..s......',
      '.....s....s.....',
      '.....s....s.....',
      '......s..s......',
      '.......ss.......',
    ],
    { h: '#8a5a3b', s: '#c9d4d8' },
  ),
};

// --- Drawer (the pantry drawer station, drawn in code) -------------------
// A drawer unit with two drawers and handles; drawn by kitchen.js from
// rectangles, but its handle + knob sprite lives here for reuse.
export const DRAWER_FACE = makeSprite(
  [
    'wwwwwwwwwwwwwwww',
    'w..............w',
    'w..hhhhhhhhhh..w',
    'w..............w',
    'wwwwwwwwwwwwwwww',
    'wwwwwwwwwwwwwwww',
    'w..............w',
    'w..hhhhhhhhhh..w',
    'w..............w',
    'wwwwwwwwwwwwwwww',
  ],
  { w: '#8a5a3b', h: '#5a3a22' },
);
