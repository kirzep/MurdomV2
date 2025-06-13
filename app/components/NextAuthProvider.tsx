// app/components/NextAuthProvider.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";

interface Props {
  children: React.ReactNode;
}

// Этот компонент-обертка необходим для использования useSession() в клиентских компонентах
export default function NextAuthProvider({ children }: Props) {
  return (
    // ИСПРАВЛЕНИЕ: Добавляем refetchInterval.
    // Это будет автоматически обновлять сессию пользователя каждые 60 секунд.
    // Если роль пользователя изменилась, он получит новые права без перезахода.
    <SessionProvider refetchInterval={60}>
        {children}
    </SessionProvider>
  );
}
