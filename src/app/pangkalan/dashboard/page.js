'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, TrendingUp, Clock, DollarSign, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { productsService, ordersService, driversService, analyticsService } from '@/lib/pangkalan-service';

export default function PangkalanDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        products: {},
        orders: {},
        drivers: {},
        analytics: null
    });
    const [loading, setLoading] = useState(true);
    const [recentOrders, setRecentOrders] = useState([]);

    useEffect(() => {
        if (user && user.role === 'pangkalan') {
            loadDashboardData();
        }
    }, [user]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [productsStats, ordersStats, driversStats, analyticsData, ordersData] = await Promise.all([
                productsService.getProductStats(user.$id),
                ordersService.getOrderStats(user.$id),
                driversService.getDriverStats(user.$id),
                analyticsService.getAnalytics(user.$id, '30d'),
                ordersService.getOrders(user.$id, null, 5, 0)
            ]);

            setStats({
                products: productsStats,
                orders: ordersStats,
                drivers: driversStats,
                analytics: analyticsData
            });
            setRecentOrders(ordersData.documents);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'processing': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Menunggu';
            case 'confirmed': return 'Dikonfirmasi';
            case 'processing': return 'Diproses';
            case 'delivered': return 'Dikirim';
            case 'completed': return 'Selesai';
            case 'cancelled': return 'Dibatalkan';
            default: return status;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Memuat dashboard...</p>
                </div>
            </div>
        );
    }

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
                        <div className="text-2xl font-bold">{stats.products.available || 0}</div>
                        <p className="text-xs text-gray-600">
                            {stats.products.total || 0} total produk
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pesanan Pending</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.orders.pending || 0}</div>
                        <p className="text-xs text-yellow-600">Perlu diproses</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pendapatan Bulan Ini</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.analytics ? formatCurrency(stats.analytics.revenue.current) : 'Rp 0'}
                        </div>
                        <p className={`text-xs ${stats.analytics?.revenue.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stats.analytics?.revenue.change >= 0 ? '+' : ''}{stats.analytics?.revenue.change.toFixed(1) || 0}% dari bulan lalu
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Driver Tersedia</CardTitle>
                        <Users className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.drivers.available || 0}</div>
                        <p className="text-xs text-gray-600">
                            {stats.drivers.total || 0} total driver
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders and Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Pesanan Terbaru</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentOrders.length > 0 ? recentOrders.map((order) => (
                                <div key={order.$id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium">#{order.$id.slice(-8)}</p>
                                        <p className="text-sm text-gray-600">{order.buyer_name}</p>
                                        <p className="text-xs text-gray-500">
                                            {formatCurrency(order.total_amount)}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                                        {getStatusText(order.status)}
                                    </span>
                                </div>
                            )) : (
                                <div className="text-center py-4">
                                    <p className="text-gray-500">Belum ada pesanan</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Produk Terlaris</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.analytics?.topProducts && stats.analytics.topProducts.length > 0 ? 
                                stats.analytics.topProducts.map((product, index) => (
                                    <div key={product.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                                index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                index === 1 ? 'bg-gray-100 text-gray-800' :
                                                index === 2 ? 'bg-orange-100 text-orange-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {index + 1}
                                            </span>
                                            <span className="text-sm font-medium">{product.name}</span>
                                        </div>
                                        <span className="text-sm text-green-600">{product.sales} terjual</span>
                                    </div>
                                )) : (
                                <div className="text-center py-4">
                                    <p className="text-gray-500">Belum ada data penjualan</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Status Stok</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Stok Normal</span>
                                <span className="text-sm font-medium text-green-600">
                                    {(stats.products.available || 0) - (stats.products.lowStock || 0)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Stok Rendah</span>
                                <span className="text-sm font-medium text-yellow-600">
                                    {stats.products.lowStock || 0}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Tidak Tersedia</span>
                                <span className="text-sm font-medium text-red-600">
                                    {stats.products.unavailable || 0}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Status Pesanan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Pending</span>
                                <span className="text-sm font-medium text-yellow-600">
                                    {stats.orders.pending || 0}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Diproses</span>
                                <span className="text-sm font-medium text-blue-600">
                                    {stats.orders.processing || 0}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Selesai</span>
                                <span className="text-sm font-medium text-green-600">
                                    {stats.orders.completed || 0}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Performa Driver</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Total Pengiriman</span>
                                <span className="text-sm font-medium">
                                    {stats.drivers.totalDeliveries || 0}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Rating Rata-rata</span>
                                <span className="text-sm font-medium text-yellow-600">
                                    ⭐ {stats.drivers.avgRating || 0}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Driver Aktif</span>
                                <span className="text-sm font-medium text-green-600">
                                    {stats.drivers.available || 0}/{stats.drivers.total || 0}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}