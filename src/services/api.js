// src/services/api.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
//const API_BASE_URL = 'https://gudangkube-production.up.railway.app/api';

/**
 * Fungsi helper untuk fetch API
 * @param {string} url - Endpoint URL (e.g., '/barang')
 * @param {object} options - Opsi untuk fetch (method, body, dll.)
 * @returns {Promise<any>} - Data JSON dari response
 */
export async function baseApiFetch(url, options = {}) {
    try {
        // Set default headers jika mengirim JSON
        if (options.body && typeof options.body === 'object') {
            options.body = JSON.stringify(options.body);
            options.headers = {
                'Content-Type': 'application/json',
                ...options.headers,
            };
        }

        let response;
        try {
            response = await fetch(API_BASE_URL + url, options);
        } catch (fetchError) {
            // Network error - backend tidak berjalan atau tidak bisa diakses
            if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
                throw new Error(`Tidak dapat terhubung ke backend. Pastikan server backend berjalan di ${API_BASE_URL.replace('/api', '')}. Jalankan: cd gudangkuBE && npm run dev`);
            }
            throw fetchError;
        }
        
        // Cek Content-Type untuk memastikan respons adalah JSON
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');
        
        // Jika respons bukan JSON (misalnya HTML error page), beri pesan error yang jelas
        if (!isJson) {
            const text = await response.text();
            // Jika server mengembalikan HTML, kemungkinan endpoint tidak ada atau server error
            if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
                throw new Error(`Server mengembalikan HTML bukan JSON. Pastikan backend berjalan di ${API_BASE_URL.replace('/api', '')} dan endpoint ${url} tersedia.`);
            }
            throw new Error(`Respons tidak valid (${response.status}): ${response.statusText}`);
        }
        
        // Parse JSON hanya jika Content-Type adalah JSON
        const data = await response.json();
        
        if (!response.ok) {
            // Gunakan pesan error dari server jika ada
            throw new Error(data.message || response.statusText);
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error.message);
        // Lempar error lagi agar fungsi pemanggil bisa menangani (catch)
        // Kita akan menangkap ini di dalam komponen dan menampilkan pesan
        throw error;
    }
}