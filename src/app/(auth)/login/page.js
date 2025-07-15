'use client';

import { useState } from 'react';
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
import { toast } from "sonner";
import { Fish } from 'lucide-react';

// Skema validasi form
const formSchema = z.object({
    email: z.string().email({ message: "Format email tidak valid." }),
    password: z.string().min(8, { message: "Password minimal 8 karakter." }),
});

export default function LoginPage() {
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "", password: "" },
    });

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

    const [showRoleModal, setShowRoleModal] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                        <Fish className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        Selamat Datang!
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        Masuk untuk melanjutkan ke IGER
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            <Button 
                                type="submit" 
                                className="w-full bg-blue-600 hover:bg-blue-700" 
                                disabled={isLoading}
                            >
                                {isLoading ? "Masuk..." : "Masuk"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>

                <CardFooter className="text-center text-sm">
                    <p className="text-gray-600">
                        Belum punya akun?{' '}
                        <button 
                            onClick={() => setShowRoleModal(true)}
                            className="text-blue-600 hover:underline font-medium"
                        >
                            Daftar di sini
                        </button>
                    </p>
                </CardFooter>
            </Card>

            {/* Role Selection Modal */}
            {showRoleModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-0 duration-200">
                    <Card className="w-full max-w-md shadow-xl border-0 animate-in zoom-in-95 duration-200">
                        <CardHeader className="text-center pb-4">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                                <Fish className="w-6 h-6 text-blue-600" />
                            </div>
                            <CardTitle className="text-xl">Pilih Jenis Akun</CardTitle>
                            <CardDescription className="text-gray-500">
                                Ingin mendaftar sebagai apa?
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 px-6">
                            <Link href="/register?role=pangkalan">
                                <Button 
                                    className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-medium"
                                    onClick={() => setShowRoleModal(false)}
                                >
                                    🏪 Pemilik Pangkalan
                                </Button>
                            </Link>
                            <Link href="/register?role=user">
                                <Button 
                                    variant="outline" 
                                    className="w-full h-12 text-base font-medium border-gray-200 hover:bg-gray-50"
                                    onClick={() => setShowRoleModal(false)}
                                >
                                    🐟 Pembeli Ikan
                                </Button>
                            </Link>
                        </CardContent>
                        <CardFooter className="pt-2 px-6">
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