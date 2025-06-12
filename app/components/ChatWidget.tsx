// app/components/ChatWidget.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Message } from '@/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Link from 'next/link';

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatWidget({ isOpen, onClose }: ChatWidgetProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if(isOpen) {
        scrollToBottom();
    }
  }, [messages, isOpen]);

  // Загрузка истории чата и установка интервала
  useEffect(() => {
    if (!isOpen) return;

    const fetchHistory = async () => {
      const res = await fetch(`/api/chat/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    };
    fetchHistory();

    const intervalId = setInterval(fetchHistory, 5000);

    return () => clearInterval(intervalId);
  }, [isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session) return;

    const contentToSend = newMessage.trim();
    setNewMessage('');
    
    // Оптимистичное обновление UI
    const tempMessage: Message = {
      id: 'temp-' + Date.now(),
      content: contentToSend,
      senderId: session.user.id,
      // ИСПРАВЛЕНИЕ: Добавляем запасное значение для имени и аватара
      sender: { 
        id: session.user.id, 
        name: session.user.name ?? 'Пользователь', // Используем '??', чтобы обработать null и undefined
        image: session.user.image 
      },
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMessage]);
    
    await fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: contentToSend }),
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[400px] sm:max-h-[600px] bg-brand-surface rounded-none sm:rounded-2xl shadow-2xl flex flex-col z-50"
        >
          <header className="flex items-center justify-between p-4 border-b border-brand-border flex-shrink-0">
            <h3 className="text-xl font-bold text-brand-primary">Общий чат</h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-brand-background"><X size={24}/></button>
          </header>
          
          <main className="flex-grow p-4 space-y-4 overflow-y-auto">
            {messages.map(msg => {
              const isSender = msg.senderId === session?.user.id;
              return (
                <div key={msg.id} className={`flex flex-col ${isSender ? 'items-end' : 'items-start'}`}>
                  {!isSender && <p className="text-xs text-brand-text-secondary mb-1 ml-3">{msg.sender.name}</p>}
                  <div className={`max-w-xs p-3 rounded-2xl ${isSender ? 'bg-brand-primary text-white rounded-br-none' : 'bg-brand-background text-brand-text-primary rounded-bl-none'}`}>
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                  <p className="text-xs text-brand-text-secondary mt-1 px-1">
                    {format(new Date(msg.createdAt), 'HH:mm', { locale: ru })}
                  </p>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </main>
          
          <form onSubmit={handleSendMessage} className="p-4 border-t border-brand-border flex items-center gap-2">
            <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Напишите сообщение..." className="w-full px-4 py-2 bg-brand-background rounded-full outline-none focus:ring-2 focus:ring-brand-primary" />
            <button type="submit" className="h-10 w-10 bg-brand-primary text-white rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-50" disabled={!newMessage.trim()}>
              <Send/>
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
