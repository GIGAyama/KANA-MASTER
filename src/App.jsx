import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BookOpen, PenTool, Volume2, VolumeX, Settings, Library } from 'lucide-react';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useIsMobile } from './hooks/useIsMobile';
import OfflineBanner from './components/ui/OfflineBanner';

import { StorageAPI } from './systems/storage';
import { calculateNextReview, migrateCard } from './systems/srs';
import { audioCtrl } from './systems/audio';
import { SESSION, EXP } from './constants/gameConfig';

import { KANA_DATA } from './data/kana-data';

// UI
import { PageWrapper, FullScreenWrapper, ErrorBoundary, Footer } from './components/ui';

// Pages
import HomeView from './components/pages/HomeView';
const WordDictionaryView = lazy(() => import('./components/pages/WordDictionaryView'));
const KanaListView = lazy(() => import('./components/pages/KanaListView'));
const WordPuzzleView = lazy(() => import('./components/pages/WordPuzzleView'));

// Session
const SessionView = lazy(() => import('./components/session/SessionView'));
const ResultView = lazy(() => import('./components/pages/ResultView'));

const LazyFallback = () => (
  <div className="flex items-center justify-center h-full" role="status">
    <div className="text-center">
      <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
      <div className="text-sm font-bold text-[var(--text)] opacity-50">よみこみ中...</div>
    </div>
  </div>
);

function createInitialSessionData(overrides = {}) {
  return {
    queue: [],
    earnedExp: 0,
    oldExp: 0,
    perfectCount: 0,
    easyCount: 0,
    reviewedCount: 0,
    newKanaCount: 0,
    ...overrides,
  };
}

export default function App() {
  const [view, setView] = useState('home');
  const [isMuted, setIsMuted] = useState(audioCtrl.muted);
  const [stats, setStats] = useState(StorageAPI.getStats() || { totalExp: 0, kanaStats: {} });
  const [sessionData, setSessionData] = useState(createInitialSessionData);
  const isOnline = useOnlineStatus();
  const isMobile = useIsMobile();

  // BGM管理
  useEffect(() => {
    if (isMuted) { audioCtrl.stopBGM(); return; }
    if (view === 'session') {
      audioCtrl.playBGM('game');
    } else if (view === 'result') {
      audioCtrl.stopBGM();
    } else {
      audioCtrl.playBGM('home');
    }
  }, [view, isMuted]);

  // 学習開始
  const startSession = (targetKanaList) => {
    audioCtrl.init();
    if (!targetKanaList || targetKanaList.length === 0) return;
    const queue = targetKanaList.sort(() => Math.random() - 0.5).slice(0, 10); // 一度に最大10文字
    setSessionData(createInitialSessionData({ queue, oldExp: stats.totalExp || 0 }));
    setView('session');
  };

  // 1文字判定ごとの処理
  const handleUpdateStat = (kanaObj, evalType) => {
    const id = kanaObj.id;
    const cur = migrateCard(stats.kanaStats?.[id]);
    const next = calculateNextReview(cur, evalType);
    const wasNew = cur.status === 'new' || !stats.kanaStats?.[id];
    const isMastering = next.graduated && next.interval >= 7 * 24 * 60 * 60 * 1000;
    const newStatus = isMastering ? 'mastered' : next.graduated ? 'review' : 'learning';

    let exp = 0;
    if (evalType !== 'again') {
      const baseExp = wasNew ? EXP.NEW_KANJI : evalType === 'easy' ? EXP.EASY : evalType === 'good' ? EXP.GOOD : EXP.HARD;
      exp = baseExp;
    }

    setStats(s => ({
      ...s,
      kanaStats: {
        ...(s.kanaStats || {}),
        [id]: { ...cur, ...next, status: newStatus, mistakes: evalType === 'again' ? (cur.mistakes || 0) + 1 : (cur.mistakes || 0) }
      }
    }));

    setSessionData(d => ({
      ...d,
      earnedExp: d.earnedExp + exp,
      reviewedCount: d.reviewedCount + 1,
      newKanaCount: d.newKanaCount + (wasNew ? 1 : 0),
    }));
    return evalType !== 'again';
  };

  const handleRecordPerfect = useCallback(() => {
    setSessionData(d => ({
      ...d,
      perfectCount: d.perfectCount + 1,
      earnedExp: d.earnedExp + EXP.PERFECT_BONUS
    }));
  }, []);

  const handleRecordEasy = useCallback(() => {
    setSessionData(d => ({ ...d, easyCount: d.easyCount + 1 }));
  }, []);

  const handleFinishSession = () => {
    const totalExp = sessionData.earnedExp;
    // セーブ
    setStats(prev => {
      const newStats = { ...prev, totalExp: (prev.totalExp || 0) + totalExp };
      StorageAPI.saveStatsImmediate(newStats);
      return newStats;
    });
    setView('result');
  };

  const GlobalStyle = () => {
    const tv = `--bg: #fdfbf7; --primary: #ef4444; --secondary: #10b981; --accent: #fbbf24; --text: #292f36; --panel: #ffffff;`;
    return (
      <style>{`:root { ${tv} } body { font-family: 'Zen Maru Gothic', sans-serif; background-color: var(--bg); color: var(--text); touch-action: manipulation; transition: background-color 0.3s ease; } .no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    );
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[var(--bg)] relative overflow-hidden transition-colors duration-500">
      <GlobalStyle />
      {!isOnline && <OfflineBanner />}

      {view !== 'session' && (
        <header className="flex-shrink-0 bg-[var(--panel)]/90 backdrop-blur border-b-[3px] border-[var(--text)] py-2 md:py-3 px-3 md:px-5 flex justify-between items-center z-50 sticky top-0 shadow-[0_4px_0_var(--text)]">
          <button className="flex items-center cursor-pointer gap-2 bg-transparent border-none p-0" onClick={() => { audioCtrl.playSE('click'); setView('home'); }}>
            <div className="bg-[var(--primary)] p-1.5 rounded-lg text-white shadow-sm border-2 border-[var(--text)]"><PenTool size={22} strokeWidth={3} /></div>
            <h1 className="text-xl font-black text-[var(--text)] tracking-wide">ひらがなマスター</h1>
          </button>
          <nav className="flex items-center gap-1">
            <button onClick={() => setIsMuted(audioCtrl.toggle())} className="text-[var(--text)] opacity-50 hover:opacity-100 p-2 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center border-2 border-transparent hover:border-[var(--text)] hover:bg-[var(--bg)] transition-all">
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} className="text-[var(--secondary)]" />}
            </button>
          </nav>
        </header>
      )}

      <main className="flex-grow relative overflow-hidden p-0 md:p-4 min-h-0">
        <Suspense fallback={<LazyFallback />}>
          <AnimatePresence mode="wait">
            {view === 'home' && <PageWrapper key="home" wide><ErrorBoundary onReset={() => setView('home')}><HomeView setView={setView} stats={stats} isMobile={isMobile} /></ErrorBoundary></PageWrapper>}
            {view === 'kanaList' && <PageWrapper key="kanaList" wide><ErrorBoundary onReset={() => setView('home')}><KanaListView kanjiStats={stats.kanaStats} onBack={() => setView('home')} onSelectKana={(kana) => startSession([kana])} onStartAll={() => startSession(KANA_DATA)} /></ErrorBoundary></PageWrapper>}
            {view === 'wordPuzzle' && <PageWrapper key="wordPuzzle" wide><ErrorBoundary onReset={() => setView('home')}><WordPuzzleView setView={setView} stats={stats} setStats={setStats} /></ErrorBoundary></PageWrapper>}
            {view === 'wordDictionary' && <PageWrapper key="wordDictionary" wide><ErrorBoundary onReset={() => setView('home')}><WordDictionaryView stats={stats} onBack={() => setView('home')} /></ErrorBoundary></PageWrapper>}
            
            {view === 'session' && <FullScreenWrapper key="session"><ErrorBoundary onReset={() => setView('home')}><SessionView queue={sessionData.queue} stats={stats.kanaStats || {}} onUpdateStat={handleUpdateStat} onFinish={handleFinishSession} onRecordPerfect={handleRecordPerfect} onRecordEasy={handleRecordEasy} /></ErrorBoundary></FullScreenWrapper>}
            {view === 'result' && <PageWrapper key="result"><ErrorBoundary onReset={() => setView('home')}><ResultView sessionMetrics={sessionData} oldExp={sessionData.oldExp} setView={setView} stats={stats} setStats={setStats} /></ErrorBoundary></PageWrapper>}
          </AnimatePresence>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
