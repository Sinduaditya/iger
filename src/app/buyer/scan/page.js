'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, Fish, BrainCircuit, Loader, AlertCircle, Sparkles, RotateCcw, Camera, MapPin, CheckCircle2, Zap, TrendingUp, BarChart3 } from 'lucide-react';
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
                    timeout: 15000,
                    maximumAge: 600000
                }
            );
        });
    };

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
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(selectedFile.type)) {
                toast.error("Format file tidak didukung", { 
                    description: "Gunakan format JPG, PNG, atau WEBP" 
                });
                return;
            }

            if (selectedFile.size > 5 * 1024 * 1024) {
                toast.error("File terlalu besar", { 
                    description: "Maksimal ukuran file 5MB" 
                });
                return;
            }

            setFile(selectedFile);
            setImageLoading(true);
            
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
            console.log('🚀 Starting analysis with AI model...');
        
            const response = await fetch('/api/analyze-fish', {
                method: 'POST',
                body: formData,
            });
        
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Terjadi kesalahan pada server.');
            }
        
            const data = await response.json();
            // console.log('✅ Analysis result:', data);
        
            // Isi freshness dari prediction
            const resultData = {
                ...data,
                freshness: data.prediction // Fresh/Tidak Fresh
            };
            setResult(resultData);
        
            saveScanResultToAppwrite(resultData).catch(error => {
                console.error('Save to Appwrite failed:', error);
            });
        
            toast.success("Analisis berhasil!", { 
                description: `Confidence: ${data.confidencePercent}%` 
            });
        
        } catch (err) {
            console.error('❌ Analysis error:', err);
            setError(err.message);
            toast.error("Analisis Gagal", { description: err.message });
        } finally {
            setIsLoading(false);
        }
    };


    const saveScanResultToAppwrite = async (result) => {
        try {
            if (!user) {
                console.error('User not found, cannot save scan result');
                return;
            }

            const scanData = {
                freshness: result.freshness,
                reason: result.reason,
                confidence: result.confidence,
                confidence_percent: result.confidencePercent,
                prediction: result.prediction,
                model_source: result.model_source || 'huggingface',
                latitude: location?.latitude || null,
                longitude: location?.longitude || null,
                location_address: location?.address || null
            };

            await scanResultsService.createScanResult(user.$id, scanData);
            console.log('✅ Scan result saved to Appwrite successfully');
            
            setTimeout(() => {
                toast.success("Hasil scan telah disimpan", { 
                    description: "Data tersimpan di riwayat scan" 
                });
            }, 1000);
            
        } catch (error) {
            console.error('❌ Error saving scan result to Appwrite:', error);
            
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
            
            throw error;
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
        return 'bg-gray-200 text-gray-900 border-gray-300';
    };

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

    const getConfidenceColor = (confidence) => {
        const confidencePercent = parseFloat(confidence);
        if (confidencePercent >= 90) return 'text-green-600';
        if (confidencePercent >= 70) return 'text-yellow-600';
        if (confidencePercent >= 50) return 'text-orange-600';
        return 'text-red-600';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Clean Header with AI Model Info */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-4xl mx-auto px-6 py-12">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-600 rounded-xl shadow-lg mb-6">
                            <Fish className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            AI Fish Scanner
                        </h1>
                        <p className="text-xl text-gray-600 mb-6">
                            Teknologi Deep Learning untuk analisis kesegaran ikan yang akurat
                        </p>
                        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full font-medium">
                            <Zap className="w-4 h-4" />
                            Powered by Custom AI Model
                        </div>
                        <div className="flex items-center justify-center gap-8 text-sm text-gray-600 mt-6">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                                <span className="font-medium">Deep Learning</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                                <span className="font-medium">High Accuracy</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                                <span className="font-medium">Real-time</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="space-y-8">
                    {/* Location Card */}
                    <Card className="shadow-lg border-0">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-orange-100 rounded-lg">
                                        <MapPin className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-lg">Lokasi Scan</h3>
                                        {gettingLocation ? (
                                            <div className="flex items-center gap-2">
                                                <Loader className="h-4 w-4 animate-spin text-orange-600" />
                                                <span className="text-gray-600">Mendapatkan lokasi...</span>
                                            </div>
                                        ) : location ? (
                                            <p className="text-gray-600 max-w-md">{location.address}</p>
                                        ) : (
                                            <p className="text-gray-500">Lokasi tidak tersedia</p>
                                        )}
                                    </div>
                                </div>
                                {!location && !gettingLocation && (
                                    <Button
                                        onClick={handleGetLocation}
                                        className="bg-orange-600 hover:bg-orange-700 text-white"
                                    >
                                        Dapatkan Lokasi
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Upload Section */}
                        <Card className="shadow-lg border-0">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-3 text-gray-900 text-xl">
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                        <Camera className="h-6 w-6 text-orange-600" />
                                    </div>
                                    Upload Gambar Ikan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {!preview && !imageLoading ? (
                                    <div className="relative">
                                        <div className="text-center p-12 border-2 border-dashed border-orange-300 bg-orange-50 rounded-xl hover:border-orange-500 transition-colors">
                                            <Upload className="mx-auto h-16 w-16 text-orange-600 mb-6" />
                                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                                Pilih Foto Ikan
                                            </h3>
                                            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                                                Upload foto ikan untuk analisis AI. Pastikan gambar jelas dan fokus pada ikan.
                                            </p>
                                            <div className="text-sm text-gray-500 mb-6">
                                                Format: PNG, JPG, WEBP • Maksimal 5MB
                                            </div>
                                            <Input 
                                                ref={fileInputRef}
                                                id="file-upload" 
                                                type="file" 
                                                className="sr-only" 
                                                onChange={handleFileChange} 
                                                accept="image/png,image/jpeg,image/jpg,image/webp" 
                                            />
                                            <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white">
                                                <label htmlFor="file-upload" className="cursor-pointer">
                                                    <Camera className="mr-2 h-5 w-5" />
                                                    Pilih Gambar
                                                </label>
                                            </Button>
                                        </div>
                                    </div>
                                ) : imageLoading ? (
                                    <div className="text-center p-12 border border-gray-200 rounded-xl bg-gray-50">
                                        <Loader className="mx-auto h-12 w-12 text-orange-600 animate-spin mb-4" />
                                        <p className="text-gray-600 font-medium">Memuat gambar...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="relative overflow-hidden rounded-xl bg-white shadow-md border">
                                            <img 
                                                src={preview} 
                                                alt="Pratinjau Ikan" 
                                                className="w-full h-80 object-contain"
                                                onError={handleImageError}
                                                style={{ backgroundColor: '#f8fafc' }}
                                            />
                                        </div>
                                        
                                        <div className="flex gap-3">
                                            
                                            
                                            {!isLoading && !result && (
                                                <Button 
                                                    onClick={handleAnalyze} 
                                                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
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
                        <Card className="shadow-lg border-0">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-3 text-gray-900 text-xl">
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                        <BrainCircuit className="h-6 w-6 text-orange-600" />
                                    </div>
                                    Hasil Analisis AI
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {!preview && !imageLoading && (
                                    <div className="text-center p-12">
                                        <Fish className="mx-auto h-20 w-20 text-gray-400 mb-6" />
                                        <h3 className="text-lg font-semibold text-gray-600 mb-2">
                                            Siap untuk Analisis
                                        </h3>
                                        <p className="text-gray-500">
                                            Upload gambar ikan untuk melihat hasil analisis AI
                                        </p>
                                    </div>
                                )}

                                {isLoading && (
                                    <div className="text-center p-12 bg-orange-50 rounded-xl border border-orange-200">
                                        <Loader className="mx-auto h-16 w-16 text-orange-600 animate-spin mb-6" />
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                                            AI Model Sedang Menganalisis...
                                        </h3>
                                        <p className="text-orange-600 font-medium">
                                            Deep learning model sedang memproses gambar
                                        </p>
                                        <div className="mt-4 flex justify-center">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                                <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {error && (
                                    <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-red-200 rounded-lg">
                                                <AlertCircle className="h-5 w-5" />
                                            </div>
                                            <h4 className="font-bold text-lg">Terjadi Kesalahan</h4>
                                        </div>
                                        <p className="text-red-600">{error}</p>
                                    </div>
                                )}

                                {result && (
                                    <div className="space-y-6">
                                        <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-200">
                                            <div className="mb-6">
                                                <div className={`inline-flex items-center justify-center w-16 h-16 ${result.freshness === 'Fresh' ? 'bg-green-600' : 'bg-red-600'} rounded-full mb-4`}>
                                                    <CheckCircle2 className="w-8 h-8 text-white" />
                                                </div>
                                                <h3 className="text-2xl font-bold mb-4 text-gray-900">
                                                    Analisis Selesai
                                                </h3>
                                            </div>

                                            {/* Tampilkan Fresh/Tidak Fresh dari prediction */}
                                            <Badge className={`text-xl px-8 py-4 font-bold rounded-lg ${getBadgeColor(result.freshness)}`}>
                                                {result.freshness}
                                            </Badge>

                                            {/* Confidence Score tanpa warna tambahan */}
                                            <div className="mt-6 p-6 bg-white rounded-xl border border-gray-200">
                                                <div className="flex items-center justify-center gap-3 mb-4">
                                                    <div className="p-2 bg-blue-100 rounded-lg">
                                                        <BarChart3 className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <h4 className="font-semibold text-gray-900">Tingkat Keyakinan AI</h4>
                                                </div>
                                                <div className="text-4xl font-bold mb-2">
                                                    {result.confidencePercent}%
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    Model Prediction: <span className="font-medium">{result.prediction}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {(result || error) && preview && (
                                    <div className="text-center pt-6 border-t border-gray-200">
                                        <Button 
                                            onClick={handleReset} 
                                            variant="outline"
                                            className="text-orange-600 border-orange-600 hover:bg-orange-50"
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
        </div>
    );
}