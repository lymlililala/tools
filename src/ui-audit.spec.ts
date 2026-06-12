/**
 * Full-site UI regression audit (chromium only).
 *
 * Traverses every tool page + the home / articles / category pages across
 * several viewports and both colour schemes, and fails if any page has:
 *   - horizontal page scroll / an element spilling past the viewport
 *   - text overflowing its own (non-clipping) box
 *   - an uncaught JS / console error
 *
 * Flagged pages also get a screenshot under shots/audit/ and a line in
 * shots/audit/report.jsonl for inspection.
 *
 * Run locally:  pnpm test:ui-audit:dev   (needs `pnpm dev` already running)
 * Run in CI:    pnpm test:ui-audit       (spins up the preview build)
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import { expect, test } from '@playwright/test';

// ── Routes: read every tool's path straight from src/tools/*/index.ts ────────
function collectToolPaths(): string[] {
  const toolsDir = join(process.cwd(), 'src/tools');
  const paths: string[] = [];
  for (const entry of readdirSync(toolsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }
    const index = join(toolsDir, entry.name, 'index.ts');
    if (!existsSync(index)) {
      continue;
    }
    const m = readFileSync(index, 'utf8').match(/path:\s*['"]([^'"]+)['"]/);
    if (m) {
      paths.push(m[1]);
    }
  }
  return [...new Set(paths)].sort();
}

const catSlugs = ['crypto', 'converter', 'web', 'images-and-videos', 'development', 'network', 'math', 'measurement', 'text', 'data'];
const routes = ['/', '/articles', ...catSlugs.map(s => `/c/${s}`), ...collectToolPaths()];

// ── Scenarios: viewport × colour scheme ──────────────────────────────────────
const scenarios = [
  { name: 'desktop', width: 1280, height: 1000, dark: false },
  { name: 'tablet', width: 768, height: 1024, dark: false },
  { name: 'mobile', width: 390, height: 844, dark: false },
  { name: 'desktop-dark', width: 1280, height: 1000, dark: true },
  { name: 'mobile-dark', width: 390, height: 844, dark: true },
];

// Local Chrome-for-Testing fallback (the test-runner's bundled build may be
// absent locally); in CI `playwright install` provides the default browser.
const localChrome = join(
  process.env.HOME || '',
  'Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
);
if (existsSync(localChrome)) {
  test.use({ launchOptions: { executablePath: localChrome } });
}

mkdirSync('shots/audit', { recursive: true });

for (const sc of scenarios) {
  for (const route of routes) {
    test(`audit ${sc.name} ${route}`, async ({ page }) => {
      test.setTimeout(60000);
      await page.setViewportSize({ width: sc.width, height: sc.height });
      // VueUse useDark persists the scheme in localStorage under this key.
      await page.addInitScript((dark) => {
        try {
          localStorage.setItem('vueuse-color-scheme', dark ? 'dark' : 'light');
        }
        catch { /* ignore */ }
      }, sc.dark);

      const jsErrors: string[] = [];
      const ignore = /favicon|404|net::|Failed to load resource|NotAllowedError|Permission denied|getUserMedia|user gesture/i;
      page.on('pageerror', (e) => {
        if (!ignore.test(String(e))) {
          jsErrors.push(String(e).slice(0, 300));
        }
      });
      page.on('console', (m) => {
        if (m.type() === 'error' && !ignore.test(m.text())) {
          jsErrors.push(`console: ${m.text().slice(0, 300)}`);
        }
      });

      await page.goto(route, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => page.goto(route, { waitUntil: 'load', timeout: 30000 }));
      await page.waitForTimeout(700);

      const issues = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const out: { type: string; detail: string }[] = [];
        const seen = new Set<string>();
        const describe = (el: Element) => {
          let s = el.tagName.toLowerCase();
          if (el.id) {
            s += `#${el.id}`;
          }
          else if (el.classList.length) {
            s += `.${[...el.classList].slice(0, 3).join('.')}`;
          }
          const t = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60);
          return `${s}${t ? ` "${t}"` : ''}`;
        };
        const isVisible = (el: Element) => {
          const st = getComputedStyle(el);
          if (st.display === 'none' || st.visibility === 'hidden' || +st.opacity === 0) {
            return false;
          }
          const r = el.getBoundingClientRect();
          return r.width > 1 && r.height > 1;
        };
        // True when some ancestor clips horizontal overflow (so the element's
        // own spill is not actually visible to the user).
        const clippedByAncestor = (el: Element) => {
          let p = el.parentElement;
          while (p && p !== document.body) {
            const o = getComputedStyle(p).overflowX;
            if (o === 'hidden' || o === 'auto' || o === 'scroll' || o === 'clip') {
              return true;
            }
            p = p.parentElement;
          }
          return false;
        };

        const docOverflow = document.documentElement.scrollWidth - vw;
        if (docOverflow > 4) {
          out.push({ type: 'page-hscroll', detail: `scrollWidth exceeds viewport by ${docOverflow}px` });
        }

        const all = document.querySelectorAll('body *');
        for (const el of all) {
          if (out.length > 25) {
            break;
          }
          if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName) || !isVisible(el)) {
            continue;
          }
          const r = el.getBoundingClientRect();
          if (r.right > vw + 4 && r.left < vw && !clippedByAncestor(el)) {
            const key = `vp:${describe(el)}`;
            if (!seen.has(key)) {
              seen.add(key);
              out.push({ type: 'beyond-viewport', detail: `${describe(el)} right=${Math.round(r.right)} vw=${vw}` });
            }
          }
          const st = getComputedStyle(el);
          if (st.overflowX === 'visible' && el.scrollWidth > el.clientWidth + 8 && el.children.length === 0 && (el.textContent || '').trim() && !clippedByAncestor(el)) {
            const key = `sp:${describe(el)}`;
            if (!seen.has(key)) {
              seen.add(key);
              out.push({ type: 'text-spill', detail: `${describe(el)} scrollW=${el.scrollWidth} clientW=${el.clientWidth}` });
            }
          }
        }
        return out;
      });

      if (issues.length || jsErrors.length) {
        const safe = `${route.replace(/[^a-z0-9-]/gi, '_') || 'home'}-${sc.name}`;
        const shot = `shots/audit/${safe}.png`;
        await page.screenshot({ path: shot, fullPage: false });
        appendFileSync('shots/audit/report.jsonl', `${JSON.stringify({ route, scenario: sc.name, issues, jsErrors, shot })}\n`);
      }
      expect.soft(issues, `UI issues on ${route} (${sc.name})`).toEqual([]);
      expect.soft(jsErrors, `JS errors on ${route} (${sc.name})`).toEqual([]);
    });
  }
}
