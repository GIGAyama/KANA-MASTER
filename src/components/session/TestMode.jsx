import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Eye, RotateCcw, Undo2 } from 'lucide-react';
import { motion } from 'framer-motion';
import MotionButton from '../ui/MotionButton';
import ModeLayout from '../ui/ModeLayout';
import { FormatKun } from '../ui/FormatKun';
import { audioCtrl } from '../../systems/audio';
import { gradeStrokes } from '../../systems/strokeGrader';

function scoreToRecommendation(result) {
  if (!result.strokeCountMatch || !result.crossMatch) return 'again';
  if (result.total >= 80) return 'easy';
  if (result.total >= 55) return 'good';
  if (result.total >= 30) return 'hard';
  return 'again';
}

function getScoreBanner(result) {
  if (!result) return null;
  if (!result.strokeCountMatch) return { text: 'かくすうが ちがうよ💦', color: 'var(--primary)', textColor: 'var(--panel)' };
  if (!result.crossMatch) return { text: 'せんの まじわりが ちがうよ💦', color: 'var(--primary)', textColor: 'var(--panel)' };
  if (result.total >= 80) return { text: 'よく 書けているよ！✨', color: 'var(--secondary)', textColor: 'var(--panel)' };
  if (result.total >= 55) return { text: 'おしい！もうすこし！', color: 'var(--accent)', textColor: 'var(--text)' };
  if (result.total >= 30) return { text: 'むずかしかったね…', color: '#fbbf24', textColor: 'var(--text)' };
  return { text: 'もうすこし れんしゅう しよう', color: 'var(--primary)', textColor: 'var(--panel)' };
}

const EVAL_BUTTONS = [
  { key: 'easy', variant: 'primary', label: 'よくできた！✨', hint: '4日後〜', shadow: 'shadow-[0_6px_0_#9f1239]' },
  { key: 'good', variant: 'success', label: '書けた👍', hint: '翌日〜', shadow: 'shadow-[0_6px_0_#065f46]' },
  { key: 'hard', variant: 'warning', label: 'むずかしい😓', hint: 'まもなく', shadow: 'shadow-[0_4px_0_#92400e]' },
  { key: 'again', variant: 'danger', label: '忘れた💦', hint: 'もう一度', shadow: 'shadow-[0_4px_0_#334155]' },
];

const INTERNAL_SIZE = 400;

const TestMode = ({ kanji, strokeData, onEvaluate, commonSidebar }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [userStrokes, setUserStrokes] = useState([]);
  const currentPathRef = useRef([]);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const [gradeResult, setGradeResult] = useState(null);
  const [recommendedEval, setRecommendedEval] = useState(null);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d');
    canvas.width = INTERNAL_SIZE * 2; canvas.height = INTERNAL_SIZE * 2;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.scale(2, 2); ctx.clearRect(0, 0, INTERNAL_SIZE, INTERNAL_SIZE);
  }, []);

  useEffect(() => {
    initCanvas(); setShowAnswer(false); setUserStrokes([]); setGradeResult(null); setRecommendedEval(null);
  }, [kanji, initCanvas]);

  const getCoords = (e) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    if (rect.width === 0) return { x: 0, y: 0 };
    const scale = INTERNAL_SIZE / rect.width;
    const isTouch = e.touches && e.touches.length > 0;
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;
    const touchOffsetY = isTouch ? -24 : 0;
    return { x: (clientX - rect.left) * scale, y: (clientY - rect.top + touchOffsetY) * scale };
  };

  const stateRef = useRef({ isDrawing, kanji, userStrokes });
  useEffect(() => { stateRef.current = { isDrawing, kanji, userStrokes }; }, [isDrawing, kanji, userStrokes]);

  const startDraw = useCallback((e) => {
    if (e.cancelable) e.preventDefault();
    const { x, y } = getCoords(e);
    setIsDrawing(true); lastPosRef.current = { x, y };
    currentPathRef.current = [{ x, y, time: Date.now() }];
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = INTERNAL_SIZE * 0.06; ctx.strokeStyle = "var(--text)";
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y); ctx.stroke();
  }, []);

  const draw = useCallback((e) => {
    const { isDrawing } = stateRef.current;
    if (!isDrawing) return; if (e.cancelable) e.preventDefault();
    const { x, y } = getCoords(e);
    currentPathRef.current.push({ x, y, time: Date.now() });
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = INTERNAL_SIZE * 0.06; ctx.strokeStyle = "var(--text)";
    ctx.beginPath(); ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(x, y); ctx.stroke();
    lastPosRef.current = { x, y };
  }, []);

  const stopDraw = useCallback((e) => {
    const { isDrawing } = stateRef.current;
    if (e && e.cancelable) e.preventDefault();
    if (!isDrawing) return; setIsDrawing(false);
    if (currentPathRef.current.length > 1) {
      setUserStrokes(prev => [...prev, [...currentPathRef.current]]);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const onRes = () => initCanvas();
    canvas.addEventListener('mousedown', startDraw, { passive: false });
    window.addEventListener('mousemove', draw, { passive: false });
    window.addEventListener('mouseup', stopDraw, { passive: false });
    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDraw, { passive: false });
    window.addEventListener('resize', onRes);
    return () => {
      canvas.removeEventListener('mousedown', startDraw);
      window.removeEventListener('mousemove', draw);
      window.removeEventListener('mouseup', stopDraw);
      canvas.removeEventListener('touchstart', startDraw);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDraw);
      window.removeEventListener('resize', onRes);
    };
  }, [startDraw, draw, stopDraw, initCanvas]);

  const redrawStrokes = (strokes) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, INTERNAL_SIZE, INTERNAL_SIZE);
    ctx.strokeStyle = "var(--text)"; ctx.lineWidth = INTERNAL_SIZE * 0.06;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    strokes.forEach(stroke => {
      if (stroke.length < 2) return;
      ctx.beginPath(); ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) ctx.lineTo(stroke[i].x, stroke[i].y);
      ctx.stroke();
    });
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, INTERNAL_SIZE, INTERNAL_SIZE);
    setUserStrokes([]);
  };

  const undoLastStroke = () => {
    if (userStrokes.length <= 0 || isDrawing) return;
    const newStrokes = userStrokes.slice(0, -1);
    setUserStrokes(newStrokes);
    redrawStrokes(newStrokes);
    audioCtrl.playSE('click');
  };

  const handleReveal = () => {
    setShowAnswer(true);
    audioCtrl.playSE('click');
    if (strokeData && strokeData.length > 0 && userStrokes.length > 0) {
      const result = gradeStrokes(userStrokes, strokeData, INTERNAL_SIZE);
      setGradeResult(result);
      setRecommendedEval(scoreToRecommendation(result));
    }
  };

  const banner = getScoreBanner(gradeResult);

  const main = (
    <div className="flex flex-row flex-wrap gap-4 md:gap-6 justify-center items-center w-full h-full overflow-y-auto no-scrollbar content-center pb-4 pt-4">
      <div className="relative border-[4px] border-[var(--text)] rounded-[20px] bg-[var(--panel)] overflow-hidden touch-none transition-all duration-200 shadow-[4px_4px_0_var(--text)] md:shadow-[8px_8px_0_var(--text)] shrink-0" style={{ width: '100%', maxWidth: showAnswer ? 'calc(50% - 16px)' : '100%', maxHeight: '100%', aspectRatio: '1/1' }}>
        <div className="absolute top-0 left-1/2 w-0 h-full border-l-4 border-dashed border-[var(--text)] opacity-10 -translate-x-1/2 pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-full h-0 border-t-4 border-dashed border-[var(--text)] opacity-10 -translate-y-1/2 pointer-events-none" />
        <canvas ref={canvasRef} className="absolute inset-0 z-10 cursor-crosshair w-full h-full" />
        <div className="absolute top-3 left-3 bg-[var(--text)] text-[var(--panel)] text-[10px] md:text-xs font-bold px-3 py-1 rounded-full opacity-50 pointer-events-none">かくところ</div>
          <div className="absolute bottom-3 right-3 z-20 flex gap-1.5">
            <button onClick={undoLastStroke} className="bg-[var(--panel)] text-[var(--text)] text-xs font-bold px-3 py-1.5 rounded-full border-[3px] border-[var(--text)] shadow-sm flex items-center gap-1 hover:bg-[var(--bg)] transition-colors">
              <Undo2 size={14} /> 1かく もどす
            </button>
            <button onClick={clearCanvas} className="bg-[var(--panel)] text-[var(--text)] text-xs font-bold px-3 py-1.5 rounded-full border-[3px] border-[var(--text)] shadow-sm flex items-center gap-1 hover:bg-[var(--bg)] transition-colors">
              <RotateCcw size={14} /> かきなおす
            </button>
          </div>
      </div>
      {showAnswer && (
        <div className="relative border-[4px] border-[var(--primary)] rounded-[20px] bg-[var(--bg)] overflow-hidden flex items-center justify-center transition-all duration-200 shadow-[4px_4px_0_var(--primary)] md:shadow-[8px_8px_0_var(--primary)] animate-in fade-in slide-in-from-left-4 shrink-0" style={{ width: '100%', maxWidth: 'calc(50% - 16px)', maxHeight: '100%', aspectRatio: '1/1' }}>
          <div className="absolute top-0 left-1/2 w-0 h-full border-l-4 border-dashed border-[var(--primary)] opacity-20 -translate-x-1/2 pointer-events-none" />
          <div className="absolute top-1/2 left-0 w-full h-0 border-t-4 border-dashed border-[var(--primary)] opacity-20 -translate-y-1/2 pointer-events-none" />
          <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 pointer-events-none select-none drop-shadow-sm"><text x="50" y="53" dominantBaseline="middle" textAnchor="middle" fontSize="80" fontWeight="900" fill="var(--primary)" fontFamily="'Klee One', serif">{kanji.char}</text></svg>
          <div className="absolute top-3 right-3 bg-[var(--primary)] text-[var(--panel)] text-[10px] md:text-xs font-black px-3 md:px-4 py-1.5 rounded-full border-[3px] border-[var(--text)] shadow-sm z-20">こたえ</div>
        </div>
      )}
    </div>
  );

  const info = (
    <div className="bg-[var(--panel)] rounded-2xl p-3 md:p-4 text-center border-[4px] border-[var(--text)] shadow-[4px_4px_0_var(--text)] flex flex-col gap-2">
      <div className="text-xs font-bold text-[var(--panel)] bg-[var(--text)] py-1.5 px-4 rounded-full mx-auto w-max mb-1">おもいだせるかな？</div>
      <div className="text-xl md:text-3xl font-black text-[var(--text)] tracking-wider">
        「{kanji.char}」
      </div>
    </div>
  );

  const action = (
    <div className="flex flex-col gap-2 md:gap-3">
      {!showAnswer ? (
        <MotionButton variant="primary" onClick={handleReveal} className="w-full py-5 md:py-8 text-xl md:text-3xl font-black border-[4px] border-[var(--text)] shadow-[0_6px_0_#9f1239] animate-pulse"><Eye size={28} /> こたえあわせ</MotionButton>
      ) : (
        <div className="flex flex-col gap-2 md:gap-3 animate-in slide-in-from-bottom-2">
          {banner ? (
            <div className="text-center text-sm font-bold py-2 px-3 rounded-xl border-[3px] border-[var(--text)] shadow-sm" style={{ backgroundColor: banner.color, color: banner.textColor }}>
              {banner.text}
            </div>
          ) : (
            <div className="text-center text-sm font-bold text-[var(--text)] bg-[var(--accent)] py-2 rounded-xl border-[3px] border-[var(--text)] shadow-sm">
              じぶんに しょうじきに えらぼう！
            </div>
          )}
          {recommendedEval && (
            <div className="text-center text-[10px] md:text-xs font-bold text-[var(--text)] opacity-70">
              コンピューターの おすすめだよ！ちがうと おもったら ほかのボタンでも OK👌
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
            {EVAL_BUTTONS.map(btn => {
              const isRecommended = recommendedEval === btn.key;
              const hasRecommendation = recommendedEval !== null;
              return (
                <div key={btn.key} className="relative">
                  {isRecommended && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute -top-2 -right-2 z-10 bg-[var(--accent)] text-[var(--text)] text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-[var(--text)] animate-bounce"
                    >
                      おすすめ！
                    </motion.div>
                  )}
                  <MotionButton
                    variant={btn.variant}
                    onClick={() => onEvaluate(btn.key)}
                    className={`w-full font-black border-[var(--text)] ${
                      isRecommended
                        ? `py-3 md:py-5 text-base md:text-2xl border-[4px] ${btn.shadow} ring-4 ring-[var(--accent)] ring-offset-1`
                        : hasRecommendation
                          ? `py-2 md:py-3 text-sm md:text-base border-[3px] opacity-60`
                          : `py-3 md:py-5 text-base md:text-2xl border-[4px] ${btn.shadow}`
                    }`}
                  >
                    {btn.label}
                    <span className="text-[10px] md:text-sm font-bold opacity-70 ml-1">
                      （{btn.hint}）
                    </span>
                  </MotionButton>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return <ModeLayout mainContent={main} tabsContent={commonSidebar} infoContent={info} actionContent={action} />;
};

export default TestMode;
