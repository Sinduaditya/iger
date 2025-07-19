'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Heart, ShoppingCart, MapPin, Minus, Plus } from 'lucide-react';
import { authService } from '@/lib/appwrite';
import { buyerService, cartService, favoritesService } from '@/lib/buyer-services';
import { useRouter } from 'next/navigation';

export default function ProductDetailPage({ params }) {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [user, setUser] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchUser();
        fetchProduct();
    }, [params.id]);

    const fetchUser = async () => {
        try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
            if (currentUser) {
                checkFavoriteStatus(currentUser.$id);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await buyerService.getProduct(params.id);
            setProduct(response);
        } catch (error) {
            console.error('Error fetching product:', error);
            router.push('/buyer/products');
        } finally {
            setLoading(false);
        }
    };

    const checkFavoriteStatus = async (userId) => {
        try {
            const favoriteStatus = await favoritesService.isFavorite(userId, params.id);
            setIsFavorite(favoriteStatus);
        } catch (error) {
            console.error('Error checking favorite status:', error);
        }
    };

    const handleAddToCart = async () => {
        if (!user) {
            router.push('/auth/login');
            return;
        }

        try {
            await cartService.addToCart(
                user.$id,
                product.$id,
                product.pangkalan_id,
                quantity,
                product.price
            );
            alert('Produk berhasil ditambahkan ke keranjang!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Gagal menambahkan ke keranjang');
        }
    };

    const handleToggleFavorite = async () => {
        if (!user) {
            router.push('/auth/login');
            return;
        }

        try {
            if (isFavorite) {
                await favoritesService.removeFromFavorites(user.$id, product.$id);
                setIsFavorite(false);
                alert('Produk dihapus dari favorit');
            } else {
                await favoritesService.addToFavorites(user.$id, product.$id, product.pangkalan_id);
                setIsFavorite(true);
                alert('Produk ditambahkan ke favorit');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            alert('Gagal mengubah status favorit');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Produk tidak ditemukan</h2>
                <Button onClick={() => router.push('/buyer/products')}>
                    Kembali ke Produk
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center gap-2"
            >
                <ArrowLeft className="w-4 h-4" />
                Kembali
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="space-y-4">
                    <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                        <img 
                            src={product.image_url || 'https://via.placeholder.com/600x600/f0f9ff/0ea5e9?text=🐟+Ikan+Segar'} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/600x600/e5e7eb/9ca3af?text=Gambar+Ikan';
                            }}
                        />
                    </div>
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                        <p className="text-lg text-gray-600">{product.category}</p>
                    </div>

                    {/* Price */}
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-orange-600">
                            Rp {product.price.toLocaleString()}
                        </span>
                        <span className="text-lg text-gray-500">/{product.unit}</span>
                    </div>

                    {/* Stock & Freshness */}
                    <div className="flex justify-between items-center py-4 border-y">
                        <div>
                            <span className="text-sm text-gray-600">Stok:</span>
                            <span className="ml-2 font-semibold">{product.stock} {product.unit}</span>
                        </div>
                        {product.freshness_level && (
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                product.freshness_level === 'Sangat Segar' ? 'bg-green-100 text-green-800' :
                                product.freshness_level === 'Cukup Segar' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                                {product.freshness_level}
                            </span>
                        )}
                    </div>

                    {/* Location */}
                    {(product.latitude && product.longitude) && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>Lokasi: {product.latitude.toFixed(4)}, {product.longitude.toFixed(4)}</span>
                        </div>
                    )}

                    {/* Description */}
                    {product.description && (
                        <div>
                            <h3 className="font-semibold mb-2">Deskripsi</h3>
                            <p className="text-gray-600">{product.description}</p>
                        </div>
                    )}

                    {/* Quantity Selector */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Jumlah</label>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="w-4 h-4" />
                                </Button>
                                <Input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-20 text-center"
                                    min="1"
                                    max={product.stock}
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    disabled={quantity >= product.stock}
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                                <span className="text-sm text-gray-600">
                                    Subtotal: Rp {(product.price * quantity).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex items-center gap-2"
                                onClick={handleToggleFavorite}
                            >
                                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                                {isFavorite ? 'Hapus dari Favorit' : 'Tambah ke Favorit'}
                            </Button>
                            <Button
                                className="flex-1 bg-orange-600 hover:bg-orange-700"
                                onClick={handleAddToCart}
                            >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                Tambah ke Keranjang
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}