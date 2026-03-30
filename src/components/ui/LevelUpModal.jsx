import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioCtrl } from '../../systems/audio';
import Confetti from './Confetti';

/**
 * レベルアップ演出モーダル
 * セッション終了時にレベルが上がった場合に表示
 */
export default function LevelUpModal({ levelInfo, onClose }) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    audioCtrl.playSE('level_up');
    const t = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        {showConfetti && <Confetti count={150} />}

        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          className="bg-white rounded-3xl p-8 shadow-2xl border-4 border-[var(--accent)] max-w-sm w-full text-center"
          onClick={e => e.stopPropagation()}
        >
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="text-6xl mb-4"
          >
            {levelInfo.icon}
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
          >
            <div className="text-lg font-black text-[var(--accent)] mb-1">🎉 レベルアップ！</div>
            <div className="text-5xl font-black text-[var(--text)] mb-2">
              Lv. {levelInfo.level}
            </div>
            <div className="text-2xl font-black text-[var(--primary)]">
              {levelInfo.title}
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="mt-8 w-full py-3 bg-[var(--accent)] text-white text-xl font-black rounded-2xl shadow-[0_4px_0_#b45309] border-2 border-[var(--accent)] active:translate-y-1 active:shadow-none transition-all"
          >
            やったー！
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
