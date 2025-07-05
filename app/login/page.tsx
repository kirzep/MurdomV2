// app/login/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Mail, Lock, Cat, Eye, EyeOff } from 'lucide-react';
import Spinner from '../components/ui/Spinner';

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const result = await signIn('credentials', { redirect: false, email, password });
      if (result?.error) {
        setError('Неверный email или пароль. Попробуйте снова.');
        setIsLoading(false);
      }
    } catch (error) {
      setError('Произошла ошибка. Пожалуйста, попробуйте позже.');
      setIsLoading(false);
    }
  };

  if (status === 'loading' || status === 'authenticated') {
    return <div className="h-screen w-full flex items-center justify-center"><Spinner /></div>;
  }

  return (
    // --- ИЗМЕНЕНИЕ: Обновлен градиент фона под новую тему ---
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-brand-primary-light/30 via-brand-background to-brand-surface">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm p-8 space-y-6 bg-brand-surface rounded-2xl shadow-xl"
      >
        <div className="text-center">
            <Cat className="mx-auto h-12 w-auto text-brand-primary" />
            <h2 className="mt-6 text-3xl font-bold text-center text-brand-text-primary">Архив Кошек</h2>
            <p className="mt-2 text-center text-sm text-brand-text-secondary">Войдите в свой аккаунт</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Input
              id="email" type="email" placeholder="Email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={20} />}
            />
          </div>
          <div>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Пароль" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={20} />}
              actionIcon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              onActionClick={() => setShowPassword(!showPassword)}
            />
          </div>
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <div>
            <Button type="submit" className="w-full h-12" isLoading={isLoading}>
              Войти
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}