'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Truck, Clock, CheckCircle, XCircle, X, MapPin, User, Phone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ordersService, driversService } from '@/lib/pangkalan-service';

export default function OrdersPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({});
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedDriverId, setSelectedDriverId] = useState('');

    useEffect(() => {
        if (user && user.role === 'pangkalan') {
            loadData();
        }
    }, [user, activeTab]);

    const loadData = async () => {
        try {
            setLoading(true);
            const status = activeTab === 'all' ? null : activeTab;
            const [ordersData, statsData, driversData] = await Promise.all([
                ordersService.getOrders(user.$id, status),
                ordersService.getOrderStats(user.$id),
                driversService.getDrivers(user.$id)
            ]);
            
            setOrders(ordersData.documents);
            setStats(statsData);
            setDrivers(driversData.documents);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus, driverId = null) => {
        try {
            const updateData = driverId ? { driver_id: driverId } : {};
            await ordersService.updateOrderStatus(orderId, newStatus, updateData);
            loadData();
            setShowAssignModal(false);
            setSelectedDriverId('');
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Gagal mengubah status pesanan');
        }
    };

    const handleShowDetail = (order) => {
        setSelectedOrder(order);
        setShowDetailModal(true);
    };

    const handleAssignDriver = (order) => {
        setSelectedOrder(order);
        setShowAssignModal(true);
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

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'processing': return <Truck className="w-4 h-4" />;
            case 'delivered': return <CheckCircle className="w-4 h-4" />;
            case 'completed': return <CheckCircle className="w-4 h-4" />;
            case 'cancelled': return <XCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
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
                    <div className="w-8 h-8 border-4 border-[#125F95] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Memuat pesanan...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Pesanan</h1>
                <p className="text-gray-600">Kelola pesanan dari pembeli</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <Card className={`cursor-pointer transition-colors ${activeTab === 'all' ? 'ring-2 ring-[#125F95]' : ''}`}
                      onClick={() => setActiveTab('all')}>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">{stats.total || 0}</p>
                        <p className="text-sm text-gray-600">Semua</p>
                    </CardContent>
                </Card>
                <Card className={`cursor-pointer transition-colors ${activeTab === 'pending' ? 'ring-2 ring-[#125F95]' : ''}`}
                      onClick={() => setActiveTab('pending')}>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</p>
                        <p className="text-sm text-gray-600">Pending</p>
                    </CardContent>
                </Card>
                <Card className={`cursor-pointer transition-colors ${activeTab === 'confirmed' ? 'ring-2 ring-[#125F95]' : ''}`}
                      onClick={() => setActiveTab('confirmed')}>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">{stats.confirmed || 0}</p>
                        <p className="text-sm text-gray-600">Dikonfirmasi</p>
                    </CardContent>
                </Card>
                <Card className={`cursor-pointer transition-colors ${activeTab === 'processing' ? 'ring-2 ring-[#125F95]' : ''}`}
                      onClick={() => setActiveTab('processing')}>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-purple-600">{stats.processing || 0}</p>
                        <p className="text-sm text-gray-600">Diproses</p>
                    </CardContent>
                </Card>
                <Card className={`cursor-pointer transition-colors ${activeTab === 'delivered' ? 'ring-2 ring-[#125F95]' : ''}`}
                      onClick={() => setActiveTab('delivered')}>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.delivered || 0}</p>
                        <p className="text-sm text-gray-600">Dikirim</p>
                    </CardContent>
                </Card>
                <Card className={`cursor-pointer transition-colors ${activeTab === 'completed' ? 'ring-2 ring-[#125F95]' : ''}`}
                      onClick={() => setActiveTab('completed')}>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.completed || 0}</p>
                        <p className="text-sm text-gray-600">Selesai</p>
                    </CardContent>
                </Card>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {orders.map((order) => (
                    <Card key={order.$id}>
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-semibold text-lg">#{order.$id.slice(-8)}</h3>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            {getStatusText(order.status)}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                                        <p className="text-gray-600 flex items-center gap-1">
                                            <User className="w-4 h-4" />
                                            <span className="font-medium">{order.buyer_name}</span>
                                        </p>
                                        {order.buyer_phone && (
                                            <p className="text-gray-600 flex items-center gap-1">
                                                <Phone className="w-4 h-4" />
                                                <span className="font-medium">{order.buyer_phone}</span>
                                            </p>
                                        )}
                                    </div>
                                    <p className="text-gray-600 mb-2">
                                        Items: {order.items?.map(item => `${item.product_name} (${item.quantity} ${item.unit})`).join(', ')}
                                    </p>
                                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        {order.delivery_address}
                                    </p>
                                    {order.delivery_notes && (
                                        <p className="text-sm text-gray-500 mb-1">Catatan: {order.delivery_notes}</p>
                                    )}
                                    <p className="text-sm text-gray-500">
                                        Dipesan: {new Date(order.order_date).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                    {order.driver_id && (
                                        <p className="text-sm text-blue-600 mt-1">
                                            Driver: {drivers.find(d => d.$id === order.driver_id)?.name || 'Unknown'}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col md:items-end gap-3">
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-[#125F95]">
                                            {formatCurrency(order.total_amount)}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleShowDetail(order)}
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            Detail
                                        </Button>
                                        {order.status === 'pending' && (
                                            <Button 
                                                size="sm" 
                                                className="bg-[#125F95] hover:bg-[#125F95]/60"
                                                onClick={() => handleUpdateStatus(order.$id, 'confirmed')}
                                            >
                                                Konfirmasi
                                            </Button>
                                        )}
                                        {order.status === 'confirmed' && (
                                            <>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => handleAssignDriver(order)}
                                                >
                                                    <Truck className="w-4 h-4 mr-1" />
                                                    Assign Driver
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    className="bg-blue-600 hover:bg-blue-700"
                                                    onClick={() => handleUpdateStatus(order.$id, 'processing')}
                                                >
                                                    Proses
                                                </Button>
                                            </>
                                        )}
                                        {order.status === 'processing' && (
                                            <Button 
                                                size="sm" 
                                                className="bg-green-600 hover:bg-green-700"
                                                onClick={() => handleUpdateStatus(order.$id, 'delivered')}
                                            >
                                                Kirim
                                            </Button>
                                        )}
                                        {order.status === 'delivered' && (
                                            <Button 
                                                size="sm" 
                                                className="bg-green-600 hover:bg-green-700"
                                                onClick={() => handleUpdateStatus(order.$id, 'completed')}
                                            >
                                                Selesai
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {orders.length === 0 && (
                <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada pesanan</h3>
                    <p className="text-gray-600">
                        {activeTab === 'all' ? 'Belum ada pesanan masuk' : `Tidak ada pesanan dengan status ${getStatusText(activeTab)}`}
                    </p>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedOrder && (
                <div className="fixed inset-0  bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className=" bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-orange-100">
                            <h2 className="text-xl font-semibold text-gray-800">Detail Pesanan #{selectedOrder.$id.slice(-8)}</h2>
                            <Button variant="ghost" size="sm" onClick={() => setShowDetailModal(false)} className="hover:bg-white">
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Status */}
                            <div>
                                <h3 className="font-medium mb-2 text-gray-700">Status Pesanan</h3>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit ${getStatusColor(selectedOrder.status)}`}>
                                    {getStatusIcon(selectedOrder.status)}
                                    {getStatusText(selectedOrder.status)}
                                </span>
                            </div>

                            {/* Customer Info */}
                            <div>
                                <h3 className="font-medium mb-2 text-gray-700">Informasi Pembeli</h3>
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 space-y-2 border border-gray-200">
                                    <p className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-600" />
                                        <span className="font-medium">{selectedOrder.buyer_name}</span>
                                    </p>
                                    {selectedOrder.buyer_phone && (
                                        <p className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-gray-600" />
                                            <span>{selectedOrder.buyer_phone}</span>
                                        </p>
                                    )}
                                    <p className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 mt-1 text-gray-600" />
                                        <span>{selectedOrder.delivery_address}</span>
                                    </p>
                                    {selectedOrder.delivery_notes && (
                                        <p className="text-sm text-gray-600">
                                            Catatan: {selectedOrder.delivery_notes}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h3 className="font-medium mb-2 text-gray-700">Item Pesanan</h3>
                                <div className="space-y-2 border border-gray-200 rounded-lg p-4">
                                    {selectedOrder.items?.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                                            <div>
                                                <p className="font-medium">{item.product_name}</p>
                                                <p className="text-sm text-gray-600">{item.quantity} {item.unit} × {formatCurrency(item.unit_price)}</p>
                                            </div>
                                            <p className="font-medium">{formatCurrency(item.total_price)}</p>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center pt-2 font-semibold text-lg border-t border-gray-200">
                                        <span>Total:</span>
                                        <span className="text-[#125F95]">{formatCurrency(selectedOrder.total_amount)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Order Timeline */}
                            <div>
                                <h3 className="font-medium mb-2 text-gray-700">Waktu</h3>
                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 space-y-2 border border-blue-200">
                                    <p className="text-sm">
                                        <span className="font-medium">Dipesan:</span> {new Date(selectedOrder.order_date).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                    {selectedOrder.delivery_date && (
                                        <p className="text-sm">
                                            <span className="font-medium">Dikirim:</span> {new Date(selectedOrder.delivery_date).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Driver Modal */}
            {/* Assign Driver Modal */}
{showAssignModal && selectedOrder && (
    <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-blue-100">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Pilih Driver untuk Pengiriman</h2>
                    <p className="text-sm text-gray-600 mt-1">Pesanan #{selectedOrder.$id.slice(-8)}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowAssignModal(false)} className="hover:bg-white">
                    <X className="w-4 h-4" />
                </Button>
            </div>
            
            <div className="p-6 space-y-6">
                {/* Order Summary */}
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                    <h3 className="font-medium text-gray-800 mb-2">Detail Pengiriman</h3>
                    <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Alamat:</span> {selectedOrder.delivery_address}</p>
                        <p><span className="font-medium">Total:</span> {formatCurrency(selectedOrder.total_amount)}</p>
                        {selectedOrder.delivery_notes && (
                            <p><span className="font-medium">Catatan:</span> {selectedOrder.delivery_notes}</p>
                        )}
                    </div>
                </div>

                {/* Driver Selection */}
                {/* Driver Selection */}
<div>
    <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-800 flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            Pilih Driver Tersedia
        </h3>
        <span className="text-sm text-gray-500">
            {drivers.filter(driver => driver.is_available).length} driver tersedia
        </span>
    </div>
    
    {drivers.filter(driver => driver.is_available).length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="font-semibold text-gray-700 mb-2">Tidak ada driver tersedia</h4>
            <p className="text-sm text-gray-500">Semua driver sedang dalam perjalanan atau offline</p>
            <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => window.location.reload()}
            >
                Refresh Data Driver
            </Button>
        </div>
    ) : (
        <>
            {/* Quick Filter */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs bg-white border-blue-300 hover:bg-blue-100"
                        onClick={() => {
                            // Filter driver dengan rating tertinggi
                            const bestDriver = drivers
                                .filter(d => d.is_available)
                                .sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];
                            if (bestDriver) setSelectedDriverId(bestDriver.$id);
                        }}
                    >
                        ⭐ Driver Terbaik
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs bg-white border-blue-300 hover:bg-blue-100"
                        onClick={() => {
                            // Filter driver dengan pengalaman terbanyak
                            const expDriver = drivers
                                .filter(d => d.is_available)
                                .sort((a, b) => (b.total_deliveries || 0) - (a.total_deliveries || 0))[0];
                            if (expDriver) setSelectedDriverId(expDriver.$id);
                        }}
                    >
                        📦 Paling Berpengalaman
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs bg-white border-blue-300 hover:bg-blue-100"
                        onClick={() => setSelectedDriverId('')}
                    >
                        🔄 Reset Pilihan
                    </Button>
                </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {drivers
                    .filter(driver => driver.is_available)
                    .sort((a, b) => {
                        // Sort by rating first, then by total deliveries
                        if (b.rating !== a.rating) return (b.rating || 0) - (a.rating || 0);
                        return (b.total_deliveries || 0) - (a.total_deliveries || 0);
                    })
                    .map((driver, index) => (
                    <div
                        key={driver.$id}
                        onClick={() => setSelectedDriverId(driver.$id)}
                        className="border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50/50"
                    >
                        

                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4 flex-1">
                                {/* Avatar dengan status indicator */}
                                <div className="relative">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 ${
                                        selectedDriverId === driver.$id 
                                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-200' 
                                            : 'bg-gradient-to-br from-gray-400 to-gray-500 group-hover:from-blue-400 group-hover:to-blue-500'
                                    }`}>
                                        <User className="w-8 h-8 text-white" />
                                    </div>
                                    {/* Online indicator */}
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full flex items-center justify-center">
                                        <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-bold text-lg text-gray-900 truncate">
                                            {driver.name}
                                        </h4>
                                        {driver.rating && (
                                            <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                                <span className="text-xs font-semibold text-yellow-700">
                                                    {driver.rating.toFixed(1)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        {/* Vehicle Info */}
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <Truck className="w-4 h-4 text-blue-500" />
                                                <span className="font-medium">{driver.vehicle_type}</span>
                                            </div>
                                            <span className="font-mono bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-xs font-medium">
                                                {driver.vehicle_number}
                                            </span>
                                        </div>

                                        {/* Contact Info */}
                                        {driver.phone && (
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <Phone className="w-4 h-4 text-green-500" />
                                                <span>{driver.phone}</span>
                                            </div>
                                        )}

                                        {/* Stats */}
                                        <div className="flex items-center gap-4 text-xs">
                                            {driver.total_deliveries && (
                                                <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                                    <span className="font-semibold">{driver.total_deliveries}</span>
                                                    <span>pengiriman</span>
                                                </div>
                                            )}
                                            {driver.experience_years && (
                                                <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                                    <span className="font-semibold">{driver.experience_years}</span>
                                                    <span>tahun</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Area */}
                            <div className="flex flex-col items-end gap-2 ml-4">
                                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full border border-green-200">
                                    ✅ TERSEDIA
                                </span>
                                
                                {/* Quick Select Button */}
                                <Button
                                    size="sm"
                                    variant={selectedDriverId === driver.$id ? "default" : "outline"}
                                    className={`text-xs transition-all duration-200 ${
                                        selectedDriverId === driver.$id 
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                                            : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                                    }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedDriverId(selectedDriverId === driver.$id ? '' : driver.$id);
                                    }}
                                >
                                    {selectedDriverId === driver.$id ? (
                                        <>
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Dipilih
                                        </>
                                    ) : (
                                        <>
                                            <User className="w-3 h-3 mr-1" />
                                            Pilih
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Specialty Tags */}
                        {driver.specialty && (
                            <div className="mt-4 pt-3 border-t border-gray-200">
                                <div className="flex flex-wrap gap-1">
                                    <span className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 px-2 py-1 rounded-lg text-xs font-medium border border-orange-300">
                                        🏆 {driver.specialty}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Hover Effect Overlay */}
                        <div className={`absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none ${
                            selectedDriverId === driver.$id 
                                ? 'bg-blue-400/5' 
                                : 'bg-transparent group-hover:bg-blue-400/5'
                        }`}></div>
                    </div>
                ))}
            </div>
        </>
    )}
</div>

{/* Enhanced Selected Driver Info */}
{selectedDriverId && (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-5 shadow-md">
        <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
                <h4 className="font-bold text-green-800 text-lg">Driver Terpilih</h4>
                <p className="text-sm text-green-600">Siap untuk mengantarkan pesanan</p>
            </div>
        </div>
        
        {(() => {
            const selectedDriver = drivers.find(d => d.$id === selectedDriverId);
            return selectedDriver ? (
                <div className="bg-white rounded-lg p-4 border border-green-200 space-y-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-bold text-gray-900 text-lg">{selectedDriver.name}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Truck className="w-4 h-4" />
                                <span>{selectedDriver.vehicle_type}</span>
                                <span className="bg-gray-100 px-2 py-0.5 rounded font-mono text-xs">
                                    {selectedDriver.vehicle_number}
                                </span>
                            </div>
                        </div>
                        
                        {selectedDriver.rating && (
                            <div className="text-right">
                                <div className="flex items-center gap-1 mb-1">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    <span className="font-bold text-gray-900">{selectedDriver.rating.toFixed(1)}</span>
                                </div>
                                <p className="text-xs text-gray-500">Rating driver</p>
                            </div>
                        )}
                    </div>
                    
                    {selectedDriver.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg p-2">
                            <Phone className="w-4 h-4 text-green-600" />
                            <span className="font-medium">{selectedDriver.phone}</span>
                            <Button variant="outline" size="sm" className="ml-auto text-xs">
                                📞 Hubungi
                            </Button>
                        </div>
                    )}
                    
                    {selectedDriver.total_deliveries && (
                        <div className="text-xs text-gray-600 bg-blue-50 rounded-lg p-2">
                            📊 Telah menyelesaikan <span className="font-bold text-blue-700">{selectedDriver.total_deliveries}</span> pengiriman
                        </div>
                    )}
                </div>
            ) : null;
        })()}
    </div>
)}

                {/* Selected Driver Info */}
                {selectedDriverId && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <h4 className="font-medium text-green-800">Driver Terpilih</h4>
                        </div>
                        {(() => {
                            const selectedDriver = drivers.find(d => d.$id === selectedDriverId);
                            return selectedDriver ? (
                                <div className="text-sm text-green-700">
                                    <p className="font-medium">{selectedDriver.name}</p>
                                    <p>{selectedDriver.vehicle_type} ({selectedDriver.vehicle_number})</p>
                                    {selectedDriver.phone && <p>📞 {selectedDriver.phone}</p>}
                                </div>
                            ) : null;
                        })()}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setShowAssignModal(false);
                            setSelectedDriverId('');
                        }}
                        className="flex-1 border-gray-300 hover:bg-gray-50"
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={() => handleUpdateStatus(selectedOrder.$id, 'processing', selectedDriverId)}
                        disabled={!selectedDriverId}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        {selectedDriverId ? (
                            <>
                                <Truck className="w-4 h-4 mr-2" />
                                Assign Driver & Proses
                            </>
                        ) : (
                            'Pilih Driver Terlebih Dahulu'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    </div>
)}
        </div>
    );
}