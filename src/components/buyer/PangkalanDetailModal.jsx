'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buyerService } from '@/lib/buyer-services'; // Pastikan path ini benar
import { MapPin, Phone, Clock, Truck, FileText, Loader2, Star } from 'lucide-react';

// Komponen untuk menampilkan item info dengan ikon
const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start">
        <Icon className="w-5 h-5 text-gray-500 mr-4 mt-1 flex-shrink-0" />
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-sm font-medium text-gray-800">{value || '-'}</p>
        </div>
    </div>
);

// Komponen untuk kartu produk
const ProductCard = ({ product }) => (
    <div className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200">
        <h4 className="font-bold text-base text-gray-900">{product.name}</h4>
        <div className="flex items-center justify-between mt-2">
            <p className="text-lg font-semibold text-orange-600">
                Rp {product.price?.toLocaleString()}
                <span className="text-sm font-normal text-gray-500">/{product.unit}</span>
            </p>
            <Badge variant={product.stock > 0 ? "default" : "destructive"} className={product.stock > 10 ? 'bg-green-600' : product.stock > 0 ? 'bg-yellow-500' : ''}>
                Stok: {product.stock}
            </Badge>
        </div>
        {product.freshness_level && (
             <div className="text-xs mt-2 inline-flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500" />
                <span>{product.freshness_level}</span>
            </div>
        )}
    </div>
);

export const PangkalanDetailModal = ({ isOpen, onClose, pangkalanData }) => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchAllProducts = async () => {
            if (!pangkalanData) return;
            
            setIsLoading(true);
            try {
                // Ambil semua produk tanpa batas limit
                const response = await buyerService.getProductsByPangkalan(pangkalanData.user_id);
                setProducts(response.documents || []);
            } catch (error) {
                console.error("Failed to fetch all products:", error);
                setProducts([]);
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen) {
            fetchAllProducts();
        }
    }, [isOpen, pangkalanData]);

    if (!pangkalanData) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-4">
                    <DialogTitle className="text-2xl font-bold text-gray-900">{pangkalanData.pangkalan_name}</DialogTitle>
                    <DialogDescription>Informasi lengkap dan produk yang tersedia dari pangkalan ini.</DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-6 flex-grow overflow-y-auto px-6 pb-6">
                    {/* Detail Pangkalan di atas */}
                    <div className="space-y-5 border-b pb-4 mb-4">
                        <h3 className="text-lg font-semibold">Detail Pangkalan</h3>
                        <InfoItem icon={MapPin} label="Alamat" value={pangkalanData.address} />
                        <InfoItem icon={Phone} label="Telepon" value={pangkalanData.phone} />
                        <InfoItem icon={Clock} label="Jam Operasional" value={pangkalanData.operating_hours} />
                        <InfoItem icon={FileText} label="Izin Usaha" value={pangkalanData.business_license} />
                        <InfoItem icon={Truck} label="Jumlah Driver" value={pangkalanData.driver_count} />
                    </div>

                    {/* Daftar Produk di bawah */}
                    <div>
                        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Daftar Produk</h3>
                        {isLoading ? (
                            <div className="flex items-center justify-center h-48">
                                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                            </div>
                        ) : products.length > 0 ? (
                            <div className="space-y-4">
                                {products.map(product => (
                                    <ProductCard key={product.$id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic text-center mt-10">
                                Pangkalan ini belum memiliki produk.
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter className="p-4 border-t bg-gray-50">
                    <Button variant="outline" onClick={onClose}>Tutup</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};