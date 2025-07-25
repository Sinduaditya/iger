"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import { authService, appwriteHelpers } from "@/lib/appwrite";
import { useRouter, usePathname } from "next/navigation";
import {
  AUTH_ROUTES,
  redirectByRole,
  isProtectedRoute,
  isAuthRoute,
} from "@/lib/auth-utils";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      setLoading(true);

      const isAuth = await authService.isAuthenticated();

      if (isAuth) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);

        // 🔧 FIX: Gunakan utility functions
        if (isAuthRoute(pathname) && !isRedirecting) {
          setIsRedirecting(true);
          redirectByRole(router, currentUser);
          setTimeout(() => setIsRedirecting(false), 1000);
        }
      } else {
        setUser(null);

        // 🔧 FIX: Gunakan utility
        if (isProtectedRoute(pathname) && !isRedirecting) {
          setIsRedirecting(true);
          router.push(AUTH_ROUTES.LOGIN);
          setTimeout(() => setIsRedirecting(false), 1000);
        }
      }
    } catch (error) {
      console.error("❌ Auth check error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log("🚀 Starting login process for:", email);

      await authService.login(email, password);
      const user = await authService.getCurrentUser();
      setUser(user);

      console.log("✅ Login successful, user role:", user.role);

      // 🔧 FIX: Tambahkan delay sebelum redirect
      setIsRedirecting(true);

      // Redirect berdasarkan role
      switch (user.role) {
        case "pangkalan":
          console.log("🎯 Redirecting pangkalan user to dashboard");
          router.push("/pangkalan/dashboard");
          break;
        case "user":
        default:
          console.log("🎯 Redirecting user to buyer dashboard");
          router.push("/buyer/dashboard");
          break;
      }

      // Reset redirect state
      setTimeout(() => setIsRedirecting(false), 1500);

      return { success: true, user };
    } catch (error) {
      console.error("❌ Login error:", error);
      setIsRedirecting(false);
      return {
        success: false,
        error: appwriteHelpers.formatError(error),
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData, role) => {
  try {
      setLoading(true);
      console.log("🚀 Starting registration process:", userData.email, role);

    // PERBAIKI: Kirim role ke authService.register!
      const user = await authService.register(userData, role);

      // Wait longer untuk memastikan profile tersimpan
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const fullUser = await authService.getCurrentUser();
      setUser(fullUser);

      console.log(
        "🎉 Registration successful:",
        fullUser?.email,
        fullUser?.role,
        "Profile created:",
        fullUser?.profile ? "Yes" : "No",
      );

      return { success: true, user: fullUser };
    } catch (error) {
      console.error("❌ Register error:", error);
      return {
        success: false,
        error: appwriteHelpers.formatError(error),
      };
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    try {
      setIsRedirecting(true);
      await authService.logout();
      setUser(null);
      console.log("✅ Logout successful");
      // 🔧 FIX: Gunakan constant
      router.push(AUTH_ROUTES.LOGIN);
    } catch (error) {
      console.error("❌ Logout failed:", error);
      setUser(null);
      // 🔧 FIX: Gunakan constant
      router.push(AUTH_ROUTES.LOGIN);
    } finally {
      setIsRedirecting(false);
    }
  };

  const value = {
    user,
    loading: loading || isRedirecting,
    login,
    register,
    logoutUser,
    checkUserStatus,
    isPangkalan: () => authService.isPangkalan(user),
    isUser: () => authService.isUser(user),
  };

  return (
    <AuthContext.Provider value={value}>
      {loading || isRedirecting ? (
        <div className="flex h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
