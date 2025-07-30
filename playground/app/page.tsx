'use client';

import { useEffect, useRef, useState } from 'react';
import DynamicBackground from '../app/DynamicBackground'; // make sure the path matches

type Target = {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
};

export default function Game() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [kills, setKills] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3); // 30 seconds countdown timer
  const [playedTime, setPlayedTime] = useState(0); // time spent
  useEffect(() => {
    const timer = setInterval(() => {
      setPlayedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const nextId = useRef(0);
  const requiredKills = 20;

  // Cursor tracker
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Game logic: Spawning & movement
  useEffect(() => {
    const spawnTarget = () => {
      const newTarget: Target = {
        id: nextId.current++,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        dx: (Math.random() - 0.5) * 2,
        dy: (Math.random() - 0.5) * 2,
      };

      setTargets((prev) => [...prev, newTarget]);

      // Remove after 1.5s
      setTimeout(() => {
        setTargets((prev) => prev.filter((t) => t.id !== newTarget.id));
      }, 1500);
    };

    const spawnInterval = setInterval(() => {
      if (timeLeft > 0) spawnTarget();
    }, 400);

    const moveInterval = setInterval(() => {
      setTargets((prev) =>
        prev.map((t) => ({
          ...t,
          x: t.x + t.dx,
          y: t.y + t.dy,
        }))
      );
    }, 30);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(moveInterval);
    };
  }, [timeLeft]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          setWon(kills >= requiredKills);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [kills, timeLeft]);

  const handleKill = (id: number) => {
  setKills((prev) => {
    const updatedKills = prev + 1;
    if (updatedKills >= requiredKills) {
      setGameOver(true);
      setWon(true);
      setTimeLeft(0); // force stop everything
    }
    return updatedKills;
  });
  setTargets((prev) => prev.filter((t) => t.id !== id));
};


  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#000',
      }}
    >
      <DynamicBackground />

      {/* HUD */}
      <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', fontSize: '24px', zIndex: 10 }}>
        Time Left: {timeLeft}s <br />
        Kills: {kills} / {requiredKills}
      </div>

      {/* Targets */}
      {targets.map((target) => (
        <div
          key={target.id}
          onMouseEnter={() => handleKill(target.id)}
          style={{
            position: 'absolute',
            width: '30px',
            height: '30px',
            backgroundColor: 'red',
            borderRadius: '50%',
            top: target.y,
            left: target.x,
            transform: 'translate(-50%, -50%)',
            transition: 'opacity 0.3s ease',
            pointerEvents: 'auto',
            zIndex: 5,
          }}
        />
      ))}

      {/* White cursor dot */}
      <div
        style={{
          position: 'fixed',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: 'white',
          left: mouse.x,
          top: mouse.y,
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          pointerEvents: 'none',
        }}
      />

      {/* Result */}
      {gameOver && (
        <div
          style={{
            position: 'absolute',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: '36px',
            textAlign: 'center',
            zIndex: 10,
          }}
        >
          {won ? 'You Win!' : 'You Lose!'} <br />
          Killed {kills} targets in {15 - timeLeft} seconds
          <div style={{ marginTop: 16, color: '#aaa', fontSize: 18 }}>
            Time Limit: {15} seconds
          </div>
          <div style={{ marginTop: 8, color: '#aaa', fontSize: 18 }}>
            Remaining Time: {timeLeft} seconds
          </div>
        </div>
      )}
    </div>
  );
}
