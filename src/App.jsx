// src/App.jsx

import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

import GlobalLoader from './components/GlobalLoader.jsx'; // <-- 1. IMPORT DI SINI

// Import Komponen & Halaman
import Sidebar from './components/Sidebar';
import MessageBar from './components/MessageBar';
import Dashboard from './pages/Dashboard.jsx';
import MasterBarang from './pages/MasterBarang.jsx';
import MasterPemasok from './pages/MasterPemasok.jsx'; // <-- Tambahkan .jsx
import MasterTujuan from './pages/MasterTujuan.jsx'; // <-- Tambahkan .jsx
import POList from './pages/POList.jsx';               // <-- Tambahkan .jsx
import PONew from './pages/PONew.jsx';                 // <-- Tambahkan .jsx
import Inbound from './pages/Inbound.jsx';             // <-- Tambahkan .jsx
import Outbound from './pages/Outbound.jsx';           // <-- Tambahkan .jsx
import StokList from './pages/StokList.jsx';           // <-- Tambahkan .jsx
import StokOpname from './pages/StokOpname.jsx';       // <-- Tambahkan .jsx
import StokScrap from './pages/StokScrap.jsx';         // <-- Tambahkan .jsx

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Ganti ikon Lucide saat me-render
  // Ini adalah pengganti lucide.createIcons()
  // Di React, kita tidak membutuhkannya lagi karena kita mengimpor komponen ikon
  
  return (
    <div className="flex h-screen bg-gray-100">

      <GlobalLoader /> {/* <-- 2. TAMBAHKAN DI SINI */}
      
      {/* ==== SIDEBAR ==== */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
        ></div>
      )}

      {/* ==== KONTEN UTAMA ==== */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto md:ml-64">
        
        {/* Header (Mobile) */}
        <header className="md:hidden bg-white shadow-md sticky top-0 z-10 flex justify-between items-center p-4">
          <h2 className="text-xl font-bold text-gray-900">Gudang Kita</h2>
          <button onClick={() => setSidebarOpen(true)} className="text-gray-700 hover:text-gray-900">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Wrapper Konten Sebenarnya */}
        <main className="flex-1 p-4 md:p-8">
          {/* Global Message Bar */}
          <MessageBar />

          {/* Ini adalah pengganti div.page Anda.
            React Router akan otomatis menampilkan halaman yang benar.
          */}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            
            <Route path="/po" element={<POList />} />
            <Route path="/po/baru" element={<PONew />} />
            <Route path="/inbound" element={<Inbound />} />
            <Route path="/outbound" element={<Outbound />} />
            
            <Route path="/stok" element={<StokList />} />
            <Route path="/stok/opname" element={<StokOpname />} />
            <Route path="/stok/scrap" element={<StokScrap />} />

            <Route path="/master/barang" element={<MasterBarang />} />
            <Route path="/master/pemasok" element={<MasterPemasok />} />
            <Route path="/master/tujuan" element={<MasterTujuan />} />
            
            {/* Tambahkan route lain jika perlu */}
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;