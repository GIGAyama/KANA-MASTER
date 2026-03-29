import React from 'react';
import { motion } from 'framer-motion';
import { Play, Book } from 'lucide-react';
import { audioCtrl } from '../../systems/audio';

export default function HomeView({ setView, stats, isMobile }) {
  const handleNavigation = (viewName) => {
    audioCtrl.playSE('click');
    setView(viewName);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto px-4 py-8">
      
      {/* ヒーローセクション */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-10"
      >
        <h2 className="text-4xl md:text-5xl font-black text-[var(--primary)] mb-4 drop-shadow-sm">
          ひらがな・カタカナ<br />マスターへようこそ！
        </h2>
        <p className="text-lg text-[var(--text)] opacity-80 font-bold">
          なぞって おぼえて ことばを みつけよう！
        </p>
      </motion.div>

      {/* メニューグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleNavigation('kanaList')}
          className="flex flex-col items-center justify-center aspect-square md:aspect-auto md:h-48 bg-white rounded-3xl p-6 shadow-xl border-4 border-[var(--primary)] text-[var(--primary)] group"
        >
          <div className="bg-[var(--primary)] w-20 h-20 rounded-2xl flex items-center justify-center mb-4 text-white group-hover:rotate-12 transition-transform duration-300">
            <Play size={40} fill="currentColor" />
          </div>
          <span className="text-3xl font-black">がくしゅう</span>
          <span className="text-sm font-bold opacity-70 mt-2">ひらがな・カタカナをれんしゅう</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleNavigation('wordPuzzle')}
          className="flex flex-col items-center justify-center aspect-square md:aspect-auto md:h-48 bg-white rounded-3xl p-6 shadow-xl border-4 border-[var(--secondary)] text-[var(--secondary)] group"
        >
          <div className="bg-[var(--secondary)] w-20 h-20 rounded-2xl flex items-center justify-center mb-4 text-white group-hover:-rotate-12 transition-transform duration-300">
            {/* Lucideのパズル系または適切なアイコン */}
            <span className="text-4xl font-black">🧩</span>
          </div>
          <span className="text-3xl font-black">ことばあつめ</span>
          <span className="text-sm font-bold opacity-70 mt-2">おぼえた もじ で ことばをつくる</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleNavigation('wordDictionary')}
          className="flex flex-col items-center justify-center aspect-square md:aspect-auto md:h-48 bg-white rounded-3xl p-6 shadow-xl border-4 border-[var(--accent)] text-[var(--accent)] group md:col-span-2"
        >
          <div className="bg-[var(--accent)] w-20 h-20 rounded-2xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform duration-300">
            <Book size={40} />
          </div>
          <span className="text-3xl font-black">ことばずかん</span>
          <span className="text-sm font-bold opacity-70 mt-2 text-center">
            みつけた ことば を みる <br />
            （あつめたことば: {stats.unlockedWords?.length || 0}コ）
          </span>
        </motion.button>

      </div>
      
    </div>
  );
}
