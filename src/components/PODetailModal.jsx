// src/components/PODetailModal.jsx

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
// Hapus 'apiFetch' dari services
import { useAppContext } from '../context/AppContext'; // <-- Impor context

const PODetailModal = ({ isOpen, onClose, poId }) => {
  // Ambil 'apiFetch' dan 'isLoading' dari context
  const { apiFetch, isLoading } = useAppContext();
  const [poDetail, setPoDetail] = useState(null);
  // Hapus 'isLoading' lokal

  useEffect(() => {
    if (isOpen && poId) {
      const fetchPODetail = async () => {
        // Hapus setIsLoading(true)
        try {
          const data = await apiFetch(`/po/${poId}`);
          setPoDetail(data);
        } catch (error) {
          console.error("Gagal memuat detail PO:", error);
          setPoDetail(null); // Set ke null jika error
          // Hapus showMessage, sudah ditangani context
        }
        // Hapus 'finally'
      };
      fetchPODetail();
    } else if (!isOpen) {
      setPoDetail(null);
    }
  }, [isOpen, poId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detail PO: ${poId || '...'}`}>
      <div className="p-6 space-y-4">
        {/* Gunakan 'isLoading' global */}
        {isLoading && !poDetail ? ( // Tampilkan loader hanya jika BELUM ada data
          <p className="text-center text-gray-500">Memuat detail...</p>
        ) : !poDetail ? (
          <p className="text-center text-red-500">Gagal memuat data.</p>
        ) : (
          <>
            {/* ... (Isi detail PO tidak berubah) ... */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-500 block">Pemasok:</span>
                <span className="font-semibold text-gray-900">{poDetail.pemasok?.nama || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500 block">Tanggal:</span>
                <span className="font-semibold text-gray-900">{new Date(poDetail.tanggal).toLocaleDateString('id-ID')}</span>
              </div>
              <div>
                <span className="font-medium text-gray-500 block">Status:</span>
                <span className="font-semibold text-gray-900">{poDetail.status}</span>
              </div>
            </div>
            
            <h4 className="text-md font-semibold text-gray-900 mt-5 mb-2">Daftar Barang Dipesan:</h4>
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full min-w-[400px]">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs text-gray-500 uppercase">
                    <th className="py-2 px-4">Barang</th>
                    <th className="py-2 px-4">Jumlah Dipesan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {poDetail.items.map(item => (
                    <tr key={item.barangId} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-800">
                        {item.barang?.nama || 'N/A'}
                        <span className="block text-xs text-gray-500">{item.barangId}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">{item.jumlahPesan} {item.barang?.satuan || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
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

export default PODetailModal;