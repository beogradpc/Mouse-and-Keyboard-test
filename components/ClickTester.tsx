
import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import type { TesterRef } from '../types';

interface ClickTesterProps {
  isSoundOn: boolean;
}

interface ClickLogEntry {
  id: number;
  button: string;
  diff: number;
  isDoubleClick: boolean;
}

interface ScrollLogEntry {
  id: number;
  delta: number;
  elapsed: number;
}

const ClickTester = forwardRef<TesterRef, ClickTesterProps>(({ isSoundOn }, ref) => {
  const [counts, setCounts] = useState({ total: 0, double: 0, left: 0, middle: 0, right: 0 });
  const [threshold, setThreshold] = useState(100);
  const [clickLog, setClickLog] = useState<ClickLogEntry[]>([]);
  const [scrollLog, setScrollLog] = useState<ScrollLogEntry[]>([]);
  const [isPressed, setIsPressed] = useState(false);
  
  const lastClickTime = useRef(performance.now());
  const lastScrollTime = useRef<number | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);

  useEffect(() => {
    try {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch(e) { console.error("Web Audio API not supported."); }
    document.addEventListener('wheel', handleScroll, { passive: false });
    return () => document.removeEventListener('wheel', handleScroll);
  }, []);

  const playSound = () => {
    if (!isSoundOn || !audioCtx.current) return;
    const ctx = audioCtx.current;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(440, t);
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.00001, t + 0.1);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(t);
    o.stop(t + 0.1);
  };
  
  const buttonName = (button: number) => ['Left', 'Middle', 'Right'][button] || 'Unknown';

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsPressed(true);
    playSound();
    const now = performance.now();
    const diff = now - lastClickTime.current;
    const isDoubleClick = diff <= threshold;

    setCounts(prev => ({
      ...prev,
      total: prev.total + 1,
      double: isDoubleClick ? prev.double + 1 : prev.double,
      left: e.button === 0 ? prev.left + 1 : prev.left,
      middle: e.button === 1 ? prev.middle + 1 : prev.middle,
      right: e.button === 2 ? prev.right + 1 : prev.right,
    }));
    
    setClickLog(prev => [{ id: now, button: buttonName(e.button), diff, isDoubleClick }, ...prev.slice(0, 10)]);

    lastClickTime.current = now;
  };

  const handlePointerRelease = () => {
    setIsPressed(false);
  }
  
  const handleScroll = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const now = performance.now();
    const elapsed = lastScrollTime.current ? now - lastScrollTime.current : 0;
    
    setScrollLog(prev => [{ id: now, delta: e.deltaY, elapsed }, ...prev.slice(0, 31)]);

    lastScrollTime.current = now;
  }, []);

  const reset = () => {
    setCounts({ total: 0, double: 0, left: 0, middle: 0, right: 0 });
    setClickLog([]);
    setScrollLog([]);
    lastClickTime.current = performance.now();
    lastScrollTime.current = null;
  };

  useImperativeHandle(ref, () => ({
    getResults: () => {
      return [
        '--- Click Test Results ---',
        `Total Clicks: ${counts.total}`,
        `Left Button: ${counts.left}`,
        `Middle Button: ${counts.middle}`,
        `Right Button: ${counts.right}`,
        `Double-Clicks: ${counts.double}`,
        `Scroll Events: ${scrollLog.length}`,
      ].join('\n');
    },
    reset,
  }));
  
  const StatInput = ({ label, value, id }: {label: string, value: number, id: string}) => (
    <>
      <label htmlFor={id} className="text-muted justify-self-end">{label}</label>
      <input id={id} type="text" value={value} readOnly className="w-20 bg-slate-100 dark:bg-slate-800 border border-panel-border rounded-md text-center font-bold" />
    </>
  );

  return (
    <div className="flex h-full gap-3 p-3 bg-panel rounded-2xl shadow-main" onContextMenu={e => e.preventDefault()}>
      <div className="flex-1 flex flex-col gap-4 bg-panel-border/50 dark:bg-black/20 p-4 rounded-xl">
        <div 
          className={`flex-shrink-0 h-64 rounded-xl cursor-pointer grid place-items-center text-xl font-bold text-white select-none transition-colors duration-75 ${isPressed ? 'bg-red-500' : 'bg-orange-500'}`}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerRelease}
          onPointerLeave={handlePointerRelease}
        >
          Click Here
        </div>
        <div className="flex-grow flex flex-col items-center">
            <div className="grid grid-cols-4 gap-x-4 gap-y-2 items-center text-sm">
              <StatInput label="Total Clicks" id="totalCount" value={counts.total} />
              <StatInput label={`Double-click (≤${threshold}ms)`} id="dcCount" value={counts.double} />
              <StatInput label="Left" id="leftCount" value={counts.left} />
              <StatInput label="Middle" id="middleCount" value={counts.middle} />
              <StatInput label="Right" id="rightCount" value={counts.right} />
            </div>
            <div className="w-full max-w-sm mt-4 text-center">
              <label htmlFor="threshold" className="text-sm text-muted">Double-click Threshold: <span className="font-bold text-ink">{threshold}</span> ms</label>
              <input 
                id="threshold" 
                type="range" 
                min="50" max="200" step="10" 
                value={threshold}
                onChange={e => setThreshold(parseInt(e.target.value))}
                className="w-full h-2 mt-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" 
              />
            </div>
        </div>
        <div className="flex-shrink-0 h-40 bg-slate-100 dark:bg-slate-800 border border-panel-border rounded-lg p-2 font-mono text-sm overflow-hidden">
          {clickLog.map(log => (
            <div key={log.id} className={`tabular-nums ${log.isDoubleClick ? 'text-red-500 font-bold' : ''}`}>
              [{log.button}] {Math.round(log.diff)} ms
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-3 bg-panel-border/50 dark:bg-black/20 p-4 rounded-xl">
        <h2 className="text-lg font-bold">Scroll Log</h2>
        <div className="flex-grow overflow-y-auto space-y-1.5 pr-2">
          {scrollLog.map((log, index) => (
            <div key={log.id} className={`p-2 rounded-lg flex justify-between items-center text-sm tabular-nums ${log.delta < 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800/50 dark:text-emerald-200' : 'bg-amber-100 text-amber-800 dark:bg-amber-800/50 dark:text-amber-200'}`}>
              <span className="font-bold">{scrollLog.length - index}</span>
              <span className="text-xs">{Math.round(log.elapsed)} ms</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default ClickTester;
