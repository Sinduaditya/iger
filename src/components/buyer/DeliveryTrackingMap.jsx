'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for marker icons in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const driverIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3B82F6" width="32" height="32">
            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
        </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

const destinationIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#EF4444" width="32" height="32">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

const DeliveryTrackingMap = ({ order, deliveryAddress }) => {
    const [driverLocation, setDriverLocation] = useState(null);
    const [destinationLocation, setDestinationLocation] = useState(null);
    const [mapCenter, setMapCenter] = useState([-6.2088, 106.8456]); // Default Jakarta

    useEffect(() => {
        // Simulate driver location (in real app, this would come from GPS tracking)
        const simulateDriverLocation = () => {
            // Random location around Jakarta for demo
            const lat = -6.2088 + (Math.random() - 0.5) * 0.1;
            const lng = 106.8456 + (Math.random() - 0.5) * 0.1;
            setDriverLocation([lat, lng]);
        };

        // Simulate destination geocoding
        const simulateDestinationLocation = () => {
            // Random destination around Jakarta for demo
            const lat = -6.2088 + (Math.random() - 0.5) * 0.1;
            const lng = 106.8456 + (Math.random() - 0.5) * 0.1;
            setDestinationLocation([lat, lng]);
        };

        simulateDriverLocation();
        simulateDestinationLocation();

        // Update driver location every 10 seconds for demo
        const interval = setInterval(simulateDriverLocation, 10000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Set map center based on driver and destination
        if (driverLocation && destinationLocation) {
            const centerLat = (driverLocation[0] + destinationLocation[0]) / 2;
            const centerLng = (driverLocation[1] + destinationLocation[1]) / 2;
            setMapCenter([centerLat, centerLng]);
        }
    }, [driverLocation, destinationLocation]);

    const estimatedArrival = () => {
        if (!driverLocation || !destinationLocation) return "Menghitung...";
        
        // Simple distance calculation for demo
        const distance = Math.sqrt(
            Math.pow(driverLocation[0] - destinationLocation[0], 2) + 
            Math.pow(driverLocation[1] - destinationLocation[1], 2)
        );
        
        const estimatedMinutes = Math.round(distance * 1000); // Rough estimation
        return `${Math.max(5, estimatedMinutes)} menit`;
    };

    return (
        <div className="h-full w-full rounded-lg overflow-hidden relative">
            {/* Status overlay */}
            <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-3 border border-gray-200">
                <div className="text-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="font-medium text-gray-900">Driver dalam perjalanan</span>
                    </div>
                    <p className="text-gray-600">Estimasi tiba: {estimatedArrival()}</p>
                </div>
            </div>

            <MapContainer 
                center={mapCenter} 
                zoom={13} 
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Driver location */}
                {driverLocation && (
                    <Marker position={driverLocation} icon={driverIcon}>
                        <Popup>
                            <div className="p-2">
                                <h4 className="font-bold text-blue-600 mb-2">🚗 Lokasi Driver</h4>
                                <div className="space-y-1 text-sm">
                                    {order.driver && (
                                        <>
                                            <p><strong>Nama:</strong> {order.driver.name}</p>
                                            <p><strong>Kendaraan:</strong> {order.driver.vehicle_type} ({order.driver.vehicle_number})</p>
                                        </>
                                    )}
                                    <p className="text-green-600 font-medium">Sedang dalam perjalanan menuju Anda</p>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Destination location */}
                {destinationLocation && (
                    <Marker position={destinationLocation} icon={destinationIcon}>
                        <Popup>
                            <div className="p-2">
                                <h4 className="font-bold text-red-600 mb-2">🏠 Alamat Tujuan</h4>
                                <div className="space-y-1 text-sm">
                                    <p><strong>Penerima:</strong> {order.buyer_name}</p>
                                    <p><strong>Alamat:</strong> {deliveryAddress}</p>
                                    {order.delivery_notes && (
                                        <p><strong>Catatan:</strong> {order.delivery_notes}</p>
                                    )}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Route line */}
                {driverLocation && destinationLocation && (
                    <Polyline 
                        positions={[driverLocation, destinationLocation]}
                        color="#3B82F6"
                        weight={3}
                        opacity={0.7}
                        dashArray="10, 10"
                    />
                )}
            </MapContainer>
        </div>
    );
};

export default DeliveryTrackingMap;