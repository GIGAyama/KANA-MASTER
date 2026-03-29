export const KANA_DATA = [
  // --- ひらがな（清音） ---
  { id: "h_a", char: "あ", type: "hiragana", roman: "a", tags: ["vowel"] },
  { id: "h_i", char: "い", type: "hiragana", roman: "i", tags: ["vowel"] },
  { id: "h_u", char: "う", type: "hiragana", roman: "u", tags: ["vowel"] },
  { id: "h_e", char: "え", type: "hiragana", roman: "e", tags: ["vowel"] },
  { id: "h_o", char: "お", type: "hiragana", roman: "o", tags: ["vowel"] },
  
  { id: "h_ka", char: "か", type: "hiragana", roman: "ka", tags: ["consonant"] },
  { id: "h_ki", char: "き", type: "hiragana", roman: "ki", tags: ["consonant"] },
  { id: "h_ku", char: "く", type: "hiragana", roman: "ku", tags: ["consonant"] },
  { id: "h_ke", char: "け", type: "hiragana", roman: "ke", tags: ["consonant"] },
  { id: "h_ko", char: "こ", type: "hiragana", roman: "ko", tags: ["consonant"] },
  
  { id: "h_sa", char: "さ", type: "hiragana", roman: "sa", tags: ["consonant"] },
  { id: "h_shi", char: "し", type: "hiragana", roman: "shi", tags: ["consonant"] },
  { id: "h_su", char: "す", type: "hiragana", roman: "su", tags: ["consonant"] },
  { id: "h_se", char: "せ", type: "hiragana", roman: "se", tags: ["consonant"] },
  { id: "h_so", char: "そ", type: "hiragana", roman: "so", tags: ["consonant"] },
  
  { id: "h_ta", char: "た", type: "hiragana", roman: "ta", tags: ["consonant"] },
  { id: "h_chi", char: "ち", type: "hiragana", roman: "chi", tags: ["consonant"] },
  { id: "h_tsu", char: "つ", type: "hiragana", roman: "tsu", tags: ["consonant"] },
  { id: "h_te", char: "て", type: "hiragana", roman: "te", tags: ["consonant"] },
  { id: "h_to", char: "と", type: "hiragana", roman: "to", tags: ["consonant"] },
  
  { id: "h_na", char: "な", type: "hiragana", roman: "na", tags: ["consonant"] },
  { id: "h_ni", char: "に", type: "hiragana", roman: "ni", tags: ["consonant"] },
  { id: "h_nu", char: "ぬ", type: "hiragana", roman: "nu", tags: ["consonant"] },
  { id: "h_ne", char: "ね", type: "hiragana", roman: "ne", tags: ["consonant"] },
  { id: "h_no", char: "の", type: "hiragana", roman: "no", tags: ["consonant"] },

  { id: "h_ha", char: "は", type: "hiragana", roman: "ha", tags: ["consonant"] },
  { id: "h_hi", char: "ひ", type: "hiragana", roman: "hi", tags: ["consonant"] },
  { id: "h_fu", char: "ふ", type: "hiragana", roman: "fu", tags: ["consonant"] },
  { id: "h_he", char: "へ", type: "hiragana", roman: "he", tags: ["consonant"] },
  { id: "h_ho", char: "ほ", type: "hiragana", roman: "ho", tags: ["consonant"] },

  { id: "h_ma", char: "ま", type: "hiragana", roman: "ma", tags: ["consonant"] },
  { id: "h_mi", char: "み", type: "hiragana", roman: "mi", tags: ["consonant"] },
  { id: "h_mu", char: "む", type: "hiragana", roman: "mu", tags: ["consonant"] },
  { id: "h_me", char: "め", type: "hiragana", roman: "me", tags: ["consonant"] },
  { id: "h_mo", char: "も", type: "hiragana", roman: "mo", tags: ["consonant"] },

  { id: "h_ya", char: "や", type: "hiragana", roman: "ya", tags: ["consonant"] },
  { id: "h_yu", char: "ゆ", type: "hiragana", roman: "yu", tags: ["consonant"] },
  { id: "h_yo", char: "よ", type: "hiragana", roman: "yo", tags: ["consonant"] },

  { id: "h_ra", char: "ら", type: "hiragana", roman: "ra", tags: ["consonant"] },
  { id: "h_ri", char: "り", type: "hiragana", roman: "ri", tags: ["consonant"] },
  { id: "h_ru", char: "る", type: "hiragana", roman: "ru", tags: ["consonant"] },
  { id: "h_re", char: "れ", type: "hiragana", roman: "re", tags: ["consonant"] },
  { id: "h_ro", char: "ろ", type: "hiragana", roman: "ro", tags: ["consonant"] },

  { id: "h_wa", char: "わ", type: "hiragana", roman: "wa", tags: ["consonant"] },
  { id: "h_o_particle", char: "を", type: "hiragana", roman: "o", tags: ["consonant", "particle"] },
  { id: "h_nn", char: "ん", type: "hiragana", roman: "n", tags: ["consonant"] },

  // --- カタカナ（プロトタイプ用一部抜粋。必要に応じて追加拡充する） ---
  { id: "k_a", char: "ア", type: "katakana", roman: "a", tags: ["vowel", "katakana"] },
  { id: "k_i", char: "イ", type: "katakana", roman: "i", tags: ["vowel", "katakana"] },
  { id: "k_u", char: "ウ", type: "katakana", roman: "u", tags: ["vowel", "katakana"] },
  { id: "k_e", char: "エ", type: "katakana", roman: "e", tags: ["vowel", "katakana"] },
  { id: "k_o", char: "オ", type: "katakana", roman: "o", tags: ["vowel", "katakana"] },
];

/** IDからデータを取得するヘルパー関数 */
export function getKanaDataById(id) {
  return KANA_DATA.find(k => k.id === id);
}

/** 文字からデータを取得するヘルパー関数 */
export function getKanaDataByChar(char) {
  return KANA_DATA.find(k => k.char === char);
}
