    'use client';

    import { useState, useEffect } from 'react';
    import { Card, CardContent } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { 
        Search, 
        Clock, 
        CheckCircle, 
        XCircle, 
        Truck,
        Package,
        Eye,
        Filter
    } from 'lucide-react';
    import { authService } from '@/lib/appwrite';
    import { buyerOrdersService } from '@/lib/buyer-services';
    import { useRouter } from 'next/navigation';

    export default function OrdersPage() {
        const [orders, setOrders] = useState([]);
        const [filteredOrders, setFilteredOrders] = useState([]);
        const [loading, setLoading] = useState(true);
        const [searchTerm, setSearchTerm] = useState('');
        const [statusFilter, setStatusFilter] = useState('all');
        const [user, setUser] = useState(null);
        const router = useRouter();

        const statusOptions = [
            { value: 'all', label: 'Semua Status' },
            { value: 'pending', label: 'Menunggu' },
            { value: 'confirmed', label: 'Dikonfirmasi' },
            { value: 'processing', label: 'Diproses' },
            { value: 'completed', label: 'Selesai' },
            { value: 'cancelled', label: 'Dibatalkan' }
        ];

        useEffect(() => {
            fetchUser();
        }, []);

        useEffect(() => {
            if (user) {
                fetchOrders();
            }
        }, [user]);

        useEffect(() => {
            filterOrders();
        }, [orders, searchTerm, statusFilter]);

        const fetchUser = async () => {
            try {
                const currentUser = await authService.getCurrentUser();
                setUser(currentUser);
                if (!currentUser) {
                    router.push('/auth/login');
                }
            } catch (error) {
                console.error('Error fetching user:', error);
                router.push('/auth/login');
            }
        };

        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await buyerOrdersService.getBuyerOrders(user.$id);
                setOrders(response.documents);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        const filterOrders = () => {
            let filtered = orders;

            // Filter by search term
            if (searchTerm) {
                filtered = filtered.filter(order => 
                    order.$id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    order.buyer_name.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            // Filter by status
            if (statusFilter !== 'all') {
                filtered = filtered.filter(order => order.status === statusFilter);
            }

            setFilteredOrders(filtered);
        };

        const getStatusIcon = (status) => {
            switch (status) {
                case 'pending':
                    return <Clock className="w-4 h-4 text-yellow-600" />;
                case 'confirmed':
                    return <CheckCircle className="w-4 h-4 text-blue-600" />;
                case 'processing':
                    return <Package className="w-4 h-4 text-purple-600" />;
                case 'completed':
                    return <CheckCircle className="w-4 h-4 text-green-600" />;
                case 'cancelled':
                    return <XCircle className="w-4 h-4 text-red-600" />;
                default:
                    return <Clock className="w-4 h-4 text-gray-600" />;
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
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${config.bg} ${config.text}`}>
                    {getStatusIcon(status)}
                    {config.label}
                </span>
            );
        };

        const formatDate = (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
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
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Pesanan Saya</h1>
                    <p className="text-gray-600">Lacak dan kelola pesanan ikan segar Anda</p>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Cari berdasarkan ID pesanan atau nama..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-600" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {statusOptions.slice(1).map((status) => {
                        const count = orders.filter(order => order.status === status.value).length;
                        return (
                            <Card key={status.value} className="cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => setStatusFilter(status.value)}>
                                <CardContent className="p-4 text-center">
                                    <div className="flex justify-center mb-2">
                                        {getStatusIcon(status.value)}
                                    </div>
                                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                                    <div className="text-sm text-gray-600">{status.label}</div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {orders.length === 0 ? 'Belum ada pesanan' : 'Tidak ada pesanan yang sesuai'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {orders.length === 0 
                                ? 'Mulai berbelanja untuk membuat pesanan pertama Anda' 
                                : 'Coba ubah kata kunci atau filter pencarian'
                            }
                        </p>
                        {orders.length === 0 && (
                            <Button 
                                onClick={() => router.push('/buyer/products')}
                                className="bg-orange-600 hover:bg-orange-700"
                            >
                                Mulai Belanja
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <Card key={order.$id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-lg">
                                                    Pesanan #{order.$id.slice(-8)}
                                                </h3>
                                                {getStatusBadge(order.status)}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                                <div>
                                                    <p><span className="font-medium">Tanggal:</span> {formatDate(order.order_date)}</p>
                                                    <p><span className="font-medium">Total Item:</span> {order.items?.length || 0}</p>
                                                </div>
                                                <div>
                                                    <p><span className="font-medium">Alamat:</span> {order.delivery_address}</p>
                                                    <p><span className="font-medium">Metode Bayar:</span> {order.payment_method || 'Belum dipilih'}</p>
                                                </div>
                                            </div>
                                            <div className="mt-3">
                                                <span className="text-2xl font-bold text-orange-600">
                                                    Rp {order.total_amount.toLocaleString()}
                                                </span>
                                            </div>
                                            {order.delivery_notes && (
                                                <div className="mt-2">
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium">Catatan:</span> {order.delivery_notes}
                                                    </p>
                                                </div>
                                            )}
                                            
                                            {/* Delivery Status for Processing Orders */}
                                            {order.status === 'processing' && (
                                                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                    <div className="flex items-center gap-2 text-blue-700">
                                                        <Truck className="w-4 h-4" />
                                                        <span className="font-medium">Driver sedang dalam perjalanan</span>
                                                    </div>
                                                    <p className="text-sm text-blue-600 mt-1">
                                                        Pesanan Anda sedang diantarkan ke alamat tujuan
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.push(`/buyer/orders/${order.$id}`)}
                                                className="flex items-center gap-2"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Detail
                                            </Button>
                                            {order.status === 'completed' && (
                                                <Button
                                                    size="sm"
                                                    className="bg-orange-600 hover:bg-orange-700"
                                                    onClick={() => router.push('/buyer/products')}
                                                >
                                                    Beli Lagi
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Items Preview */}
                                    {order.items && order.items.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Item pesanan:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {order.items.slice(0, 3).map((item, index) => (
                                                    <span 
                                                        key={index}
                                                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                                                    >
                                                        {item.product_name} ({item.quantity} {item.unit})
                                                    </span>
                                                ))}
                                                {order.items.length > 3 && (
                                                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                                                        +{order.items.length - 3} lainnya
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        );
    }