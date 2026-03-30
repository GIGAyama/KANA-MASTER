// ==========================================
// KanjiVG SVG データの取得・パース・キャッシュ
// 三層キャッシュ: メモリ → IndexedDB → ネットワーク
// タイムアウト・リトライ・指数バックオフ対応
// ==========================================
import { idbGet, idbSet, idbGetAllKeys, migrateFromLocalStorage } from './idb-cache';
import { KANA_VG } from '../constants/gameConfig';

const LEGACY_STORAGE_KEY = 'kana_vg_cache';

/**
 * キャッシュ値の形式: { paths: string[], viewBoxSize: number }
 * v1 (旧形式) は string[] だったため、配列なら旧形式と判定して無視する
 * @type {Map<string, { paths: string[], viewBoxSize: number }>}
 */
const memoryCache = new Map();

// 起動時に localStorage → IndexedDB へ移行（非同期・失敗無視）
migrateFromLocalStorage(LEGACY_STORAGE_KEY);

/**
 * タイムアウト付きfetch
 * @param {string} url
 * @param {number} timeout - タイムアウト(ms)
 * @returns {Promise<Response>}
 */
function fetchWithTimeout(url, timeout) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timeoutId));
}

/**
 * 指数バックオフ付きリトライfetch
 * @param {string} url
 * @param {number} maxRetries
 * @param {number} timeout
 * @returns {Promise<Response>}
 * @throws {Error} 全リトライ失敗時
 */
async function fetchWithRetry(url, maxRetries, timeout) {
  let lastError;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetchWithTimeout(url, timeout);
      if (res.ok) return res;
      lastError = new Error(`HTTP ${res.status}`);
    } catch (e) {
      lastError = e;
    }
    if (attempt < maxRetries - 1) {
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }
  throw lastError;
}

/**
 * SVGテキストからストロークパスを抽出する
 *
 * KanjiVG SVG の構造:
 *   - 各ストロークは <path> 要素として格納
 *   - viewBox は 0 0 109 109
 *   - d属性を持つ全 <path> 要素がストロークに対応
 *
 * @param {string} svgText - SVG文字列
 * @returns {{ paths: string[], viewBoxSize: number }} ストロークパスと viewBox サイズ
 */
function extractPathStrings(svgText) {
  const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');

  // viewBox サイズを取得（KanjiVG は 109×109）
  const svgEl = doc.querySelector('svg');
  const vbParts = svgEl?.getAttribute('viewBox')?.split(/\s+/).map(Number);
  const viewBoxSize = (vbParts && vbParts.length >= 3) ? vbParts[2] : 109;

  // KanjiVG: 全 <path> 要素の d 属性を取得
  const paths = Array.from(doc.querySelectorAll('path'))
    .map(p => p.getAttribute('d'))
    .filter(Boolean);

  return { paths, viewBoxSize };
}

/**
 * path文字列配列をstrokeData（正規化座標のポイント群）に変換する
 * @param {string[]} pathStrings
 * @param {number} viewBoxSize - SVG の viewBox サイズ（正規化に使用）
 * @returns {Array<{s: {x: number, y: number}, e: {x: number, y: number}, points: Array<{x: number, y: number}>}>}
 */
function buildStrokeData(pathStrings, viewBoxSize) {
  const size = viewBoxSize || 109;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  svg.appendChild(pathEl);
  document.body.appendChild(svg);
  try {
    return pathStrings.map(d => {
      pathEl.setAttribute('d', d);
      const len = pathEl.getTotalLength();
      const points = [];
      for (let i = 0; i <= len; i += KANA_VG.SAMPLE_INTERVAL) {
        const pt = pathEl.getPointAtLength(i);
        points.push({ x: pt.x / size, y: pt.y / size });
      }
      const endPt = pathEl.getPointAtLength(len);
      points.push({ x: endPt.x / size, y: endPt.y / size });
      const startPt = pathEl.getPointAtLength(0);
      return {
        s: { x: startPt.x / size, y: startPt.y / size },
        e: { x: endPt.x / size, y: endPt.y / size },
        points,
      };
    });
  } finally {
    document.body.removeChild(svg);
  }
}

/**
 * 漢字のKanjiVGデータを取得する
 *
 * キャッシュ戦略:
 * 1. メモリキャッシュ（即返却）
 * 2. IndexedDBキャッシュ（容量制限なし）
 * 3. ネットワーク取得（リトライ付き）
 *
 * @param {string} char - 漢字1文字
 * @returns {Promise<{ paths: string[], strokeData: Array<{s: {x: number, y: number}, e: {x: number, y: number}, points: Array}> }>}
 * @throws {Error} 全リトライ失敗時
 */
export async function fetchKanaVg(char) {
  // KanjiVG のファイル名はUnicodeの16進数（5桁ゼロパディング）
  const fileId = char.charCodeAt(0).toString(16).padStart(5, '0');

  // 1. メモリキャッシュ（新形式 { paths, viewBoxSize } のみ有効）
  if (memoryCache.has(fileId)) {
    const cached = memoryCache.get(fileId);
    if (cached && cached.paths && cached.viewBoxSize) {
      return { paths: cached.paths, viewBoxSize: cached.viewBoxSize, strokeData: buildStrokeData(cached.paths, cached.viewBoxSize) };
    }
    // 旧形式 → 無効化
    memoryCache.delete(fileId);
  }

  // 2. IndexedDB キャッシュ（新形式のみ有効、旧形式の string[] は無視）
  const idbCached = await idbGet(fileId);
  if (idbCached && idbCached.paths && idbCached.viewBoxSize) {
    memoryCache.set(fileId, idbCached);
    return { paths: idbCached.paths, viewBoxSize: idbCached.viewBoxSize, strokeData: buildStrokeData(idbCached.paths, idbCached.viewBoxSize) };
  }

  // 3. ネットワーク取得（リトライ付き）
  const res = await fetchWithRetry(
    `${KANA_VG.CDN_URL}/${fileId}.svg`,
    KANA_VG.MAX_RETRIES,
    KANA_VG.FETCH_TIMEOUT
  );
  const text = await res.text();
  const { paths, viewBoxSize } = extractPathStrings(text);

  // キャッシュ保存（新形式: { paths, viewBoxSize }）
  const cacheValue = { paths, viewBoxSize };
  memoryCache.set(fileId, cacheValue);
  idbSet(fileId, cacheValue);

  return { paths, viewBoxSize, strokeData: buildStrokeData(paths, viewBoxSize) };
}

/**
 * 指定された漢字リストのKanjiVG SVGデータをバックグラウンドで事前キャッシュする
 * オンライン時に呼び出し、オフライン学習に備える
 *
 * @param {Array<{char: string}>} kanjiList - 漢字オブジェクトの配列
 * @returns {Promise<{cached: number, total: number}>} キャッシュ結果
 */
export async function prefetchKanaVg(kanaList) {
  // 既にキャッシュ済みのキーを取得
  const cachedKeys = new Set(await idbGetAllKeys());
  const uncached = kanaList.filter(k => {
    const fileId = k.char.charCodeAt(0).toString(16).padStart(5, '0');
    // メモリ内の新形式キャッシュがあればスキップ
    const mem = memoryCache.get(fileId);
    if (mem && mem.paths && mem.viewBoxSize) return false;
    // IndexedDB にキーがあっても旧形式の可能性があるため再取得対象とする
    // （ネットワーク取得時に新形式で上書きされる）
    return !mem;
  });

  let cached = kanaList.length - uncached.length;
  for (const k of uncached) {
    // オフラインになったら中断
    if (!navigator.onLine) break;
    const fileId = k.char.charCodeAt(0).toString(16).padStart(5, '0');
    try {
      const res = await fetchWithTimeout(
        `${KANA_VG.CDN_URL}/${fileId}.svg`,
        KANA_VG.FETCH_TIMEOUT
      );
      if (res.ok) {
        const text = await res.text();
        const { paths, viewBoxSize } = extractPathStrings(text);
        const cacheValue = { paths, viewBoxSize };
        memoryCache.set(fileId, cacheValue);
        await idbSet(fileId, cacheValue);
        cached++;
      }
    } catch {
      // 個別の失敗は無視して次へ
    }
    // サーバー負荷軽減のため少し間隔を空ける
    await new Promise(r => setTimeout(r, 50));
  }
  return { cached, total: kanaList.length };
}

/**
 * キャッシュ済み漢字数を取得する
 * @returns {Promise<number>}
 */
export async function getCachedKanjiCount() {
  const keys = await idbGetAllKeys();
  return keys.length;
}
