/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        APPWRITE_ENDPOINT: process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1',
        APPWRITE_PROJECT_ID: process.env.APPWRITE_PROJECT_ID || '66a312130033c02eaceb',
        APPWRITE_DATABASE_ID: process.env.APPWRITE_DATABASE_ID || '685e9c54000491e13998',
        USER_PROFILES_COLLECTION_ID: process.env.USER_PROFILES_COLLECTION_ID || '68758ae900139830951d',
        APPWRITE_SCAN_RESULTS_COLLECTION_ID: process.env.APPWRITE_SCAN_RESULTS_COLLECTION_ID || '687481df003bce9166b6',
        APPWRITE_STORAGE_BUCKET_ID: process.env.APPWRITE_STORAGE_BUCKET_ID || '686f2d1a002bba22496f',
        PANGKALAN_PRODUCTS_COLLECTION_ID: process.env.PANGKALAN_PRODUCTS_COLLECTION_ID || 'pangkalan_products',
        ORDERS_COLLECTION_ID: process.env.ORDERS_COLLECTION_ID || 'orders',
        ORDER_ITEMS_COLLECTION_ID: process.env.ORDER_ITEMS_COLLECTION_ID || 'order_items',
        DRIVERS_COLLECTION_ID: process.env.DRIVERS_COLLECTION_ID || 'drivers',
        CART_COLLECTION_ID: process.env.CART_COLLECTION_ID || 'cart',
        FAVORITES_COLLECTION_ID: process.env.FAVORITES_COLLECTION_ID || 'favorites',
        REVIEWS_COLLECTION_ID: process.env.REVIEWS_COLLECTION_ID || 'reviews',
        BUYER_ADDRESSES_COLLECTION_ID: process.env.BUYER_ADDRESSES_COLLECTION_ID || 'buyer_addresses',
    },
};

export default nextConfig;
