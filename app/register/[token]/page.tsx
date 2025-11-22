// app/register/[token]/page.tsx
"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/app/components/ui/Button';
import Input from '@/app/components/ui/Input';
import { Mail, Lock, Cat, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Link from 'next/link'; // Исправление 1: Добавлен импорт Link

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
        router.push('/setup-profile'); 
      }
    } catch (error) {
      setError((error as Error).message);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-400/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="w-full max-w-md p-8 space-y-8 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white relative z-10 mx-4"
      >
        <div className="text-center">
            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-primary to-brand-primary-hover text-white mb-6 shadow-lg shadow-brand-primary/20"
            >
                <Cat size={40} />
            </motion.div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Регистрация</h2>
            <p className="mt-2 text-gray-500 text-sm font-medium">
                Добро пожаловать в команду МурДома!
            </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Исправление 2: Связь label и input через htmlFor и id */}
            <div>
                <label htmlFor="register-email" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Email</label>
                <Input
                  id="register-email"
                  type="email" 
                  placeholder="name@example.com" 
                  required
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail size={20} />}
                  className="h-12"
                />
            </div>
            <div>
                <label htmlFor="register-password" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Пароль</label>
                <Input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Придумайте пароль" 
                  required
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock size={20} />}
                  actionIcon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  onActionClick={() => setShowPassword(!showPassword)}
                  className="h-12"
                />
            </div>
          </div>

          {error && (
            <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm text-center font-medium"
            >
                {error}
            </motion.div>
          )}

          <div className="pt-2">
            <Button type="submit" className="w-full h-14 text-lg rounded-2xl shadow-lg shadow-brand-primary/20 group" isLoading={isLoading}>
              <span>Создать аккаунт</span>
              {!isLoading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
            </Button>
          </div>
        </form>

        <div className="text-center">
            <p className="text-xs text-gray-400">
                Уже есть аккаунт? <Link href="/login" className="text-brand-primary font-bold hover:underline">Войти</Link>
            </p>
        </div>
      </motion.div>
    </div>
  );
}