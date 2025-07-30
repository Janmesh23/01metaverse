'use client';

import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState('orange');

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      const { clientX, clientY } = e;

      // Move the box to mouse position
      if (boxRef.current) {
        boxRef.current.style.left = `${clientX}px`;
        boxRef.current.style.top = `${clientY}px`;
      }

      // Generate a random color on every move
      const randomColor = `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`;
      setColor(randomColor);
    }

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={boxRef}
      style={{
        position: 'absolute',
        width: '50px',
        height: '50px',
        backgroundColor: color,
        borderRadius: '8px',
        transform: 'translate(-50%, -50%)', // center on cursor
        pointerEvents: 'none', // allows mouse events to pass through
      }}
    />
  );
}
