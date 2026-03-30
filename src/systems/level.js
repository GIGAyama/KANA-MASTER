// ==========================================
// レベルシステム
// 2学期（約200日）で最高レベルに到達できる設計
// ==========================================

/**
 * レベルテーブル
 * - 序盤は早く上がる（モチベーション維持）
 * - 中盤は安定したペース
 * - 終盤はマスタリーが必要
 *
 * 想定: 1日1セッション(~100-200 EXP) × 約200日 ≈ 25,000 EXP で最高レベル
 */
export const LEVEL_TABLE = [
  { level: 1,  exp: 0,      title: 'はじめのいっぽ',   icon: '🌱' },
  { level: 2,  exp: 50,     title: 'もじの たまご',     icon: '🥒' },
  { level: 3,  exp: 150,    title: 'おぼえ はじめ',     icon: '✏️' },
  { level: 4,  exp: 300,    title: 'ひらがな ならい',   icon: '📖' },
  { level: 5,  exp: 500,    title: 'もじの なかま',     icon: '🌼' },
  { level: 6,  exp: 750,    title: 'れんしゅう じょうず', icon: '💪' },
  { level: 7,  exp: 1050,   title: 'よみかき めばえ',   icon: '🌿' },
  { level: 8,  exp: 1400,   title: 'ことばの たね',     icon: '🌻' },
  { level: 9,  exp: 1800,   title: 'もじの たんけんか', icon: '🔍' },
  { level: 10, exp: 2300,   title: 'ひらがな はかせ',   icon: '🎓' },
  { level: 11, exp: 2900,   title: 'カタカナ はじめ',   icon: '📝' },
  { level: 12, exp: 3600,   title: 'もじの しょくにん', icon: '🔨' },
  { level: 13, exp: 4400,   title: 'ことばの たびびと', icon: '🗺️' },
  { level: 14, exp: 5300,   title: 'よみかき じょうたつ', icon: '📚' },
  { level: 15, exp: 6300,   title: 'もじの にんじゃ',   icon: '🥷' },
  { level: 16, exp: 7500,   title: 'ことばの まほうし', icon: '🪄' },
  { level: 17, exp: 8800,   title: 'カタカナ はかせ',   icon: '🏅' },
  { level: 18, exp: 10200,  title: 'もじの たつじん',   icon: '⭐' },
  { level: 19, exp: 11800,  title: 'ことばの けんし',   icon: '⚔️' },
  { level: 20, exp: 13500,  title: 'よみかき めいじん', icon: '🏆' },
  { level: 21, exp: 15400,  title: 'もじの せんせい',   icon: '👨‍🏫' },
  { level: 22, exp: 17500,  title: 'ことばの ゆうしゃ', icon: '🛡️' },
  { level: 23, exp: 19800,  title: 'もじの でんせつ',   icon: '🐉' },
  { level: 24, exp: 22300,  title: 'ことばの けんじゃ', icon: '🧙' },
  { level: 25, exp: 25000,  title: 'ひらカタ マスター', icon: '👑' },
];

const MAX_LEVEL = LEVEL_TABLE[LEVEL_TABLE.length - 1];

/**
 * 累計EXPからレベル情報を取得
 */
export function getLevelInfo(totalExp) {
  let current = LEVEL_TABLE[0];
  for (let i = LEVEL_TABLE.length - 1; i >= 0; i--) {
    if (totalExp >= LEVEL_TABLE[i].exp) {
      current = LEVEL_TABLE[i];
      break;
    }
  }

  const isMaxLevel = current.level === MAX_LEVEL.level;
  const next = isMaxLevel ? null : LEVEL_TABLE[current.level]; // level is 1-indexed, so index = level
  const expInLevel = totalExp - current.exp;
  const expForNext = next ? next.exp - current.exp : 0;
  const progress = next ? Math.min(expInLevel / expForNext, 1) : 1;

  return {
    level: current.level,
    title: current.title,
    icon: current.icon,
    expInLevel,
    expForNext,
    progress,
    isMaxLevel,
    totalExp,
  };
}

/**
 * セッション前後でレベルアップしたか判定
 */
export function checkLevelUp(oldExp, newExp) {
  const oldLevel = getLevelInfo(oldExp).level;
  const newLevel = getLevelInfo(newExp).level;
  if (newLevel > oldLevel) {
    return getLevelInfo(newExp);
  }
  return null;
}
