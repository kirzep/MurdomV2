// app/components/NextAuthProvider.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";

interface Props {
  children: React.ReactNode;
}

export default function NextAuthProvider({ children }: Props) {
  return (
    // refetchInterval={60} заставляет приложение каждые 60 секунд
    // обращаться к серверу, что запускает наш обновленный jwt-callback
    <SessionProvider refetchInterval={60}>
        {children}
    </SessionProvider>
  );
}
