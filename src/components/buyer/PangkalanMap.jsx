'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { buyerService } from '@/lib/buyer-services';

// Fix for marker icons in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon untuk pangkalan
const pangkalanIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#F37125" width="32" height="32">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

const PangkalanMap = ({ pangkalans, onPangkalanSelect, selectedPangkalan }) => {
    const [mapCenter, setMapCenter] = useState([-6.2088, 106.8456]); // Default Jakarta
    const [mapZoom, setMapZoom] = useState(11);
    const [pangkalanProducts, setPangkalanProducts] = useState({});
    const [loadingProducts, setLoadingProducts] = useState({});

    useEffect(() => {
        // Set map center based on pangkalans with location
        if (pangkalans.length > 0) {
            const pangkalansWithLocation = pangkalans.filter(p => p.latitude && p.longitude);
            if (pangkalansWithLocation.length > 0) {
                const avgLat = pangkalansWithLocation.reduce((sum, p) => sum + p.latitude, 0) / pangkalansWithLocation.length;
                const avgLng = pangkalansWithLocation.reduce((sum, p) => sum + p.longitude, 0) / pangkalansWithLocation.length;
                setMapCenter([avgLat, avgLng]);
            }
        }
    }, [pangkalans]);

    // Fetch products untuk pangkalan tertentu
    const fetchPangkalanProducts = async (pangkalanId) => {
        if (pangkalanProducts[pangkalanId] || loadingProducts[pangkalanId]) {
            return; // Sudah di-fetch atau sedang loading
        }

        setLoadingProducts(prev => ({ ...prev, [pangkalanId]: true }));
        
        try {
            const response = await buyerService.getProductsByPangkalan(pangkalanId, 5); // Ambil 5 produk pertama
            setPangkalanProducts(prev => ({
                ...prev,
                [pangkalanId]: response.documents
            }));
        } catch (error) {
            console.error(`Error fetching products for pangkalan ${pangkalanId}:`, error);
            setPangkalanProducts(prev => ({
                ...prev,
                [pangkalanId]: []
            }));
        } finally {
            setLoadingProducts(prev => ({ ...prev, [pangkalanId]: false }));
        }
    };

    const handleMarkerClick = (pangkalan) => {
        onPangkalanSelect(pangkalan.user_id);
    };

    const handleMarkerMouseOver = (pangkalan) => {
        // Fetch products saat hover
        fetchPangkalanProducts(pangkalan.user_id);
    };

    const renderTooltipContent = (pangkalan) => {
        const products = pangkalanProducts[pangkalan.user_id] || [];
        const isLoading = loadingProducts[pangkalan.user_id];

        return (
            <div className="min-w-[250px] max-w-[300px]">
                {/* Header Pangkalan */}
                <div className="border-b border-gray-200 pb-2 mb-2">
                    <h4 className="font-bold text-base text-gray-900">
                        🏪 {pangkalan.pangkalan_name}
                    </h4>
                    <div className="text-xs text-gray-600 mt-1">
                        📍 {pangkalan.address ? 
                            (pangkalan.address.length > 50 ? 
                                pangkalan.address.substring(0, 50) + '...' : 
                                pangkalan.address
                            ) : 
                            'Alamat tidak tersedia'
                        }
                    </div>
                    {pangkalan.phone && (
                        <div className="text-xs text-gray-600">
                            📞 {pangkalan.phone}
                        </div>
                    )}
                    <div className="text-xs text-blue-600 font-medium mt-1">
                        📦 {pangkalan.product_count || 0} produk tersedia
                    </div>
                </div>

                {/* Products List */}
                <div>
                    <h5 className="font-semibold text-sm text-gray-800 mb-2">🐟 Produk Tersedia:</h5>
                    
                    {isLoading ? (
                        <div className="space-y-1">
                            <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                        </div>
                    ) : products.length > 0 ? (
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                            {products.map((product, index) => (
                                <div key={product.$id} className="text-xs border-l-2 border-orange-300 pl-2 py-1">
                                    <div className="font-medium text-gray-800">
                                        {index + 1}. {product.name}
                                    </div>
                                    <div className="text-gray-600 flex justify-between">
                                        <span>💰 Rp {product.price?.toLocaleString()}/{product.unit}</span>
                                        <span className={`px-1 rounded text-xs ${
                                            product.stock > 10 ? 'bg-green-100 text-green-700' :
                                            product.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            📊 {product.stock} {product.unit}
                                        </span>
                                    </div>
                                    {product.freshness_level && (
                                        <div className="text-xs">
                                            <span className={`px-1 rounded ${
                                                product.freshness_level === 'Sangat Segar' ? 'bg-green-100 text-green-700' :
                                                product.freshness_level === 'Cukup Segar' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                ✨ {product.freshness_level}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {pangkalan.product_count > 5 && (
                                <div className="text-xs text-gray-500 italic border-t border-gray-200 pt-1">
                                    ... dan {pangkalan.product_count - 5} produk lainnya
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-xs text-gray-500 italic">
                            Belum ada produk tersedia
                        </div>
                    )}
                </div>

                {/* Call to Action */}
                <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="text-xs text-blue-600 font-medium">
                        🖱️ Klik marker untuk melihat semua produk
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full w-full rounded-lg overflow-hidden">
            <MapContainer 
                center={mapCenter} 
                zoom={mapZoom} 
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {pangkalans
                    .filter(pangkalan => pangkalan.latitude && pangkalan.longitude)
                    .map((pangkalan) => (
                    <Marker
                        key={pangkalan.user_id}
                        position={[pangkalan.latitude, pangkalan.longitude]}
                        icon={pangkalanIcon}
                        eventHandlers={{
                            click: () => handleMarkerClick(pangkalan),
                            mouseover: () => handleMarkerMouseOver(pangkalan)
                        }}
                    >
                        {/* Tooltip yang muncul saat hover */}
                        <Tooltip 
                            direction="top" 
                            offset={[0, -32]}
                            opacity={0.95}
                            className="custom-tooltip"
                            permanent={false}
                        >
                            {renderTooltipContent(pangkalan)}
                        </Tooltip>

                        {/* Popup yang muncul saat click */}
                        <Popup maxWidth={350} className="custom-popup">
                            <div className="p-2">
                                <h3 className="font-bold text-lg mb-3 text-center text-orange-600">
                                    🏪 {pangkalan.pangkalan_name}
                                </h3>
                                
                                <div className="space-y-2 text-sm mb-4">
                                    <div className="flex items-start gap-2">
                                        <span className="text-gray-500">📍</span>
                                        <span className="text-gray-700">{pangkalan.address}</span>
                                    </div>
                                    
                                    {pangkalan.phone && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500">📞</span>
                                            <span className="text-gray-700">{pangkalan.phone}</span>
                                        </div>
                                    )}
                                    
                                    {pangkalan.operating_hours && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500">🕒</span>
                                            <span className="text-gray-700">{pangkalan.operating_hours}</span>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">📦</span>
                                        <span className="text-gray-700 font-medium">
                                            {pangkalan.product_count || 0} produk tersedia
                                        </span>
                                    </div>
                                </div>

                                {/* Products Preview */}
                                {pangkalanProducts[pangkalan.user_id] && pangkalanProducts[pangkalan.user_id].length > 0 && (
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-sm text-gray-800 mb-2">🐟 Produk Terbaru:</h4>
                                        <div className="space-y-1 max-h-24 overflow-y-auto">
                                            {pangkalanProducts[pangkalan.user_id].slice(0, 3).map((product, index) => (
                                                <div key={product.$id} className="text-xs bg-gray-50 p-1 rounded">
                                                    <span className="font-medium">{product.name}</span>
                                                    <span className="text-orange-600 ml-2">
                                                        Rp {product.price?.toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => handleMarkerClick(pangkalan)}
                                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-md"
                                >
                                    🛒 Lihat Semua Produk
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default PangkalanMap;