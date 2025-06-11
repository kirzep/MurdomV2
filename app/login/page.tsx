// app/login/page.tsx
"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Mail, Lock, Cat } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@example.com'); // Предзаполним для удобства
  const [password, setPassword] = useState('password123'); // Предзаполним для удобства
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
        router.push('/dashboard');
      }
    } catch (error) {
      console.error(error);
      setError('Произошла ошибка. Пожалуйста, попробуйте позже.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-brand-background to-blue-100">
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
