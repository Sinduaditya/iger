'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ScanLine, Map, History } from 'lucide-react';

export default function DashboardPage() {
    // Ambil data pengguna dari context
    const { user } = useAuth();

    // Tampilkan loading atau null jika user belum ter-load untuk menghindari error
    if (!user) {
        return null;
    }

    return (
        <div className="p-4 sm:p-6 space-y-6">
            
            {/* Bagian Header Sambutan */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">
                    Selamat Datang, {user.name}!
                </h1>
                <p className="text-slate-500">
                    Siap untuk memastikan kualitas ikan terbaik hari ini?
                </p>
            </div>

            {/* Bagian Aksi Cepat (Quick Actions) */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-700">Mulai Sekarang</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Kartu untuk Scan Ikan */}
                    <Link href="/dashboard/scan">
                        <Card className="hover:border-blue-500 hover:bg-blue-50 transition-all">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <ScanLine className="h-8 w-8 text-blue-600" />
                                    <ArrowRight className="h-5 w-5 text-slate-400" />
                                </div>
                                <CardTitle className="pt-2">Scan Kesegaran</CardTitle>
                                <CardDescription>Gunakan AI untuk memeriksa kualitas ikan secara instan.</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>

                    {/* Kartu untuk Peta */}
                    <Link href="/dashboard/map">
                        <Card className="hover:border-green-500 hover:bg-green-50 transition-all">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <Map className="h-8 w-8 text-green-600" />
                                    <ArrowRight className="h-5 w-5 text-slate-400" />
                                </div>
                                <CardTitle className="pt-2">Peta Terpercaya</CardTitle>
                                <CardDescription>Temukan lokasi pasar dan nelayan dengan reputasi terbaik.</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                    
                    {/* Kartu untuk Riwayat */}
                    <Link href="/dashboard/history">
                        <Card className="hover:border-purple-500 hover:bg-purple-50 transition-all">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <History className="h-8 w-8 text-purple-600" />
                                    <ArrowRight className="h-5 w-5 text-slate-400" />
                                </div>
                                <CardTitle className="pt-2">Riwayat Scan</CardTitle>
                                <CardDescription>Lihat kembali semua hasil pemindaian yang pernah Anda lakukan.</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    );
}