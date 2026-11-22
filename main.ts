// A working best-game-01 entry (Node 22, standard library only): the game is this directory's
// game/ folder, plain static files a desktop browser loads offline (game/index.html and its ES
// modules, no library and no network request), and the program hands it in. It copies game/ and
// screenshots/ from beside this file to /output and writes /output/dossier.json, the summary the
// judge reads, with the vendored make.fun library. A starting point, not a winner: Block Dodger, a
// plain 2D canvas game where a paddle dodges falling blocks and catches coins, with a title screen,
// score, lives and levels, game over and restart, flat colours and no sound. Build your own game
// (any genre, any library you vendor under game/, or none), put your 3 or 4 PNG or JPEG screenshots
// in screenshots/ (the first by name is the cover) and run it.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync, readdirSync, statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in game/ or 48 MiB of game
// files, in all, or a path under game/ over 1000 bytes: game/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
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

// Manifest generation for EMBER COURT
function generateManifest(outputDir) {
  const gameDir = join(outputDir, 'game');
  const screenshotsDir = join(outputDir, 'screenshots');
  const manifest = [];
  let totalBytes = 0;
  let screenshotCount = 0;
  
  // Walk game directory
  if (existsSync(gameDir)) {
    const walk = (dir) => {
      const files = readdirSync(dir);
      for (const file of files) {
        const fullPath = join(dir, file);
        const stat = statSync(fullPath);
        if (stat.isFile()) {
          const relativePath = fullPath.replace(outputDir + '/', '');
          const content = readFileSync(fullPath);
          const hash = createHash('sha256').update(content).digest('hex');
          manifest.push({
            path: relativePath,
            size: stat.size,
            sha256: hash
          });
          totalBytes += stat.size;
        } else if (stat.isDirectory()) {
          walk(fullPath);
        }
      }
    };
    walk(gameDir);
  }
  
  // Count screenshots
  if (existsSync(screenshotsDir)) {
    screenshotCount = readdirSync(screenshotsDir).filter(f => 
      f.match(/\.(png|jpe?g)$/i)
    ).length;
  }
  
  // Write manifest
  writeFileSync(join(outputDir, 'build-manifest.json'), JSON.stringify(manifest, null, 2));
  
  // Validate gate caps
  const gameFiles = manifest.filter(f => f.path.startsWith('game/')).length;
  const gameBytes = manifest.filter(f => f.path.startsWith('game/')).reduce((sum, f) => sum + f.size, 0);
  const screenshotBytes = manifest.filter(f => f.path.startsWith('screenshots/')).reduce((sum, f) => sum + f.size, 0);
  
  // Validate requirements
  if (gameFiles > 993) throw new Error(`Game files cap exceeded: ${gameFiles} > 993`);
  if (gameBytes > 50331648) throw new Error(`Game bytes cap exceeded: ${gameBytes} > 50331648`);
  if (screenshotCount > 4) throw new Error(`Screenshots cap exceeded: ${screenshotCount} > 4`);
  if (screenshotBytes > 262144) throw new Error(`Screenshot bytes cap exceeded: ${screenshotBytes} > 262144`);
  
  // Validate dossier exists
  if (!existsSync(join(outputDir, 'dossier.json'))) {
    throw new Error('dossier.json missing');
  }
  
  // Log stamp
  const manifestHash = createHash('sha256').update(JSON.stringify(manifest)).digest('hex');
  console.log(`EMBER COURT · ${gameFiles} game files · ${gameBytes} bytes · manifest sha256 ${manifestHash}`);
  console.log(`EMBER COURT · screenshots ${screenshotCount} · dossier ok`);
}

// Generate manifest after dossier is written
generateManifest(out);

