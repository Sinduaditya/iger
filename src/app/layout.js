import { Inter } from "next/font/google";
import "./app.css"; 
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "iGer - AI Fish Delivery & Freshness Check",
  description: "Aplikasi pengiriman ikan dengan pengecekan kesegaran menggunakan AI",
  icons: {
    icon: [
      { url: '/images/logo_iger.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/logo_iger.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/images/logo_iger.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: ['/images/logo_iger.png'],
  },
  // Hapus themeColor dan viewport dari sini!
};

// Tambahkan export viewport dan themeColor di bawah metadata
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const themeColor = "#ea580c";

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/images/logo_iger.png" type="image/png" />
        <meta name="theme-color" content="#ea580c" />
        <meta name="msapplication-TileColor" content="#ea580c" />
        <meta name="msapplication-TileImage" content="/images/logo_iger.png" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}