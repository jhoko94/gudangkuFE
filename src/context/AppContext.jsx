// src/context/AppContext.jsx

// 1. Impor 'useCallback' dari React
import React, { createContext, useContext, useState, useCallback } from 'react';
import { baseApiFetch } from '../services/api';

// Buat Context
const AppContext = createContext(null);

// Buat "Provider"
export function AppProvider({ children }) {
    // --- State ---
    const [barang, setBarang] = useState([]);
    const [pemasok, setPemasok] = useState([]);
    const [tujuan, setTujuan] = useState([]);
    const [stok, setStok] = useState([]);
    const [po, setPo] = useState([]);
    const [dashboardData, setDashboardData] = useState({
        statStokKritis: 0,
        statPoOutstanding: 0,
        statBarangKeluar: 0,
        groupedStokKritis: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    
    // --- Fungsi Stabil (Memoized) ---

    // 2. Bungkus 'showMessage' dengan useCallback
    // Ini diperlukan karena 'apiFetch' bergantung padanya.
    const showMessage = useCallback((text, type = 'success') => {
        setMessage({ text, type });
        // Sembunyikan setelah 3 detik
        setTimeout(() => {
            setMessage({ text: '', type: '' });
        }, 3000);
    }, []); // <-- Array dependensi kosong, fungsi ini tidak pernah berubah

    // 3. Bungkus 'apiFetch' dengan useCallback
    // Ini adalah inti perbaikannya.
    const apiFetch = useCallback(async (url, options = {}) => {
        setIsLoading(true);
        try {
            const data = await baseApiFetch(url, options); // Panggil API asli
            return data; // Kembalikan data jika sukses
        } catch (error) {
            // Jika error, tampilkan pesan
            showMessage(error.message || 'Terjadi kesalahan', 'error');
            throw error; // Lempar error agar komponen tahu prosesnya gagal
        } finally {
            setIsLoading(false); // Matikan loader
        }
    }, [showMessage]); // <-- 'apiFetch' hanya akan dibuat ulang jika 'showMessage' berubah (yang mana tidak akan)

    // --- Fungsi Loader ---
    // Fungsi-fungsi ini sekarang menggunakan 'apiFetch' yang stabil
    
    const loadBarang = async () => {
        try {
            const data = await apiFetch('/barang');
            setBarang(data);
            return data;
        } catch (error) { /* error sudah ditangani apiFetch */ }
    };
    
    const loadPemasok = async () => {
        try {
            const data = await apiFetch('/pemasok');
            setPemasok(data);
            return data;
        } catch (error) { /* error sudah ditangani apiFetch */ }
    };
    
    const loadTujuan = async () => {
        try {
            const data = await apiFetch('/tujuan');
            setTujuan(data);
            return data;
        } catch (error) { /* error sudah ditangani apiFetch */ }
    };
    
    const loadPO = async () => {
        try {
            const data = await apiFetch('/po');
            setPo(data);
            return data;
        } catch (error) { /* error sudah ditangani apiFetch */ }
    };
    
    const loadStok = async () => {
        try {
            const data = await apiFetch('/stok');
            setStok(data);
            return data;
        } catch (error) { /* error sudah ditangani apiFetch */ }
    };
    
    const loadDashboard = async () => {
        try {
            const data = await apiFetch('/dashboard');
            setDashboardData(data);
            return data;
        } catch (error) { /* error sudah ditangani apiFetch */ }
    };
    
    const loadInitialData = async () => {
        // Kita kelola loading secara manual di sini untuk 'Promise.all'
        setIsLoading(true);
        try {
            const [barangData, pemasokData, tujuanData, stokData, poData, dashboardData] = await Promise.all([
                baseApiFetch('/barang'),
                baseApiFetch('/pemasok'),
                baseApiFetch('/tujuan'),
                baseApiFetch('/stok'),
                baseApiFetch('/po'),
                baseApiFetch('/dashboard')
            ]);
            setBarang(barangData);
            setPemasok(pemasokData);
            setTujuan(tujuanData);
            setStok(stokData);
            setPo(poData);
            setDashboardData(dashboardData);
            showMessage('Data berhasil dimuat', 'success');
        } catch (error) {
            showMessage('Gagal memuat data awal. Pastikan server backend berjalan.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Data yang akan diberikan ke komponen "anak"
    const value = {
        // State
        barang,
        pemasok,
        tujuan,
        stok,
        po,
        dashboardData,
        message,
        isLoading,
        
        // Fungsi
        showMessage,
        apiFetch,
        loadInitialData,
        loadBarang,
        loadPemasok,
        loadTujuan,
        loadPO,
        loadStok,
        loadDashboard
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

// Custom Hook (tidak berubah)
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext harus digunakan di dalam AppProvider');
    }
    return context;
};