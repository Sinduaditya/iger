'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Fish, Calendar, Search, Trash2, Loader, MapPin, Filter, BarChart3, TrendingUp, Archive, CheckCircle2 } from 'lucide-react';
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

        if (searchTerm) {
            filtered = filtered.filter(item => 
                item.freshness.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.location_address && item.location_address.toLowerCase().includes(searchTerm.toLowerCase())) ||
                new Date(item.$createdAt).toLocaleDateString('id-ID').includes(searchTerm)
            );
        }

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
            case 'Sangat Segar': 
                return 'bg-green-600 text-white border-green-600';
            case 'Cukup Segar': 
                return 'bg-yellow-500 text-white border-yellow-500';
            case 'Kurang Segar': 
                return 'bg-orange-600 text-white border-orange-600';
            case 'Tidak Segar': 
                return 'bg-red-600 text-white border-red-600';
            default: 
                return 'bg-gray-600 text-white border-gray-600';
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
        { value: 'all', label: 'Semua Hasil', icon: Archive },
        { value: 'sangat_segar', label: 'Sangat Segar', icon: CheckCircle2 },
        { value: 'cukup_segar', label: 'Cukup Segar', icon: TrendingUp },
        { value: 'kurang_segar', label: 'Kurang Segar', icon: BarChart3 },
        { value: 'tidak_segar', label: 'Tidak Segar', icon: Archive }
    ];

    // Statistics calculation
    const stats = {
        total: scanHistory.length,
        sangatSegar: scanHistory.filter(item => item.freshness === 'Sangat Segar').length,
        cukupSegar: scanHistory.filter(item => item.freshness === 'Cukup Segar').length,
        kurangSegar: scanHistory.filter(item => ['Kurang Segar', 'Tidak Segar'].includes(item.freshness)).length
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="mx-auto h-16 w-16 text-orange-600 animate-spin mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Memuat Riwayat</h3>
                    <p className="text-gray-600">Mengambil data scan Anda...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Clean Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-6xl mx-auto px-6 py-12">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-600 rounded-xl shadow-lg mb-6">
                            <Archive className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Riwayat Scan Ikan
                        </h1>
                        <p className="text-xl text-gray-600">
                            Lihat semua hasil analisis AI yang pernah Anda lakukan
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="space-y-8">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="shadow-lg border-0 bg-orange-600 text-white">
                            <CardContent className="p-6 text-center">
                                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-4 mx-auto">
                                    <BarChart3 className="w-6 h-6" />
                                </div>
                                <div className="text-3xl font-bold">{stats.total}</div>
                                <div className="text-orange-100 font-medium">Total Scan</div>
                            </CardContent>
                        </Card>
                        <Card className="shadow-lg border-0 bg-green-600 text-white">
                            <CardContent className="p-6 text-center">
                                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-4 mx-auto">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div className="text-3xl font-bold">{stats.sangatSegar}</div>
                                <div className="text-green-100 font-medium">Sangat Segar</div>
                            </CardContent>
                        </Card>
                        <Card className="shadow-lg border-0 bg-yellow-500 text-white">
                            <CardContent className="p-6 text-center">
                                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-4 mx-auto">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div className="text-3xl font-bold">{stats.cukupSegar}</div>
                                <div className="text-yellow-100 font-medium">Cukup Segar</div>
                            </CardContent>
                        </Card>
                        <Card className="shadow-lg border-0 bg-red-600 text-white">
                            <CardContent className="p-6 text-center">
                                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-lg mb-4 mx-auto">
                                    <Archive className="w-6 h-6" />
                                </div>
                                <div className="text-3xl font-bold">{stats.kurangSegar}</div>
                                <div className="text-red-100 font-medium">Kurang Segar</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Search and Filter Section */}
                    <Card className="shadow-lg border-0">
                        <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row gap-4">
                                {/* Search Input */}
                                <div className="flex-1 relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <Input 
                                        placeholder="Cari hasil scan, lokasi, atau tanggal..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-12 h-12 border-2 border-gray-200 focus:border-orange-500 rounded-lg bg-white"
                                    />
                                </div>

                                {/* Filter Dropdown */}
                                <div className="relative">
                                    <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
                                    <select 
                                        value={selectedFilter}
                                        onChange={(e) => setSelectedFilter(e.target.value)}
                                        className="pl-12 pr-8 py-3 h-12 border-2 border-gray-200 rounded-lg focus:border-orange-500 bg-white appearance-none cursor-pointer min-w-[180px]"
                                    >
                                        {filterOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Clear All Button */}
                                {scanHistory.length > 0 && (
                                    <Button 
                                        onClick={clearAllHistory}
                                        disabled={deleting}
                                        className="h-12 px-6 bg-red-600 hover:bg-red-700 text-white"
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

                    {/* History List */}
                    {filteredHistory.length === 0 ? (
                        <Card className="shadow-lg border-0">
                            <CardContent className="p-16 text-center">
                                <Fish className="mx-auto h-24 w-24 text-gray-400 mb-8" />
                                <h3 className="text-2xl font-bold text-gray-600 mb-4">
                                    {scanHistory.length === 0 ? 'Belum Ada Riwayat Scan' : 'Tidak Ada Hasil Pencarian'}
                                </h3>
                                <p className="text-gray-500 text-lg max-w-md mx-auto">
                                    {scanHistory.length === 0 
                                        ? 'Mulai scan ikan untuk melihat riwayat analisis AI di sini'
                                        : 'Coba ubah kata kunci pencarian atau filter untuk menemukan hasil yang Anda cari'
                                    }
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6">
                            {filteredHistory.map((item) => (
                                <Card key={item.$id} className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                                    <CardContent className="p-8">
                                        <div className="flex flex-col gap-6">
                                            {/* Header */}
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-orange-100 rounded-lg">
                                                        <Fish className="w-6 h-6 text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <Badge className={`${getBadgeColor(item.freshness)} text-lg px-4 py-2 font-bold rounded-lg`}>
                                                            {item.freshness}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 text-gray-500">
                                                    <Calendar className="w-5 h-5" />
                                                    <span className="font-medium">{formatDate(item.$createdAt)}</span>
                                                </div>
                                            </div>

                                            {/* Reason */}
                                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-orange-100 rounded-lg mt-1">
                                                        <Fish className="h-4 w-4 text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 mb-2">Analisis AI:</p>
                                                        <p className="text-gray-700 italic leading-relaxed">"{item.reason}"</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Location */}
                                            {item.location_address && (
                                                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-blue-200 rounded-lg mt-1">
                                                            <MapPin className="w-4 h-4 text-blue-700" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-blue-900 mb-1">Lokasi Scan:</p>
                                                            <p className="text-blue-700">{item.location_address}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex justify-end border-t border-gray-200 pt-4">
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => deleteScanItem(item.$id)}
                                                    disabled={deleting}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2"
                                                >
                                                    {deleting ? (
                                                        <Loader className="w-4 h-4 animate-spin mr-2" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                    )}
                                                    Hapus
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