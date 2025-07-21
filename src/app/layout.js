import { Inter } from "next/font/google";
import "./app.css"; 
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner"; // Impor Toaster untuk notifikasi

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "iGer - AI Fish Delivery & Freshness Check",
  description: "Aplikasi pengiriman ikan dengan pengecekan kesegaran menggunakan AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}