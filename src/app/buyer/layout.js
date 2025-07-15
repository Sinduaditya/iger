'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { 
    Home, 
    Scan, 
    Map, 
    History, 
    User, 
    Menu, 
    X, 
    Bell,
    Settings,
    LogOut,
    ChevronDown
} from 'lucide-react';
import { ChatAssistant } from '@/components/shared/ChatAssistant';

const ProtectedLayout = ({ children }) => {
    // Ganti 'logout' menjadi 'logoutUser'
    const { user, loading, logoutUser } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // Close sidebar when route changes on mobile
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    if (loading || !user) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    // Update function name untuk menggunakan logoutUser
    const handleLogout = async () => {
        try {
            await logoutUser();
            // Router push sudah ada di dalam logoutUser function
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const isActiveRoute = (route) => {
        if (route === '/dashboard') {
            return pathname === '/dashboard';
        }
        return pathname.startsWith(route);
    };

    const menuItems = [
        { href: '/dashboard', icon: Home, label: 'Dashboard', mobileLabel: 'Home' },
        { href: '/dashboard/scan', icon: Scan, label: 'Scan QR', mobileLabel: 'Scan' },
        { href: '/dashboard/map', icon: Map, label: 'Peta Lokasi', mobileLabel: 'Peta' },
        { href: '/dashboard/history', icon: History, label: 'Riwayat', mobileLabel: 'Riwayat' },
        { href: '/dashboard/profile', icon: User, label: 'Profil', mobileLabel: 'Profil' },
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
                            {pathname === '/dashboard' ? 'Dashboard' : 
                             pathname.includes('/scan') ? 'Scan QR' :
                             pathname.includes('/map') ? 'Peta Lokasi' :
                             pathname.includes('/history') ? 'Riwayat' :
                             pathname.includes('/profile') ? 'Profil' :
                             pathname.includes('/settings') ? 'Pengaturan' : 'Dashboard'}
                        </h1>
                    </div>
                </div>
                
                <div className="flex items-center space-x-3">
                    {/* Notification */}
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                        <Bell size={20} className="text-gray-600" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                    </button>
                    
                    {/* User Menu */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
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
                                        <p className="font-medium text-gray-800">{user?.name || 'User'}</p>
                                        <p className="text-sm text-gray-600">{user?.email || 'user@example.com'}</p>
                                    </div>
                                    <Link 
                                        href="/dashboard/settings"
                                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <Settings size={16} className="mr-3" />
                                        Pengaturan
                                    </Link>
                                    <button 
                                        onClick={handleLogout}
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
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">I</span>
                            </div>
                            <h2 className="text-lg font-bold text-gray-800">IGER</h2>
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
                                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }
                                `}
                            >
                                <Icon size={20} className={active ? 'text-blue-700' : 'text-gray-500'} />
                                <span className={`font-medium ${active ? 'text-blue-700' : ''}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="absolute bottom-4 left-4 right-4">
                    <div className="p-3 bg-gray-50 rounded-lg mb-3">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 truncate">{user?.name || 'User'}</p>
                                <p className="text-sm text-gray-600 truncate">{user?.email || 'user@example.com'}</p>
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

export default ProtectedLayout;