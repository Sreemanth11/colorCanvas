import React, { useState, useEffect } from 'react';
import { Copy, Sparkles, ArrowLeftRight } from 'lucide-react';
import { 
  hexToRgb, 
  rgbToHex, 
  rgbToHsl, 
  hslToRgb, 
  hslToHex, 
  hexToHsl, 
  hexToCmyk, 
  cmykToHex,
  getRandomColor,
  getContrastColor
} from '../utils/colorUtils';

export default function ColorConverter({ exportTick, saveTick, addToast }) {
  const [color, setColor] = useState('#6C63FF');
  const textColor = getContrastColor(color);
  const [hexInput, setHexInput] = useState('#6C63FF');
  const [rgbInput, setRgbInput] = useState('108, 99, 255');
  const [hslInput, setHslInput] = useState('243°, 100%, 69%');
  const [cmykInput, setCmykInput] = useState('58%, 61%, 0%, 0%');

  // Synchronize all fields from the base state color
  useEffect(() => {
    setHexInput(color);
    const { r, g, b } = hexToRgb(color);
    setRgbInput(`${r}, ${g}, ${b}`);
    const { h, s, l } = rgbToHsl({ r, g, b });
    setHslInput(`${h}°, ${s}%, ${l}%`);
    const cmyk = hexToCmyk(color);
    setCmykInput(`${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`);
  }, [color]);

  // Listen to Topbar actions
  useEffect(() => {
    if (exportTick > 0) {
      navigator.clipboard.writeText(color);
      addToast(`Hex color ${color} copied to clipboard!`);
    }
  }, [exportTick, color]);

  useEffect(() => {
    if (saveTick > 0) {
      addToast(`Saved color ${color} to collection!`);
    }
  }, [saveTick]);

  const handleHexChange = (e) => {
    const val = e.target.value;
    setHexInput(val);
    if (/^#[0-9A-F]{6}$/i.test(val) || /^#[0-9A-F]{3}$/i.test(val)) {
      setColor(val);
    }
  };

  const handleRgbChange = (e) => {
    const val = e.target.value;
    setRgbInput(val);
    const parts = val.split(',').map((p) => parseInt(p.trim(), 10));
    if (parts.length === 3 && parts.every((num) => !isNaN(num) && num >= 0 && num <= 255)) {
      setColor(rgbToHex(parts[0], parts[1], parts[2]));
    }
  };

  const handleHslChange = (e) => {
    const val = e.target.value;
    setHslInput(val);
    const matches = val.match(/(\d+)\D+(\d+)\D+(\d+)/);
    if (matches) {
      const h = parseInt(matches[1], 10);
      const s = parseInt(matches[2], 10);
      const l = parseInt(matches[3], 10);
      if (h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100) {
        setColor(hslToHex(h, s, l));
      }
    }
  };

  const handleCmykChange = (e) => {
    const val = e.target.value;
    setCmykInput(val);
    const matches = val.match(/(\d+)\D+(\d+)\D+(\d+)\D+(\d+)/);
    if (matches) {
      const c = parseInt(matches[1], 10);
      const m = parseInt(matches[2], 10);
      const y = parseInt(matches[3], 10);
      const k = parseInt(matches[4], 10);
      if (c >= 0 && c <= 100 && m >= 0 && m <= 100 && y >= 0 && y <= 100 && k >= 0 && k <= 100) {
        setColor(cmykToHex(c, m, y, k));
      }
    }
  };

  const copyToClipboard = (text, formatName) => {
    navigator.clipboard.writeText(text);
    addToast(`${formatName} copied to clipboard!`);
  };

  const triggerRandomColor = () => {
    setColor(getRandomColor());
  };

  const invertColor = () => {
    const { r, g, b } = hexToRgb(color);
    const invertedHex = rgbToHex(255 - r, 255 - g, 255 - b);
    setColor(invertedHex);
  };

  return (
    <div className="converter-container">
      <div className="view-header">
        <h1 className="view-title">Color Converter</h1>
        <p className="view-subtitle">Convert colors instantly between HEX, RGB, HSL, and CMYK formats.</p>
      </div>

      <div className="converter-grid">
        {/* Large Preview Swatch Left */}
        <div className="converter-left">
          <div className="converter-swatch" style={{ backgroundColor: color }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="converter-picker-btn" 
                onClick={triggerRandomColor}
                style={{
                  color: textColor,
                  backgroundColor: textColor !== '#FFFFFF' ? 'rgba(255, 255, 255, 0.75)' : 'rgba(0, 0, 0, 0.4)',
                  borderColor: textColor !== '#FFFFFF' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.15)'
                }}
              >
                <Sparkles size={16} />
                <span>Randomize</span>
              </button>
              <button 
                className="converter-picker-btn" 
                onClick={invertColor} 
                title="Invert color"
                style={{
                  color: textColor,
                  backgroundColor: textColor !== '#FFFFFF' ? 'rgba(255, 255, 255, 0.75)' : 'rgba(0, 0, 0, 0.4)',
                  borderColor: textColor !== '#FFFFFF' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.15)'
                }}
              >
                <ArrowLeftRight size={16} />
                <span>Invert</span>
              </button>
            </div>
          </div>

          {/* Swatch color picker row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
            <span className="converter-field-label">Color Swatch Trigger</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Click to pick:</span>
              <input
                type="color"
                className="color-picker-input"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Stacked Input Fields Right */}
        <div className="converter-right">
          <div className="converter-field">
            <label className="converter-field-label">Hex Code</label>
            <div className="converter-input-wrapper">
              <input
                type="text"
                className="converter-input"
                value={hexInput}
                onChange={handleHexChange}
                placeholder="#FFFFFF"
              />
              <button className="converter-copy-btn" onClick={() => copyToClipboard(hexInput, 'HEX')} title="Copy HEX">
                <Copy size={16} />
              </button>
            </div>
          </div>

          <div className="converter-field">
            <label className="converter-field-label">RGB Format</label>
            <div className="converter-input-wrapper">
              <input
                type="text"
                className="converter-input"
                value={rgbInput}
                onChange={handleRgbChange}
                placeholder="255, 255, 255"
              />
              <button className="converter-copy-btn" onClick={() => copyToClipboard(rgbInput, 'RGB')} title="Copy RGB">
                <Copy size={16} />
              </button>
            </div>
          </div>

          <div className="converter-field">
            <label className="converter-field-label">HSL Format</label>
            <div className="converter-input-wrapper">
              <input
                type="text"
                className="converter-input"
                value={hslInput}
                onChange={handleHslChange}
                placeholder="0°, 0%, 100%"
              />
              <button className="converter-copy-btn" onClick={() => copyToClipboard(hslInput, 'HSL')} title="Copy HSL">
                <Copy size={16} />
              </button>
            </div>
          </div>

          <div className="converter-field">
            <label className="converter-field-label">CMYK Format</label>
            <div className="converter-input-wrapper">
              <input
                type="text"
                className="converter-input"
                value={cmykInput}
                onChange={handleCmykChange}
                placeholder="0%, 0%, 0%, 0%"
              />
              <button className="converter-copy-btn" onClick={() => copyToClipboard(cmykInput, 'CMYK')} title="Copy CMYK">
                <Copy size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
