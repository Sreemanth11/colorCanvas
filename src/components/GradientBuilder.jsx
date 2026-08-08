import React, { useState, useEffect } from 'react';
import { Copy, Plus, Trash2, Check, ArrowLeftRight } from 'lucide-react';

export default function GradientBuilder({ exportTick, saveTick, addToast }) {
  const [stops, setStops] = useState([
    { id: 1, color: '#6C63FF', position: 0 },
    { id: 2, color: '#FF6584', position: 100 }
  ]);
  const [activeStopId, setActiveStopId] = useState(1);
  const [angle, setAngle] = useState(90);
  const [copied, setCopied] = useState(false);

  // Sorting stops by position for gradient rendering
  const sortedStops = [...stops].sort((a, b) => a.position - b.position);
  
  // Build the gradient CSS string
  const gradientString = `linear-gradient(${angle}deg, ${sortedStops
    .map((s) => `${s.color} ${s.position}%`)
    .join(', ')})`;

  const cssCode = `background: ${gradientString};`;

  // Listen to Topbar actions
  useEffect(() => {
    if (exportTick > 0) {
      copyCSS();
    }
  }, [exportTick]);

  useEffect(() => {
    if (saveTick > 0) {
      addToast('Gradient preset saved!');
    }
  }, [saveTick]);

  const copyCSS = () => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    addToast('CSS copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBarClick = (e) => {
    // If clicking directly on the bar and not a marker, add a new stop
    if (e.target.classList.contains('gradient-stops-bar')) {
      const rect = e.target.getBoundingClientRect();
      let clickPos = ((e.clientX - rect.left) / rect.width) * 100;
      clickPos = Math.max(0, Math.min(100, Math.round(clickPos)));

      // Interpolate color at click position
      const newStop = {
        id: Date.now(),
        color: '#FFFFFF',
        position: clickPos
      };

      setStops((prev) => [...prev, newStop]);
      setActiveStopId(newStop.id);
      addToast('Added a new stop. Click it to adjust color.');
    }
  };

  const handleStartDrag = (id, e) => {
    e.preventDefault();
    setActiveStopId(id);
    const bar = document.getElementById('stops-bar');
    if (!bar) return;
    const rect = bar.getBoundingClientRect();

    const handleMouseMove = (moveEvent) => {
      let percentage = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      percentage = Math.max(0, Math.min(100, Math.round(percentage)));
      setStops((prev) =>
        prev.map((stop) => (stop.id === id ? { ...stop, position: percentage } : stop))
      );
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const removeStop = (id) => {
    if (stops.length <= 2) {
      addToast('A gradient requires at least 2 stops!');
      return;
    }
    const newStops = stops.filter((s) => s.id !== id);
    setStops(newStops);
    if (activeStopId === id) {
      setActiveStopId(newStops[0].id);
    }
    addToast('Removed stop');
  };

  const updateColor = (id, color) => {
    setStops((prev) =>
      prev.map((stop) => (stop.id === id ? { ...stop, color } : stop))
    );
  };

  const activeStop = stops.find((s) => s.id === activeStopId);

  const reverseGradient = () => {
    setStops((prev) =>
      prev.map((stop) => ({
        ...stop,
        position: 100 - stop.position
      }))
    );
    addToast('Reversed gradient direction!');
  };

  return (
    <div className="gradient-container">
      <div className="view-header">
        <h1 className="view-title">Gradient Builder</h1>
        <p className="view-subtitle">Create and customize CSS linear gradients with interactive stops.</p>
      </div>

      <div className="gradient-preview-panel">
        {/* Large Preview */}
        <div 
          className="gradient-canvas" 
          style={{ background: gradientString }}
        />

        {/* Draggable Stop Bar */}
        <div className="gradient-controls-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="hsl-slider-label">
            <span>Stops Bar</span>
            <span style={{ fontSize: '11px', opacity: 0.6 }}>Click the bar to add, drag to move, click to edit color</span>
          </div>
          
          <div 
            id="stops-bar" 
            className="gradient-stops-bar"
            onClick={handleBarClick}
          >
            {stops.map((stop) => (
              <div
                key={stop.id}
                className={`gradient-stop-marker ${activeStopId === stop.id ? 'active' : ''}`}
                style={{ left: `${stop.position}%` }}
                onMouseDown={(e) => handleStartDrag(stop.id, e)}
              >
                <div 
                  className="gradient-stop-pin" 
                  style={{ backgroundColor: stop.color }}
                />
                <div className="gradient-stop-pointer" />
              </div>
            ))}
          </div>
        </div>

        {/* Adjust Active Stop & Controls */}
        <div className="gradient-controls">
          {activeStop ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span className="converter-field-label">Active Stop Color</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="color"
                    className="color-picker-input"
                    value={activeStop.color}
                    onChange={(e) => updateColor(activeStop.id, e.target.value)}
                  />
                  <input
                    type="text"
                    className="converter-input"
                    style={{ 
                      width: '100px', 
                      background: 'rgba(255, 255, 255, 0.14)', 
                      backdropFilter: 'blur(20px)',
                      border: '1.5px solid rgba(255, 255, 255, 0.22)',
                      borderTopColor: 'rgba(255, 255, 255, 0.35)',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      fontSize: '13px',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)',
                      textTransform: 'uppercase',
                      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
                    }}
                    value={activeStop.color}
                    onChange={(e) => updateColor(activeStop.id, e.target.value)}
                  />
                  {stops.length > 2 && (
                    <button 
                      className="btn-icon" 
                      onClick={() => removeStop(activeStop.id)}
                      style={{ padding: '8px', color: '#EF4444', borderColor: 'rgba(239,68,68,0.2)' }}
                      title="Remove stop"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                  <button 
                    className="btn-icon" 
                    onClick={reverseGradient}
                    style={{ padding: '8px' }}
                    title="Reverse gradient directions"
                  >
                    <ArrowLeftRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Select a stop to edit</div>
          )}

          {/* Angle Control */}
          <div className="gradient-slider-container" style={{ maxWidth: '240px' }}>
            <div className="hsl-slider-label" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span>Angle</span>
                <span>{angle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={angle}
                className="hsl-slider"
                onChange={(e) => setAngle(parseInt(e.target.value, 10))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Code Block CSS display */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span className="converter-field-label">Generated CSS</span>
        <div className="code-block-container">
          <div className="code-block-text">{cssCode}</div>
          <button 
            className="btn-primary" 
            onClick={copyCSS}
            style={{ 
              padding: '6px 12px', 
              fontSize: '12px', 
              boxShadow: 'none',
              backgroundColor: copied ? '#10B981' : 'var(--accent)'
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy CSS'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
