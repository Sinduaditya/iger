'use client';

import React, { createContext, useState, useEffect, useContext } from "react";
import { authService, appwriteHelpers } from "@/lib/appwrite";
import { useRouter, usePathname } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
        console.log(
          "👤 User authenticated:",
          currentUser?.email,
          currentUser?.role,
        );

        // Redirect logic hanya untuk halaman auth
        if (pathname === "/login" || pathname === "/register") {
          // 🔧 FIX: Gunakan currentUser.role, bukan user.role
          switch (currentUser.role) {
            case "pangkalan":
              router.push("/pangkalan/dashboard");
              break;
            case "user":
            default:
              router.push("/buyer/dashboard");
              break;
          }
        }
      } else {
        setUser(null);
        console.log("🔒 User not authenticated");

        // Redirect ke login jika di protected route
        const isProtectedRoute =
          pathname.startsWith("/buyer") ||
          pathname.startsWith("/pangkalan");

        if (isProtectedRoute) {
          router.push("/login");
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
      await authService.login(email, password);
      const user = await authService.getCurrentUser();
      setUser(user);

      console.log("✅ Login successful, redirecting based on role:", user.role);

      // Redirect berdasarkan role
      switch (user.role) {
        case "pangkalan":
          router.push("/pangkalan/dashboard");
          break;
        case "user":
        default:
          router.push("/buyer/dashboard");
          break;
      }

      return { success: true, user };
    } catch (error) {
      console.error("❌ Login error:", error);
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

      
      const user = await authService.register(userData);

      // Wait longer untuk memastikan profile tersimpan
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const fullUser = await authService.getCurrentUser();
      setUser(fullUser);

      console.log(
        "🎉 Registration successful:",
        fullUser?.email,
        fullUser?.role,
        "Profile created:",
        fullUser?.profile ? "Yes" : "No"
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
      await authService.logout();
      setUser(null);
      console.log("✅ Logout successful");
      router.push("/login");
    } catch (error) {
      console.error("❌ Logout failed:", error);
      setUser(null);
      router.push("/login");
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logoutUser,
    checkUserStatus,
    isPangkalan: () => authService.isPangkalan(user),
    isUser: () => authService.isUser(user),
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
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
