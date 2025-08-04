// app/components/PawsBackground.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// --- Интерфейсы для большей читаемости кода ---
interface Paw {
  id: number;
  x: number;
  y: number;
}

interface Trail {
  id: number;
  paws: Paw[];
  icon: string;
  moveAngle: number;
  iconRotation: number;
  startX: number;
  startY: number;
  step: number;
}

// --- Константы для легкой настройки анимации ---
const PAW_INTERVAL = 600;
const MAX_TRAILS = 2;
const MAX_PAWS_PER_TRAIL = 3;
const PAW_SPACING = 55;
const PAW_OPACITY = 0.2;

export default function PawsBackground() {
  const [trails, setTrails] = useState<Trail[]>([]);
  const [pawIcons, setPawIcons] = useState<string[]>([]);
  const trailsRef = useRef<Trail[]>([]);

  useEffect(() => {
    fetch('/api/icons/background_paws')
      .then(res => (res.ok ? res.json() : []))
      .then(data => {
        if (data.length > 0) setPawIcons(data);
      })
      .catch(error => console.error("Не удалось загрузить иконки лапок:", error));
  }, []);

  useEffect(() => {
    trailsRef.current = trails;
  }, [trails]);

  const createTrail = useCallback((): Trail | null => {
    if (pawIcons.length === 0) return null;

    const trailId = Date.now();
    const icon = pawIcons[Math.floor(Math.random() * pawIcons.length)];
    let startX = 0, startY = 0, moveAngle = 0;

    const edge = Math.floor(Math.random() * 4);
    switch (edge) {
      case 0: // Сверху
        startX = Math.random() * window.innerWidth;
        startY = -50;
        moveAngle = Math.random() * 120 + 30;
        break;
      case 1: // Справа
        startX = window.innerWidth + 50;
        startY = Math.random() * window.innerHeight;
        moveAngle = Math.random() * 120 + 150;
        break;
      case 2: // Снизу
        startX = window.innerWidth + 50;
        startY = Math.random() * window.innerHeight;
        moveAngle = Math.random() * 120 - 150;
        break;
      default: // Слева
        startX = -50;
        startY = Math.random() * window.innerHeight;
        moveAngle = Math.random() * 120 - 60;
        break;
    }

    const iconRotation = moveAngle + 90;

    return {
      id: trailId,
      paws: [],
      icon,
      moveAngle,
      iconRotation,
      startX,
      startY,
      step: 0,
    };
  }, [pawIcons]);

  useEffect(() => {
    if (pawIcons.length === 0) return;
    
    const initialTrails: Trail[] = [];
    for (let i = 0; i < MAX_TRAILS; i++) {
        const newTrail = createTrail();
        if (newTrail) initialTrails.push(newTrail);
    }
    setTrails(initialTrails);

    const intervalId = setInterval(() => {
      const newTrails: Trail[] = [];
      const updatedTrails = trailsRef.current.map(trail => {
          const { startX, startY, moveAngle, step } = trail;
          const distance = step * PAW_SPACING;
          const rad = (moveAngle * Math.PI) / 180;
          const nextX = startX + distance * Math.cos(rad);
          const nextY = startY + distance * Math.sin(rad);

          if (nextX < -100 || nextX > window.innerWidth + 100 || nextY < -100 || nextY > window.innerHeight + 100) {
              const newTrail = createTrail();
              if (newTrail) newTrails.push(newTrail);
              return null;
          }
          
          const newPaws = [...trail.paws, { id: Date.now() + Math.random(), x: nextX, y: nextY }].slice(-MAX_PAWS_PER_TRAIL);

          return { ...trail, paws: newPaws, step: trail.step + 1 };
      }).filter((t): t is Trail => t !== null);
      
      setTrails([...updatedTrails, ...newTrails]);

    }, PAW_INTERVAL);

    return () => clearInterval(intervalId);
  }, [pawIcons, createTrail]);

  return (
    // === ИЗМЕНЕНИЕ ЗДЕСЬ: Добавлен класс z-[-1], чтобы фон был гарантированно сзади ===
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-[-1]">
      <AnimatePresence>
        {trails.map(trail =>
          trail.paws.map(paw => (
            <motion.div
              key={paw.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: PAW_OPACITY, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'absolute',
                left: `${paw.x}px`,
                top: `${paw.y}px`,
                transform: `translate(-50%, -50%) rotate(${trail.iconRotation}deg)`,
              }}
            >
              <img src={trail.icon} alt="" className="w-12 h-12" />
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </div>
  );
}