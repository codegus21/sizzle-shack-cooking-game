// Sizzle Shack — a fast-food kitchen game for make.fun's
// "Make the best cooking game" bounty (best-cooking-game-20261125-0137).
//
// The game itself is game/: plain static files a desktop browser loads
// offline (game/index.html and its ES modules, no library, no network).
// This program hands it in: it copies game/ and screenshots/ from beside
// this file to /output and writes /output/dossier.json, the summary the
// judge reads, with the vendored make.fun library (vendor/makefun-game.ts).
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// The four screenshots were staged by the game's own code, not by hand:
//   http://localhost:8080/?shot=kitchen&seed=1   — the full kitchen, order board
//   http://localhost:8080/?shot=counter&seed=1   — ingredients on the counter
//   http://localhost:8080/?shot=assembly&seed=1 — a dish mid-assembly
//   http://localhost:8080/?shot=serve&seed=1    — the plate, ready to serve
// Each ?shot= freezes that scene (game/src/shots.js) so the render is
// deterministic; the screenshots in screenshots/ are those four renders.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes
// the bytes; the others refuse an entry the scorer would refuse — more than
// 4 screenshots or one over 256 KiB; more than 993 files in game/ or 48 MiB
// of game files in all, or a path under game/ over 1000 bytes. game/ counts
// beside /output's own 1000-entry cap, its screenshots/ and dossier.json.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
