// app/components/ui/Portal.tsx
"use client";

import { useEffect, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: ReactNode;
}

const Portal = ({ children }: PortalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Устанавливаем флаг, что компонент смонтирован на клиенте
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Если мы на сервере или еще не смонтировались — ничего не рендерим
  if (!mounted) {
    return null;
  }

  // "Телепортируем" детей в конец тега <body>
  // Это позволяет модальным окнам быть поверх всего остального интерфейса
  // и не зависеть от z-index родительских блоков
  return createPortal(children, document.body);
};

export default Portal;