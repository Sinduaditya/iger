import { databases, ID, Query } from './appwrite';

// Database dan Collection IDs
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '685e9c54000491e13998';
const PANGKALAN_PRODUCTS_COLLECTION_ID = process.env.NEXT_PUBLIC_PANGKALAN_PRODUCTS_COLLECTION_ID || 'pangkalan_products';
const ORDERS_COLLECTION_ID = process.env.NEXT_PUBLIC_ORDERS_COLLECTION_ID || 'orders';
const ORDER_ITEMS_COLLECTION_ID = process.env.NEXT_PUBLIC_ORDER_ITEMS_COLLECTION_ID || 'order_items';
const CART_COLLECTION_ID = process.env.NEXT_PUBLIC_CART_COLLECTION_ID || 'cart';
const FAVORITES_COLLECTION_ID = process.env.NEXT_PUBLIC_FAVORITES_COLLECTION_ID || 'favorites';
const REVIEWS_COLLECTION_ID = process.env.NEXT_PUBLIC_REVIEWS_COLLECTION_ID || 'reviews';
const BUYER_ADDRESSES_COLLECTION_ID = process.env.NEXT_PUBLIC_BUYER_ADDRESSES_COLLECTION_ID || 'buyer_addresses';

// Buyer Products Service
export const buyerService = {
    // Get all products from all pangkalans
     async getPangkalansWithLocation() {
        try {
            // Get all user profiles yang role-nya pangkalan dan punya koordinat
            const pangkalans = await databases.listDocuments(
                DATABASE_ID,
                '68758ae900139830951d', // Collection user_profiles
                [
                    Query.equal('role', 'pangkalan'),
                    Query.limit(100)
                ]
            );

            // Filter pangkalan yang punya produk dan koordinat
            const pangkalansWithData = await Promise.all(
                pangkalans.documents.map(async (pangkalan) => {
                    try {
                        // Get products count for this pangkalan
                        const products = await databases.listDocuments(
                            DATABASE_ID,
                            PANGKALAN_PRODUCTS_COLLECTION_ID,
                            [
                                Query.equal('pangkalan_id', pangkalan.user_id),
                                Query.equal('is_available', true),
                                Query.limit(1) // Just for count
                            ]
                        );

                        // Get any product with coordinates for this pangkalan if user profile doesn't have coordinates
                        let latitude = pangkalan.latitude;
                        let longitude = pangkalan.longitude;

                        if (!latitude || !longitude) {
                            const productWithLocation = await databases.listDocuments(
                                DATABASE_ID,
                                PANGKALAN_PRODUCTS_COLLECTION_ID,
                                [
                                    Query.equal('pangkalan_id', pangkalan.user_id),
                                    Query.isNotNull('latitude'),
                                    Query.isNotNull('longitude'),
                                    Query.limit(1)
                                ]
                            );

                            if (productWithLocation.documents.length > 0) {
                                latitude = productWithLocation.documents[0].latitude;
                                longitude = productWithLocation.documents[0].longitude;
                            }
                        }

                        return {
                            user_id: pangkalan.user_id,
                            pangkalan_name: pangkalan.pangkalan_name,
                            address: pangkalan.address,
                            phone: pangkalan.phone,
                            operating_hours: pangkalan.operating_hours,
                            latitude: latitude,
                            longitude: longitude,
                            product_count: products.total
                        };
                    } catch (error) {
                        console.error(`Error fetching data for pangkalan ${pangkalan.user_id}:`, error);
                        return null;
                    }
                })
            );

            // Filter out null results and pangkalans without location or products
            return pangkalansWithData.filter(pangkalan => 
                pangkalan && 
                pangkalan.latitude && 
                pangkalan.longitude && 
                pangkalan.product_count > 0
            );
        } catch (error) {
            console.error('Error fetching pangkalans with location:', error);
            return [];
        }
    },

    // Get pangkalan detail by user_id
    async getPangkalanDetail(pangkalanId) {
        try {
            const pangkalan = await databases.listDocuments(
                DATABASE_ID,
                '68758ae900139830951d',
                [
                    Query.equal('user_id', pangkalanId),
                    Query.equal('role', 'pangkalan'),
                    Query.limit(1)
                ]
            );

            if (pangkalan.documents.length === 0) {
                return null;
            }

            const pangkalanData = pangkalan.documents[0];

            // Get products count
            const products = await databases.listDocuments(
                DATABASE_ID,
                PANGKALAN_PRODUCTS_COLLECTION_ID,
                [
                    Query.equal('pangkalan_id', pangkalanId),
                    Query.equal('is_available', true),
                    Query.limit(1)
                ]
            );

            return {
                ...pangkalanData,
                product_count: products.total
            };
        } catch (error) {
            console.error('Error fetching pangkalan detail:', error);
            return null;
        }
    },

    async getAllProducts(filters = {}, limit = 50, offset = 0) {
        try {
            const queries = [
                Query.equal('is_available', true),
                Query.orderDesc('$createdAt'),
                Query.limit(limit),
                Query.offset(offset)
            ];

            if (filters.category) {
                queries.push(Query.equal('category', filters.category));
            }
            if (filters.search) {
                queries.push(Query.search('name', filters.search));
            }
            if (filters.pangkalan_id) {
                queries.push(Query.equal('pangkalan_id', filters.pangkalan_id));
            }

            const response = await databases.listDocuments(
                DATABASE_ID,
                PANGKALAN_PRODUCTS_COLLECTION_ID,
                queries
            );
            return response;
        } catch (error) {
            console.error('Error fetching all products:', error);
            return { documents: [], total: 0 };
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
            return null;
        }
    },

    // Get products by pangkalan
    async getProductsByPangkalan(pangkalanId, limit = 50) {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                PANGKALAN_PRODUCTS_COLLECTION_ID,
                [
                    Query.equal('pangkalan_id', pangkalanId),
                    Query.equal('is_available', true),
                    Query.limit(limit)
                ]
            );
            return response;
        } catch (error) {
            console.error('Error fetching pangkalan products:', error);
            return { documents: [], total: 0 };
        }
    }
};

// 🔧 FIX: Cart Service with CORRECT field names
export const cartService = {
    async addToCart(buyerId, productId, pangkalanId, quantity, unitPrice) {
        try {
            // Check if item already exists in cart
            const existing = await databases.listDocuments(
                DATABASE_ID,
                CART_COLLECTION_ID,
                [
                    Query.equal('buyer_id', buyerId),
                    Query.equal('product_id', productId)
                ]
            );

            if (existing.documents.length > 0) {
                // Update quantity
                const newQuantity = existing.documents[0].quantity + quantity; // ✅ Fixed: quantity
                const response = await databases.updateDocument(
                    DATABASE_ID,
                    CART_COLLECTION_ID,
                    existing.documents[0].$id,
                    {
                        quantity: newQuantity, // ✅ Fixed: quantity (bukan quantitiy)
                        total_price: newQuantity * unitPrice,
                        updated_at: new Date().toISOString()
                    }
                );
                return response;
            } else {
                // Create new cart item
                const response = await databases.createDocument(
                    DATABASE_ID,
                    CART_COLLECTION_ID,
                    ID.unique(),
                    {
                        buyer_id: buyerId,
                        product_id: productId,
                        pangkalan_id: pangkalanId,
                        quantity: quantity, // ✅ Fixed: quantity (bukan quantitiy)
                        unit_price: unitPrice, // ✅ Fixed: unit_price (bukan unite_price)
                        total_price: quantity * unitPrice,
                        added_at: new Date().toISOString()
                    }
                );
                return response;
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        }
    },

    // Get cart items
    async getCartItems(buyerId) {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                CART_COLLECTION_ID,
                [
                    Query.equal('buyer_id', buyerId),
                    Query.orderDesc('added_at') // 🔧 Use added_at since it exists in schema
                ]
            );

            // Get product details for each cart item
            for (let item of response.documents) {
                try {
                    const product = await databases.getDocument(
                        DATABASE_ID,
                        PANGKALAN_PRODUCTS_COLLECTION_ID,
                        item.product_id
                    );
                    item.product = product;
                } catch (error) {
                    console.warn('Product not found for cart item:', item.product_id);
                    item.product = null;
                }
            }

            return response;
        } catch (error) {
            console.error('Error fetching cart items:', error);
            return { documents: [] };
        }
    },

    // Update cart item quantity
    async updateCartItem(cartItemId, quantity, totalPrice) {
        try {
            console.log(`Updating cart item ${cartItemId}: quantity=${quantity}, total=${totalPrice}`);
            
            const response = await databases.updateDocument(
                DATABASE_ID,
                CART_COLLECTION_ID,
                cartItemId,
                {
                    quantity: parseInt(quantity),
                    total_price: parseFloat(totalPrice)
                }
            );

            console.log('Cart item updated successfully:', response);
            return response;
        } catch (error) {
            console.error('Error updating cart item:', error);
            throw new Error(`Failed to update cart item: ${error.message}`);
        }
    },

    // 🔥 IMPROVED: Remove from cart with better error handling
    async removeFromCart(cartItemId) {
        try {
            console.log(`Removing cart item: ${cartItemId}`);
            
            const response = await databases.deleteDocument(
                DATABASE_ID,
                CART_COLLECTION_ID,
                cartItemId
            );

            console.log('Cart item removed successfully');
            return response;
        } catch (error) {
            console.error('Error removing cart item:', error);
            throw new Error(`Failed to remove cart item: ${error.message}`);
        }
    },

    // Clear cart
    async clearCart(buyerId) {
        try {
            const cartItems = await this.getCartItems(buyerId);
            const deletePromises = cartItems.documents.map(item =>
                this.removeFromCart(item.$id)
            );
            await Promise.all(deletePromises);
            return true;
        } catch (error) {
            console.error('Error clearing cart:', error);
            return false;
        }
    },

    // 🔧 FIX: Cart summary with correct field names
    async getCartSummary(buyerId) {
        try {
            const cartItems = await this.getCartItems(buyerId);

            if (!cartItems || !cartItems.documents) {
                return {
                    totalItems: 0,
                    totalAmount: 0,
                    totalQuantity: 0,
                    items: []
                };
            }

            const totalItems = cartItems.documents.length;
            const totalAmount = cartItems.documents.reduce((sum, item) => sum + (item.total_price || 0), 0);
            const totalQuantity = cartItems.documents.reduce((sum, item) => sum + (item.quantity || 0), 0); // ✅ Fixed: quantity

            return {
                totalItems,
                totalAmount,
                totalQuantity,
                items: cartItems.documents
            };
        } catch (error) {
            console.error('Error getting cart summary:', error);
            return {
                totalItems: 0,
                totalAmount: 0,
                totalQuantity: 0,
                items: []
            };
        }
    }
};

// 🔧 FIX: Favorites Service with required fields
export const favoritesService = {
    // Add to favorites
    async addToFavorites(buyerId, productId, pangkalanId) {
        try {
            // Check if already exists first
            const existing = await databases.listDocuments(
                DATABASE_ID,
                FAVORITES_COLLECTION_ID,
                [
                    Query.equal('buyer_id', buyerId),
                    Query.equal('product_id', productId),
                    Query.limit(1)
                ]
            );

            if (existing.documents.length > 0) {
                return existing.documents[0]; // Already exists
            }

            // 🔧 FIX: Include required field 'added_at'
            const response = await databases.createDocument(
                DATABASE_ID,
                FAVORITES_COLLECTION_ID,
                ID.unique(),
                {
                    buyer_id: buyerId,
                    product_id: productId,
                    pangkalan_id: pangkalanId,
                    added_at: new Date().toISOString() // 🔧 Required field in schema
                }
            );
            return response;
        } catch (error) {
            console.error('Error adding to favorites:', error);
            throw error;
        }
    },

    // Remove from favorites
    async removeFromFavorites(buyerId, productId) {
        try {
            const existing = await databases.listDocuments(
                DATABASE_ID,
                FAVORITES_COLLECTION_ID,
                [
                    Query.equal('buyer_id', buyerId),
                    Query.equal('product_id', productId)
                ]
            );

            if (existing.documents.length > 0) {
                await databases.deleteDocument(
                    DATABASE_ID,
                    FAVORITES_COLLECTION_ID,
                    existing.documents[0].$id
                );
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error removing from favorites:', error);
            return false;
        }
    },

    // Get favorites
    async getFavorites(buyerId) {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                FAVORITES_COLLECTION_ID,
                [
                    Query.equal('buyer_id', buyerId),
                    Query.orderDesc('added_at') // 🔧 Use added_at since it exists in schema
                ]
            );

            // Get product details for each favorite
            for (let item of response.documents) {
                try {
                    const product = await databases.getDocument(
                        DATABASE_ID,
                        PANGKALAN_PRODUCTS_COLLECTION_ID,
                        item.product_id
                    );
                    item.product = product;
                } catch (error) {
                    console.warn('Product not found for favorite:', item.product_id);
                    item.product = null;
                }
            }

            return response;
        } catch (error) {
            console.error('Error fetching favorites:', error);
            return { documents: [] };
        }
    },

    // Check if product is favorite
    async isFavorite(buyerId, productId) {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                FAVORITES_COLLECTION_ID,
                [
                    Query.equal('buyer_id', buyerId),
                    Query.equal('product_id', productId),
                    Query.limit(1)
                ]
            );
            return response.documents.length > 0;
        } catch (error) {
            console.error('Error checking favorite status:', error);
            return false;
        }
    }
};

// Buyer Orders Service
export const buyerOrdersService = {
    // Create order
    async createOrder(orderData) {
        try {
            const order = await databases.createDocument(
                DATABASE_ID,
                ORDERS_COLLECTION_ID,
                ID.unique(),
                {
                    ...orderData,
                    order_date: new Date().toISOString(),
                    status: 'pending',
                    payment_status: 'pending'
                }
            );
            return order;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    },

    // Create order items
    async createOrderItems(orderId, items) {
        try {
            console.log('🔍 Creating order items with data:', items); // Debug

            const orderItems = [];
            for (const item of items) {
                // 🔧 Pastikan semua field ada dan tipe data benar
                const orderItemData = {
                    order_id: orderId, // string ✅
                    product_id: item.product_id, // string ✅
                    product_name: item.product_name || item.product?.name || 'Unknown Product', // string ✅
                    quantity: parseFloat(item.quantity) || 1.0, // 🔧 double (pastikan float)
                    unit: item.unit || item.product?.unit || 'pcs', // string ✅
                    unit_price: parseFloat(item.unit_price) || 0.0, // 🔧 double (pastikan float)
                    total_price: parseFloat(item.total_price) || 0.0 // 🔧 double (pastikan float)
                };

                console.log('🔍 Order item data to send:', orderItemData); // Debug

                const orderItem = await databases.createDocument(
                    DATABASE_ID,
                    ORDER_ITEMS_COLLECTION_ID,
                    ID.unique(),
                    orderItemData
                );
                orderItems.push(orderItem);
            }
            return orderItems;
        } catch (error) {
            console.error('Error creating order items:', error);
            console.error('Error details:', error.message);
            throw error;
        }
    },

    async submitDriverRating(orderId, driverId, rating, comment = '') {
        try {
            // Create driver rating record
            const ratingData = {
                order_id: orderId,
                driver_id: driverId,
                rating: parseFloat(rating),
                comment: comment,
                rated_at: new Date().toISOString()
            };

            const ratingResponse = await databases.createDocument(
                DATABASE_ID,
                'driver_ratings', // Collection untuk rating driver
                ID.unique(),
                ratingData
            );

            // Update order dengan flag rating sudah diberikan
            await databases.updateDocument(
                DATABASE_ID,
                ORDERS_COLLECTION_ID,
                orderId,
                {
                    driver_rated: true
                }
            );

            // Update average rating driver
            await this.updateDriverAverageRating(driverId);

            return ratingResponse;
        } catch (error) {
            console.error('Error submitting driver rating:', error);
            throw error;
        }
    },

    // 🔥 NEW: Update driver average rating
    async updateDriverAverageRating(driverId) {
        try {
            // Get all ratings for this driver
            const ratings = await databases.listDocuments(
                DATABASE_ID,
                'driver_ratings',
                [
                    Query.equal('driver_id', driverId),
                    Query.limit(1000)
                ]
            );

            if (ratings.documents.length > 0) {
                const totalRating = ratings.documents.reduce((sum, rating) => sum + rating.rating, 0);
                const averageRating = totalRating / ratings.documents.length;

                // Update driver record
                await databases.updateDocument(
                    DATABASE_ID,
                    'drivers', // Collection drivers
                    driverId,
                    {
                        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
                        total_ratings: ratings.documents.length
                    }
                );

                console.log(`✅ Driver ${driverId} rating updated to ${averageRating.toFixed(1)}`);
            }
        } catch (error) {
            console.error('Error updating driver average rating:', error);
        }
    },

    // 🔧 NEW: Validate stock before checkout
    async validateStock(orderItems) {
        try {
            const stockValidations = [];
            
            for (const item of orderItems) {
                const product = await databases.getDocument(
                    DATABASE_ID,
                    PANGKALAN_PRODUCTS_COLLECTION_ID,
                    item.product_id
                );
                
                const availableStock = product.stock || 0;
                const requestedQuantity = parseInt(item.quantity);
                
                stockValidations.push({
                    product_id: item.product_id,
                    product_name: item.product_name,
                    requested: requestedQuantity,
                    available: availableStock,
                    isValid: availableStock >= requestedQuantity
                });
            }
            
            const invalidItems = stockValidations.filter(v => !v.isValid);
            
            return {
                isValid: invalidItems.length === 0,
                invalidItems,
                validations: stockValidations
            };
        } catch (error) {
            console.error('Error validating stock:', error);
            return { isValid: false, error: error.message };
        }
    },

    // 🔧 NEW: Reduce product stock
    async reduceProductStock(productId, quantity) {
        try {
            // Get current product data
            const product = await databases.getDocument(
                DATABASE_ID,
                PANGKALAN_PRODUCTS_COLLECTION_ID,
                productId
            );

            // Calculate new stock
            const currentStock = product.stock || 0;
            const newStock = Math.max(0, currentStock - quantity); // Ensure stock doesn't go negative

            console.log(`🔍 Reducing stock for product ${productId}: ${currentStock} - ${quantity} = ${newStock}`);

            // Update product stock
            const updatedProduct = await databases.updateDocument(
                DATABASE_ID,
                PANGKALAN_PRODUCTS_COLLECTION_ID,
                productId,
                {
                    stock: newStock,
                    is_available: newStock > 0 // Set availability based on stock
                }
            );

            return updatedProduct;
        } catch (error) {
            console.error(`Error reducing stock for product ${productId}:`, error);
            throw error;
        }
    },

    // 🔧 NEW: Restore product stock (for cancellations)
    async restoreProductStock(productId, quantity) {
        try {
            // Get current product data
            const product = await databases.getDocument(
                DATABASE_ID,
                PANGKALAN_PRODUCTS_COLLECTION_ID,
                productId
            );

            // Calculate new stock
            const currentStock = product.stock || 0;
            const newStock = currentStock + quantity;

            console.log(`🔍 Restoring stock for product ${productId}: ${currentStock} + ${quantity} = ${newStock}`);

            // Update product stock
            const updatedProduct = await databases.updateDocument(
                DATABASE_ID,
                PANGKALAN_PRODUCTS_COLLECTION_ID,
                productId,
                {
                    stock: newStock,
                    is_available: true // Make available again
                }
            );

            return updatedProduct;
        } catch (error) {
            console.error(`Error restoring stock for product ${productId}:`, error);
            throw error;
        }
    },

    // 🔧 NEW: Process complete order with stock management
    async processOrder(orderData, orderItems) {
        try {
            console.log('🔍 Processing order with stock reduction');

            // 1. Validate stock first
            const stockValidation = await this.validateStock(orderItems);
            if (!stockValidation.isValid) {
                const invalidItemsMsg = stockValidation.invalidItems
                    .map(item => `${item.product_name}: diminta ${item.requested}, tersedia ${item.available}`)
                    .join('; ');
                throw new Error(`Stok tidak mencukupi: ${invalidItemsMsg}`);
            }

            // 2. Create order
            const order = await this.createOrder(orderData);
            console.log('✅ Order created:', order.$id);

            try {
                // 3. Create order items
                const createdOrderItems = await this.createOrderItems(order.$id, orderItems);
                console.log('✅ Order items created:', createdOrderItems.length);

                // 4. Reduce stock for each product
                for (const item of orderItems) {
                    try {
                        await this.reduceProductStock(item.product_id, parseInt(item.quantity));
                        console.log(`✅ Stock reduced for product ${item.product_id}`);
                    } catch (stockError) {
                        console.error(`❌ Failed to reduce stock for product ${item.product_id}:`, stockError);
                        // Don't throw error here, log and continue
                    }
                }

                return { order, orderItems: createdOrderItems };
            } catch (error) {
                // If order items creation or stock reduction fails, we should handle rollback
                console.error('Error in order processing, attempting rollback...');
                
                // Try to delete the order if items creation failed
                try {
                    await databases.deleteDocument(DATABASE_ID, ORDERS_COLLECTION_ID, order.$id);
                    console.log('✅ Order rolled back successfully');
                } catch (rollbackError) {
                    console.error('❌ Failed to rollback order:', rollbackError);
                }
                
                throw error;
            }
        } catch (error) {
            console.error('Error processing order:', error);
            throw error;
        }
    },

    // Get buyer orders
    async getBuyerOrders(buyerId, status = null, limit = 50, offset = 0) {
        try {
            const queries = [
                Query.equal('buyer_id', buyerId),
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
                } catch (error) {
                    console.warn('Error fetching items for order:', order.$id);
                    order.items = [];
                }
            }

            return response;
        } catch (error) {
            console.error('Error fetching buyer orders:', error);
            return { documents: [] };
        }
    },

    // Get single order with items
    async getOrder(orderId) {
        try {
            const order = await databases.getDocument(
                DATABASE_ID,
                ORDERS_COLLECTION_ID,
                orderId
            );

            const items = await databases.listDocuments(
                DATABASE_ID,
                ORDER_ITEMS_COLLECTION_ID,
                [Query.equal('order_id', orderId)]
            );
            order.items = items.documents;

            return order;
        } catch (error) {
            console.error('Error fetching order:', error);
            return null;
        }
    },

    // Update order status
    async updateOrderStatus(orderId, status, notes = '') {
        try {
            const updateData = {
                status: status,
                updated_at: new Date().toISOString()
            };

            if (notes) {
                updateData.notes = notes;
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

    // Update payment status
    async updatePaymentStatus(orderId, paymentStatus, paymentMethod = null) {
        try {
            const updateData = {
                payment_status: paymentStatus,
                updated_at: new Date().toISOString()
            };

            if (paymentMethod) {
                updateData.payment_method = paymentMethod;
            }

            const response = await databases.updateDocument(
                DATABASE_ID,
                ORDERS_COLLECTION_ID,
                orderId,
                updateData
            );
            return response;
        } catch (error) {
            console.error('Error updating payment status:', error);
            throw error;
        }
    },

    // Cancel order and restore stock
    async cancelOrder(orderId, reason = '') {
        try {
            // Get order and items first
            const order = await this.getOrder(orderId);
            if (!order) {
                throw new Error('Order not found');
            }

            // Only allow cancellation for pending orders
            if (order.status !== 'pending') {
                throw new Error('Order cannot be cancelled as it is already being processed');
            }

            // Restore stock for each item
            for (const item of order.items) {
                try {
                    await this.restoreProductStock(item.product_id, parseInt(item.quantity));
                    console.log(`✅ Stock restored for product ${item.product_id}`);
                } catch (stockError) {
                    console.error(`❌ Failed to restore stock for product ${item.product_id}:`, stockError);
                }
            }

            // Update order status
            const response = await this.updateOrderStatus(orderId, 'cancelled', reason);
            console.log('✅ Order cancelled successfully');

            return response;
        } catch (error) {
            console.error('Error cancelling order:', error);
            throw error;
        }
    },

    // Get order statistics for buyer
    async getOrderStats(buyerId) {
        try {
            const orders = await databases.listDocuments(
                DATABASE_ID,
                ORDERS_COLLECTION_ID,
                [
                    Query.equal('buyer_id', buyerId),
                    Query.limit(1000) // Get all orders for stats
                ]
            );

            const stats = {
                total: orders.documents.length,
                pending: 0,
                confirmed: 0,
                processing: 0,
                shipped: 0,
                delivered: 0,
                cancelled: 0,
                totalAmount: 0,
                averageOrderValue: 0
            };

            orders.documents.forEach(order => {
                stats[order.status] = (stats[order.status] || 0) + 1;
                stats.totalAmount += order.total_amount || 0;
            });

            stats.averageOrderValue = stats.total > 0 ? stats.totalAmount / stats.total : 0;

            return stats;
        } catch (error) {
            console.error('Error getting order stats:', error);
            return {
                total: 0, pending: 0, confirmed: 0, processing: 0,
                shipped: 0, delivered: 0, cancelled: 0,
                totalAmount: 0, averageOrderValue: 0
            };
        }
    },

    // Search orders
    async searchOrders(buyerId, searchTerm, status = null, limit = 50) {
        try {
            const queries = [
                Query.equal('buyer_id', buyerId),
                Query.orderDesc('order_date'),
                Query.limit(limit)
            ];

            if (status) {
                queries.push(Query.equal('status', status));
            }

            // Note: Appwrite search might be limited, you might need to implement client-side filtering
            if (searchTerm) {
                // Try to search by order ID or buyer name
                queries.push(Query.search('buyer_name', searchTerm));
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
                } catch (error) {
                    console.warn('Error fetching items for order:', order.$id);
                    order.items = [];
                }
            }

            return response;
        } catch (error) {
            console.error('Error searching orders:', error);
            return { documents: [] };
        }
    },

    // Get orders by date range
    async getOrdersByDateRange(buyerId, startDate, endDate, limit = 50) {
        try {
            const queries = [
                Query.equal('buyer_id', buyerId),
                Query.greaterThanEqual('order_date', startDate),
                Query.lessThanEqual('order_date', endDate),
                Query.orderDesc('order_date'),
                Query.limit(limit)
            ];

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
                } catch (error) {
                    console.warn('Error fetching items for order:', order.$id);
                    order.items = [];
                }
            }

            return response;
        } catch (error) {
            console.error('Error fetching orders by date range:', error);
            return { documents: [] };
        }
    },

    // Reorder - create new order from existing order
    async reorder(originalOrderId) {
        try {
            const originalOrder = await this.getOrder(originalOrderId);
            if (!originalOrder) {
                throw new Error('Original order not found');
            }

            // Validate stock for reorder
            const stockValidation = await this.validateStock(originalOrder.items);
            if (!stockValidation.isValid) {
                const invalidItemsMsg = stockValidation.invalidItems
                    .map(item => `${item.product_name}: diminta ${item.requested}, tersedia ${item.available}`)
                    .join('; ');
                throw new Error(`Stok tidak mencukupi untuk reorder: ${invalidItemsMsg}`);
            }

            // Create new order with same details
            const newOrderData = {
                buyer_id: originalOrder.buyer_id,
                pangkalan_id: originalOrder.pangkalan_id,
                buyer_name: originalOrder.buyer_name,
                buyer_phone: originalOrder.buyer_phone,
                delivery_address: originalOrder.delivery_address,
                delivery_notes: originalOrder.delivery_notes || '',
                total_amount: originalOrder.total_amount,
                payment_method: originalOrder.payment_method
            };

            const orderItems = originalOrder.items.map(item => ({
                product_id: item.product_id,
                product_name: item.product_name,
                quantity: item.quantity,
                unit: item.unit,
                unit_price: item.unit_price,
                total_price: item.total_price
            }));

            // Process the reorder
            const result = await this.processOrder(newOrderData, orderItems);
            
            console.log('✅ Reorder processed successfully');
            return result;
        } catch (error) {
            console.error('Error processing reorder:', error);
            throw error;
        }
    }
};

// Address Service
export const addressService = {
    // Create address
    async createAddress(buyerId, addressData) {
        try {
            const response = await databases.createDocument(
                DATABASE_ID,
                BUYER_ADDRESSES_COLLECTION_ID,
                ID.unique(),
                {
                    buyer_id: buyerId,
                    address_name: addressData.address_name,
                    recipient_name: addressData.recipient_name,
                    phone_number: addressData.phone_number,
                    full_address: addressData.full_address,
                    postal_code: addressData.postal_code || '',
                    notes: addressData.notes || '',
                    latitude: addressData.latitude || 0.0,
                    longitude: addressData.longitude || 0.0,
                    is_default: addressData.is_default || false
                }
            );
            return response;
        } catch (error) {
            console.error('Error creating address:', error);
            throw error;
        }
    },

    // Get buyer addresses - REAL DATABASE CALL
    async getAddresses(buyerId) {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                BUYER_ADDRESSES_COLLECTION_ID,
                [
                    Query.equal('buyer_id', buyerId),
                    Query.orderDesc('is_default'),
                    Query.orderDesc('$createdAt')
                ]
            );
            console.log('🔍 Fetched addresses from database:', response); // Debug log
            return response;
        } catch (error) {
            console.error('Error fetching addresses:', error);
            return { documents: [] };
        }
    },

    // Update address
    async updateAddress(addressId, addressData) {
        try {
            const response = await databases.updateDocument(
                DATABASE_ID,
                BUYER_ADDRESSES_COLLECTION_ID,
                addressId,
                addressData
            );
            return response;
        } catch (error) {
            console.error('Error updating address:', error);
            throw error;
        }
    },

    // Delete address
    async deleteAddress(addressId) {
        try {
            await databases.deleteDocument(
                DATABASE_ID,
                BUYER_ADDRESSES_COLLECTION_ID,
                addressId
            );
            return true;
        } catch (error) {
            console.error('Error deleting address:', error);
            return false;
        }
    },

    // Set default address
    async setDefaultAddress(buyerId, addressId) {
        try {
            const addresses = await this.getAddresses(buyerId);
            const updatePromises = addresses.documents.map(addr =>
                this.updateAddress(addr.$id, { is_default: addr.$id === addressId })
            );

            await Promise.all(updatePromises);
            return true;
        } catch (error) {
            console.error('Error setting default address:', error);
            return false;
        }
    }
};

// Reviews Service
export const reviewsService = {
    // Create review
    async createReview(reviewData) {
        try {
            const response = await databases.createDocument(
                DATABASE_ID,
                REVIEWS_COLLECTION_ID,
                ID.unique(),
                {
                    ...reviewData,
                    review_date: new Date().toISOString()
                }
            );
            return response;
        } catch (error) {
            console.error('Error creating review:', error);
            throw error;
        }
    },

    // Get reviews for product
    async getProductReviews(productId, limit = 50, offset = 0) {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                REVIEWS_COLLECTION_ID,
                [
                    Query.equal('product_id', productId),
                    Query.orderDesc('review_date'),
                    Query.limit(limit),
                    Query.offset(offset)
                ]
            );
            return response;
        } catch (error) {
            console.error('Error fetching product reviews:', error);
            return { documents: [] };
        }
    },

    // Get buyer reviews
    async getBuyerReviews(buyerId, limit = 50, offset = 0) {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                REVIEWS_COLLECTION_ID,
                [
                    Query.equal('buyer_id', buyerId),
                    Query.orderDesc('review_date'),
                    Query.limit(limit),
                    Query.offset(offset)
                ]
            );
            return response;
        } catch (error) {
            console.error('Error fetching buyer reviews:', error);
            return { documents: [] };
        }
    },

    // Update review
    async updateReview(reviewId, updateData) {
        try {
            const response = await databases.updateDocument(
                DATABASE_ID,
                REVIEWS_COLLECTION_ID,
                reviewId,
                updateData
            );
            return response;
        } catch (error) {
            console.error('Error updating review:', error);
            throw error;
        }
    },

    // Delete review
    async deleteReview(reviewId) {
        try {
            await databases.deleteDocument(
                DATABASE_ID,
                REVIEWS_COLLECTION_ID,
                reviewId
            );
            return true;
        } catch (error) {
            console.error('Error deleting review:', error);
            return false;
        }
    },

    // Get review stats for product
    async getProductReviewStats(productId) {
        try {
            const reviews = await databases.listDocuments(
                DATABASE_ID,
                REVIEWS_COLLECTION_ID,
                [
                    Query.equal('product_id', productId),
                    Query.limit(1000)
                ]
            );

            const totalReviews = reviews.documents.length;
            if (totalReviews === 0) {
                return {
                    totalReviews: 0,
                    averageRating: 0,
                    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
                };
            }

            const totalRating = reviews.documents.reduce((sum, review) => sum + review.rating, 0);
            const averageRating = totalRating / totalReviews;

            const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            reviews.documents.forEach(review => {
                ratingDistribution[review.rating]++;
            });

            return {
                totalReviews,
                averageRating: Math.round(averageRating * 10) / 10,
                ratingDistribution
            };
        } catch (error) {
            console.error('Error getting product review stats:', error);
            return {
                totalReviews: 0,
                averageRating: 0,
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            };
        }
    }
};