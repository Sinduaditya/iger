'use client';

import { useState, useEffect } from 'react';
import { Databases, Query } from 'appwrite';
import { account } from '@/lib/appwrite'; // Gunakan client yang sudah dibuat
import dynamic from 'next/dynamic';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Fish, Store, MapPinned } from 'lucide-react';
import { toast } from 'sonner';

// Muat komponen Map secara dinamis hanya di sisi client
const Map = dynamic(() => import('@/components/shared/Map'), { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg"><p>Memuat Peta...</p></div>
});

const client = account.client;
const databases = new Databases(client);

export default function MapPage() {
    const [locations, setLocations] = useState([]);
    const [filteredLocations, setFilteredLocations] = useState([]);
    const [filter, setFilter] = useState('Semua');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLocations() {
            try {
                const response = await databases.listDocuments( 
                    '685e9c54000491e13998', // GANTI DENGAN DATABASE ID ANDA
                    'locations' // COLLECTION ID
                );
                setLocations(response.documents);
                setFilteredLocations(response.documents);
            } catch (error) {
                console.error("Gagal mengambil data lokasi:", error);
                toast.error("Gagal memuat data lokasi.");
            } finally {
                setLoading(false);
            }
        }
        fetchLocations();
    }, []);

    useEffect(() => {
        if (filter === 'Semua') {
            setFilteredLocations(locations);
        } else {
            setFilteredLocations(locations.filter(loc => loc.type === filter));
        }
    }, [filter, locations]);

    return (
        <div className="relative h-[calc(100vh-8rem)] w-full p-4">
             <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000] bg-white p-1.5 rounded-lg shadow-lg">
                <ToggleGroup type="single" defaultValue="Semua" value={filter} onValueChange={(value) => value && setFilter(value)}>
                    <ToggleGroupItem value="Semua" aria-label="Toggle Semua">
                        <MapPinned className="h-4 w-4 mr-2" /> Semua
                    </ToggleGroupItem>
                    <ToggleGroupItem value="Pasar" aria-label="Toggle Pasar">
                        <Store className="h-4 w-4 mr-2" /> Pasar
                    </ToggleGroupItem>
                    <ToggleGroupItem value="Nelayan" aria-label="Toggle Nelayan">
                        <Fish className="h-4 w-4 mr-2" /> Nelayan
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>
            
            {loading ? (
                <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
                    <p className="text-gray-500">Mengambil data dari Appwrite...</p>
                </div>
            ) : (
                <Map locations={filteredLocations} />
            )}
        </div>
    );
}