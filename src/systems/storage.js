// ==========================================
// ストレージAPI (ひらがな・カタカナマスター版)
// ==========================================
import { KANA_DATA } from '../data/kana-data.js';

const STORAGE_KEY = 'hirakata_master_v1';
let _saveDebounceTimer = null;

export const StorageAPI = {
  safeGet: (key, fallback) => {
    try {
      const v = window.localStorage.getItem(key);
      if (v === null) return fallback;
      return JSON.parse(v);
    } catch {
      return fallback;
    }
  },

  safeSet: (key, val) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(val));
      return true;
    } catch {
      return false;
    }
  },

  saveStats: (stats) => {
    if (_saveDebounceTimer) clearTimeout(_saveDebounceTimer);
    _saveDebounceTimer = setTimeout(() => {
      StorageAPI.safeSet(STORAGE_KEY, stats);
    }, 400);
  },

  saveStatsImmediate: (stats) => {
    if (_saveDebounceTimer) {
      clearTimeout(_saveDebounceTimer);
      _saveDebounceTimer = null;
    }
    StorageAPI.safeSet(STORAGE_KEY, stats);
  },

  getStats: () => {
    let stats = StorageAPI.safeGet(STORAGE_KEY, null);

    if (!stats) {
      stats = {
        totalExp: 0,
        kanaStats: {},
        unlockedWords: [],
      };
    }

    // デフォルト補完
    if (!stats.kanaStats) stats.kanaStats = {};
    if (!stats.unlockedWords) stats.unlockedWords = [];

    // データ整合性(存在しない文字の削除)
    const validIds = new Set(KANA_DATA.map(k => k.id));
    Object.keys(stats.kanaStats).forEach(id => {
      if (!validIds.has(id)) delete stats.kanaStats[id];
    });

    return stats;
  },
};
