
import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import type { TesterRef } from '../types';

interface PollingRateTesterProps {
  theme: 'light' | 'dark';
}

interface Sample {
  x: number;
  y: number;
  time: number;
}

const PollingRateTester = forwardRef<TesterRef, PollingRateTesterProps>(({ theme }, ref) => {
  const [stats, setStats] = useState({ current: 0, avg: 0, max: 0, count: 0 });
  const [isMeasuring, setMeasuring] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const samples = useRef<Sample[]>([]);
  const animationFrameId = useRef<number>();

  const reset = () => {
    samples.current = [];
    setStats({ current: 0, avg: 0, max: 0, count: 0 });
    setMeasuring(false);
    if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
    }
    draw();
  };
  
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (samples.current.length < 2) return;

    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent');
    ctx.strokeStyle = `hsl(${accentColor})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    samples.current.forEach((p, i) => {
        if(i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
  }, [theme]);

  const updateStats = useCallback(() => {
      const len = samples.current.length;
      if (len < 2) return;

      const currentSamples = samples.current;
      const last = currentSamples[len - 1];
      const prev = currentSamples[len - 2];
      
      const current = 1000 / (last.time - prev.time);
      const totalTime = last.time - currentSamples[0].time;
      const avg = totalTime > 0 ? (len / totalTime) * 1000 : 0;
      
      setStats(prevStats => ({
          current: Math.round(current),
          avg: Math.round(avg),
          max: Math.round(Math.max(prevStats.max, current)),
          count: len
      }));

      animationFrameId.current = requestAnimationFrame(() => {
          draw();
      });
  }, [draw]);


  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMeasuring) setMeasuring(true);
    
    samples.current.push({
      x: e.nativeEvent.offsetX,
      y: e.nativeEvent.offsetY,
      time: performance.now()
    });
    
    if (samples.current.length > 500) {
      samples.current.shift();
    }
    
    updateStats();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    const ctx = canvas.getContext('2d');
    ctx?.scale(dpr, dpr);
    draw();
    
    const resizeObserver = new ResizeObserver(() => {
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        ctx?.scale(dpr,dpr);
        draw();
    });
    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, [draw]);
  
  useEffect(() => {
    draw();
  }, [theme, draw]);

  useImperativeHandle(ref, () => ({
    getResults: () => {
      return [
        '--- Polling Rate Test Results ---',
        `Average Rate: ${stats.avg} Hz`,
        `Maximum Rate: ${stats.max} Hz`,
      ].join('\n');
    },
    reset,
  }));

  const StatBox = ({ label, value, unit }: {label: string, value: number, unit: string}) => (
    <div className="bg-panel p-3 rounded-lg text-center">
        <div className="text-xs text-muted font-bold">{label}</div>
        <div className="text-2xl text-accent font-extrabold tabular-nums">{value} <span className="text-lg">{unit}</span></div>
    </div>
  );

  return (
    <div className="flex flex-col h-full gap-3 p-3 bg-panel rounded-2xl shadow-main">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBox label="Current Rate" value={stats.current} unit="Hz" />
        <StatBox label="Average Rate" value={stats.avg} unit="Hz" />
        <StatBox label="Maximum Rate" value={stats.max} unit="Hz" />
        <StatBox label="Event Count" value={stats.count} unit="" />
      </div>
      <div 
        className="flex-grow bg-slate-100 dark:bg-slate-800/50 rounded-lg relative cursor-crosshair overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        <canvas ref={canvasRef} className="w-full h-full" />
        {!isMeasuring && (
          <div className="absolute inset-0 grid place-items-center text-muted font-bold pointer-events-none">
            Move mouse quickly over this area
          </div>
        )}
      </div>
    </div>
  );
});

export default PollingRateTester;
