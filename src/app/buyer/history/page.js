'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Fish, Calendar, Search, Trash2, Loader, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { scanResultsService } from '@/lib/appwrite';
import { toast } from 'sonner';

export default function HistoryPage() {
    const { user } = useAuth();
    const [scanHistory, setScanHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (user) {
            loadScanHistory();
        }
    }, [user]);

    useEffect(() => {
        filterHistory();
    }, [scanHistory, searchTerm, selectedFilter]);

    const loadScanHistory = async () => {
        try {
            setLoading(true);
            const response = await scanResultsService.getScanResults(user.$id);
            setScanHistory(response.documents);
        } catch (error) {
            console.error('Error loading scan history:', error);
            toast.error("Gagal memuat riwayat scan");
        } finally {
            setLoading(false);
        }
    };

    const filterHistory = () => {
        let filtered = scanHistory;

        // Filter berdasarkan pencarian
        if (searchTerm) {
            filtered = filtered.filter(item => 
                item.freshness.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.location_address && item.location_address.toLowerCase().includes(searchTerm.toLowerCase())) ||
                new Date(item.$createdAt).toLocaleDateString('id-ID').includes(searchTerm)
            );
        }

        // Filter berdasarkan tingkat kesegaran
        if (selectedFilter !== 'all') {
            filtered = filtered.filter(item => 
                item.freshness.toLowerCase().replace(' ', '_') === selectedFilter
            );
        }

        setFilteredHistory(filtered);
    };

    const deleteScanItem = async (documentId) => {
        try {
            setDeleting(true);
            await scanResultsService.deleteScanResult(documentId);
            
            // Update local state
            const updatedHistory = scanHistory.filter(item => item.$id !== documentId);
            setScanHistory(updatedHistory);
            
            toast.success("Item berhasil dihapus");
        } catch (error) {
            console.error('Error deleting scan item:', error);
            toast.error("Gagal menghapus item");
        } finally {
            setDeleting(false);
        }
    };

    const clearAllHistory = async () => {
        if (!confirm('Apakah Anda yakin ingin menghapus semua riwayat scan?')) {
            return;
        }

        try {
            setDeleting(true);
            await scanResultsService.deleteAllUserScanResults(user.$id);
            setScanHistory([]);
            toast.success("Semua riwayat berhasil dihapus");
        } catch (error) {
            console.error('Error clearing all history:', error);
            toast.error("Gagal menghapus semua riwayat");
        } finally {
            setDeleting(false);
        }
    };

    const getBadgeColor = (freshness) => {
        switch (freshness) {
            case 'Sangat Segar': return 'bg-emerald-500 text-white';
            case 'Cukup Segar': return 'bg-yellow-500 text-white';
            case 'Kurang Segar': return 'bg-[#F37125] text-white';
            case 'Tidak Segar': return 'bg-red-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filterOptions = [
        { value: 'all', label: 'Semua Hasil' },
        { value: 'sangat_segar', label: 'Sangat Segar' },
        { value: 'cukup_segar', label: 'Cukup Segar' },
        { value: 'kurang_segar', label: 'Kurang Segar' },
        { value: 'tidak_segar', label: 'Tidak Segar' }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F4F6F8] flex items-center justify-center">
                <div className="text-center">
                    <Loader className="mx-auto h-12 w-12 text-[#125F95] animate-spin mb-4" />
                    <p className="text-[#0D253C]">Memuat riwayat scan...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4F6F8]">
            {/* Header Section */}
            <div className="bg-[#0D253C] text-white p-6 rounded-b-3xl shadow-lg mb-6">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#125F95] rounded-full mb-4">
                        <Fish className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Riwayat Scan Ikan</h1>
                    <p className="text-[#F4F6F8] text-sm">
                        Lihat hasil analisis ikan yang pernah Anda lakukan
                    </p>
                </div>
            </div>

            <div className="px-4 pb-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Search and Filter Section */}
                    <Card className="border-none shadow-lg bg-white">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Search Input */}
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input 
                                        placeholder="Cari hasil scan..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 border-[#125F95] focus:ring-[#125F95]"
                                    />
                                </div>

                                {/* Filter Dropdown */}
                                <select 
                                    value={selectedFilter}
                                    onChange={(e) => setSelectedFilter(e.target.value)}
                                    className="px-4 py-2 border border-[#125F95] rounded-md focus:ring-[#125F95] focus:border-[#125F95]"
                                >
                                    {filterOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>

                                {/* Clear All Button */}
                                {scanHistory.length > 0 && (
                                    <Button 
                                        onClick={clearAllHistory}
                                        disabled={deleting}
                                        variant="outline"
                                        className="border-red-500 text-red-500 hover:bg-red-50"
                                    >
                                        {deleting ? (
                                            <Loader className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4 mr-2" />
                                        )}
                                        Hapus Semua
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="border-none shadow-md bg-white">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-[#0D253C]">{scanHistory.length}</div>
                                <div className="text-sm text-gray-600">Total Scan</div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-md bg-white">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-emerald-600">
                                    {scanHistory.filter(item => item.freshness === 'Sangat Segar').length}
                                </div>
                                <div className="text-sm text-gray-600">Sangat Segar</div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-md bg-white">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {scanHistory.filter(item => item.freshness === 'Cukup Segar').length}
                                </div>
                                <div className="text-sm text-gray-600">Cukup Segar</div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-md bg-white">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-red-600">
                                    {scanHistory.filter(item => ['Kurang Segar', 'Tidak Segar'].includes(item.freshness)).length}
                                </div>
                                <div className="text-sm text-gray-600">Kurang Segar</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* History List */}
                    {filteredHistory.length === 0 ? (
                        <Card className="border-none shadow-lg bg-white">
                            <CardContent className="p-12 text-center">
                                <Fish className="mx-auto h-20 w-20 text-gray-300 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                                    {scanHistory.length === 0 ? 'Belum Ada Riwayat Scan' : 'Tidak Ada Hasil Pencarian'}
                                </h3>
                                <p className="text-gray-500">
                                    {scanHistory.length === 0 
                                        ? 'Mulai scan ikan untuk melihat riwayat di sini'
                                        : 'Coba ubah kata kunci pencarian atau filter'
                                    }
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {filteredHistory.map((item) => (
                                <Card key={item.$id} className="border-none shadow-lg bg-white hover:shadow-xl transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col gap-4">
                                            {/* Header dengan badge dan tanggal */}
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                <Badge className={`${getBadgeColor(item.freshness)} w-fit`}>
                                                    {item.freshness}
                                                </Badge>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    {formatDate(item.$createdAt)}
                                                </div>
                                            </div>

                                            {/* Reason */}
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <p className="text-gray-700 italic">"{item.reason}"</p>
                                            </div>

                                            {/* Location */}
                                            {item.location_address && (
                                                <div className="flex items-start gap-2 text-sm text-gray-600">
                                                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                    <span>{item.location_address}</span>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex justify-end">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => deleteScanItem(item.$id)}
                                                    disabled={deleting}
                                                    className="border-red-500 text-red-500 hover:bg-red-50"
                                                >
                                                    {deleting ? (
                                                        <Loader className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}   