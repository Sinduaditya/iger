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
import { ArrowLeft, Users, Store } from 'lucide-react';

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
                color: "blue"
            };
        } else {
            return {
                icon: Store,
                title: "Daftar sebagai Pangkalan",
                description: "Bergabung untuk menjual ikan dan mengelola bisnis",
                color: "orange"
            };
        }
    };

    const roleInfo = getRoleInfo();
    const Icon = roleInfo.icon;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/login')}
                            className="absolute left-4 top-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            roleInfo.color === 'blue' ? 'bg-blue-100' : 'bg-orange-100'
                        }`}>
                            <Icon className={`w-6 h-6 ${
                                roleInfo.color === 'blue' ? 'text-blue-600' : 'text-orange-600'
                            }`} />
                        </div>
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                        {roleInfo.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        {roleInfo.description}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {isUser ? "Nama Lengkap" : "Nama Pangkalan"}
                                        </FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder={isUser ? "John Doe" : "Pangkalan Ikan Segar"} 
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
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="email"
                                                placeholder="email@contoh.com" 
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
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="password" 
                                                placeholder="••••••••" 
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nomor Telepon</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="081234567890" 
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
                                        <FormLabel>Alamat Lengkap</FormLabel>
                                        <FormControl>
                                            <Textarea 
                                                placeholder="Jl. Contoh No. 123, Kota, Provinsi"
                                                className="min-h-[80px]"
                                                {...field} 
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Fields khusus untuk Pangkalan */}
                            {isPangkalan && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="businessLicense"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nomor Izin Usaha</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        placeholder="123456789"
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
                                                <FormLabel>Jam Operasional</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        placeholder="08:00 - 17:00"
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
                                                <FormLabel>Jumlah Driver</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="number"
                                                        min="1"
                                                        max="50"
                                                        placeholder="1"
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

                            <Button 
                                type="submit" 
                                className={`w-full ${
                                    roleInfo.color === 'blue' 
                                        ? 'bg-blue-600 hover:bg-blue-700' 
                                        : 'bg-orange-600 hover:bg-orange-700'
                                }`}
                                disabled={isLoading}
                            >
                                {isLoading ? "Mendaftar..." : "Daftar"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>

                <CardFooter className="text-center text-sm">
                    <p className="text-gray-600">
                        Sudah punya akun?{' '}
                        <Link href="/login" className="text-blue-600 hover:underline font-medium">
                            Login di sini
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}