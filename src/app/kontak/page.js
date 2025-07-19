'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  ChevronDown,
  ChevronUp,
  Star,
  Users,
  Headphones,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  ArrowRight,
  CheckCircle,
  User,
  FileText
} from 'lucide-react';

export default function HubungiKamiPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const contactInfo = [
    {
      title: "Telepon",
      value: "+62 821 3456 7890",
      icon: <Phone className="w-6 h-6" />,
      description: "Senin - Jumat, 08:00 - 17:00 WIB",
      color: "from-[#125F95] to-[#F37125]"
    },
    {
      title: "Email",
      value: "support@iger.id",
      icon: <Mail className="w-6 h-6" />,
      description: "Respon dalam 24 jam",
      color: "from-[#F37125] to-[#125F95]"
    },
    {
      title: "Alamat",
      value: "Jakarta, Indonesia",
      icon: <MapPin className="w-6 h-6" />,
      description: "Kantor pusat IGER",
      color: "from-[#0D253C] to-[#F37125]"
    },
    {
      title: "Live Chat",
      value: "24/7 Support",
      icon: <MessageCircle className="w-6 h-6" />,
      description: "Chat langsung dengan tim",
      color: "from-[#F37125] to-[#0D253C]"
    }
  ];

  const faqData = [
    {
      question: "Bagaimana cara kerja AI Fish Scanner?",
      answer: "AI Fish Scanner menggunakan teknologi computer vision yang canggih untuk menganalisis kesegaran ikan melalui foto. Sistem kami menganalisis mata, insang, tekstur kulit, dan warna ikan untuk memberikan skor kesegaran dengan akurasi hingga 98%."
    },
    {
      question: "Apakah aplikasi IGER gratis?",
      answer: "Ya, aplikasi IGER gratis untuk diunduh dan digunakan. Fitur dasar seperti AI Scanner dan peta pangkalan tersedia gratis. Untuk fitur premium seperti analisis mendalam dan prioritas customer service, tersedia paket berlangganan."
    },
    {
      question: "Di kota mana saja IGER tersedia?",
      answer: "Saat ini IGER tersedia di Jakarta, Surabaya, Bandung, Medan, dan Makassar. Kami terus memperluas jangkauan ke kota-kota besar lainnya di Indonesia."
    },
    {
      question: "Bagaimana cara menjadi mitra pangkalan ikan?",
      answer: "Untuk menjadi mitra pangkalan, Anda bisa mendaftar melalui aplikasi atau website kami. Tim kami akan melakukan verifikasi dan membantu proses onboarding. Persyaratan utama adalah memiliki izin usaha yang sah dan komitmen untuk menyediakan ikan segar berkualitas."
    },
    {
      question: "Apakah ada jaminan uang kembali?",
      answer: "Ya, kami memberikan jaminan kepuasan 100%. Jika Anda tidak puas dengan kualitas ikan yang diterima, kami akan memberikan refund penuh atau penggantian produk sesuai kebijakan yang berlaku."
    },
    {
      question: "Bagaimana sistem pembayaran di IGER?",
      answer: "IGER mendukung berbagai metode pembayaran seperti transfer bank, e-wallet (GoPay, OVO, DANA), dan kartu kredit/debit. Semua transaksi dijamin aman dengan enkripsi tingkat bank."
    }
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted:', formData);
    alert('Pesan Anda berhasil dikirim! Tim kami akan segera menghubungi Anda.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

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
              <Link href="/fitur-kami" className="text-sm font-medium transition-all duration-300 hover:text-[#F37125] relative group text-[#0D253C]">
                Fitur Kami
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#F37125] transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/kontak" className="text-sm font-medium transition-all duration-300 hover:text-[#F37125] relative group text-[#F37125]">
                Hubungi Kami
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
              <Link href="/tentang-iger" className="text-[#0D253C] hover:text-[#F37125] transition-colors">
                Tentang iGer
              </Link>
              <Link href="/fitur-kami" className="text-[#0D253C] hover:text-[#F37125] transition-colors">
                Fitur Kami
              </Link>
              <Link href="/kontak" className="text-[#F37125] transition-colors">
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
            <div className="text-center">
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 px-4 py-2 backdrop-blur-sm mb-6">
                💬 Siap Membantu Anda
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
                Hubungi Tim
                <span className="block text-[#F37125] mt-2">
                  Support IGER
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-blue-100 leading-relaxed max-w-3xl mx-auto mb-8">
                Punya pertanyaan atau butuh bantuan? Tim customer service kami siap membantu Anda 24/7 untuk pengalaman terbaik menggunakan IGER.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#F37125] mb-1">24/7</div>
                  <div className="text-sm text-blue-200">Support</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#F37125] mb-1">1h</div>
                  <div className="text-sm text-blue-200">Respon</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#F37125] mb-1">99%</div>
                  <div className="text-sm text-blue-200">Kepuasan</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Info Section */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#0D253C] mb-4">
                Cara Menghubungi Kami
              </h2>
              <p className="text-lg text-[#125F95] max-w-2xl mx-auto">
                Pilih cara yang paling nyaman untuk Anda berkomunikasi dengan tim IGER
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {contactInfo.map((contact, index) => (
                <Card key={index} className="text-center hover:shadow-xl transition-all duration-500 group transform hover:-translate-y-2 border-2 hover:border-[#F37125]">
                  <CardHeader className="pb-4">
                    <div className={`mx-auto bg-gradient-to-r ${contact.color} rounded-full h-16 w-16 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <div className="text-white">
                        {contact.icon}
                      </div>
                    </div>
                    <CardTitle className="mt-4 text-lg text-[#0D253C]">{contact.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="font-semibold text-[#F37125]">{contact.value}</p>
                    <p className="text-sm text-[#125F95]">{contact.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Social Media */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-[#0D253C] mb-6">Ikuti Kami di Media Sosial</h3>
              <div className="flex justify-center gap-4">
                {[
                  { icon: <Instagram className="w-5 h-5" />, name: "@iger.official" },
                  { icon: <Facebook className="w-5 h-5" />, name: "IGER Indonesia" },
                  { icon: <Twitter className="w-5 h-5" />, name: "@iger_id" },
                  { icon: <Youtube className="w-5 h-5" />, name: "IGER Channel" }
                ].map((social, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gradient-to-r from-[#125F95] to-[#F37125] text-white px-4 py-2 rounded-full hover:shadow-lg transition-all duration-300 cursor-pointer group">
                    <div className="group-hover:scale-110 transition-transform duration-300">
                      {social.icon}
                    </div>
                    <span className="text-sm font-medium">{social.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-6 bg-gradient-to-br from-[#F4F6F8] to-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#0D253C] mb-4">
                Pertanyaan yang Sering Ditanyakan
              </h2>
              <p className="text-lg text-[#125F95] max-w-2xl mx-auto">
                Temukan jawaban untuk pertanyaan umum seputar layanan IGER
              </p>
            </div>

            <div className="space-y-4">
              {faqData.map((faq, index) => (
                <Card key={index} className="overflow-hidden border-2 hover:border-[#F37125] transition-all duration-300">
                  <CardHeader 
                    className="cursor-pointer hover:bg-[#F4F6F8] transition-colors duration-300"
                    onClick={() => toggleFAQ(index)}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-[#0D253C] text-left">{faq.question}</h3>
                      {openFAQ === index ? (
                        <ChevronUp className="w-5 h-5 text-[#F37125] flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[#125F95] flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  {openFAQ === index && (
                    <CardContent className="pt-0 animate-in slide-in-from-top-2 duration-300">
                      <p className="text-[#125F95] leading-relaxed">{faq.answer}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-[#0D253C] mb-4">
                Kirim Pesan kepada Kami
              </h2>
              <p className="text-lg text-[#125F95] max-w-2xl mx-auto">
                Punya pertanyaan khusus? Isi form di bawah ini dan tim kami akan segera menghubungi Anda
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Contact Form */}
              <Card className="border-2 hover:border-[#F37125] transition-all duration-300 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#0D253C] flex items-center gap-2">
                    <Send className="w-6 h-6 text-[#F37125]" />
                    Form Kontak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-[#0D253C] mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F37125] focus:border-[#F37125] transition-colors"
                        placeholder="Masukkan nama lengkap Anda"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#0D253C] mb-2">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F37125] focus:border-[#F37125] transition-colors"
                        placeholder="nama@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#0D253C] mb-2">
                        <FileText className="w-4 h-4 inline mr-2" />
                        Subjek
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F37125] focus:border-[#F37125] transition-colors"
                      >
                        <option value="">Pilih subjek pesan</option>
                        <option value="Pertanyaan Umum">Pertanyaan Umum</option>
                        <option value="Bantuan Teknis">Bantuan Teknis</option>
                        <option value="Kemitraan">Kemitraan</option>
                        <option value="Keluhan">Keluhan</option>
                        <option value="Saran">Saran</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#0D253C] mb-2">
                        <MessageCircle className="w-4 h-4 inline mr-2" />
                        Pesan
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F37125] focus:border-[#F37125] transition-colors resize-none"
                        placeholder="Tulis pesan Anda di sini..."
                      />
                    </div>

                    <Button 
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#125F95] to-[#F37125] text-white py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <Send className="w-5 h-5 mr-2" />
                      Kirim Pesan
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Additional Info */}
              <div className="space-y-8">
                <Card className="bg-gradient-to-br from-[#125F95] to-[#F37125] text-white border-0">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <Headphones className="w-8 h-8" />
                      <h3 className="text-xl font-bold">Tim Support Siap Membantu</h3>
                    </div>
                    <p className="text-blue-100 mb-6">
                      Tim customer service kami terdiri dari ahli yang berpengalaman dan siap membantu menyelesaikan berbagai pertanyaan Anda.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5" />
                        <span>Respon cepat dalam 1 jam</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5" />
                        <span>Support 24/7 untuk masalah urgent</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5" />
                        <span>Panduan lengkap dan solusi praktis</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-[#F37125]/20">
                  <CardContent className="p-6">
                    <h4 className="font-bold text-[#0D253C] mb-3">Jam Operasional</h4>
                    <div className="space-y-2 text-[#125F95]">
                      <div className="flex justify-between">
                        <span>Senin - Jumat</span>
                        <span className="font-medium">08:00 - 17:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sabtu</span>
                        <span className="font-medium">09:00 - 15:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Minggu</span>
                        <span className="font-medium">Tutup</span>
                      </div>
                      <hr className="my-3 border-[#F37125]/20" />
                      <div className="flex justify-between font-semibold text-[#F37125]">
                        <span>Emergency Support</span>
                        <span>24/7</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
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