/**
 * AnimatedNumber Component
 * Features:
 * - Simple number animation from 0 to target value
 * - Configurable animation duration
 * - No pulse effects, just smooth counting
 */

import React, { useState, useEffect } from 'react';

const AnimatedNumber = ({ value, duration = 2000, minDigits = 0 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const currentCount = Math.floor(value * progress);
      
      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value, duration]);

  return minDigits > 0 ? String(count).padStart(minDigits, '0') : count;
};

export default AnimatedNumber; 