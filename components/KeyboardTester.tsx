import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef, useCallback } from 'react';
import type { TesterRef } from '../types';
import { KEY_LAYOUT, KeyDefinition } from '../constants';
import * as Icons from './Icons';

interface KeyboardTesterProps {
  isSoundOn: boolean;
  kbScale: number;
}

const Key = React.memo(({ keyDef, state }: { keyDef: KeyDefinition, state: string | undefined }) => {
  const { label, sub, icon } = keyDef;

  const stateClasses: {[key: string]: string} = {
    pressed: 'bg-slate-200 dark:bg-slate-600 translate-y-px shadow-none',
    ok: 'bg-emerald-100 border-emerald-300 dark:bg-emerald-900 dark:border-emerald-700 text-emerald-700 dark:text-emerald-200',
    fail: 'bg-red-100 border-red-300 dark:bg-red-900 dark:border-red-700 text-red-700 dark:text-red-200 animate-pulse',
  };
  const currentClasses = stateClasses[state || ''] || 'bg-panel dark:bg-slate-800';

  const IconComponent = icon ? Icons[icon as keyof typeof Icons] : null;
  
  const content = IconComponent ? (
    <div className="flex flex-col items-center justify-center gap-1 text-center leading-none">
      <IconComponent />
      {label && <span className="text-[10px] font-bold tracking-wider uppercase mt-1">{label}</span>}
    </div>
  ) : (
    <div className="relative w-full h-full">
      {sub && <span className="absolute top-1.5 left-2.5 text-xs text-muted">{sub}</span>}
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">{label}</span>
    </div>
  );

  return (
    <div className={`h-full w-full flex items-center justify-center rounded-md border border-b-2 border-slate-400/50 dark:border-slate-600/80 shadow-sm transition-all duration-75 ${currentClasses}`}>
      {content}
    </div>
  );
});

const KeyboardTester = forwardRef<KeyboardTesterProps, KeyboardTesterProps>(({ isSoundOn, kbScale }, ref) => {
  const [keyStates, setKeyStates] = useState(new Map<string, 'pressed' | 'ok' | 'fail'>());
  const [lastEvent, setLastEvent] = useState({ key: 'N/A', code: 'N/A', depressTime: 0 });
  const [cps, setCps] = useState(0);

  const downTimes = useRef(new Map<string, number>());
  const charHits = useRef<number[]>([]);
  const audioCtx = useRef<AudioContext | null>(null);

  const updateKeyState = (code: string, state: 'pressed' | 'ok' | 'fail' | null) => {
    setKeyStates(prev => {
      const newStates = new Map(prev);
      if (state) {
        newStates.set(code, state);
      } else {
        newStates.delete(code);
      }
      return newStates;
    });
  };

  const playSound = () => {
    if (!isSoundOn || !audioCtx.current) return;
    const ctx = audioCtx.current;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(261.6, t);
    g.gain.setValueAtTime(0.1, t); g.gain.exponentialRampToValueAtTime(0.00001, t + 0.1);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.1);
  };

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!downTimes.current.has(e.code)) {
      playSound();
      downTimes.current.set(e.code, performance.now());
      updateKeyState(e.code, 'pressed');
    }
    setLastEvent(prev => ({ ...prev, key: e.key, code: e.code }));
    if(e.key.length === 1) charHits.current.push(performance.now());
  }, []);

  const onKeyUp = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const t0 = downTimes.current.get(e.code);
    if (t0) {
      const depressTime = performance.now() - t0;
      setLastEvent(prev => ({...prev, depressTime: Math.round(depressTime)}));
      downTimes.current.delete(e.code);
    }
    updateKeyState(e.code, 'ok');
  }, []);

  const reset = useCallback(() => {
    setKeyStates(new Map());
    downTimes.current.clear();
    charHits.current = [];
    setCps(0);
    setLastEvent({ key: 'N/A', code: 'N/A', depressTime: 0 });
  }, []);

  useEffect(() => {
    try {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch(e) { console.error("Web Audio API not supported."); }

    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('keyup', onKeyUp, true);
    window.addEventListener('blur', reset);

    const cpsInterval = setInterval(() => {
        const now = performance.now();
        charHits.current = charHits.current.filter(t => now - t < 10000);
        setCps(charHits.current.length / 10);
    }, 250);

    const stuckKeyInterval = setInterval(() => {
        const now = performance.now();
        downTimes.current.forEach((t0, code) => {
            if (now - t0 > 2000) {
                updateKeyState(code, 'fail');
            }
        });
    }, 500);

    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('keyup', onKeyUp, true);
      window.removeEventListener('blur', reset);
      clearInterval(cpsInterval);
      clearInterval(stuckKeyInterval);
    };
  }, [onKeyDown, onKeyUp, reset]);
  
  useImperativeHandle(ref, () => ({
    getResults: () => {
      const testedKeys = Array.from(keyStates.keys()).filter(k => keyStates.get(k) === 'ok');
      return [
        '--- Keyboard Test Results ---',
        `Keys Tested: ${testedKeys.length}`,
        `Average CPS: ${cps.toFixed(1)}`
      ].join('\n');
    },
    reset,
  }));
  
  const Stat = ({ label, value }: {label:string, value: string|number}) => (
    <div className="bg-panel p-2 rounded-lg text-center flex-1">
      <div className="text-xs text-muted font-bold">{label}</div>
      <div className="font-bold truncate" title={String(value)}>{value}</div>
    </div>
  );

  return (
    <div className="flex flex-col h-full p-3 bg-panel rounded-2xl shadow-main overflow-hidden">
      <div className="flex gap-3 mb-3">
        <Stat label="Last Key" value={lastEvent.key} />
        <Stat label="DOM Code" value={lastEvent.code} />
        <Stat label="Depress Time" value={`${lastEvent.depressTime} ms`} />
        <Stat label="Chars / Sec" value={cps.toFixed(1)} />
      </div>
      <div className="flex-grow flex items-center justify-center overflow-auto p-4">
        <div style={{ transform: `scale(${kbScale})` }} className="transition-transform duration-200 origin-center">
            <div 
              className="grid"
              style={{
                '--key-size': '56px',
                '--key-gap': '6px',
                '--key-grid-unit': 'calc(var(--key-size) / 4)',
                gap: 'var(--key-gap)',
                gridTemplateColumns: 'repeat(95, var(--key-grid-unit))',
                gridAutoRows: 'var(--key-grid-unit)',
              } as React.CSSProperties}
            >
                {KEY_LAYOUT.map(keyDef => (
                   <div key={keyDef.code} style={{ 
                      gridColumn: `${keyDef.x * 4 + 1} / span ${ (keyDef.w || 1) * 4}`, 
                      gridRow: `${keyDef.y * 4 + 1} / span ${(keyDef.h || 1) * 4}`
                    }}>
                     <Key keyDef={keyDef} state={keyStates.get(keyDef.code)} />
                   </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
});

export default KeyboardTester;
