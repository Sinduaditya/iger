'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Send, User } from 'lucide-react';

// Function untuk format markdown sederhana
const formatMessage = (text) => {
  if (!text) return '';
  
  return text
    // Bold text **text** menjadi <strong>text</strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic text *text* menjadi <em>text</em>
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Line breaks
    .replace(/\n/g, '<br/>')
    // Bullet points - atau *
    .replace(/^[-*]\s/gm, '• ');
};

export function ChatAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef(null);

  // Auto scroll ke bawah saat ada pesan baru
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.message,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-50" size="icon">
          <Bot className="h-7 w-7" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-md h-full">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-lg font-semibold">🐟 iGer AI Assistant</SheetTitle>
          <SheetDescription className="text-sm text-gray-600">
            Tanya apa saja tentang ikan dan budidaya perikanan
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
          <div className="space-y-4 min-h-full flex flex-col">
            {messages.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Bot className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                  <p className="text-sm leading-relaxed">
                    Halo! Saya iGer AI. Tanyakan tentang:<br/>
                    • Budidaya ikan<br/>
                    • Jenis-jenis ikan<br/>
                    • Tips perikanan<br/>
                    • Dan lainnya!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pb-4">
                {messages.map((m) => (
                  <div key={m.id} className={`flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
                    {m.role === 'assistant' && (
                      <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                        <AvatarFallback className="bg-blue-100">
                          <Bot size={16} className="text-blue-600" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-xl px-4 py-2 max-w-[85%] ${
                        m.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-md'
                          : 'bg-slate-100 text-slate-900 border rounded-bl-md'
                      }`}
                    >
                      <div 
                        className="text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ 
                          __html: formatMessage(m.content) 
                        }}
                      />
                    </div>
                    {m.role === 'user' && (
                      <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                        <AvatarFallback className="bg-blue-600">
                          <User size={16} className="text-white" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                      <AvatarFallback className="bg-blue-100">
                        <Bot size={16} className="text-blue-600" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-slate-100 text-slate-900 rounded-xl rounded-bl-md px-4 py-2 border">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <span className="text-sm">Sedang mengetik...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="pt-4 border-t">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya apa saja tentang ikan..."
              disabled={isLoading}
              className="flex-1 rounded-full"
            />
            <Button 
              type="submit" 
              size="icon" 
              className="flex-shrink-0 rounded-full h-10 w-10" 
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}