import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, ChevronRight } from 'lucide-react';
import MotionButton from '../ui/MotionButton';
import ModeLayout from '../ui/ModeLayout';
import { audioCtrl } from '../../systems/audio';

const ReadMode = ({ kanji, onNext, commonSidebar }) => {
  const main = (
    <div className="flex items-center justify-center w-full h-full pb-8">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="text-[12rem] md:text-[18rem] lg:text-[22rem] leading-none font-black text-[var(--text)] drop-shadow-md select-none" 
        style={{ fontFamily: "'Klee One', serif", userSelect: 'none' }}
      >
        {kanji.char}
      </motion.div>
    </div>
  );

  const handlePlayAudio = () => {
    audioCtrl.playSE('click');
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(kanji.char);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const info = (
    <div className="flex flex-col gap-4 bg-[var(--panel)] p-4 rounded-2xl border-[4px] border-[var(--text)] shadow-[4px_4px_0_var(--text)]">
      <div className="bg-[var(--accent)] text-[var(--text)] px-4 py-1.5 rounded-full text-base font-black border-[3px] border-[var(--text)] text-center shadow-sm -mt-8 mx-auto w-max">
        おと を きこう！
      </div>
      <div className="flex justify-center my-2">
        <MotionButton 
          variant="secondary" 
          onClick={handlePlayAudio}
          className="rounded-full w-16 h-16 flex items-center justify-center border-[4px] border-[var(--text)] shadow-[0_4px_0_var(--text)] bg-white text-[var(--primary)]"
        >
          <Volume2 size={32} />
        </MotionButton>
      </div>
    </div>
  );

  const action = (
    <MotionButton variant="primary" onClick={onNext} className="w-full py-4 md:py-6 text-xl md:text-2xl font-black border-[4px] border-[var(--text)] shadow-[0_6px_0_#9f1239]">
      かきじゅん を みる <ChevronRight size={28} />
    </MotionButton>
  );

  return <ModeLayout mainContent={main} tabsContent={commonSidebar} infoContent={info} actionContent={action} />;
};

export default ReadMode;
