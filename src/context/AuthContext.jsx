'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { account } from '@/lib/appwrite';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkUserStatus();
    }, []);

    const checkUserStatus = async () => {
        try {
            const currentUser = await account.get();
            setUser(currentUser);
            
            // Jika user sudah login dan berada di halaman auth, redirect ke dashboard
            if (currentUser && (window.location.pathname === '/login' || window.location.pathname === '/register')) {
                router.push('/dashboard');
            }
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const logoutUser = async () => {
        try {
            await account.deleteSession('current');
            setUser(null);
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const value = {
        user,
        loading,
        checkUserStatus,
        logoutUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? <div className="flex items-center justify-center h-screen">Loading...</div> : children}
        </AuthContext.Provider>
    );
};

// Custom hook untuk mempermudah penggunaan context
export const useAuth = () => {
    return useContext(AuthContext);
};