'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, TrendingUp, ScanLine } from 'lucide-react';

export default function UserDashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Pembeli</h1>
                <p className="text-gray-600">Selamat datang di IGER - Platform Ikan Segar</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">24</div>
                        <p className="text-xs text-green-600">+3 bulan ini</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Scan Dilakukan</CardTitle>
                        <ScanLine className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">87</div>
                        <p className="text-xs text-green-600">+12 minggu ini</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Belanja</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Rp 2.4M</div>
                        <p className="text-xs text-green-600">+18% bulan ini</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pangkalan Favorit</CardTitle>
                        <Package className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">5</div>
                        <p className="text-xs text-blue-600">Tersimpan</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Pesanan Terbaru</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div>
                                    <p className="font-medium">#ORD-001</p>
                                    <p className="text-sm text-gray-600">Ikan Kakap Merah - 2kg</p>
                                </div>
                                <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs">Dikirim</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div>
                                    <p className="font-medium">#ORD-002</p>
                                    <p className="text-sm text-gray-600">Ikan Tuna - 1.5kg</p>
                                </div>
                                <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs">Selesai</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Scan Terbaru</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Ikan Kakap</span>
                                <span className="text-sm text-green-600">Sangat Segar</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Ikan Tuna</span>
                                <span className="text-sm text-green-600">Segar</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Ikan Salmon</span>
                                <span className="text-sm text-yellow-600">Cukup Segar</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}