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
                switch (role) {
                    case 'pangkalan':
                        router.push('/pangkalan/dashboard');
                        break;
                    default:
                        router.push('/buyer/dashboard');
                }
            } else {
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
                color: "bg-blue-600"
            };
        } else {
            return {
                icon: Store,
                title: "Daftar sebagai Pangkalan",
                description: "Bergabung untuk menjual ikan dan mengelola bisnis",
                color: "bg-orange-600"
            };
        }
    };

    const roleInfo = getRoleInfo();
    const Icon = roleInfo.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl mx-auto">
                <Card className="border-0 shadow-xl">
                    <CardHeader className="text-center pb-6">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/login')}
                            className="absolute left-4 top-4 hover:bg-gray-100 text-gray-600"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali
                        </Button>
                        <div className={`inline-flex items-center justify-center w-16 h-16 ${roleInfo.color} rounded-2xl mx-auto mb-4`}>
                            <Icon className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                            {roleInfo.title}
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                            {roleInfo.description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 py-8">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Kolom 1 */}
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2 text-gray-700">
                                                        <Users className="w-4 h-4 text-blue-600" />
                                                        {isUser ? "Nama Lengkap" : "Nama Pangkalan"}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder={isUser ? "Masukkan nama lengkap" : "Masukkan nama pangkalan"}
                                                            className="border-gray-200 focus:border-blue-400 focus:ring-blue-200"
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
                                                        <Mail className="w-4 h-4 text-blue-600" />
                                                        Email
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="email"
                                                            placeholder="contoh@email.com"
                                                            className="border-gray-200 focus:border-blue-400 focus:ring-blue-200"
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
                                                        <Lock className="w-4 h-4 text-blue-600" />
                                                        Password
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="password"
                                                            placeholder="Minimal 8 karakter"
                                                            className="border-gray-200 focus:border-blue-400 focus:ring-blue-200"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    {/* Kolom 2 */}
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2 text-gray-700">
                                                        <Phone className="w-4 h-4 text-blue-600" />
                                                        Nomor Telepon
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="081234567890"
                                                            className="border-gray-200 focus:border-blue-400 focus:ring-blue-200"
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
                                                        <MapPin className="w-4 h-4 text-blue-600" />
                                                        Alamat Lengkap
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Jl. Contoh No. 123, Kelurahan, Kecamatan, Kota, Provinsi"
                                                            className="min-h-[60px] border-gray-200 focus:border-blue-400 focus:ring-blue-200 resize-none"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {/* Field khusus pangkalan */}
                                        {isPangkalan && (
                                            <>
                                                <FormField
                                                    control={form.control}
                                                    name="businessLicense"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2 text-gray-700">
                                                                <FileText className="w-4 h-4 text-orange-600" />
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
                                                                <Clock className="w-4 h-4 text-orange-600" />
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
                                                                <UserCheck className="w-4 h-4 text-orange-600" />
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
                                            </>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className={`w-full mt-8 ${roleInfo.color} hover:brightness-90 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-200`}
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
                            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors">
                                Login di sini
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}