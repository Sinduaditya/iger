'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Phone, Edit, Trash2, Truck, Star, User, X, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { driversService, pangkalanHelpers } from '@/lib/pangkalan-service';

export default function DriversPage() {
    const { user } = useAuth();
    const [drivers, setDrivers] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        license_number: '',
        vehicle_type: '',
        vehicle_number: '',
        is_available: true
    });

    useEffect(() => {
        if (user && user.role === 'pangkalan') {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [driversData, statsData] = await Promise.all([
                driversService.getDrivers(user.$id),
                driversService.getDriverStats(user.$id)
            ]);
            
            setDrivers(driversData.documents);
            setStats(statsData);
        } catch (error) {
            console.error('Error loading drivers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (driver = null) => {
        if (driver) {
            setEditingDriver(driver);
            setFormData({
                name: driver.name,
                phone: driver.phone,
                license_number: driver.license_number,
                vehicle_type: driver.vehicle_type,
                vehicle_number: driver.vehicle_number,
                is_available: driver.is_available
            });
        } else {
            setEditingDriver(null);
            setFormData({
                name: '',
                phone: '',
                license_number: '',
                vehicle_type: '',
                vehicle_number: '',
                is_available: true
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingDriver(null);
        setFormData({
            name: '',
            phone: '',
            license_number: '',
            vehicle_type: '',
            vehicle_number: '',
            is_available: true
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate data
        const errors = pangkalanHelpers.validateDriverData(formData);
        if (errors.length > 0) {
            alert(errors.join('\n'));
            return;
        }

        try {
            if (editingDriver) {
                await driversService.updateDriver(editingDriver.$id, formData);
            } else {
                await driversService.createDriver(user.$id, formData);
            }
            
            handleCloseModal();
            loadData();
        } catch (error) {
            console.error('Error saving driver:', error);
            alert('Gagal menyimpan driver');
        }
    };

    const handleDeleteDriver = async (driverId) => {
        if (confirm('Apakah Anda yakin ingin menghapus driver ini?')) {
            try {
                await driversService.deleteDriver(driverId);
                loadData();
            } catch (error) {
                console.error('Error deleting driver:', error);
                alert('Gagal menghapus driver');
            }
        }
    };

    const toggleAvailability = async (driverId, currentStatus) => {
        try {
            await driversService.updateDriver(driverId, {
                is_available: !currentStatus
            });
            loadData();
        } catch (error) {
            console.error('Error updating driver availability:', error);
            alert('Gagal mengubah status driver');
        }
    };

    const filteredDrivers = drivers.filter(driver =>
        driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.phone.includes(searchTerm) ||
        driver.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Memuat data driver...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Kelola Driver</h1>
                    <p className="text-gray-600">Kelola tim driver pengiriman</p>
                </div>
                <Button 
                    onClick={() => handleOpenModal()}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Driver
                </Button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Cari driver (nama, telepon, plat nomor)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Driver</p>
                                <p className="text-2xl font-bold">{stats.total || 0}</p>
                            </div>
                            <User className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Driver Tersedia</p>
                                <p className="text-2xl font-bold text-green-600">{stats.available || 0}</p>
                            </div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Pengiriman</p>
                                <p className="text-2xl font-bold">{stats.totalDeliveries || 0}</p>
                            </div>
                            <Truck className="w-8 h-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Rating Rata-rata</p>
                                <p className="text-2xl font-bold">{stats.avgRating || 0}</p>
                            </div>
                            <Star className="w-8 h-8 text-yellow-500 fill-current" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Drivers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDrivers.map((driver) => (
                    <Card key={driver.$id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {/* Driver Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                                            <span className="text-white font-medium text-lg">
                                                {driver.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{driver.name}</h3>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                <span className="text-sm text-gray-600">{driver.rating || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleAvailability(driver.$id, driver.is_available)}
                                        className={`px-2 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                                            driver.is_available 
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                        }`}
                                    >
                                        {driver.is_available ? 'Tersedia' : 'Sibuk'}
                                    </button>
                                </div>

                                {/* Driver Info */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone className="w-4 h-4" />
                                        <span>{driver.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Truck className="w-4 h-4" />
                                        <span>{driver.vehicle_type} - {driver.vehicle_number}</span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <span>SIM: {driver.license_number}</span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <span>{driver.total_deliveries || 0} pengiriman selesai</span>
                                    </div>
                                </div>

                                {/* Performance Indicator */}
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">Performa</span>
                                        <span className="text-sm text-gray-500">
                                            {driver.total_deliveries > 50 ? 'Excellent' : 
                                             driver.total_deliveries > 20 ? 'Good' : 
                                             driver.total_deliveries > 5 ? 'Average' : 'New'}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className={`h-2 rounded-full ${
                                                driver.total_deliveries > 50 ? 'bg-green-500' :
                                                driver.total_deliveries > 20 ? 'bg-blue-500' :
                                                driver.total_deliveries > 5 ? 'bg-yellow-500' : 'bg-gray-400'
                                            }`}
                                            style={{ 
                                                width: `${Math.min((driver.total_deliveries / 100) * 100, 100)}%` 
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="flex-1"
                                        onClick={() => handleOpenModal(driver)}
                                    >
                                        <Edit className="w-4 h-4 mr-1" />
                                        Edit
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="text-red-600 hover:bg-red-50"
                                        onClick={() => handleDeleteDriver(driver.$id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredDrivers.length === 0 && (
                <div className="text-center py-12">
                    <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada driver</h3>
                    <p className="text-gray-600 mb-4">
                        {searchTerm ? 'Tidak ada driver yang cocok dengan pencarian' : 'Belum ada driver yang ditambahkan'}
                    </p>
                    <Button 
                        onClick={() => handleOpenModal()}
                        className="bg-orange-600 hover:bg-orange-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Driver Pertama
                    </Button>
                </div>
            )}

            {/* Modal Add/Edit Driver */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold">
                                {editingDriver ? 'Edit Driver' : 'Tambah Driver'}
                            </h2>
                            <Button variant="ghost" size="sm" onClick={handleCloseModal}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Nama Driver *</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                    placeholder="Masukkan nama driver"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">Nomor Telepon *</label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    required
                                    placeholder="08xxxxxxxxxx"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">Nomor SIM *</label>
                                <Input
                                    value={formData.license_number}
                                    onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                                    required
                                    placeholder="Nomor SIM"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">Jenis Kendaraan *</label>
                                <select
                                    value={formData.vehicle_type}
                                    onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="">Pilih jenis kendaraan</option>
                                    <option value="Motor">Motor</option>
                                    <option value="Mobil Pick Up">Mobil Pick Up</option>
                                    <option value="Mobil Box">Mobil Box</option>
                                    <option value="Truk Kecil">Truk Kecil</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">Nomor Plat *</label>
                                <Input
                                    value={formData.vehicle_number}
                                    onChange={(e) => setFormData({...formData, vehicle_number: e.target.value})}
                                    required
                                    placeholder="B 1234 CD"
                                />
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.is_available}
                                    onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                />
                                <label className="text-sm font-medium">Driver tersedia</label>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCloseModal}
                                    className="flex-1"
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                                >
                                    {editingDriver ? 'Update Driver' : 'Simpan Driver'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}