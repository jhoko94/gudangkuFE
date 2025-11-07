// src/pages/Outbound.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
// Hapus 'apiFetch' dari services

const Outbound = () => {
  // Tambahkan 'apiFetch' dan 'isLoading'
  const { tujuan, loadTujuan, showMessage, loadStok, loadDashboard, apiFetch, isLoading } = useAppContext();
  const navigate = useNavigate();

  const [tujuanId, setTujuanId] = useState('');
  const [referensi, setReferensi] = useState('');
  const [scanInput, setScanInput] = useState('');
  const [scannedItems, setScannedItems] = useState([]);
  
  // Hapus state 'isScanning' dan 'isSubmitting'

  useEffect(() => {
    if (tujuan.length === 0) {
      loadTujuan();
    }
  }, []);

  const handleCancel = () => {
    setTujuanId('');
    setReferensi('');
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
    } catch (error) {
      console.error("Scan gagal", error);
      // Hapus showMessage, sudah ditangani context
    }
    // Hapus 'finally'
  };

  const handleRemoveItem = (barcode) => {
    setScannedItems(prevItems => prevItems.filter(item => item.barcode !== barcode));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!tujuanId) {
      showMessage('Tujuan pengeluaran wajib diisi', 'error');
      return;
    }
    if (scannedItems.length === 0) {
      showMessage('Belum ada barang yang di-scan', 'error');
      return;
    }

    const payload = {
      tujuanId,
      referensi,
      barcodes: scannedItems.map(item => item.barcode)
    };

    // Hapus setIsSubmitting(true)
    try {
      const response = await apiFetch('/outbound', {
        method: 'POST',
        body: payload
      });
      
      showMessage(response.message, 'success');
      
      await Promise.all([loadStok(), loadDashboard()]);
      handleCancel();
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Gagal keluarkan barang:', error);
      // Hapus showMessage
    }
    // Hapus 'finally'
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Keluarkan Barang (Outbound Scan)</h1>
      <form onSubmit={handleSubmit}>
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="outbound-tujuan-select" className="block text-sm font-medium text-gray-700 mb-1">Tujuan Pengeluaran</label>
              <select 
                id="outbound-tujuan-select" 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-100"
                value={tujuanId}
                onChange={(e) => setTujuanId(e.target.value)}
                required
                disabled={isLoading} // <-- Tambahkan disabled
              >
                <option value="">-- Pilih Tujuan --</option>
                {tujuan.map(t => (
                  <option key={t.id} value={t.id}>{t.nama}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="outbound-ref" className="block text-sm font-medium text-gray-700 mb-1">No. Referensi (MR/SO)</label>
              <input 
                type="text" 
                id="outbound-ref" 
                placeholder="Contoh: MR-123" 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                value={referensi}
                onChange={(e) => setReferensi(e.target.value)}
                disabled={isLoading} // <-- Tambahkan disabled
              />
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Scan Barcode Barang</h2>
          <div>
            <label htmlFor="outbound-scan-input" className="block text-sm font-medium text-gray-700 mb-1">Scan Barcode (Tekan Enter untuk memproses)</label>
            <input 
              type="text" 
              id="outbound-scan-input" 
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
              Barang Telah Di-scan ({scannedItems.length})
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
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-md hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading} // <-- Gunakan isLoading
            >
              {isLoading ? 'Menyimpan...' : 'Simpan & Keluarkan Barang'} {/* <-- Ubah teks */}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Outbound;