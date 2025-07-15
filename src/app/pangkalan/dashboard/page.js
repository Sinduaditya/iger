'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, TrendingUp, Clock } from 'lucide-react';

export default function PangkalanDashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Pangkalan</h1>
                <p className="text-gray-600">Kelola bisnis ikan segar Anda</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Produk Aktif</CardTitle>
                        <Package className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">24</div>
                        <p className="text-xs text-green-600">+3 produk baru</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pesanan Hari Ini</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-green-600">+5 dari kemarin</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pendapatan Bulan Ini</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Rp 8.5M</div>
                        <p className="text-xs text-green-600">+15% dari bulan lalu</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pesanan Pending</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-yellow-600">Perlu diproses</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Pesanan Terbaru</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                <div>
                                    <p className="font-medium">#ORD-001</p>
                                    <p className="text-sm text-gray-600">Ikan Kakap Merah - 2kg</p>
                                </div>
                                <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-xs">Pending</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div>
                                    <p className="font-medium">#ORD-002</p>
                                    <p className="text-sm text-gray-600">Ikan Tuna - 1.5kg</p>
                                </div>
                                <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs">Diproses</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div>
                                    <p className="font-medium">#ORD-003</p>
                                    <p className="text-sm text-gray-600">Ikan Salmon - 1kg</p>
                                </div>
                                <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs">Selesai</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Produk Terlaris</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Ikan Kakap Merah</span>
                                <span className="text-sm text-green-600">45 terjual</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Ikan Tuna Segar</span>
                                <span className="text-sm text-green-600">32 terjual</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Ikan Salmon</span>
                                <span className="text-sm text-green-600">28 terjual</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}