'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { Home, Scan, Map, History, User } from 'lucide-react';
import { ChatAssistant } from '@/components/shared/ChatAssistant';

// Komponen untuk melindungi route
const ProtectedLayout = ({ children }) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Jika loading selesai dan tidak ada user, tendang ke halaman login
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // Jika masih loading atau belum ada user, jangan render apa-apa
    if (loading || !user) {
        return <div className="flex items-center justify-center h-screen">Authenticating...</div>;
    }

    return (
        <div className="relative min-h-screen bg-slate-50">
            {/* Konten utama dengan padding bawah agar tidak tertutup nav */}
            <main className="pb-20">
                {children}
            </main>

            <ChatAssistant/>

            {/* Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex justify-around items-center">
                <Link href="/dashboard" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
                    <Home size={24} />
                    <span className="text-xs mt-1">Home</span>
                </Link>
                <Link href="/dashboard/scan" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
                    <Scan size={24} />
                    <span className="text-xs mt-1">Scan</span>
                </Link>
                <Link href="/dashboard/map" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
                    <Map size={24} />
                    <span className="text-xs mt-1">Peta</span>
                </Link>
                <Link href="/dashboard/history" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
                    <History size={24} />
                    <span className="text-xs mt-1">Riwayat</span>
                </Link>
                <Link href="/dashboard/profile" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
                    <User size={24} />
                    <span className="text-xs mt-1">Profil</span>
                </Link>
            </div>
        </div>
    );
};

export default ProtectedLayout;