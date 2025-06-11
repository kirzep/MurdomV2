// app/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Spinner from "./components/ui/Spinner";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Ничего не делаем, пока сессия загружается
    if (status === "authenticated") {
      router.push("/dashboard"); // Пользователь вошел, перенаправляем на дашборд
    } else {
      router.push("/login"); // Пользователь не вошел, перенаправляем на логин
    }
  }, [session, status, router]);

  // Показываем спиннер, пока происходит проверка и редирект
  return (
    <div className="h-screen w-full flex items-center justify-center">
        <Spinner />
    </div>
  );
}
