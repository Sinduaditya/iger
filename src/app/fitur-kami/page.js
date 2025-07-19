'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ScanLine,
  MapPin,
  MessageCircle,
  Users,
  Star,
  Menu,
  X,
  Clock,
  Camera,
  Bot,
  UserPlus,
  CheckCircle,
  ArrowRight,
  Brain,
  Globe,
  Smartphone,
  Play,
  Award,
  Fish,
  Zap
} from 'lucide-react';

export default function FiturKamiPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const mainFeatures = [
    {
      id: "01",
      title: "AI Fish Freshness Scan",
      subtitle: "Deteksi Kesegaran Ikan dengan AI",
      description: "Teknologi computer vision canggih yang dapat menganalisis kesegaran ikan hanya dalam hitungan detik dengan akurasi tinggi.",
      icon: <ScanLine className="w-8 h-8" />,
      features: [
        "Akurasi deteksi 98% menggunakan AI",
        "Analisis mata, insang, dan tekstur kulit",
        "Hasil scan instan dengan skor kesegaran",
        "Rekomendasi cara penyimpanan"
      ],
      color: "from-[#F37125] to-[#F37125]/80"
    },
    {
      id: "02",
      title: "Trusted Market Map",
      subtitle: "Peta Pangkalan Ikan Terpercaya",
      description: "Temukan pangkalan ikan dan nelayan terdekat dengan rating tinggi melalui peta interaktif yang lengkap dengan ulasan real.",
      icon: <MapPin className="w-8 h-8" />,
      features: [
        "Peta interaktif dengan lokasi akurat",
        "Filter berdasarkan jenis ikan dan rating",
        "Info detail dengan jam operasional",
        "Sistem ulasan dari pengguna"
      ],
      color: "from-[#125F95] to-[#F37125]"
    },
    {
      id: "03",
      title: "AI Chat Assistant",
      subtitle: "Asisten Pintar 24/7",
      description: "Dapatkan bantuan instan tentang tips memilih ikan, cara penyimpanan, dan resep masakan dari AI assistant yang cerdas.",
      icon: <MessageCircle className="w-8 h-8" />,
      features: [
        "Chatbot berbasis AI yang responsif",
        "Tips memilih ikan segar berkualitas",
        "Rekomendasi resep sesuai jenis ikan",
        "Informasi nutrisi dan cara pengolahan"
      ],
      color: "from-[#F37125] to-[#125F95]"
    },
    {
      id: "04",
      title: "Community Hub",
      subtitle: "Komunitas & Riwayat Scan",
      description: "Platform komunitas untuk berbagi pengalaman, melihat riwayat scan, dan berinteraksi dengan sesama pengguna IGER.",
      icon: <Users className="w-8 h-8" />,
      features: [
        "Riwayat lengkap aktivitas scan",
        "Berbagi pengalaman dengan komunitas",
        "Forum diskusi tips perikanan",
        "Sistem poin dan achievement"
      ],
      color: "from-[#0D253C] to-[#F37125]"
    }
  ];

  const techHighlights = [
    {
      title: "AI Computer Vision",
      description: "Teknologi AI canggih untuk analisis kesegaran ikan",
      icon: <Brain className="w-6 h-6" />
    },
    {
      title: "Real-time Tracking",
      description: "Pantau perjalanan pesanan secara real-time",
      icon: <Globe className="w-6 h-6" />
    },
    {
      title: "Mobile Optimized",
      description: "Progressive Web App dengan performa optimal",
      icon: <Smartphone className="w-6 h-6" />
    },
    {
      title: "Fast Processing",
      description: "Pemrosesan data dan scan yang super cepat",
      icon: <Zap className="w-6 h-6" />
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-slate-50">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200'
        : 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200'
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
              <Link href="/" className="text-sm font-medium transition-all duration-300 hover:text-[#F37125] relative group text-[#0D253C]">
                Beranda
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#F37125] transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/tentang-iger" className="text-sm font-medium transition-all duration-300 hover:text-[#F37125] relative group text-[#0D253C]">
                Tentang iGer
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#F37125] transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/fitur" className="text-sm font-medium transition-all duration-300 hover:text-[#F37125] relative group text-[#F37125]">
                Fitur Kami
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#F37125] transition-all duration-300"></span>
              </Link>
              <Link href="/kontak" className="text-sm font-medium transition-all duration-300 hover:text-[#F37125] relative group text-[#0D253C]">
                Hubungi Kami
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#F37125] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg transition-colors text-[#0D253C] hover:bg-gray-100"
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
              <Link href="/" className="text-[#0D253C] hover:text-[#F37125] transition-colors">
                Beranda
              </Link>
              <Link href="/tentang-iger" className="text-[#0D253C] hover:text-[#F37125] transition-colors">
                Tentang iGer
              </Link>
              <Link href="/fitur" className="text-[#F37125] transition-colors">
                Fitur Kami
              </Link>
              <Link href="/kontak" className="text-[#0D253C] hover:text-[#F37125] transition-colors">
                Hubungi Kami
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <section className="relative py-16 px-6 overflow-hidden bg-gradient-to-br from-[#0D253C] via-[#125F95] to-[#F37125]">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div className="space-y-8">
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 px-4 py-2 backdrop-blur-sm">
                  🚀 Teknologi Terdepan
                </Badge>
                
                <div className="space-y-6">
                  <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
                    Fitur Canggih untuk
                    <span className="block text-[#F37125] mt-2">
                      Ikan Segar Berkualitas
                    </span>
                  </h1>
                  
                  <p className="text-lg md:text-xl text-blue-100 leading-relaxed">
                    Rasakan pengalaman berbelanja ikan segar yang tak pernah ada sebelumnya dengan teknologi AI canggih dan peta interaktif yang terintegrasi.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="bg-[#F37125] hover:bg-[#F37125]/90 text-white px-8 py-3 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                    <Play className="w-5 h-5 mr-2" />
                    Lihat Demo
                  </Button>
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-3 text-lg backdrop-blur-sm">
                    Mulai Sekarang
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 pt-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#F37125] mb-1">50K+</div>
                    <div className="text-sm text-blue-200">Pengguna</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#F37125] mb-1">98%</div>
                    <div className="text-sm text-blue-200">Akurasi AI</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#F37125] mb-1">4.8★</div>
                    <div className="text-sm text-blue-200">Rating</div>
                  </div>
                </div>
              </div>

            
                {/* Hero Image */}
                <div className="relative">
                <div className="relative z-10">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                    <div className="aspect-square bg-gradient-to-br from-white/20 to-white/5 rounded-xl overflow-hidden relative">
                        <img 
                        src="/images/CTA1.png" 
                        alt="AI Fish Scanner"
                        className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-6">
                        </div>
                    </div>
                    </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#F37125]/30 rounded-full blur-xl"></div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-[#125F95]/30 rounded-full blur-xl"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Features Section */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#0D253C] mb-4">
                4 Fitur Utama IGER
              </h2>
              <p className="text-lg text-[#125F95] max-w-2xl mx-auto">
                Solusi lengkap untuk pengalaman berbelanja ikan segar yang modern dan terpercaya
              </p>
            </div>

            <div className="space-y-16">
              {mainFeatures.map((feature, index) => (
                <div className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                  {/* Content */}
                  <div className={`space-y-6 ${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                    <div className="space-y-4">
                      <h3 className="text-2xl md:text-3xl font-bold text-[#0D253C]">
                        {feature.title}
                      </h3>
                      <p className="text-lg text-[#F37125] font-semibold">
                        {feature.subtitle}
                      </p>
                      <p className="text-[#125F95] leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {feature.features.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-[#F37125] flex-shrink-0 mt-0.5" />
                          <span className="text-[#125F95]">{item}</span>
                        </div>
                      ))}
                    </div>

                    <Button className={`bg-gradient-to-r ${feature.color} text-white px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
                      Coba Fitur Ini
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>

                  {/* Feature Visual */}
                  <div className={`${index % 2 === 1 ? 'lg:col-start-1' : ''}`}>
                    <Card className="relative overflow-hidden group border-2 hover:border-[#F37125] transition-all duration-500 hover:shadow-2xl transform hover:-translate-y-2">
                      <CardContent className="p-8">
                        <div className="text-center space-y-6">
                          <div className={`mx-auto w-20 h-20 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <div className="text-white">
                              {feature.icon}
                            </div>
                          </div>
                          
                          <div className="w-full h-40 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200 group-hover:border-[#F37125] transition-all duration-300">
                            <div className="text-center text-gray-400">
                              <Camera className="w-8 h-8 mx-auto mb-2" />
                              <p className="text-sm font-medium">Feature Preview</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tech Highlights */}
        <section className="py-20 px-6 bg-gradient-to-br from-[#F4F6F8] to-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-bold text-[#0D253C] mb-4">
                Teknologi Canggih
              </h3>
              <p className="text-lg text-[#125F95] max-w-2xl mx-auto">
                Dibangun dengan teknologi terdepan untuk performa optimal dan pengalaman terbaik
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {techHighlights.map((tech, index) => (
                <Card key={index} className="text-center hover:shadow-xl transition-all duration-500 group transform hover:-translate-y-2 border-2 hover:border-[#F37125]">
                  <CardHeader className="pb-4">
                    <div className="mx-auto bg-gradient-to-r from-[#125F95] to-[#F37125] rounded-full h-16 w-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <div className="text-white">
                        {tech.icon}
                      </div>
                    </div>
                    <CardTitle className="mt-4 text-lg text-[#0D253C]">{tech.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-[#125F95] text-sm leading-relaxed">
                    {tech.description}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        {/* <section className="py-20 px-6 bg-gradient-to-br from-[#0D253C] to-[#125F95] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#F37125]/20 to-transparent rounded-full transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-[#F37125]/20 to-transparent rounded-full transform -translate-x-36 translate-y-36"></div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="mb-8">
              <Award className="w-16 h-16 text-[#F37125] mx-auto mb-4" />
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Siap Merasakan Pengalaman Terbaik?
              </h3>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Bergabunglah dengan ribuan pengguna yang sudah merasakan kemudahan berbelanja ikan segar dengan teknologi IGER yang revolusioner.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-[#F37125] hover:bg-[#F37125]/90 text-white px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                Mulai Gratis Sekarang
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg backdrop-blur-sm">
                Lihat Demo Lengkap
                <Play className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </section> */}
      </main>

      {/* Footer */}
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