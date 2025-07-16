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
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
                <Card className={`cursor-pointer transition-colors ${activeTab === 'all' ? 'ring-2 ring-orange-500' : ''}`}
                      onClick={() => setActiveTab('all')}>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold">{stats.total || 0}</p>
                        <p className="text-sm text-gray-600">Semua</p>
                    </CardContent>
                </Card>
                <Card className={`cursor-pointer transition-colors ${activeTab === 'pending' ? 'ring-2 ring-orange-500' : ''}`}
                      onClick={() => setActiveTab('pending')}>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</p>
                        <p className="text-sm text-gray-600">Pending</p>
                    </CardContent>
                </Card>
                <Card className={`cursor-pointer transition-colors ${activeTab === 'confirmed' ? 'ring-2 ring-orange-500' : ''}`}
                      onClick={() => setActiveTab('confirmed')}>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-blue-600">{stats.confirmed || 0}</p>
                        <p className="text-sm text-gray-600">Dikonfirmasi</p>
                    </CardContent>
                </Card>
                <Card className={`cursor-pointer transition-colors ${activeTab === 'processing' ? 'ring-2 ring-orange-500' : ''}`}
                      onClick={() => setActiveTab('processing')}>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-purple-600">{stats.processing || 0}</p>
                        <p className="text-sm text-gray-600">Diproses</p>
                    </CardContent>
                </Card>
                <Card className={`cursor-pointer transition-colors ${activeTab === 'delivered' ? 'ring-2 ring-orange-500' : ''}`}
                      onClick={() => setActiveTab('delivered')}>
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.delivered || 0}</p>
                        <p className="text-sm text-gray-600">Dikirim</p>
                    </CardContent>
                </Card>
                <Card className={`cursor-pointer transition-colors ${activeTab === 'completed' ? 'ring-2 ring-orange-500' : ''}`}
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
                                        <p className="text-2xl font-bold text-orange-600">
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
                                                className="bg-orange-600 hover:bg-orange-700"
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold">Detail Pesanan #{selectedOrder.$id.slice(-8)}</h2>
                            <Button variant="ghost" size="sm" onClick={() => setShowDetailModal(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Status */}
                            <div>
                                <h3 className="font-medium mb-2">Status Pesanan</h3>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit ${getStatusColor(selectedOrder.status)}`}>
                                    {getStatusIcon(selectedOrder.status)}
                                    {getStatusText(selectedOrder.status)}
                                </span>
                            </div>

                            {/* Customer Info */}
                            <div>
                                <h3 className="font-medium mb-2">Informasi Pembeli</h3>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                    <p className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        <span className="font-medium">{selectedOrder.buyer_name}</span>
                                    </p>
                                    {selectedOrder.buyer_phone && (
                                        <p className="flex items-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            <span>{selectedOrder.buyer_phone}</span>
                                        </p>
                                    )}
                                    <p className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 mt-1" />
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
                                <h3 className="font-medium mb-2">Item Pesanan</h3>
                                <div className="space-y-2">
                                    {selectedOrder.items?.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center py-2 border-b">
                                            <div>
                                                <p className="font-medium">{item.product_name}</p>
                                                <p className="text-sm text-gray-600">{item.quantity} {item.unit} × {formatCurrency(item.unit_price)}</p>
                                            </div>
                                            <p className="font-medium">{formatCurrency(item.total_price)}</p>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center pt-2 font-semibold text-lg">
                                        <span>Total:</span>
                                        <span className="text-orange-600">{formatCurrency(selectedOrder.total_amount)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Order Timeline */}
                            <div>
                                <h3 className="font-medium mb-2">Waktu</h3>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
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
            {showAssignModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold">Assign Driver</h2>
                            <Button variant="ghost" size="sm" onClick={() => setShowAssignModal(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Pilih Driver</label>
                                <select
                                    value={selectedDriverId}
                                    onChange={(e) => setSelectedDriverId(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="">Pilih driver</option>
                                    {drivers.filter(driver => driver.is_available).map(driver => (
                                        <option key={driver.$id} value={driver.$id}>
                                            {driver.name} - {driver.vehicle_type} ({driver.vehicle_number})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowAssignModal(false)}
                                    className="flex-1"
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={() => handleUpdateStatus(selectedOrder.$id, 'processing', selectedDriverId)}
                                    disabled={!selectedDriverId}
                                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                                >
                                    Assign & Proses
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}