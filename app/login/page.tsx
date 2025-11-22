// app/login/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion'; // Исправление 1: Добавлен AnimatePresence
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'; // Исправление 2: Удален Cat
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
    } catch (err: unknown) { // Исправление 3: Правильная обработка ошибки
      console.error(err);
      setError('Произошла ошибка. Пожалуйста, попробуйте позже.');
      setIsLoading(false);
    }
  };

  if (status === 'loading' || status === 'authenticated') {
    return <div className="h-screen w-full flex items-center justify-center bg-brand-background"><Spinner /></div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-background relative overflow-hidden">
      {/* Фоновые декоративные элементы с анимацией через Framer Motion */}
      <div className="absolute inset-0 pointer-events-none">
          <motion.div 
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-400/5 rounded-full blur-[120px]" 
          />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
        className="w-full max-w-md p-8 space-y-8 bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white relative z-10 mx-4"
      >
        <div className="text-center">
            <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-gradient-to-br from-brand-primary to-brand-primary-hover text-white mb-6 shadow-xl shadow-brand-primary/20"
            >
                <img src="/icons/android-chrome-192x192.png" alt="Логотип" className="w-16 h-16 drop-shadow-md" />
            </motion.div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">С возвращением!</h2>
            <p className="mt-2 text-gray-500 text-sm font-medium">
                Войдите, чтобы управлять архивом
            </p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
                <label htmlFor="login-email" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Email</label>
                <Input
                  id="login-email"
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
                <label htmlFor="login-password" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Пароль</label>
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Введите пароль" 
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

          <AnimatePresence>
            {error && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm text-center font-medium"
                >
                    {error}
                </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-2">
            <Button type="submit" className="w-full h-14 text-lg rounded-2xl shadow-lg shadow-brand-primary/20 group" isLoading={isLoading}>
              {!isLoading && <LogIn size={20} className="mr-2 group-hover:translate-x-1 transition-transform" />}
              <span>Войти в систему</span>
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}