// GitHub Pages 배포용 빌드: 소스를 ./build 로 복사하고 공유 URL 등 환경값을 주입한다.
// 사용: npm run build   (deploy.yml 이 `npm install` → `npm run build` → ./build 업로드)
import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'build');

// 1) 환경값: .env (로컬) < 실제 환경변수 (CI, 저장소 Variables)
function loadEnvFile(file) {
  if (!existsSync(file)) return {};
  const env = {};
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (!m || line.trim().startsWith('#')) continue;
    env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
  return env;
}
const env = { ...loadEnvFile(join(root, '.env')) };
for (const [k, v] of Object.entries(process.env)) if (v) env[k] = v;

// 2) 서비스 URL: SITE_URL 이 없으면 GitHub Actions 의 GITHUB_REPOSITORY 로 Pages 주소를 만든다.
function resolveSiteUrl() {
  let url = (env.SITE_URL || '').trim();
  if (!url && env.GITHUB_REPOSITORY) {
    const [owner, repo] = env.GITHUB_REPOSITORY.split('/');
    url = repo.toLowerCase() === `${owner.toLowerCase()}.github.io`
      ? `https://${owner}.github.io/`
      : `https://${owner}.github.io/${repo}/`;
  }
  if (url && !url.endsWith('/')) url += '/';
  return url;
}
const siteUrl = resolveSiteUrl();
const rsvpFormUrl = (env.RSVP_FORM_URL || '').trim();
if (!siteUrl) console.warn('[build] SITE_URL 이 비어 있습니다. 공유/링크 복사는 현재 주소를 사용하고 OG 이미지는 상대 경로로 남습니다.');

// 3) 정적 파일 복사 (원본 대용량 사진 등은 제외)
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const SKIP_IMAGES = [/^gallery-\d+\.jpg$/i, /^LOWE/i, /^naver_map/i, /^gallery-placeholder/i];
const copy = (p) => cpSync(join(root, p), join(out, p), {
  recursive: true,
  filter: (src) => {
    const rel = relative(join(root, p), src).split(sep);
    return !(p === 'images' && rel.length === 1 && SKIP_IMAGES.some((re) => re.test(rel[0])));
  },
});
for (const p of ['style.css', 'script.js', 'images', 'audio']) if (existsSync(join(root, p))) copy(p);
writeFileSync(join(out, '.nojekyll'), '');

// 4) index.html: OG 주소/이미지를 절대 경로로 (카카오톡 미리보기에 필요)
let html = readFileSync(join(root, 'index.html'), 'utf8');
if (siteUrl) {
  html = html
    .replace('<meta property="og:url" content="">', `<meta property="og:url" content="${siteUrl}">`)
    .replace(/(property="og:image" content=")images\//, `$1${siteUrl}images/`)
    .replace(/(name="twitter:image" content=")images\//, `$1${siteUrl}images/`)
    .replace('</head>', `  <link rel="canonical" href="${siteUrl}">\n</head>`);
}
writeFileSync(join(out, 'index.html'), html);

// 5) 런타임 설정
writeFileSync(join(out, 'config.js'), `window.APP_CONFIG = ${JSON.stringify({ siteUrl, rsvpFormUrl })};\n`);
console.log(`[build] done → build/  (siteUrl=${siteUrl || '(none)'}, rsvp=${rsvpFormUrl ? 'set' : 'unset'})`);
