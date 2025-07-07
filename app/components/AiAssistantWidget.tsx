// app/components/AiAssistantWidget.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Send, Download, ExternalLink } from 'lucide-react';
import Button from './ui/Button';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

interface Message {
    readonly id: number;
    readonly role: 'user' | 'assistant';
    readonly content: string;
}

interface AiAssistantWidgetProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

interface LightboxProps {
    readonly src: string;
    readonly alt: string;
    readonly onClose: () => void;
}

interface MessageContentProps {
    readonly msg: Message;
    readonly isLoading: boolean;
    readonly onImageClick: (src: string) => void;
}

// Исправлена ошибка S6478: Компонент Lightbox вынесен за пределы родительского
const Lightbox: React.FC<LightboxProps> = ({ src, alt, onClose }) => {
    const handleDownload = async () => {
        try {
            const response = await fetch(src);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = src.substring(src.lastIndexOf('/') + 1) || alt || 'image.jpg';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Download failed:", error);
            window.open(src, '_blank');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.img
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                src={src}
                alt={alt}
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute top-4 right-4 flex gap-2">
                <Button onClick={handleDownload} variant="secondary" className="!p-3 !rounded-full" aria-label="Скачать изображение"><Download /></Button>
                {/* Исправлена ошибка S6827: Добавлен aria-label к ссылке */}
                <a href={src} target="_blank" rel="noopener noreferrer" aria-label="Открыть в новой вкладке">
                    {/* Исправлена ошибка TS2322: Убран некорректный проп 'as' */}
                    <Button as="span" variant="secondary" className="!p-3 !rounded-full"><ExternalLink /></Button>
                </a>
                <Button onClick={onClose} variant="secondary" className="!p-3 !rounded-full" aria-label="Закрыть"><X /></Button>
            </div>
        </motion.div>
    );
};

// Исправлена ошибка S6478: Компонент MessageContent вынесен за пределы родительского
const MessageContent: React.FC<MessageContentProps> = ({ msg, isLoading, onImageClick }) => {
    const imageRegex = /!\[(.*?)\]\((.*?)\)/g;
    const images: { alt: string, src: string }[] = [];
    let textOnlyContent = msg.content;

    let match;
    while ((match = imageRegex.exec(msg.content)) !== null) {
        images.push({ alt: match[1], src: match[2] });
    }
    textOnlyContent = textOnlyContent.replace(imageRegex, '').trim();

    return (
        <div className={`prose prose-sm max-w-full rounded-2xl p-3 ${msg.role === 'user' ? 'bg-brand-primary text-white prose-invert' : 'bg-brand-background text-brand-text-primary'}`}>
            {textOnlyContent && (
                 <ReactMarkdown rehypePlugins={[rehypeRaw]} components={{ a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline" /> }}>
                    {textOnlyContent}
                 </ReactMarkdown>
            )}
            
            {images.length > 0 && (
                <div className="not-prose mt-2 flex flex-wrap gap-2">
                    {images.map((image, index) => (
                         // Исправлены ошибки S6847, S1082 и S6479: img обернут в button с уникальным ключом
                         <button
                            type="button"
                            key={`${msg.id}-img-${index}`} 
                            className="h-24 w-24 p-0 border-0 rounded-md cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
                            onClick={() => onImageClick(image.src)}
                            aria-label={`Открыть изображение ${image.alt}`}
                         >
                            <img 
                                src={image.src} 
                                alt={image.alt} 
                                className="w-full h-full object-cover rounded-md pointer-events-none"
                             />
                         </button>
                    ))}
                </div>
            )}
            
            {isLoading && msg.role === 'assistant' && msg.content === '' && (
                <span className="inline-block w-2 h-4 bg-current animate-ping ml-1" />
            )}
        </div>
    );
};

export default function MurdomAiWidget({ isOpen, onClose }: AiAssistantWidgetProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{ id: Date.now(), role: 'assistant', content: 'Привет! Я Мурдомыч. Чего тебе?' }]);
        }
    }, [isOpen, messages.length]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { id: Date.now(), role: 'user', content: input };
        
        const historyToSend = [...messages, userMessage]
            .slice(-11, -1) 
            .map(({ role, content }) => ({ role, content })); 

        const assistantMessageId = Date.now() + 1;
        setMessages(prev => [...prev, userMessage, { id: assistantMessageId, role: 'assistant', content: '' }]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userQuery: input, history: historyToSend }),
            });

            if (!response.ok || !response.body) {
                const errorText = await response.text();
                throw new Error(errorText || `Ошибка сети: ${response.statusText}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let streamedContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                streamedContent += decoder.decode(value, { stream: true });
                
                setMessages(currentMessages => 
                    currentMessages.map(msg => 
                        msg.id === assistantMessageId 
                            ? { ...msg, content: streamedContent } 
                            : msg
                ));
            }

        } catch (error) {
             setMessages(prev => prev.map(msg =>
                msg.id === assistantMessageId
                    ? { ...msg, content: error instanceof Error ? `Произошла ошибка: ${error.message}` : 'Ой, что-то пошло не так. Попробуй еще раз!' }
                    : msg
             ));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {lightboxImage && <Lightbox src={lightboxImage} alt="Просмотр изображения" onClose={() => setLightboxImage(null)} />}
            {isOpen && (
                <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 sm:w-[450px] sm:max-h-[70vh] bg-brand-surface rounded-none sm:rounded-2xl shadow-2xl flex flex-col z-[60] border border-brand-border"
                >
                    <header className="flex items-center justify-between p-4 border-b border-brand-border flex-shrink-0">
                        <h3 className="text-xl font-bold text-brand-primary flex items-center gap-2">
                            <Sparkles /> Ассистент Мурдомыч
                        </h3>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-brand-background"><X size={24}/></button>
                    </header>
          
                    <main className="flex-grow p-4 space-y-4 overflow-y-auto">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex gap-3 items-start ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 text-gray-600 font-bold flex-shrink-0`}>
                                    {msg.role === 'assistant' ? <Sparkles size={16}/> : 'Я'}
                                </div>
                                <MessageContent 
                                    msg={msg} 
                                    isLoading={isLoading}
                                    onImageClick={setLightboxImage}
                                />
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </main>
          
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-brand-border flex items-center gap-2">
                        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Спроси меня что-нибудь..." className="w-full px-4 py-2 bg-brand-background rounded-full outline-none focus:ring-2 focus:ring-brand-primary" disabled={isLoading} />
                        <Button type="submit" className="h-10 w-10 bg-brand-primary text-white rounded-full flex-shrink-0" isLoading={isLoading}>
                            {!isLoading && <Send/>}
                        </Button>
                    </form>
                </motion.div>
            )}
        </AnimatePresence>
    );
}