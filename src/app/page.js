import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fish, ScanLine, Map, Bot } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Fish className="h-7 w-7 text-blue-600" />
          <h1 className="text-xl font-bold text-slate-800">iGer</h1>
        </div>
        <Button asChild>
          <Link href="/login">Masuk</Link>
        </Button>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="text-center px-6 py-20 sm:py-28 bg-sky-100">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900">
            Kesegaran Ikan di Ujung Jari Anda
          </h2>
          <p className="max-w-2xl mx-auto mt-4 text-lg text-slate-600">
            Gunakan teknologi AI untuk memindai dan memastikan kualitas ikan yang Anda beli. Cepat, mudah, dan akurat.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/register">Coba Gratis Sekarang</Link>
          </Button>
        </section>

        {/* Features Section */}
        <section className="py-16 sm:py-20 px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-800">Fitur Unggulan iGer</h3>
            <p className="mt-2 text-md text-slate-500">Semua yang Anda butuhkan untuk pengalaman jual-beli ikan terbaik.</p>
          </div>
          
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-blue-100 rounded-full h-14 w-14 flex items-center justify-center">
                  <ScanLine className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="mt-4">AI Scan Kesegaran</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-600">
                Ambil foto ikan dan biarkan AI kami menganalisis kesegarannya dalam hitungan detik.
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-blue-100 rounded-full h-14 w-14 flex items-center justify-center">
                  <Map className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="mt-4">Peta Pasar Terpercaya</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-600">
                Temukan nelayan dan pasar dengan reputasi terbaik di sekitar Anda melalui peta interaktif kami.
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto bg-blue-100 rounded-full h-14 w-14 flex items-center justify-center">
                  <Bot className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="mt-4">Asisten AI Cerdas</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-600">
                Tanyakan apa saja seputar ikan, nutrisi, dan resep masakan kepada chatbot AI kami.
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center p-6 bg-slate-100 border-t">
        <p className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} iGer. Dibuat dengan ❤️ di Indonesia.
        </p>
      </footer>
    </div>
  );
}