// src/pages/MasterBarang.jsx

import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
// Hapus 'apiFetch' dari services
import Modal from '../components/Modal';

const MasterBarang = () => {
  // Tambahkan 'apiFetch' dan 'isLoading' dari context
  const { barang, loadBarang, showMessage, apiFetch, isLoading } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBarang, setEditingBarang] = useState(null);

  useEffect(() => {
    loadBarang();
  }, []);

  const handleOpenModal = (barangToEdit = null) => {
    setEditingBarang(barangToEdit);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isLoading) return; // Cegah modal tertutup saat loading
    setIsModalOpen(false);
    setEditingBarang(null);
  };

  const handleSubmit = async (formData) => {
    try {
      if (editingBarang) {
        await apiFetch(`/barang/${editingBarang.id}`, {
          method: 'PUT',
          body: formData
        });
        showMessage('Barang berhasil diperbarui', 'success');
      } else {
        await apiFetch('/barang', {
          method: 'POST',
          body: formData
        });
        showMessage('Barang baru berhasil ditambahkan', 'success');
      }
      handleCloseModal();
      loadBarang();
      // loadStok(); // Idealnya panggil loadStok juga
    } catch (error) {
      // Tidak perlu showMessage, context sudah menangani
      console.error("Gagal simpan barang:", error);
    }
  };

  const handleDelete = async (barang) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus barang "${barang.nama}" (${barang.id})?`)) {
      return;
    }

    try {
      await apiFetch(`/barang/${barang.id}`, {
        method: 'DELETE'
      });
      showMessage('Barang berhasil dihapus', 'success');
      loadBarang();
    } catch (error) {
      // Error sudah ditangani oleh context, tapi kita bisa tambahkan pesan khusus
      console.error("Gagal hapus barang:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Master Barang</h1>
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
              <th className="py-3 px-6">Kode Barang</th>
              <th className="py-3 px-6">Nama Barang</th>
              <th className="py-3 px-6">Satuan</th>
              <th className="py-3 px-6">Batas Stok Min.</th>
              <th className="py-3 px-6">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {barang.length === 0 ? (
              <tr><td colSpan="5" className="py-4 px-6 text-sm text-gray-500 text-center"><i>Memuat...</i></td></tr>
            ) : (
              barang.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-3 px-6 text-sm font-medium text-gray-800">{item.id}</td>
                  <td className="py-3 px-6 text-sm text-gray-700">{item.nama}</td>
                  <td className="py-3 px-6 text-sm text-gray-700">{item.satuan}</td>
                  <td className="py-3 px-6 text-sm text-gray-700">{item.batasMin}</td>
                  <td className="py-3 px-6 text-sm">
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => handleOpenModal(item)} 
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                        disabled={isLoading}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(item)} 
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        disabled={isLoading}
                        title="Hapus barang"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <BarangFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        barang={editingBarang}
        isLoading={isLoading} // <-- Teruskan isLoading ke modal
      />
    </div>
  );
};

// Form Modal Khusus untuk Barang
const BarangFormModal = ({ isOpen, onClose, onSubmit, barang, isLoading }) => { // <-- Terima isLoading
  const [formData, setFormData] = useState({
    id: '', nama: '', satuan: '', batasMin: 0
  });

  useEffect(() => {
    if (barang) {
      setFormData({
        id: barang.id,
        nama: barang.nama,
        satuan: barang.satuan,
        batasMin: barang.batasMin
      });
    } else {
      setFormData({ id: '', nama: '', satuan: '', batasMin: 0 });
    }
  }, [barang, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      batasMin: parseInt(formData.batasMin) || 0
    };
    onSubmit(payload);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={barang ? 'Edit Barang' : 'Tambah Barang Baru'}
    >
      <form onSubmit={handleFormSubmit}>
        <div className="p-6 space-y-4">
          {/* ... (Input Kode Barang) ... */}
          <div>
            <label htmlFor="barang-id-input" className="block text-sm font-medium text-gray-700 mb-1">Kode Barang / SKU</label>
            <input 
              type="text" 
              id="barang-id-input" 
              name="id"
              value={formData.id}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100" 
              required 
              disabled={isLoading} // <-- Tambahkan disabled
            />
          </div>
          {/* ... (Input Nama Barang) ... */}
          <div>
            <label htmlFor="barang-nama-input" className="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label>
            <input 
              type="text" 
              id="barang-nama-input" 
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100" 
              required 
              disabled={isLoading} // <-- Tambahkan disabled
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* ... (Select Satuan) ... */}
            <div>
              <label htmlFor="barang-satuan-select" className="block text-sm font-medium text-gray-700 mb-1">Satuan</label>
              <select 
                id="barang-satuan-select" 
                name="satuan"
                value={formData.satuan}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-100" 
                required
                disabled={isLoading} // <-- Tambahkan disabled
              >
                <option value="">-- Pilih Satuan --</option>
                <option value="Pcs">Pcs</option>
                <option value="Liter">Liter</option>
                <option value="Kg">Kg</option>
                <option value="Meter">Meter</option>
                <option value="Box">Box</option>
                <option value="Unit">Unit</option>
              </select>
            </div>
            {/* ... (Input Batas Min) ... */}
            <div>
              <label htmlFor="barang-batasMin-input" className="block text-sm font-medium text-gray-700 mb-1">Batas Stok Minimum</label>
              <input 
                type="number" 
                id="barang-batasMin-input" 
                name="batasMin"
                value={formData.batasMin}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100" 
                required 
                disabled={isLoading} // <-- Tambahkan disabled
              />
            </div>
          </div>
        </div>
        {/* Footer Modal */}
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

export default MasterBarang;