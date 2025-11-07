// src/pages/StokList.jsx

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import StokDetailModal from '../components/StokDetailModal'; // <-- 1. Impor modal baru

const StokList = () => {
  const { stok, loadStok } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  // --- 2. Tambahkan state untuk modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBarang, setSelectedBarang] = useState(null);
  // ------------------------------------

  useEffect(() => {
    loadStok();
  }, []);

  // --- 3. Tambahkan fungsi untuk membuka/menutup modal ---
  const handleViewDetail = (barang) => {
    setSelectedBarang(barang);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedBarang(null);
    setIsModalOpen(false);
  };
  // -------------------------------------------------

  const filteredStok = stok.filter(barang => 
    barang.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    barang.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Kartu Stok Real-Time</h1>
      
      <div className="mb-4">
        <input 
          type="text" 
          id="stok-search" 
          placeholder="Cari nama barang atau kode..." 
          className="w-full md:w-1/3 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs text-gray-500 uppercase">
              <th className="py-3 px-6">Kode Barang</th>
              <th className="py-3 px-6">Nama Barang</th>
              <th className="py-3 px-6">Stok Saat Ini</th>
              <th className="py-3 px-6">Satuan</th>
              <th className="py-3 px-6">Batas Min.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {stok.length === 0 && !searchTerm ? (
              <tr><td colSpan="5" className="py-4 px-6 text-sm text-gray-500 text-center"><i>Memuat data stok...</i></td></tr>
            ) : filteredStok.length === 0 ? (
              <tr><td colSpan="5" className="py-4 px-6 text-sm text-gray-500 text-center"><i>Barang tidak ditemukan.</i></td></tr>
            ) : (
              filteredStok.map(barang => {
                const isKritis = barang.stok <= barang.batasMin;
                return (
                  <tr 
                    key={barang.id} 
                    className={isKritis ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'}
                  >
                    <td className="py-3 px-6 text-sm font-medium text-gray-800">{barang.id}</td>
                    <td className="py-3 px-6 text-sm text-gray-700">{barang.nama}</td>
                    
                    {/* --- 4. BUAT ANGKA STOK BISA DIKLIK --- */}
                    <td 
                      className={`py-3 px-6 text-sm ${isKritis ? 'text-red-600' : 'text-gray-900'}`}
                    >
                      <button
                        onClick={() => handleViewDetail(barang)}
                        className={`font-bold hover:underline cursor-pointer ${
                          barang.stok === 0 ? 'text-gray-400 font-normal' : ''
                        }`}
                        disabled={barang.stok === 0} // Nonaktifkan jika stok 0
                      >
                        {barang.stok}
                      </button>
                    </td>
                    {/* ---------------------------------- */}

                    <td className="py-3 px-6 text-sm text-gray-700">{barang.satuan}</td>
                    <td className="py-3 px-6 text-sm text-gray-700">{barang.batasMin}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* --- 5. Render Modal di sini --- */}
      <StokDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        barang={selectedBarang}
      />
      {/* ----------------------------- */}
    </div>
  );
};

export default StokList;