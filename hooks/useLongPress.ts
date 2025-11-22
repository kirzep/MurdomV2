// hooks/useLongPress.ts
import { useCallback, useRef, useState } from "react";

interface LongPressOptions {
  isPreventDefault?: boolean;
  delay?: number;
}

const useLongPress = (
  onLongPress: (e: any) => void,
  onClick: (e: any) => void,
  { isPreventDefault = true, delay = 500 }: LongPressOptions = {}
) => {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef<NodeJS.Timeout>();
  const target = useRef<EventTarget>();
  // Храним координаты начала нажатия
  const startCoord = useRef<{ x: number; y: number } | null>(null);

  const start = useCallback(
    (event: any) => {
      // Для тача сохраняем координаты
      if (event.touches && event.touches.length > 0) {
        startCoord.current = { 
            x: event.touches[0].clientX, 
            y: event.touches[0].clientY 
        };
      } else {
        // Для мыши
        startCoord.current = { x: event.clientX, y: event.clientY };
      }

      if (isPreventDefault && event.target) {
        event.target.addEventListener("touchend", preventDefault, {
          passive: false,
        });
        target.current = event.target;
      }
      
      timeout.current = setTimeout(() => {
        // --- HAPTIC FEEDBACK (Вибрация) ---
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(50); // 50мс короткий импульс
        }
        
        onLongPress(event);
        setLongPressTriggered(true);
      }, delay);
    },
    [onLongPress, delay, isPreventDefault]
  );

  const clear = useCallback(
    (event: any, shouldTriggerClick = true) => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      
      // ПРОВЕРКА: Если startCoord === null, значит мы двигали пальцем (скроллили)
      // и move() уже сбросил координаты. В таком случае клик не нужен.
      const wasScrolling = startCoord.current === null;

      // Если длинное нажатие НЕ сработало, мы не скроллили и должны кликнуть — кликаем
      if (shouldTriggerClick && !longPressTriggered && !wasScrolling && onClick) {
        onClick(event);
      }
      
      setLongPressTriggered(false);
      startCoord.current = null; // Сбрасываем координаты

      if (isPreventDefault && target.current) {
        target.current.removeEventListener("touchend", preventDefault);
      }
    },
    [onClick, longPressTriggered, isPreventDefault]
  );

  // Логика отмены при скролле
  const move = useCallback((event: any) => {
      if (!startCoord.current) return;

      let x, y;
      if (event.touches && event.touches.length > 0) {
          x = event.touches[0].clientX;
          y = event.touches[0].clientY;
      } else {
          x = event.clientX;
          y = event.clientY;
      }

      // Считаем дельту (расстояние)
      const diffX = Math.abs(x - startCoord.current.x);
      const diffY = Math.abs(y - startCoord.current.y);

      // Если сдвиг больше 10px — это скролл, отменяем LongPress
      if (diffX > 10 || diffY > 10) {
          if (timeout.current) clearTimeout(timeout.current);
          startCoord.current = null; // Сбрасываем координаты, помечая как "скролл"
      }
  }, []);

  return {
    onMouseDown: (e: any) => start(e),
    onTouchStart: (e: any) => start(e),
    onMouseMove: (e: any) => move(e),
    onTouchMove: (e: any) => move(e),
    onMouseUp: (e: any) => clear(e),
    onMouseLeave: (e: any) => clear(e, false),
    onTouchEnd: (e: any) => clear(e),
  };
};

const preventDefault = (e: Event) => {
  if (!("touches" in e)) return;
  // e.preventDefault(); 
};

export default useLongPress;