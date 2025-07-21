'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { 
    Fish, 
    Store, 
    ShoppingCart, 
    Users, 
    BarChart3, 
    Truck, 
    Star,
    ArrowRight,
    CheckCircle,
    User
} from 'lucide-react';

// Skema validasi form
const formSchema = z.object({
    email: z.string().email({ message: "Format email tidak valid." }),
    password: z.string().min(8, { message: "Password minimal 8 karakter." }),
});

export default function LoginPage() {
    const { login, user, loading } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "", password: "" },
    });

    // Theme configuration based on role
    const getThemeConfig = (role) => {
        if (role === 'pangkalan') {
            return {
                primary: 'bg-blue-600 hover:bg-blue-700',
                secondary: 'bg-blue-100 text-blue-700',
                accent: 'text-blue-600',
                border: 'border-blue-200',
                gradient: 'from-blue-50 to-indigo-100',
                icon: 'text-blue-600'
            };
        } else {
            return {
                primary: 'bg-orange-600 hover:bg-orange-700',
                secondary: 'bg-orange-100 text-orange-700',
                accent: 'text-orange-600',
                border: 'border-orange-200',
                gradient: 'from-orange-50 to-amber-100',
                icon: 'text-orange-600'
            };
        }
    };

    const theme = getThemeConfig(user?.role);

    const onSubmit = async (values) => {
        setIsLoading(true);
        try {
            const result = await login(values.email, values.password);
            
            if (result.success) {
                toast.success("Login berhasil!");
                // Redirect sudah dihandle di AuthContext berdasarkan role
            } else {
                toast.error("Login gagal", { description: result.error });
            }
        } catch (error) {
            toast.error("Login gagal", { description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToDashboard = () => {
        if (user?.role === 'pangkalan') {
            router.push('/pangkalan/dashboard');
        } else {
            router.push('/buyer/dashboard');
        }
    };

    // Features data
    const buyerFeatures = [
        { icon: Fish, title: "Ikan Segar", desc: "Berbagai jenis ikan segar dari pangkalan terpercaya" },
        { icon: ShoppingCart, title: "Belanja Mudah", desc: "Pesan ikan dengan mudah melalui aplikasi" },
        { icon: Truck, title: "Pengiriman Cepat", desc: "Ikan sampai di rumah dalam kondisi segar" },
        { icon: Star, title: "Kualitas Terjamin", desc: "Hanya ikan berkualitas terbaik untuk Anda" }
    ];

    const pangkalanFeatures = [
        { icon: Store, title: "Kelola Pangkalan", desc: "Manajemen pangkalan ikan yang mudah dan efisien" },
        { icon: BarChart3, title: "Analisis Penjualan", desc: "Laporan dan analisis bisnis yang komprehensif" },
        { icon: Users, title: "Kelola Pelanggan", desc: "Manajemen pelanggan dan pesanan terpusat" },
        { icon: Fish, title: "Stok Ikan", desc: "Pantau dan kelola stok ikan secara real-time" }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="grid lg:grid-cols-2 min-h-screen">
                {/* Left Panel - Info Section */}
                <div className={`hidden lg:flex flex-col justify-center px-12 py-8 bg-gradient-to-br ${user?.role ? theme.gradient : 'from-blue-50 to-indigo-100'}`}>
                    <div className="max-w-md">
                        {/* Logo & Brand */}
                        <div className="flex items-center mb-10">
                            <div className={`inline-flex items-center justify-center w-16 h-16 ${user?.role ? theme.primary : 'bg-blue-600'} rounded-2xl mr-4`}>
                                <Fish className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">IGER</h1>
                                <p className="text-gray-600">Pasar Ikan Digital</p>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-8">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                                {user?.role === 'pangkalan' ? 'Untuk Pemilik Pangkalan' : 
                                 user?.role === 'user' ? 'Untuk Pembeli Ikan' : 
                                 'Platform Terpercaya'}
                            </h2>

                            {(user?.role === 'pangkalan' ? pangkalanFeatures : buyerFeatures).map((feature, index) => (
                                <div key={index} className="flex items-start space-x-4">
                                    <div className={`flex-shrink-0 w-12 h-12 ${user?.role ? theme.secondary : 'bg-blue-100'} rounded-xl flex items-center justify-center`}>
                                        <feature.icon className={`w-6 h-6 ${user?.role ? theme.icon : 'text-blue-600'}`} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="mt-16 grid grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">50+</div>
                                <div className="text-sm text-gray-600 mt-1">Pangkalan</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">1000+</div>
                                <div className="text-sm text-gray-600 mt-1">Pembeli</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">5000+</div>
                                <div className="text-sm text-gray-600 mt-1">Pesanan</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Login Form */}
                <div className="flex flex-col justify-center px-6 py-12 lg:px-12">
                    <div className="w-full max-w-sm mx-auto space-y-6">
                        
                        {/* Mobile Logo */}
                        <div className="lg:hidden text-center mb-10">
                            <div className={`inline-flex items-center justify-center w-16 h-16 ${user?.role ? theme.primary : 'bg-blue-600'} rounded-2xl mb-4`}>
                                <Fish className="w-8 h-8 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">IGER</h1>
                            <p className="text-gray-600 mt-1">Pasar Ikan Digital</p>
                        </div>

                        {/* Active Session Alert */}
                        {user && (
                            <Alert className={`mb-6 ${theme.border} ${theme.secondary}`}>
                                <User className="h-4 w-4" />
                                <AlertDescription className="flex items-center justify-between">
                                    <div>
                                        <span className="font-medium">Sesi aktif: </span>
                                        <Badge variant="secondary" className="ml-1">
                                            {user.email}
                                        </Badge>
                                        {/* <div className="text-xs mt-1">
                                            Role: {user.role === 'pangkalan' ? 'Pemilik Pangkalan' : 'Pembeli'}
                                        </div> */}
                                    </div>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Back to Dashboard Button */}
                        {user && (
                            <Button
                                onClick={handleBackToDashboard}
                                className={`w-full mb-6 ${theme.primary}`}
                            >
                                <ArrowRight className="w-4 h-4 mr-2" />
                                Kembali ke Dashboard
                            </Button>
                        )}

                        {/* Login Form */}
                        <Card className="border-0 shadow-xl">
                            <CardHeader className="text-center pb-6">
                                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                                    {user ? 'Login dengan Akun Lain' : 'Selamat Datang!'}
                                </CardTitle>
                                <CardDescription className="text-gray-600">
                                    {user ? 'Masuk dengan akun yang berbeda' : 'Masuk untuk melanjutkan ke IGER'}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="px-6">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium">Email</FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            type="email"
                                                            placeholder="email@contoh.com" 
                                                            className="h-11 mt-2"
                                                            {...field} 
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium">Password</FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            type="password" 
                                                            placeholder="••••••••" 
                                                            className="h-11 mt-2"
                                                            {...field} 
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button 
                                            type="submit" 
                                            className={`w-full h-11 mt-6 ${user?.role ? theme.primary : 'bg-blue-600 hover:bg-blue-700'}`}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Masuk..." : "Masuk"}
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>

                            <CardFooter className="text-center text-sm pt-4 px-6">
                                <p className="text-gray-600 w-full">
                                    Belum punya akun?{' '}
                                    <button 
                                        onClick={() => setShowRoleModal(true)}
                                        className={`${user?.role ? theme.accent : 'text-blue-600'} hover:underline font-medium`}
                                    >
                                        Daftar di sini
                                    </button>
                                </p>
                            </CardFooter>
                        </Card>

                        {/* Mobile Features Preview */}
                        <div className="lg:hidden mt-10">
                            <div className="text-center mb-8">
                                <h3 className="font-semibold text-gray-900">Platform Terpercaya</h3>
                                <p className="text-sm text-gray-600 mt-1">Menghubungkan pangkalan dan pembeli</p>
                            </div>
                            <div className="grid grid-cols-3 gap-6 text-center">
                                <div>
                                    <div className="text-xl font-bold text-gray-900">50+</div>
                                    <div className="text-xs text-gray-600 mt-1">Pangkalan</div>
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-gray-900">1000+</div>
                                    <div className="text-xs text-gray-600 mt-1">Pembeli</div>
                                </div>
                                <div>
                                    <div className="text-xl font-bold text-gray-900">5000+</div>
                                    <div className="text-xs text-gray-600 mt-1">Pesanan</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Role Selection Modal */}
            {showRoleModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-0 duration-200">
                    <Card className="w-full max-w-md shadow-xl border-0 animate-in zoom-in-95 duration-200">
                        <CardHeader className="text-center pb-6">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-orange-500 rounded-full mb-4">
                                <Fish className="w-6 h-6 text-white" />
                            </div>
                            <CardTitle className="text-xl mb-2">Pilih Jenis Akun</CardTitle>
                            <CardDescription className="text-gray-500">
                                Ingin mendaftar sebagai apa?
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 px-6">
                            <Link href="/register?role=pangkalan">
                                <Button 
                                    className="w-full bg-blue-600 hover:bg-blue-700 h-16 text-base font-medium group"
                                    onClick={() => setShowRoleModal(false)}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center">
                                            <Store className="w-5 h-5 mr-3" />
                                            <div className="text-left">
                                                <div>Pemilik Pangkalan</div>
                                                <div className="text-xs text-blue-100 mt-1">Jual ikan online</div>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Button>
                            </Link>
                            <Link href="/register?role=user">
                                <Button 
                                    variant="outline" 
                                    className="w-full h-16 text-base font-medium border-2 hover:bg-orange-50 hover:border-orange-200 group"
                                    onClick={() => setShowRoleModal(false)}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center">
                                            <Fish className="w-5 h-5 mr-3 text-orange-600" />
                                            <div className="text-left">
                                                <div className="text-gray-900">Pembeli Ikan</div>
                                                <div className="text-xs text-gray-500 mt-1">Beli ikan segar</div>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-orange-600" />
                                    </div>
                                </Button>
                            </Link>
                        </CardContent>
                        <CardFooter className="pt-4 px-6">
                            <Button 
                                variant="ghost" 
                                className="w-full text-gray-500 hover:text-gray-700"
                                onClick={() => setShowRoleModal(false)}
                            >
                                Batal
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
}