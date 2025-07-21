'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    Package, 
    ShoppingCart, 
    TrendingUp, 
    Heart,
    Clock,
    ArrowRight,
    Truck,
    Fish
} from 'lucide-react';
import { authService } from '@/lib/appwrite';
import { 
    buyerService, 
    cartService, 
    favoritesService, 
    buyerOrdersService
} from '@/lib/buyer-services';
import { useRouter } from 'next/navigation';

export default function BuyerDashboard() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalSpent: 0,
        cartItems: 0,
        favoriteItems: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [recentProducts, setRecentProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);

            if (currentUser) {
                await Promise.all([
                    fetchStats(currentUser.$id),
                    fetchRecentOrders(currentUser.$id),
                    fetchRecentProducts()
                ]);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async (userId) => {
        try {
            const [ordersResponse, cartSummary, favoritesResponse] = await Promise.all([
                buyerOrdersService.getBuyerOrders(userId, null, 100, 0),
                cartService.getCartSummary(userId),
                favoritesService.getFavorites(userId)
            ]);

            // Calculate total spent
            const totalSpent = ordersResponse.documents
                .filter(order => order.status === 'completed')
                .reduce((sum, order) => sum + order.total_amount, 0);

            setStats({
                totalOrders: ordersResponse.documents.length,
                totalSpent: totalSpent,
                cartItems: cartSummary.totalItems,
                favoriteItems: favoritesResponse.documents.length
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchRecentOrders = async (userId) => {
        try {
            const response = await buyerOrdersService.getBuyerOrders(userId, null, 5, 0);
            setRecentOrders(response.documents);
        } catch (error) {
            console.error('Error fetching recent orders:', error);
        }
    };

    const fetchRecentProducts = async () => {
        try {
            const response = await buyerService.getAllProducts({}, 6, 0);
            setRecentProducts(response.documents);
        } catch (error) {
            console.error('Error fetching recent products:', error);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Menunggu' },
            confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Dikonfirmasi' },
            processing: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Diproses' },
            completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Selesai' },
            cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Dibatalkan' }
        };

        const config = statusConfig[status] || statusConfig.pending;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-orange-600 rounded-lg p-6 text-white">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    Selamat datang, {user?.name || 'Pembeli'}! 
                </h1>
                <p className="text-orange-100">
                    Temukan ikan segar terbaik dari pangkalan terpercaya di sekitar Anda
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Pesanan</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
                        <p className="text-xs text-blue-600 flex items-center mt-1">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Total pesanan
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Belanja</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            Rp {stats.totalSpent.toLocaleString()}
                        </div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Total pembelian
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Keranjang</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats.cartItems}</div>
                        <p className="text-xs text-orange-600 flex items-center mt-1">
                            <Package className="w-3 h-3 mr-1" />
                            Item di keranjang
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Favorit</CardTitle>
                        <Heart className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats.favoriteItems}</div>
                        <p className="text-xs text-red-600 flex items-center mt-1">
                            <Heart className="w-3 h-3 mr-1" />
                            Produk favorit
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                    onClick={() => router.push('/buyer/products')}
                    className="h-20 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 flex-col space-y-2"
                >
                    <Package className="w-6 h-6" />
                    <span className="text-sm">Jelajahi Produk</span>
                </Button>
                <Button 
                    onClick={() => router.push('/buyer/cart')}
                    variant="outline"
                    className="h-20 flex-col space-y-2 border-orange-200 hover:bg-orange-50 relative"
                >
                    <ShoppingCart className="w-6 h-6 text-orange-600" />
                    <span className="text-sm text-orange-600">Keranjang</span>
                    {stats.cartItems > 0 && (
                        <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                            {stats.cartItems}
                        </span>
                    )}
                </Button>
                <Button 
                    onClick={() => router.push('/buyer/orders')}
                    variant="outline"
                    className="h-20 flex-col space-y-2 border-purple-200 hover:bg-purple-50"
                >
                    <Truck className="w-6 h-6 text-purple-600" />
                    <span className="text-sm text-purple-600">Pesanan</span>
                </Button>
                <Button 
                    onClick={() => router.push('/buyer/scan')}
                    variant="outline"
                    className="h-20 flex-col space-y-2 border-green-200 hover:bg-green-50"
                >
                    <Clock className="w-6 h-6 text-green-600" />
                    <span className="text-sm text-green-600">Scan QR</span>
                </Button>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Pesanan Terbaru</CardTitle>
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => router.push('/buyer/orders')}
                            className="text-orange-600 hover:text-orange-700"
                        >
                            Lihat Semua <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {recentOrders.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>Belum ada pesanan</p>
                                <Button 
                                    onClick={() => router.push('/buyer/products')}
                                    size="sm"
                                    className="mt-3 bg-orange-600 hover:bg-orange-700"
                                >
                                    Mulai Belanja
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentOrders.slice(0, 3).map((order) => (
                                    <div key={order.$id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">#{order.$id.slice(-8)}</p>
                                            <p className="text-xs text-gray-600">
                                                {formatDate(order.order_date)} • {order.items?.length || 0} item
                                            </p>
                                            <p className="text-sm font-semibold text-orange-600">
                                                Rp {order.total_amount.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            {getStatusBadge(order.status)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Products */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Produk Terbaru</CardTitle>
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => router.push('/buyer/products')}
                            className="text-orange-600 hover:text-orange-700"
                        >
                            Lihat Semua <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentProducts.slice(0, 3).map((product) => (
                                <div 
                                    key={product.$id} 
                                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                    onClick={() => router.push(`/buyer/products/${product.$id}`)}
                                >
                                    <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden">
                                        <img 
                                            src={product.image_url || 'https://via.placeholder.com/48x48/f0f9ff/0ea5e9?text=🐟'} 
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/48x48/e5e7eb/9ca3af?text=🐟';
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{product.name}</p>
                                        <p className="text-xs text-gray-600">{product.category}</p>
                                        <p className="text-sm font-semibold text-orange-600">
                                            Rp {product.price.toLocaleString()}/{product.unit}
                                        </p>
                                    </div>
                                    {product.freshness_level && (
                                        <div>
                                            <span className={`text-xs px-2 py-1 rounded ${
                                                product.freshness_level === 'Sangat Segar' ? 'bg-green-100 text-green-800' :
                                                product.freshness_level === 'Cukup Segar' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {product.freshness_level}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}