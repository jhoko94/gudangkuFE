// src/pages/Dashboard.jsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  AlertTriangle, FileText, ClipboardList, 
  ArrowDownLeft, ArrowUpRight, Archive 
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  // Ambil 'groupedStokKritis' dari dashboardData
  const { dashboardData, loadDashboard } = useAppContext();
  const { statStokKritis, statPoOutstanding, statBarangKeluar, groupedStokKritis } = dashboardData;
  
  useEffect(() => {
    loadDashboard();
  }, []); // [] artinya "hanya jalankan sekali saat mount"

  // Fungsi navigasi BARU yang lebih cerdas
  // Aksi 1 & 2 akan memanggil fungsi ini
  const goToBuatPO = (pemasokId, items) => {
    // 'items' adalah array dari objek barang
    
    // Validasi: Jangan biarkan membuat PO untuk grup "Tanpa Pemasok"
    if (pemasokId === 'unknown') {
        alert('Barang ini belum memiliki pemasok. Harap tetapkan pemasok di Master Barang.');
        return;
    }
    
    // Kirim state ke halaman PONew
    navigate('/po/baru', { 
        state: { 
            prefillPemasokId: pemasokId,
            // Ubah format 'items' agar sesuai dengan state di PONew
            prefillItems: items.map(item => ({ 
                barangId: item.id, 
                jumlahPesan: 1 // Anda bisa ubah default jumlah di sini (misal: batasMin - stok)
            }))
        } 
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      {/* Stat Cards (Tidak Berubah) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Stok Kritis" value={statStokKritis} icon={AlertTriangle} color="red" />
        <StatCard title="PO Outstanding" value={statPoOutstanding} icon={FileText} color="yellow" />
        <StatCard title="Barang Keluar (Hari Ini)" value={statBarangKeluar} icon={ClipboardList} color="blue" />
      </div>

      {/* Pintasan (Shortcuts) (Tidak Berubah) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ShortcutButton title="Terima Barang" icon={ArrowDownLeft} color="indigo" onClick={() => navigate('/inbound')} />
        <ShortcutButton title="Keluarkan Barang" icon={ArrowUpRight} color="blue" onClick={() => navigate('/outbound')} />
        <ShortcutButton title="Cek Stok" icon={Archive} color="gray" onClick={() => navigate('/stok')} />
      </div>

      {/* --- Daftar Stok Kritis (DIRUBAH TOTAL) --- */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Daftar Stok Kritis (Segera Buat PO)</h2>
        
        {/* Cek jika data ada */}
        {!groupedStokKritis || groupedStokKritis.length === 0 ? (
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 text-center text-gray-500">
                Tidak ada stok kritis. Kerja bagus!
            </div>
        ) : (
            // Render setiap grup pemasok
            <div className="space-y-6">
                {groupedStokKritis.map(group => (
                    <div key={group.pemasokId} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                        {/* Header Grup Pemasok */}
                        <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
                            <h3 className="text-lg font-semibold text-gray-800">{group.namaPemasok}</h3>
                            {/* Tombol Buat PO untuk GRUP (Aksi 1) */}
                            <button
                                onClick={() => goToBuatPO(group.pemasokId, group.items)}
                                disabled={group.pemasokId === 'unknown'}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-400"
                            >
                                Buat PO (Semua {group.items.length} Item)
                            </button>
                        </div>
                        
                        {/* Tabel Item di dalam Grup */}
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                                <thead className="bg-white">
                                    <tr className="text-left text-xs text-gray-500 uppercase">
                                        <th className="py-2 px-6">Nama Barang</th>
                                        <th className="py-2 px-4">Stok Saat Ini</th>
                                        <th className="py-2 px-4">Batas Min.</th>
                                        <th className="py-2 px-4">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {group.items.map(item => (
                                        <tr key={item.id} className="bg-red-50 hover:bg-red-100">
                                            <td className="py-3 px-6 text-sm font-medium text-gray-800">{item.nama}</td>
                                            <td className="py-3 px-4 text-sm font-bold text-red-600">{item.stok}</td>
                                            <td className="py-3 px-4 text-sm text-gray-700">{item.batasMin}</td>
                                            <td className="py-3 px-4 text-sm">
                                                {/* Tombol Buat PO untuk ITEM (Aksi 2) */}
                                                <button 
                                                    onClick={() => goToBuatPO(group.pemasokId, [item])} // Kirim sbg array 1 item
                                                    disabled={group.pemasokId === 'unknown'}
                                                    className="bg-red-600 text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-red-700 disabled:bg-gray-400"
                                                >
                                                    Buat PO
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
      {/* ------------------------------------------- */}
    </div>
  );
};

// --- Komponen StatCard dan ShortcutButton (Tidak Berubah) ---
const StatCard = ({ title, value, icon: Icon, color }) => {
  const colors = {
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    blue: 'text-blue-600',
  };
  const iconColors = {
    red: 'text-red-500',
    yellow: 'text-yellow-500',
    blue: 'text-blue-500',
  }
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-gray-500">{title}</div>
          <div className={`text-3xl font-bold ${colors[color]}`}>{value}</div>
        </div>
        <Icon className={`w-10 h-10 ${iconColors[color]}`} />
      </div>
    </div>
  );
};

const ShortcutButton = ({ title, icon: Icon, color, onClick }) => {
   const colors = {
    indigo: 'bg-indigo-600 hover:bg-indigo-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    gray: 'bg-gray-700 hover:bg-gray-800',
  };
  return (
    <button 
      onClick={onClick} 
      className={`flex flex-col items-center justify-center text-white p-6 rounded-xl shadow-lg transition duration-200 ${colors[color]}`}
    >
      <Icon className="w-12 h-12 mb-3" />
      <span className="text-xl font-semibold">{title}</span>
    </button>
  );
};

export default Dashboard;