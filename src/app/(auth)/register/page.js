'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Users, Store, Mail, Lock, Phone, MapPin, FileText, Clock, UserCheck } from 'lucide-react';

// Schema untuk User
const userSchema = z.object({
    name: z.string().min(3, "Nama harus lebih dari 2 karakter"),
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    phone: z.string().min(10, "Nomor telepon minimal 10 karakter"),
    address: z.string().min(10, "Alamat harus lebih dari 9 karakter"),
});

// Schema untuk Pangkalan
const pangkalanSchema = z.object({
    name: z.string().min(3, "Nama pangkalan harus lebih dari 2 karakter"),
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    phone: z.string().min(10, "Nomor telepon minimal 10 karakter"),
    address: z.string().min(10, "Alamat harus lebih dari 9 karakter"),
    businessLicense: z.string().min(5, "Nomor izin usaha harus diisi"),
    operatingHours: z.string().min(5, "Jam operasional harus diisi"),
    driverCount: z.coerce.number().min(1, "Minimal 1 driver").max(50, "Maksimal 50 driver"),
});

export default function RegisterPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { register } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    
    const role = searchParams.get('role') || 'user';

    // Redirect jika role tidak valid
    useEffect(() => {
        if (!['user', 'pangkalan'].includes(role)) {
            router.push('/register/role');
        }
    }, [role, router]);

    const isUser = role === 'user';
    const isPangkalan = role === 'pangkalan';

    const form = useForm({
        resolver: zodResolver(isUser ? userSchema : pangkalanSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            phone: "",
            address: "",
            ...(isPangkalan && {
                businessLicense: "",
                operatingHours: "",
                driverCount: 1,
            })
        },
    });

    const onSubmit = async (values) => {
        setIsLoading(true);
        try {
            const result = await register(values, role);
            
            if (result.success) {
                toast.success("Registrasi berhasil! Selamat datang!");
                // Redirect berdasarkan role
                switch (role) {
                    case 'pangkalan':
                        router.push('/pangkalan/dashboard');
                        break;
                    default:
                        router.push('/buyer/dashboard');
                }
            } else {
                // Format error message yang lebih user-friendly
                let errorMessage = result.error;
                if (result.error.includes('already exists')) {
                    errorMessage = 'Email atau nomor telepon sudah terdaftar. Silakan gunakan yang lain atau login.';
                }
                toast.error("Registrasi gagal", { description: errorMessage });
            }
        } catch (error) {
            let errorMessage = error.message;
            if (error.message.includes('already exists')) {
                errorMessage = 'Email atau nomor telepon sudah terdaftar. Silakan gunakan yang lain atau login.';
            }
            toast.error("Registrasi gagal", { description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };

    const getRoleInfo = () => {
        if (isUser) {
            return {
                icon: Users,
                title: "Daftar sebagai Pembeli",
                description: "Bergabung untuk membeli ikan segar berkualitas",
            };
        } else {
            return {
                icon: Store,
                title: "Daftar sebagai Pangkalan",
                description: "Bergabung untuk menjual ikan dan mengelola bisnis",
            };
        }
    };

    const roleInfo = getRoleInfo();
    const Icon = roleInfo.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                {/* Header Section */}
                <div className="text-center mb-6">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/login')}
                        className="absolute left-4 top-4 hover:bg-orange-100 text-orange-600"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali
                    </Button>
                    
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {roleInfo.title}
                    </h1>
                    <p className="text-gray-600 text-sm">
                        {roleInfo.description}
                    </p>
                </div>

                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                {/* Basic Information Section */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-orange-600 uppercase tracking-wide border-b border-orange-200 pb-2">
                                        Informasi Dasar
                                    </h3>
                                    
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2 text-gray-700">
                                                    <Users className="w-4 h-4 text-orange-500" />
                                                    {isUser ? "Nama Lengkap" : "Nama Pangkalan"}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        placeholder={isUser ? "Masukkan nama lengkap" : "Masukkan nama pangkalan"} 
                                                        className="border-gray-200 focus:border-orange-400 focus:ring-orange-200"
                                                        {...field} 
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2 text-gray-700">
                                                    <Mail className="w-4 h-4 text-orange-500" />
                                                    Email
                                                </FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="email"
                                                        placeholder="contoh@email.com" 
                                                        className="border-gray-200 focus:border-orange-400 focus:ring-orange-200"
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
                                                <FormLabel className="flex items-center gap-2 text-gray-700">
                                                    <Lock className="w-4 h-4 text-orange-500" />
                                                    Password
                                                </FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="password" 
                                                        placeholder="Minimal 8 karakter" 
                                                        className="border-gray-200 focus:border-orange-400 focus:ring-orange-200"
                                                        {...field} 
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Contact Information Section */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-orange-600 uppercase tracking-wide border-b border-orange-200 pb-2">
                                        Informasi Kontak
                                    </h3>
                                    
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2 text-gray-700">
                                                    <Phone className="w-4 h-4 text-orange-500" />
                                                    Nomor Telepon
                                                </FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        placeholder="081234567890" 
                                                        className="border-gray-200 focus:border-orange-400 focus:ring-orange-200"
                                                        {...field} 
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2 text-gray-700">
                                                    <MapPin className="w-4 h-4 text-orange-500" />
                                                    Alamat Lengkap
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea 
                                                        placeholder="Jl. Contoh No. 123, Kelurahan, Kecamatan, Kota, Provinsi"
                                                        className="min-h-[100px] border-gray-200 focus:border-orange-400 focus:ring-orange-200 resize-none"
                                                        {...field} 
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Business Information Section - Pangkalan Only */}
                                {isPangkalan && (
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-orange-600 uppercase tracking-wide border-b border-orange-200 pb-2">
                                            Informasi Bisnis
                                        </h3>
                                        
                                        <FormField
                                            control={form.control}
                                            name="businessLicense"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2 text-gray-700">
                                                        <FileText className="w-4 h-4 text-orange-500" />
                                                        Nomor Izin Usaha
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            placeholder="Masukkan nomor izin usaha"
                                                            className="border-gray-200 focus:border-orange-400 focus:ring-orange-200"
                                                            {...field} 
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="operatingHours"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2 text-gray-700">
                                                        <Clock className="w-4 h-4 text-orange-500" />
                                                        Jam Operasional
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            placeholder="08:00 - 17:00"
                                                            className="border-gray-200 focus:border-orange-400 focus:ring-orange-200"
                                                            {...field} 
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="driverCount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2 text-gray-700">
                                                        <UserCheck className="w-4 h-4 text-orange-500" />
                                                        Jumlah Driver
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            type="number"
                                                            min="1"
                                                            max="50"
                                                            placeholder="Masukkan jumlah driver"
                                                            className="border-gray-200 focus:border-orange-400 focus:ring-orange-200"
                                                            value={field.value || ''}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                field.onChange(value === '' ? '' : parseInt(value, 10));
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}

                                <Button 
                                    type="submit" 
                                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Mendaftar...
                                        </div>
                                    ) : (
                                        "Daftar Sekarang"
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>

                    <CardFooter className="text-center py-4 bg-gray-50 rounded-b-lg">
                        <p className="text-gray-600 text-sm w-full">
                            Sudah punya akun?{' '}
                            <Link href="/login" className="text-orange-600 hover:text-orange-700 font-semibold hover:underline transition-colors">
                                Login di sini
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}