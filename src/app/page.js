'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Fish, 
  ScanLine, 
  Map, 
  Bot, 
  Truck, 
  Store, 
  Users, 
  Star,
  CheckCircle,
  ArrowRight,
  Shield,
  Clock,
  MapPin
} from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Tidak ada user, tampilkan landing page
        setShowLanding(true);
      } else {
        // Ada user, redirect berdasarkan role ke dashboard masing-masing
        console.log('🎯 Redirecting user:', user.email, 'with role:', user.role);
        
        switch (user.role) {
          case 'admin':
            router.push('/admin/dashboard');
            break;
          case 'pangkalan':
            router.push('/pangkalan/dashboard');
            break;
          case 'user':
          default:
            router.push('/buyer/dashboard');
            break;
        }
      }
    }
  }, [user, loading, router]);

  // Loading state saat cek authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirecting state untuk logged-in users
  if (user && !showLanding) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // Landing page untuk users yang belum login
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-slate-50">
      
      {/* Header */}
      <header className="flex justify-between items-center p-4 lg:px-8 border-b bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <Fish className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">IGER</h1>
            <p className="text-xs text-slate-500">Fish Delivery Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/login">Masuk</Link>
          </Button>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative text-center px-6 py-20 sm:py-28 bg-gradient-to-br from-blue-600 to-blue-800 text-white overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 border border-white rounded-full"></div>
            <div className="absolute top-32 right-20 w-16 h-16 border border-white rounded-full"></div>
            <div className="absolute bottom-20 left-1/4 w-12 h-12 border border-white rounded-full"></div>
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
              🎣 Platform Pengiriman Ikan #1 di Indonesia
            </Badge>
            
            <h2 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              Ikan Segar Langsung ke
              <span className="text-yellow-300"> Pintu Anda</span>
            </h2>
            
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-blue-100 mb-8 leading-relaxed">
              Platform terpercaya yang menghubungkan pembeli dengan pangkalan ikan terbaik. 
              Pesan ikan segar, tracking real-time, dan scan AI untuk jaminan kualitas.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg">
                <Link href="/register/role" className="flex items-center gap-2">
                  Mulai Belanja Ikan
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" className="border-white text-white px-8 py-3 text-lg">
                Pelajari Lebih Lanjut
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold">50+</div>
                <div className="text-sm text-blue-200">Pangkalan Partner</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">1000+</div>
                <div className="text-sm text-blue-200">Customer Puas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm text-blue-200">Delivery Ready</div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                Cara Kerja IGER
              </h3>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Platform sederhana yang menghubungkan Anda dengan ikan segar berkualitas
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Store className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-lg mb-2">1. Pilih Pangkalan</h4>
                <p className="text-slate-600 text-sm">Jelajahi katalog ikan dari pangkalan terpercaya di sekitar Anda</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ScanLine className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-lg mb-2">2. Scan Kualitas</h4>
                <p className="text-slate-600 text-sm">Gunakan AI scan untuk memastikan kesegaran ikan sebelum pesan</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-orange-600" />
                </div>
                <h4 className="font-semibold text-lg mb-2">3. Pengiriman</h4>
                <p className="text-slate-600 text-sm">Driver pangkalan mengantarkan pesanan langsung ke alamat Anda</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="font-semibold text-lg mb-2">4. Nikmati</h4>
                <p className="text-slate-600 text-sm">Terima ikan segar berkualitas dan nikmati masakan lezat Anda</p>
              </div>
            </div>
          </div>
        </section>

        {/* Role-Based Section */}
        <section className="py-20 px-6 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                Bergabung Sesuai Peran Anda
              </h3>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                IGER menghadirkan solusi lengkap untuk semua pihak dalam ekosistem ikan segar
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
              {/* Card untuk Pembeli */}
              <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 group border-2 hover:border-blue-200">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100 rounded-bl-full opacity-50"></div>
                <CardHeader className="relative">
                  <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                    <Users className="w-7 h-7 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl text-slate-800">Untuk Pembeli</CardTitle>
                  <p className="text-slate-600">Konsumen yang ingin membeli ikan segar</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Katalog ikan dari berbagai pangkalan
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    AI scan untuk cek kesegaran
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Tracking pengiriman real-time
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Jaminan kualitas dan kesegaran
                  </div>
                  
                  <Button asChild className="w-full mt-6 bg-blue-600 hover:bg-blue-700">
                    <Link href="/register?role=user">
                      Daftar sebagai Pembeli
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Card untuk Pangkalan */}
              <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 group border-2 hover:border-orange-200">
                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-100 rounded-bl-full opacity-50"></div>
                <CardHeader className="relative">
                  <div className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                    <Store className="w-7 h-7 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl text-slate-800">Untuk Pangkalan</CardTitle>
                  <p className="text-slate-600">Hub yang mengelola stok dan pengiriman</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Kelola katalog dan stok ikan
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Dashboard manajemen pesanan
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Kelola driver pengiriman
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Analitik penjualan mendalam
                  </div>
                  
                  <Button asChild className="w-full mt-6 bg-orange-600 hover:bg-orange-700">
                    <Link href="/register?role=pangkalan">
                      Daftar sebagai Pangkalan
                    </Link>
                  </Button>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                Teknologi Canggih untuk Ikan Segar
              </h3>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Kombinasi AI, GPS tracking, dan platform terintegrasi untuk pengalaman terbaik
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto bg-blue-100 rounded-full h-16 w-16 flex items-center justify-center">
                    <ScanLine className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="mt-4 text-lg">AI Scan Kesegaran</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-600 text-sm">
                  Teknologi computer vision untuk menganalisis kesegaran ikan secara akurat dalam hitungan detik.
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto bg-green-100 rounded-full h-16 w-16 flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="mt-4 text-lg">Real-time Tracking</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-600 text-sm">
                  Pantau perjalanan pesanan Anda dari pangkalan hingga sampai di pintu rumah secara real-time.
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto bg-orange-100 rounded-full h-16 w-16 flex items-center justify-center">
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                  <CardTitle className="mt-4 text-lg">Pengiriman Cepat</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-600 text-sm">
                  Jaringan driver terpercaya dengan sistem optimasi rute untuk pengiriman maksimal 2 jam.
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto bg-purple-100 rounded-full h-16 w-16 flex items-center justify-center">
                    <Bot className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="mt-4 text-lg">AI Assistant</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-600 text-sm">
                  Chatbot cerdas untuk konsultasi seputar ikan, resep masakan, dan tips memasak.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              Siap Merasakan Ikan Segar Berkualitas?
            </h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Bergabung dengan ribuan pengguna yang sudah merasakan kemudahan dan kualitas IGER
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button  size="lg" className="border-white text-white px-8 py-3 text-lg">
                <Link href="/login">Masuk ke Akun</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Fish className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">IGER</h4>
                <p className="text-sm text-slate-400">Fish Delivery Platform</p>
              </div>
            </div>
            <p className="text-slate-400 mb-4 max-w-md">
              Platform pengiriman ikan segar terpercaya yang menghubungkan pembeli dengan pangkalan ikan berkualitas di seluruh Indonesia.
            </p>
            <div className="flex gap-4">
              <div className="flex items-center text-sm">
                <Star className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="text-white font-semibold">4.8</span>
                <span className="text-slate-400 ml-1">(1,234 ulasan)</span>
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="font-semibold text-white mb-4">Platform</h5>
            <ul className="space-y-2 text-sm">
              <li><Link href="/register?role=user" className="hover:text-white transition-colors">Untuk Pembeli</Link></li>
              <li><Link href="/register?role=pangkalan" className="hover:text-white transition-colors">Untuk Pangkalan</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-semibold text-white mb-4">Bantuan</h5>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Pusat Bantuan</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Kontak Support</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto border-t border-slate-700 mt-8 pt-8 text-center">
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} IGER. Platform Pengiriman Ikan Segar. Dibuat dengan ❤️ di Indonesia.
          </p>
        </div>
      </footer>
    </div>
  );
}