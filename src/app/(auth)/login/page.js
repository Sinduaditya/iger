'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { account } from '@/lib/appwrite';
import { useAuth } from '@/context/AuthContext';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Skema validasi form
const formSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid." }),
  password: z.string().min(8, { message: "Password minimal 8 karakter." }),
});

export default function LoginPage() {
  const router = useRouter();
  const { checkUserStatus } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      console.log('Attempting login with:', values.email);
      
      // Hapus session yang ada jika ada
      try {
        await account.deleteSession('current');
        console.log('Deleted existing session');
      } catch (error) {
        // Jika tidak ada session, akan error - ini normal
        console.log('No existing session to delete');
      }
      
      // Buat session baru
      const session = await account.createEmailPasswordSession(values.email, values.password);
      console.log('Login successful:', session);
      
      await checkUserStatus();
      toast.success("Login berhasil!");
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = "Email atau password salah.";
      
      // Handle specific error cases
      if (error.code === 401) {
        errorMessage = "Email atau password salah.";
      } else if (error.code === 429) {
        errorMessage = "Terlalu banyak percobaan. Coba lagi nanti.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error("Login gagal", { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-800">Selamat Datang!</CardTitle>
          <CardDescription>Masuk untuk melanjutkan ke iGer</CardDescription>
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
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Masuk..." : "Masuk"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="text-center text-sm">
          <p>Belum punya akun? <Link href="/register" className="text-blue-600 hover:underline">Daftar di sini</Link></p>
        </CardFooter>
      </Card>
    </div>
  );
}