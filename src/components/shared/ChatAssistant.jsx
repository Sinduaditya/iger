'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Send, User, MessageSquarePlus, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // Library untuk render markdown

export function ChatAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef(null);

  // Fungsi auto-scroll tetap sama
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages]);

  // Fungsi untuk mengirim pesan (menggunakan logika fetch standar, bukan streaming)
  const sendMessage = async (messageContent) => {
    if (!messageContent.trim()) return;

    const userMessage = { id: Date.now(), role: 'user', content: messageContent };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }), // Kirim riwayat chat
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const assistantMessage = { id: Date.now() + 1, role: 'assistant', content: data.message };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Maaf, asisten AI sedang sibuk. Silakan coba beberapa saat lagi.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
    setInput('');
  };

  const handlePromptClick = (prompt) => {
    // Langsung kirim prompt sebagai pesan baru
    sendMessage(prompt);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {/* UI IMPROVEMENT: Tombol utama menggunakan warna brand (oranye) */}
        <Button className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-orange-600 hover:bg-orange-700 shadow-xl z-50 transform transition-transform hover:scale-110">
          <Bot className="h-8 w-8 text-white" />
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-md h-full p-0">
        <SheetHeader className="p-4 border-b bg-slate-50">
          <SheetTitle className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="text-orange-500 h-5 w-5"/> iGer AI Assistant
          </SheetTitle>
          <SheetDescription className="text-sm text-gray-500">
            Asisten cerdas Anda untuk semua hal tentang perikanan.
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea ref={scrollAreaRef} className="flex-1 bg-slate-50/50">
          <div className="p-4 space-y-6">
            {messages.length === 0 ? (
              // UI IMPROVEMENT: Layar sambutan dengan tombol prompt interaktif
              <div className="text-center text-gray-500 py-10">
                <Bot className="h-16 w-16 mx-auto mb-4 text-orange-500" />
                <p className="font-semibold text-gray-700 mb-4">Ada yang bisa dibantu?</p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start text-left h-auto py-2 bg-white" onClick={() => handlePromptClick('Apa saja jenis ikan air tawar yang populer dibudidayakan?')}>
                    <MessageSquarePlus className="w-4 h-4 mr-2 flex-shrink-0 text-orange-500"/> Apa saja jenis ikan air tawar populer?
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start text-left h-auto py-2 bg-white" onClick={() => handlePromptClick('Bagaimana cara memulai budidaya ikan lele di kolam terpal?')}>
                    <MessageSquarePlus className="w-4 h-4 mr-2 flex-shrink-0 text-orange-500"/> Bagaimana cara memulai budidaya lele?
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start text-left h-auto py-2 bg-white" onClick={() => handlePromptClick('Berikan tips menjaga kualitas air kolam')}>
                    <MessageSquarePlus className="w-4 h-4 mr-2 flex-shrink-0 text-orange-500"/> Berikan tips menjaga kualitas air kolam.
                  </Button>
                </div>
              </div>
            ) : (
              messages.map((m) => (
                // UI IMPROVEMENT: Layout bubble chat lebih rapi dan modern
                <div key={m.id} className={`flex items-start gap-3 w-full ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Avatar className="h-8 w-8 flex-shrink-0 border-2 border-white">
                    <AvatarFallback className={m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}>
                      {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`rounded-xl px-4 py-3 max-w-[85%] prose prose-sm prose-p:my-2 ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-900 rounded-bl-none shadow-sm'}`}>
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              // UI IMPROVEMENT: Indikator loading yang lebih halus
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0 border-2 border-white"><AvatarFallback className="bg-slate-200 text-slate-700"><Bot size={16} /></AvatarFallback></Avatar>
                <div className="bg-white rounded-xl rounded-bl-none px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t bg-white">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <Input
              value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya iGer AI..." disabled={isLoading}
              className="flex-1 rounded-full h-11 focus-visible:ring-orange-400"
            />
            <Button type="submit" size="icon" className="rounded-full h-11 w-11 flex-shrink-0 bg-blue-600 hover:bg-blue-700" disabled={isLoading || !input.trim()}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}