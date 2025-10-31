
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { TestView, TesterRef } from './types';
import ClickTester from './components/ClickTester';
import PollingRateTester from './components/PollingRateTester';
import KeyboardTester from './components/KeyboardTester';
import KeyRolloverTester from './components/KeyRolloverTester';
import { SunIcon, MoonIcon, SoundOnIcon, SoundOffIcon, HelpIcon } from './components/Icons';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<TestView>('clicks');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return (savedTheme as 'light' | 'dark') || (prefersDark ? 'dark' : 'light');
  });
  const [isSoundOn, setSoundOn] = useState(() => localStorage.getItem('sound') === 'on');
  const [kbScale, setKbScale] = useState(() => parseInt(localStorage.getItem('kbScale') || '80', 10));
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false });
  const [isHelpOpen, setHelpOpen] = useState(false);

  const viewRefs = {
    clicks: useRef<TesterRef>(null),
    polling: useRef<TesterRef>(null),
    keyboard: useRef<TesterRef>(null),
    rollover: useRef<TesterRef>(null),
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('sound', isSoundOn ? 'on' : 'off');
  }, [isSoundOn]);

  useEffect(() => {
    localStorage.setItem('kbScale', String(kbScale));
  }, [kbScale]);

  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: '', show: false }), 2000);
  };

  const handleReset = () => {
    viewRefs[activeView].current?.reset();
    showToast(`${activeView.charAt(0).toUpperCase() + activeView.slice(1)} Test Reset`);
  };

  const handleExport = async () => {
    const resultsPromises = Object.values(viewRefs).map(ref => ref.current?.getResults() || Promise.resolve(''));
    const results = await Promise.all(resultsPromises);
    
    const nonEmptyResults = results.filter(r => {
        if (!r) return false;
        if (r.includes('Key Rollover') && r.includes('Max Concurrent Keys: 0')) return false;
        return true;
    });

    const now = new Date();
    const timestamp = now.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'medium' });
    const report = `TESTING REPORT\nDate: ${timestamp}\n\n${nonEmptyResults.join('\n\n')}`;
    
    try {
      await navigator.clipboard.writeText(report.trim());
      showToast('All results copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy results:', err);
      showToast('Error copying results.');
    }
  };

  const renderView = () => {
    const commonProps = { theme, isSoundOn };
    switch (activeView) {
      case 'clicks':
        return <ClickTester ref={viewRefs.clicks} {...commonProps} />;
      case 'polling':
        return <PollingRateTester ref={viewRefs.polling} {...commonProps} />;
      case 'keyboard':
        return <KeyboardTester ref={viewRefs.keyboard} {...commonProps} kbScale={kbScale / 100} />;
      case 'rollover':
        return <KeyRolloverTester ref={viewRefs.rollover} {...commonProps} />;
      default:
        return null;
    }
  };
  
  const NavButton = useCallback(({ view, children }: { view: TestView; children: React.ReactNode }) => (
    <button
      className={`px-4 py-2 rounded-full font-bold transition-colors duration-200 text-sm ${
        activeView === view
          ? 'bg-accent-weak text-accent-ink shadow-inner'
          : 'text-ink hover:bg-panel'
      }`}
      onClick={() => setActiveView(view)}
    >
      {children}
    </button>
  ), [activeView]);

  return (
    <div className="flex flex-col h-screen bg-app-bg text-ink overflow-hidden p-2.5">
      <header className="fixed top-2.5 left-2.5 right-2.5 z-20 flex justify-between items-start gap-4">
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-full font-bold bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/50 hover:bg-red-200 dark:hover:bg-red-900 transition-colors shadow-main backdrop-blur-sm"
          >
            RESET
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-full font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors shadow-main backdrop-blur-sm"
          >
            Export Results
          </button>
        </div>
        
        <nav className="flex items-center gap-2 p-2 rounded-full bg-white/70 dark:bg-slate-900/70 border border-panel-border shadow-main backdrop-blur-sm">
          <NavButton view="clicks">Click Test</NavButton>
          <NavButton view="polling">Polling Test</NavButton>
          <NavButton view="keyboard">Keyboard Test</NavButton>
          <NavButton view="rollover">Key Rollover</NavButton>
        </nav>

        <div className="p-3 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-panel-border shadow-main backdrop-blur-sm flex flex-col items-end gap-2.5 w-[330px]">
          <div className="flex items-center gap-4">
            <button onClick={() => setSoundOn(!isSoundOn)} className="text-muted hover:text-ink transition">
              {isSoundOn ? <SoundOnIcon /> : <SoundOffIcon />}
            </button>
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="text-muted hover:text-ink transition">
              {theme === 'light' ? <SunIcon /> : <MoonIcon />}
            </button>
            <button onClick={() => setHelpOpen(true)} className="w-8 h-8 grid place-items-center bg-orange-500 text-white rounded-lg font-bold text-lg hover:bg-orange-600 transition">
              ?
            </button>
          </div>
          {activeView === 'keyboard' && (
            <div className="flex items-center gap-2 w-full">
              <label htmlFor="kbScale" className="text-xs font-bold text-muted whitespace-nowrap">Keyboard Scale</label>
              <input 
                id="kbScale" 
                type="range" 
                min="70" 
                max="120" 
                value={kbScale}
                onChange={(e) => setKbScale(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-bold text-accent w-12 text-right">{kbScale}%</span>
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow pt-[100px] rounded-2xl">
        {renderView()}
      </main>

      {/* Toast Notification */}
      <div className={`fixed top-5 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-slate-800 text-white font-bold shadow-lg transition-all duration-300 ${toast.show ? 'opacity-100 translate-y-16' : 'opacity-0'}`}>
        {toast.message}
      </div>

      {/* Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-center justify-center" onClick={() => setHelpOpen(false)}>
          <div className="bg-panel rounded-2xl p-6 max-w-2xl w-[95%] shadow-main text-ink" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">User Guide</h2>
              <button onClick={() => setHelpOpen(false)} className="text-2xl text-muted hover:text-ink">&times;</button>
            </div>
            <div className="text-muted space-y-4 max-h-[70vh] overflow-y-auto pr-2 text-sm">
              <div>
                <h3 className="font-bold text-accent mb-1">Click Test</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Click the orange area to test mouse buttons (left, middle, right).</li>
                  <li>Track total clicks and fast double-clicks.</li>
                  <li>Adjust the double-click detection threshold with the slider.</li>
                  <li>Scroll anywhere on the page to test the mouse wheel.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-accent mb-1">Polling Rate Test</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Move your mouse quickly over the gray area to measure the Polling Rate in Hz.</li>
                  <li>Displays current, average, and maximum measured values.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-accent mb-1">Keyboard Test</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Press any key to see if it registers on the virtual keyboard.</li>
                  <li>Track information about the last key pressed, its hold time, and typing speed (CPS).</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-accent mb-1">Key Rollover Test</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Press multiple keys at once to check how many keys your keyboard can register simultaneously.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-accent mb-1">Main Controls</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li><b>RESET:</b> Resets statistics for the currently active test.</li>
                  <li><b>Export Results:</b> Copies all results from all tests to your clipboard.</li>
                  <li><b>Keyboard Scale:</b> Changes the size of the virtual keyboard (only in Keyboard Test).</li>
                  <li><b>🔊/🔇:</b> Toggles sound effects on or off.</li>
                  <li><b>☀️/🌙:</b> Switches between light and dark themes.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
