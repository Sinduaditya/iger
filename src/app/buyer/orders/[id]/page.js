'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    ArrowLeft, 
    Clock, 
    CheckCircle, 
    XCircle, 
    Package,
    Truck,
    MapPin,
    Phone,
    User,
    Calendar,
    CreditCard
} from 'lucide-react';
import { authService } from '@/lib/appwrite';
import { buyerOrdersService } from '@/lib/buyer-services';
import { useRouter } from 'next/navigation';

export default function OrderDetailPage({ params }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        if (user) {
            fetchOrder();
        }
    }, [user, params.id]);

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

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await buyerOrdersService.getOrder(params.id);
            
            // Verify that this order belongs to the current user
            if (response.buyer_id !== user.$id) {
                router.push('/buyer/orders');
                return;
            }
            
            setOrder(response);
        } catch (error) {
            console.error('Error fetching order:', error);
            router.push('/buyer/orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-5 h-5 text-yellow-600" />;
            case 'confirmed':
                return <CheckCircle className="w-5 h-5 text-blue-600" />;
            case 'processing':
                return <Package className="w-5 h-5 text-purple-600" />;
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'cancelled':
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return <Clock className="w-5 h-5 text-gray-600" />;
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Menunggu Konfirmasi' },
            confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Dikonfirmasi' },
            processing: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Sedang Diproses' },
            completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Selesai' },
            cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Dibatalkan' }
        };

        const config = statusConfig[status] || statusConfig.pending;
        return (
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
                {getStatusIcon(status)}
                {config.label}
            </div>
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

    const getOrderTimeline = (status) => {
        const timeline = [
            { key: 'pending', label: 'Pesanan Dibuat', icon: Clock },
            { key: 'confirmed', label: 'Dikonfirmasi', icon: CheckCircle },
            { key: 'processing', label: 'Sedang Diproses', icon: Package },
            { key: 'completed', label: 'Selesai', icon: CheckCircle }
        ];

        const statusOrder = ['pending', 'confirmed', 'processing', 'completed'];
        const currentIndex = statusOrder.indexOf(status);

        return timeline.map((step, index) => ({
            ...step,
            completed: index <= currentIndex,
            active: index === currentIndex
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Pesanan tidak ditemukan</h2>
                <Button onClick={() => router.push('/buyer/orders')}>
                    Kembali ke Pesanan
                </Button>
            </div>
        );
    }

    const timeline = getOrderTimeline(order.status);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Pesanan #{order.$id.slice(-8)}
                        </h1>
                        <p className="text-gray-600">Dibuat pada {formatDate(order.order_date)}</p>
                    </div>
                </div>
                {getStatusBadge(order.status)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="w-5 h-5" />
                                Status Pesanan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {timeline.map((step, index) => {
                                    const Icon = step.icon;
                                    return (
                                        <div key={step.key} className="flex items-center gap-4">
                                            <div className={`
                                                w-10 h-10 rounded-full flex items-center justify-center
                                                ${step.completed 
                                                    ? 'bg-green-100 text-green-600' 
                                                    : 'bg-gray-100 text-gray-400'
                                                }
                                                ${step.active ? 'ring-2 ring-orange-500' : ''}
                                            `}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className={`font-medium ${
                                                    step.completed ? 'text-gray-900' : 'text-gray-500'
                                                }`}>
                                                    {step.label}
                                                </p>
                                                {step.active && (
                                                    <p className="text-sm text-orange-600">Saat ini</p>
                                                )}
                                            </div>
                                            {index < timeline.length - 1 && (
                                                <div className={`
                                                    w-px h-8 ml-5 
                                                    ${step.completed ? 'bg-green-300' : 'bg-gray-200'}
                                                `} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="w-5 h-5" />
                                Item Pesanan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {order.items && order.items.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                                            <p className="text-sm text-gray-600">
                                                {item.quantity} {item.unit} × Rp {item.unit_price.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">
                                                Rp {item.total_price.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold">Total</span>
                                        <span className="text-xl font-bold text-orange-600">
                                            Rp {order.total_amount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Customer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Informasi Pembeli
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3">
                                <User className="w-4 h-4 text-gray-500" />
                                <span>{order.buyer_name}</span>
                            </div>
                            {order.buyer_phone && (
                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-gray-500" />
                                    <span>{order.buyer_phone}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Delivery Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Alamat Pengiriman
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-gray-900">{order.delivery_address}</p>
                            {order.delivery_notes && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Catatan:</p>
                                    <p className="text-sm text-gray-600">{order.delivery_notes}</p>
                                </div>
                            )}
                            {order.delivery_date && (
                                <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium">Tanggal Pengiriman</p>
                                        <p className="text-sm text-gray-600">
                                            {formatDate(order.delivery_date)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Pembayaran
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Metode</span>
                                <span>{order.payment_method || 'Belum dipilih'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status</span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    order.payment_status === 'paid' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {order.payment_status === 'paid' ? 'Lunas' : 'Menunggu'}
                                </span>
                            </div>
                            <div className="pt-2 border-t border-gray-100">
                                <div className="flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span className="text-orange-600">
                                        Rp {order.total_amount.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="space-y-3">
                        {order.status === 'completed' && (
                            <Button 
                                className="w-full bg-orange-600 hover:bg-orange-700"
                                onClick={() => router.push('/buyer/products')}
                            >
                                Beli Lagi
                            </Button>
                        )}
                        {order.status === 'pending' && (
                            <Button 
                                variant="outline"
                                className="w-full text-red-600 border-red-200 hover:bg-red-50"
                            >
                                Batalkan Pesanan
                            </Button>
                        )}
                        <Button 
                            variant="outline"
                            className="w-full"
                            onClick={() => router.push('/buyer/orders')}
                        >
                            Kembali ke Pesanan
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}