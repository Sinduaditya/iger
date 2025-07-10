'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix untuk ikon default Leaflet yang rusak di Next.js
const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

export default function Map({ locations = [] }) {
  if (locations.length === 0) {
    return (
        <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
            <p className="text-gray-500">Memuat data lokasi...</p>
        </div>
    );
  }

  // Ambil lokasi pertama sebagai pusat peta
  const centerPosition = [locations[0].latitude, locations[0].longitude];

  return (
    <MapContainer center={centerPosition} zoom={10} scrollWheelZoom={true} style={{ height: '100%', width: '100%', borderRadius: '12px' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {locations.map((loc) => (
        <Marker key={loc.$id} position={[loc.latitude, loc.longitude]}>
          <Popup>
            <div className="p-1">
                <h3 className="font-bold text-md">{loc.name}</h3>
                <p className="text-sm text-gray-600">{loc.description}</p>
                <span 
                    className={`mt-2 inline-block text-xs font-semibold px-2 py-1 rounded-full ${
                        loc.type === 'Pasar' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}
                >
                    {loc.type}
                </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}