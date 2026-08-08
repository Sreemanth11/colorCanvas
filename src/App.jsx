import React, { useState, useEffect, useRef } from 'react';
import Topbar from './components/Topbar';
import PaletteGenerator from './components/PaletteGenerator';
import GradientBuilder from './components/GradientBuilder';
import AccessibilityChecker from './components/AccessibilityChecker';
import ColorConverter from './components/ColorConverter';
import { Check, AlertTriangle } from 'lucide-react';
import ClickSpark from './components/ClickSpark';
import ColorBends from './components/ColorBends/ColorBends';

export default function App() {
  const [activeTab, setActiveTab] = useState('palette');
  const [toasts, setToasts] = useState([]);
  
  // Triggers for context-specific topbar actions
  const [generateTick, setGenerateTick] = useState(0);
  const [exportTick, setExportTick] = useState(0);
  const [saveTick, setSaveTick] = useState(0);

  // Helper to trigger toast alerts
  const addToast = (message) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  };

  // Bind Spacebar keypress to palette generation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.code === 'Space' &&
        activeTab === 'palette' &&
        document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'TEXTAREA' &&
        !document.activeElement.classList.contains('hsl-slider')
      ) {
        e.preventDefault();
        setGenerateTick((prev) => prev + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  const handleGenerate = () => {
    setGenerateTick((prev) => prev + 1);
  };

  const handleExport = () => {
    setExportTick((prev) => prev + 1);
  };

  const handleSave = () => {
    setSaveTick((prev) => prev + 1);
  };

  return (
    <ClickSpark sparkColor="#F5F5FA" sparkRadius={48} sparkSize={16}>
      <div className="app-layout">
        <ColorBends
          colors={["#2C265A", "#12334A", "#352050"]}
          rotation={90}
          speed={0.12}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={1}
          noise={0.15}
          parallax={0.5}
          iterations={1}
          intensity={0.78}
          bandWidth={6}
          transparent
          autoRotate={0}
          className="grainient-bg"
        />
        <Topbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onGenerate={handleGenerate}
          onExport={handleExport}
          onSave={handleSave}
        />
        
        <main className="main-content">
          
          <div className="view-container">
            {activeTab === 'palette' && (
              <PaletteGenerator
                generateTick={generateTick}
                exportTick={exportTick}
                saveTick={saveTick}
                addToast={addToast}
              />
            )}
            {activeTab === 'gradient' && (
              <GradientBuilder
                exportTick={exportTick}
                saveTick={saveTick}
                addToast={addToast}
              />
            )}
            {activeTab === 'accessibility' && (
              <AccessibilityChecker
                exportTick={exportTick}
                saveTick={saveTick}
                addToast={addToast}
              />
            )}
            {activeTab === 'converter' && (
              <ColorConverter
                exportTick={exportTick}
                saveTick={saveTick}
                addToast={addToast}
              />
            )}
          </div>
        </main>

        {/* Global Toast Alerts */}
        <div className="toast-container">
          {toasts.map((toast) => {
            const isWarning = toast.message.toLowerCase().includes('require') || 
                              toast.message.toLowerCase().includes('unlock') ||
                              toast.message.toLowerCase().includes('at least');
            return (
              <div key={toast.id} className={`toast ${isWarning ? 'toast-warning' : 'toast-success'}`}>
                <div className="toast-icon-wrapper">
                  {isWarning ? <AlertTriangle size={20} /> : <Check size={20} />}
                </div>
                <span className="toast-title">{isWarning ? 'Warning' : 'Success'}</span>
                <p className="toast-message">{toast.message}</p>
              </div>
            );
          })}
        </div>
      </div>
    </ClickSpark>
  );
}
