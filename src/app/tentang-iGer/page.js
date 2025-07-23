'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Fish,
  Users,
  Target,
  Award,
  Heart,
  TrendingUp,
  CheckCircle,
  Star,
  Menu,
  X,
  MapPin,
  Calendar,
  UserCheck,
  Eye,
  Compass
} from 'lucide-react';

export default function TentangIgerPage() {
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

  const teamMembers = [
      {
        "name": "Sindu",
        "role": "Fullstack Developer",
        "experience": "Mahasiswa Universitas Dian Nuswantoro",
        "description": "Sebagai Project Lead dan Fullstack Developer, Sindu adalah arsitek utama di balik sistem iGer. Ia bertanggung jawab penuh atas infrastruktur backend menggunakan Appwrite, mulai dari membangun sistem otentikasi yang aman hingga merancang logika bisnis untuk fitur marketplace. Keahliannya memastikan seluruh platform berjalan secara handal, aman, dan terintegrasi dari hulu ke hilir.",
        "image": "/images/team1.jpg"
      },
      {
        "name": "Raina",
        "role": "Frontend Developer",
        "experience": "Mahasiswa Universitas Dian Nuswantoro",
        "description": "Raina adalah kekuatan kreatif di balik antarmuka iGer, menggabungkan perannya sebagai UI/UX Designer dan Frontend Developer. Ia menerjemahkan kebutuhan pengguna menjadi desain yang intuitif dan menarik di Figma, kemudian mewujudkannya menjadi aplikasi web yang responsif menggunakan Next.js dan Shadcn/ui. Dedikasinya memastikan iGer tidak hanya canggih, tetapi juga mudah dan menyenangkan untuk digunakan.",
        "image": "/images/team2.jpg"
      },
      {
        "name": "Jovan",
        "role": "Machine Learning Engineer",
        "experience": "Mahasiswa Universitas Dian Nuswantoro",
        "description": "Jovan adalah otak di balik fitur unggulan iGer sebagai Machine Learning Engineer. Ia bertanggung jawab atas seluruh siklus hidup model AI, mulai dari mengumpulkan dataset gambar, melakukan fine-tuning pada model Computer Vision (MobileNetV2), hingga mengoptimalkannya untuk dijalankan secara efisien di perangkat pengguna menggunakan TensorFlow.js. Karyanya adalah inti dari kemampuan iGer untuk menganalisis kesegaran ikan secara akurat dan cepat.",
        "image": "/images/team3.jpg"
      }
  ];

  const achievements = [
    {
      number: "4+",
      label: "Tahun Pengalaman",
      description: "Melayani industri perikanan"
    },
    {
      number: "500+",
      label: "Pangkalan Partner",
      description: "Tersebar di seluruh Indonesia"
    },
    {
      number: "50K+",
      label: "Pengguna Aktif",
      description: "Mempercayai platform kami"
    },
    {
      number: "98%",
      label: "Akurasi AI",
      description: "Deteksi kualitas ikan"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-slate-50">
      {/* Header - Same as HomePage */}
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
              <Link href="/tentang-iger" className="text-sm font-medium transition-all duration-300 hover:text-[#F37125] relative group text-[#F37125]">
                Tentang iGer
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#F37125] transition-all duration-300"></span>
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
              <Link href="/tentang-iger" className="text-[#F37125] transition-colors">
                Tentang iGer
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-grow pt-20">
        {/* Hero Section - Enhanced */}
        {/* Hero Section - Enhanced with Background Image */}
        <section className="relative py-24 px-6 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
               style={{
                 backgroundImage: `url('/images/hero3.png')`
               }}>
          </div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0D253C]/85 via-[#125F95]/75 to-[#0D253C]/85"></div>
          
          {/* Additional Gradient Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D253C]/60 via-transparent to-[#0D253C]/60"></div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#F37125]/20 to-transparent rounded-full transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#125F95]/20 to-transparent rounded-full transform -translate-x-24 translate-y-24"></div>
          
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 opacity-5" 
               style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
               }}>
          </div>
          
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center">
              
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight text-white drop-shadow-lg">
                Mengenal Lebih Dekat
                <span className="text-[#F37125] block mt-2 bg-gradient-to-r from-[#F37125] to-[#F37125]/80 bg-clip-text text-transparent drop-shadow-md">
                  iGer Platform
                </span>
              </h1>
              
              <p className="max-w-3xl mx-auto text-lg md:text-xl text-blue-100 mb-12 leading-relaxed drop-shadow-sm">
                Perjalanan kami dimulai dari misi sederhana: menghubungkan masyarakat Indonesia dengan ikan segar berkualitas tinggi melalui teknologi inovatif dan layanan terpercaya.
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12">
                {achievements.map((achievement, index) => (
                  <div key={index} className="text-center p-4 bg-white/15 backdrop-blur-sm rounded-xl border border-white/25 hover:bg-white/25 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <div className="text-3xl font-bold text-[#F37125] mb-1 drop-shadow-sm">{achievement.number}</div>
                    <div className="text-sm font-semibold text-white mb-1 drop-shadow-sm">{achievement.label}</div>
                    <div className="text-xs text-blue-200 drop-shadow-sm">{achievement.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Vision & Mission Section - SWITCHED POSITIONS */}
        <section className="py-20 px-6 bg-white relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#125F95]/5 to-transparent rounded-full transform -translate-x-48 translate-y-48"></div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#F37125]/5 to-transparent rounded-full transform translate-x-40 -translate-y-40"></div>
          
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#0D253C] mb-4">
                Visi & Misi
              </h2>
              <p className="text-lg text-[#125F95] max-w-2xl mx-auto">
                Fondasi yang mengarahkan setiap langkah inovasi dan pelayanan IGER
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Vision - NOW ON THE LEFT */}
              <Card className="relative overflow-hidden hover:shadow-2xl transition-all duration-500 group border-2 hover:border-[#F37125] transform hover:-translate-y-2">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#F37125]/20 to-transparent rounded-bl-full"></div>
                <CardHeader className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#F37125] to-[#F37125]/80 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-[#0D253C] mb-2">Visi</CardTitle>
                  <Badge className="bg-[#F37125]/10 text-[#F37125] border-[#F37125]/20 w-fit">
                    Masa Depan Perikanan Digital
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-[#125F95] leading-relaxed font-medium">
                    Menjadi platform pengiriman ikan segar terdepan di Indonesia yang menghubungkan seluruh rantai nilai perikanan dengan teknologi AI dan sistem logistik terintegrasi.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-[#125F95]">
                      <CheckCircle className="w-4 h-4 text-[#F37125] mr-3 flex-shrink-0" />
                      <span>Platform #1 pengiriman ikan segar Indonesia</span>
                    </div>
                    <div className="flex items-center text-sm text-[#125F95]">
                      <CheckCircle className="w-4 h-4 text-[#F37125] mr-3 flex-shrink-0" />
                      <span>Teknologi AI terdepan dalam industri perikanan</span>
                    </div>
                    <div className="flex items-center text-sm text-[#125F95]">
                      <CheckCircle className="w-4 h-4 text-[#F37125] mr-3 flex-shrink-0" />
                      <span>Ekosistem perikanan digital yang berkelanjutan</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mission - NOW ON THE RIGHT */}
              <Card className="relative overflow-hidden hover:shadow-2xl transition-all duration-500 group border-2 hover:border-[#125F95] transform hover:-translate-y-2">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#125F95]/20 to-transparent rounded-bl-full"></div>
                <CardHeader className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#125F95] to-[#0D253C] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-[#0D253C] mb-2">Misi</CardTitle>
                  <Badge className="bg-[#125F95]/10 text-[#125F95] border-[#125F95]/20 w-fit">
                    Aksi Nyata Hari Ini
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-[#125F95] leading-relaxed font-medium">
                    Menyediakan platform teknologi yang menghubungkan konsumen dengan sumber ikan segar terbaik, sambil memberdayakan nelayan dan pangkalan lokal melalui digitalisasi dan inovasi.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-[#125F95]">
                      <CheckCircle className="w-4 h-4 text-[#F37125] mr-3 flex-shrink-0" />
                      <span>Menjamin kesegaran dan kualitas ikan terbaik</span>
                    </div>
                    <div className="flex items-center text-sm text-[#125F95]">
                      <CheckCircle className="w-4 h-4 text-[#F37125] mr-3 flex-shrink-0" />
                      <span>Memberdayakan ekonomi nelayan lokal</span>
                    </div>
                    <div className="flex items-center text-sm text-[#125F95]">
                      <CheckCircle className="w-4 h-4 text-[#F37125] mr-3 flex-shrink-0" />
                      <span>Meningkatkan akses konsumen ke ikan segar</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Team Section - Enhanced */}
        <section className="py-20 px-6 bg-white relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-br from-[#F37125]/10 to-transparent rounded-full transform -translate-x-36 translate-y-36"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#125F95]/10 to-transparent rounded-full transform translate-x-32 -translate-y-32"></div>
          
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-bold text-[#0D253C] mb-4">
                Tim Ahli Kami
              </h3>
              <p className="text-lg text-[#125F95] max-w-2xl mx-auto">
                Dipimpin oleh para profesional berpengalaman dalam teknologi, perikanan, dan logistik
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <Card key={index} className="text-center hover:shadow-xl transition-all duration-500 group transform hover:-translate-y-2 border-2 hover:border-[#125F95]">
                  <CardHeader className="pb-4">
                    <div className="w-24 h-24 bg-gradient-to-r from-[#125F95] to-[#F37125] rounded-full mx-auto mb-4 overflow-hidden group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <UserCheck className="w-12 h-12 text-gray-400" />
                      </div>
                    </div>
                    <CardTitle className="text-xl text-[#0D253C] mb-1">{member.name}</CardTitle>
                    <p className="text-[#F37125] font-semibold mb-2">{member.role}</p>
                    <Badge className="bg-[#125F95]/10 text-[#125F95] border-[#125F95]/20 text-xs">
                      {member.experience}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-[#125F95] text-sm leading-relaxed">{member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section - Enhanced */}
        <section className="py-20 px-6 bg-gradient-to-br from-[#F4F6F8] to-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-br from-[#125F95]/5 to-transparent rounded-full transform -translate-x-40 -translate-y-40"></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-tl from-[#F37125]/5 to-transparent rounded-full transform translate-x-36 translate-y-36"></div>
          
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-bold text-[#0D253C] mb-4">
                Nilai-Nilai Kami
              </h3>
              <p className="text-lg text-[#125F95] max-w-2xl mx-auto">
                Prinsip-prinsip yang memandu setiap keputusan dan inovasi IGER
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center hover:shadow-xl transition-all duration-500 group transform hover:-translate-y-2 border-2 hover:border-[#125F95]">
                <CardHeader className="pb-4">
                  <div className="mx-auto bg-[#125F95] rounded-full h-20 w-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Heart className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="mt-4 text-lg text-[#0D253C]">Kepercayaan</CardTitle>
                </CardHeader>
                <CardContent className="text-[#125F95] text-sm leading-relaxed">
                  Membangun kepercayaan melalui transparansi, kualitas, dan layanan konsisten yang dapat diandalkan.
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-xl transition-all duration-500 group transform hover:-translate-y-2 border-2 hover:border-[#F37125]">
                <CardHeader className="pb-4">
                  <div className="mx-auto bg-[#F37125] rounded-full h-20 w-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <TrendingUp className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="mt-4 text-lg text-[#0D253C]">Inovasi</CardTitle>
                </CardHeader>
                <CardContent className="text-[#125F95] text-sm leading-relaxed">
                  Menggunakan teknologi terdepan untuk menciptakan solusi yang lebih baik dan berkelanjutan.
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-xl transition-all duration-500 group transform hover:-translate-y-2 border-2 hover:border-[#125F95]">
                <CardHeader className="pb-4">
                  <div className="mx-auto bg-[#125F95] rounded-full h-20 w-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="mt-4 text-lg text-[#0D253C]">Kemitraan</CardTitle>
                </CardHeader>
                <CardContent className="text-[#125F95] text-sm leading-relaxed">
                  Membangun hubungan yang saling menguntungkan dengan semua stakeholder dan mitra.
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-xl transition-all duration-500 group transform hover:-translate-y-2 border-2 hover:border-[#F37125]">
                <CardHeader className="pb-4">
                  <div className="mx-auto bg-[#F37125] rounded-full h-20 w-20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Award className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="mt-4 text-lg text-[#0D253C]">Kualitas</CardTitle>
                </CardHeader>
                <CardContent className="text-[#125F95] text-sm leading-relaxed">
                  Berkomitmen memberikan produk dan layanan berkualitas tinggi yang melampaui ekspektasi.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Same as HomePage */}
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