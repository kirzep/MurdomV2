// app/register/[token]/page.tsx
"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import { Mail, Lock, Cat, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const registerRes = await fetch('/api/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, token }),
      });
      if (!registerRes.ok) {
        const errorData = await registerRes.json();
        throw new Error(errorData.error || 'Ошибка регистрации');
      }
      const signInRes = await signIn('credentials', { redirect: false, email, password });
      if (signInRes?.error) {
        router.push('/login');
      } else {
        router.push('/dashboard'); 
      }
    } catch (error) {
      setError((error as Error).message);
      setIsLoading(false);
    }
  };

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
            <h2 className="mt-6 text-3xl font-bold text-center text-brand-text-primary">Регистрация</h2>
            <p className="mt-2 text-center text-sm text-brand-text-secondary">Создайте ваш аккаунт в "МурДом"</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Input
              type="email" placeholder="Email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={20} />}
            />
          </div>
          <div>
            <Input
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
              Зарегистрироваться
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
