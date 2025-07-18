'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MapPin, Save, Loader2 } from 'lucide-react';
import { authService } from '@/lib/appwrite';
import { addressService } from '@/lib/buyer-services';
import { useRouter } from 'next/navigation';

export default function AddAddressPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        address_name: '',
        recipient_name: '',
        phone_number: '',
        full_address: '',
        postal_code: '',
        notes: '',
        is_default: false
    });
    const router = useRouter();

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
            if (!currentUser) {
                router.push('/auth/login');
                return;
            }
            
            // Set default recipient name from user
            setFormData(prev => ({
                ...prev,
                recipient_name: currentUser.name || '',
                phone_number: currentUser.phone || ''
            }));
        } catch (error) {
            console.error('Error fetching user:', error);
            router.push('/auth/login');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.address_name || !formData.recipient_name || !formData.phone_number || !formData.full_address) {
            alert('Mohon lengkapi semua field yang wajib diisi');
            return;
        }

        try {
            setLoading(true);
            
            // Create address using Appwrite
            await addressService.createAddress(user.$id, formData);
            
            alert('Alamat berhasil ditambahkan!');
            router.push('/buyer/addresses');
        } catch (error) {
            console.error('Error creating address:', error);
            alert('Gagal menambahkan alamat. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
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
                    <h1 className="text-3xl font-bold text-gray-900">Tambah Alamat</h1>
                    <p className="text-gray-600">Tambahkan alamat pengiriman baru</p>
                </div>
            </div>

            {/* Form */}
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Informasi Alamat
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Label Alamat *</label>
                                <Input
                                    name="address_name"
                                    value={formData.address_name}
                                    onChange={handleInputChange}
                                    placeholder="Rumah, Kantor, dll"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Contoh: Rumah, Kantor, Kos</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Nama Penerima *</label>
                                <Input
                                    name="recipient_name"
                                    value={formData.recipient_name}
                                    onChange={handleInputChange}
                                    placeholder="Nama lengkap penerima"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Nomor Telepon *</label>
                                <Input
                                    name="phone_number"
                                    type="tel"
                                    value={formData.phone_number}
                                    onChange={handleInputChange}
                                    placeholder="08xxxxxxxxxx"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Kode Pos</label>
                                <Input
                                    name="postal_code"
                                    value={formData.postal_code}
                                    onChange={handleInputChange}
                                    placeholder="12345"
                                    maxLength={5}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Alamat Lengkap *</label>
                            <Textarea
                                name="full_address"
                                value={formData.full_address}
                                onChange={handleInputChange}
                                placeholder="Jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota"
                                rows={4}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Berikan alamat yang detail untuk memudahkan pengiriman
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Catatan Alamat</label>
                            <Textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                placeholder="Patokan atau catatan tambahan untuk kurir"
                                rows={2}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Contoh: Rumah cat hijau, sebelah warung Pak Budi
                            </p>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="is_default"
                                name="is_default"
                                checked={formData.is_default}
                                onChange={handleInputChange}
                                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            />
                            <label htmlFor="is_default" className="text-sm font-medium">
                                Jadikan sebagai alamat utama
                            </label>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                className="flex-1"
                                disabled={loading}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-orange-600 hover:bg-orange-700"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Simpan Alamat
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Tips */}
            <Card className="max-w-2xl">
                <CardContent className="p-4">
                    <h3 className="font-medium text-gray-900 mb-2">💡 Tips mengisi alamat:</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Pastikan nomor telepon aktif dan dapat dihubungi</li>
                        <li>• Berikan alamat yang detail hingga nomor rumah</li>
                        <li>• Tambahkan patokan yang mudah dikenali kurir</li>
                        <li>• Gunakan label alamat yang mudah diingat</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}