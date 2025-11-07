// src/pages/POList.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import PODetailModal from '../components/PODetailModal'; // Kita akan buat modal ini

const POList = () => {
  const { po, loadPO } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPoId, setSelectedPoId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadPO();
  }, []);

  const viewPODetail = (poId) => {
    setSelectedPoId(poId);
    setIsModalOpen(true);
  };

  const closePODetailModal = () => {
    setIsModalOpen(false);
    setSelectedPoId(null);
  };

  // Filter PO berdasarkan searchTerm
  const filteredPO = po.filter(item => 
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusClass = (status) => {
    switch (status) {
      case 'Outstanding': return 'bg-yellow-100 text-yellow-800';
      case 'Selesai': return 'bg-green-100 text-green-800';
      case 'Sebagian': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Logbook PO</h1>
        <button 
          onClick={() => navigate('/po/baru')}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-md hover:bg-indigo-700 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          <span className="hidden sm:inline">Buat PO Baru</span>
        </button>
      </div>
      
      {/* Search Bar */}
      <div className="mb-4">
        <input 
          type="text" 
          id="po-search" 
          placeholder="Cari No. PO..." 
          className="w-full md:w-1/3 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Tabel Data PO */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs text-gray-500 uppercase">
              <th className="py-3 px-6">Nomor PO</th>
              <th className="py-3 px-6">Tanggal</th>
              <th className="py-3 px-6">Pemasok</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPO.length === 0 ? (
              <tr><td colSpan="5" className="py-4 px-6 text-sm text-gray-500 text-center"><i>Tidak ada data PO.</i></td></tr>
            ) : (
              filteredPO.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td 
                    className="py-3 px-6 text-sm font-medium text-indigo-600 hover:underline cursor-pointer" 
                    onClick={() => viewPODetail(item.id)}
                  >
                    {item.id}
                  </td>
                  <td className="py-3 px-6 text-sm text-gray-700">{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                  <td className="py-3 px-6 text-sm text-gray-700">{item.pemasok?.nama || 'N/A'}</td>
                  <td className="py-3 px-6 text-sm">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-sm">
                    <button onClick={() => viewPODetail(item.id)} className="text-indigo-600 hover:text-indigo-800">Lihat</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Detail PO */}
      <PODetailModal
        isOpen={isModalOpen}
        onClose={closePODetailModal}
        poId={selectedPoId}
      />
    </div>
  );
};

export default POList;