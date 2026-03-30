import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, PlayCircle, Pencil, CheckCircle2, Star, ChevronRight } from 'lucide-react';
import StampEffect from '../ui/StampEffect';
import { audioCtrl } from '../../systems/audio';
import ReadMode from './ReadMode';
import WatchMode from './WatchMode';
import WriteMode from './WriteMode';
import TestMode from './TestMode';
import { Analyzer } from '../../systems/analyzer';
import { fetchKanaVg } from '../../systems/kanaVg';

const SessionView = ({ queue: initialQueue, stats, onUpdateStat, onFinish, onRecordPerfect, onRecordEasy }) => {
  const [queue, setQueue] = useState(initialQueue);
  const [mode, setMode] = useState('read');
  const [paths, setPaths] = useState([]);
  const [strokeData, setStrokeData] = useState([]);
  const [viewBoxSize, setViewBoxSize] = useState(109);
  const [crossMatrix, setCrossMatrix] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStamp, setActiveStamp] = useState(null);
  const [combo, setCombo] = useState(0);
  const [reachedStep, setReachedStep] = useState(0);
  const [fetchError, setFetchError] = useState(null);

  const canvasSize = 400; 
  const currentKana = queue[0];
  const isNew = !currentKana || !stats[currentKana.id] || stats[currentKana.id].status === 'new';
  const MODES = useMemo(() => ['read', 'watch', 'write', 'test'], []);

  useEffect(() => {
    if (!currentKana) return;
    setMode(isNew ? 'read' : 'test');
    setReachedStep(isNew ? 0 : 3);
    let cancelled = false;
    const load = async () => {
      setIsLoading(true); setFetchError(null);
      try {
        const { paths: p, strokeData: data, viewBoxSize: vb } = await fetchKanaVg(currentKana.char);
        if (cancelled) return;
        setPaths(p); setStrokeData(data); setViewBoxSize(vb);
        const cMatrix = data.map((_, i) => data.map((__, j) => i !== j && Analyzer.checkCross(data[i].points, data[j].points)));
        setCrossMatrix(cMatrix);
      } catch (e) {
        if (cancelled) return;
        setPaths([]); setCrossMatrix([]); setStrokeData([]);
        setFetchError('よみこみに しっぱいしました。\nもういちど ためしてね。');
      }
      setIsLoading(false);
    }; load();
    return () => { cancelled = true; };
  }, [currentKana, isNew]);

  useEffect(() => {
    const stepIdx = MODES.indexOf(mode);
    if (stepIdx > reachedStep) setReachedStep(stepIdx);
  }, [mode, reachedStep, MODES]);

  const handleEvaluation = (evalType) => {
    if (evalType === 'easy') onRecordEasy();
    if (evalType === 'easy' || evalType === 'good') { setCombo(prev => prev + 1); }
    else { setCombo(0); }
    audioCtrl.playSE(evalType === 'again' ? 'stamp_bad' : evalType === 'easy' ? 'stamp_perfect' : evalType === 'hard' ? 'click' : 'stamp_good');
    setActiveStamp(evalType === 'hard' ? 'good' : evalType);
    setTimeout(() => {
      setActiveStamp(null);
      const success = onUpdateStat(currentKana, evalType);
      if (success) { if (queue.length <= 1) onFinish(); else setQueue(prev => prev.slice(1)); }
      else { setQueue(prev => [...prev.slice(1), currentKana]); setMode('watch'); }
    }, evalType === 'again' ? 1500 : 900);
  };

  if (!currentKana) return null;

  const getCommonSidebar = () => (
    <div className="flex flex-col gap-2 md:gap-3 shrink-0 mb-1 md:mb-4">
      <div className="grid grid-cols-4 lg:grid-cols-2 gap-1.5 md:gap-2">
        {[{ id: 'read', icon: <Volume2 size={18} />, label: <>おんせい</> }, { id: 'watch', icon: <PlayCircle size={18} />, label: <>かきじゅん</> }, { id: 'write', icon: <Pencil size={18} />, label: "なぞる" }, { id: 'test', icon: <CheckCircle2 size={18} />, label: "テスト" }].map((t, idx) => {
          const isDisabled = isNew && idx > reachedStep;
          return (<button key={t.id} onClick={() => { if (isDisabled) { audioCtrl.playSE('stamp_bad'); return; } audioCtrl.playSE('click'); setMode(t.id); }} className={`flex flex-col items-center justify-center py-2.5 rounded-xl font-bold text-[10px] sm:text-xs border-[3px] transition-all ${mode === t.id ? "bg-[var(--text)] text-[var(--panel)] border-[var(--text)] shadow-[2px_2px_0_var(--primary)] scale-105" : isDisabled ? "bg-gray-100 text-gray-400 border-gray-300 opacity-50 cursor-not-allowed" : "bg-[var(--panel)] text-[var(--text)] border-[var(--text)] hover:bg-[var(--bg)]"}`}>{t.icon} <span className="mt-1">{t.label}</span></button>);
        })}
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-[var(--panel)] rounded-none md:rounded-[24px] shadow-none md:shadow-[6px_6px_0_var(--text)] border-0 md:border-[4px] border-[var(--text)] p-2 md:p-5 flex flex-col h-full overflow-hidden relative">
      <StampEffect stamp={activeStamp} />
      <div className="flex justify-between items-center mb-3 shrink-0">
        <div className="text-[var(--text)] font-bold text-sm bg-[var(--bg)] px-4 py-2 rounded-full border-[3px] border-[var(--text)] shadow-sm flex items-center gap-2">のこり <span className="text-lg font-black">{queue.length}</span> もじ</div>
        <div className="flex gap-2">
          {combo > 1 && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-[var(--text)] font-black text-sm bg-[var(--accent)] px-4 py-2 rounded-full border-[3px] border-[var(--text)] shadow-sm flex items-center gap-1">{combo} COMBO 🔥</motion.div>}
          {isNew && <div className="text-[var(--panel)] font-bold text-sm bg-[var(--primary)] px-4 py-2 rounded-full flex items-center gap-1 border-[3px] border-[var(--text)] shadow-sm"><Star size={16} /> はじめて</div>}
        </div>
      </div>
      <div className="flex-1 min-h-0 w-full relative">
        {fetchError ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
            <div className="text-5xl">😢</div>
            <p className="text-[var(--text)] font-bold text-lg whitespace-pre-line">{fetchError}</p>
            <button onClick={() => { setFetchError(null); setIsLoading(true); fetchKanaVg(currentKana.char).then(({ paths: p, strokeData: data, viewBoxSize: vb }) => { setPaths(p); setStrokeData(data); setViewBoxSize(vb); const cMatrix = data.map((_, i) => data.map((__, j) => i !== j && Analyzer.checkCross(data[i].points, data[j].points))); setCrossMatrix(cMatrix); setIsLoading(false); }).catch(() => { setFetchError('よみこみに しっぱいしました。\nもういちど ためしてね。'); setIsLoading(false); }); }} className="bg-[var(--primary)] text-white font-black text-lg px-8 py-3 rounded-2xl border-[3px] border-[var(--text)] shadow-[3px_3px_0_var(--text)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px]">🔄 もういちど ためす</button>
          </div>
        ) : (
          <>
            {mode === 'read' && <ReadMode kanji={currentKana} onNext={() => setMode('watch')} commonSidebar={getCommonSidebar()} />}
            {mode === 'watch' && <WatchMode paths={paths} strokeData={strokeData} viewBoxSize={viewBoxSize} isLoading={isLoading} onNext={() => setMode('write')} canvasSize={canvasSize} commonSidebar={getCommonSidebar()} />}
            {mode === 'write' && <WriteMode paths={paths} strokeData={strokeData} viewBoxSize={viewBoxSize} crossMatrix={crossMatrix} onNext={() => setMode('test')} canvasSize={canvasSize} commonSidebar={getCommonSidebar()} onRecordPerfect={onRecordPerfect} />}
            {mode === 'test' && <TestMode kanji={currentKana} strokeData={strokeData} onEvaluate={handleEvaluation} canvasSize={canvasSize} commonSidebar={getCommonSidebar()} />}
          </>
        )}
      </div>
    </div>
  );
};

export default SessionView;
