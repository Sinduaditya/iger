import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

const client = new Client();

// Pastikan environment variables ada
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

if (!endpoint || !projectId) {
    console.error('Missing Appwrite configuration:', { endpoint, projectId });
}

// Inisialisasi client dengan kredensial dari environment variables
client
    .setEndpoint(endpoint || 'https://fra.cloud.appwrite.io/v1')
    .setProject(projectId || '66a312130033c02eaceb');

// Buat instance untuk layanan
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Database dan Collection IDs
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const USER_PROFILES_COLLECTION_ID = process.env.NEXT_PUBLIC_USER_PROFILES_COLLECTION_ID;
const SCAN_RESULTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_SCAN_RESULTS_COLLECTION_ID;
const STORAGE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID;

export const USER_ROLES = {
    USER: 'user',
    PANGKALAN: 'pangkalan' // Konsisten dengan database
};

// Service untuk Authentication dengan Role Management
export const authService = {
    // Check if user is authenticated
    async isAuthenticated() {
        try {
            await account.get();
            return true;
        } catch {
            return false;
        }
    },

    // Register user dengan role
    async register(userData, role = USER_ROLES.USER) {
        try {
            console.log('🚀 Starting registration for:', userData.email, 'as', role);
            
            // Step 1: Buat user di Appwrite Auth
            const user = await account.create(
                ID.unique(), 
                userData.email, 
                userData.password, 
                userData.name
            );
            console.log('✅ User created in Auth:', user.$id);

            // Step 2: Auto login setelah register
            const session = await account.createEmailPasswordSession(userData.email, userData.password);
            console.log('✅ Session created:', session.$id);

            // Step 3: Set role menggunakan updatePrefs
            await account.updatePrefs({ role: role });
            console.log('✅ Role set:', role);

            // Step 4: Simpan profile data tambahan ke database (CRITICAL)
            let profileCreated = false;
            if (DATABASE_ID && USER_PROFILES_COLLECTION_ID) {
                try {
                    await this.createUserProfile(user.$id, userData, role);
                    profileCreated = true;
                    console.log('✅ User profile created in database');
                } catch (profileError) {
                    console.error('❌ Failed to create user profile:', profileError);
                    // Jangan throw error, tapi log untuk debugging
                }
            } else {
                console.warn('⚠️ Database not configured, skipping profile creation');
            }

            console.log('🎉 Registration completed successfully');
            return {
                ...user,
                profileCreated,
                role
            };
        } catch (error) {
            console.error('❌ Register error:', error);
            throw error;
        }
    },

    // Login dengan email dan password
    async login(email, password) {
        try {
            console.log('🔐 Attempting login for:', email);
            const session = await account.createEmailPasswordSession(email, password);
            console.log('✅ Login successful:', session.$id);
            return session;
        } catch (error) {
            console.error('❌ Login error:', error);
            throw error;
        }
    },

    // Logout
    async logout() {
        try {
            await account.deleteSession('current');
            console.log('✅ Logout successful');
            return true;
        } catch (error) {
            console.error('❌ Logout error:', error);
            throw error;
        }
    },

    // Get current user dengan role
    async getCurrentUser() {
        try {
            const user = await account.get();
            console.log('📋 Getting current user:', user.$id, user.email);
            
            // Role tersimpan di prefs
            const role = user.prefs?.role || USER_ROLES.USER;
            console.log('👤 User role:', role);
            
            // Ambil profile data tambahan jika ada database
            let profile = null;
            if (DATABASE_ID && USER_PROFILES_COLLECTION_ID) {
                try {
                    profile = await this.getUserProfile(user.$id);
                    console.log('📊 Profile data:', profile ? 'Found' : 'Not found');
                } catch (profileError) {
                    console.log('⚠️ No profile found, will use auth data only');
                }
            }
            
            return {
                ...user,
                role,
                profile
            };
        } catch (error) {
            console.error('❌ Get current user error:', error);
            return null;
        }
    },

    // Buat profile user di database
    async createUserProfile(userId, userData, role) {
        if (!DATABASE_ID || !USER_PROFILES_COLLECTION_ID) {
            console.log('⚠️ Database not configured, skipping profile creation');
            return null;
        }

        try {
            console.log('📝 Creating user profile for:', userId, 'with role:', role);
            
            // 🔧 FIX: Sesuaikan dengan struktur table yang benar
            const profileData = {
                user_id: userId,
                role: role,
                phone: userData.phone || null,
                address: userData.address || null,
                // 🔧 FIX: Pastikan field pangkalan_name selalu ada
                pangkalan_name: role === USER_ROLES.PANGKALAN ? 
                    (userData.pangkalan_name || userData.name) : 
                    userData.name,
                // Data khusus untuk pangkalan
                ...(role === USER_ROLES.PANGKALAN && {
                    business_license: userData.business_license || userData.businessLicense || null,
                    operating_hours: userData.operating_hours || userData.operatingHours || null,
                    driver_count: userData.driver_count || userData.driverCount || 0
                })
            };

            console.log('📋 Profile data to save:', JSON.stringify(profileData, null, 2));

            const result = await databases.createDocument(
                DATABASE_ID,
                USER_PROFILES_COLLECTION_ID,
                ID.unique(),
                profileData
            );

            console.log('✅ Profile created successfully:', result.$id);
            return result;
        } catch (error) {
            console.error('❌ Error creating user profile:', error);
            console.error('❌ Error details:', {
                code: error.code,
                message: error.message,
                type: error.type
            });
            
            // 🔧 FIX: Log lebih detail untuk debugging
            if (error.code === 404) {
                console.error('❌ Collection not found. Check collection ID:', USER_PROFILES_COLLECTION_ID);
                console.error('❌ Database ID:', DATABASE_ID);
            } else if (error.code === 401) {
                console.error('❌ Unauthorized. Check API permissions');
            } else if (error.code === 400) {
                console.error('❌ Bad request. Check data structure and required fields');
                console.error('❌ Data sent:', profileData);
            }
            
            throw error;
        }
    },

    // Ambil profile user dari database
    async getUserProfile(userId) {
        if (!DATABASE_ID || !USER_PROFILES_COLLECTION_ID) {
            return null;
        }

        try {
            console.log('🔍 Fetching profile for user:', userId);
            
            const result = await databases.listDocuments(
                DATABASE_ID,
                USER_PROFILES_COLLECTION_ID,
                [Query.equal('user_id', userId)]
            );

            const profile = result.documents[0] || null;
            console.log('📊 Profile found:', profile ? 'Yes' : 'No');
            
            return profile;
        } catch (error) {
            console.error('❌ Error fetching user profile:', error);
            return null;
        }
    },

    // Update user profile
    async updateProfile(name) {
        try {
            const user = await account.updateName(name);
            return user;
        } catch (error) {
            console.error('❌ Update profile error:', error);
            throw error;
        }
    },

    // Check role permission
    hasRole(user, requiredRole) {
        return user && user.role === requiredRole;
    },

    // Check if user is pangkalan
    isPangkalan(user) {
        return this.hasRole(user, USER_ROLES.PANGKALAN);
    },

    // Check if user is regular user
    isUser(user) {
        return this.hasRole(user, USER_ROLES.USER);
    }
};

// Helper functions
export const appwriteHelpers = {
    formatError(error) {
        if (error.code === 401) {
            return 'Sesi Anda telah berakhir. Silakan login kembali.';
        } else if (error.code === 404) {
            return 'Data tidak ditemukan. Periksa konfigurasi database.';
        } else if (error.code === 409) {
            return 'Email sudah terdaftar. Silakan gunakan email lain atau login.';
        } else if (error.code === 400) {
            return 'Data yang dikirim tidak valid.';
        } else {
            return error.message || 'Terjadi kesalahan yang tidak diketahui.';
        }
    },

    async isAuthenticated() {
        return await authService.isAuthenticated();
    }
};

// Service untuk Scan Results
export const scanResultsService = {
    // Simpan hasil scan ke database
    async createScanResult(userId, scanData) {
        try {
            const result = await databases.createDocument(
                DATABASE_ID,
                SCAN_RESULTS_COLLECTION_ID,
                ID.unique(),
                {
                    user_id: userId,
                    freshness: scanData.freshness,
                    reason: scanData.reason,
                    latitude: scanData.latitude || null,
                    longitude: scanData.longitude || null,
                    location_address: scanData.location_address || null
                }
            );

            return result;
        } catch (error) {
            console.error('Error creating scan result:', error);
            throw error;
        }
    },

    // Ambil semua hasil scan berdasarkan user
    async getScanResults(userId, limit = 50, offset = 0) {
        try {
            const result = await databases.listDocuments(
                DATABASE_ID,
                SCAN_RESULTS_COLLECTION_ID,
                [
                    Query.equal('user_id', userId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(limit),
                    Query.offset(offset)
                ]
            );
            return result;
        } catch (error) {
            console.error('Error fetching scan results:', error);
            throw error;
        }
    },

    // Ambil satu hasil scan berdasarkan ID
    async getScanResult(documentId) {
        try {
            const result = await databases.getDocument(
                DATABASE_ID,
                SCAN_RESULTS_COLLECTION_ID,
                documentId
            );
            return result;
        } catch (error) {
            console.error('Error fetching scan result:', error);
            throw error;
        }
    },

    // Update hasil scan
    async updateScanResult(documentId, updateData) {
        try {
            const result = await databases.updateDocument(
                DATABASE_ID,
                SCAN_RESULTS_COLLECTION_ID,
                documentId,
                updateData
            );
            return result;
        } catch (error) {
            console.error('Error updating scan result:', error);
            throw error;
        }
    },

    // Hapus hasil scan
    async deleteScanResult(documentId) {
        try {
            await databases.deleteDocument(
                DATABASE_ID,
                SCAN_RESULTS_COLLECTION_ID,
                documentId
            );
            return true;
        } catch (error) {
            console.error('Error deleting scan result:', error);
            throw error;
        }
    },

    // Hapus semua hasil scan user
    async deleteAllUserScanResults(userId) {
        try {
            const results = await this.getScanResults(userId, 100);
            const deletePromises = results.documents.map(doc => 
                this.deleteScanResult(doc.$id)
            );
            await Promise.all(deletePromises);
            return true;
        } catch (error) {
            console.error('Error deleting all scan results:', error);
            throw error;
        }
    },

    // Statistik scan results untuk user
    async getUserScanStats(userId) {
        try {
            const results = await this.getScanResults(userId, 1000); // Ambil semua data untuk statistik
            const documents = results.documents;

            const stats = {
                total: documents.length,
                sangat_segar: documents.filter(doc => doc.freshness === 'Sangat Segar').length,
                cukup_segar: documents.filter(doc => doc.freshness === 'Cukup Segar').length,
                kurang_segar: documents.filter(doc => doc.freshness === 'Kurang Segar').length,
                tidak_segar: documents.filter(doc => doc.freshness === 'Tidak Segar').length,
                this_week: documents.filter(doc => {
                    const scanDate = new Date(doc.$createdAt);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return scanDate >= weekAgo;
                }).length,
                this_month: documents.filter(doc => {
                    const scanDate = new Date(doc.$createdAt);
                    const monthAgo = new Date();
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    return scanDate >= monthAgo;
                }).length
            };

            return stats;
        } catch (error) {
            console.error('Error getting user scan stats:', error);
            throw error;
        }
    }
};

// Service untuk Storage (jika nanti diperlukan untuk upload gambar)
export const storageService = {
    // Upload file
    async uploadFile(file) {
        try {
            const result = await storage.createFile(
                STORAGE_BUCKET_ID,
                ID.unique(),
                file
            );
            return result;
        } catch (error) {
            console.error('Upload file error:', error);
            throw error;
        }
    },

    // Get file URL
    getFileUrl(fileId) {
        try {
            return storage.getFileView(STORAGE_BUCKET_ID, fileId);
        } catch (error) {
            console.error('Get file URL error:', error);
            throw error;
        }
    },

    // Delete file
    async deleteFile(fileId) {
        try {
            await storage.deleteFile(STORAGE_BUCKET_ID, fileId);
            return true;
        } catch (error) {
            console.error('Delete file error:', error);
            throw error;
        }
    }
};

// Ekspor semua yang diperlukan
export { ID, Query };
