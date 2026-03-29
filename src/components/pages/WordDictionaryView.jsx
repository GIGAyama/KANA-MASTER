import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Volume2 } from 'lucide-react';
import { audioCtrl } from '../../systems/audio';
import { WORD_DICTIONARY } from '../../data/word-dictionary';

export default function WordDictionaryView({ stats, onBack }) {
  const unlockedWordIds = new Set(stats.unlockedWords || []);

  const handlePlayAudio = (word) => {
    audioCtrl.playSE('click');
    // 簡単な音声再生（ブラウザのSpeechSynthesis API）
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/50 backdrop-blur rounded-3xl p-4 md:p-6 shadow-sm border border-white max-w-4xl mx-auto w-full">
      <header className="flex items-center justify-between mb-6 pb-4 border-b-2 border-dashed border-gray-300">
        <button
          onClick={() => { audioCtrl.playSE('click'); onBack(); }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-bold transition-colors"
        >
          <ChevronLeft /> もどる
        </button>
        <h2 className="text-2xl font-black text-gray-700">ことばずかん</h2>
        <div className="text-xl font-bold bg-[var(--accent)] text-white px-4 py-2 rounded-xl border-b-4 border-yellow-600">
          {unlockedWordIds.size} / {WORD_DICTIONARY.length} コ
        </div>
      </header>

      <div className="overflow-y-auto no-scrollbar pb-10 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {WORD_DICTIONARY.map((item, index) => {
            const isUnlocked = unlockedWordIds.has(item.id);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-2xl border-4 ${isUnlocked ? 'bg-white border-[var(--accent)] shadow-sm' : 'bg-gray-200 border-gray-300 opacity-70'} flex flex-col`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className={`text-3xl font-black tracking-widest ${isUnlocked ? 'text-[var(--text)]' : 'text-gray-400 blur-[6px] select-none'}`}>
                    {isUnlocked ? item.word : '？？？？'}
                  </div>
                  {isUnlocked && (
                    <button 
                      onClick={() => handlePlayAudio(item.word)}
                      className="p-2 bg-[var(--accent)] text-white rounded-full hover:scale-110 active:scale-95 transition-transform"
                    >
                      <Volume2 size={24} />
                    </button>
                  )}
                </div>
                
                <div className={`text-sm font-bold ${isUnlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                  {isUnlocked ? item.meaning : 'まだ 見つけていない ことば'}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
