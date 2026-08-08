// Color utilities for ColorCanvas

// Parse hex string to RGB object
export function hexToRgb(hex) {
  let c = hex.replace(/^#/, '');
  if (c.length === 3) {
    c = c.split('').map(char => char + char).join('');
  }
  if (c.length !== 6) {
    return { r: 0, g: 0, b: 0 };
  }
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

// Convert RGB to HEX string
export function rgbToHex(r, g, b) {
  const clamp = (val) => Math.max(0, Math.min(255, Math.round(val)));
  const rc = clamp(r);
  const gc = clamp(g);
  const bc = clamp(b);
  return '#' + ((1 << 24) + (rc << 16) + (gc << 8) + bc).toString(16).slice(1).toUpperCase();
}

// Convert RGB to HSL object
export function rgbToHsl({ r, g, b }) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

// Convert HSL to RGB object
export function hslToRgb({ h, s, l }) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

// Convert HEX to HSL object
export function hexToHsl(hex) {
  return rgbToHsl(hexToRgb(hex));
}

// Convert HSL to HEX string
export function hslToHex(h, s, l) {
  const rgb = hslToRgb({ h, s, l });
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

// Convert HEX to CMYK object
export function hexToCmyk(hex) {
  const { r, g, b } = hexToRgb(hex);
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const k = 1 - Math.max(rNorm, gNorm, bNorm);
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  const c = Math.round(((1 - rNorm - k) / (1 - k)) * 100);
  const m = Math.round(((1 - gNorm - k) / (1 - k)) * 100);
  const y = Math.round(((1 - bNorm - k) / (1 - k)) * 100);
  const kPercent = Math.round(k * 100);

  return { c, m, y, k: kPercent };
}

// Convert CMYK to HEX string
export function cmykToHex(c, m, y, k) {
  c /= 100;
  m /= 100;
  y /= 100;
  k /= 100;

  const r = 255 * (1 - c) * (1 - k);
  const g = 255 * (1 - m) * (1 - k);
  const b = 255 * (1 - y) * (1 - k);

  return rgbToHex(r, g, b);
}

// Calculate relative luminance of a color
export function getLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Compute contrast ratio between two colors
export function getContrastRatio(hex1, hex2) {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// Determine if foreground text should be black or white for high contrast
export function getContrastColor(hex) {
  const lum = getLuminance(hex);
  // Using 0.179 threshold as per standard practice (or 0.18)
  return lum > 0.179 ? '#0B0B0E' : '#FFFFFF';
}

// Generate a random color hex code
export function getAutoLabels(hex) {
  const { h, s, l } = hexToHsl(hex);
  const labels = [];
  
  if (s < 15) {
    labels.push('Neutral');
  }
  if (l > 80 || l < 20) {
    labels.push('Background');
  }
  if (l < 30 || l > 75) {
    labels.push('Text');
  }
  if (s > 50 && l > 35 && l < 75) {
    labels.push('Button');
  }
  if ((l > 15 && l < 45) || (l > 55 && l < 85)) {
    labels.push('Border');
  }
  if (s > 40 && l > 25 && l < 85 && !labels.includes('Neutral')) {
    labels.push('Theme Color');
  }
  
  if (labels.length === 0) {
    labels.push('Theme Color');
  }
  return labels;
}

export function getRandomColor() {
  const h = Math.floor(Math.random() * 360);
  const s = Math.floor(Math.random() * 30) + 60; // 60% to 90% saturation
  const l = Math.floor(Math.random() * 40) + 30; // 30% to 70% lightness
  return hslToHex(h, s, l);
}

// Generate a cohesive palette of colors (default 5)
export function generateRandomPalette(existingPalette = []) {
  // If we have an existing palette, we preserve locked columns and regenerate others
  if (existingPalette.length === 5) {
    // Generate a cohesive harmony based on one of the locked colors if available
    const lockedColor = existingPalette.find(item => item.locked);
    let baseHsl = null;
    if (lockedColor) {
      baseHsl = hexToHsl(lockedColor.hex);
    } else {
      baseHsl = {
        h: Math.floor(Math.random() * 360),
        s: Math.floor(Math.random() * 20) + 65, // 65-85
        l: Math.floor(Math.random() * 20) + 40  // 40-60
      };
    }

    return existingPalette.map((col, index) => {
      if (col.locked) return col;
      
      // Calculate a color harmony offset
      // Index offsets: monochromatic or analogous variations
      const hOffset = (baseHsl.h + (index * 40) + Math.floor(Math.random() * 15)) % 360;
      const sOffset = Math.max(20, Math.min(100, baseHsl.s + (index % 2 === 0 ? 10 : -10) + Math.floor(Math.random() * 10 - 5)));
      const lOffset = Math.max(15, Math.min(90, baseHsl.l + ((index - 2) * 12) + Math.floor(Math.random() * 10 - 5)));
      
      const newHex = hslToHex(hOffset, sOffset, lOffset);
      return {
        hex: newHex,
        locked: false,
        labels: getAutoLabels(newHex),
        isOverridden: false
      };
    });
  }

  // Initial generation
  const baseH = Math.floor(Math.random() * 360);
  const baseS = Math.floor(Math.random() * 20) + 65; // 65-85%
  const baseL = Math.floor(Math.random() * 20) + 40; // 40-60%

  return Array.from({ length: 5 }).map((_, i) => {
    // Create harmonious steps (analogous + lightness shift)
    const h = (baseH + (i * 35)) % 360;
    const s = Math.max(25, Math.min(95, baseS + (i % 2 === 0 ? 5 : -10)));
    const l = Math.max(20, Math.min(85, baseL + ((i - 2) * 12)));
    const newHex = hslToHex(h, s, l);
    return {
      hex: newHex,
      locked: false,
      labels: getAutoLabels(newHex),
      isOverridden: false
    };
  });
}

// Map color coordinates to dynamic human-readable names
export function getColorName(hex) {
  const { h, s, l } = hexToHsl(hex);
  if (l < 10) return 'Rich Black';
  if (l > 90) return 'Alabaster White';
  if (s < 10) return 'Neutral Gray';
  
  if (h >= 340 || h < 15) {
    if (l < 40) return 'Crimson Burgundy';
    if (s > 70) return 'Vibrant Scarlet';
    return 'Rose Dust';
  }
  if (h >= 15 && h < 45) {
    if (l < 40) return 'Burnt Sienna';
    if (s > 70) return 'Vibrant Orange';
    return 'Apricot Peach';
  }
  if (h >= 45 && h < 70) {
    if (l < 40) return 'Olive Gold';
    if (s > 70) return 'Electric Yellow';
    return 'Soft Gold';
  }
  if (h >= 70 && h < 150) {
    if (l < 40) return 'Forest Green';
    if (s > 70) return 'Emerald Green';
    return 'Sage Mint';
  }
  if (h >= 150 && h < 200) {
    if (l < 40) return 'Deep Teal';
    if (s > 70) return 'Vibrant Turquoise';
    return 'Aqua Marine';
  }
  if (h >= 200 && h < 260) {
    if (l < 40) return 'Navy Cobalt';
    if (s > 70) return 'Royal Blue';
    return 'Sky Azure';
  }
  if (h >= 260 && h < 310) {
    if (l < 40) return 'Deep Plum';
    if (s > 70) return 'Electric Violet';
    return 'Lavender Purple';
  }
  if (l < 40) return 'Deep Magenta';
  if (s > 70) return 'Vibrant Pink';
  return 'Blush Orchid';
}

