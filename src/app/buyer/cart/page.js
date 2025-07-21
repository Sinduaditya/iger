'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { authService } from '@/lib/appwrite';
import { cartService } from '@/lib/buyer-services';
import { useRouter } from 'next/navigation';

export default function CartPage() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState({}); // Track which items are being updated
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        if (user) {
            fetchCartItems();
        }
    }, [user]);

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

    const fetchCartItems = async () => {
        try {
            setLoading(true);
            const response = await cartService.getCartItems(user.$id);
            setCartItems(response.documents.filter(item => item.product)); // Filter out items with null products
        } catch (error) {
            console.error('Error fetching cart items:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (cartItemId, newQuantity, unitPrice) => {
        if (newQuantity < 1) return;

        try {
            // Set loading state for this specific item
            setUpdating(prev => ({ ...prev, [cartItemId]: true }));

            // Calculate new total price
            const newTotalPrice = newQuantity * unitPrice;

            // Update cart item
            await cartService.updateCartItem(cartItemId, newQuantity, newTotalPrice);
            
            // Update local state immediately for better UX
            setCartItems(prevItems => 
                prevItems.map(item => 
                    item.$id === cartItemId 
                        ? { ...item, quantity: newQuantity, total_price: newTotalPrice }
                        : item
                )
            );

            console.log(`✅ Updated cart item ${cartItemId}: quantity=${newQuantity}, total=${newTotalPrice}`);
        } catch (error) {
            console.error('Error updating quantity:', error);
            alert('Gagal mengupdate jumlah');
            // Refresh cart items on error
            fetchCartItems();
        } finally {
            // Remove loading state for this item
            setUpdating(prev => {
                const newUpdating = { ...prev };
                delete newUpdating[cartItemId];
                return newUpdating;
            });
        }
    };

    const removeItem = async (cartItemId) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus item ini?')) {
            try {
                setUpdating(prev => ({ ...prev, [cartItemId]: true }));
                await cartService.removeFromCart(cartItemId);
                
                // Update local state immediately
                setCartItems(prevItems => prevItems.filter(item => item.$id !== cartItemId));
                
                console.log(`✅ Removed cart item ${cartItemId}`);
            } catch (error) {
                console.error('Error removing item:', error);
                alert('Gagal menghapus item');
                fetchCartItems();
            } finally {
                setUpdating(prev => {
                    const newUpdating = { ...prev };
                    delete newUpdating[cartItemId];
                    return newUpdating;
                });
            }
        }
    };

    const getTotalAmount = () => {
        return cartItems.reduce((sum, item) => sum + item.total_price, 0);
    };

    const getTotalItems = () => {
        return cartItems.reduce((sum, item) => sum + item.quantity, 0);
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
                <h1 className="text-3xl font-bold text-gray-900">Keranjang Belanja</h1>
                <p className="text-gray-600">Kelola produk yang akan Anda beli</p>
            </div>

            {cartItems.length === 0 ? (
                <div className="text-center py-12">
                    <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Keranjang kosong</h3>
                    <p className="text-gray-600 mb-4">Belum ada produk yang ditambahkan ke keranjang</p>
                    <Button 
                        onClick={() => router.push('/buyer/products')}
                        className="bg-orange-600 hover:bg-orange-700"
                    >
                        Mulai Belanja
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <Card key={item.$id} className={updating[item.$id] ? 'opacity-60' : ''}>
                                <CardContent className="p-4">
                                    <div className="flex gap-4">
                                        <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                                            <img 
                                                src={item.product?.image_url || 'https://via.placeholder.com/80x80/f0f9ff/0ea5e9?text=🐟'} 
                                                alt={item.product?.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/80x80/e5e7eb/9ca3af?text=🐟';
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{item.product?.name}</h3>
                                            <p className="text-sm text-gray-600">{item.product?.category}</p>
                                            <p className="text-lg font-bold text-orange-600">
                                                Rp {item.unit_price.toLocaleString()} / {item.product?.unit}
                                            </p>
                                            {item.product?.stock && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Stok tersedia: {item.product.stock} {item.product.unit}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeItem(item.$id)}
                                                disabled={updating[item.$id]}
                                                className="text-red-600 hover:bg-red-50"
                                            >
                                                {updating[item.$id] ? (
                                                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </Button>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => updateQuantity(item.$id, item.quantity - 1, item.unit_price)}
                                                    disabled={item.quantity <= 1 || updating[item.$id]}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </Button>
                                                <span className="px-3 py-1 border rounded text-center min-w-[50px] bg-white">
                                                    {updating[item.$id] ? (
                                                        <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                                    ) : (
                                                        item.quantity
                                                    )}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => updateQuantity(item.$id, item.quantity + 1, item.unit_price)}
                                                    disabled={updating[item.$id]}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <p className="font-semibold">
                                                Rp {item.total_price.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div>
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Ringkasan Pesanan</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span>Total Item</span>
                                        <span>{getTotalItems()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>Rp {getTotalAmount().toLocaleString()}</span>
                                    </div>
                                    <div className="border-t pt-3">
                                        <div className="flex justify-between font-semibold text-lg">
                                            <span>Total</span>
                                            <span className="text-orange-600">Rp {getTotalAmount().toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button 
                                    className="w-full mt-6 bg-orange-600 hover:bg-orange-700"
                                    onClick={() => router.push('/buyer/checkout')}
                                    disabled={Object.keys(updating).length > 0}
                                >
                                    {Object.keys(updating).length > 0 ? 'Memproses...' : 'Lanjut ke Checkout'}
                                </Button>
                                <Button 
                                    variant="outline"
                                    className="w-full mt-2"
                                    onClick={() => router.push('/buyer/products')}
                                >
                                    Lanjut Belanja
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}