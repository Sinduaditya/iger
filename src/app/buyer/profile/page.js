'use client';

import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LogOut, Mail, Calendar, Shield, User } from 'lucide-react';

export default function ProfilePage() {
    const { user, logoutUser } = useAuth();

    if (!user) return null;

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Profil Saya</h1>
                    <p className="text-gray-600">Kelola informasi akun dan preferensi Anda</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <Card className="lg:col-span-2 shadow-lg border-0">
                        <CardHeader className="pb-6">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                <Avatar className="h-24 w-24 sm:h-28 sm:w-28 ring-4 ring-blue-100">
                                    <AvatarImage src={null} />
                                    <AvatarFallback className="text-2xl bg-orange-600 text-white">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="text-center sm:text-left flex-1">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{user.name}</h2>
                                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                                        <Mail className="h-4 w-4 text-gray-500" />
                                        <p className="text-gray-600">{user.email}</p>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-6">
                            <Separator />
                            
                            {/* Account Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Informasi Akun
                                </h3>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-700">Terdaftar pada</span>
                                        </div>
                                        <p className="text-gray-900 font-semibold">
                                            {new Date(user.$createdAt).toLocaleDateString('id-ID', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Shield className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-700">Status Akun</span>
                                        </div>
                                        <p className="text-gray-900 font-semibold">Aktif</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions Card */}
                    <div className="space-y-6">
                        <Card className="shadow-lg border-0">
                            <CardHeader>
                                <CardTitle className="text-lg">Aksi Cepat</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-white font-bold">
                                <Button 
                                    onClick={logoutUser} 
                                    variant="destructive" 
                                    className="w-full justify-start hover:bg-red-600"
                                >
                                    <LogOut className="mr-2 h-4 w-4 " />
                                    Keluar (Logout)
                                </Button>
                            </CardContent>
                        </Card>
                        
                        {/* Stats Card */}
                        <Card className="shadow-lg border-0">
                            <CardHeader>
                                <CardTitle className="text-lg">Statistik</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-600 mb-1">
                                        {Math.floor((new Date() - new Date(user.$createdAt)) / (1000 * 60 * 60 * 24))}
                                    </div>
                                    <p className="text-sm text-gray-600">Hari bergabung</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}