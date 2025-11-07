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

        const response = await fetch(API_BASE_URL + url, options);
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