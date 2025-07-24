'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
    LayoutDashboard, 
    Package, 
    ShoppingCart, 
    Truck, 
    BarChart3, 
    Settings, 
    LogOut,
    Fish,
    Menu,
    X,
    Bell,
    ChevronDown
} from 'lucide-react';
import { Button } from "@/components/ui/button";

const PangkalanLayout = ({ children }) => {
     const { user, loading, logoutUser } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        if (!loading && (!user || user.role !== 'pangkalan')) {
            // 🔧 FIX: Konsisten ke /login
            router.push('/login');
        }
    }, [user, loading, router]);

    // Close sidebar when route changes on mobile
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    if (loading || !user || user.role !== 'pangkalan') {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-[#125F95] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading Pangkalan Dashboard...</p>
                </div>
            </div>
        );
    }

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const isActiveRoute = (route) => {
        if (route === '/pangkalan/dashboard') {
            return pathname === '/pangkalan/dashboard';
        }
        return pathname.startsWith(route);
    };

    const menuItems = [
        { href: '/pangkalan/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/pangkalan/products', icon: Package, label: 'Kelola Produk' },
        { href: '/pangkalan/orders', icon: ShoppingCart, label: 'Pesanan' },
        { href: '/pangkalan/drivers', icon: Truck, label: 'Kelola Driver' },
        { href: '/pangkalan/analytics', icon: BarChart3, label: 'Analytics' },
    ];

    const getPageTitle = () => {
        if (pathname === '/pangkalan/dashboard') return 'Dashboard';
        if (pathname.includes('/products')) return 'Kelola Produk';
        if (pathname.includes('/orders')) return 'Pesanan';
        if (pathname.includes('/drivers')) return 'Kelola Driver';
        if (pathname.includes('/analytics')) return 'Analytics';
        return 'Dashboard';
    };

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
                    {/* User Menu */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="w-8 h-8 bg-[#125F95] rounded-full flex items-center justify-center">
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
                                        <p className="font-medium text-gray-800">{user?.name || 'Pangkalan Owner'}</p>
                                        <p className="text-sm text-gray-600">Pangkalan Owner</p>
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
                            <div className="w-8 h-8 bg-[#125F95] rounded-lg flex items-center justify-center">
                                <Fish className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">IGER Pangkalan</h2>
                                <p className="text-sm text-gray-600">Business Management</p>
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
                                    flex items-center space-x-3 p-3 rounded-lg transition-all duration-200
                                    ${active 
                                        ? 'bg-[#125F95] text-white border-r-2 border-[#0D253C]' 
                                        : 'text-gray-700 hover:bg-[#125F95]/10 hover:text-[#125F95]'
                                    }
                                `}
                            >
                                <Icon size={20} className={active ? 'text-white' : 'text-gray-500'} />
                                <span className={`font-medium ${active ? 'text-white' : ''}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="absolute bottom-4 left-4 right-4">
                    <div className="p-3 bg-gray-50 rounded-lg mb-3 border border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-[#125F95] rounded-full flex items-center justify-center border-2 border-[#0D253C]">
                                <span className="text-white font-medium">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'P'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 truncate">{user?.name || 'Pangkalan Owner'}</p>
                                <p className="text-sm text-gray-600 truncate">Pangkalan Owner</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="min-h-screen pt-16 pb-4 md:ml-64 transition-all duration-300">
                <div className="p-4 md:p-6 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default PangkalanLayout;