import React, { useEffect, useRef, useState } from 'react';

/**
 * SplitText component splits text into characters or words and animate them sequentially.
 * This is a lightweight, zero-dependency alternative to GSAP SplitText.
 * 
 * @param {string} text - The string content to animate
 * @param {string} [className] - Optional custom CSS classes
 * @param {number} [delay=40] - Stagger delay between characters/words in ms
 * @param {number} [duration=0.6] - Duration of animation for each element in seconds
 * @param {string} [animationType='fadeInUp'] - Type of keyframe animation ('fadeInUp' | 'fadeIn' | 'scaleUp')
 * @param {'chars'|'words'} [splitType='chars'] - Split by characters or words
 * @param {string} [textAlign='center'] - Text alignment style
 * @param {function} [onAnimationComplete] - Callback on animation completion
 */
export default function SplitText({
  text = '',
  className = '',
  delay = 40,
  duration = 0.6,
  animationType = 'fadeInUp',
  splitType = 'chars',
  textAlign = 'center',
  onAnimationComplete,
}) {
  const [inView, setInView] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  const items = splitType === 'words' ? text.split(' ') : text.split('');

  useEffect(() => {
    if (inView && onAnimationComplete) {
      const totalDelay = items.length * delay + duration * 1000;
      const timer = setTimeout(onAnimationComplete, totalDelay);
      return () => clearTimeout(timer);
    }
  }, [inView, items.length, delay, duration, onAnimationComplete]);

  const containerStyle = {
    display: 'inline-block',
    textAlign,
    wordWrap: 'break-word',
  };

  return (
    <span ref={containerRef} className={`split-text-container ${className}`} style={containerStyle}>
      {items.map((item, index) => {
        const displayItem = item === ' ' ? '\u00A0' : item;
        const animationDelay = `${index * delay}ms`;
        const animationDuration = `${duration}s`;

        return (
          <span
            key={index}
            className={`split-item ${animationType} ${inView ? 'animate' : ''}`}
            style={{
              display: 'inline-block',
              animationDelay,
              animationDuration,
              animationFillMode: 'both',
            }}
          >
            {displayItem}
            {splitType === 'words' && index < items.length - 1 ? '\u00A0' : ''}
          </span>
        );
      })}
    </span>
  );
}
