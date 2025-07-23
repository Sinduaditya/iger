'use client';

import { useState, useEffect, useRef } from 'react';
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
    CreditCard,
    Star,
    RefreshCw
} from 'lucide-react';
import { authService } from '@/lib/appwrite';
import { buyerOrdersService } from '@/lib/buyer-services';
import { useRouter } from 'next/navigation';

export default function OrderDetailPage({ params }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [ratingComment, setRatingComment] = useState('');
    const [submittingRating, setSubmittingRating] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const router = useRouter();
    const intervalRef = useRef(null);
    const lastStatusRef = useRef(null);

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        if (user) {
            fetchOrder();
            setupRealTimePolling();
        }

        // Cleanup interval saat component unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [user, params.id]);

    // Setup real-time polling berdasarkan status
    const setupRealTimePolling = () => {
        // Clear existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Setup new interval
        intervalRef.current = setInterval(async () => {
            await fetchOrder(true); // Silent fetch (tanpa loading indicator)
        }, 5000); // Poll setiap 5 detik
    };

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

    const fetchOrder = async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            } else {
                setIsRefreshing(true);
            }

            const response = await buyerOrdersService.getOrder(params.id);
            
            // Verify that this order belongs to the current user
            if (response.buyer_id !== user.$id) {
                router.push('/buyer/orders');
                return;
            }

            // Check if status changed
            const statusChanged = lastStatusRef.current && lastStatusRef.current !== response.status;
            
            setOrder(response);
            setLastUpdated(new Date());
            lastStatusRef.current = response.status;

            // Show notification jika status berubah
            if (statusChanged && silent) {
                showStatusChangeNotification(response.status);
            }

            // Adjust polling frequency based on status
            adjustPollingFrequency(response.status);

        } catch (error) {
            console.error('Error fetching order:', error);
            if (!silent) {
                router.push('/buyer/orders');
            }
        } finally {
            if (!silent) {
                setLoading(false);
            } else {
                setIsRefreshing(false);
            }
        }
    };

    // Adjust polling frequency berdasarkan status
    const adjustPollingFrequency = (status) => {
        let interval = 10000; // Default 10 detik

        switch (status) {
            case 'pending':
                interval = 30000; // 30 detik untuk pending
                break;
            case 'confirmed':
                interval = 15000; // 15 detik untuk confirmed
                break;
            case 'processing':
                interval = 3000; // 3 detik untuk active delivery
                break;
            case 'delivered':
                interval = 5000; // 5 detik untuk delivered
                break;
            case 'completed':
            case 'cancelled':
                // Stop polling untuk final status
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
                return;
        }

        // Reset interval dengan frequency baru
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        intervalRef.current = setInterval(async () => {
            await fetchOrder(true);
        }, interval);
    };

    // Show notification untuk status change
    const showStatusChangeNotification = (newStatus) => {
        const statusMessages = {
            confirmed: 'Pesanan Anda telah dikonfirmasi!',
            processing: 'Driver sedang dalam perjalanan!',
            delivered: 'Pesanan telah dikirim!',
            completed: 'Pesanan selesai! Jangan lupa beri rating driver.',
            cancelled: 'Pesanan dibatalkan.'
        };

        const message = statusMessages[newStatus];
        if (message) {
            // Simple notification using alert (you can replace with toast library)
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('IGER - Update Pesanan', {
                    body: message,
                    icon: '/favicon.ico'
                });
            } else {
                alert(`🔔 ${message}`);
            }
        }
    };

    // Request notification permission
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const handleSubmitRating = async () => {
        if (!order.driver_id || !rating) return;

        try {
            setSubmittingRating(true);
            
            await buyerOrdersService.submitDriverRating(order.$id, order.driver_id, rating, ratingComment);
            
            setShowRatingModal(false);
            setRating(5);
            setRatingComment('');
            
            // Refresh order data immediately
            await fetchOrder();
            
            alert('Rating berhasil dikirim! Terima kasih atas feedback Anda.');
        } catch (error) {
            console.error('Error submitting rating:', error);
            alert('Gagal mengirim rating. Silakan coba lagi.');
        } finally {
            setSubmittingRating(false);
        }
    };

    // Manual refresh function
    const handleManualRefresh = async () => {
        await fetchOrder();
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-5 h-5 text-[#F37125]" />;
            case 'confirmed':
                return <CheckCircle className="w-5 h-5 text-[#125F95]" />;
            case 'processing':
                return <Truck className="w-5 h-5 text-[#F37125]" />;
            case 'delivered':
                return <Package className="w-5 h-5 text-[#125F95]" />;
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-[#125F95]" />;
            case 'cancelled':
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return <Clock className="w-5 h-5 text-[#125F95]" />;
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { bg: 'bg-[#F4F6F8]', text: 'text-[#F37125]', border: 'border-[#F37125]/20', label: 'Menunggu Konfirmasi' },
            confirmed: { bg: 'bg-[#F4F6F8]', text: 'text-[#125F95]', border: 'border-[#125F95]/20', label: 'Dikonfirmasi' },
            processing: { bg: 'bg-[#F4F6F8]', text: 'text-[#F37125]', border: 'border-[#F37125]/20', label: 'Sedang Dalam Perjalanan' },
            delivered: { bg: 'bg-[#F4F6F8]', text: 'text-[#125F95]', border: 'border-[#125F95]/20', label: 'Dikirim' },
            completed: { bg: 'bg-[#F4F6F8]', text: 'text-[#125F95]', border: 'border-[#125F95]/20', label: 'Selesai' },
            cancelled: { bg: 'bg-[#F4F6F8]', text: 'text-red-600', border: 'border-red-200', label: 'Dibatalkan' }
        };

        const config = statusConfig[status] || statusConfig.pending;
        return (
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border w-full sm:w-auto justify-center sm:justify-start ${config.bg} ${config.text} ${config.border}`}>
                {getStatusIcon(status)}
                <span className="truncate">{config.label}</span>
                {(status === 'processing' || status === 'delivered') && (
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse ml-1"></div>
                )}
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
            { key: 'processing', label: 'Dalam Perjalanan & Persiapan', icon: Truck },
            { key: 'delivered', label: 'Dikirim', icon: Package },
            { key: 'completed', label: 'Selesai', icon: CheckCircle }
        ];

        const statusOrder = ['pending', 'confirmed', 'processing', 'delivered', 'completed'];
        const currentIndex = statusOrder.indexOf(status);

        return timeline.map((step, index) => ({
            ...step,
            completed: index <= currentIndex,
            active: index === currentIndex
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#FFFFFF]">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-[#F37125] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[#125F95]">Memuat detail pesanan...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-12 bg-[#FFFFFF]">
                <h2 className="text-2xl font-bold text-[#0D253C] mb-4">Pesanan tidak ditemukan</h2>
                <Button 
                    onClick={() => router.push('/buyer/orders')}
                    className="bg-[#F37125] hover:bg-[#F37125]/90 text-[#FFFFFF]"
                >
                    Kembali ke Pesanan
                </Button>
            </div>
        );
    }

    const timeline = getOrderTimeline(order.status);

    return (
        <div className="space-y-6 bg-[#FFFFFF] min-h-screen p-4 md:p-6">
            {/* Header dengan Real-time Indicator - Responsive */}
            <div className="space-y-4">
                {/* Mobile Layout */}
                <div className="block md:hidden space-y-4">
                    {/* Back Button & Title */}
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="flex items-center gap-2 p-2 text-[#0D253C] hover:bg-[#F4F6F8]"
                            size="sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Kembali</span>
                        </Button>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg sm:text-xl font-bold text-[#0D253C] truncate">
                                Pesanan #{order.$id.slice(-8)}
                            </h1>
                        </div>
                    </div>
                    
                    {/* Status Badge - Full Width on Mobile */}
                    <div className="w-full">
                        {getStatusBadge(order.status)}
                    </div>
                    
                    {/* Date Info */}
                    <div className="space-y-1 text-sm text-[#125F95]">
                        <div>Dibuat pada {formatDate(order.order_date)}</div>
                        {lastUpdated && (
                            <div className="flex items-center gap-2">
                                <span>Update terakhir: {lastUpdated.toLocaleTimeString('id-ID')}</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleManualRefresh}
                                    disabled={isRefreshing}
                                    className="ml-auto px-2 py-1 h-7 border-[#125F95] text-[#125F95] hover:bg-[#125F95] hover:text-[#FFFFFF]"
                                >
                                    <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-[#0D253C] hover:bg-[#F4F6F8]"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Kembali
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-[#0D253C]">
                                Pesanan #{order.$id.slice(-8)}
                            </h1>
                            <div className="flex items-center gap-2 text-sm text-[#125F95]">
                                <span>Dibuat pada {formatDate(order.order_date)}</span>
                                {lastUpdated && (
                                    <>
                                        <span>•</span>
                                        <span>Update terakhir: {lastUpdated.toLocaleTimeString('id-ID')}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleManualRefresh}
                            disabled={isRefreshing}
                            className="flex items-center gap-2 border-[#125F95] text-[#125F95] hover:bg-[#125F95] hover:text-[#FFFFFF]"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        {getStatusBadge(order.status)}
                    </div>
                </div>
            </div>

            {/* Real-time Status Indicator - Responsive */}
            {['processing', 'delivered'].includes(order.status) && (
                <div className="bg-[#F4F6F8] border border-[#125F95]/20 rounded-lg p-3 md:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#F37125] rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-[#0D253C]">Live Tracking Aktif</span>
                        </div>
                        <div className="text-xs text-[#125F95] sm:ml-auto">
                            Status diperbarui setiap {order.status === 'processing' ? '3' : '5'} detik
                        </div>
                        {isRefreshing && (
                            <div className="flex items-center gap-1 text-xs text-[#125F95]">
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                <span>Memperbarui...</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Driver Info untuk status processing - Responsive */}
            {order.status === 'processing' && order.driver_id && (
                <Card className="border border-[#F4F6F8]">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-[#0D253C]">
                            <Truck className="w-5 h-5 text-[#125F95]" />
                            <span className="text-lg">Status Pengiriman</span>
                            <div className="w-2 h-2 bg-[#F37125] rounded-full animate-pulse ml-auto"></div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="p-3 md:p-4 bg-[#F4F6F8] rounded-lg border border-[#125F95]/20">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                {/* Driver Avatar */}
                                <div className="w-12 h-12 bg-[#125F95] rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="w-6 h-6 text-[#FFFFFF]" />
                                </div>
                                
                                {/* Driver Info */}
                                <div className="flex-1 space-y-2">
                                    <h4 className="font-semibold text-[#0D253C] flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span>Driver Sedang Dalam Perjalanan</span>
                                        <div className="w-2 h-2 bg-[#F37125] rounded-full animate-pulse"></div>
                                    </h4>
                                    <p className="text-sm text-[#125F95]">
                                        Driver akan segera tiba di lokasi Anda
                                    </p>
                                    
                                    {order.driver && (
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="font-medium text-[#0D253C]">Nama:</span> 
                                                    <span className="text-[#125F95] ml-1">{order.driver.name}</span>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-[#0D253C]">Kendaraan:</span> 
                                                    <span className="text-[#125F95] ml-1">
                                                        {order.driver.vehicle_type} ({order.driver.vehicle_number})
                                                    </span>
                                                </div>
                                                {order.driver.phone && (
                                                    <div className="sm:col-span-2">
                                                        <span className="font-medium text-[#0D253C]">Telepon:</span> 
                                                        <span className="text-[#125F95] ml-1">{order.driver.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Action Buttons - Responsive */}
                                            <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                                {order.driver.phone && (
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="text-xs border-[#125F95] text-[#125F95] hover:bg-[#125F95] hover:text-[#FFFFFF]"
                                                    >
                                                        <Phone className="w-3 h-3 mr-1" />
                                                        Hubungi Driver
                                                    </Button>
                                                )}
                                                {!order.driver_rated && (
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="text-xs border-[#F37125] text-[#F37125] hover:bg-[#F37125] hover:text-[#FFFFFF]"
                                                        onClick={() => setShowRatingModal(true)}
                                                    >
                                                        <Star className="w-3 h-3 mr-1" />
                                                        Beri Rating
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Status Indicator - Hidden on Mobile, Visible on Desktop */}
                                <div className="hidden sm:flex flex-col items-center text-center">
                                    <div className="w-4 h-4 bg-[#F37125] rounded-full animate-pulse mb-2"></div>
                                    <span className="text-xs text-[#125F95] font-medium">Dalam Perjalanan</span>
                                </div>
                            </div>
                            
                            {/* Mobile Status Indicator */}
                            <div className="flex sm:hidden items-center justify-center gap-2 mt-3 pt-3 border-t border-[#125F95]/20">
                                <div className="w-3 h-3 bg-[#F37125] rounded-full animate-pulse"></div>
                                <span className="text-sm text-[#125F95] font-medium">Dalam Perjalanan</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Timeline with Real-time Updates */}
                    <Card className="border border-[#F4F6F8]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-[#0D253C]">
                                <Truck className="w-5 h-5 text-[#125F95]" />
                                Status Pesanan
                                {['processing', 'delivered'].includes(order.status) && (
                                    <div className="w-2 h-2 bg-[#F37125] rounded-full animate-pulse ml-auto"></div>
                                )}
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
                                                    ? 'bg-[#F4F6F8] text-[#125F95]' 
                                                    : 'bg-gray-100 text-gray-400'
                                                }
                                                ${step.active ? 'ring-2 ring-[#F37125]' : ''}
                                            `}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className={`font-medium flex items-center gap-2 ${
                                                    step.completed ? 'text-[#0D253C]' : 'text-gray-500'
                                                }`}>
                                                    {step.label}
                                                    {step.active && ['processing', 'delivered'].includes(step.key) && (
                                                        <div className="w-2 h-2 bg-[#F37125] rounded-full animate-pulse"></div>
                                                    )}
                                                </p>
                                                {step.active && (
                                                    <p className="text-sm text-[#F37125]">
                                                        {step.key === 'processing' ? 'Driver sedang dalam perjalanan ke rumah Anda' : 'Saat ini'}
                                                    </p>
                                                )}
                                            </div>
                                            {index < timeline.length - 1 && (
                                                <div className={`
                                                    w-px h-8 ml-5 
                                                    ${step.completed ? 'bg-[#125F95]/30' : 'bg-gray-200'}
                                                `} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Items */}
                    <Card className="border border-[#F4F6F8]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-[#0D253C]">
                                <Package className="w-5 h-5 text-[#125F95]" />
                                Item Pesanan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {order.items && order.items.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between py-3 border-b border-[#F4F6F8] last:border-b-0">
                                        <div className="flex-1">
                                            <h4 className="font-medium text-[#0D253C]">{item.product_name}</h4>
                                            <p className="text-sm text-[#125F95]">
                                                {item.quantity} {item.unit} × Rp {item.unit_price.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-[#0D253C]">
                                                Rp {item.total_price.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-4 border-t border-[#F4F6F8]">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold text-[#0D253C]">Total</span>
                                        <span className="text-xl font-bold text-[#F37125]">
                                            Rp {order.total_amount.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right sidebar */}
                <div className="space-y-6">
                    {/* Driver Information with real-time status */}
                    {order.driver_id && order.driver && (
                        <Card className="border border-[#F4F6F8]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-[#0D253C]">
                                    <Truck className="w-5 h-5 text-[#125F95]" />
                                    Informasi Driver
                                    {order.status === 'processing' && (
                                        <div className="w-2 h-2 bg-[#F37125] rounded-full animate-pulse ml-auto"></div>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <User className="w-4 h-4 text-[#125F95]" />
                                    <span className="font-medium text-[#0D253C]">{order.driver.name}</span>
                                    {order.status === 'processing' && (
                                        <span className="text-xs bg-[#F4F6F8] text-[#F37125] px-2 py-1 rounded-full">
                                            Dalam perjalanan
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <Truck className="w-4 h-4 text-[#125F95]" />
                                    <span className="text-[#0D253C]">{order.driver.vehicle_type} ({order.driver.vehicle_number})</span>
                                </div>
                                {order.driver.phone && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-[#125F95]" />
                                        <span className="text-[#0D253C]">{order.driver.phone}</span>
                                    </div>
                                )}
                                {order.driver.rating && (
                                    <div className="flex items-center gap-3">
                                        <Star className="w-4 h-4 text-[#F37125]" />
                                        <span className="text-[#0D253C]">{order.driver.rating.toFixed(1)} ({order.driver.total_deliveries} pengiriman)</span>
                                    </div>
                                )}
                                
                                {/* Rating Button untuk completed orders */}
                                {order.status === 'completed' && order.payment_status === 'paid' && !order.driver_rated && (
                                    <div className="pt-3 border-t border-[#F4F6F8]">
                                        <Button 
                                            onClick={() => setShowRatingModal(true)}
                                            className="w-full bg-[#F37125] hover:bg-[#F37125]/90 text-[#FFFFFF]"
                                            size="sm"
                                        >
                                            <Star className="w-4 h-4 mr-2" />
                                            Beri Rating Driver
                                        </Button>
                                    </div>
                                )}

                                {/* Rating sudah diberikan */}
                                {order.driver_rated && (
                                    <div className="pt-3 border-t border-[#F4F6F8]">
                                        <div className="bg-[#F4F6F8] border border-[#125F95]/20 rounded-lg p-3">
                                            <div className="flex items-center gap-2">
                                                <Star className="w-4 h-4 text-[#F37125] fill-current" />
                                                <span className="text-sm font-medium text-[#125F95]">
                                                    Rating telah diberikan
                                                </span>
                                            </div>
                                            <p className="text-xs text-[#125F95] mt-1">
                                                Terima kasih atas feedback Anda!
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Customer Information */}
                    <Card className="border border-[#F4F6F8]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-[#0D253C]">
                                <User className="w-5 h-5 text-[#125F95]" />
                                Informasi Pembeli
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3">
                                <User className="w-4 h-4 text-[#125F95]" />
                                <span className="text-[#0D253C]">{order.buyer_name}</span>
                            </div>
                            {order.buyer_phone && (
                                <div className="flex items-center gap-3">
                                    <Phone className="w-4 h-4 text-[#125F95]" />
                                    <span className="text-[#0D253C]">{order.buyer_phone}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Delivery Information */}
                    <Card className="border border-[#F4F6F8]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-[#0D253C]">
                                <MapPin className="w-5 h-5 text-[#125F95]" />
                                Alamat Pengiriman
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-[#0D253C]">{order.delivery_address}</p>
                            {order.delivery_notes && (
                                <div>
                                    <p className="text-sm font-medium text-[#0D253C]">Catatan:</p>
                                    <p className="text-sm text-[#125F95]">{order.delivery_notes}</p>
                                </div>
                            )}
                            {order.delivery_date && (
                                <div className="flex items-center gap-3 pt-2 border-t border-[#F4F6F8]">
                                    <Calendar className="w-4 h-4 text-[#125F95]" />
                                    <div>
                                        <p className="text-sm font-medium text-[#0D253C]">Tanggal Pengiriman</p>
                                        <p className="text-sm text-[#125F95]">
                                            {formatDate(order.delivery_date)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment Information */}
                    <Card className="border border-[#F4F6F8]">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-[#0D253C]">
                                <CreditCard className="w-5 h-5 text-[#125F95]" />
                                Pembayaran
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-[#125F95]">Metode</span>
                                <span className="text-[#0D253C]">{order.payment_method || 'Cash on Delivery'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#125F95]">Status</span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    order.payment_status === 'paid' 
                                        ? 'bg-[#F4F6F8] text-[#125F95]' 
                                        : 'bg-[#F4F6F8] text-[#F37125]'
                                }`}>
                                    {order.payment_status === 'paid' ? 'Lunas' : 'Menunggu'}
                                </span>
                            </div>
                            <div className="pt-2 border-t border-[#F4F6F8]">
                                <div className="flex justify-between font-semibold">
                                    <span className="text-[#0D253C]">Total</span>
                                    <span className="text-[#F37125]">
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
                                className="w-full bg-[#F37125] hover:bg-[#F37125]/90 text-[#FFFFFF]"
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
                            className="w-full border-[#125F95] text-[#125F95] hover:bg-[#125F95] hover:text-[#FFFFFF]"
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