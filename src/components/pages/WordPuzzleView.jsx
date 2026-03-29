import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Star, Trash2 } from 'lucide-react';
import { audioCtrl } from '../../systems/audio';
import { checkWordMatch } from '../../data/word-dictionary';
import { KANA_DATA } from '../../data/kana-data';
import { StorageAPI } from '../../systems/storage';

export default function WordPuzzleView({ setView, stats, setStats }) {
  const [selectedChars, setSelectedChars] = useState([]);
  const [showResult, setShowResult] = useState(null); // null, { success: true, word: object }, { success: false }

  // 所有している文字を取得
  const ownedChars = useMemo(() => {
    const chars = [];
    if (!stats.kanaStats) return chars;
    KANA_DATA.forEach(k => {
      const s = stats.kanaStats[k.id];
      if (s && s.status !== 'new') {
        chars.push(k.char);
      }
    });
    return chars;
  }, [stats.kanaStats]);

  const handleCharClick = (char) => {
    if (selectedChars.length >= 6) return; // 最大文字数制限
    audioCtrl.playSE('click');
    setSelectedChars(prev => [...prev, char]);
    setShowResult(null);
  };

  const handleBackspace = () => {
    if (selectedChars.length === 0) return;
    audioCtrl.playSE('click');
    setSelectedChars(prev => prev.slice(0, -1));
    setShowResult(null);
  };

  const handleClear = () => {
    audioCtrl.playSE('click');
    setSelectedChars([]);
    setShowResult(null);
  };

  const handleSubmit = () => {
    if (selectedChars.length === 0) return;
    
    const match = checkWordMatch(selectedChars);
    if (match) {
      audioCtrl.playSE('level_up');
      setShowResult({ success: true, word: match });
      
      // 未解放なら登録
      if (!stats.unlockedWords?.includes(match.id)) {
        setStats(prev => {
          const newStats = {
            ...prev,
            unlockedWords: [...(prev.unlockedWords || []), match.id]
          };
          StorageAPI.saveStatsImmediate(newStats);
          return newStats;
        });
      }
      
      // 数秒後にクリア
      setTimeout(() => {
        setSelectedChars([]);
        setShowResult(null);
      }, 2500);

    } else {
      audioCtrl.playSE('stamp_bad');
      setShowResult({ success: false });
    }
  };

  const isUnlocked = (wordId) => stats.unlockedWords?.includes(wordId);

  return (
    <div className="flex flex-col h-full bg-white/50 backdrop-blur rounded-3xl p-4 md:p-6 shadow-sm border border-white max-w-3xl mx-auto w-full">
      <header className="flex items-center justify-between mb-4 pb-2 border-b-2 border-dashed border-gray-300">
        <button
          onClick={() => { audioCtrl.playSE('click'); setView('home'); }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-bold transition-colors"
        >
          <ChevronLeft /> もどる
        </button>
        <h2 className="text-2xl font-black text-[var(--secondary)] flex items-center gap-2">
          🧩 ことばあつめ
        </h2>
        <div className="w-[88px]"></div>
      </header>

      <div className="flex-1 flex flex-col items-center min-h-0 w-full">
        {/* つくった言葉の枠 */}
        <div className="w-full bg-[var(--bg)] p-4 md:p-8 rounded-3xl border-4 border-dashed border-[var(--secondary)] mb-6 flex flex-col items-center min-h-[160px] relative">
          
          <div className="flex gap-2 md:gap-4 mb-4 h-20 md:h-24">
            <AnimatePresence>
              {selectedChars.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-gray-400 font-bold flex items-center justify-center w-full h-full text-lg md:text-xl"
                >
                  したの ドロップ（もじ）を えらんでね
                </motion.div>
              )}
              {selectedChars.map((char, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="w-16 h-16 md:w-20 md:h-20 bg-white border-4 border-gray-300 text-gray-700 text-4xl md:text-5xl font-black flex items-center justify-center rounded-2xl shadow-sm"
                >
                  {char}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={handleBackspace} 
              disabled={selectedChars.length === 0}
              className="flex items-center font-bold px-4 py-2 bg-gray-200 text-gray-600 rounded-xl disabled:opacity-50 select-none"
            >
              1文字けす
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={selectedChars.length === 0}
              className="flex items-center gap-2 font-black px-8 py-2 bg-[var(--secondary)] text-white rounded-xl shadow-[0_4px_0_var(--text)] active:shadow-none active:translate-y-1 disabled:opacity-50 disabled:shadow-none disabled:translate-y-1 transition-all"
            >
               できた！ <Star size={20} fill="currentColor" />
            </button>
            <button 
              onClick={handleClear} 
              disabled={selectedChars.length === 0}
              className="flex items-center font-bold px-4 py-2 bg-red-100 text-red-600 rounded-xl disabled:opacity-50 p-2"
              aria-label="すべてクリア"
            >
              <Trash2 size={24} />
            </button>
          </div>

          {/* 判定結果のオーバーレイ文字 */}
          <AnimatePresence>
            {showResult && (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 1.1 }}
                className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl backdrop-blur-sm z-10 ${showResult.success ? 'bg-green-500/20' : 'bg-red-500/20'}`}
              >
                {showResult.success ? (
                  <>
                    <span className="text-6xl mb-2">🎉</span>
                    <span className="text-3xl md:text-4xl font-black text-green-700 bg-white px-6 py-2 rounded-full shadow-lg border-4 border-green-500">
                      だいせいこう！
                    </span>
                    <span className="text-xl font-bold bg-yellow-100 text-yellow-800 px-4 py-1 rounded-xl mt-4">
                      {isUnlocked(showResult.word.id) ? '（もう みつけているよ！）' : 'あたらしい ことば を みつけた！'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-6xl mb-2">🤔</span>
                    <span className="text-2xl md:text-3xl font-black text-red-600 bg-white px-6 py-2 rounded-full shadow-lg border-4 border-red-400">
                      まだ じしょに ないみたい…
                    </span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* 使える文字パネル */}
        <div className="flex-1 w-full flex flex-col min-h-0 bg-white rounded-3xl p-4 border-2 border-dashed border-gray-300 relative">
          <h3 className="text-center font-bold text-gray-500 mb-3 shrink-0">
            おぼえた もじ で ことば を つくろう
          </h3>
          
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {ownedChars.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 font-bold text-lg gap-2">
                <span className="text-4xl">📚</span>
                <p>がくしゅうメニューから<br/>もじ を おぼえてこよう！</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
                {ownedChars.map((char, index) => (
                  <motion.button
                    key={`${char}-${index}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleCharClick(char)}
                    className="w-12 h-12 md:w-16 md:h-16 bg-[var(--accent)] text-[var(--panel)] border-[3px] border-[var(--text)] rounded-xl font-black text-2xl md:text-3xl shadow-[0_4px_0_var(--text)] active:shadow-none active:translate-y-1 transition-all"
                  >
                    {char}
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
