'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Heart, ShoppingCart, MapPin, Star, Map, Grid, Filter, Loader2 } from 'lucide-react';
import { authService } from '@/lib/appwrite';
import { buyerService, cartService, favoritesService } from '@/lib/buyer-services';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';

// --- Impor Komponen Dinamis & Modal ---
const PangkalanMap = dynamic(() => import('@/components/buyer/PangkalanMap'), { 
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-200 animate-pulse rounded-lg flex items-center justify-center"><p>Memuat Peta...</p></div>
});

const PangkalanDetailModal = dynamic(() => 
    import('@/components/buyer/PangkalanDetailModal').then(mod => mod.PangkalanDetailModal), {
    ssr: false
});


export default function ProductsPage() {
    // --- State Management ---
    const [products, setProducts] = useState([]);
    const [pangkalans, setPangkalans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedPangkalan, setSelectedPangkalan] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' atau 'map'
    const [user, setUser] = useState(null);
    const router = useRouter();
    
    // --- State untuk Modal (Integrasi Baru) ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalPangkalanData, setModalPangkalanData] = useState(null);

    const categories = ['Ikan Laut', 'Ikan Air Tawar', 'Seafood', 'Ikan Olahan'];

    // --- Data Fetching ---
    useEffect(() => {
        const initializePage = async () => {
            setLoading(true);
            await Promise.all([
                fetchUser(),
                fetchPangkalans()
            ]);
            // Fetch products setelah pangkalan selesai dimuat
            await fetchProducts();
            setLoading(false);
        };
        initializePage();
    }, []);

    // Re-fetch produk setiap kali filter berubah
    useEffect(() => {
        // Jangan fetch saat loading awal, karena sudah dihandle di initializePage
        if (!loading) {
            fetchProducts(searchTerm, selectedCategory, selectedPangkalan);
        }
    }, [searchTerm, selectedCategory, selectedPangkalan]);

    const fetchUser = useCallback(async () => {
        try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            console.error('User not logged in:', error);
        }
    }, []);

    const fetchPangkalans = useCallback(async () => {
        try {
            const pangkalanData = await buyerService.getPangkalansWithLocation();
            setPangkalans(pangkalanData);
        } catch (error) {
            console.error('Error fetching pangkalans:', error);
            toast.error("Gagal memuat data pangkalan.");
        }
    }, []);

    const fetchProducts = useCallback(async (search, category, pangkalanId) => {
        try {
            const filters = {};
            if (search) filters.search = search;
            if (category) filters.category = category;
            if (pangkalanId) filters.pangkalan_id = pangkalanId;

            const response = await buyerService.getAllProducts(filters);
            setProducts(response.documents);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error("Gagal memuat data produk.");
        }
    }, []);

    // --- Event Handlers ---
    const handleAddToCart = async (product) => {
        if (!user) {
            toast.error("Silakan login terlebih dahulu untuk menambahkan ke keranjang.");
            router.push('/auth/login');
            return;
        }
        try {
            // Ambil isi keranjang user
            const cartItems = await cartService.getCartItems(user.$id);
            // Jika keranjang tidak kosong, cek apakah semua item dari pangkalan yang sama
            if (cartItems.documents.length > 0) {
                const pangkalanIdInCart = cartItems.documents[0].pangkalan_id;
                if (pangkalanIdInCart !== product.pangkalan_id) {
                    toast.error(
                        "Keranjang hanya bisa berisi produk dari satu pangkalan.",
                        { description: "Selesaikan proses pada keranjang Anda sebelum menambah produk dari pangkalan lain." }
                    );
                    return;
                }
            }
            await cartService.addToCart(user.$id, product.$id, product.pangkalan_id, 1, product.price);
            toast.success(`${product.name} berhasil ditambahkan ke keranjang!`);
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Gagal menambahkan ke keranjang', { description: error.message });
        }
    };

    const handleAddToFavorites = async (product) => {
        if (!user) {
            toast.error("Silakan login terlebih dahulu untuk menambahkan ke favorit.");
            router.push('/auth/login');
            return;
        }
        try {
            await favoritesService.addToFavorites(user.$id, product.$id, product.pangkalan_id);
            toast.success(`${product.name} berhasil ditambahkan ke favorit!`);
        } catch (error) {
            console.error('Error adding to favorites:', error);
            toast.error('Gagal menambahkan ke favorit', { description: error.message });
        }
    };

    // --- Logika Baru untuk Membuka Modal ---
    const handlePangkalanSelect = (pangkalanId) => {
        setSelectedPangkalan(pangkalanId); // Untuk highlight marker di peta
        const selectedData = pangkalans.find(p => p.user_id === pangkalanId);
        if (selectedData) {
            setModalPangkalanData(selectedData);
            setIsModalOpen(true);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalPangkalanData(null);
        setSelectedPangkalan(''); // Reset filter dan highlight peta
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                <p className="mt-4 text-gray-600">Memuat data...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 space-y-8">
            {/* Header dan Kontrol Tampilan */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Temukan Ikan Segar</h1>
                    <p className="text-gray-600 mt-1">Jelajahi produk terbaik dari berbagai pangkalan di sekitar Anda.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant={viewMode === 'grid' ? 'default' : 'outline'} onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'bg-orange-600 hover:bg-orange-700' : ''} size="sm"><Grid className="w-4 h-4 mr-2" /> Grid</Button>
                    <Button variant={viewMode === 'map' ? 'default' : 'outline'} onClick={() => setViewMode('map')} className={viewMode === 'map' ? 'bg-orange-600 hover:bg-orange-700' : ''} size="sm"><Map className="w-4 h-4 mr-2" /> Peta</Button>
                </div>
            </div>

            {/* Pencarian dan Filter */}
            <div className="space-y-4">
                <div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /><Input type="text" placeholder="Cari ikan, seafood, atau produk olahan..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 h-12 text-base" /></div>
                <div className="flex flex-wrap gap-2">
                    <Button variant={selectedCategory === '' ? 'default' : 'outline'} onClick={() => setSelectedCategory('')} className={selectedCategory === '' ? 'bg-orange-600 hover:bg-orange-700' : ''} size="sm">Semua Kategori</Button>
                    {categories.map(category => <Button key={category} variant={selectedCategory === category ? 'default' : 'outline'} onClick={() => setSelectedCategory(category)} className={selectedCategory === category ? 'bg-orange-600 hover:bg-orange-700' : ''} size="sm">{category}</Button>)}
                </div>
            </div>

            {/* Konten Utama */}
            <div>
                {viewMode === 'map' ? (
                    <Card className="h-[65vh]">
                        <CardContent className="p-0 h-full">
                            <PangkalanMap pangkalans={pangkalans} onPangkalanSelect={handlePangkalanSelect} selectedPangkalan={selectedPangkalan} />
                        </CardContent>
                    </Card>
                ) : (
                    products.length > 0 ?
                    <ProductGrid products={products} handleAddToCart={handleAddToCart} handleAddToFavorites={handleAddToFavorites} router={router} pangkalans={pangkalans}/>
                    : <div className="text-center py-16"><div className="text-5xl mb-4">🐟</div><h3 className="text-xl font-medium text-gray-900">Produk Tidak Ditemukan</h3><p className="text-gray-600 mt-2">Coba ganti kata kunci atau filter pencarian Anda.</p></div>
                )}
            </div>

            {/* --- Render Modal (Integrasi Baru) --- */}
            <PangkalanDetailModal isOpen={isModalOpen} onClose={handleCloseModal} pangkalanData={modalPangkalanData} />
        </div>
    );
}

// --- Komponen Grid Produk ---
function ProductGrid({ products, handleAddToCart, handleAddToFavorites, router, pangkalans }) {
    const getPangkalanName = (pangkalanId) => {
        return pangkalans.find(p => p.user_id === pangkalanId)?.pangkalan_name || 'Pangkalan';
    };
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
                <Card key={product.$id} className="overflow-hidden group flex flex-col">
                    <div className="aspect-video bg-gray-200 relative">
                        <img src={product.image_url || 'https://via.placeholder.com/400x300/f0f9ff/0ea5e9?text=🐟'} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300/e5e7eb/9ca3af?text=Error'; }} />
                        <div className="absolute top-2 right-2">
                            <Button
                                size="icon"
                                variant="secondary"
                                className="p-2 h-8 w-8 bg-white/80 hover:bg-white"
                                onClick={async () => {
                                    await handleAddToFavorites(product);
                                    toast.success(`${product.name} berhasil ditambahkan ke favorit!`);
                                }}
                            >
                                <Heart className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    <CardContent className="p-4 flex flex-col flex-grow">
                        <div className="flex-grow">
                            <p className="text-xs text-blue-600 font-semibold mb-1">{getPangkalanName(product.pangkalan_id)}</p>
                            <h3 className="font-bold text-lg text-gray-800 line-clamp-2">{product.name}</h3>
                            <p className="text-sm text-gray-500">{product.category}</p>
                            <div className="mt-2">
                                <span className="text-xl font-bold text-orange-600">Rp {product.price.toLocaleString()}</span>
                                <span className="text-sm text-gray-500">/{product.unit}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 pt-4 mt-auto">
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
                                onClick={async () => {
                                    await handleAddToCart(product);
                                }}
                            >
                                <ShoppingCart className="w-4 h-4 mr-2" /> Keranjang
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}