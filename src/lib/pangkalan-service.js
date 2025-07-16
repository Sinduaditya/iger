import { databases, Query, ID } from './appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

// Collection IDs
const PANGKALAN_PRODUCTS_COLLECTION_ID = process.env.NEXT_PUBLIC_PANGKALAN_PRODUCTS_COLLECTION_ID;
const ORDERS_COLLECTION_ID = process.env.NEXT_PUBLIC_ORDERS_COLLECTION_ID;
const ORDER_ITEMS_COLLECTION_ID = process.env.NEXT_PUBLIC_ORDER_ITEMS_COLLECTION_ID;
const DRIVERS_COLLECTION_ID = process.env.NEXT_PUBLIC_DRIVERS_COLLECTION_ID;

// Products Service
export const productsService = {
    // Get all products for pangkalan
    async getProducts(pangkalanId, limit = 50, offset = 0) {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                PANGKALAN_PRODUCTS_COLLECTION_ID,
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

    // Get single product
    async getProduct(productId) {
        try {
            const response = await databases.getDocument(
                DATABASE_ID,
                PANGKALAN_PRODUCTS_COLLECTION_ID,
                productId
            );
            return response;
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    },

    // Create new product
    async createProduct(pangkalanId, productData) {
        try {
            const response = await databases.createDocument(
                DATABASE_ID,
                PANGKALAN_PRODUCTS_COLLECTION_ID,
                ID.unique(),
                {
                    pangkalan_id: pangkalanId,
                    name: productData.name,
                    category: productData.category,
                    price: parseInt(productData.price),
                    unit: productData.unit,
                    stock: parseInt(productData.stock),
                    description: productData.description || '',
                    image_url: productData.image_url || '',
                    freshness_level: productData.freshness_level || '',
                    latitude: productData.latitude ? parseFloat(productData.latitude) : null,
                    longitude: productData.longitude ? parseFloat(productData.longitude) : null,
                    is_available: productData.is_available !== undefined ? productData.is_available : true
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
            const cleanData = {};
            
            if (updateData.name !== undefined) cleanData.name = updateData.name;
            if (updateData.category !== undefined) cleanData.category = updateData.category;
            if (updateData.price !== undefined) cleanData.price = parseInt(updateData.price);
            if (updateData.unit !== undefined) cleanData.unit = updateData.unit;
            if (updateData.stock !== undefined) cleanData.stock = parseInt(updateData.stock);
            if (updateData.description !== undefined) cleanData.description = updateData.description;
            if (updateData.image_url !== undefined) cleanData.image_url = updateData.image_url;
            if (updateData.freshness_level !== undefined) cleanData.freshness_level = updateData.freshness_level;
            if (updateData.latitude !== undefined) cleanData.latitude = updateData.latitude ? parseFloat(updateData.latitude) : null;
            if (updateData.longitude !== undefined) cleanData.longitude = updateData.longitude ? parseFloat(updateData.longitude) : null;
            if (updateData.is_available !== undefined) cleanData.is_available = updateData.is_available;

            const response = await databases.updateDocument(
                DATABASE_ID,
                PANGKALAN_PRODUCTS_COLLECTION_ID,
                productId,
                cleanData
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
                PANGKALAN_PRODUCTS_COLLECTION_ID,
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
            const [totalResponse, availableResponse, lowStockResponse] = await Promise.all([
                databases.listDocuments(DATABASE_ID, PANGKALAN_PRODUCTS_COLLECTION_ID, [
                    Query.equal('pangkalan_id', pangkalanId),
                    Query.limit(1)
                ]),
                databases.listDocuments(DATABASE_ID, PANGKALAN_PRODUCTS_COLLECTION_ID, [
                    Query.equal('pangkalan_id', pangkalanId),
                    Query.equal('is_available', true),
                    Query.limit(1)
                ]),
                databases.listDocuments(DATABASE_ID, PANGKALAN_PRODUCTS_COLLECTION_ID, [
                    Query.equal('pangkalan_id', pangkalanId),
                    Query.lessThan('stock', 10),
                    Query.limit(1)
                ])
            ]);

            return {
                total: totalResponse.total,
                available: availableResponse.total,
                lowStock: lowStockResponse.total,
                unavailable: totalResponse.total - availableResponse.total
            };
        } catch (error) {
            console.error('Error fetching product stats:', error);
            throw error;
        }
    }
};

// Orders Service
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
                ORDERS_COLLECTION_ID,
                queries
            );

            // Get order items for each order
            for (let order of response.documents) {
                try {
                    const items = await databases.listDocuments(
                        DATABASE_ID,
                        ORDER_ITEMS_COLLECTION_ID,
                        [Query.equal('order_id', order.$id)]
                    );
                    order.items = items.documents;
                } catch (itemError) {
                    console.error(`Error fetching items for order ${order.$id}:`, itemError);
                    order.items = [];
                }
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
            const updateData = {
                status,
                ...additionalData
            };

            if (status === 'delivered' && !additionalData.delivery_date) {
                updateData.delivery_date = new Date().toISOString();
            }

            const response = await databases.updateDocument(
                DATABASE_ID,
                ORDERS_COLLECTION_ID,
                orderId,
                updateData
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
            const [total, pending, confirmed, processing, delivered, completed, cancelled] = await Promise.all([
                databases.listDocuments(DATABASE_ID, ORDERS_COLLECTION_ID, [
                    Query.equal('pangkalan_id', pangkalanId),
                    Query.limit(1)
                ]),
                databases.listDocuments(DATABASE_ID, ORDERS_COLLECTION_ID, [
                    Query.equal('pangkalan_id', pangkalanId),
                    Query.equal('status', 'pending'),
                    Query.limit(1)
                ]),
                databases.listDocuments(DATABASE_ID, ORDERS_COLLECTION_ID, [
                    Query.equal('pangkalan_id', pangkalanId),
                    Query.equal('status', 'confirmed'),
                    Query.limit(1)
                ]),
                databases.listDocuments(DATABASE_ID, ORDERS_COLLECTION_ID, [
                    Query.equal('pangkalan_id', pangkalanId),
                    Query.equal('status', 'processing'),
                    Query.limit(1)
                ]),
                databases.listDocuments(DATABASE_ID, ORDERS_COLLECTION_ID, [
                    Query.equal('pangkalan_id', pangkalanId),
                    Query.equal('status', 'delivered'),
                    Query.limit(1)
                ]),
                databases.listDocuments(DATABASE_ID, ORDERS_COLLECTION_ID, [
                    Query.equal('pangkalan_id', pangkalanId),
                    Query.equal('status', 'completed'),
                    Query.limit(1)
                ]),
                databases.listDocuments(DATABASE_ID, ORDERS_COLLECTION_ID, [
                    Query.equal('pangkalan_id', pangkalanId),
                    Query.equal('status', 'cancelled'),
                    Query.limit(1)
                ])
            ]);

            return {
                total: total.total,
                pending: pending.total,
                confirmed: confirmed.total,
                processing: processing.total,
                delivered: delivered.total,
                completed: completed.total,
                cancelled: cancelled.total
            };
        } catch (error) {
            console.error('Error fetching order stats:', error);
            throw error;
        }
    }
};

// Drivers Service
export const driversService = {
    // Get all drivers for pangkalan
    async getDrivers(pangkalanId, limit = 50, offset = 0) {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                DRIVERS_COLLECTION_ID,
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
                DRIVERS_COLLECTION_ID,
                ID.unique(),
                {
                    pangkalan_id: pangkalanId,
                    name: driverData.name,
                    phone: driverData.phone,
                    license_number: driverData.license_number,
                    vehicle_type: driverData.vehicle_type,
                    vehicle_number: driverData.vehicle_number,
                    is_available: driverData.is_available !== undefined ? driverData.is_available : true,
                    rating: driverData.rating ? parseFloat(driverData.rating) : 0,
                    total_deliveries: driverData.total_deliveries ? parseInt(driverData.total_deliveries) : 0
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
            const cleanData = {};
            
            if (updateData.name !== undefined) cleanData.name = updateData.name;
            if (updateData.phone !== undefined) cleanData.phone = updateData.phone;
            if (updateData.license_number !== undefined) cleanData.license_number = updateData.license_number;
            if (updateData.vehicle_type !== undefined) cleanData.vehicle_type = updateData.vehicle_type;
            if (updateData.vehicle_number !== undefined) cleanData.vehicle_number = updateData.vehicle_number;
            if (updateData.is_available !== undefined) cleanData.is_available = updateData.is_available;
            if (updateData.rating !== undefined) cleanData.rating = parseFloat(updateData.rating);
            if (updateData.total_deliveries !== undefined) cleanData.total_deliveries = parseInt(updateData.total_deliveries);

            const response = await databases.updateDocument(
                DATABASE_ID,
                DRIVERS_COLLECTION_ID,
                driverId,
                cleanData
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
                DRIVERS_COLLECTION_ID,
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
            const [totalResponse, availableResponse] = await Promise.all([
                databases.listDocuments(DATABASE_ID, DRIVERS_COLLECTION_ID, [
                    Query.equal('pangkalan_id', pangkalanId),
                    Query.limit(1)
                ]),
                databases.listDocuments(DATABASE_ID, DRIVERS_COLLECTION_ID, [
                    Query.equal('pangkalan_id', pangkalanId),
                    Query.equal('is_available', true),
                    Query.limit(1)
                ])
            ]);

            const allDriversResponse = await databases.listDocuments(DATABASE_ID, DRIVERS_COLLECTION_ID, [
                Query.equal('pangkalan_id', pangkalanId),
                Query.limit(100)
            ]);

            const totalDeliveries = allDriversResponse.documents.reduce((sum, driver) => sum + (driver.total_deliveries || 0), 0);
            const avgRating = allDriversResponse.documents.length > 0 
                ? allDriversResponse.documents.reduce((sum, driver) => sum + (driver.rating || 0), 0) / allDriversResponse.documents.length 
                : 0;

            return {
                total: totalResponse.total,
                available: availableResponse.total,
                totalDeliveries,
                avgRating: Math.round(avgRating * 10) / 10
            };
        } catch (error) {
            console.error('Error fetching driver stats:', error);
            throw error;
        }
    }
};

// Analytics Service
export const analyticsService = {
    async getAnalytics(pangkalanId, timeRange = '7d') {
        try {
            const now = new Date();
            let startDate;
            let prevStartDate;

            switch (timeRange) {
                case '7d':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    prevStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30d':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    prevStartDate = new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case '90d':
                    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    prevStartDate = new Date(startDate.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    prevStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
            }

            const currentOrders = await databases.listDocuments(DATABASE_ID, ORDERS_COLLECTION_ID, [
                Query.equal('pangkalan_id', pangkalanId),
                Query.greaterThanEqual('order_date', startDate.toISOString()),
                Query.orderDesc('order_date'),
                Query.limit(1000)
            ]);

            const prevOrders = await databases.listDocuments(DATABASE_ID, ORDERS_COLLECTION_ID, [
                Query.equal('pangkalan_id', pangkalanId),
                Query.greaterThanEqual('order_date', prevStartDate.toISOString()),
                Query.lessThan('order_date', startDate.toISOString()),
                Query.limit(1000)
            ]);

            const currentRevenue = currentOrders.documents.reduce((sum, order) => sum + (order.total_amount || 0), 0);
            const previousRevenue = prevOrders.documents.reduce((sum, order) => sum + (order.total_amount || 0), 0);

            const products = await databases.listDocuments(DATABASE_ID, PANGKALAN_PRODUCTS_COLLECTION_ID, [
                Query.equal('pangkalan_id', pangkalanId),
                Query.limit(1)
            ]);

            const orderItemsResponse = await databases.listDocuments(DATABASE_ID, ORDER_ITEMS_COLLECTION_ID, [
                Query.limit(1000)
            ]);

            const currentOrderIds = currentOrders.documents.map(order => order.$id);
            const currentOrderItems = orderItemsResponse.documents.filter(item => 
                currentOrderIds.includes(item.order_id)
            );

            const productSales = {};
            currentOrderItems.forEach(item => {
                const productName = item.product_name;
                if (!productSales[productName]) {
                    productSales[productName] = { sales: 0, revenue: 0 };
                }
                productSales[productName].sales += item.quantity || 0;
                productSales[productName].revenue += item.total_price || 0;
            });

            const topProducts = Object.entries(productSales)
                .map(([name, data]) => ({ name, ...data }))
                .sort((a, b) => b.sales - a.sales)
                .slice(0, 5);

            const revenueChange = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
            const ordersChange = prevOrders.documents.length > 0 ? ((currentOrders.documents.length - prevOrders.documents.length) / prevOrders.documents.length) * 100 : 0;

            return {
                revenue: {
                    current: currentRevenue,
                    previous: previousRevenue,
                    change: revenueChange
                },
                orders: {
                    current: currentOrders.documents.length,
                    previous: prevOrders.documents.length,
                    change: ordersChange
                },
                products: {
                    current: products.total,
                    previous: products.total,
                    change: 0
                },
                topProducts,
                recentOrders: currentOrders.documents.slice(0, 10)
            };
        } catch (error) {
            console.error('Error fetching analytics:', error);
            throw error;
        }
    }
};

// Helper functions
export const pangkalanHelpers = {
    formatCurrency(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    },

    validateProductData(productData) {
        const errors = [];
        
        if (!productData.name || productData.name.trim() === '') {
            errors.push('Nama produk harus diisi');
        }
        
        if (!productData.category || productData.category.trim() === '') {
            errors.push('Kategori harus diisi');
        }
        
        if (!productData.price || productData.price <= 0) {
            errors.push('Harga harus lebih dari 0');
        }
        
        if (!productData.unit || productData.unit.trim() === '') {
            errors.push('Unit harus diisi');
        }
        
        if (productData.stock === undefined || productData.stock < 0) {
            errors.push('Stok tidak boleh negatif');
        }
        
        return errors;
    },

    validateDriverData(driverData) {
        const errors = [];
        
        if (!driverData.name || driverData.name.trim() === '') {
            errors.push('Nama driver harus diisi');
        }
        
        if (!driverData.phone || driverData.phone.trim() === '') {
            errors.push('Nomor telepon harus diisi');
        }
        
        if (!driverData.license_number || driverData.license_number.trim() === '') {
            errors.push('Nomor SIM harus diisi');
        }
        
        if (!driverData.vehicle_type || driverData.vehicle_type.trim() === '') {
            errors.push('Jenis kendaraan harus diisi');
        }
        
        if (!driverData.vehicle_number || driverData.vehicle_number.trim() === '') {
            errors.push('Nomor kendaraan harus diisi');
        }
        
        return errors;
    }
};