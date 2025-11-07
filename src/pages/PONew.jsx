// src/pages/PONew.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const PONew = () => {
  const { 
    pemasok, barang, po, 
    loadPemasok, loadBarang, loadPO, loadDashboard, 
    showMessage, apiFetch, isLoading 
  } = useAppContext();
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // --- LOGIKA PREFILL BARU ---
  // Ambil state dari navigasi (jika ada)
  const prefillPemasokId = location.state?.prefillPemasokId;
  const prefillItems = location.state?.prefillItems; // Ini adalah array

  // Tentukan state awal
  const [pemasokId, setPemasokId] = useState(prefillPemasokId || '');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  // Jika ada prefillItems, gunakan itu. Jika tidak, mulai dengan satu baris kosong.
  const [items, setItems] = useState(prefillItems || [{ barangId: '', jumlahPesan: 1 }]);
  // -------------------------

  // Muat data untuk dropdown
  useEffect(() => {
    if (pemasok.length === 0) loadPemasok();
    if (barang.length === 0) loadBarang();
  }, [loadPemasok, loadBarang, pemasok.length, barang.length]); // dependensi yang lebih akurat

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addPoItem = () => {
    setItems([...items, { barangId: '', jumlahPesan: 1 }]);
  };

  const removePoItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    } else {
      showMessage('Tidak bisa menghapus baris terakhir', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!pemasokId) {
      showMessage('Pilih pemasok terlebih dahulu', 'error');
      return;
    }
    
    const validItems = items.filter(item => item.barangId && parseInt(item.jumlahPesan) > 0)
                            .map(item => ({ ...item, jumlahPesan: parseInt(item.jumlahPesan) }));

    if (validItems.length === 0) {
      showMessage('Tambahkan minimal 1 barang dengan jumlah lebih dari 0', 'error');
      return;
    }
    
    const nextPoNum = po.length + 1;
    const newPoId = `PO-${String(nextPoNum).padStart(3, '0')}`;

    const payload = {
      id: newPoId,
      tanggal: tanggal,
      pemasokId: pemasokId,
      items: validItems
    };
    
    try {
      await apiFetch('/po', {
        method: 'POST',
        body: payload
      });
      
      showMessage(`PO ${payload.id} berhasil dibuat.`, 'success');
      await loadPO();
      await loadDashboard();
      navigate('/po');
      
    } catch (error) {
      console.error("Gagal simpan PO:", error);
    }
  };
  
  const barangOptions = barang.map(b => ({ value: b.id, text: `${b.nama} (${b.id})` }));

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Buat Purchase Order Baru</h1>
      <form onSubmit={handleSubmit}>
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Dropdown Pemasok */}
            <div>
              <label htmlFor="po-pemasok-select" className="block text-sm font-medium text-gray-700 mb-1">Pemasok</label>
              <select 
                id="po-pemasok-select" 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-100"
                value={pemasokId} // <-- Sekarang dikontrol oleh state
                onChange={(e) => setPemasokId(e.target.value)}
                required
                disabled={isLoading}
              >
                <option value="">-- Pilih Pemasok --</option>
                {pemasok.map(p => (
                  <option key={p.id} value={p.id}>{p.nama}</option>
                ))}
              </select>
            </div>
            {/* Input Tanggal */}
            <div>
              <label htmlFor="po-tanggal-input" className="block text-sm font-medium text-gray-700 mb-1">Tanggal PO</label>
              <input 
                type="date" 
                id="po-tanggal-input" 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-100"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Barang Dipesan</h2>
          {/* Daftar Baris Barang Dinamis */}
          <div id="po-barang-list" className="space-y-4 mb-6">
            {items.map((item, index) => (
              <div key={index} className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:items-center sm:space-x-4 po-barang-item">
                {/* Dropdown Barang */}
                <select 
                  className="w-full sm:w-1/2 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-100"
                  value={item.barangId}
                  onChange={(e) => handleItemChange(index, 'barangId', e.target.value)}
                  required
                  disabled={isLoading}
                >
                  <option value="">-- Pilih Barang --</option>
                  {barangOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.text}</option>
                  ))}
                </select>
                {/* Input Jumlah */}
                <input 
                  type="number" 
                  placeholder="Jumlah" 
                  className="w-full sm:w-1/4 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                  value={item.jumlahPesan}
                  onChange={(e) => handleItemChange(index, 'jumlahPesan', e.target.value)}
                  min="1"
                  required
                  disabled={isLoading}
                />
                {/* Tombol Hapus Baris */}
                <button 
                  type="button" 
                  className="text-red-600 hover:text-red-800 self-end sm:self-center disabled:opacity-50" 
                  onClick={() => removePoItem(index)}
                  disabled={isLoading}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          
          {/* Tombol Tambah Baris */}
          <button 
            type="button"
            onClick={addPoItem} 
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center mb-6 disabled:opacity-50"
            disabled={isLoading}
          >
            <PlusCircle className="w-4 h-4 mr-1" />
            Tambah Baris Barang
          </button>
          
          {/* Tombol Aksi Form */}
          <div className="flex justify-end space-x-4">
            <Link 
              to="/po" 
              className={`bg-gray-200 text-gray-800 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-300 ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
            >
              Batal
            </Link>
            <button 
              type="submit" 
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-md hover:bg-indigo-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Menyimpan...' : 'Simpan PO'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PONew;