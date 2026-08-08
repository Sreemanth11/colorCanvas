import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, ArrowLeftRight, ChevronDown, ShieldCheck } from 'lucide-react';
import { getContrastRatio } from '../utils/colorUtils';

export default function AccessibilityChecker({ exportTick, saveTick, addToast }) {
  const [fgColor, setFgColor] = useState('#6C63FF');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [contrast, setContrast] = useState(0);
  const [previewSize, setPreviewSize] = useState('large');
  const [isIntroCollapsed, setIsIntroCollapsed] = useState(() => {
    return localStorage.getItem('accessibility-intro-collapsed') === 'true';
  });

  const handleToggleIntro = () => {
    const nextState = !isIntroCollapsed;
    setIsIntroCollapsed(nextState);
    localStorage.setItem('accessibility-intro-collapsed', String(nextState));
  };

  useEffect(() => {
    const ratio = getContrastRatio(fgColor, bgColor);
    setContrast(parseFloat(ratio.toFixed(2)));
  }, [fgColor, bgColor]);

  useEffect(() => {
    if (exportTick > 0) {
      navigator.clipboard.writeText(`Foreground: ${fgColor}, Background: ${bgColor}, Contrast Ratio: ${contrast}:1`);
      addToast('Contrast details copied to clipboard!');
    }
  }, [exportTick, contrast, fgColor, bgColor]);

  useEffect(() => {
    if (saveTick > 0) {
      addToast('Contrast combo saved to collection!');
    }
  }, [saveTick]);

  const handleSwap = () => {
    const temp = fgColor;
    setFgColor(bgColor);
    setBgColor(temp);
  };

  const getOverallStatus = () => {
    if (contrast >= 7.0) return { label: 'PASSES AAA NORMAL', class: 'badge-pass-aaa' };
    if (contrast >= 4.5) return { label: 'PASSES AA NORMAL', class: 'badge-pass-aa' };
    if (contrast >= 3.0) return { label: 'PASSES AA LARGE ONLY', class: 'badge-pass-large' };
    return { label: 'FAILS COMPLIANCE', class: 'badge-fail' };
  };

  const compliance = [
    {
      name: 'WCAG AA Normal Text',
      desc: 'Contrast ratio of 4.5:1 or higher',
      explanation: 'Minimum standard for body copy, labels, and most readable text.',
      pass: contrast >= 4.5
    },
    {
      name: 'WCAG AA Large Text',
      desc: 'Contrast ratio of 3.0:1 or higher',
      explanation: 'Applies to headings and text 18pt+ (or 14pt+ bold) — easier to read at lower contrast.',
      pass: contrast >= 3.0
    },
    {
      name: 'WCAG AAA Normal Text',
      desc: 'Contrast ratio of 7.0:1 or higher',
      explanation: 'Enhanced standard for users with low vision; recommended but not legally required.',
      pass: contrast >= 7.0
    },
    {
      name: 'WCAG AAA Large Text',
      desc: 'Contrast ratio of 4.5:1 or higher',
      explanation: 'Enhanced standard for large text — the highest bar for readability.',
      pass: contrast >= 4.5
    }
  ];

  return (
    <div className="accessibility-container">
      {/* View Header */}
      <div className="view-header">
        <h1 className="view-title">Accessibility Checker</h1>
        <p className="view-subtitle">Verify text readability against WCAG AA and AAA guidelines.</p>
      </div>

      {/* 1. Compact Hero Bar combining numbers and controls */}
      <div className="a11y-hero-card">
        <div className="a11y-hero-contrast">
          <span className="contrast-label">Contrast Ratio</span>
          <div key={contrast} className="contrast-number animate-pop-up">
            {contrast}:1
          </div>
          <span className={`status-badge ${getOverallStatus().class}`}>
            {getOverallStatus().label}
          </span>
        </div>

        <div className="a11y-hero-divider" />

        <div className="a11y-hero-inputs">
          <div className="accessibility-color-pick">
            <span className="converter-field-label">Foreground (Text)</span>
            <div className="accessibility-picker-wrapper">
              <input
                type="color"
                className="color-picker-input"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
              />
              <input
                type="text"
                className="converter-input"
                style={{ textTransform: 'uppercase', padding: 0 }}
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
              />
            </div>
          </div>

          <button
            className="swap-button"
            onClick={handleSwap}
            title="Swap Foreground & Background"
          >
            <ArrowLeftRight size={18} />
          </button>

          <div className="accessibility-color-pick">
            <span className="converter-field-label">Background</span>
            <div className="accessibility-picker-wrapper">
              <input
                type="color"
                className="color-picker-input"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
              />
              <input
                type="text"
                className="converter-input"
                style={{ textTransform: 'uppercase', padding: 0 }}
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Full Width Live Preview Card with glass wrapping */}
      <div className="a11y-preview-container-card">
        <div className="preview-card-header">
          <span className="preview-card-tag">LIVE PREVIEW</span>
          <div className="preview-size-toggle">
            <button
              className={`size-toggle-btn ${previewSize === 'normal' ? 'active' : ''}`}
              onClick={() => setPreviewSize('normal')}
            >
              14px (Normal)
            </button>
            <button
              className={`size-toggle-btn ${previewSize === 'large' ? 'active' : ''}`}
              onClick={() => setPreviewSize('large')}
            >
              20px (Large)
            </button>
          </div>
        </div>
        
        <div 
          className="preview-box"
          style={{
            backgroundColor: bgColor,
            color: fgColor
          }}
        >
          {previewSize === 'large' ? (
            <p style={{ fontSize: '20px', fontWeight: 800, lineHeight: 1.3, margin: 0 }}>
              Aa Large Heading
            </p>
          ) : (
            <p style={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.5, margin: 0 }}>
              Accessibility is a fundamental design principle. It ensures everyone can read and interact with your product.
            </p>
          )}
        </div>
      </div>

      {/* 3. Collapsible Guide Card with Header Summary */}
      <div className={`accessibility-intro-card ${isIntroCollapsed ? 'collapsed' : ''}`}>
        <div className="intro-card-header" onClick={handleToggleIntro}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
            <ShieldCheck size={18} color="var(--accent)" style={{ flexShrink: 0 }} />
            <h2 className="intro-card-title">WCAG 2.1 Contrast Standards</h2>
            {isIntroCollapsed && (
              <span className="intro-card-collapsed-summary">
                AA standard requires 4.5:1 (normal) / 3:1 (large); AAA standard requires 7:1 / 4.5:1.
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
            <a
              href="https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html"
              target="_blank"
              rel="noopener noreferrer"
              className="intro-card-link"
            >
              Learn more &rarr;
            </a>
            <button 
              className="intro-card-toggle" 
              title={isIntroCollapsed ? 'Expand standards description' : 'Collapse standards description'}
              onClick={handleToggleIntro}
            >
              <ChevronDown size={18} style={{ transform: isIntroCollapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform var(--transition-fast)' }} />
            </button>
          </div>
        </div>
        {!isIntroCollapsed && (
          <div className="intro-card-content">
            <p style={{ margin: 0 }}>
              This tool checks contrast ratio compliance against <strong>WCAG 2.1</strong> (Web Content Accessibility Guidelines). 
              <strong> AA</strong> represents standard legal compliance, while <strong>AAA</strong> represents enhanced readability for low-vision users.
            </p>
            <p style={{ margin: 0 }}>
              Contrast thresholds distinguish between <strong>Normal Text</strong> (requires 4.5:1 for AA, 7.0:1 for AAA) and <strong>Large Text</strong> (requires 3.0:1 for AA, 4.5:1 for AAA) because larger font sizes are inherently easier to read.
            </p>
          </div>
        )}
      </div>

      {/* 4. WCAG Guidelines Checklist reflowed into a 2x2 Grid */}
      <div className="accessibility-results-section">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'left', marginBottom: '16px' }}>
          <span className="converter-field-label">WCAG Guidelines Checklist</span>
          <p className="checklist-subtext" style={{ margin: 0 }}>
            AA is standard legal compliance; AAA is enhanced accessibility for low-vision.
          </p>
        </div>

        <div className="wcag-grid">
          {compliance.map((item, index) => (
            <div key={index} className={`wcag-card ${item.pass ? 'pass' : 'fail'}`}>
              <div className="wcag-status-icon-container">
                {item.pass ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              </div>
              <div className="wcag-card-content">
                <div className="wcag-card-header">
                  <span className="wcag-card-name">{item.name}</span>
                  <span className="wcag-card-desc-pill">{item.desc}</span>
                </div>
                <span className="wcag-card-explanation">{item.explanation}</span>
              </div>
              <span className={`pill-badge ${item.pass ? 'pill-pass' : 'pill-fail'}`}>
                {item.pass ? 'Pass' : 'Fail'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
