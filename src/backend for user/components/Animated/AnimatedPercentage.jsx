/**
 * AnimatedPercentage Component
 * Features:
 * - Simple percentage animation
 * - No pulse effects
 * - Smooth counting only
 */

import React, { useState, useEffect } from 'react';

const AnimatedPercentage = ({ value, duration = 1500 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      const percentage = Math.min(progress / duration, 1);
      const currentCount = Math.floor(value * percentage);
      
      setCount(currentCount);

      if (progress < duration) {
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

  return `${count}%`;
};

export default AnimatedPercentage; 