// gta6-clipper-10 entry (Node 22, standard library only).
//
// The entry is the YouTube video itself: an AI agent found the GTA 6
// moment in Rockstar's Launch Trailer, cut it into a vertical clip,
// pitched make.fun on screen, and uploaded it as a public Short. This
// program hands the video's address to the gate: it reads VIDEO.json
// from the repository root, checks it really names a YouTube video,
// and writes it to the output directory, where the gate reads it.
// That is all the program has to do; nothing it writes about the
// video is scored.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// A YouTube video address: a Short, a watch page, or a youtu.be link.
// The video id is the 11-character token at the end of the address.
const VIDEO_URL =
  /^https:\/\/(www\.youtube\.com\/(shorts\/|watch\?v=)|youtu\.be\/)([A-Za-z0-9_-]{11})([?&#].*)?$/;

function loadVideoAddress(botDir: string): string | null {
  const raw = readFileSync(join(botDir, 'VIDEO.json'), 'utf8');
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== 'object' || parsed === null || !('url' in parsed)) {
    throw new Error('VIDEO.json must be an object with a "url" string');
  }
  const url = (parsed as { url: unknown }).url;
  if (typeof url !== 'string') {
    throw new Error('VIDEO.json "url" must be a string');
  }
  if (url === '') {
    throw new Error('VIDEO.json "url" must not be empty');
  }
  // The starter's placeholder is not a video, but it is not this
  // program's job to refuse it: pass it through unchanged and let the
  // gate refuse it (valid 0), exactly as the starter's copy does. The
  // program must still complete, placeholder or not.
  if (url === 'https://www.youtube.com/shorts/<id>') {
    return null;
  }
  const match = VIDEO_URL.exec(url);
  if (!match) {
    throw new Error(`VIDEO.json does not name a YouTube video: ${url}`);
  }
  // Hand the gate one shape whatever the uploader pasted: the Shorts form.
  return `https://www.youtube.com/shorts/${match[3]}`;
}

function main(): void {
  const url = loadVideoAddress(BOT_DIR);
  mkdirSync(OUTPUT_DIR, { recursive: true });
  // A placeholder passes through byte for byte; a real address is
  // written back in its canonical Shorts form.
  const out = url === null
    ? readFileSync(join(BOT_DIR, 'VIDEO.json'), 'utf8')
    : JSON.stringify({ url }) + '\n';
  writeFileSync(join(OUTPUT_DIR, 'VIDEO.json'), out, 'utf8');
}

try {
  main();
} catch (err) {
  console.error(`gta6-clipper-10: ${(err as Error).message}`);
  process.exit(1);
}
