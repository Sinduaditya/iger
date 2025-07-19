'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Trash2, MapPin } from 'lucide-react';
import { authService } from '@/lib/appwrite';
import { favoritesService, cartService } from '@/lib/buyer-services';
import { useRouter } from 'next/navigation';

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        if (user) {
            fetchFavorites();
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

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const response = await favoritesService.getFavorites(user.$id);
            setFavorites(response.documents.filter(item => item.product)); // Filter out items with null products
        } catch (error) {
            console.error('Error fetching favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromFavorites = async (favoriteId, productId) => {
        try {
            await favoritesService.removeFromFavorites(user.$id, productId);
            fetchFavorites();
        } catch (error) {
            console.error('Error removing from favorites:', error);
            alert('Gagal menghapus dari favorit');
        }
    };

    const handleAddToCart = async (product) => {
        try {
            await cartService.addToCart(
                user.$id,
                product.$id,
                product.pangkalan_id,
                1,
                product.price
            );
            alert('Produk berhasil ditambahkan ke keranjang!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Gagal menambahkan ke keranjang');
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
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Produk Favorit</h1>
                <p className="text-gray-600">Koleksi produk ikan favorit Anda</p>
            </div>

            {favorites.length === 0 ? (
                <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada favorit</h3>
                    <p className="text-gray-600 mb-4">Tambahkan produk ke favorit untuk memudahkan akses</p>
                    <Button 
                        onClick={() => router.push('/buyer/products')}
                        className="bg-orange-600 hover:bg-orange-700"
                    >
                        Jelajahi Produk
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map((favorite) => (
                        <Card key={favorite.$id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="aspect-video bg-gray-200 relative">
                                <img 
                                    src={favorite.product?.image_url || 'https://via.placeholder.com/400x300/f0f9ff/0ea5e9?text=🐟+Ikan+Segar'} 
                                    alt={favorite.product?.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/400x300/e5e7eb/9ca3af?text=Gambar+Ikan';
                                    }}
                                />
                                <div className="absolute top-2 right-2">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="p-2 bg-white/80 hover:bg-white"
                                        onClick={() => handleRemoveFromFavorites(favorite.$id, favorite.product.$id)}
                                    >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                </div>
                                {favorite.product?.freshness_level && (
                                    <div className="absolute top-2 left-2">
                                        <span className={`text-xs px-2 py-1 rounded ${
                                            favorite.product.freshness_level === 'Sangat Segar' ? 'bg-green-100 text-green-800' :
                                            favorite.product.freshness_level === 'Cukup Segar' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {favorite.product.freshness_level}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <CardContent className="p-4">
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg">{favorite.product?.name}</h3>
                                    <p className="text-sm text-gray-600">{favorite.product?.category}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-orange-600">
                                            Rp {favorite.product?.price?.toLocaleString()}
                                        </span>
                                        <span className="text-sm text-gray-500">/{favorite.product?.unit}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm">Stok: {favorite.product?.stock} {favorite.product?.unit}</span>
                                    </div>
                                    {(favorite.product?.latitude && favorite.product?.longitude) && (
                                        <div className="flex items-center gap-1 text-xs text-gray-600">
                                            <MapPin className="w-3 h-3" />
                                            <span>{favorite.product.latitude.toFixed(4)}, {favorite.product.longitude.toFixed(4)}</span>
                                        </div>
                                    )}
                                    {favorite.product?.description && (
                                        <p className="text-sm text-gray-600 line-clamp-2">{favorite.product.description}</p>
                                    )}
                                    <div className="flex gap-2 pt-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="flex-1"
                                            onClick={() => router.push(`/buyer/products/${favorite.product.$id}`)}
                                        >
                                            Detail
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            className="flex-1 bg-orange-600 hover:bg-orange-700"
                                            onClick={() => handleAddToCart(favorite.product)}
                                        >
                                            <ShoppingCart className="w-4 h-4 mr-1" />
                                            Keranjang
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