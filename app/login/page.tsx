// app/login/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Mail, Lock, Cat } from 'lucide-react';
import Spinner from '../components/ui/Spinner';

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession(); // Получаем статус сессии

  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ИСПРАВЛЕНИЕ: Добавляем useEffect для перенаправления
  useEffect(() => {
    // Если пользователь уже аутентифицирован, перенаправляем его в дашборд
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Неверный email или пароль. Попробуйте снова.');
        setIsLoading(false);
      } else {
        // NextAuth автоматически обновит статус сессии, и useEffect выше выполнит перенаправление
      }
    } catch (error) {
      console.error(error);
      setError('Произошла ошибка. Пожалуйста, попробуйте позже.');
      setIsLoading(false);
    }
  };

  // Пока идет проверка статуса аутентификации, показываем спиннер
  if (status === 'loading' || status === 'authenticated') {
    return (
        <div className="h-screen w-full flex items-center justify-center">
            <Spinner />
        </div>
    );
  }

  // Если пользователь не аутентифицирован, показываем форму входа
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-main from-indigo-50 via-purple-50 to-pink-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm p-8 space-y-6 bg-brand-surface rounded-2xl shadow-xl"
      >
        <div className="text-center">
            <Cat className="mx-auto h-12 w-auto text-brand-primary" />
            <h2 className="mt-6 text-3xl font-bold text-center text-brand-text-primary">
                Архив Кошек
            </h2>
            <p className="mt-2 text-center text-sm text-brand-text-secondary">
                Войдите в свой аккаунт
            </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={16} />}
            />
          </div>

          <div>
            <Input
              id="password"
              type="password"
              placeholder="Пароль"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={16} />}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <div>
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Войти
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
