'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
    Home,
    Package,
    ShoppingCart,
    Heart,
    ClipboardList,
    MapPin,
    History,
    User,
    Menu,
    X,
    LogOut,
    ChevronDown,
    ScanLine,
    Fish
} from 'lucide-react';
import { cartService } from '@/lib/buyer-services';
import { ChatAssistant } from '@/components/shared/ChatAssistant';

const BuyerLayout = ({ children }) => {
    const { user, loading, logoutUser } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [isRedirecting, setIsRedirecting] = useState(false);

    // 🔧 FIX: Perbaiki logic redirect untuk mencegah infinite loop
    useEffect(() => {
        if (loading) return; // Tunggu loading selesai

        if (!user) {
            if (!isRedirecting) {
                setIsRedirecting(true);
                console.log('🔄 Redirecting to login - no user');
                // 🔧 FIX: Konsisten ke /login
                router.push('/login');
            }
            return;
        }

        // 🔧 FIX: Terima role 'user' dan 'buyer'
        if (user.role && !['user', 'buyer'].includes(user.role)) {
            if (!isRedirecting) {
                setIsRedirecting(true);
                console.log('🔄 Redirecting to home - invalid role:', user.role);
                router.push('/');
            }
            return;
        }

        // Reset redirect state jika user valid
        if (isRedirecting) {
            setIsRedirecting(false);
        }

    }, [user, loading, router, isRedirecting]);


    useEffect(() => {
        if (user && !loading && !isRedirecting) {
            fetchCartCount();
        }
    }, [user, loading, isRedirecting]);

    // Close sidebar when route changes on mobile
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    const fetchCartCount = async () => {
        try {
            const summary = await cartService.getCartSummary(user.$id);
            setCartCount(summary.totalItems);
        } catch (error) {
            console.error('Error fetching cart count:', error);
            setCartCount(0);
        }
    };

    // 🔧 FIX: Tampilkan loading lebih lama untuk mencegah flash
    if (loading || isRedirecting) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // 🔧 FIX: Jangan render jika tidak ada user
    if (!user) {
        return null;
    }

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleLogout = async () => {
        try {
            setIsRedirecting(true);
            await logoutUser();
        } catch (error) {
            console.error('Logout error:', error);
            setIsRedirecting(false);
        }
    };

    const isActiveRoute = (route) => {
        if (route === '/buyer/dashboard') {
            return pathname === '/buyer/dashboard';
        }
        return pathname.startsWith(route);
    };

    const getPageTitle = () => {
        const routes = {
            '/buyer/dashboard': 'Dashboard',
            '/buyer/products': 'Produk',
            '/buyer/cart': 'Keranjang',
            '/buyer/orders': 'Pesanan',
            '/buyer/favorites': 'Favorit',
            '/buyer/addresses': 'Alamat',
            '/buyer/history': 'Riwayat',
            '/buyer/profile': 'Profil',
            '/buyer/scan': 'Scan QR'
        };

        for (const [route, title] of Object.entries(routes)) {
            if (pathname.startsWith(route)) return title;
        }
        return 'IGER Buyer';
    };

    const menuItems = [
        { href: '/buyer/dashboard', icon: Home, label: 'Dashboard' },
        { href: '/buyer/products', icon: Package, label: 'Produk' },
        {
            href: '/buyer/cart',
            icon: ShoppingCart,
            label: 'Keranjang'
        },
        { href: '/buyer/orders', icon: ClipboardList, label: 'Pesanan' },
        { href: '/buyer/favorites', icon: Heart, label: 'Favorit' },
        { href: '/buyer/addresses', icon: MapPin, label: 'Alamat' },
        { href: '/buyer/history', icon: History, label: 'Riwayat' },
        { href: '/buyer/scan', icon: ScanLine, label: 'Scan QR' },
        { href: '/buyer/profile', icon: User, label: 'Profil' },
    ];

    return (
        <div className="relative min-h-screen bg-gray-50">
            {/* Top Header */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-4 z-50 md:pl-68">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors md:hidden"
                    >
                        <Menu size={24} className="text-gray-600" />
                    </button>
                    <div className="hidden md:block">
                        <h1 className="text-xl font-semibold text-gray-800">
                            {getPageTitle()}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    {/* Cart Icon (Mobile) */}
                    <Link
                        href="/buyer/cart"
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                    >
                        <ShoppingCart size={20} className="text-gray-600" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white rounded-full text-xs flex items-center justify-center">
                                {cartCount > 9 ? '9+' : cartCount}
                            </span>
                        )}
                    </Link>


                    {/* User Menu */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'P'}
                                </span>
                            </div>
                            <ChevronDown size={16} className={`text-gray-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {/* User Dropdown */}
                        {showUserMenu && (
                            <>
                                <div 
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowUserMenu(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="font-medium text-gray-800">{user?.name || 'Buyer'}</p>
                                        <p className="text-sm text-gray-600">Pembeli</p>
                                    </div>
                                    <button 
                                        onClick={logoutUser}
                                        className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50"
                                    >
                                        <LogOut size={16} className="mr-3" />
                                        Keluar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-50
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:shadow-none md:border-r md:border-gray-200
            `}>
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                                <Fish className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">IGER</h2>
                                <p className="text-sm text-gray-600">Dashboard</p>
                            </div>
                        </div>
                        <button
                            onClick={toggleSidebar}
                            className="p-1 rounded hover:bg-gray-100 md:hidden"
                        >
                            <X size={20} className="text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActiveRoute(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    flex items-center justify-between p-3 rounded-lg transition-all duration-200 group
                                    ${active
                                        ? 'bg-orange-50 text-orange-700 border-r-2 border-orange-700'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }
                                `}
                            >
                                <div className="flex items-center space-x-3">
                                    <Icon size={20} className={active ? 'text-orange-700' : 'text-gray-500 group-hover:text-gray-700'} />
                                    <span className={`font-medium ${active ? 'text-orange-700' : ''}`}>
                                        {item.label}
                                    </span>
                                </div>
                                {item.badge && (
                                    <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                                        {item.badge > 9 ? '9+' : item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="absolute bottom-4 left-4 right-4">
                    <div className="p-3 bg-gray-50 rounded-lg mb-3">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'P'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 truncate">{user?.name || 'Buyer'}</p>
                                <p className="text-sm text-gray-600 truncate">{user?.email || 'buyer@example.com'}</p>
                                <p className="text-xs text-orange-600 font-medium">Pembeli</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="min-h-screen pt-16 pb-20 md:pb-4 md:ml-64 transition-all duration-300">
                <div className="p-4 md:p-6 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

            <ChatAssistant />
        </div>
    );
};

export default BuyerLayout;