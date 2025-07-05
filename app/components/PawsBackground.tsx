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
  moveAngle: number;    // Угол движения в градусах (0 = вправо, 90 = вниз)
  iconRotation: number; // Итоговый угол поворота для CSS
  startX: number;
  startY: number;
  step: number;
}

// --- Константы для легкой настройки анимации ---
const PAW_INTERVAL = 600;     // Интервал появления новой лапки
const MAX_TRAILS = 2;         // Максимальное количество тропинок на экране
const MAX_PAWS_PER_TRAIL = 3; // **Максимальная длина следа: 3 лапки**
const PAW_SPACING = 55;       // Расстояние между лапками
const PAW_OPACITY = 0.2;      // **Прозрачность лапок**

export default function PawsBackground() {
  const [trails, setTrails] = useState<Trail[]>([]);
  const [pawIcons, setPawIcons] = useState<string[]>([]);
  const trailsRef = useRef<Trail[]>([]); // Ref для надежного доступа к состоянию в интервале

  // 1. Загружаем иконки один раз
  useEffect(() => {
    fetch('/api/icons/background_paws')
      .then(res => (res.ok ? res.json() : []))
      .then(data => {
        if (data.length > 0) setPawIcons(data);
      })
      .catch(error => console.error("Не удалось загрузить иконки лапок:", error));
  }, []);

  // 2. Обновляем Ref при изменении состояния
  useEffect(() => {
    trailsRef.current = trails;
  }, [trails]);

  // 3. Функция для создания новой тропинки
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

    // *** ГЛАВНОЕ ИСПРАВЛЕНИЕ ***
    // Изначально иконка смотрит вверх (0 градусов в CSS).
    // Чтобы повернуть ее по направлению движения, добавляем 90 градусов.
    // Пример: Движение вправо (moveAngle = 0) -> поворот иконки на 90 градусов.
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

  // 4. Основной цикл анимации
  useEffect(() => {
    if (pawIcons.length === 0) return;
    
    // Сразу создаем нужное количество тропинок
    const initialTrails: Trail[] = [];
    for (let i = 0; i < MAX_TRAILS; i++) {
        const newTrail = createTrail();
        if (newTrail) initialTrails.push(newTrail);
    }
    setTrails(initialTrails);

    const intervalId = setInterval(() => {
      const newTrails: Trail[] = [];
      // Обновляем существующие тропинки
      const updatedTrails = trailsRef.current.map(trail => {
          const { startX, startY, moveAngle, step } = trail;
          const distance = step * PAW_SPACING;
          const rad = (moveAngle * Math.PI) / 180;
          const nextX = startX + distance * Math.cos(rad);
          const nextY = startY + distance * Math.sin(rad);

          // Если тропинка ушла за экран, помечаем ее для замены
          if (nextX < -100 || nextX > window.innerWidth + 100 || nextY < -100 || nextY > window.innerHeight + 100) {
              const newTrail = createTrail();
              if (newTrail) newTrails.push(newTrail);
              return null;
          }
          
          // Добавляем новую лапку и обрезаем массив до нужной длины
          const newPaws = [...trail.paws, { id: Date.now() + Math.random(), x: nextX, y: nextY }].slice(-MAX_PAWS_PER_TRAIL);

          return { ...trail, paws: newPaws, step: trail.step + 1 };
      }).filter((t): t is Trail => t !== null); // Удаляем `null` из массива
      
      // Обновляем состояние одним вызовом
      setTrails([...updatedTrails, ...newTrails]);

    }, PAW_INTERVAL);

    return () => clearInterval(intervalId);
  }, [pawIcons, createTrail]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
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
                // Применяем рассчитанный угол поворота для всей тропинки
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