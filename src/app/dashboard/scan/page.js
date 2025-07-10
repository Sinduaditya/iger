'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, Fish, BrainCircuit, Loader, AlertCircle, Sparkles, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function ScanPage() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setResult(null);
            setError(null);
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

        } catch (err) {
            setError(err.message);
            toast.error("Analisis Gagal", { description: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setPreview(null);
        setResult(null);
        setError(null);
        setIsLoading(false);
    };
    
    // Fungsi untuk menentukan warna badge berdasarkan hasil
    const getBadgeColor = (freshness) => {
        switch (freshness) {
            case 'Sangat Segar': return 'bg-green-600 hover:bg-green-600';
            case 'Cukup Segar': return 'bg-yellow-500 hover:bg-yellow-500';
            case 'Kurang Segar': return 'bg-orange-500 hover:bg-orange-500';
            case 'Tidak Segar': return 'bg-red-600 hover:bg-red-600';
            default: return 'bg-gray-500 hover:bg-gray-500';
        }
    };


    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BrainCircuit className="h-6 w-6 text-blue-600" />
                        AI Fish Freshness Scan
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!preview && (
                        <div className="text-center p-8 border-2 border-dashed rounded-lg">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Pilih atau Seret Gambar Ikan</h3>
                            <p className="mt-1 text-sm text-gray-500">Gunakan format PNG, JPG, atau WEBP.</p>
                            <Input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
                            <Button asChild className="mt-4">
                                <label htmlFor="file-upload">Pilih Gambar</label>
                            </Button>
                        </div>
                    )}

                    {preview && (
                        <div className="space-y-4">
                            <div className="relative">
                                <img src={preview} alt="Pratinjau Ikan" className="rounded-lg w-full object-contain max-h-80" />
                            </div>

                            {!isLoading && !result && (
                                <div className="flex justify-center gap-4">
                                    <Button onClick={handleAnalyze} size="lg">
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Analisis Kesegaran
                                    </Button>
                                    <Button onClick={() => document.getElementById('file-upload').click()} variant="outline">Ganti Gambar</Button>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {isLoading && (
                         <div className="text-center p-6 bg-blue-50 rounded-lg">
                            <Loader className="mx-auto h-10 w-10 text-blue-500 animate-spin" />
                            <p className="mt-2 font-semibold text-blue-700">AI sedang menganalisis...</p>
                         </div>
                    )}

                    {error && (
                         <div className="text-center p-4 bg-red-50 text-red-700 rounded-lg flex items-center justify-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            <p>{error}</p>
                         </div>
                    )}

                    {result && (
                        <div className="space-y-4 text-center p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-xl font-bold">Hasil Analisis</h3>
                            <Badge className={`text-lg px-4 py-1 text-white ${getBadgeColor(result.freshness)}`}>
                                {result.freshness}
                            </Badge>
                            <div className="flex items-start justify-center gap-2 text-gray-600">
                                <Fish className="h-5 w-5 mt-1 flex-shrink-0" />
                                <p className="italic">"{result.reason}"</p>
                            </div>
                        </div>
                    )}
                    
                    {(result || error) && (
                        <div className="text-center">
                            <Button onClick={handleReset} variant="ghost">
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Scan Gambar Lain
                            </Button>
                        </div>
                    )}

                </CardContent>
            </Card>
        </div>
    );
}