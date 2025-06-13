// app/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Spinner from "./components/ui/Spinner";

export default function HomePage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Ничего не делаем, пока сессия загружается
    if (status === "loading") return;

    // Если пользователь уже вошел, отправляем его в дашборд
    // (Middleware сам разберется, куда его направить дальше)
    if (status === "authenticated") {
      router.push("/dashboard");
    } else {
      // Если пользователь не вошел, отправляем на страницу входа
      router.push("/login"); 
    }
  }, [status, router]);

  // Показываем спиннер, пока происходит проверка и редирект
  return (
    <div className="h-screen w-full flex items-center justify-center">
        <Spinner />
    </div>
  );
}
