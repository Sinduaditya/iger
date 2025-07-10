'use client';

import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from 'lucide-react';

export default function ProfilePage() {
    // Ambil data user dan fungsi logout dari context
    const { user, logoutUser } = useAuth();

    // Jika data user belum ada, jangan render apa-apa
    if (!user) return null;

    // Ambil inisial nama untuk fallback avatar
    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    return (
        <div className="p-4">
            <Card className="w-full max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Profil Saya</CardTitle>
                    <CardDescription>Lihat dan kelola informasi akun Anda.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-20 w-20">
                            {/* AvatarImage bisa diisi URL jika Anda menyimpan URL foto profil di Appwrite */}
                            <AvatarImage src={null} />
                            <AvatarFallback className="text-2xl bg-blue-100 text-blue-800">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-xl font-semibold">{user.name}</h2>
                            <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                         <h3 className="font-semibold mb-2">Informasi Akun</h3>
                         <div className="text-sm space-y-1">
                            <p><strong>Terdaftar pada:</strong> {new Date(user.$createdAt).toLocaleDateString('id-ID')}</p>
                            <p><strong>Status Email:</strong> {user.emailVerification ? 'Terverifikasi' : 'Belum Terverifikasi'}</p>
                         </div>
                    </div>
                    
                    <Button onClick={logoutUser} variant="destructive" className="w-full">
                        <LogOut className="mr-2 h-4 w-4" />
                        Keluar (Logout)
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}