'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    Package, 
    ShoppingCart, 
    Users, 
    Calendar,
    BarChart3,
    PieChart,
    Activity
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { analyticsService, pangkalanHelpers } from '@/lib/pangkalan-service';

export default function AnalyticsPage() {
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7d');

    useEffect(() => {
        if (user && user.role === 'pangkalan') {
            loadAnalytics();
        }
    }, [user, timeRange]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const data = await analyticsService.getAnalytics(user.$id, timeRange);
            setAnalytics(data);
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return pangkalanHelpers.formatCurrency(amount);
    };

    const getChangeIcon = (change) => {
        return change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
    };

    const getChangeColor = (change) => {
        return change >= 0 ? 'text-green-600' : 'text-red-600';
    };

    const getTimeRangeLabel = () => {
        switch (timeRange) {
            case '7d': return '7 hari terakhir';
            case '30d': return '30 hari terakhir';
            case '90d': return '90 hari terakhir';
            default: return '7 hari terakhir';
        }
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
                    <p>Memuat analytics...</p>
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Data tidak tersedia</h3>
                <p className="text-gray-600">Belum ada data untuk periode yang dipilih</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-gray-600">Analisis performa bisnis untuk {getTimeRangeLabel()}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setTimeRange('7d')}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                            timeRange === '7d' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        7 Hari
                    </button>
                    <button
                        onClick={() => setTimeRange('30d')}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                            timeRange === '30d' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        30 Hari
                    </button>
                    <button
                        onClick={() => setTimeRange('90d')}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                            timeRange === '90d' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        90 Hari
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Pendapatan</p>
                                <p className="text-2xl font-bold">{formatCurrency(analytics.revenue.current)}</p>
                                <div className={`flex items-center gap-1 text-sm ${getChangeColor(analytics.revenue.change)}`}>
                                    {getChangeIcon(analytics.revenue.change)}
                                    <span>{Math.abs(analytics.revenue.change).toFixed(1)}%</span>
                                    <span className="text-gray-500">vs periode sebelumnya</span>
                                </div>
                            </div>
                            <DollarSign className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Pesanan</p>
                                <p className="text-2xl font-bold">{analytics.orders.current}</p>
                                <div className={`flex items-center gap-1 text-sm ${getChangeColor(analytics.orders.change)}`}>
                                    {getChangeIcon(analytics.orders.change)}
                                    <span>{Math.abs(analytics.orders.change).toFixed(1)}%</span>
                                    <span className="text-gray-500">vs periode sebelumnya</span>
                                </div>
                            </div>
                            <ShoppingCart className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Produk Aktif</p>
                                <p className="text-2xl font-bold">{analytics.products.current}</p>
                                <div className={`flex items-center gap-1 text-sm ${getChangeColor(analytics.products.change)}`}>
                                    {getChangeIcon(analytics.products.change)}
                                    <span>{Math.abs(analytics.products.change).toFixed(1)}%</span>
                                    <span className="text-gray-500">vs periode sebelumnya</span>
                                </div>
                            </div>
                            <Package className="w-8 h-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Rata-rata Order</p>
                                <p className="text-2xl font-bold">
                                    {analytics.orders.current > 0 
                                        ? formatCurrency(analytics.revenue.current / analytics.orders.current)
                                        : formatCurrency(0)
                                    }
                                </p>
                                <p className="text-sm text-gray-500">per pesanan</p>
                            </div>
                            <BarChart3 className="w-8 h-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts and Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="w-5 h-5" />
                            Produk Terlaris
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {analytics.topProducts && analytics.topProducts.length > 0 ? (
                            <div className="space-y-4">
                                {analytics.topProducts.map((product, index) => (
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
                                            <div>
                                                <p className="text-sm font-medium">{product.name}</p>
                                                <p className="text-xs text-gray-600">{product.sales} item terjual</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-green-600">{formatCurrency(product.revenue)}</p>
                                            <div className="w-20 bg-gray-200 rounded-full h-1 mt-1">
                                                <div 
                                                    className="bg-orange-500 h-1 rounded-full"
                                                    style={{ 
                                                        width: `${Math.min((product.sales / Math.max(...analytics.topProducts.map(p => p.sales))) * 100, 100)}%` 
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500">Belum ada data penjualan produk</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Orders */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            Pesanan Terbaru
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {analytics.recentOrders && analytics.recentOrders.length > 0 ? (
                            <div className="space-y-4">
                                {analytics.recentOrders.slice(0, 5).map((order) => (
                                    <div key={order.$id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div>
                                            <p className="text-sm font-medium">#{order.$id.slice(-8)}</p>
                                            <p className="text-xs text-gray-600">{order.buyer_name}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(order.order_date).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{formatCurrency(order.total_amount)}</p>
                                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                                                {getStatusText(order.status)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <ShoppingCart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500">Belum ada pesanan</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Additional Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Performance Insight
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Tingkat Konversi</span>
                                <span className="text-sm font-medium text-green-600">
                                    {analytics.orders.current > 0 ? '100%' : '0%'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Pertumbuhan Revenue</span>
                                <span className={`text-sm font-medium ${getChangeColor(analytics.revenue.change)}`}>
                                    {analytics.revenue.change > 0 ? '+' : ''}{analytics.revenue.change.toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Pertumbuhan Order</span>
                                <span className={`text-sm font-medium ${getChangeColor(analytics.orders.change)}`}>
                                    {analytics.orders.change > 0 ? '+' : ''}{analytics.orders.change.toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Efisiensi Operasional</span>
                                <span className="text-sm font-medium text-blue-600">
                                    {analytics.orders.current > 0 ? 'Optimal' : 'Belum Ada Data'}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            Ringkasan Periode
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="text-center p-4 bg-orange-50 rounded-lg">
                                <p className="text-2xl font-bold text-orange-600">
                                    {analytics.orders.current}
                                </p>
                                <p className="text-sm text-gray-600">Total Pesanan</p>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <p className="text-xl font-bold text-green-600">
                                    {formatCurrency(analytics.revenue.current)}
                                </p>
                                <p className="text-sm text-gray-600">Total Pendapatan</p>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <p className="text-lg font-bold text-blue-600">
                                    {analytics.products.current}
                                </p>
                                <p className="text-sm text-gray-600">Produk Aktif</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Status Bisnis
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className={`w-3 h-3 rounded-full ${
                                    analytics.revenue.change >= 10 ? 'bg-green-500' :
                                    analytics.revenue.change >= 0 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}></div>
                                <div>
                                    <p className="text-sm font-medium">
                                        {analytics.revenue.change >= 10 ? 'Berkembang Pesat' :
                                         analytics.revenue.change >= 0 ? 'Stabil' : 'Perlu Perhatian'}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        Status performa bisnis
                                    </p>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    {analytics.revenue.change >= 10 ? 
                                        'Bisnis Anda berkembang dengan sangat baik! Pertahankan strategi yang sudah ada dan pertimbangkan ekspansi.' :
                                     analytics.revenue.change >= 0 ? 
                                        'Bisnis Anda dalam kondisi stabil. Coba tingkatkan strategi pemasaran untuk pertumbuhan lebih baik.' :
                                        'Performa bisnis menurun. Pertimbangkan evaluasi produk, harga, dan strategi pemasaran.'}
                                </p>
                            </div>

                            <div className="pt-2 border-t">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Periode Analisis</span>
                                    <span className="font-medium">{getTimeRangeLabel()}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Breakdown Pendapatan
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                            <p className="text-sm text-gray-600">Pendapatan Periode Ini</p>
                            <p className="text-xl font-bold text-green-600">{formatCurrency(analytics.revenue.current)}</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <p className="text-sm text-gray-600">Pendapatan Periode Lalu</p>
                            <p className="text-xl font-bold text-gray-600">{formatCurrency(analytics.revenue.previous)}</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <p className="text-sm text-gray-600">Selisih Pendapatan</p>
                            <p className={`text-xl font-bold ${getChangeColor(analytics.revenue.change)}`}>
                                {analytics.revenue.current - analytics.revenue.previous > 0 ? '+' : ''}
                                {formatCurrency(analytics.revenue.current - analytics.revenue.previous)}
                            </p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <p className="text-sm text-gray-600">Proyeksi Bulanan</p>
                            <p className="text-xl font-bold text-blue-600">
                                {formatCurrency(analytics.revenue.current * (30 / (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90)))}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}