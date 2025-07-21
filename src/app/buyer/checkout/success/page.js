'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { buyerOrdersService } from '@/lib/buyer-services';
import { CheckCircle, Package, Clock, MapPin, CreditCard, ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const orderId = searchParams.get('orders');

    useEffect(() => {
        const fetchOrderData = async () => {
            if (!orderId) {
                setError('Order ID tidak ditemukan');
                setLoading(false);
                return;
            }

            try {
                const order = await buyerOrdersService.getOrder(orderId);
                if (order) {
                    setOrderData(order);
                } else {
                    setError('Order tidak ditemukan');
                }
            } catch (error) {
                console.error('Error fetching order:', error);
                setError('Gagal mengambil data order');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderData();
    }, [orderId]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'processing': return 'bg-orange-100 text-orange-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'paid': return 'bg-green-100 text-green-800';
            case 'failed': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded mb-4"></div>
                        <div className="h-64 bg-gray-200 rounded mb-4"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-8">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-8">
                        <h1 className="text-2xl font-bold text-red-800 mb-4">Terjadi Kesalahan</h1>
                        <p className="text-red-600 mb-6">{error}</p>
                        <Button 
                            onClick={() => router.push('/buyer/dashboard')}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali ke Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!orderData) {
        return (
            <div className="container mx-auto py-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Order Tidak Ditemukan</h1>
                    <Button onClick={() => router.push('/buyer/dashboard')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <div className="max-w-4xl mx-auto">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Pesanan Berhasil Dibuat! 🎉
                    </h1>
                    <p className="text-gray-600">
                        Terima kasih! Pesanan Anda telah diterima dan sedang diproses.
                    </p>
                </div>

                {/* Order Info Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Package className="w-5 h-5 mr-2" />
                            Informasi Pesanan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500">Order ID</p>
                                        <p className="font-mono font-semibold">{orderData.$id}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Tanggal Pesanan</p>
                                        <p className="font-medium">{formatDate(orderData.order_date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total Pembayaran</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {formatCurrency(orderData.total_amount)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500">Status Pesanan</p>
                                        <Badge className={getStatusColor(orderData.status)}>
                                            <Clock className="w-3 h-3 mr-1" />
                                            {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Status Pembayaran</p>
                                        <Badge className={getPaymentStatusColor(orderData.payment_status)}>
                                            <CreditCard className="w-3 h-3 mr-1" />
                                            {orderData.payment_status.charAt(0).toUpperCase() + orderData.payment_status.slice(1)}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Metode Pembayaran</p>
                                        <p className="font-medium">{orderData.payment_method || 'COD (Cash on Delivery)'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Delivery Address */}
                {orderData.delivery_address && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <MapPin className="w-5 h-5 mr-2" />
                                Alamat Pengiriman
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="font-medium">{orderData.buyer_name}</p>
                                <p className="text-gray-600">{orderData.buyer_phone}</p>
                                <p className="text-gray-600 mt-2">{orderData.delivery_address}</p>
                                {orderData.delivery_notes && (
                                    <p className="text-sm text-gray-500 mt-2">
                                        <span className="font-medium">Catatan:</span> {orderData.delivery_notes}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Order Items */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Detail Pesanan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {orderData.items && orderData.items.length > 0 ? (
                                orderData.items.map((item, index) => (
                                    <div key={index}>
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h4 className="font-medium">{item.product_name}</h4>
                                                <p className="text-sm text-gray-500">
                                                    {item.quantity} {item.unit} × {formatCurrency(item.unit_price)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">
                                                    {formatCurrency(item.total_price)}
                                                </p>
                                            </div>
                                        </div>
                                        {index < orderData.items.length - 1 && <Separator className="mt-4" />}
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500">Tidak ada item dalam pesanan</p>
                            )}

                            <Separator />
                            
                            {/* Order Summary */}
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(orderData.total_amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Biaya Pengiriman</span>
                                    <span>{formatCurrency(orderData.delivery_fee || 0)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span className="text-green-600">
                                        {formatCurrency(orderData.total_amount + (orderData.delivery_fee || 0))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <Button
                        onClick={() => router.push(`/buyer/orders/${orderData.$id}`)}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Package className="w-4 h-4 mr-2" />
                        Lihat Detail Pesanan
                    </Button>
                    
                    <Button
                        onClick={() => window.print()}
                        variant="outline"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Cetak Invoice
                    </Button>
                    
                    <Button
                        onClick={() => router.push('/buyer/dashboard')}
                        variant="outline"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke Dashboard
                    </Button>
                </div>

                {/* Next Steps Info */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-3">Langkah Selanjutnya:</h3>
                    <ul className="space-y-2 text-blue-800">
                        <li className="flex items-start">
                            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            Pesanan Anda akan diproses dalam 1-2 Dua Jam kerja
                        </li>
                        <li className="flex items-start">
                            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            Pantau status pesanan di halaman "Pesanan"
                        </li>
                        {orderData.payment_status === 'pending' && (
                            <li className="flex items-start">
                                <span className="inline-block w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                <span className="text-yellow-800">Selesaikan pembayaran jika belum dibayar</span>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}