'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    MapPin, 
    Plus, 
    Edit, 
    Trash2, 
    Search,
    Star,
    Home,
    Building
} from 'lucide-react';
import { authService } from '@/lib/appwrite';
import { addressService } from '@/lib/buyer-services';
import { useRouter } from 'next/navigation';

export default function AddressesPage() {
    const [addresses, setAddresses] = useState([]);
    const [filteredAddresses, setFilteredAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        if (user) {
            fetchAddresses();
        }
    }, [user]);

    useEffect(() => {
        filterAddresses();
    }, [addresses, searchTerm]);

    const fetchUser = async () => {
        try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
            if (!currentUser) {
                router.push('//login');
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            router.push('/login');
        }
    };

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            console.log('🔍 Fetching addresses for user:', user.$id); // Debug log
            
            // 🔧 GUNAKAN DATABASE REAL - bukan mock data
            const response = await addressService.getAddresses(user.$id);
            console.log('🔍 Addresses fetched:', response); // Debug log
            
            setAddresses(response.documents || []);
        } catch (error) {
            console.error('Error fetching addresses:', error);
            setAddresses([]); // Set empty array jika error
        } finally {
            setLoading(false);
        }
    };

    const filterAddresses = () => {
        let filtered = addresses;

        if (searchTerm) {
            filtered = filtered.filter(address => 
                address.address_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                address.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                address.full_address.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredAddresses(filtered);
    };

    const handleSetDefault = async (addressId) => {
        try {
            // 🔧 GUNAKAN DATABASE REAL
            await addressService.setDefaultAddress(user.$id, addressId);
            
            // Update local state
            const updatedAddresses = addresses.map(addr => ({
                ...addr,
                is_default: addr.$id === addressId
            }));
            setAddresses(updatedAddresses);
            alert('Alamat default berhasil diubah');
        } catch (error) {
            console.error('Error setting default address:', error);
            alert('Gagal mengubah alamat default');
        }
    };


    const handleDeleteAddress = async (addressId) => {
        if (confirm('Apakah Anda yakin ingin menghapus alamat ini?')) {
            try {
                // 🔧 GUNAKAN DATABASE REAL
                await addressService.deleteAddress(addressId);
                
                // Update local state
                const updatedAddresses = addresses.filter(addr => addr.$id !== addressId);
                setAddresses(updatedAddresses);
                alert('Alamat berhasil dihapus');
            } catch (error) {
                console.error('Error deleting address:', error);
                alert('Gagal menghapus alamat');
            }
        }
    };

    const getAddressIcon = (addressName) => {
        switch (addressName.toLowerCase()) {
            case 'rumah':
            case 'home':
                return <Home className="w-5 h-5" />;
            case 'kantor':
            case 'office':
                return <Building className="w-5 h-5" />;
            default:
                return <MapPin className="w-5 h-5" />;
        }
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Alamat Saya</h1>
                    <p className="text-gray-600">Kelola alamat pengiriman Anda</p>
                </div>
                <Button 
                    onClick={() => router.push('/buyer/addresses/add')}
                    className="bg-orange-600 hover:bg-orange-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Alamat
                </Button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                    type="text"
                    placeholder="Cari alamat..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Addresses List */}
            {filteredAddresses.length === 0 ? (
                <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {addresses.length === 0 ? 'Belum ada alamat' : 'Alamat tidak ditemukan'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                        {addresses.length === 0 
                            ? 'Tambahkan alamat untuk memudahkan proses checkout' 
                            : 'Coba ubah kata kunci pencarian'
                        }
                    </p>
                    {addresses.length === 0 && (
                        <Button 
                            onClick={() => router.push('/buyer/addresses/add')}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Alamat Pertama
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredAddresses.map((address) => (
                        <Card key={address.$id} className={`
                            relative hover:shadow-md transition-shadow
                            ${address.is_default ? 'ring-2 ring-orange-500 ring-opacity-50' : ''}
                        `}>
                            <CardContent className="p-6">
                                {address.is_default && (
                                    <div className="absolute top-3 right-3">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                                            <Star className="w-3 h-3 fill-current" />
                                            Default
                                        </span>
                                    </div>
                                )}
                                
                                <div className="space-y-4">
                                    {/* Address Header */}
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                            {getAddressIcon(address.address_name)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{address.address_name}</h3>
                                            <p className="text-sm text-gray-600">{address.recipient_name}</p>
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-600">{address.phone_number}</p>
                                    </div>

                                    {/* Address */}
                                    <div className="space-y-2">
                                        <p className="text-gray-800">{address.full_address}</p>
                                        {address.postal_code && (
                                            <p className="text-sm text-gray-600">Kode Pos: {address.postal_code}</p>
                                        )}
                                        {address.notes && (
                                            <p className="text-sm text-gray-600 italic">Catatan: {address.notes}</p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                                        {!address.is_default && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSetDefault(address.$id)}
                                                className="flex-1 text-orange-600 border-orange-200 hover:bg-orange-50"
                                            >
                                                <Star className="w-4 h-4 mr-1" />
                                                Jadikan Default
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDeleteAddress(address.$id)}
                                            className="text-red-600 border-red-200 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}