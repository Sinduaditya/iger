'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Fish,
  ScanLine,
  MapPin,
  Bot,
  Truck,
  Store,
  Users,
  Star,
  CheckCircle,
  ArrowRight,
  Clock,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Hero slider images
  const heroSlides = [
    {
      image: "/images/iger-hero.png",
      title: "Ikan Segar Langsung ke",
      subtitle: "Pintu Anda",
      description: "Platform terpercaya yang menghubungkan pembeli dengan pangkalan ikan terbaik."
    },
    {
      image: "/images/hero2.png",
      title: "Teknologi AI untuk",
      subtitle: "Kualitas Terbaik",
      description: "Scan AI otomatis memastikan kesegaran ikan sebelum dikirim ke rumah Anda."
    },
    {
      image: "/images/hero3.png",
      title: "Pengiriman Cepat",
      subtitle: "Real-time Tracking",
      description: "Driver terpercaya dengan sistem tracking langsung dari pangkalan ke tangan Anda."
    }
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-play slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-slate-50">
      {/* Enhanced Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200'
        : 'bg-transparent'
        }`}>
        <div className="flex justify-between items-center px-4 lg:px-8 h-20">
          <div className="flex items-center gap-2">
            <div className="w-28 h-28 rounded-xl overflow-hidden">
              <img
                src="/images/logo.png"
                alt="IGER Logo"
                className="w-full h-full object-cover"
              />
            </div>

          </div>

          <div className="flex items-center gap-4">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="/tentang-iGer" className={`text-sm font-medium transition-all duration-300 hover:text-[#F37125] relative group ${isScrolled ? 'text-[#0D253C]' : 'text-white'
                }`}>
                Tentang iGer
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#F37125] transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="/fitur-kami" className={`text-sm font-medium transition-all duration-300 hover:text-[#F37125] relative group ${isScrolled ? 'text-[#0D253C]' : 'text-white'
                }`}>
                Fitur Kami
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#F37125] transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="/kontak" className={`text-sm font-medium transition-all duration-300 hover:text-[#F37125] relative group ${isScrolled ? 'text-[#0D253C]' : 'text-white'
                }`}>
                Hubungi Kami
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#F37125] transition-all duration-300 group-hover:w-full"></span>
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${isScrolled
                ? 'text-[#0D253C] hover:bg-gray-100'
                : 'text-white hover:bg-white/20'
                }`}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Button
              size="sm"
              className="bg-[#F37125] hover:bg-[#F37125]/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6"
            >
              <Link href="/login">Masuk</Link>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200">
            <nav className="flex flex-col p-4 space-y-4">
              <a href="/tentang-iger" className="text-[#0D253C] hover:text-[#F37125] transition-colors">
                Tentang iGer
              </a>
              <a href="/fitur-kami" className="text-[#0D253C] hover:text-[#F37125] transition-colors">
                Fitur Kami
              </a>
              <a href="/kontak" className="text-[#0D253C] hover:text-[#F37125] transition-colors">
                Hubungi Kami
              </a>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-grow">
        {/* Enhanced Hero Section with Slider */}
        <section className="relative h-screen overflow-hidden">
          {/* Slider Container */}
          <div className="relative h-full">
            {heroSlides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#0D253C]/80 via-[#125F95]/70 to-[#0D253C]/80"></div>
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Content Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-6 max-w-5xl mx-auto">
              <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30 animate-pulse">
                🎣 Platform Pengiriman Ikan #1 di Indonesia
              </Badge>

              <h2 className="text-4xl md:text-7xl font-extrabold mb-6 leading-tight text-white">
                {heroSlides[currentSlide].title}
                <span className="text-[#F37125] block mt-2">{heroSlides[currentSlide].subtitle}</span>
              </h2>

              <p className="max-w-2xl mx-auto text-lg md:text-xl text-blue-100 mb-8 leading-relaxed">
                {heroSlides[currentSlide].description}
                <br />
                Pesan ikan segar, tracking real-time, dan scan AI untuk jaminan kualitas.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button size="lg" className="bg-[#F37125] hover:bg-[#F37125]/90 text-white px-8 py-4 text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
                  <Link href="/register/role" className="flex items-center gap-2">
                    Mulai Belanja Ikan
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" className="border-2 border-white text-white hover:bg-white hover:text-[#125F95] px-8 py-4 text-lg transition-all duration-300 transform hover:scale-105">
                  Pelajari Lebih Lanjut
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#F37125]">50+</div>
                  <div className="text-sm text-blue-200">Pangkalan Partner</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#F37125]">1000+</div>
                  <div className="text-sm text-blue-200">Customer Puas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#F37125]">24/7</div>
                  <div className="text-sm text-blue-200">Delivery Ready</div>
                </div>
              </div>
            </div>
          </div>

          {/* Slider Navigation */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                  ? 'bg-[#F37125] scale-125'
                  : 'bg-white/50 hover:bg-white/80'
                  }`}
              />
            ))}
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 border-2 border-white/20 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-16 h-16 border-2 border-[#F37125]/30 rounded-full animate-bounce"></div>
          <div className="absolute bottom-32 left-1/4 w-12 h-12 border-2 border-white/20 rounded-full animate-pulse"></div>
        </section>

        {/* Enhanced How It Works Section */}
        <section className="py-20 px-6 bg-[#F4F6F8] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#125F95]/10 to-transparent rounded-full transform translate-x-32 -translate-y-32"></div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-bold text-[#0D253C] mb-4">
                Cara Kerja IGER
              </h3>
              <p className="text-lg text-[#125F95] max-w-2xl mx-auto">
                Platform sederhana yang menghubungkan Anda dengan ikan segar berkualitas
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-r from-[#125F95] to-[#0D253C] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Store className="w-10 h-10 text-white" />
                </div>
                <h4 className="font-semibold text-lg mb-2 text-[#0D253C]">1. Pilih Pangkalan</h4>
                <p className="text-[#125F95] text-sm">Jelajahi katalog ikan dari pangkalan terpercaya di sekitar Anda</p>
              </div>

              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-r from-[#F37125] to-[#F37125]/80 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <ScanLine className="w-10 h-10 text-white" />
                </div>
                <h4 className="font-semibold text-lg mb-2 text-[#0D253C]">2. Scan Kualitas</h4>
                <p className="text-[#125F95] text-sm">Gunakan AI scan untuk memastikan kesegaran ikan sebelum pesan</p>
              </div>

              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-r from-[#125F95] to-[#F37125] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Truck className="w-10 h-10 text-white" />
                </div>
                <h4 className="font-semibold text-lg mb-2 text-[#0D253C]">3. Pengiriman</h4>
                <p className="text-[#125F95] text-sm">Driver pangkalan mengantarkan pesanan langsung ke alamat Anda</p>
              </div>

              <div className="text-center group">
                <div className="w-20 h-20 bg-gradient-to-r from-[#F37125] to-[#0D253C] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h4 className="font-semibold text-lg mb-2 text-[#0D253C]">4. Nikmati</h4>
                <p className="text-[#125F95] text-sm">Terima ikan segar berkualitas dan nikmati masakan lezat Anda</p>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Role-Based Section */}
        <section className="py-20 px-6 bg-white relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#125F95]/5 to-transparent rounded-full transform -translate-x-48 translate-y-48"></div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-bold text-[#0D253C] mb-4">
                Bergabung Sesuai Peran Anda
              </h3>
              <p className="text-lg text-[#125F95] max-w-2xl mx-auto">
                IGER menghadirkan solusi lengkap untuk semua pihak dalam ekosistem ikan segar
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Card untuk Pembeli */}
              <Card className="relative overflow-hidden hover:shadow-2xl transition-all duration-500 group border-2 hover:border-[#125F95] transform hover:-translate-y-2">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#125F95]/20 to-transparent rounded-bl-full"></div>
                <CardHeader className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#125F95] to-[#0D253C] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-[#0D253C]">Untuk Pembeli</CardTitle>
                  <p className="text-[#125F95]">Konsumen yang ingin membeli ikan segar</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-[#125F95]">
                    <CheckCircle className="w-4 h-4 text-[#F37125] mr-2 flex-shrink-0" />
                    Katalog ikan dari berbagai pangkalan
                  </div>
                  <div className="flex items-center text-sm text-[#125F95]">
                    <CheckCircle className="w-4 h-4 text-[#F37125] mr-2 flex-shrink-0" />
                    AI scan untuk cek kesegaran
                  </div>
                  <div className="flex items-center text-sm text-[#125F95]">
                    <CheckCircle className="w-4 h-4 text-[#F37125] mr-2 flex-shrink-0" />
                    Tracking pengiriman real-time
                  </div>
                  <div className="flex items-center text-sm text-[#125F95]">
                    <CheckCircle className="w-4 h-4 text-[#F37125] mr-2 flex-shrink-0" />
                    Jaminan kualitas dan kesegaran
                  </div>

                  <Button className="w-full mt-6 bg-[#125F95] hover:bg-[#0D253C] text-white transition-all duration-300">
                    <Link href="/register?role=user">Daftar sebagai Pembeli</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Card untuk Pangkalan */}
              <Card className="relative overflow-hidden hover:shadow-2xl transition-all duration-500 group border-2 hover:border-[#F37125] transform hover:-translate-y-2">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#F37125]/20 to-transparent rounded-bl-full"></div>
                <CardHeader className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#F37125] to-[#F37125]/80 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Store className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-[#0D253C]">Untuk Pangkalan</CardTitle>
                  <p className="text-[#125F95]">Hub yang mengelola stok dan pengiriman</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-[#125F95]">
                    <CheckCircle className="w-4 h-4 text-[#F37125] mr-2 flex-shrink-0" />
                    Kelola katalog dan stok ikan
                  </div>
                  <div className="flex items-center text-sm text-[#125F95]">
                    <CheckCircle className="w-4 h-4 text-[#F37125] mr-2 flex-shrink-0" />
                    Dashboard manajemen pesanan
                  </div>
                  <div className="flex items-center text-sm text-[#125F95]">
                    <CheckCircle className="w-4 h-4 text-[#F37125] mr-2 flex-shrink-0" />
                    Kelola driver pengiriman
                  </div>
                  <div className="flex items-center text-sm text-[#125F95]">
                    <CheckCircle className="w-4 h-4 text-[#F37125] mr-2 flex-shrink-0" />
                    Analitik penjualan mendalam
                  </div>

                  <Button className="w-full mt-6 bg-[#F37125] hover:bg-[#F37125]/90 text-white transition-all duration-300">
                    <Link href="/register?role=pangkalan">Daftar sebagai Pangkalan</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section id="fitur" className="py-20 px-6 bg-gradient-to-br from-white to-[#F4F6F8] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-[#F37125]/10 to-transparent rounded-full transform -translate-x-36 -translate-y-36"></div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-bold text-[#0D253C] mb-4">
                Teknologi Canggih untuk Ikan Segar
              </h3>
              <p className="text-lg text-[#125F95] max-w-2xl mx-auto">
                Kombinasi AI, GPS tracking, dan platform terintegrasi untuk pengalaman terbaik
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center hover:shadow-xl transition-all duration-500 group transform hover:-translate-y-2 border-2 hover:border-[#125F95]">
                <CardHeader>
                  <div className="mx-auto bg-gradient-to-r from-[#125F95] to-[#0D253C] rounded-full h-20 w-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <ScanLine className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="mt-4 text-lg text-[#0D253C]">AI Scan Kesegaran</CardTitle>
                </CardHeader>
                <CardContent className="text-[#125F95] text-sm">
                  Teknologi computer vision untuk menganalisis kesegaran ikan secara akurat dalam hitungan detik.
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-xl transition-all duration-500 group transform hover:-translate-y-2 border-2 hover:border-[#F37125]">
                <CardHeader>
                  <div className="mx-auto bg-gradient-to-r from-[#F37125] to-[#F37125]/80 rounded-full h-20 w-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <MapPin className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="mt-4 text-lg text-[#0D253C]">Real-time Tracking</CardTitle>
                </CardHeader>
                <CardContent className="text-[#125F95] text-sm">
                  Pantau perjalanan pesanan Anda dari pangkalan hingga sampai di pintu rumah secara real-time.
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-xl transition-all duration-500 group transform hover:-translate-y-2 border-2 hover:border-[#125F95]">
                <CardHeader>
                  <div className="mx-auto bg-gradient-to-r from-[#125F95] to-[#F37125] rounded-full h-20 w-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Clock className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="mt-4 text-lg text-[#0D253C]">Pengiriman Cepat</CardTitle>
                </CardHeader>
                <CardContent className="text-[#125F95] text-sm">
                  Jaringan driver terpercaya dengan sistem optimasi rute untuk pengiriman maksimal 2 jam.
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-xl transition-all duration-500 group transform hover:-translate-y-2 border-2 hover:border-[#F37125]">
                <CardHeader>
                  <div className="mx-auto bg-gradient-to-r from-[#F37125] to-[#0D253C] rounded-full h-20 w-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Bot className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="mt-4 text-lg text-[#0D253C]">AI Assistant</CardTitle>
                </CardHeader>
                <CardContent className="text-[#125F95] text-sm">
                  Chatbot cerdas untuk konsultasi seputar ikan, resep masakan, dan tips memasak.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-20 px-6 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 to-white/80"></div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-32 h-32 border-2 border-[#125F95]/20 rounded-full animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-24 h-24 border-2 border-[#F37125]/30 rounded-full animate-bounce"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 border-2 border-[#125F95]/20 rounded-full animate-pulse"></div>
          </div>
          <div className="max-w-6xl mx-auto relative z-10">
            {/* Main CTA Content */}
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-bold mb-6 text-[#0D253C]">
                Siap Merasakan Ikan Segar Berkualitas?
              </h3>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Bergabung dengan ribuan pengguna yang sudah merasakan kemudahan dan kualitas IGER
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-[#F37125] hover:bg-[#F37125]/90 text-white px-8 py-4 text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
                  <Link href="/login">Masuk ke Akun</Link>
                </Button>
              </div>
            </div>

            {/* Photo Gallery Section */}
            <div className="grid md:grid-cols-3 gap-8">
              <div className="group relative overflow-hidden rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-500">
                <div className="aspect-[4/3] relative">
                  <img
                    src="/images/CTA1.png"
                    alt="Ikan Segar Berkualitas"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-500">
                <div className="aspect-[4/3] relative">
                  <img
                    src="/images/CTA2.png"
                    alt="AI Scanning Technology"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-500">
                <div className="aspect-[4/3] relative">
                  <img
                    src="/images/CTA3.png"
                    alt="Pengiriman Cepat"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-[#0D253C] text-slate-300 py-12 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#125F95]/20 to-transparent rounded-full transform translate-x-32 -translate-y-32"></div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 relative z-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#125F95] to-[#F37125] rounded-xl flex items-center justify-center">
                <img
                src="/images/logo.png"
                alt="IGER Logo"
                className="w-full h-full object-cover"
              />
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
                <Star className="w-4 h-4 text-[#F37125] mr-1" />
                <span className="text-white font-semibold">4.8</span>
                <span className="text-slate-400 ml-1">(1,234 ulasan)</span>
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-white mb-4">Platform</h5>
            <ul className="space-y-2 text-sm">
              <li><a href="/register?role=user" className="hover:text-[#F37125] transition-colors">Untuk Pembeli</a></li>
              <li><a href="/register?role=pangkalan" className="hover:text-[#F37125] transition-colors">Untuk Pangkalan</a></li>
              <li><a href="/login" className="hover:text-[#F37125] transition-colors">Login</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-white mb-4">Bantuan</h5>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-[#F37125] transition-colors">Pusat Bantuan</a></li>
              <li><a href="#" className="hover:text-[#F37125] transition-colors">Kontak Support</a></li>
              <li><a href="#" className="hover:text-[#F37125] transition-colors">FAQ</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto border-t border-slate-700 mt-8 pt-8 text-center relative z-10">
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} IGER. Platform Pengiriman Ikan Segar. Dibuat dengan ❤ di Indonesia.
          </p>
        </div>
      </footer>
    </div>
  );
}