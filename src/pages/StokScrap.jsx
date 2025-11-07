// src/pages/StokScrap.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
// Hapus 'apiFetch' dari services

const StokScrap = () => {
  // Tambahkan 'apiFetch' dan 'isLoading'
  const { showMessage, loadStok, loadDashboard, apiFetch, isLoading } = useAppContext();
  const navigate = useNavigate();

  const [catatan, setCatatan] = useState('');
  const [scanInput, setScanInput] = useState('');
  const [scannedItems, setScannedItems] = useState([]);
  
  // Hapus state 'isScanning' dan 'isSubmitting'

  const handleCancel = () => {
    setCatatan('');
    setScanInput('');
    setScannedItems([]);
  };

  const handleScan = async (event) => {
    if (event.key !== 'Enter' || isLoading) return; // <-- Gunakan isLoading
    
    event.preventDefault();
    const barcode = scanInput.trim();
    if (!barcode) return;

    if (scannedItems.some(item => item.barcode === barcode)) {
      showMessage(`Barcode ${barcode} sudah di-scan di sesi ini`, 'info');
      setScanInput('');
      return;
    }
    
    // Hapus setIsScanning(true)
    try {
      const scannedItem = await apiFetch(`/barcode/${barcode}`);
      setScannedItems(prevItems => [...prevItems, scannedItem]);
      setScanInput('');
      showMessage(`Barcode ${barcode} ditambahkan`, 'success');
    } catch (error) {
      console.error("Scan gagal", error);
      // Hapus showMessage
    }
    // Hapus 'finally'
  };

  const handleRemoveItem = (barcode) => {
    setScannedItems(prevItems => prevItems.filter(item => item.barcode !== barcode));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (scannedItems.length === 0) {
      showMessage('Belum ada barang yang di-scan untuk di-scrap', 'error');
      return;
    }
    if (!catatan) {
      showMessage('Catatan (Alasan Scrap) wajib diisi', 'error');
      return;
    }

    const payload = {
      catatan: catatan,
      barcodes: scannedItems.map(item => item.barcode)
    };

    // Hapus setIsSubmitting(true)
    try {
      const response = await apiFetch('/scrap', {
        method: 'POST',
        body: payload
      });
      
      showMessage(response.message, 'success');
      
      await Promise.all([loadStok(), loadDashboard()]);
      handleCancel();
      navigate('/stok');
      
    } catch (error) {
      console.error("Gagal catat scrap:", error);
      // Hapus showMessage
    }
    // Hapus 'finally'
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Pencatatan Barang Rusak (Scrap)</h1>
      <form onSubmit={handleSubmit}>
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-gray-200 max-w-4xl mx-auto">
          
          <div className="mb-6">
            <label htmlFor="scrap-catatan" className="block text-sm font-medium text-gray-700 mb-1">Catatan (Alasan Scrap)</label>
            <textarea 
              id="scrap-catatan" 
              rows="3" 
              placeholder="Contoh: Pecah saat dipindah, Kadaluwarsa, Rusak di rak" 
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              required
              disabled={isLoading} // <-- Tambahkan disabled
            ></textarea>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 mb-4">Scan Barcode Barang</h2>
          <div>
            <label htmlFor="scrap-scan-input" className="block text-sm font-medium text-gray-700 mb-1">Scan Barcode (Tekan Enter untuk memvalidasi)</label>
            <input 
              type="text" 
              id="scrap-scan-input" 
              placeholder={isLoading ? "Memvalidasi..." : "Pindai barcode di sini..."} // <-- Ubah teks
              className="w-full px-4 py-2.5 border border-indigo-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg disabled:bg-gray-100"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              onKeyDown={handleScan}
              disabled={isLoading} // <-- Gunakan isLoading
            />
          </div>

          {/* ... (Tabel Log Hasil Scan tidak berubah) ... */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Barang Akan Di-Scrap ({scannedItems.length})
            </h3>
            <div className="bg-white rounded-xl shadow-inner border border-gray-200 overflow-x-auto h-64 overflow-y-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="text-left text-xs text-gray-500 uppercase">
                    <th className="py-3 px-6">Barcode</th>
                    <th className="py-3 px-6">Nama Barang</th>
                    <th className="py-3 px-6">Asal Vendor</th>
                    <th className="py-3 px-6">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {scannedItems.length === 0 ? (
                    <tr><td colSpan="4" className="py-4 px-6 text-center text-gray-500"><i>Belum ada barang di-scan...</i></td></tr>
                  ) : (
                    scannedItems.map(item => (
                      <tr key={item.barcode} className="hover:bg-gray-50">
                        <td className="py-3 px-6 text-sm font-medium text-gray-800">{item.barcode}</td>
                        <td className="py-3 px-6 text-sm text-gray-700">{item.namaBarang}</td>
                        <td className="py-3 px-6 text-sm text-gray-700">{item.namaVendor}</td>
                        <td className="py-3 px-6 text-sm">
                          <button 
                            type="button"
                            onClick={() => handleRemoveItem(item.barcode)} 
                            className="text-red-600 hover:text-red-800"
                            disabled={isLoading} // <-- Tambahkan disabled
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 mt-8">
            <button 
              type="button" 
              onClick={handleCancel}
              className="bg-gray-200 text-gray-800 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-300"
              disabled={isLoading} // <-- Gunakan isLoading
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-md hover:bg-red-700 disabled:opacity-50"
              disabled={isLoading} // <-- Gunakan isLoading
            >
              {isLoading ? 'Menyimpan...' : 'Catat Scrap'} {/* <-- Ubah teks */}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StokScrap;