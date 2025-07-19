import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

const client = new Client();

// Pastikan environment variables ada dengan default values
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '66a312130033c02eaceb';

// Log untuk debugging - jangan hapus sampai masalah teratasi
console.log('🔧 Appwrite Configuration:', {
    endpoint: endpoint,
    projectId: projectId,
    hasEndpoint: !!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
    hasProjectId: !!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
});

if (!endpoint || !projectId) {
    console.error('❌ Missing Appwrite configuration:', { endpoint, projectId });
    console.error('❌ Environment check:', {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_APPWRITE_ENDPOINT: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
        NEXT_PUBLIC_APPWRITE_PROJECT_ID: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
    });
}

// Inisialisasi client
client
    .setEndpoint(endpoint)
    .setProject(projectId);

// Buat instance untuk layanan
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Database dan Collection IDs dengan fallback
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '685e9c54000491e13998';
const USER_PROFILES_COLLECTION_ID = process.env.NEXT_PUBLIC_USER_PROFILES_COLLECTION_ID || '68758ae900139830951d';
const SCAN_RESULTS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_SCAN_RESULTS_COLLECTION_ID || '687481df003bce9166b6';
const STORAGE_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID || '686f2d1a002bba22496f';

// Pangkalan specific collection IDs - GANTI dengan ID yang sebenarnya
const PANGKALAN_PRODUCTS_COLLECTION_ID = process.env.NEXT_PUBLIC_PANGKALAN_PRODUCTS_COLLECTION_ID || 'pangkalan_products';
const ORDERS_COLLECTION_ID = process.env.NEXT_PUBLIC_ORDERS_COLLECTION_ID || 'orders';
const ORDER_ITEMS_COLLECTION_ID = process.env.NEXT_PUBLIC_ORDER_ITEMS_COLLECTION_ID || 'order_items';
const DRIVERS_COLLECTION_ID = process.env.NEXT_PUBLIC_DRIVERS_COLLECTION_ID || 'drivers';

export const COLLECTION_IDS = {
    USER_PROFILES: USER_PROFILES_COLLECTION_ID,
    SCAN_RESULTS: SCAN_RESULTS_COLLECTION_ID,
    PANGKALAN_PRODUCTS: PANGKALAN_PRODUCTS_COLLECTION_ID,
    ORDERS: ORDERS_COLLECTION_ID,
    ORDER_ITEMS: ORDER_ITEMS_COLLECTION_ID,
    DRIVERS: DRIVERS_COLLECTION_ID
};

export const USER_ROLES = {
    USER: 'user',
    PANGKALAN: 'pangkalan'
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
            // 🔧 FIX: Jangan redirect di service, biarkan komponen yang handle
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

// [PANGKALAN SERVICES TETAP DI SINI]
export const productsService = {
    // Get all products for pangkalan
    async getProducts(pangkalanId, limit = 50, offset = 0) {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                'pangkalan_products',
                [
                    Query.equal('pangkalan_id', pangkalanId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(limit),
                    Query.offset(offset)
                ]
            );
            return response;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    // Create new product
    async createProduct(pangkalanId, productData) {
        try {
            const response = await databases.createDocument(
                DATABASE_ID,
                'pangkalan_products',
                ID.unique(),
                {
                    pangkalan_id: pangkalanId,
                    ...productData
                }
            );
            return response;
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    },

    // Update product
    async updateProduct(productId, updateData) {
        try {
            const response = await databases.updateDocument(
                DATABASE_ID,
                'pangkalan_products',
                productId,
                updateData
            );
            return response;
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    },

    // Delete product
    async deleteProduct(productId) {
        try {
            await databases.deleteDocument(
                DATABASE_ID,
                'pangkalan_products',
                productId
            );
            return true;
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    },

    // Get product stats
    async getProductStats(pangkalanId) {
        try {
            const [total, available, lowStock] = await Promise.all([
                databases.listDocuments(DATABASE_ID, 'pangkalan_products', [
                    Query.equal('pangkalan_id', pangkalanId),
                    Query.limit(1)
                ]),
                databases.listDocuments(DATABASE_ID, 'pangkalan_products', [
                    Query.equal('pangkalan_id', pangkalanId),
                    Query.equal('is_available', true),
                    Query.limit(1)
                ]),
                databases.listDocuments(DATABASE_ID, 'pangkalan_products', [
                    Query.equal('pangkalan_id', pangkalanId),
                    Query.lessThan('stock', 10),
                    Query.limit(1)
                ])
            ]);

            return {
                total: total.total,
                available: available.total,
                lowStock: lowStock.total,
                unavailable: total.total - available.total
            };
        } catch (error) {
            console.error('Error fetching product stats:', error);
            throw error;
        }
    }
};

// Orders Service (PANGKALAN)
export const ordersService = {
    // Get all orders for pangkalan
    async getOrders(pangkalanId, status = null, limit = 50, offset = 0) {
        try {
            const queries = [
                Query.equal('pangkalan_id', pangkalanId),
                Query.orderDesc('order_date'),
                Query.limit(limit),
                Query.offset(offset)
            ];

            if (status) {
                queries.push(Query.equal('status', status));
            }

            const response = await databases.listDocuments(
                DATABASE_ID,
                'orders',
                queries
            );

            // Get order items for each order
            for (let order of response.documents) {
                const items = await databases.listDocuments(
                    DATABASE_ID,
                    'order_items',
                    [Query.equal('order_id', order.$id)]
                );
                order.items = items.documents;
            }

            return response;
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    },

    // Update order status
    async updateOrderStatus(orderId, status, additionalData = {}) {
        try {
            const response = await databases.updateDocument(
                DATABASE_ID,
                'orders',
                orderId,
                {
                    status,
                    ...additionalData
                }
            );
            return response;
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    },

    // Get order stats
    async getOrderStats(pangkalanId) {
        try {
            const [total, pending, processing, delivered, completed] = await Promise.all([
                databases.listDocuments(DATABASE_ID, 'orders', [
                    Query.equal('pangkalan_id', pangkalanId),
                    Query.limit(1)
                ]),
                databases.listDocuments(DATABASE_ID, 'orders', [
                    Query.equal('pangkalan_id', pangkalanId),
                    Query.equal('status', 'pending'),
                    Query.limit(1)
                ]),
                databases.listDocuments(DATABASE_ID, 'orders', [
                    Query.equal('pangkalan_id', pangkalanId),
                    Query.equal('status', 'processing'),
                    Query.limit(1)
                ]),
                databases.listDocuments(DATABASE_ID, 'orders', [
                    Query.equal('pangkalan_id', pangkalanId),
                    Query.equal('status', 'delivered'),
                    Query.limit(1)
                ]),
                databases.listDocuments(DATABASE_ID, 'orders', [
                    Query.equal('pangkalan_id', pangkalanId),
                    Query.equal('status', 'completed'),
                    Query.limit(1)
                ])
            ]);

            return {
                total: total.total,
                pending: pending.total,
                processing: processing.total,
                delivered: delivered.total,
                completed: completed.total
            };
        } catch (error) {
            console.error('Error fetching order stats:', error);
            throw error;
        }
    }
};

// Drivers Service (PANGKALAN)
export const driversService = {
    // Get all drivers for pangkalan
    async getDrivers(pangkalanId, limit = 50, offset = 0) {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                'drivers',
                [
                    Query.equal('pangkalan_id', pangkalanId),
                    Query.orderDesc('$createdAt'),
                    Query.limit(limit),
                    Query.offset(offset)
                ]
            );
            return response;
        } catch (error) {
            console.error('Error fetching drivers:', error);
            throw error;
        }
    },

    // Create new driver
    async createDriver(pangkalanId, driverData) {
        try {
            const response = await databases.createDocument(
                DATABASE_ID,
                'drivers',
                ID.unique(),
                {
                    pangkalan_id: pangkalanId,
                    ...driverData
                }
            );
            return response;
        } catch (error) {
            console.error('Error creating driver:', error);
            throw error;
        }
    },

    // Update driver
    async updateDriver(driverId, updateData) {
        try {
            const response = await databases.updateDocument(
                DATABASE_ID,
                'drivers',
                driverId,
                updateData
            );
            return response;
        } catch (error) {
            console.error('Error updating driver:', error);
            throw error;
        }
    },

    // Delete driver
    async deleteDriver(driverId) {
        try {
            await databases.deleteDocument(
                DATABASE_ID,
                'drivers',
                driverId
            );
            return true;
        } catch (error) {
            console.error('Error deleting driver:', error);
            throw error;
        }
    },

    // Get driver stats
    async getDriverStats(pangkalanId) {
        try {
            const [total, available] = await Promise.all([
                databases.listDocuments(DATABASE_ID, 'drivers', [
                    Query.equal('pangkalan_id', pangkalanId),
                    Query.limit(1)
                ]),
                databases.listDocuments(DATABASE_ID, 'drivers', [
                    Query.equal('pangkalan_id', pangkalanId),
                    Query.equal('is_available', true),
                    Query.limit(1)
                ])
            ]);

            // Get all drivers to calculate averages
            const allDrivers = await databases.listDocuments(DATABASE_ID, 'drivers', [
                Query.equal('pangkalan_id', pangkalanId)
            ]);

            const totalDeliveries = allDrivers.documents.reduce((sum, driver) => sum + (driver.total_deliveries || 0), 0);
            const avgRating = allDrivers.documents.length > 0 
                ? allDrivers.documents.reduce((sum, driver) => sum + (driver.rating || 0), 0) / allDrivers.documents.length 
                : 0;

            return {
                total: total.total,
                available: available.total,
                totalDeliveries,
                avgRating: Math.round(avgRating * 10) / 10
            };
        } catch (error) {
            console.error('Error fetching driver stats:', error);
            throw error;
        }
    }
};

// Analytics Service (PANGKALAN)
export const analyticsService = {
    // Get analytics data
    async getAnalytics(pangkalanId, timeRange = '7d') {
        try {
            const now = new Date();
            let startDate;

            switch (timeRange) {
                case '7d':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30d':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case '90d':
                    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            }

            // Get orders within time range
            const orders = await databases.listDocuments(DATABASE_ID, 'orders', [
                Query.equal('pangkalan_id', pangkalanId),
                Query.greaterThanEqual('order_date', startDate.toISOString()),
                Query.orderDesc('order_date')
            ]);

            // Calculate revenue
            const currentRevenue = orders.documents.reduce((sum, order) => sum + order.total_amount, 0);
            
            // Get previous period for comparison
            const prevStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
            const prevOrders = await databases.listDocuments(DATABASE_ID, 'orders', [
                Query.equal('pangkalan_id', pangkalanId),
                Query.greaterThanEqual('order_date', prevStartDate.toISOString()),
                Query.lessThan('order_date', startDate.toISOString())
            ]);

            const previousRevenue = prevOrders.documents.reduce((sum, order) => sum + order.total_amount, 0);

            // Get product stats
            const products = await databases.listDocuments(DATABASE_ID, 'pangkalan_products', [
                Query.equal('pangkalan_id', pangkalanId)
            ]);

            // Get top products (would need order_items analysis)
            const orderItems = await databases.listDocuments(DATABASE_ID, 'order_items', [
                Query.limit(1000) // Get recent order items
            ]);

            // Group by product and calculate sales
            const productSales = {};
            for (const item of orderItems.documents) {
                if (!productSales[item.product_name]) {
                    productSales[item.product_name] = { sales: 0, revenue: 0 };
                }
                productSales[item.product_name].sales += item.quantity;
                productSales[item.product_name].revenue += item.total_price;
            }

            const topProducts = Object.entries(productSales)
                .map(([name, data]) => ({ name, ...data }))
                .sort((a, b) => b.sales - a.sales)
                .slice(0, 5);

            return {
                revenue: {
                    current: currentRevenue,
                    previous: previousRevenue,
                    change: previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0
                },
                orders: {
                    current: orders.documents.length,
                    previous: prevOrders.documents.length,
                    change: prevOrders.documents.length > 0 ? ((orders.documents.length - prevOrders.documents.length) / prevOrders.documents.length) * 100 : 0
                },
                products: {
                    current: products.documents.length,
                    previous: products.documents.length, // This would need historical data
                    change: 0
                },
                topProducts,
                recentOrders: orders.documents.slice(0, 10)
            };
        } catch (error) {
            console.error('Error fetching analytics:', error);
            throw error;
        }
    }
};

// Ekspor semua yang diperlukan
export { ID, Query };