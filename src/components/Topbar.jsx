import React from 'react';
import { Palette, Sliders, Eye, Shuffle, Download, Heart, RefreshCw } from 'lucide-react';

export default function Topbar({ activeTab, setActiveTab, onGenerate, onExport, onSave }) {
  const navItems = [
    { id: 'palette', label: 'Palette', icon: Palette },
    { id: 'gradient', label: 'Gradient', icon: Sliders },
    { id: 'accessibility', label: 'Accessibility', icon: Eye },
    { id: 'converter', label: 'Converter', icon: Shuffle },
  ];

  return (
    <header className="topbar">
      {/* Left Logo */}
      <div className="topbar-logo" onClick={() => setActiveTab('palette')}>
        <Palette size={20} color="var(--accent)" />
        <span>Color<span>Canvas</span></span>
      </div>

      {/* Center Navigation Links */}
      <nav className="topbar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Actions */}
      <div className="topbar-actions">
        {activeTab === 'palette' && (
          <button className="btn-primary" onClick={onGenerate}>
            <RefreshCw size={16} />
            <span>Generate</span>
            <span className="shortcut-badge">Space</span>
          </button>
        )}
        <button className="btn-icon" onClick={onSave} title="Save to collection">
          <Heart size={18} />
        </button>
        <button className="btn-icon" onClick={onExport} title="Export color code">
          <Download size={18} />
        </button>
      </div>
    </header>
  );
}
