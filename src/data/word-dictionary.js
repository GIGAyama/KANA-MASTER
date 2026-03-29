// word-dictionary.js
// ことばあつめでアンロック可能な単語（語彙）のリスト

export const WORD_DICTIONARY = [
  // 2文字の言葉
  { id: "w_ai", word: "あい", category: "others", meaning: "愛情のこと。大切に思う気持ち", requiredChars: ["あ", "い"], unlockText: "あい（愛）" },
  { id: "w_ao", word: "あお", category: "color", meaning: "青色", requiredChars: ["あ", "お"], unlockText: "あお（青）" },
  { id: "w_aka", word: "あか", category: "color", meaning: "赤色", requiredChars: ["あ", "か"], unlockText: "あか（赤）" },
  { id: "w_asa", word: "あさ", category: "time", meaning: "朝。おひさまが昇るじかん", requiredChars: ["あ", "さ"], unlockText: "あさ（朝）" },
  { id: "w_ashi", word: "あし", category: "body", meaning: "足。歩くときに使う", requiredChars: ["あ", "し"], unlockText: "あし（足）" },
  { id: "w_ike", word: "いけ", category: "nature", meaning: "池。水がたまっているところ", requiredChars: ["い", "け"], unlockText: "いけ（池）" },
  { id: "w_isu", word: "いす", category: "items", meaning: "座るためのもの", requiredChars: ["い", "す"], unlockText: "いす（椅子）" },
  { id: "w_ushi", word: "うし", category: "animal", meaning: "おおきな動物。ミルクを出す", requiredChars: ["う", "し"], unlockText: "うし（牛）" },
  { id: "w_uta", word: "うた", category: "others", meaning: "歌。声をだして楽しむ", requiredChars: ["う", "た"], unlockText: "うた（歌）" },
  { id: "w_eki", word: "えき", category: "building", meaning: "電車に乗るところ", requiredChars: ["え", "き"], unlockText: "えき（駅）" },
  
  // 3文字の言葉
  { id: "w_atama", word: "あたま", category: "body", meaning: "からだの一ばん上にある", requiredChars: ["あ", "た", "ま"], unlockText: "あたま（頭）" },
  { id: "w_usagi", word: "うさぎ", category: "animal", meaning: "耳が長くてピョンピョンはねる", requiredChars: ["う", "さ", "き"], unlockText: "うさぎ（兎）" }, // 濁点対応は後で拡張
  { id: "w_sakura", word: "さくら", category: "nature", meaning: "春に咲くピンクの花", requiredChars: ["さ", "く", "ら"], unlockText: "さくら（桜）" },
  { id: "w_tsukue", word: "つくえ", category: "items", meaning: "勉強したり、ものをのせる", requiredChars: ["つ", "く", "え"], unlockText: "つくえ（机）" },
  { id: "w_tokei", word: "とけい", category: "items", meaning: "じかんを見るもの", requiredChars: ["と", "け", "い"], unlockText: "とけい（時計）" },
  { id: "w_megane", word: "めがね", category: "items", meaning: "目がよく見えるようにかける", requiredChars: ["め", "か", "ね"], unlockText: "めがね（眼鏡）" },

  // 以降、拡充予定
];

/** アンロック可能な単語一覧を取得 */
export function getUnlockedWords(ownedChars) {
  // ownedChars は所有している文字のSet または配列とする
  const ownedSet = new Set(ownedChars);
  return WORD_DICTIONARY.filter(wordData => 
    wordData.requiredChars.every(char => ownedSet.has(char))
  );
}

/** 単語が有効（作成可能か）どうかをチェックする
 *  @param {string[]} inputChars - [ "あ", "お" ] などの文字配列
 *  @returns {object|null} 見つかれば単語データ、見つからなければ null
 */
export function checkWordMatch(inputChars) {
  const wordString = inputChars.join("");
  return WORD_DICTIONARY.find(w => w.word === wordString) || null;
}
