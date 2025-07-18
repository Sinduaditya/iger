'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Package, X, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { productsService, pangkalanHelpers } from '@/lib/pangkalan-service';

export default function ProductsPage() {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        unit: '',
        stock: '',
        description: '',
        image_url: '',
        freshness_level: '',
        latitude: '',
        longitude: '',
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
            const [productsData, statsData] = await Promise.all([
                productsService.getProducts(user.$id),
                productsService.getProductStats(user.$id)
            ]);
            
            setProducts(productsData.documents);
            setStats(statsData);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                category: product.category,
                price: product.price.toString(),
                unit: product.unit,
                stock: product.stock.toString(),
                description: product.description || '',
                image_url: product.image_url || '',
                freshness_level: product.freshness_level || '',
                latitude: product.latitude ? product.latitude.toString() : '',
                longitude: product.longitude ? product.longitude.toString() : '',
                is_available: product.is_available
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                category: '',
                price: '',
                unit: '',
                stock: '',
                description: '',
                image_url: '',
                freshness_level: '',
                latitude: '',
                longitude: '',
                is_available: true
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingProduct(null);
        setFormData({
            name: '',
            category: '',
            price: '',
            unit: '',
            stock: '',
            description: '',
            image_url: '',
            freshness_level: '',
            latitude: '',
            longitude: '',
            is_available: true
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate data
        const errors = pangkalanHelpers.validateProductData(formData);
        if (errors.length > 0) {
            alert(errors.join('\n'));
            return;
        }

        try {
            if (editingProduct) {
                await productsService.updateProduct(editingProduct.$id, formData);
            } else {
                await productsService.createProduct(user.$id, formData);
            }
            
            handleCloseModal();
            loadData();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Gagal menyimpan produk');
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
            try {
                await productsService.deleteProduct(productId);
                loadData();
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Gagal menghapus produk');
            }
        }
    };

    const toggleAvailability = async (productId, currentStatus) => {
        try {
            await productsService.updateProduct(productId, {
                is_available: !currentStatus
            });
            loadData();
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Gagal mengubah status produk');
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Memuat produk...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Kelola Produk</h1>
                    <p className="text-gray-600">Kelola produk ikan segar Anda</p>
                </div>
                <Button 
                    onClick={() => handleOpenModal()}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Produk
                </Button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Cari produk..."
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
                                <p className="text-sm text-gray-600">Total Produk</p>
                                <p className="text-2xl font-bold">{stats.total || 0}</p>
                            </div>
                            <Package className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Produk Aktif</p>
                                <p className="text-2xl font-bold">{stats.available || 0}</p>
                            </div>
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Stok Rendah</p>
                                <p className="text-2xl font-bold">{stats.lowStock || 0}</p>
                            </div>
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Tidak Tersedia</p>
                                <p className="text-2xl font-bold">{stats.unavailable || 0}</p>
                            </div>
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                    <Card key={product.$id} className="overflow-hidden">
                        <div className="aspect-video bg-gray-200 relative">
                            <img 
                                src={product.image_url || 'https://images.unsplash.com/photo-1497671954146-59a89ff626ff?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1497671954146-59a89ff626ff?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
                                }}
                            />
                            <div className="absolute top-2 right-2">
                                <button
                                    onClick={() => toggleAvailability(product.$id, product.is_available)}
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        product.is_available 
                                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                                    } transition-colors cursor-pointer`}
                                >
                                    {product.is_available ? 'Tersedia' : 'Tidak Tersedia'}
                                </button>
                            </div>
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
                                    {product.freshness_level && (
                                        <span className={`text-xs px-2 py-1 rounded ${
                                            product.freshness_level === 'Sangat Segar' ? 'bg-green-100 text-green-800' :
                                            product.freshness_level === 'Cukup Segar' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {product.freshness_level}
                                        </span>
                                    )}
                                </div>
                                {(product.latitude && product.longitude) && (
                                    <div className="flex items-center gap-1 text-xs text-gray-600">
                                        <MapPin className="w-3 h-3" />
                                        <span>{product.latitude.toFixed(4)}, {product.longitude.toFixed(4)}</span>
                                    </div>
                                )}
                                {product.description && (
                                    <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                                )}
                                <div className="flex gap-2 pt-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="flex-1"
                                        onClick={() => handleOpenModal(product)}
                                    >
                                        <Edit className="w-4 h-4 mr-1" />
                                        Edit
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="text-red-600 hover:bg-red-50"
                                        onClick={() => handleDeleteProduct(product.$id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada produk</h3>
                    <p className="text-gray-600 mb-4">
                        {searchTerm ? 'Tidak ada produk yang cocok dengan pencarian' : 'Belum ada produk yang ditambahkan'}
                    </p>
                    <Button 
                        onClick={() => handleOpenModal()}
                        className="bg-orange-600 hover:bg-orange-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Produk Pertama
                    </Button>
                </div>
            )}

            {/* Modal Add/Edit Product */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-semibold">
                                {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
                            </h2>
                            <Button variant="ghost" size="sm" onClick={handleCloseModal}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Nama Produk *</label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        required
                                        placeholder="Masukkan nama produk"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Kategori *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    >
                                        <option value="">Pilih kategori</option>
                                        <option value="Ikan Laut">Ikan Laut</option>
                                        <option value="Ikan Air Tawar">Ikan Air Tawar</option>
                                        <option value="Seafood">Seafood</option>
                                        <option value="Ikan Olahan">Ikan Olahan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Harga *</label>
                                    <Input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                                        required
                                        placeholder="Masukkan harga"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Unit *</label>
                                    <select
                                        value={formData.unit}
                                        onChange={(e) => setFormData({...formData, unit: e.target.value})}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    >
                                        <option value="">Pilih unit</option>
                                        <option value="kg">Kilogram (kg)</option>
                                        <option value="ekor">Ekor</option>
                                        <option value="gram">Gram</option>
                                        <option value="pack">Pack</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Stok *</label>
                                    <Input
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                                        required
                                        placeholder="Masukkan stok"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Tingkat Kesegaran</label>
                                    <select
                                        value={formData.freshness_level}
                                        onChange={(e) => setFormData({...formData, freshness_level: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    >
                                        <option value="">Pilih tingkat kesegaran</option>
                                        <option value="Sangat Segar">Sangat Segar</option>
                                        <option value="Cukup Segar">Cukup Segar</option>
                                        <option value="Kurang Segar">Kurang Segar</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Latitude</label>
                                    <Input
                                        type="number"
                                        step="any"
                                        value={formData.latitude}
                                        onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                                        placeholder="-6.2088"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Longitude</label>
                                    <Input
                                        type="number"
                                        step="any"
                                        value={formData.longitude}
                                        onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                                        placeholder="106.8456"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">Deskripsi</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    placeholder="Masukkan deskripsi produk"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-2">URL Gambar</label>
                                <Input
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.is_available}
                                    onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                />
                                <label className="text-sm font-medium">Produk tersedia</label>
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
                                    {editingProduct ? 'Update Produk' : 'Simpan Produk'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}