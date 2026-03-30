import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, ArrowRight, Zap } from 'lucide-react';
import { audioCtrl } from '../../systems/audio';
import { checkLevelUp, getLevelInfo } from '../../systems/level';
import Confetti from '../ui/Confetti';
import AnimatedCounter from '../ui/AnimatedCounter';
import LevelUpModal from '../ui/LevelUpModal';

export default function ResultView({ sessionMetrics, setView, stats }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState(null);

  const oldExp = sessionMetrics.oldExp || 0;
  const newExp = stats?.totalExp || 0;

  useEffect(() => {
    audioCtrl.playSE('level_up');
    setShowConfetti(true);
    const t = setTimeout(() => setShowConfetti(false), 3000);

    // レベルアップ判定
    const lvUp = checkLevelUp(oldExp, newExp);
    if (lvUp) {
      const t2 = setTimeout(() => setLevelUpInfo(lvUp), 1500);
      return () => { clearTimeout(t); clearTimeout(t2); };
    }
    return () => clearTimeout(t);
  }, []);

  const handleFinish = () => {
    audioCtrl.playSE('click');
    setView('home');
  };

  const currentLevel = getLevelInfo(newExp);

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 h-full relative overflow-hidden">
      {showConfetti && <Confetti count={100} />}
      {levelUpInfo && <LevelUpModal levelInfo={levelUpInfo} onClose={() => setLevelUpInfo(null)} />}

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 md:p-10 shadow-xl border-4 border-yellow-400 w-full max-w-md text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="bg-yellow-100 p-4 rounded-full border-4 border-yellow-400 shrink-0">
            <Trophy size={64} className="text-yellow-500" />
          </div>
        </div>

        <h2 className="text-3xl md:text-4xl font-black text-gray-800 mb-8">
          がくしゅう しゅうりょう！
        </h2>

        <div className="bg-gray-50 rounded-2xl p-4 md:p-6 mb-8 border-2 border-dashed border-gray-300">
          <div className="flex justify-between items-center mb-4 text-xl md:text-2xl font-bold text-gray-600">
            <span>れんしゅう した もじ</span>
            <span className="text-blue-600 font-black">{sessionMetrics.reviewedCount} コ</span>
          </div>
          
          <div className="flex justify-between items-center mb-4 text-xl md:text-2xl font-bold text-gray-600">
            <span>パーフェクト！</span>
            <span className="text-red-500 font-black flex items-center gap-1">
              <Star fill="currentColor" size={24} /> {sessionMetrics.perfectCount || 0}
            </span>
          </div>

          <div className="flex justify-between items-center mb-4 text-xl md:text-2xl font-bold text-gray-600">
            <span className="flex items-center gap-1"><Zap size={20} /> もらった EXP</span>
            <span className="text-purple-600 font-black">+<AnimatedCounter target={sessionMetrics.earnedExp || 0} /></span>
          </div>

          <div className="flex justify-between items-center pt-4 border-t-2 border-gray-200 text-xl font-bold text-gray-700">
            <span>あたらしく おぼえた</span>
            <span className="text-green-600 font-black">{sessionMetrics.newKanaCount || 0} コ</span>
          </div>

          {/* レベルプログレス */}
          <div className="mt-4 pt-4 border-t-2 border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{currentLevel.icon}</span>
              <span className="text-lg font-black text-gray-700">Lv.{currentLevel.level}</span>
              <span className="text-base font-black text-[var(--primary)]">{currentLevel.title}</span>
            </div>
            {!currentLevel.isMaxLevel && (
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${currentLevel.progress * 100}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-full"
                />
              </div>
            )}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFinish}
          className="w-full py-4 bg-[var(--primary)] text-white text-2xl font-black rounded-2xl shadow-[0_6px_0_#991b1b] border-2 border-[var(--primary)] flex items-center justify-center gap-2 active:translate-y-2 active:shadow-none transition-all"
        >
          メニューにもどる <ArrowRight />
        </motion.button>
      </motion.div>
    </div>
  );
}
