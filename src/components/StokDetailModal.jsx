// src/components/StokDetailModal.jsx

import React, { useState, useEffect } from 'react';
import Modal from './Modal'; // Menggunakan modal reusable
import { useAppContext } from '../context/AppContext';

// Komponen tab filter
const StatusTab = ({ status, setStatus, currentStatus }) => {
  const isActive = status === currentStatus;
  const colors = {
    available: 'border-green-500 text-green-600',
    keluar: 'border-blue-500 text-blue-600',
    scrap: 'border-red-500 text-red-600',
    all: 'border-gray-500 text-gray-600',
  };
  const bgColors = {
    available: 'bg-green-100',
    keluar: 'bg-blue-100',
    scrap: 'bg-red-100',
    all: 'bg-gray-100',
  };

  return (
    <button
      onClick={() => setStatus(status)}
      className={`px-4 py-2 text-sm font-medium border-b-2 ${
        isActive
          ? colors[status]
          : 'border-transparent text-gray-500 hover:text-gray-700'
      } ${isActive ? bgColors[status] : 'hover:bg-gray-50'}`}
    >
      {/* Kapitalisasi huruf pertama */}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </button>
  );
};

const StokDetailModal = ({ isOpen, onClose, barang }) => {
  const { apiFetch, isLoading } = useAppContext();
  const [barcodes, setBarcodes] = useState([]);
  const [filterStatus, setFilterStatus] = useState('available'); // Default: available

  useEffect(() => {
    if (isOpen && barang) {
      const fetchBarcodes = async () => {
        // Jika filterStatus 'all', kita kirim string kosong
        const statusQuery = filterStatus === 'all' ? '' : `?status=${filterStatus}`;
        
        try {
          const data = await apiFetch(`/barang/${barang.id}/barcodes${statusQuery}`);
          setBarcodes(data);
        } catch (error) {
          console.error("Gagal memuat detail barcode:", error);
          setBarcodes([]); // Set ke array kosong jika error
        }
      };
      fetchBarcodes();
    } else if (!isOpen) {
      // Reset state saat modal ditutup
      setBarcodes([]);
      setFilterStatus('available'); // Reset filter
    }
  }, [isOpen, barang, filterStatus, apiFetch]); // Jalankan ulang jika filter berubah

  const modalTitle = barang ? `Detail Stok: ${barang.nama}` : 'Detail Stok';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      {/* Konten Modal */}
      <div className="p-0 sm:p-0">
        
        {/* Tab Filter Status */}
        <div className="border-b border-gray-200 px-4 sm:px-6">
          <nav className="-mb-px flex space-x-4" aria-label="Tabs">
            <StatusTab status="available" currentStatus={filterStatus} setStatus={setFilterStatus} />
            <StatusTab status="keluar" currentStatus={filterStatus} setStatus={setFilterStatus} />
            <StatusTab status="scrap" currentStatus={filterStatus} setStatus={setFilterStatus} />
            <StatusTab status="all" currentStatus={filterStatus} setStatus={setFilterStatus} />
          </nav>
        </div>

        {/* Tabel Barcode */}
        <div className="p-4 sm:p-6">
          <p className="text-sm text-gray-600 mb-4">
            Menampilkan {barcodes.length} barcode dengan status "{filterStatus}".
          </p>
          <div className="overflow-x-auto border rounded-lg h-80 overflow-y-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-gray-50 sticky top-0">
                <tr className="text-left text-xs text-gray-500 uppercase">
                  <th className="py-2 px-4">Barcode</th>
                  <th className="py-2 px-4">Status</th>
                  <th className="py-2 px-4">Asal PO</th>
                  <th className="py-2 px-4">Pemasok</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {isLoading && barcodes.length === 0 ? (
                  <tr><td colSpan="4" className="py-4 px-4 text-center text-gray-500"><i>Memuat...</i></td></tr>
                ) : barcodes.length === 0 ? (
                  <tr><td colSpan="4" className="py-4 px-4 text-center text-gray-500"><i>Tidak ada data.</i></td></tr>
                ) : (
                  barcodes.map(item => (
                    <tr key={item.barcode} className="hover:bg-gray-50">
                      <td className="py-2 px-4 font-medium text-gray-800">{item.barcode}</td>
                      <td className="py-2 px-4 text-gray-700">{item.status}</td>
                      <td className="py-2 px-4 text-gray-700">{item.purchaseOrder?.id || 'N/A'}</td>
                      <td className="py-2 px-4 text-gray-700">{item.purchaseOrder?.pemasok?.nama || 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Footer Modal */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
        <button 
          onClick={onClose} 
          className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg font-medium hover:bg-gray-300"
        >
          Tutup
        </button>
      </div>
    </Modal>
  );
};

export default StokDetailModal;