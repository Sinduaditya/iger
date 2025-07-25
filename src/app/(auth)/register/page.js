'use client';

import { useState, useEffect, forwardRef } from 'react';
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
import { ArrowLeft, Users, Store, Mail, Lock, Phone, MapPin, FileText, Clock, UserCheck, Eye, EyeOff, Loader2 } from 'lucide-react';

// Schema tidak berubah
const userSchema = z.object({
    name: z.string().min(3, "Nama harus lebih dari 2 karakter"),
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    phone: z.string().min(10, "Nomor telepon minimal 10 karakter"),
    address: z.string().min(10, "Alamat harus lebih dari 9 karakter"),
});

const pangkalanSchema = z.object({
    name: z.string().min(3, "Nama pangkalan harus lebih dari 2 karakter"),
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    phone: z.string().min(10, "Nomor telepon minimal 10 karakter"),
    address: z.string().min(10, "Alamat harus lebih dari 9 karakter"),
    businessLicense: z.string().min(5, "Nomor izin usaha harus diisi"),
    operatingHours: z.string().min(5, "Jam operasional harus diisi"),
});

// UX Improvement: Komponen Input Password dengan tombol Show/Hide
const PasswordInput = forwardRef(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const Icon = showPassword ? EyeOff : Eye;
  return (
    <div className="relative">
      <Input
        type={showPassword ? 'text' : 'password'}
        className={className}
        ref={ref}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-1/2 right-2 -translate-y-1/2 h-7 w-7 text-gray-400 hover:text-gray-700"
        onClick={() => setShowPassword(prev => !prev)}
      >
        <Icon className="w-4 h-4" />
        <span className="sr-only">{showPassword ? 'Sembunyikan' : 'Tampilkan'} password</span>
      </Button>
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';


export default function RegisterPage() {
    // Hooks dan state tidak berubah
    const router = useRouter();
    const searchParams = useSearchParams();
    const { register } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const role = searchParams.get('role') || 'user';

    useEffect(() => {
        if (!['user', 'pangkalan'].includes(role)) {
            router.push('/login');
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
                operatingHours: ""
            })
        },
    });

    const onSubmit = async (values) => {
        setIsLoading(true);
        try {
            const result = await register({ ...values, role }, role);

            if (result.success) {
                toast.success("Registrasi berhasil! Mengalihkan ke dashboard...");
                router.push(isPangkalan ? '/pangkalan/dashboard' : '/buyer/dashboard');
            } else {
                let errorMessage = result.error || 'Terjadi kesalahan.';
                if (errorMessage.includes('already exists')) {
                    errorMessage = 'Email atau nomor telepon sudah terdaftar. Silakan login.';
                }
                toast.error("Registrasi gagal", { description: errorMessage });
            }
        } catch (error) {
            console.error("Registration failed with exception:", error);
            const errorCode = error.code || error?.response?.code;
            let errorMessage = error.message || "Terjadi kesalahan pada server. Silakan coba lagi.";
            if (errorCode === 409 || (error.message && error.message.includes('already exists'))) {
                errorMessage = "Email atau nomor telepon ini sudah terdaftar. Silakan login atau gunakan yang lain.";
            }
            toast.error("Registrasi Gagal", { description: errorMessage });
        } finally {
            setIsLoading(false);
        }
    };
    
    // Helper tidak berubah
    const getRoleInfo = () => {
        if (isUser) {
            return { icon: Users, title: "Daftar sebagai Pembeli", description: "Buat akun untuk mulai membeli ikan segar berkualitas.", color: "bg-orange-600", colorClass: "orange" };
        }
        return { icon: Store, title: "Daftar sebagai Pangkalan", description: "Isi detail untuk mendaftarkan pangkalan Anda.", color: "bg-[#125F95]", colorClass: "blue" };
    };

    const roleInfo = getRoleInfo();
    const Icon = roleInfo.icon;

    // Fungsi untuk merender input field dengan ikon di dalamnya
    const renderInput = (field, placeholder, IconComponent, type = "text") => (
        <div className="relative">
            <IconComponent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input type={type} placeholder={placeholder} {...field} className="pl-10" />
        </div>
    );
    
    const renderPasswordInput = (field, placeholder) => (
        <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <PasswordInput placeholder={placeholder} {...field} className="pl-10" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            {/* UX Improvement: max-w-lg untuk layout single column yang lebih ideal */}
            <Card className="w-full max-w-lg shadow-xl border-0">
                <CardHeader className="text-center p-8 relative">
                    <Button variant="ghost" size="sm" onClick={() => router.back()} className="absolute left-4 top-4 text-gray-600">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali
                    </Button>
                    <div className={`inline-flex items-center justify-center w-16 h-16 ${roleInfo.color} rounded-2xl mx-auto mb-4`}>
                        <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{roleInfo.title}</CardTitle>
                    <CardDescription>{roleInfo.description}</CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                    <Form {...form}>
                        {/* UX Improvement: Ganti ke form dengan layout single-column */}
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* --- Bagian Informasi Umum --- */}
                            <div className="space-y-4">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem><FormLabel>{isUser ? "Nama Lengkap" : "Nama Pangkalan"}</FormLabel><FormControl>{renderInput(field, isUser ? "Cth: Budi Santoso" : "Cth: Pangkalan Jaya Bahari", Users)}</FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem><FormLabel>Email</FormLabel><FormControl>{renderInput(field, "contoh@email.com", Mail, "email")}</FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="password" render={({ field }) => (
                                    <FormItem><FormLabel>Password</FormLabel><FormControl>{renderPasswordInput(field, "Minimal 8 karakter")}</FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="phone" render={({ field }) => (
                                    <FormItem><FormLabel>Nomor Telepon</FormLabel><FormControl>{renderInput(field, "081234567890", Phone)}</FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="address" render={({ field }) => (
                                    <FormItem><FormLabel>Alamat Lengkap</FormLabel><FormControl><Textarea placeholder="Jl. Contoh No. 123..." {...field} className="resize-none" /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>

                            {/* UX Improvement: Pengelompokan field khusus pangkalan */}
                            {isPangkalan && (
                                <div className="space-y-6 pt-6 border-t">
                                    <h3 className="text-lg font-semibold text-gray-800">Detail Pangkalan</h3>
                                    <div className="space-y-4">
                                        <FormField control={form.control} name="businessLicense" render={({ field }) => (
                                            <FormItem><FormLabel>Nomor Izin Usaha</FormLabel><FormControl>{renderInput(field, "Masukkan nomor izin", FileText)}</FormControl><FormMessage /></FormItem>
                                        )}/>
                                        <FormField control={form.control} name="operatingHours" render={({ field }) => (
                                            <FormItem><FormLabel>Jam Operasional</FormLabel><FormControl>{renderInput(field, "Cth: 08:00 - 17:00", Clock)}</FormControl><FormMessage /></FormItem>
                                        )}/>
                                    </div>
                                </div>
                            )}

                            <Button type="submit" className={`w-full text-lg font-semibold py-6 ${roleInfo.color} hover:brightness-110 transition-all duration-300`} disabled={isLoading}>
                                {isLoading ? (
                                    <span className="flex items-center"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Mendaftar...</span>
                                ) : ( "Daftar Sekarang" )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="py-4 bg-gray-50">
                    <p className="text-sm text-center w-full">
                        Sudah punya akun?{' '}
                        <Link href="/login" className="font-semibold text-blue-600 hover:underline">
                            Login di sini
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}