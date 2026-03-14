'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, Send, X, Loader2, PhoneForwarded } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

interface ConciergeChatProps {
  packageId: string;
  destinationName: string;
  conciergePhone?: string;
}

const DEFAULT_PHONE = '5562999999999';
const ESCALATION_KEYWORDS = ['emergência', 'emergencia', 'cancelar', 'problema grave', 'urgente'];

export function ConciergeChat({ packageId, destinationName, conciergePhone }: ConciergeChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Olá! Sou o assistente TravelMatch para sua viagem em ${destinationName}. Como posso ajudar?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const phone = conciergePhone ?? DEFAULT_PHONE;

  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const shouldEscalate = useCallback((text: string): boolean => {
    const lower = text.toLowerCase();
    return ESCALATION_KEYWORDS.some((kw) => lower.includes(kw));
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Check for escalation
    if (shouldEscalate(userMessage.content)) {
      const escalation: Message = {
        id: `sys-${Date.now()}`,
        role: 'system',
        content: 'Detectei que você precisa de suporte urgente. Vou conectar você com nosso concierge humano.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, escalation]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/concierge/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_id: packageId,
          message: userMessage.content,
          history: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.response ?? 'Desculpe, não consegui processar. Tente novamente.',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        setMessages((prev) => [...prev, {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Desculpe, estou com dificuldades técnicas. Fale com nosso concierge por WhatsApp.',
          timestamp: new Date().toISOString(),
        }]);
      }
    } catch {
      setMessages((prev) => [...prev, {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Sem conexão. Tente novamente ou fale com nosso concierge por WhatsApp.',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(`Preciso de ajuda! Pacote: ${packageId.slice(0, 8)}`)}`;

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex size-14 items-center justify-center rounded-full bg-turquoise-600 text-white shadow-lg hover:bg-turquoise-700 transition"
        data-testid="chat-fab"
      >
        <MessageCircle className="size-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 z-50 w-full sm:bottom-6 sm:right-6 sm:w-96" data-testid="chat-panel">
      <Card className="flex h-[70vh] sm:h-[500px] flex-col overflow-hidden rounded-none sm:rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-turquoise-600 px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold text-white">Concierge TravelMatch</h3>
            <p className="text-[10px] text-turquoise-100">IA 24/7 · Humano 8h-22h</p>
          </div>
          <div className="flex items-center gap-2">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" data-testid="escalate-whatsapp">
              <Button variant="ghost" size="icon" className="text-white hover:bg-turquoise-700">
                <PhoneForwarded className="size-4" />
              </Button>
            </a>
            <Button variant="ghost" size="icon" className="text-white hover:bg-turquoise-700" onClick={() => setIsOpen(false)} data-testid="chat-close">
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3" data-testid="chat-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-turquoise-600 text-white'
                    : msg.role === 'system'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-sand-100 text-sand-700'
                }`}
                data-testid={`msg-${msg.id}`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-xl bg-sand-100 px-3 py-2" data-testid="chat-loading">
                <Loader2 className="size-4 animate-spin text-sand-400" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input */}
        <div className="border-t border-sand-100 p-3">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 rounded-lg border border-sand-200 px-3 py-2 text-sm text-sand-700 placeholder:text-sand-300"
              data-testid="chat-input"
            />
            <Button
              type="submit"
              size="icon"
              className="bg-turquoise-600 hover:bg-turquoise-700"
              disabled={!input.trim() || loading}
              data-testid="chat-send"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
