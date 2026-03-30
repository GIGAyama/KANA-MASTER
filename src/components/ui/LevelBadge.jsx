import React from 'react';
import { motion } from 'framer-motion';
import { getLevelInfo } from '../../systems/level';

/**
 * レベル表示バッジ + プログレスバー
 * ホーム画面に配置
 */
export default function LevelBadge({ totalExp }) {
  const info = getLevelInfo(totalExp || 0);

  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="w-full max-w-md mx-auto bg-white rounded-2xl p-4 shadow-lg border-3 border-[var(--text)]/10"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="text-3xl leading-none shrink-0">{info.icon}</div>
        <div className="flex-grow min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-black text-[var(--text)] opacity-50">Lv.</span>
            <span className="text-2xl font-black text-[var(--text)]">{info.level}</span>
            <span className="text-base font-black text-[var(--primary)] truncate">{info.title}</span>
          </div>
        </div>
      </div>

      {/* プログレスバー */}
      {!info.isMaxLevel ? (
        <div className="mt-1">
          <div className="flex justify-between text-xs font-bold text-[var(--text)] opacity-50 mb-1">
            <span>EXP {info.expInLevel} / {info.expForNext}</span>
            <span>つぎの レベルまで あと {info.expForNext - info.expInLevel}</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${info.progress * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-full"
            />
          </div>
        </div>
      ) : (
        <div className="text-center text-sm font-black text-[var(--accent)] mt-1">
          👑 さいこう レベル たっせい！
        </div>
      )}
    </motion.div>
  );
}
