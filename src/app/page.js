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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Menjadi true jika scroll lebih dari 10px
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    // Membersihkan event listener saat komponen di-unmount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <div className="flex flex-col min-h-screen bg-[#FFFFFF]">
      {/* Header */}
      <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white shadow-lg border-b border-gray-200'
          : 'bg-gradient-to-b from-black/50 to-transparent' // Latar belakang transparan dengan gradasi untuk visibilitas
      }`}
    >
      <div className="flex justify-between items-center px-4 lg:px-8 h-20 md:h-24">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          {/* Logo kini lebih besar dan tanpa background oranye */}
          <div className="w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
            <img
              src="/images/logo.png"
              alt="IGER Logo"
              className="w-full h-full object-contain" // object-contain agar seluruh logo terlihat
            />
          </div>
        </Link>

        <div className="flex items-center gap-4">
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              href="/tentang-iGer"
              className={`text-sm font-medium transition-colors hover:text-[#F37125] ${
                isScrolled ? 'text-[#0D253C]' : 'text-white'
              }`}
            >
              Tentang iGer
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors ${
              isScrolled
                ? 'text-[#0D253C] hover:bg-gray-100'
                : 'text-white hover:bg-white/20'
            }`}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Login Button */}
          <Button
            size="sm"
            className="hidden sm:inline-flex bg-[#F37125] hover:bg-[#F37125]/90 text-white px-4 md:px-6 text-sm font-medium rounded-md"
            asChild
          >
            <Link href="/login">Masuk</Link>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
          <nav className="flex flex-col p-4 space-y-3">
            <Link
              href="/tentang-iGer"
              className="text-[#0D253C] hover:text-[#F37125] transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Tentang iGer
            </Link>
            {/* Tombol Masuk untuk mobile */}
            <Button
              className="w-full mt-4 bg-[#F37125] hover:bg-[#F37125]/90 text-white"
              asChild
            >
              <Link href="/login">Masuk</Link>
            </Button>
          </nav>
        </div>
      )}
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-screen overflow-hidden bg-[#0D253C]">
          {/* Slider Container */}
          <div className="relative h-full">
            {heroSlides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="absolute inset-0 bg-[#0D253C]/40"></div>
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
            <div className="text-center px-4 md:px-6 max-w-4xl mx-auto">
              <Badge className="mb-6 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-[#0D253C] shadow-lg backdrop-blur-md">
                  🎣 Platform Pengiriman Ikan #1 di Indonesia
              </Badge>

              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight text-[#FFFFFF]">
                {heroSlides[currentSlide].title}
                <span className="text-[#F37125] block mt-2">{heroSlides[currentSlide].subtitle}</span>
              </h2>

              <p className="max-w-2xl mx-auto text-base md:text-lg lg:text-xl text-[#F4F6F8] mb-6 md:mb-8 leading-relaxed px-4">
                {heroSlides[currentSlide].description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 md:mb-12 px-4">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-[#F37125] hover:bg-[#F37125]/90 text-[#FFFFFF] px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-medium"
                >
                  <Link href="/register?role=user" className="flex items-center gap-2">
                    Mulai Belanja Ikan
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 md:gap-8 max-w-md mx-auto px-4">
                <div className="text-center">
                  <div className="text-xl md:text-3xl font-bold text-[#F37125]">50+</div>
                  <div className="text-xs md:text-sm text-[#F4F6F8]">Pangkalan Partner</div>
                </div>
                <div className="text-center">
                  <div className="text-xl md:text-3xl font-bold text-[#F37125]">1000+</div>
                  <div className="text-xs md:text-sm text-[#F4F6F8]">Customer Puas</div>
                </div>
              </div>
            </div>
          </div>

          {/* Slider Navigation */}
          <button
            onClick={prevSlide}
            className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-[#FFFFFF]/20 hover:bg-[#FFFFFF]/30 text-[#FFFFFF] p-2 md:p-3 rounded-full transition-all duration-300"
          >
            <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-[#FFFFFF]/20 hover:bg-[#FFFFFF]/30 text-[#FFFFFF] p-2 md:p-3 rounded-full transition-all duration-300"
          >
            <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-[#F37125] scale-125'
                    : 'bg-[#FFFFFF]/50 hover:bg-[#FFFFFF]/80'
                }`}
              />
            ))}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-12 md:py-20 px-4 md:px-6 bg-[#F4F6F8]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 md:mb-16">
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#0D253C] mb-4">
                Cara Kerja Pengiriman iGer
              </h3>
              <p className="text-base md:text-lg text-[#125F95] max-w-2xl mx-auto px-4 animate-pulse">
                Platform sederhana yang menghubungkan Anda dengan ikan segar berkualitas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="text-center bg-[#FFFFFF] p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-[#125F95] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Store className="w-8 h-8 text-[#FFFFFF]" />
                </div>
                <h4 className="font-semibold text-lg mb-2 text-[#0D253C]">1. Pilih Pangkalan</h4>
                <p className="text-[#125F95] text-sm">Jelajahi katalog ikan dari pangkalan terpercaya di sekitar Anda</p>
              </div>


              <div className="text-center bg-[#FFFFFF] p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-[#F37125] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-[#FFFFFF]" />
                </div>
                <h4 className="font-semibold text-lg mb-2 text-[#0D253C]">2. Pengiriman</h4>
                <p className="text-[#125F95] text-sm">Driver pangkalan mengantarkan pesanan langsung ke alamat Anda</p>
              </div>

              <div className="text-center bg-[#FFFFFF] p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16  bg-[#125F95] rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-[#FFFFFF]" />
                </div>
                <h4 className="font-semibold text-lg mb-2 text-[#0D253C]">3. Nikmati</h4>
                <p className="text-[#125F95] text-sm">Terima ikan segar berkualitas dan nikmati masakan lezat Anda</p>
              </div>
            </div>
          </div>
        </section>

        {/* Role-Based Section */}
        <section className="py-12 md:py-20 px-4 md:px-6 bg-[#FFFFFF]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 md:mb-16">
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#0D253C] mb-4">
                Bergabung Sesuai Peran Anda
              </h3>
              <p className="text-base md:text-lg text-[#125F95] max-w-2xl mx-auto px-4">
                IGER menghadirkan solusi lengkap untuk semua pihak dalam ekosistem ikan segar
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Card untuk Pembeli */}
              <Card className="border border-[#F4F6F8] hover:border-[#F37125] transition-all duration-300 hover:shadow-lg">
  <CardHeader className="pb-4">
    <div className="w-16 h-16 bg-[#F37125] rounded-xl flex items-center justify-center mb-4">
      <Users className="w-8 h-8 text-[#FFFFFF]" />
    </div>
    <CardTitle className="text-xl text-[#0D253C]">Untuk Pembeli</CardTitle>
    <p className="text-[#F37125]">Konsumen yang ingin membeli ikan segar</p>
  </CardHeader>
  <CardContent className="space-y-3">
    <div className="flex items-center text-sm text-[#F37125]">
      <CheckCircle className="w-4 h-4 text-[#125F95] mr-3 flex-shrink-0" />
      <span>Katalog ikan dari berbagai pangkalan</span>
    </div>
    <div className="flex items-center text-sm text-[#F37125]">
      <CheckCircle className="w-4 h-4 text-[#125F95] mr-3 flex-shrink-0" />
      <span>AI scan untuk cek kesegaran</span>
    </div>
    <div className="flex items-center text-sm text-[#F37125]">
      <CheckCircle className="w-4 h-4 text-[#125F95] mr-3 flex-shrink-0" />
      <span>Tracking pengiriman real-time</span>
    </div>
    <div className="flex items-center text-sm text-[#F37125]">
      <CheckCircle className="w-4 h-4 text-[#125F95] mr-3 flex-shrink-0" />
      <span>Jaminan kualitas dan kesegaran</span>
    </div>

    <Button className="w-full mt-6 bg-[#F37125] hover:bg-[#F37125]/90 text-[#FFFFFF]">
      <Link href="/register?role=user">Daftar sebagai Pembeli</Link>
    </Button>
  </CardContent>
              </Card>
                        
              {/* Card untuk Pangkalan */}
              <Card className="border border-[#F4F6F8] hover:border-[#125F95] transition-all duration-300 hover:shadow-lg">
  <CardHeader className="pb-4">
    <div className="w-16 h-16 bg-[#125F95] rounded-xl flex items-center justify-center mb-4">
      <Store className="w-8 h-8 text-[#FFFFFF]" />
    </div>
    <CardTitle className="text-xl text-[#0D253C]">Untuk Pangkalan</CardTitle>
    <p className="text-[#125F95]">Hub yang mengelola stok dan pengiriman</p>
  </CardHeader>
  <CardContent className="space-y-3">
    <div className="flex items-center text-sm text-[#125F95]">
      <CheckCircle className="w-4 h-4 text-[#F37125] mr-3 flex-shrink-0" />
      <span>Kelola katalog dan stok ikan</span>
    </div>
    <div className="flex items-center text-sm text-[#125F95]">
      <CheckCircle className="w-4 h-4 text-[#F37125] mr-3 flex-shrink-0" />
      <span>Dashboard manajemen pesanan</span>
    </div>
    <div className="flex items-center text-sm text-[#125F95]">
      <CheckCircle className="w-4 h-4 text-[#F37125] mr-3 flex-shrink-0" />
      <span>Kelola driver pengiriman</span>
    </div>
    <div className="flex items-center text-sm text-[#125F95]">
      <CheckCircle className="w-4 h-4 text-[#F37125] mr-3 flex-shrink-0" />
      <span>Analitik penjualan mendalam</span>
    </div>

    <Button className="w-full mt-6 bg-[#125F95] hover:bg-[#0D253C] text-[#FFFFFF]">
      <Link href="/register?role=pangkalan">Daftar sebagai Pangkalan</Link>
    </Button>
  </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-20 px-4 md:px-6 bg-[#F4F6F8]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 md:mb-16">
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#0D253C] mb-4">
                Teknologi Canggih untuk Ikan Segar
              </h3>
              <p className="text-base md:text-lg text-[#125F95] max-w-2xl mx-auto px-4">
                Kombinasi AI, GPS tracking, dan platform terintegrasi untuk pengalaman terbaik
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              <Card className="text-center border border-[#F4F6F8] hover:border-[#125F95] transition-all duration-300 hover:shadow-lg bg-[#FFFFFF]">
                <CardHeader className="pb-4">
                  <div className="mx-auto bg-[#125F95] rounded-full h-16 w-16 flex items-center justify-center mb-4">
                    <ScanLine className="h-8 w-8 text-[#FFFFFF]" />
                  </div>
                  <CardTitle className="text-lg text-[#0D253C]">AI Scan Kesegaran</CardTitle>
                </CardHeader>
                <CardContent className="text-[#125F95] text-sm">
                  Teknologi computer vision untuk menganalisis kesegaran ikan secara akurat dalam hitungan detik.
                </CardContent>
              </Card>

              <Card className="text-center border border-[#F4F6F8] hover:border-[#F37125] transition-all duration-300 hover:shadow-lg bg-[#FFFFFF]">
                <CardHeader className="pb-4">
                  <div className="mx-auto bg-[#F37125] rounded-full h-16 w-16 flex items-center justify-center mb-4">
                    <MapPin className="h-8 w-8 text-[#FFFFFF]" />
                  </div>
                  <CardTitle className="text-lg text-[#0D253C]">Real-time Tracking</CardTitle>
                </CardHeader>
                <CardContent className="text-[#125F95] text-sm">
                  Pantau perjalanan pesanan Anda dari pangkalan hingga sampai di pintu rumah secara real-time.
                </CardContent>
              </Card>

              <Card className="text-center border border-[#F4F6F8] hover:border-[#125F95] transition-all duration-300 hover:shadow-lg bg-[#FFFFFF]">
                <CardHeader className="pb-4">
                  <div className="mx-auto bg-[#125F95] rounded-full h-16 w-16 flex items-center justify-center mb-4">
                    <Clock className="h-8 w-8 text-[#FFFFFF]" />
                  </div>
                  <CardTitle className="text-lg text-[#0D253C]">Pengiriman Cepat</CardTitle>
                </CardHeader>
                <CardContent className="text-[#125F95] text-sm">
                  Jaringan driver terpercaya dengan sistem optimasi rute untuk pengiriman maksimal 2 jam.
                </CardContent>
              </Card>

              <Card className="text-center border border-[#F4F6F8] hover:border-[#F37125] transition-all duration-300 hover:shadow-lg bg-[#FFFFFF]">
                <CardHeader className="pb-4">
                  <div className="mx-auto bg-[#F37125] rounded-full h-16 w-16 flex items-center justify-center mb-4">
                    <Bot className="h-8 w-8 text-[#FFFFFF]" />
                  </div>
                  <CardTitle className="text-lg text-[#0D253C]">AI Assistant</CardTitle>
                </CardHeader>
                <CardContent className="text-[#125F95] text-sm">
                  Chatbot cerdas untuk konsultasi seputar ikan, resep masakan, dan tips memasak.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-20 px-4 md:px-6 bg-[#FFFFFF]">
          <div className="max-w-6xl mx-auto">
            {/* Main CTA Content */}
            <div className="text-center mb-8 md:mb-16">
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 text-[#0D253C]">
                Siap Merasakan Ikan Segar Berkualitas?
              </h3>
              <p className="text-base md:text-xl text-[#125F95] mb-8 max-w-2xl mx-auto px-4">
                Bergabung dengan ribuan pengguna yang sudah merasakan kemudahan dan kualitas IGER
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-[#F37125] hover:bg-[#F37125]/90 text-[#FFFFFF] px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-medium"
                >
                  <Link href="/login">Masuk ke Akun</Link>
                </Button>
              </div>
            </div>

            {/* Photo Gallery Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
              <div className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="aspect-[4/3] relative">
                  <img
                    src="/images/CTA1.png"
                    alt="Ikan Segar Berkualitas"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="aspect-[4/3] relative">
                  <img
                    src="/images/CTA2.png"
                    alt="AI Scanning Technology"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow">
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

      {/* Footer */}
      <footer className="bg-[#0D253C] text-[#F4F6F8] py-8 md:py-12 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8 mb-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl flex items-center justify-center">
                  <img
                    src="/images/logo.png"
                    alt="IGER Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-lg md:text-xl font-bold text-[#FFFFFF]">IGER</h4>
                  <p className="text-sm text-[#F4F6F8]">Fish Delivery Platform</p>
                </div>
              </div>
              <p className="text-[#F4F6F8] mb-4 max-w-md text-sm md:text-base">
                Platform pengiriman ikan segar terpercaya yang menghubungkan pembeli dengan pangkalan ikan berkualitas di seluruh Indonesia.
              </p>
              <div className="flex items-center text-sm">
                <Star className="w-4 h-4 text-[#F37125] mr-1" />
                <span className="text-[#FFFFFF] font-semibold">4.8</span>
                <span className="text-[#F4F6F8] ml-1">(1,234 ulasan)</span>
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h5 className="font-semibold text-[#FFFFFF] mb-4">Platform</h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/register?role=user" className="hover:text-[#F37125] transition-colors">
                    Untuk Pembeli
                  </a>
                </li>
                <li>
                  <a href="/register?role=pangkalan" className="hover:text-[#F37125] transition-colors">
                    Untuk Pangkalan
                  </a>
                </li>
                <li>
                  <a href="/login" className="hover:text-[#F37125] transition-colors">
                    Login
                  </a>
                </li>
              </ul>
            </div>

            {/* Help Links */}
            <div>
              <h5 className="font-semibold text-[#FFFFFF] mb-4">Bantuan</h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-[#F37125] transition-colors">
                    Pusat Bantuan
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#F37125] transition-colors">
                    Kontak Support
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#F37125] transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-[#125F95] pt-6 md:pt-8 text-center">
            <p className="text-sm text-[#F4F6F8]">
              &copy; {new Date().getFullYear()} IGER. Platform Pengiriman Ikan Segar. Dibuat dengan ❤ di Indonesia.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}