// src/pages/StokOpname.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const StokOpname = () => {
  const { barang, stok, loadBarang, loadStok, showMessage } = useAppContext();
  const navigate = useNavigate();

  // State untuk form
  const [barangId, setBarangId] = useState('');
  const [stokSistem, setStokSistem] = useState(''); // Tampilan stok dari sistem
  const [stokFisik, setStokFisik] = useState('');
  const [catatan, setCatatan] = useState('');

  // Muat data untuk dropdown
  useEffect(() => {
    if (barang.length === 0) loadBarang();
    if (stok.length === 0) loadStok();
  }, []);

  // Fungsi ini meniru 'updateOpnameHint'
  const handleBarangChange = (selectedBarangId) => {
    setBarangId(selectedBarangId);
    if (selectedBarangId) {
      const stokItem = stok.find(s => s.id === selectedBarangId);
      const stokValue = stokItem ? stokItem.stok : 0;
      setStokSistem(stokValue);
    } else {
      setStokSistem('');
    }
  };
  
  const resetForm = () => {
      setBarangId('');
      setStokSistem('');
      setStokFisik('');
      setCatatan('');
  };

  // Fungsi ini meniru 'submitOpname'
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Logika persis seperti di script.js asli Anda
    console.warn('FUNGSI STOK OPNAME DIBATALKAN.');
    showMessage('Fungsi Opname (Penyesuaian Manual) tidak didukung di sistem barcode-based.', 'info');
    
    // Penjelasan:
    // Sistem ini melacak stok berdasarkan barcode unik, bukan angka.
    // Memaksa angka stok akan merusak sinkronisasi data.
    // Untuk mengurangi stok (selisih kurang), gunakan alur "Barang Rusak".
    // Untuk menambah stok (selisih lebih), harus ada alur "Inbound Tanpa PO".
    
    resetForm();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Penyesuaian Stok (Opname)</h1>
      <form onSubmit={handleSubmit}>
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-md border border-gray-200 max-w-2xl mx-auto">
          <div className="space-y-6">
            <div>
              <label htmlFor="opname-barang-select" className="block text-sm font-medium text-gray-700 mb-1">Pilih Barang</label>
              <select 
                id="opname-barang-select" 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                value={barangId}
                onChange={(e) => handleBarangChange(e.target.value)}
              >
                <option value="">-- Pilih Barang --</option>
                {barang.map(b => (
                  <option key={b.id} value={b.id}>{b.nama} ({b.id})</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stok Menurut Sistem</label>
              <input 
                type="text" 
                id="opname-stok-sistem" 
                readOnly 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100"
                value={stokSistem}
              />
            </div>
            
            <div>
              <label htmlFor="opname-stok-fisik" className="block text-sm font-medium text-gray-700 mb-1">Stok Fisik (Hasil Hitungan)</label>
              <input 
                type="number" 
                id="opname-stok-fisik" 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={stokFisik}
                onChange={(e) => setStokFisik(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="opname-catatan" className="block text-sm font-medium text-gray-700 mb-1">Catatan (Alasan Penyesuaian)</label>
              <textarea 
                id="opname-catatan" 
                rows="3" 
                placeholder="Contoh: Selisih hitungan opname bulanan" 
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
              ></textarea>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 mt-8">
            <button 
              type="button"
              onClick={() => navigate('/dashboard')} 
              className="bg-gray-200 text-gray-800 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-300"
            >
              Batal
            </button>
            <button 
              type="submit"
              className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-md hover:bg-green-700"
            >
              Sesuaikan Stok
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StokOpname;