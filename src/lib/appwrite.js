import { Client, Account, ID } from 'appwrite';

const client = new Client();

// Inisialisasi client dengan kredensial dari environment variables
client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

// Buat instance untuk layanan Akun (Authentication)
export const account = new Account(client);

// Ekspor ID untuk membuat ID unik saat registrasi
export { ID };