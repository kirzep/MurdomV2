// hooks/useLongPress.ts
"use client";

import { useCallback, useRef, MouseEvent, TouchEvent } from 'react';

// Определяем пороговое значение для сдвига. Если палец сдвинулся больше,
// чем на это значение, мы считаем это прокруткой, а не кликом.
const MOVE_THRESHOLD = 10; // 10 пикселей

const useLongPress = (
  onLongPress: (event: MouseEvent | TouchEvent) => void,
  onClick: () => void,
  { delay = 300 } = {}
) => {
  const timeout = useRef<NodeJS.Timeout>();
  const longPressTriggered = useRef(false);
  // Сохраняем начальные координаты касания
  const startPos = useRef({ x: 0, y: 0 });

  const start = useCallback(
    (event: MouseEvent | TouchEvent) => {
      // Игнорируем правые клики мыши
      if ('button' in event && event.button !== 0) {
        return;
      }

      longPressTriggered.current = false;

      // Записываем начальные координаты
      if ('touches' in event) {
        startPos.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      } else {
        startPos.current = { x: event.clientX, y: event.clientY };
      }

      timeout.current = setTimeout(() => {
        onLongPress(event);
        longPressTriggered.current = true;
      }, delay);
    },
    [onLongPress, delay]
  );

  const clear = useCallback(
    (event: MouseEvent | TouchEvent) => {
      // Если таймер все еще существует, значит, движение было минимальным
      if (timeout.current) {
        clearTimeout(timeout.current);
        // И если долгое нажатие не сработало, то это клик
        if (longPressTriggered.current === false) {
          onClick();
        }
      }

      // Предотвращаем "призрачные клики" и контекстное меню
      if (event.cancelable) {
        event.preventDefault();
      }
    },
    [onClick]
  );

  // Новая функция для отмены при движении
  const cancelOnMove = useCallback((event: MouseEvent | TouchEvent) => {
    if (!timeout.current) return;

    let currentX = 0;
    let currentY = 0;

    if ('touches' in event) {
      currentX = event.touches[0].clientX;
      currentY = event.touches[0].clientY;
    } else {
      currentX = event.clientX;
      currentY = event.clientY;
    }

    const deltaX = Math.abs(startPos.current.x - currentX);
    const deltaY = Math.abs(startPos.current.y - currentY);

    // Если сдвиг превышает порог, отменяем таймер.
    // Это предотвратит вызов onClick при отпускании пальца.
    if (deltaX > MOVE_THRESHOLD || deltaY > MOVE_THRESHOLD) {
      clearTimeout(timeout.current);
      timeout.current = undefined; // Очищаем ref, чтобы clear() не сработал
    }
  }, []);


  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: clear,
    onTouchEnd: clear,
    onMouseMove: cancelOnMove,    // <-- ДОБАВЛЕНО
    onTouchMove: cancelOnMove,    // <-- ДОБАВЛЕНО
    onContextMenu: (e: MouseEvent) => {
      e.preventDefault();
    },
  };
};

export default useLongPress;