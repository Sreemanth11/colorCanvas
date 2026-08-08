import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Copy, Sliders, RefreshCw, Trash2, Eye, X, Plus, Edit3 } from 'lucide-react';
import { 
  generateRandomPalette, 
  getContrastColor, 
  getColorName, 
  hexToHsl, 
  hslToHex, 
  getRandomColor,
  getAutoLabels
} from '../utils/colorUtils';

const ALL_POSSIBLE_LABELS = ['Background', 'Text', 'Button', 'Border', 'Theme Color', 'Neutral'];

const TRENDING_PALETTES = [
  ['#2B2D42', '#8D99AE', '#EDF2F4', '#EF233C', '#D90429'],
  ['#1A5F7A', '#57C5B6', '#159895', '#002B5B', '#FFFEE4'],
  ['#F72585', '#7209B7', '#3F37C9', '#4361EE', '#4CC9F0'],
  ['#E63946', '#F1FAEE', '#A8DADC', '#457B9D', '#1D3557'],
  ['#003049', '#D62828', '#F77F00', '#FCBF49', '#EAE2B7'],
];

export default function PaletteGenerator({ generateTick, exportTick, saveTick, addToast }) {
  const [swatches, setSwatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeAdjustIndex, setActiveAdjustIndex] = useState(null);
  const [activeLabelPopoverIndex, setActiveLabelPopoverIndex] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Initialize swatches
  useEffect(() => {
    setSwatches(generateRandomPalette());
  }, []);

  // Listen for generation trigger from App shell
  useEffect(() => {
    if (generateTick > 0) {
      triggerGeneration();
    }
  }, [generateTick]);

  // Listen for export trigger
  useEffect(() => {
    if (exportTick > 0 && swatches.length > 0) {
      const exportList = swatches.map(s => `${s.hex} (${s.labels.join(', ')})`).join(', ');
      navigator.clipboard.writeText(exportList);
      addToast(`Palette copied with metadata: ${exportList}`);
    }
  }, [exportTick, swatches]);

  // Listen for save trigger
  useEffect(() => {
    if (saveTick > 0) {
      addToast('Palette saved to your collection!');
    }
  }, [saveTick]);

  const triggerGeneration = () => {
    setLoading(true);
    // Simulating quick generation/shimmer effect for premium feel
    setTimeout(() => {
      setSwatches((prev) => generateRandomPalette(prev));
      setLoading(false);
      setActiveAdjustIndex(null);
      setActiveLabelPopoverIndex(null);
    }, 200);
  };

  const toggleLock = (index) => {
    setSwatches((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, locked: !item.locked } : item))
    );
  };

  const copyHex = (hex) => {
    navigator.clipboard.writeText(hex);
    addToast(`Copied ${hex} to clipboard!`);
  };

  const deleteColumn = (index) => {
    // Replace with a new color instead of full deletion to keep 5 columns
    if (swatches[index].locked) {
      addToast("Unlock the column first to change it!");
      return;
    }
    const newHex = getRandomColor();
    setSwatches((prev) =>
      prev.map((item, idx) => (idx === index ? { 
        hex: newHex, 
        locked: false,
        labels: getAutoLabels(newHex),
        isOverridden: false
      } : item))
    );
    addToast("Regenerated color for this column");
  };

  // Adjust HSL slider adjustments
  const handleHslChange = (index, channel, value) => {
    setSwatches((prev) => {
      return prev.map((item, idx) => {
        if (idx !== index) return item;
        const currentHsl = hexToHsl(item.hex);
        currentHsl[channel] = parseInt(value, 10);
        const newHex = hslToHex(currentHsl.h, currentHsl.s, currentHsl.l);
        return { 
          ...item, 
          hex: newHex,
          labels: getAutoLabels(newHex),
          isOverridden: false
        };
      });
    });
  };

  const handleOpenLabelPopover = (index, e) => {
    e.stopPropagation();
    setActiveLabelPopoverIndex(activeLabelPopoverIndex === index ? null : index);
    setActiveAdjustIndex(null); // Close HSL popover
  };

  const handleOpenHslAdjust = (index, e) => {
    e.stopPropagation();
    setActiveAdjustIndex(activeAdjustIndex === index ? null : index);
    setActiveLabelPopoverIndex(null); // Close label popover
  };

  const handleSwatchClick = () => {
    // Close any open popovers when clicking on the swatch body
    setActiveLabelPopoverIndex(null);
    setActiveAdjustIndex(null);
  };

  const handleDismissLabel = (swatchIndex, labelToDismiss, e) => {
    e.stopPropagation();
    setSwatches((prev) =>
      prev.map((item, idx) => {
        if (idx !== swatchIndex) return item;
        const newLabels = item.labels.filter((lbl) => lbl !== labelToDismiss);
        return {
          ...item,
          labels: newLabels,
          isOverridden: true
        };
      })
    );
  };

  const handleToggleLabel = (swatchIndex, labelToToggle) => {
    setSwatches((prev) =>
      prev.map((item, idx) => {
        if (idx !== swatchIndex) return item;
        const isAlreadySelected = item.labels.includes(labelToToggle);
        const newLabels = isAlreadySelected
          ? item.labels.filter((lbl) => lbl !== labelToToggle)
          : [...item.labels, labelToToggle];
        return {
          ...item,
          labels: newLabels,
          isOverridden: true
        };
      })
    );
  };

  // Drag and drop sorting handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleDrop = (e, index) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const items = [...swatches];
    const draggedItem = items[draggedIndex];
    items.splice(draggedIndex, 1);
    items.splice(index, 0, draggedItem);
    setSwatches(items);
    setDraggedIndex(null);
  };

  const loadTrending = (palette) => {
    setSwatches(palette.map(hex => ({ 
      hex, 
      locked: false,
      labels: getAutoLabels(hex),
      isOverridden: false
    })));
    addToast("Loaded trending palette!");
  };

  return (
    <div className="palette-container">
      <div className="view-header">
        <h1 className="view-title">Palette Generator</h1>
        <p className="view-subtitle">Generate beautiful, cohesive color harmonies with spacebar.</p>
      </div>

      <div className="palette-swatches">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="palette-skeleton" />
          ))
        ) : (
          swatches.map((swatch, index) => {
            const textColor = getContrastColor(swatch.hex);
            const isAdjusting = activeAdjustIndex === index;
            const hslVal = hexToHsl(swatch.hex);

            return (
              <div
                key={index}
                className={`palette-swatch ${swatch.locked ? 'locked' : ''}`}
                style={{ backgroundColor: swatch.hex }}
                draggable
                onClick={handleSwatchClick}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
              >
                {/* Lock Padlock Indicator */}
                {swatch.locked && (
                  <div 
                    className="lock-indicator" 
                    style={{ 
                      color: textColor, 
                      backgroundColor: textColor !== '#FFFFFF' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.3)',
                      border: `1px solid ${textColor !== '#FFFFFF' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.2)'}`
                    }}
                  >
                    <Lock size={16} />
                  </div>
                )}

                {/* Swatch Toolbar Options */}
                <div 
                  className="palette-swatch-toolbar" 
                  onClick={(e) => e.stopPropagation()}
                  style={{ 
                    color: textColor,
                    '--toolbar-btn-hover': textColor !== '#FFFFFF' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.18)'
                  }}
                >
                  <button 
                    className="toolbar-btn" 
                    onClick={() => toggleLock(index)}
                    title={swatch.locked ? "Unlock color" : "Lock color"}
                  >
                    {swatch.locked ? <Lock size={16} /> : <Unlock size={16} />}
                  </button>
                  <button 
                    className="toolbar-btn" 
                    onClick={() => copyHex(swatch.hex)}
                    title="Copy HEX"
                  >
                    <Copy size={16} />
                  </button>
                  <button 
                    className={`toolbar-btn ${isAdjusting ? 'active' : ''}`} 
                    onClick={(e) => handleOpenHslAdjust(index, e)}
                    title="Adjust HSL"
                  >
                    <Sliders size={16} />
                  </button>
                  <button 
                    className="toolbar-btn" 
                    onClick={() => deleteColumn(index)}
                    title="Regenerate color"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* HSL Sliders Popover */}
                {isAdjusting && (
                  <div className="hsl-popover" style={{ bottom: '130px' }} onClick={(e) => e.stopPropagation()}>
                    <div className="hsl-slider-group">
                      <div className="hsl-slider-label">
                        <span>Hue</span>
                        <span>{hslVal.h}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={hslVal.h}
                        className="hsl-slider"
                        onChange={(e) => handleHslChange(index, 'h', e.target.value)}
                      />
                    </div>
                    <div className="hsl-slider-group">
                      <div className="hsl-slider-label">
                        <span>Saturation</span>
                        <span>{hslVal.s}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={hslVal.s}
                        className="hsl-slider"
                        onChange={(e) => handleHslChange(index, 's', e.target.value)}
                      />
                    </div>
                    <div className="hsl-slider-group">
                      <div className="hsl-slider-label">
                        <span>Lightness</span>
                        <span>{hslVal.l}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={hslVal.l}
                        className="hsl-slider"
                        onChange={(e) => handleHslChange(index, 'l', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Label Manager Popover */}
                {activeLabelPopoverIndex === index && (
                  <div className="label-popover" style={{ bottom: '130px' }} onClick={(e) => e.stopPropagation()}>
                    <div className="label-popover-header" style={{ color: 'var(--text-secondary)' }}>Assign Labels</div>
                    <div className="label-popover-chips">
                      {ALL_POSSIBLE_LABELS.map((lbl) => {
                        const isSelected = swatch.labels && swatch.labels.includes(lbl);
                        return (
                          <button
                            key={lbl}
                            className={`label-chip ${isSelected ? 'active' : ''}`}
                            onClick={() => handleToggleLabel(index, lbl)}
                          >
                            {lbl}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Bottom Color Labels */}
                <div className="palette-swatch-info" style={{ color: textColor }}>
                  {/* Swatch Usage Labels */}
                  <div className="swatch-labels-container" onClick={(e) => e.stopPropagation()}>
                    {swatch.labels && swatch.labels.map((label) => {
                      const pillBg = textColor !== '#FFFFFF' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.18)';
                      const pillBorder = textColor !== '#FFFFFF' 
                        ? (swatch.isOverridden ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.16)') 
                        : (swatch.isOverridden ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.22)');
                      return (
                        <span 
                          key={label} 
                          className={`swatch-label-pill ${swatch.isOverridden ? 'overridden' : ''}`}
                          style={{ 
                            backgroundColor: pillBg, 
                            borderColor: pillBorder, 
                            color: textColor 
                          }}
                        >
                          <span onClick={(e) => handleOpenLabelPopover(index, e)} className="label-text">
                            {swatch.isOverridden && <Edit3 size={9} style={{ marginRight: '3px', verticalAlign: 'middle' }} />}
                            {label}
                          </span>
                          <button 
                            className="label-dismiss-btn" 
                            onClick={(e) => handleDismissLabel(index, label, e)}
                            title={`Dismiss ${label}`}
                            style={{ color: textColor }}
                          >
                            <X size={10} />
                          </button>
                        </span>
                      );
                    })}
                    
                    <button 
                      className="add-label-btn" 
                      onClick={(e) => handleOpenLabelPopover(index, e)}
                      title="Manage labels"
                      style={{ 
                        color: textColor,
                        backgroundColor: textColor !== '#FFFFFF' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                        borderColor: textColor !== '#FFFFFF' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.15)',
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }}
                    >
                      <Plus size={10} />
                    </button>
                  </div>

                  <span className="palette-swatch-hex">{swatch.hex}</span>
                  <span className="palette-swatch-name">{getColorName(swatch.hex)}</span>
                </div>

                {/* Subtle dark overlay for premium aesthetics */}
                <div className="palette-swatch-overlay" />
              </div>
            );
          })
        )}
      </div>

      {/* Explore Trending Strip */}
      <div className="trending-strip">
        <h3 className="trending-header">Explore trending palettes</h3>
        <div className="trending-list">
          {TRENDING_PALETTES.map((palette, i) => (
            <div 
              key={i} 
              className="trending-item"
              onClick={() => loadTrending(palette)}
            >
              {palette.map((color, j) => (
                <div 
                  key={j} 
                  className="trending-color" 
                  style={{ backgroundColor: color }} 
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
