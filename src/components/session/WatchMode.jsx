import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Play, Pause, SkipForward, SkipBack, RotateCcw } from 'lucide-react';
import MotionButton from '../ui/MotionButton';
import ModeLayout from '../ui/ModeLayout';
import { F } from '../ui/FormatKun';
import { audioCtrl } from '../../systems/audio';

const ANIM_DURATION = 800; // ms per stroke

const WatchMode = ({ paths, strokeData, isLoading, onNext, commonSidebar }) => {
  const [currentStroke, setCurrentStroke] = useState(0);
  const [progress, setProgress] = useState(0); // 0-1 animation progress
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [strokeLengths, setStrokeLengths] = useState([]);
  const animRef = useRef(null);
  const allDone = currentStroke >= paths.length;

  // Compute stroke lengths once when paths change
  useEffect(() => {
    if (!paths || paths.length === 0) return;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    svg.appendChild(pathEl);
    document.body.appendChild(svg);
    const lengths = paths.map(d => {
      pathEl.setAttribute('d', d);
      return pathEl.getTotalLength();
    });
    document.body.removeChild(svg);
    setStrokeLengths(lengths);
    setCurrentStroke(0);
    setProgress(0);
    setIsPlaying(false);
  }, [paths]);

  // Animation: run a rAF loop that updates progress from 0→1
  const startAnimation = () => {
    cancelAnimationFrame(animRef.current);
    setProgress(0);
    setIsPlaying(true);
    const t0 = performance.now();
    const tick = () => {
      const p = Math.min((performance.now() - t0) / ANIM_DURATION, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(eased);
      if (p < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setIsPlaying(false);
      }
    };
    animRef.current = requestAnimationFrame(tick);
  };

  // Auto-play: when a stroke finishes and autoplay is on, advance
  useEffect(() => {
    if (isPlaying || !isAutoPlay || strokeLengths.length === 0) return;
    // If progress is 1 (animation just finished) and there are more strokes
    if (progress >= 1 && currentStroke < paths.length) {
      const timer = setTimeout(() => {
        setCurrentStroke(prev => prev + 1);
        setProgress(0);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, isAutoPlay, progress, currentStroke, paths.length, strokeLengths.length]);

  // Auto-start animation when currentStroke changes
  useEffect(() => {
    if (currentStroke < paths.length && strokeLengths.length > 0 && !allDone) {
      startAnimation();
    }
    return () => cancelAnimationFrame(animRef.current);
  }, [currentStroke, strokeLengths.length, paths.length, allDone]);

  const handlePrev = () => {
    if (currentStroke <= 0) return;
    audioCtrl.playSE('click');
    cancelAnimationFrame(animRef.current);
    setIsPlaying(false);
    setCurrentStroke(prev => prev - 1);
    setProgress(0);
  };

  const handleNext = () => {
    if (currentStroke >= paths.length) return;
    audioCtrl.playSE('click');
    cancelAnimationFrame(animRef.current);
    setIsPlaying(false);
    setCurrentStroke(prev => prev + 1);
    setProgress(0);
  };

  const handleReplay = () => {
    audioCtrl.playSE('click');
    cancelAnimationFrame(animRef.current);
    setCurrentStroke(0);
    setProgress(0);
    setIsPlaying(false);
  };

  const handleToggleAutoPlay = () => {
    audioCtrl.playSE('click');
    setIsAutoPlay(prev => !prev);
  };

  if (isLoading || !paths || paths.length === 0) {
    return (
      <ModeLayout
        mainContent={
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <div className="text-sm font-bold text-[var(--text)] opacity-50">よみこみ中...</div>
            </div>
          </div>
        }
        tabsContent={commonSidebar}
        infoContent={null}
        actionContent={null}
      />
    );
  }

  const main = (
    <div className="relative border-[4px] border-[var(--text)] rounded-[20px] bg-[var(--panel)] overflow-hidden touch-none transition-all duration-200 shrink-0 shadow-[8px_8px_0_var(--text)]" style={{ width: '100%', maxWidth: '100%', maxHeight: '100%', aspectRatio: '1/1' }}>
      {/* Cross guide lines */}
      <div className="absolute top-0 left-1/2 w-0 h-full border-l-4 border-dashed border-[var(--text)] opacity-10 -translate-x-1/2 pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-full h-0 border-t-4 border-dashed border-[var(--text)] opacity-10 -translate-y-1/2 pointer-events-none" />

      <svg viewBox="0 0 109 109" className="absolute inset-0 z-10 pointer-events-none w-full h-full">
        {paths.map((d, i) => {
          if (i < currentStroke) {
            // Completed strokes - solid dark
            return (
              <path key={i} d={d} fill="none" stroke="var(--text)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            );
          } else if (i === currentStroke) {
            // Current stroke - animated
            const len = strokeLengths[i] || 0;
            const dashOffset = len * (1 - progress);
            return (
              <g key={i}>
                {/* Faint full path as guide */}
                <path d={d} fill="none" stroke="rgba(239,68,68,0.15)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                {/* Animated stroke */}
                <path
                  d={d}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={len}
                  strokeDashoffset={dashOffset}
                />
                {/* Start point indicator */}
                {strokeData[i] && (
                  <circle
                    cx={strokeData[i].s.x * 109}
                    cy={strokeData[i].s.y * 109}
                    r="4"
                    fill="var(--primary)"
                    opacity={progress < 0.3 ? 1 : 1 - (progress - 0.3) / 0.7}
                  />
                )}
              </g>
            );
          } else {
            // Future strokes - very faint
            return (
              <path key={i} d={d} fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            );
          }
        })}
      </svg>

      {/* Stroke number overlay */}
      {!allDone && (
        <div className="absolute top-3 left-3 bg-[var(--primary)] text-[var(--panel)] text-xs font-black px-3 py-1 rounded-full border-2 border-[var(--text)] shadow-sm z-20">
          {currentStroke + 1}{F("画","かく")}{F("目","め")}
        </div>
      )}

      {/* All done overlay */}
      {allDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
        >
          <div className="bg-[var(--secondary)] text-[var(--panel)] text-lg font-black px-6 py-3 rounded-2xl border-[3px] border-[var(--text)] shadow-[3px_3px_0_var(--text)]">
            かんせい！✨
          </div>
        </motion.div>
      )}
    </div>
  );

  const info = (
    <div className="bg-[var(--panel)] p-2 md:p-3 rounded-2xl border-[4px] border-[var(--text)] shadow-[4px_4px_0_var(--text)] flex flex-col gap-2 shrink-0">
      <div className="flex justify-between items-center bg-[var(--bg)] p-2 rounded-xl border-[2px] border-[var(--text)]">
        <span className="text-sm font-bold text-[var(--text)] pl-2">{F("書","か")}きじゅん アニメ</span>
        <div className="text-sm font-black bg-[var(--text)] text-[var(--panel)] px-3 py-1 rounded-lg shadow-sm">
          {paths.length}{F("画","かく")}
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 py-1">
        {paths.map((_, i) => (
          <div
            key={i}
            className={`w-6 h-6 rounded-full border-2 font-bold text-[10px] flex items-center justify-center transition-colors ${
              i < currentStroke
                ? 'bg-[var(--text)] text-[var(--panel)] border-[var(--text)]'
                : i === currentStroke && !allDone
                  ? 'bg-[var(--primary)] text-[var(--panel)] border-[var(--primary)] animate-pulse'
                  : 'bg-gray-100 text-gray-400 border-gray-300'
            }`}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );

  const action = (
    <div className="flex flex-col gap-2 shrink-0">
      <div className="flex gap-2">
        <MotionButton
          variant="secondary"
          onClick={handlePrev}
          disabled={currentStroke <= 0}
          className={`py-2 text-sm border-[2px] border-[var(--text)] flex-1 shadow-[0_2px_0_var(--text)] ${currentStroke <= 0 ? 'opacity-40' : ''}`}
        >
          <SkipBack size={16} /> {F("前","まえ")}の{F("画","かく")}
        </MotionButton>
        <MotionButton
          variant="secondary"
          onClick={allDone ? handleReplay : handleNext}
          className="py-2 text-sm border-[2px] border-[var(--text)] flex-1 shadow-[0_2px_0_var(--text)]"
        >
          {allDone ? <><RotateCcw size={16} /> もう1{F("回","かい")}</> : <><SkipForward size={16} /> {F("次","つぎ")}の{F("画","かく")}</>}
        </MotionButton>
        <MotionButton
          variant={isAutoPlay ? "primary" : "secondary"}
          onClick={handleToggleAutoPlay}
          className="py-2 text-sm border-[2px] border-[var(--text)] shadow-[0_2px_0_var(--text)] px-3"
        >
          {isAutoPlay ? <Pause size={16} /> : <Play size={16} />}
        </MotionButton>
      </div>
      <MotionButton
        variant="success"
        onClick={onNext}
        className="w-full py-4 md:py-6 text-xl md:text-2xl font-black border-[4px] border-[var(--text)] shadow-[0_4px_0_#065f46]"
      >
        なぞり{F("練習","れんしゅう")}へ <ChevronRight size={24} />
      </MotionButton>
    </div>
  );

  return <ModeLayout mainContent={main} tabsContent={commonSidebar} infoContent={info} actionContent={action} />;
};

export default WatchMode;
