'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Heart, ShoppingCart, MapPin, Star, Map, Grid, Filter } from 'lucide-react';
import { authService } from '@/lib/appwrite';
import { buyerService, cartService, favoritesService } from '@/lib/buyer-services';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Import Leaflet dinamically untuk menghindari SSR issues
const PangkalanMap = dynamic(() => import('@/components/buyer/PangkalanMap'), { 
    ssr: false,
    loading: () => <div className="h-64 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">Loading Map...</div>
});

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [pangkalans, setPangkalans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedPangkalan, setSelectedPangkalan] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' atau 'map'
    const [user, setUser] = useState(null);
    const router = useRouter();

    const categories = ['Ikan Laut', 'Ikan Air Tawar', 'Seafood', 'Ikan Olahan'];

    useEffect(() => {
        fetchUser();
        fetchData();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [searchTerm, selectedCategory, selectedPangkalan]);

    const fetchUser = async () => {
        try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            await Promise.all([fetchProducts(), fetchPangkalans()]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const filters = {};
            if (searchTerm) filters.search = searchTerm;
            if (selectedCategory) filters.category = selectedCategory;
            if (selectedPangkalan) filters.pangkalan_id = selectedPangkalan;

            const response = await buyerService.getAllProducts(filters);
            setProducts(response.documents);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchPangkalans = async () => {
        try {
            const pangkalanData = await buyerService.getPangkalansWithLocation();
            setPangkalans(pangkalanData);
        } catch (error) {
            console.error('Error fetching pangkalans:', error);
        }
    };

    const handleAddToCart = async (product) => {
        if (!user) {
            router.push('/auth/login');
            return;
        }

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

    const handleAddToFavorites = async (product) => {
        if (!user) {
            router.push('/auth/login');
            return;
        }

        try {
            await favoritesService.addToFavorites(
                user.$id,
                product.$id,
                product.pangkalan_id
            );
            alert('Produk berhasil ditambahkan ke favorit!');
        } catch (error) {
            console.error('Error adding to favorites:', error);
            alert('Gagal menambahkan ke favorit');
        }
    };

    const handlePangkalanSelect = (pangkalanId) => {
        setSelectedPangkalan(pangkalanId);
        setViewMode('grid'); // Switch to grid view when selecting from map
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
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Semua Produk</h1>
                    <p className="text-gray-600">Temukan ikan segar terbaik dari berbagai pangkalan</p>
                </div>
                
             
                                <div className="flex gap-2">
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                                        onClick={() => setViewMode('grid')}
                                        className={viewMode === 'grid' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                                        size="sm"
                                    >
                                        <Grid className="w-4 h-4 mr-2" />
                                        Grid
                                    </Button>
                                    <Button
                                        variant={viewMode === 'map' ? 'default' : 'outline'}
                                        onClick={() => setViewMode('map')}
                                        className={viewMode === 'map' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                                        size="sm"
                                    >
                                        <Map className="w-4 h-4 mr-2" />
                                        Peta
                                    </Button>
                                </div>
                            </div>

                            {/* Search and Filters */}
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        type="text"
                        placeholder="Cari produk..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    {/* Category Filter */}
                    <Button
                        variant={selectedCategory === '' ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory('')}
                        className={selectedCategory === '' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                        size="sm"
                    >
                        Semua Kategori
                    </Button>
                    {categories.map((category) => (
                        <Button
                            key={category}
                            variant={selectedCategory === category ? 'default' : 'outline'}
                            onClick={() => setSelectedCategory(category)}
                            className={selectedCategory === category ? 'bg-orange-600 hover:bg-orange-700' : ''}
                            size="sm"
                        >
                            {category}
                        </Button>
                    ))}
                </div>

                {/* Pangkalan Filter */}
                {pangkalans.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={selectedPangkalan === '' ? 'default' : 'outline'}
                            onClick={() => setSelectedPangkalan('')}
                            className={selectedPangkalan === '' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                            size="sm"
                        >
                            <MapPin className="w-3 h-3 mr-1" />
                            Semua Pangkalan
                        </Button>
                        {pangkalans.slice(0, 5).map((pangkalan) => (
                            <Button
                                key={pangkalan.user_id}
                                variant={selectedPangkalan === pangkalan.user_id ? 'default' : 'outline'}
                                onClick={() => setSelectedPangkalan(pangkalan.user_id)}
                                className={selectedPangkalan === pangkalan.user_id ? 'bg-blue-600 hover:bg-blue-700' : ''}
                                size="sm"
                            >
                                {pangkalan.pangkalan_name}
                            </Button>
                        ))}
                        {pangkalans.length > 5 && (
                            <Button variant="outline" size="sm">
                                +{pangkalans.length - 5} lainnya
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Content based on view mode */}
            {viewMode === 'map' ? (
                <div className="space-y-4">
                    {/* Map View */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="h-96">
                                <PangkalanMap 
                                    pangkalans={pangkalans}
                                    onPangkalanSelect={handlePangkalanSelect}
                                    selectedPangkalan={selectedPangkalan}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Selected Pangkalan Products */}
                    {selectedPangkalan && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold">
                                Produk dari {pangkalans.find(p => p.user_id === selectedPangkalan)?.pangkalan_name}
                            </h3>
                            <ProductGrid 
                                products={products} 
                                handleAddToCart={handleAddToCart}
                                handleAddToFavorites={handleAddToFavorites}
                                router={router}
                            />
                        </div>
                    )}
                </div>
            ) : (
                /* Grid View */
                <ProductGrid 
                    products={products} 
                    handleAddToCart={handleAddToCart}
                    handleAddToFavorites={handleAddToFavorites}
                    router={router}
                />
            )}
        </div>
    );
}

// Component untuk grid produk
function ProductGrid({ products, handleAddToCart, handleAddToFavorites, router }) {
    if (products.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-4xl mb-4">🐟</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada produk ditemukan</h3>
                <p className="text-gray-600">
                    Coba ubah kata kunci atau filter pencarian
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
                <Card key={product.$id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gray-200 relative">
                        <img 
                            src={product.image_url || 'https://via.placeholder.com/400x300/f0f9ff/0ea5e9?text=🐟+Ikan+Segar'} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/400x300/e5e7eb/9ca3af?text=Gambar+Ikan';
                            }}
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                            <Button
                                size="sm"
                                variant="secondary"
                                className="p-2 bg-white/80 hover:bg-white"
                                onClick={() => handleAddToFavorites(product)}
                            >
                                <Heart className="w-4 h-4" />
                            </Button>
                        </div>
                        {product.freshness_level && (
                            <div className="absolute top-2 left-2">
                                <span className={`text-xs px-2 py-1 rounded ${
                                    product.freshness_level === 'Sangat Segar' ? 'bg-green-100 text-green-800' :
                                    product.freshness_level === 'Cukup Segar' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {product.freshness_level}
                                </span>
                            </div>
                        )}
                    </div>
                    <CardContent className="p-4">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            <p className="text-sm text-gray-600">{product.category}</p>
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-orange-600">
                                    Rp {product.price.toLocaleString()}
                                </span>
                                <span className="text-sm text-gray-500">/{product.unit}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Stok: {product.stock} {product.unit}</span>
                            </div>
                            {product.description && (
                                <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                            )}
                            <div className="flex gap-2 pt-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="flex-1"
                                    onClick={() => router.push(`/buyer/products/${product.$id}`)}
                                >
                                    Detail
                                </Button>
                                <Button 
                                    size="sm" 
                                    className="flex-1 bg-orange-600 hover:bg-orange-700"
                                    onClick={() => handleAddToCart(product)}
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
    );
}