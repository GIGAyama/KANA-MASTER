import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { KANA_DATA } from '../../data/kana-data';
import { ChevronLeft, PlayCircle } from 'lucide-react';
import { audioCtrl } from '../../systems/audio';

const SECTIONS = [
  { key: "hiragana-seion", label: "ひらがな（清音）", filter: k => k.type === "hiragana" && !k.tags.includes("dakuten") && !k.tags.includes("handakuten") },
  { key: "hiragana-dakuten", label: "ひらがな（濁音）", filter: k => k.type === "hiragana" && k.tags.includes("dakuten") },
  { key: "hiragana-handakuten", label: "ひらがな（半濁音）", filter: k => k.type === "hiragana" && k.tags.includes("handakuten") },
  { key: "katakana-seion", label: "カタカナ（清音）", filter: k => k.type === "katakana" && !k.tags.includes("dakuten") && !k.tags.includes("handakuten") },
  { key: "katakana-dakuten", label: "カタカナ（濁音）", filter: k => k.type === "katakana" && k.tags.includes("dakuten") },
  { key: "katakana-handakuten", label: "カタカナ（半濁音）", filter: k => k.type === "katakana" && k.tags.includes("handakuten") },
];

function KanaCard({ k, stat, index, onSelectKana }) {
  const isNew = stat.status === 'new';
  const isMastered = stat.status === 'mastered';
  const isLearning = stat.status === 'learning' || stat.status === 'review';

  let bgColor = "bg-gray-100";
  let textColor = "text-gray-500";
  let borderColor = "border-gray-200";

  if (isMastered) {
    bgColor = "bg-yellow-100";
    textColor = "text-yellow-700";
    borderColor = "border-yellow-400";
  } else if (isLearning) {
    bgColor = "bg-green-100";
    textColor = "text-green-700";
    borderColor = "border-green-400";
  } else if (!isNew) {
    bgColor = "bg-blue-100";
    textColor = "text-blue-700";
    borderColor = "border-blue-400";
  }

  return (
    <motion.button
      key={k.id}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.008 }}
      whileHover={{ scale: 1.1, zIndex: 10 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => {
        audioCtrl.playSE('click');
        onSelectKana(k);
      }}
      className={`flex flex-col items-center justify-center aspect-square rounded-2xl border-4 ${bgColor} ${borderColor} shadow-sm relative overflow-hidden group`}
    >
      <span className={`text-4xl sm:text-5xl font-black ${textColor} mb-1 select-none pointer-events-none group-hover:scale-110 transition-transform`}>
        {k.char}
      </span>

      {isNew && (
        <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-full">
          NEW!
        </span>
      )}
      {isMastered && (
        <span className="absolute bottom-1 right-1 text-sm sm:text-base">
          💮
        </span>
      )}
    </motion.button>
  );
}

export default function KanaListView({ kanaStats, onBack, onSelectKana, onStartAll }) {
  const [activeTab, setActiveTab] = useState("hiragana");

  const filteredSections = SECTIONS.filter(s => s.key.startsWith(activeTab));

  return (
    <div className="flex flex-col h-full bg-white/50 backdrop-blur rounded-3xl p-4 md:p-6 shadow-sm border border-white max-w-5xl mx-auto w-full">
      <header className="flex items-center justify-between mb-4 pb-4 border-b-2 border-dashed border-gray-300">
        <button
          onClick={() => { audioCtrl.playSE('click'); onBack(); }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-bold transition-colors"
        >
          <ChevronLeft /> もどる
        </button>
        <h2 className="text-2xl font-black text-gray-700">がくしゅうメニュー</h2>

        <button
          onClick={() => { audioCtrl.playSE('click'); onStartAll(); }}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-red-500 rounded-xl text-white font-bold transition-colors shadow-sm"
        >
          <PlayCircle /> ランダムにれんしゅう
        </button>
      </header>

      {/* ひらがな / カタカナ タブ */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { audioCtrl.playSE('click'); setActiveTab("hiragana"); }}
          className={`flex-1 py-2 rounded-xl font-bold text-lg transition-colors ${activeTab === "hiragana" ? "bg-pink-500 text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
        >
          ひらがな
        </button>
        <button
          onClick={() => { audioCtrl.playSE('click'); setActiveTab("katakana"); }}
          className={`flex-1 py-2 rounded-xl font-bold text-lg transition-colors ${activeTab === "katakana" ? "bg-blue-500 text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
        >
          カタカナ
        </button>
      </div>

      <div className="overflow-y-auto no-scrollbar pb-10">
        {filteredSections.map(section => {
          const chars = KANA_DATA.filter(section.filter);
          if (chars.length === 0) return null;
          return (
            <div key={section.key} className="mb-6">
              <h3 className="text-lg font-bold text-gray-600 mb-3 pl-1">{section.label}</h3>
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
                {chars.map((k, index) => {
                  const stat = kanaStats?.[k.id] || { status: 'new' };
                  return (
                    <KanaCard
                      key={k.id}
                      k={k}
                      stat={stat}
                      index={index}
                      onSelectKana={onSelectKana}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
