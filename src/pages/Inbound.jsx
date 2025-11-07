// src/pages/Inbound.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
// Hapus 'apiFetch' dari services

const Inbound = () => {
  // Tambahkan 'apiFetch' dan 'isLoading'
  const { showMessage, loadStok, loadPO, loadDashboard, apiFetch, isLoading } = useAppContext();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [poNumber, setPoNumber] = useState('');
  const [currentPO, setCurrentPO] = useState(null);
  // Hapus 'isLoading' state lokal
  
  const [currentScanSession, setCurrentScanSession] = useState({});
  const [scanBarangId, setScanBarangId] = useState('');
  const [scanBarcode, setScanBarcode] = useState('');

  const handleLookupPO = async (e) => {
    e.preventDefault();
    if (!poNumber) {
      showMessage('Nomor PO tidak boleh kosong', 'error');
      return;
    }
    // Hapus setIsLoading(true)
    try {
      const poData = await apiFetch(`/po/lookup/${poNumber}`);
      
      if (poData.status === 'Selesai') {
        showMessage(`PO ${poNumber} sudah selesai diterima.`, 'info');
        setPoNumber('');
        return;
      }

      setCurrentPO(poData);
      
      const session = {};
      poData.items.forEach(item => {
        session[item.barangId] = [];
      });
      setCurrentScanSession(session);
      
      setStep(2);
      showMessage('PO Ditemukan. Silakan mulai scan barang.', 'success');

    } catch (error) {
      setCurrentPO(null);
      // Hapus showMessage, sudah ditangani context
    }
    // Hapus 'finally'
  };

  const handleCancelInbound = () => {
    setStep(1);
    setCurrentPO(null);
    setCurrentScanSession({});
    setPoNumber('');
    setScanBarangId('');
    setScanBarcode('');
  };

  const handleProcessScan = () => {
    // ... (Logika ini tidak memanggil API, jadi biarkan saja)
    if (!scanBarangId) {
      showMessage('Pilih barang yang sedang di-scan', 'error');
      return;
    }
    if (!scanBarcode) {
      showMessage('Masukkan barcode', 'error');
      return;
    }
    const poItem = currentPO.items.find(item => item.barangId === scanBarangId);
    if (!poItem) {
      showMessage('Barang ini tidak ada di PO!', 'error');
      return;
    }
    const allScannedBarcodes = Object.values(currentScanSession).flat();
    if (allScannedBarcodes.includes(scanBarcode)) {
       showMessage(`Barcode ${scanBarcode} sudah di-scan di sesi ini!`, 'info');
       setScanBarcode('');
       return;
    }
    const sisaDibutuhkan = poItem.jumlahPesan - poItem.jumlahDiterima;
    if (currentScanSession[scanBarangId].length >= sisaDibutuhkan) {
      showMessage(`Jumlah scan untuk ${poItem.barangId} sudah penuh (${sisaDibutuhkan} pcs)`, 'info');
      setScanBarcode('');
      return;
    }
    setCurrentScanSession(prevSession => ({
      ...prevSession,
      [scanBarangId]: [...prevSession[scanBarangId], scanBarcode]
    }));
    setScanBarcode('');
  };

  const handleSubmitPenerimaan = async () => {
    const totalScanned = Object.values(currentScanSession).flat().length;
    if (totalScanned === 0) {
      showMessage('Anda belum memindai satu barang pun!', 'error');
      return;
    }
    
    const payload = {
      poId: currentPO.id,
      scannedItems: currentScanSession
    };
    
    // Hapus setIsLoading(true)
    try {
      const response = await apiFetch('/inbound', {
        method: 'POST',
        body: payload
      });
      
      showMessage(response.message, 'success');
      
      await Promise.all([loadStok(), loadPO(), loadDashboard()]);
      
      handleCancelInbound();
      navigate('/stok');
      
    } catch (error) {
      // Hapus showMessage
      console.error("Gagal submit penerimaan", error);
    }
    // Hapus 'finally'
  };

  // Tampilan Step 1: Lookup PO
  if (step === 1) {
    return (
      <div id="inbound-step-1" className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Terima Barang (Inbound)</h1>
        <form onSubmit={handleLookupPO}>
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-gray-200">
            <label htmlFor="inbound-po-lookup" className="block text-sm font-medium text-gray-700 mb-2">Masukkan Nomor PO dari Surat Jalan</label>
            <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
              <input 
                type="text" 
                id="inbound-po-lookup" 
                placeholder="Contoh: PO-001" 
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value.toUpperCase())}
                disabled={isLoading} // <-- Gunakan isLoading
              />
              <button 
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-md hover:bg-indigo-700 flex items-center justify-center disabled:opacity-50"
                disabled={isLoading} // <-- Gunakan isLoading
              >
                <Search className="w-5 h-5 mr-2" />
                {isLoading ? 'Mencari...' : 'Cari PO'} {/* <-- Ubah teks */}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // Tampilan Step 2: Verifikasi
  if (step === 2 && currentPO) {
    // ... (Tabel verifikasi tidak berubah) ...
    const scannedItemsList = Object.entries(currentScanSession)
      .flatMap(([barangId, barcodes]) => 
        barcodes.map(barcode => ({
          barangId,
          barcode,
          namaBarang: currentPO?.items.find(i => i.barangId === barangId)?.nama || 'N/A'
        }))
      );
      
    return (
      <div id="inbound-step-2">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Verifikasi Penerimaan (Scan)</h1>
        <div className="mb-6 space-y-1">
          <h2 className="text-xl font-semibold text-gray-800" id="inbound-po-number">
            PO: {currentPO.id}
          </h2>
          <p className="text-gray-600">Pemasok: <span className="font-medium" id="inbound-po-pemasok">{currentPO.pemasok.nama}</span></p>
        </div>
        
        {/* Tabel Verifikasi */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs text-gray-500 uppercase">
                <th className="py-3 px-6">Nama Barang</th>
                <th className="py-3 px-6">Jml Dipesan</th>
                <th className="py-3 px-6">Jml Diterima (Total)</th>
                <th className="py-3 px-6">Jml Di-scan (Sesi Ini)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentPO.items.map(item => (
                <tr key={item.barangId} className="hover:bg-gray-50">
                  <td className="py-3 px-6 text-sm font-medium text-gray-800">
                    {item.nama}
                    <span className="block text-xs text-gray-500">{item.barangId}</span>
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-700">{item.jumlahPesan} {item.satuan}</td>
                  <td className="py-3 px-6 text-sm text-gray-700">{item.jumlahDiterima}</td>
                  <td className="py-3 px-6 text-sm font-bold text-gray-900">
                    {currentScanSession[item.barangId]?.length || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Bagian Scanner */}
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-gray-200 mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Scan Barang Diterima</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="inbound-scan-target-item" className="block text-sm font-medium text-gray-700 mb-1">1. Pilih Barang (sesuai barang fisik)</label>
              <select 
                id="inbound-scan-target-item" 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-100"
                value={scanBarangId}
                onChange={(e) => setScanBarangId(e.target.value)}
                disabled={isLoading} // <-- Tambahkan disabled
              >
                <option value="">-- Pilih Barang --</option>
                {currentPO.items.map(item => (
                  <option key={item.barangId} value={item.barangId}>
                    {item.nama} ({item.barangId})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="inbound-scan-input" className="block text-sm font-medium text-gray-700 mb-1">2. Scan / Masukkan Barcode Unik</label>
              <div className="flex space-x-3">
                <input 
                  type="text" 
                  id="inbound-scan-input" 
                  placeholder="Scan barcode..." 
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  value={scanBarcode}
                  onChange={(e) => setScanBarcode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleProcessScan())}
                  disabled={isLoading} // <-- Tambahkan disabled
                />
                <button 
                  type="button"
                  onClick={handleProcessScan}
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-md hover:bg-indigo-700 flex items-center justify-center disabled:opacity-50"
                  disabled={isLoading} // <-- Tambahkan disabled
                >
                  <Plus className="w-5 h-5 mr-0 sm:mr-2" />
                  <span className="hidden sm:inline">Tambah</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Barang Telah Di-scan (Sesi Ini):</h4>
            {/* Container untuk tabel yang bisa di-scroll */}
            <div className="bg-white rounded-lg shadow-inner border border-gray-200 overflow-x-auto h-32 overflow-y-auto">
              <table className="w-full min-w-[400px]">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="text-left text-xs text-gray-500 uppercase">
                    <th className="py-2 px-4">Barcode</th>
                    <th className="py-2 px-4">Nama Barang</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {scannedItemsList.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="py-3 px-4 text-center text-gray-500">
                        <i>Belum ada barang di-scan...</i>
                      </td>
                    </tr>
                  ) : (
                    scannedItemsList.map((item) => (
                      // Kita gunakan item.barcode sebagai key karena unik
                      <tr key={item.barcode} className="hover:bg-gray-50">
                        <td className="py-2 px-4 font-medium text-gray-800">{item.barcode}</td>
                        <td className="py-2 px-4 text-gray-700">{item.namaBarang}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 mt-6">
          <button 
            onClick={handleCancelInbound} 
            className="bg-gray-200 text-gray-800 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-300"
            disabled={isLoading} // <-- Gunakan isLoading
          >
            Batal
          </button>
          <button 
            onClick={handleSubmitPenerimaan}
            className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-md hover:bg-green-700 disabled:opacity-50"
            disabled={isLoading} // <-- Gunakan isLoading
          >
            {isLoading ? 'Menyimpan...' : 'Simpan & Terima Barang'} {/* <-- Ubah teks */}
          </button>
        </div>
      </div>
    );
  }
  
  return null;
};

export default Inbound;