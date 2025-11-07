// src/pages/MasterTujuan.jsx

import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
// Hapus 'apiFetch' dari services
import Modal from '../components/Modal';

const MasterTujuan = () => {
  // Tambahkan 'apiFetch' dan 'isLoading'
  const { tujuan, loadTujuan, showMessage, apiFetch, isLoading } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTujuan, setEditingTujuan] = useState(null);

  useEffect(() => {
    loadTujuan();
  }, []);

  const handleOpenModal = (tujuanToEdit = null) => {
    setEditingTujuan(tujuanToEdit);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isLoading) return;
    setIsModalOpen(false);
    setEditingTujuan(null);
  };

  const handleSubmit = async (formData) => {
    const newId = 'T' + String(tujuan.length + 1).padStart(3, '0');
    const payload = {
        id: editingTujuan ? editingTujuan.id : newId,
        ...formData
    };

    try {
      if (editingTujuan) {
        await apiFetch(`/tujuan/${editingTujuan.id}`, {
          method: 'PUT',
          body: payload
        });
        showMessage('Tujuan berhasil diperbarui', 'success');
      } else {
        await apiFetch('/tujuan', {
          method: 'POST',
          body: payload
        });
        showMessage('Tujuan baru berhasil ditambahkan', 'success');
      }
      handleCloseModal();
      loadTujuan();
    } catch (error) {
      console.error("Gagal simpan tujuan:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Master Tujuan</h1>
        <button 
          onClick={() => handleOpenModal(null)} 
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-md hover:bg-indigo-700 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Tambah Baru</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          {/* ... (isi tabel Anda tidak berubah) ... */}
          <thead className="bg-gray-50">
            <tr className="text-left text-xs text-gray-500 uppercase">
              <th className="py-3 px-6">Nama Unit / Customer</th>
              <th className="py-3 px-6">Tipe</th>
              <th className="py-3 px-6">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tujuan.length === 0 ? (
              <tr><td colSpan="3" className="py-4 px-6 text-sm text-gray-500 text-center"><i>Memuat...</i></td></tr>
            ) : (
              tujuan.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-3 px-6 text-sm font-medium text-gray-800">{item.nama}</td>
                  <td className="py-3 px-6 text-sm text-gray-700">{item.tipe}</td>
                  <td className="py-3 px-6 text-sm">
                    <button 
                      onClick={() => handleOpenModal(item)} 
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TujuanFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        tujuan={editingTujuan}
        isLoading={isLoading} // <-- Teruskan isLoading
      />
    </div>
  );
};

// Form Modal Khusus untuk Tujuan
const TujuanFormModal = ({ isOpen, onClose, onSubmit, tujuan, isLoading }) => { // <-- Terima isLoading
  const [formData, setFormData] = useState({ nama: '', tipe: '' });

  useEffect(() => {
    if (tujuan) {
      setFormData({
        nama: tujuan.nama,
        tipe: tujuan.tipe
      });
    } else {
      setFormData({ nama: '', tipe: '' });
    }
  }, [tujuan, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={tujuan ? 'Edit Tujuan' : 'Tambah Tujuan Baru'}
    >
      <form onSubmit={handleFormSubmit}>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="tujuan-nama-input" className="block text-sm font-medium text-gray-700 mb-1">Nama Unit / Customer</label>
            <input 
              type="text" 
              id="tujuan-nama-input" 
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100" 
              required 
              disabled={isLoading} // <-- Tambahkan disabled
            />
          </div>
          <div>
            <label htmlFor="tujuan-tipe-select" className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
            <select 
              id="tujuan-tipe-select" 
              name="tipe"
              value={formData.tipe}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-100" 
              required
              disabled={isLoading} // <-- Tambahkan disabled
            >
              <option value="">-- Pilih Tipe --</option>
              <option value="Internal">Internal</option>
              <option value="Eksternal">Eksternal</option>
            </select>
          </div>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={onClose} 
            className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50"
            disabled={isLoading} // <-- Tambahkan disabled
          >
            Batal
          </button>
          <button 
            type="submit" 
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-medium shadow-md hover:bg-indigo-700 disabled:opacity-50"
            disabled={isLoading} // <-- Tambahkan disabled
          >
            {isLoading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default MasterTujuan;