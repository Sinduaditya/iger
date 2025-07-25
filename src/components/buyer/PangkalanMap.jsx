// PangkalanMap.jsx

'use client';

import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { buyerService } from '@/lib/buyer-services'; 
import { useDebounce } from 'use-debounce';

// --- Icon Setup ---
// Fix untuk default icon di Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// UX Improvement: Icon berbeda untuk pangkalan yang aktif/terpilih
const createPangkalanIcon = (color, size = 38) => new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="${size}" height="${size}">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            <circle cx="12" cy="9.5" r="1.5" fill="white"/>
        </svg>
    `),
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
    tooltipAnchor: [0, -size]
});

const pangkalanIcon = createPangkalanIcon('#F37125'); // Oranye untuk default
const selectedPangkalanIcon = createPangkalanIcon('#1D4ED8', 44); // Biru dan lebih besar untuk yang terpilih

// --- Helper Components ---

// UX Improvement: Komponen untuk update peta tanpa re-render MapContainer
const MapUpdater = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, zoom);
        }
    }, [center, zoom, map]);
    return null;
};

// --- Main Component ---
const PangkalanMap = ({ pangkalans, onPangkalanSelect, selectedPangkalan }) => {
    const [pangkalanProducts, setPangkalanProducts] = useState({});
    const [loadingProducts, setLoadingProducts] = useState({});
    const [hoveredPangkalan, setHoveredPangkalan] = useState(null);
    
    // UX Improvement: Debounce untuk hover agar tidak membanjiri API call
    const [debouncedHoveredPangkalan] = useDebounce(hoveredPangkalan, 300);

    // Performance Improvement: Memoize kalkulasi pusat peta
    const mapCenter = useMemo(() => {
        if (!pangkalans || pangkalans.length === 0) return [-6.9667, 110.4167]; // Default Semarang
        const pangkalansWithLocation = pangkalans.filter(p => p.latitude && p.longitude);
        if (pangkalansWithLocation.length === 0) return [-6.9667, 110.4167];

        const avgLat = pangkalansWithLocation.reduce((sum, p) => sum + p.latitude, 0) / pangkalansWithLocation.length;
        const avgLng = pangkalansWithLocation.reduce((sum, p) => sum + p.longitude, 0) / pangkalansWithLocation.length;
        return [avgLat, avgLng];
    }, [pangkalans]);
    
    // Performance Improvement: Memoize kalkulasi pangkalan terpilih
    const selectedPangkalanData = useMemo(() => {
        if (!selectedPangkalan) return null;
        const p = pangkalans.find(p => p.user_id === selectedPangkalan);
        return p ? { lat: p.latitude, lng: p.longitude } : null;
    }, [selectedPangkalan, pangkalans]);

    // Fetch products untuk pangkalan tertentu (di-trigger oleh debounced hover)
    const fetchPangkalanProducts = useCallback(async (pangkalanId) => {
        if (!pangkalanId || pangkalanProducts[pangkalanId] || loadingProducts[pangkalanId]) return;

        setLoadingProducts(prev => ({ ...prev, [pangkalanId]: true }));
        try {
            const response = await buyerService.getProductsByPangkalan(pangkalanId, 5);
            setPangkalanProducts(prev => ({ ...prev, [pangkalanId]: response.documents || [] }));
        } catch (error) {
            console.error(`Error fetching products for pangkalan ${pangkalanId}:`, error);
            setPangkalanProducts(prev => ({ ...prev, [pangkalanId]: [] }));
        } finally {
            setLoadingProducts(prev => ({ ...prev, [pangkalanId]: false }));
        }
    }, [pangkalanProducts, loadingProducts]);

    useEffect(() => {
        if (debouncedHoveredPangkalan) {
            fetchPangkalanProducts(debouncedHoveredPangkalan.user_id);
        }
    }, [debouncedHoveredPangkalan, fetchPangkalanProducts]);

    // UI/UX Improvement: Konten Tooltip & Popup dibuat lebih bersih
    const renderTooltipContent = (pangkalan) => (
        <div
            className="p-1 cursor-pointer"
            onClick={() => onPangkalanSelect(pangkalan.user_id)}
            tabIndex={0}
            role="button"
            onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onPangkalanSelect(pangkalan.user_id);
                }
            }}
        >
            <h4 className="font-bold text-base text-gray-900">🏪 {pangkalan.pangkalan_name}</h4>
            <p className="text-xs text-blue-600 font-medium mt-1">
                📦 {pangkalan.product_count || 0} produk tersedia
            </p>
            <span className="block mt-1 text-xs text-orange-600 underline">Lihat detail pangkalan</span>
        </div>
    );
    
    const renderPopupContent = (pangkalan) => {
        const products = pangkalanProducts[pangkalan.user_id] || [];
        const isLoading = loadingProducts[pangkalan.user_id];
        return (
            <div className="w-[300px]">
                <div className="p-1">
                    <h3 className="font-bold text-lg mb-2 text-center text-orange-600">🏪 {pangkalan.pangkalan_name}</h3>
                    <div className="space-y-1.5 text-sm mb-3 border-t pt-2">
                        <p className="flex items-start gap-2 text-gray-700"><span>📍</span><span>{pangkalan.address}</span></p>
                        {pangkalan.phone && <p className="flex items-center gap-2 text-gray-700"><span>📞</span><span>{pangkalan.phone}</span></p>}
                        {pangkalan.operating_hours && <p className="flex items-center gap-2 text-gray-700"><span>🕒</span><span>{pangkalan.operating_hours}</span></p>}
                    </div>
                    <div className="border-t pt-2">
                        <h4 className="font-semibold text-sm text-gray-800 mb-2">🐟 Produk Unggulan:</h4>
                        {isLoading ? (
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                            </div>
                        ) : products.length > 0 ? (
                            <div className="space-y-2 max-h-36 overflow-y-auto pr-2">
                                {products.map(product => (
                                    <div key={product.$id} className="text-xs bg-gray-50 p-2 rounded-md shadow-sm">
                                        <div className="font-bold text-gray-800">{product.name}</div>
                                        <div className="flex justify-between items-center mt-1 text-gray-600">
                                            <span className="font-semibold text-orange-600">Rp {product.price?.toLocaleString()}/{product.unit}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                product.stock > 10 ? 'bg-green-100 text-green-800' :
                                                product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>Stok: {product.stock}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-xs text-gray-500 italic">Belum ada produk.</p>}
                    </div>
                </div>
                <button
                    onClick={() => onPangkalanSelect(pangkalan.user_id)}
                    className="w-full mt-3 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-b-lg text-sm font-bold transition-colors duration-200"
                >
                    Lihat Semua Produk
                </button>
            </div>
        );
    };

    return (
        <div className="h-full w-full rounded-lg overflow-hidden shadow-lg">
            <MapContainer 
                center={mapCenter} 
                zoom={11} 
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapUpdater 
                    center={selectedPangkalanData ? [selectedPangkalanData.lat, selectedPangkalanData.lng] : mapCenter} 
                    zoom={selectedPangkalanData ? 14 : 11} 
                />
                
                {pangkalans.filter(p => p.latitude && p.longitude).map(pangkalan => (
                    <Marker
                        key={pangkalan.user_id}
                        position={[pangkalan.latitude, pangkalan.longitude]}
                        icon={selectedPangkalan === pangkalan.user_id ? selectedPangkalanIcon : pangkalanIcon}
                        eventHandlers={{
                            click: () => onPangkalanSelect(pangkalan.user_id),
                            mouseover: () => setHoveredPangkalan(pangkalan),
                            mouseout: () => setHoveredPangkalan(null)
                        }}
                    >
                        <Tooltip direction="top" opacity={1} permanent={false} className="custom-tooltip">
                            {renderTooltipContent(pangkalan)}
                        </Tooltip>
                        <Popup maxWidth={350} className="custom-popup">
                            {renderPopupContent(pangkalan)}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default memo(PangkalanMap);