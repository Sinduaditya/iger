'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    ShoppingCart,
    MapPin,
    CreditCard,
    Package,
    Truck,
    AlertCircle,
    CheckCircle,
    Plus,
    Star,
    Home,
    Building
} from 'lucide-react';
import { cartService, buyerOrdersService, buyerService, addressService } from '@/lib/buyer-services';

export default function CheckoutPage() {
    const { user } = useAuth();
    const router = useRouter();

    // States
    const [cartItems, setCartItems] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [deliveryNotes, setDeliveryNotes] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [showAddAddressForm, setShowAddAddressForm] = useState(false);

    // Form untuk alamat baru
    const [newAddress, setNewAddress] = useState({
        address_name: '',
        recipient_name: '',
        phone_number: '',
        full_address: '',
        postal_code: '',
        notes: '',
        is_default: false
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                setLoading(true);

                // Fetch cart items dan addresses secara parallel
                const [cartData, addressData] = await Promise.all([
                    cartService.getCartItems(user.$id),
                    fetchAddresses()
                ]);

                const items = cartData.documents || [];

                // Fetch product details untuk setiap item
                const itemsWithProducts = await Promise.all(
                    items.map(async (item) => {
                        try {
                            const product = await buyerService.getProduct(item.product_id);
                            return {
                                ...item,
                                product_name: product?.name || 'Unknown Product',
                                product_unit: product?.unit || 'pcs'
                            };
                        } catch (error) {
                            console.error(`Error fetching product ${item.product_id}:`, error);
                            return {
                                ...item,
                                product_name: 'Unknown Product',
                                product_unit: 'pcs'
                            };
                        }
                    })
                );

                setCartItems(itemsWithProducts);
                setAddresses(addressData);

                // Auto-select default address
                const defaultAddress = addressData.find(addr => addr.is_default);
                if (defaultAddress) {
                    setSelectedAddressId(defaultAddress.$id);
                }

            } catch (error) {
                console.error('Error fetching checkout data:', error);
                setError('Gagal memuat data checkout');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // Function untuk fetch addresses (bisa real API atau mock data)
    const fetchAddresses = async () => {
        try {
            console.log('🔍 Fetching addresses for user:', user.$id); // Debug log

            // 🔧 GUNAKAN DATABASE REAL
            const response = await addressService.getAddresses(user.$id);
            console.log('🔍 Addresses response:', response); // Debug log

            return response.documents || [];

        } catch (error) {
            console.error('Error fetching addresses:', error);
            return [];
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount);
    };

    const calculateTotals = () => {
        const subtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);
        const deliveryFee = 10000; // Fixed delivery fee
        const total = subtotal + deliveryFee;

        return { subtotal, deliveryFee, total };
    };

    const getAddressIcon = (addressName) => {
        switch (addressName.toLowerCase()) {
            case 'rumah':
            case 'home':
                return <Home className="w-4 h-4" />;
            case 'kantor':
            case 'office':
                return <Building className="w-4 h-4" />;
            default:
                return <MapPin className="w-4 h-4" />;
        }
    };

    const handleAddNewAddress = async (e) => {
        e.preventDefault();

        try {
            console.log('🔍 Adding new address:', newAddress); // Debug log

            // 🔧 GUNAKAN DATABASE REAL
            const response = await addressService.createAddress(user.$id, newAddress);
            console.log('🔍 Address created:', response); // Debug log

            setAddresses(prev => [...prev, response]);
            setSelectedAddressId(response.$id);
            setShowAddAddressForm(false);
            setNewAddress({
                address_name: '',
                recipient_name: '',
                phone_number: '',
                full_address: '',
                postal_code: '',
                notes: '',
                is_default: false
            });

        } catch (error) {
            console.error('Error adding address:', error);
            setError('Gagal menambah alamat baru: ' + error.message);
        }
    };

    const validateForm = () => {
        // 1. Check cart not empty
        if (cartItems.length === 0) {
            setError('Keranjang belanja kosong');
            return false;
        }

        // 2. Check address selected
        if (!selectedAddressId) {
            setError('Pilih alamat pengiriman');
            return false;
        }

        // 3. Check address exists
        const selectedAddress = addresses.find(addr => addr.$id === selectedAddressId);
        if (!selectedAddress) {
            setError('Alamat yang dipilih tidak valid');
            return false;
        }

        // 4. Check required address fields
        if (!selectedAddress.recipient_name || !selectedAddress.phone_number || !selectedAddress.full_address) {
            setError('Data alamat tidak lengkap');
            return false;
        }

        // 5. Check payment method
        if (!paymentMethod) {
            setError('Pilih metode pembayaran');
            return false;
        }

        // 6. Check pangkalan_id exists in cart items
        const missingPangkalan = cartItems.find(item => !item.pangkalan_id);
        if (missingPangkalan) {
            setError(`Produk ${missingPangkalan.product_name || 'Unknown'} tidak memiliki data pangkalan`);
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setSubmitting(true);
            setError(null);

            const selectedAddress = addresses.find(addr => addr.$id === selectedAddressId);
            const { total } = calculateTotals();

            // 🔧 FIX: Ambil pangkalan_id dari cart items
            const firstCartItem = cartItems[0];
            const pangkalanId = firstCartItem?.pangkalan_id;

            if (!pangkalanId) {
                setError('Data pangkalan tidak ditemukan');
                return;
            }

            // 🔧 PREPARE: Order data sesuai dengan schema database
            const orderData = {
                buyer_id: user.$id,
                pangkalan_id: pangkalanId, // ✅ Required field
                buyer_name: selectedAddress.recipient_name,
                buyer_phone: selectedAddress.phone_number,
                delivery_address: selectedAddress.full_address,
                delivery_notes: deliveryNotes.trim() || '', // ✅ Handle empty notes
                total_amount: total,
                payment_method: paymentMethod
            };

            // 🔧 PREPARE: Order items dengan format yang benar
            const orderItems = cartItems.map(item => ({
                product_id: item.product_id,
                product_name: item.product_name || 'Unknown Product',
                quantity: parseInt(item.quantity), // ✅ Ensure integer for stock calculation
                unit: item.product_unit || 'pcs',
                unit_price: parseFloat(item.unit_price), // ✅ Ensure float
                total_price: parseFloat(item.total_price) // ✅ Ensure float
            }));

            console.log('🔍 Order data:', orderData);
            console.log('🔍 Order items:', orderItems);

            // 🔧 PROCESS: Order dengan stock validation & reduction
            const result = await buyerOrdersService.processOrder(orderData, orderItems);

            console.log('✅ Order processed successfully:', result.order.$id);

            // 🔧 CLEAR: Cart setelah order berhasil
            await cartService.clearCart(user.$id);
            console.log('✅ Cart cleared');

            // 🔧 REDIRECT: Ke success page dengan order ID
            router.push(`/buyer/checkout/success?orders=${result.order.$id}`);

        } catch (error) {
            console.error('❌ Error creating order:', error);

            // 🔧 HANDLE: Different error types
            if (error.message.includes('Stok tidak mencukupi')) {
                setError(error.message); // Show stock validation error
            } else if (error.message.includes('Missing required attribute')) {
                setError('Data tidak lengkap. Silakan periksa informasi pengiriman.');
            } else if (error.message.includes('pangkalan_id')) {
                setError('Data pangkalan tidak valid. Silakan refresh halaman.');
            } else {
                setError('Gagal membuat pesanan. Silakan coba lagi.');
            }

            // 🔧 LOG: Detail error untuk debugging
            console.error('Error details:', {
                message: error.message,
                orderData: orderData,
                orderItems: orderItems
            });

        } finally {
            setSubmitting(false);
        }
    };

    const { subtotal, deliveryFee, total } = calculateTotals();

    if (loading) {
        return (
            <div className="container mx-auto py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded mb-6"></div>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="h-64 bg-gray-200 rounded"></div>
                                <div className="h-32 bg-gray-200 rounded"></div>
                            </div>
                            <div className="h-96 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto py-8">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="bg-gray-50 border rounded-lg p-8">
                        <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">
                            Keranjang Belanja Kosong
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Tambahkan produk ke keranjang sebelum melakukan checkout
                        </p>
                        <Button onClick={() => router.push('/buyer/dashboard')}>
                            Belanja Sekarang
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Checkout</h1>

                {error && (
                    <Alert className="mb-6" variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Left Column - Form */}
                        <div className="space-y-6">

                            {/* Alamat Pengiriman */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <MapPin className="w-5 h-5 mr-2" />
                                            Alamat Pengiriman
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.push('/buyer/addresses')}
                                        >
                                            Kelola Alamat
                                        </Button>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {addresses.length === 0 ? (
                                        <div className="text-center py-6">
                                            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500 mb-4">Belum ada alamat tersimpan</p>
                                            <Button
                                                type="button"
                                                onClick={() => setShowAddAddressForm(true)}
                                                variant="outline"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Tambah Alamat
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <RadioGroup
                                                value={selectedAddressId}
                                                onValueChange={setSelectedAddressId}
                                            >
                                                {addresses.map((address) => (
                                                    <div key={address.$id}>
                                                        <div className="flex items-start space-x-3">
                                                            <RadioGroupItem
                                                                value={address.$id}
                                                                id={address.$id}
                                                                className="mt-1"
                                                            />
                                                            <Label htmlFor={address.$id} className="cursor-pointer flex-1">
                                                                <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                                                                    <div className="flex items-start justify-between">
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2 mb-2">
                                                                                {getAddressIcon(address.address_name)}
                                                                                <span className="font-medium">{address.address_name}</span>
                                                                                {address.is_default && (
                                                                                    <Badge variant="secondary" className="text-xs">
                                                                                        <Star className="w-3 h-3 mr-1" />
                                                                                        Default
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                            <p className="font-medium text-sm">{address.recipient_name}</p>
                                                                            <p className="text-sm text-gray-600">{address.phone_number}</p>
                                                                            <p className="text-sm text-gray-700 mt-1">{address.full_address}</p>
                                                                            {address.postal_code && (
                                                                                <p className="text-xs text-gray-500">Kode Pos: {address.postal_code}</p>
                                                                            )}
                                                                            {address.notes && (
                                                                                <p className="text-xs text-gray-500 italic">Catatan: {address.notes}</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </Label>
                                                        </div>
                                                    </div>
                                                ))}
                                            </RadioGroup>

                                            <Button
                                                type="button"
                                                onClick={() => setShowAddAddressForm(true)}
                                                variant="outline"
                                                className="w-full"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Tambah Alamat Baru
                                            </Button>
                                        </div>
                                    )}

                                    {/* Form Add Address */}
                                    {showAddAddressForm && (
                                        <div className="mt-6 border-t pt-6">
                                            <h3 className="font-medium mb-4">Tambah Alamat Baru</h3>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="address_name">Label Alamat</Label>
                                                        <Input
                                                            id="address_name"
                                                            value={newAddress.address_name}
                                                            onChange={(e) => setNewAddress({ ...newAddress, address_name: e.target.value })}
                                                            placeholder="Rumah, Kantor, dll"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="recipient_name">Nama Penerima</Label>
                                                        <Input
                                                            id="recipient_name"
                                                            value={newAddress.recipient_name}
                                                            onChange={(e) => setNewAddress({ ...newAddress, recipient_name: e.target.value })}
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="phone_number">No. Telepon</Label>
                                                        <Input
                                                            id="phone_number"
                                                            value={newAddress.phone_number}
                                                            onChange={(e) => setNewAddress({ ...newAddress, phone_number: e.target.value })}
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="postal_code">Kode Pos</Label>
                                                        <Input
                                                            id="postal_code"
                                                            value={newAddress.postal_code}
                                                            onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label htmlFor="full_address">Alamat Lengkap</Label>
                                                    <Textarea
                                                        id="full_address"
                                                        value={newAddress.full_address}
                                                        onChange={(e) => setNewAddress({ ...newAddress, full_address: e.target.value })}
                                                        rows={3}
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <Label htmlFor="notes">Catatan (Opsional)</Label>
                                                    <Textarea
                                                        id="notes"
                                                        value={newAddress.notes}
                                                        onChange={(e) => setNewAddress({ ...newAddress, notes: e.target.value })}
                                                        rows={2}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex gap-2 mt-4">
                                                <Button type="button" onClick={handleAddNewAddress}>
                                                    Simpan Alamat
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setShowAddAddressForm(false)}
                                                >
                                                    Batal
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Catatan Pengiriman */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Catatan Pengiriman</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        value={deliveryNotes}
                                        onChange={(e) => setDeliveryNotes(e.target.value)}
                                        placeholder="Catatan khusus untuk pengiriman (opsional)"
                                        rows={3}
                                    />
                                </CardContent>
                            </Card>

                            {/* Payment Method */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <CreditCard className="w-5 h-5 mr-2" />
                                        Metode Pembayaran
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="cod" id="cod" />
                                            <Label htmlFor="cod" className="flex items-center cursor-pointer">
                                                <Truck className="w-5 h-5 mr-2" />
                                                COD (Cash on Delivery)
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2 opacity-50">
                                            <RadioGroupItem value="transfer" id="transfer" disabled />
                                            <Label htmlFor="transfer" className="flex items-center">
                                                <CreditCard className="w-5 h-5 mr-2" />
                                                Transfer Bank (Coming Soon)
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div>
                            <Card className="sticky top-4">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Package className="w-5 h-5 mr-2" />
                                        Ringkasan Pesanan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {/* Cart Items */}
                                    <div className="space-y-4 mb-6">
                                        {cartItems.map((item, index) => (
                                            <div key={index} className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-sm">
                                                        {item.product_name}
                                                    </h4>
                                                    <p className="text-xs text-gray-500">
                                                        {item.quantity} {item.product_unit} × {formatCurrency(item.unit_price)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-sm">
                                                        {formatCurrency(item.total_price)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <Separator className="my-4" />

                                    {/* Price Breakdown */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Subtotal ({cartItems.length} item)</span>
                                            <span>{formatCurrency(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Biaya Pengiriman</span>
                                            <span>{formatCurrency(deliveryFee)}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total</span>
                                            <span className="text-green-600">{formatCurrency(total)}</span>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full mt-6"
                                        disabled={submitting || !selectedAddressId}
                                    >
                                        {submitting ? (
                                            'Memproses...'
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Buat Pesanan
                                            </>
                                        )}
                                    </Button>

                                    <p className="text-xs text-gray-500 mt-3 text-center">
                                        Dengan melanjutkan, Anda menyetujui syarat dan ketentuan kami
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}