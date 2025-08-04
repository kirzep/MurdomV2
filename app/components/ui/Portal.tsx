// app/components/ui/Portal.tsx
"use client";

import { useState, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: ReactNode;
}

const Portal: React.FC<PortalProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // При размонтировании компонента ничего не делаем,
    // так как React сам удалит детей из портала.
    return () => setMounted(false);
  }, []);

  // Рендерим детей в портал только на клиенте, когда document.body доступен
  return mounted ? createPortal(children, document.body) : null;
};

export default Portal;