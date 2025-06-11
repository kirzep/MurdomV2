// app/components/NextAuthProvider.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";

interface Props {
  children: React.ReactNode;
}

// Этот компонент-обертка необходим для использования useSession() в клиентских компонентах
export default function NextAuthProvider({ children }: Props) {
  return <SessionProvider>{children}</SessionProvider>;
}
