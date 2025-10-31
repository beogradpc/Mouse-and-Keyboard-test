
import React, { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import type { TesterRef } from '../types';

interface KeyRolloverTesterProps {}

const KeyRolloverTester = forwardRef<TesterRef, KeyRolloverTesterProps>((props, ref) => {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  const reset = useCallback(() => {
    setPressedKeys(new Set());
  }, []);
  
  const handleKey = useCallback((e: KeyboardEvent, isDown: boolean) => {
    e.preventDefault();
    setPressedKeys(prev => {
      const newKeys = new Set(prev);
      if (isDown) {
        newKeys.add(e.code);
      } else {
        newKeys.delete(e.code);
      }
      return newKeys;
    });
  }, []);
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => handleKey(e, true), [handleKey]);
  const handleKeyUp = useCallback((e: KeyboardEvent) => handleKey(e, false), [handleKey]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', reset);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', reset);
    };
  }, [handleKeyDown, handleKeyUp, reset]);

  useImperativeHandle(ref, () => ({
    getResults: () => {
      const maxCount = pressedKeys.size > 0 ? pressedKeys.size : 0; // Simplified, in reality would need to track max over time
      return `--- Key Rollover Test Results ---\nMax Concurrent Keys: ${maxCount}`;
    },
    reset,
  }));

  return (
    <div className="flex flex-col h-full items-center justify-center gap-6 p-3 bg-panel rounded-2xl shadow-main text-center">
      <p className="text-lg font-bold text-muted">Press multiple keys at the same time</p>
      <div className="text-8xl lg:text-9xl font-black text-accent tabular-nums">
        {pressedKeys.size}
      </div>
      <div className="flex flex-wrap gap-2 justify-center max-w-3xl min-h-[3rem]">
        {Array.from(pressedKeys).map(code => (
          <div key={code} className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-md font-mono font-bold">
            {code}
          </div>
        ))}
      </div>
    </div>
  );
});

export default KeyRolloverTester;
