export const geocodingUtils = {
    // Reverse geocoding: koordinat ke alamat
    async reverseGeocode(latitude, longitude) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'IGER-App/1.0'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Geocoding request failed');
            }

            const data = await response.json();
            
            if (data && data.display_name) {
                // Format alamat yang lebih user-friendly
                const address = this.formatAddress(data);
                return {
                    full_address: data.display_name,
                    formatted_address: address,
                    city: data.address?.city || data.address?.town || data.address?.village || '',
                    district: data.address?.suburb || data.address?.neighbourhood || '',
                    province: data.address?.state || '',
                    country: data.address?.country || '',
                    postcode: data.address?.postcode || ''
                };
            } else {
                throw new Error('No address found for coordinates');
            }
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return {
                full_address: `${latitude}, ${longitude}`,
                formatted_address: `Lat: ${latitude}, Lng: ${longitude}`,
                city: '',
                district: '',
                province: '',
                country: '',
                postcode: ''
            };
        }
    },

    // Forward geocoding: alamat ke koordinat
    async forwardGeocode(address) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'IGER-App/1.0'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Search request failed');
            }

            const data = await response.json();
            
            if (data && data.length > 0) {
                return data.map(item => ({
                    latitude: parseFloat(item.lat),
                    longitude: parseFloat(item.lon),
                    display_name: item.display_name,
                    formatted_address: this.formatAddress(item)
                }));
            } else {
                return [];
            }
        } catch (error) {
            console.error('Forward geocoding error:', error);
            return [];
        }
    },

    // Format alamat agar lebih readable
    formatAddress(data) {
        if (!data.address) return data.display_name;

        const parts = [];
        
        // Tambahkan jalan/lokasi spesifik
        if (data.address.road) {
            parts.push(data.address.road);
        } else if (data.address.neighbourhood) {
            parts.push(data.address.neighbourhood);
        }

        // Tambahkan area/kelurahan
        if (data.address.suburb || data.address.village) {
            parts.push(data.address.suburb || data.address.village);
        }

        // Tambahkan kota
        if (data.address.city || data.address.town) {
            parts.push(data.address.city || data.address.town);
        }

        // Tambahkan provinsi
        if (data.address.state) {
            parts.push(data.address.state);
        }

        return parts.join(', ') || data.display_name;
    },

    // Validasi koordinat
    isValidCoordinate(lat, lng) {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        
        return !isNaN(latitude) && 
               !isNaN(longitude) && 
               latitude >= -90 && 
               latitude <= 90 && 
               longitude >= -180 && 
               longitude <= 180;
    }
};