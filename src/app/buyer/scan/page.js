'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, Fish, BrainCircuit, Loader, AlertCircle, Sparkles, RotateCcw, Camera, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { scanResultsService } from '@/lib/appwrite';

export default function ScanPage() {
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [location, setLocation] = useState(null);
    const [gettingLocation, setGettingLocation] = useState(false);
    const fileInputRef = useRef(null);

    // Fungsi untuk mendapatkan lokasi dengan error handling yang lebih baik
    const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation tidak didukung browser ini'));
                return;
            }

            setGettingLocation(true);
            
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    
                    try {
                        // Reverse geocoding untuk mendapatkan alamat
                        const address = await reverseGeocode(latitude, longitude);
                        const locationData = {
                            latitude,
                            longitude,
                            address
                        };
                        
                        setLocation(locationData);
                        setGettingLocation(false);
                        resolve(locationData);
                    } catch (error) {
                        // Tetap simpan koordinat meski gagal mendapatkan alamat
                        const locationData = {
                            latitude,
                            longitude,
                            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
                        };
                        
                        setLocation(locationData);
                        setGettingLocation(false);
                        resolve(locationData);
                    }
                },
                (error) => {
                    setGettingLocation(false);
                    
                    let errorMessage = 'Gagal mendapatkan lokasi';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = "Akses lokasi ditolak. Mohon izinkan akses lokasi di browser.";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = "Informasi lokasi tidak tersedia.";
                            break;
                        case error.TIMEOUT:
                            errorMessage = "Timeout dalam mendapatkan lokasi.";
                            break;
                        default:
                            errorMessage = `Error mendapatkan lokasi: ${error.message || 'Unknown error'}`;
                            break;
                    }
                    
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000, // Increase timeout
                    maximumAge: 600000 // 10 menit
                }
            );
        });
    };

    // Fungsi reverse geocoding sederhana menggunakan Nominatim (OpenStreetMap)
    const reverseGeocode = async (lat, lon) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=16&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'FishScanApp/1.0'
                    }
                }
            );
            
            if (!response.ok) throw new Error('Reverse geocoding failed');
            
            const data = await response.json();
            return data.display_name || `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            // Validasi tipe file
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(selectedFile.type)) {
                toast.error("Format file tidak didukung", { 
                    description: "Gunakan format JPG, PNG, atau WEBP" 
                });
                return;
            }

            // Validasi ukuran file (5MB max)
            if (selectedFile.size > 5 * 1024 * 1024) {
                toast.error("File terlalu besar", { 
                    description: "Maksimal ukuran file 5MB" 
                });
                return;
            }

            setFile(selectedFile);
            setImageLoading(true);
            
            // Menggunakan FileReader untuk preview yang lebih stabil
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target.result);
                setImageLoading(false);
                setResult(null);
                setError(null);
            };
            reader.onerror = () => {
                setImageLoading(false);
                toast.error("Gagal memuat preview gambar");
                setPreview(null);
            };
            reader.readAsDataURL(selectedFile);

            // Otomatis dapatkan lokasi ketika file dipilih
            if (!location) {
                getCurrentLocation().catch(error => {
                    console.error('Location error:', error);
                    toast.error("Informasi Lokasi", { 
                        description: error.message || "Analisis tetap bisa dilakukan tanpa lokasi"
                    });
                });
            }
        }
    };

    const handleAnalyze = async () => {
        if (!file) {
            toast.error("Silakan pilih gambar terlebih dahulu.");
            return;
        }

        setIsLoading(true);
        setResult(null);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Analisis gambar dengan AI
            const response = await fetch('/api/analyze-fish', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Terjadi kesalahan pada server.');
            }

            const data = await response.json();
            setResult(data);
            
            // Simpan hasil scan ke Appwrite (non-blocking)
            saveScanResultToAppwrite(data).catch(error => {
                console.error('Save to Appwrite failed:', error);
                // Don't show error to user, scan result is still valid
            });
            
            toast.success("Analisis berhasil!");

        } catch (err) {
            setError(err.message);
            toast.error("Analisis Gagal", { description: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    // Fungsi untuk menyimpan hasil scan ke Appwrite
    const saveScanResultToAppwrite = async (result) => {
        try {
            if (!user) {
                console.error('User not found, cannot save scan result');
                return;
            }

            const scanData = {
                freshness: result.freshness,
                reason: result.reason,
                latitude: location?.latitude || null,
                longitude: location?.longitude || null,
                location_address: location?.address || null
            };

            await scanResultsService.createScanResult(user.$id, scanData);
            console.log('Scan result saved to Appwrite successfully');
            
            // Show success message only on successful save
            setTimeout(() => {
                toast.success("Hasil scan telah disimpan", { 
                    description: "Data tersimpan di riwayat scan" 
                });
            }, 1000);
            
        } catch (error) {
            console.error('Error saving scan result to Appwrite:', error);
            
            // Show specific error messages
            if (error.code === 401) {
                toast.error("Gagal menyimpan", { 
                    description: "Sesi Anda mungkin telah berakhir. Silakan login kembali." 
                });
            } else if (error.code === 403) {
                toast.error("Gagal menyimpan", { 
                    description: "Tidak memiliki izin untuk menyimpan data." 
                });
            } else {
                toast.error("Gagal menyimpan hasil scan", { 
                    description: "Data mungkin tidak tersimpan di riwayat" 
                });
            }
            
            throw error; // Re-throw for debugging
        }
    };

    const handleReset = () => {
        setFile(null);
        setPreview(null);
        setImageLoading(false);
        setResult(null);
        setError(null);
        setIsLoading(false);
        setLocation(null);
        setGettingLocation(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleImageError = () => {
        console.error('Error loading image preview');
        setImageLoading(false);
        toast.error("Gagal memuat gambar", { 
            description: "Silakan coba dengan gambar lain" 
        });
        setPreview(null);
    };

    const getBadgeColor = (freshness) => {
        switch (freshness) {
            case 'Sangat Segar': return 'bg-emerald-500 hover:bg-emerald-600 text-white';
            case 'Cukup Segar': return 'bg-yellow-500 hover:bg-yellow-600 text-white';
            case 'Kurang Segar': return 'bg-[#F37125] hover:bg-orange-600 text-white';
            case 'Tidak Segar': return 'bg-red-500 hover:bg-red-600 text-white';
            default: return 'bg-gray-500 hover:bg-gray-600 text-white';
        }
    };

    // Manual location trigger function
    const handleGetLocation = async () => {
        try {
            await getCurrentLocation();
            toast.success("Lokasi berhasil didapatkan");
        } catch (error) {
            toast.error("Gagal mendapatkan lokasi", { 
                description: error.message 
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#F4F6F8]">
            {/* Header Section */}
            <div className="bg-[#0D253C] text-white p-6 rounded-b-3xl shadow-lg mb-6">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#125F95] rounded-full mb-4">
                        <Fish className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Scan Kesegaran Ikan</h1>
                    <p className="text-[#F4F6F8] text-sm">
                        Upload foto ikan untuk analisis AI tingkat kesegaran
                    </p>
                </div>
            </div>

            <div className="px-4 pb-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Location Info */}
                    <Card className="border-none shadow-lg bg-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-[#125F95]" />
                                    {gettingLocation ? (
                                        <div className="flex items-center gap-2">
                                            <Loader className="h-4 w-4 animate-spin" />
                                            <span className="text-sm text-gray-600">Mendapatkan lokasi...</span>
                                        </div>
                                    ) : location ? (
                                        <span className="text-sm text-gray-700">{location.address}</span>
                                    ) : (
                                        <span className="text-sm text-gray-500">Lokasi tidak tersedia</span>
                                    )}
                                </div>
                                {!location && !gettingLocation && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={handleGetLocation}
                                        className="text-xs"
                                    >
                                        Dapatkan Lokasi
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Upload Section */}
                    <Card className="border-none shadow-lg bg-white">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-[#0D253C]">
                                <Camera className="h-5 w-5 text-[#125F95]" />
                                Upload Gambar Ikan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!preview && !imageLoading ? (
                                <div className="text-center p-8 border-2 border-dashed border-[#125F95] bg-blue-50 rounded-lg hover:border-[#F37125] transition-colors">
                                    <Upload className="mx-auto h-12 w-12 text-[#125F95] mb-4" />
                                    <h3 className="text-base font-medium text-[#0D253C] mb-2">
                                        Pilih Foto Ikan
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Format: PNG, JPG, WEBP (Max 5MB)
                                    </p>
                                    <Input 
                                        ref={fileInputRef}
                                        id="file-upload" 
                                        type="file" 
                                        className="sr-only" 
                                        onChange={handleFileChange} 
                                        accept="image/png,image/jpeg,image/jpg,image/webp" 
                                    />
                                    <Button asChild className="bg-[#125F95] hover:bg-[#0D253C] text-white">
                                        <label htmlFor="file-upload" className="cursor-pointer">
                                            <Upload className="mr-2 h-4 w-4" />
                                            Pilih Gambar
                                        </label>
                                    </Button>
                                </div>
                            ) : imageLoading ? (
                                <div className="text-center p-8 border border-gray-200 rounded-lg bg-gray-50">
                                    <Loader className="mx-auto h-8 w-8 text-[#125F95] animate-spin mb-4" />
                                    <p className="text-sm text-gray-600">Memuat gambar...</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Preview Container dengan styling yang diperbaiki */}
                                    <div className="w-full border border-gray-200 rounded-lg p-4 bg-white">
                                        <img 
                                            src={preview} 
                                            alt="Pratinjau Ikan" 
                                            className="w-full h-80 object-contain mx-auto block"
                                            onError={handleImageError}
                                            onLoad={() => console.log('Image loaded successfully')}
                                            style={{ 
                                                maxWidth: '100%',
                                                height: '320px',
                                                backgroundColor: '#ffffff'
                                            }}
                                        />
                                    </div>
                                    
                                    <div className="flex gap-3">
                                        <Button 
                                            onClick={() => fileInputRef.current?.click()} 
                                            variant="outline" 
                                            className="flex-1 border-[#125F95] text-[#125F95] hover:bg-[#125F95] hover:text-white"
                                        >
                                            <Upload className="mr-2 h-4 w-4" />
                                            Ganti Gambar
                                        </Button>
                                        
                                        {!isLoading && !result && (
                                            <Button 
                                                onClick={handleAnalyze} 
                                                className="flex-1 bg-[#F37125] hover:bg-orange-600 text-white"
                                            >
                                                <Sparkles className="mr-2 h-4 w-4" />
                                                Analisis AI
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Results Section */}
                    <Card className="border-none shadow-lg bg-white">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-[#0D253C]">
                                <BrainCircuit className="h-5 w-5 text-[#125F95]" />
                                Hasil Analisis AI
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!preview && !imageLoading && (
                                <div className="text-center p-8 text-gray-500">
                                    <Fish className="mx-auto h-20 w-20 text-gray-300 mb-4" />
                                    <p className="text-base">
                                        Upload gambar ikan untuk melihat hasil analisis
                                    </p>
                                </div>
                            )}

                            {isLoading && (
                                <div className="text-center p-8 bg-gradient-to-br from-[#F4F6F8] to-blue-50 rounded-lg border border-[#125F95]">
                                    <Loader className="mx-auto h-12 w-12 text-[#125F95] animate-spin mb-4" />
                                    <p className="font-semibold text-[#0D253C] text-base mb-2">
                                        AI sedang menganalisis ikan...
                                    </p>
                                    <p className="text-[#125F95] text-sm">
                                        Mohon tunggu beberapa saat
                                    </p>
                                </div>
                            )}

                            {error && (
                                <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                        <h4 className="font-semibold">Terjadi Kesalahan</h4>
                                    </div>
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}

                            {result && (
                                <div className="space-y-6">
                                    <div className="text-center p-8 bg-gradient-to-br from-[#F4F6F8] to-gray-100 rounded-lg border border-gray-200">
                                        <h3 className="text-xl font-bold mb-4 text-[#0D253C]">
                                            Hasil Analisis Kesegaran
                                        </h3>
                                        
                                        <Badge className={`text-lg px-6 py-3 font-semibold rounded-full ${getBadgeColor(result.freshness)}`}>
                                            {result.freshness}
                                        </Badge>
                                        
                                        <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                                            <div className="flex items-start gap-3 text-gray-700">
                                                <Fish className="h-5 w-5 mt-1 flex-shrink-0 text-[#125F95]" />
                                                <div className="text-left">
                                                    <p className="font-medium text-sm text-gray-500 mb-1">Penjelasan AI:</p>
                                                    <p className="italic text-base text-[#0D253C]">"{result.reason}"</p>
                                                </div>
                                            </div>
                                        </div>

                                        {location && (
                                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                <div className="flex items-start gap-3 text-blue-700">
                                                    <MapPin className="h-5 w-5 mt-1 flex-shrink-0" />
                                                    <div className="text-left">
                                                        <p className="font-medium text-sm text-blue-600 mb-1">Lokasi Scan:</p>
                                                        <p className="text-sm">{location.address}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            {(result || error) && preview && (
                                <div className="text-center pt-4 border-t border-gray-200">
                                    <Button 
                                        onClick={handleReset} 
                                        variant="ghost" 
                                        className="text-[#125F95] hover:text-[#0D253C] hover:bg-blue-50"
                                    >
                                        <RotateCcw className="mr-2 h-4 w-4" />
                                        Scan Gambar Lain
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}