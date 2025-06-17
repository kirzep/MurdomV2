// hooks/useLongPress.ts
"use client";

import { useCallback, useRef, MouseEvent, TouchEvent } from 'react';

const useLongPress = (
  onLongPress: (event: MouseEvent | TouchEvent) => void,
  onClick: () => void,
  { delay = 300 } = {}
) => {
  const timeout = useRef<NodeJS.Timeout>();
  const longPressTriggered = useRef(false);

  const start = useCallback(
    (event: MouseEvent | TouchEvent) => {
      longPressTriggered.current = false;
      timeout.current = setTimeout(() => {
        onLongPress(event);
        longPressTriggered.current = true;
      }, delay);
    },
    [onLongPress, delay]
  );

  const clear = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      // Если долгое нажатие не сработало, значит, это был обычный клик
      if (longPressTriggered.current === false) {
        onClick();
      }
      // Предотвращаем контекстное меню на мобильных после отпускания пальца
      event.preventDefault();
    },
    [onClick]
  );

  return {
    onMouseDown: (e: MouseEvent) => start(e),
    onTouchStart: (e: TouchEvent) => start(e),
    onMouseUp: (e: MouseEvent) => clear(e),
    onTouchEnd: (e: TouchEvent) => clear(e),
    // Предотвращаем срабатывание контекстного меню на ПК
    onContextMenu: (e: MouseEvent) => e.preventDefault(),
  };
};

export default useLongPress;