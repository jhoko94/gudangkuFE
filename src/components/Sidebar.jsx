// src/components/Sidebar.jsx

import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Warehouse, X, LayoutDashboard, FileText, ArrowDownLeft, ArrowUpRight,
  Archive, ClipboardCheck, Trash2, Package, Truck, Users
} from 'lucide-react';

// Komponen helper untuk link
const SidebarLink = ({ to, icon: Icon, children, onClick }) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      // NavLink otomatis menambahkan class 'active'
      // Kita perlu memberitahu Tailwind cara men-style-nya
      className={({ isActive }) => 
        `flex items-center px-3 py-2.5 rounded-lg font-medium transition duration-200 hover:bg-gray-700 hover:text-white ${
          isActive ? 'bg-indigo-700 text-white' : '' // Ini menggantikan .sidebar-link.active
        }`
      }
    >
      <Icon className="w-5 h-5 mr-3" />
      {children}
    </NavLink>
  );
};

const Sidebar = ({ isOpen, setIsOpen }) => {
  // Fungsi untuk menutup sidebar di mobile setelah link diklik
  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <aside 
      id="sidebar" 
      className={`fixed top-0 left-0 z-40 w-64 h-screen bg-gray-900 text-gray-300 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="px-6 py-5 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-white flex items-center">
          <Warehouse className="w-7 h-7 mr-2" />
          Gudang Kita
        </Link>
        <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white md:hidden">
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {/* Grup Navigasi: Utama */}
        <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Utama</h3>
        <SidebarLink to="/" icon={LayoutDashboard} onClick={handleLinkClick}>
          Dashboard
        </SidebarLink>

        {/* Grup Navigasi: Transaksi */}
        <h3 className="mt-4 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaksi</h3>
        <SidebarLink to="/po" icon={FileText} onClick={handleLinkClick}>
          Purchase Order (PO)
        </SidebarLink>
        <SidebarLink to="/inbound" icon={ArrowDownLeft} onClick={handleLinkClick}>
          Terima Barang
        </SidebarLink>
        <SidebarLink to="/outbound" icon={ArrowUpRight} onClick={handleLinkClick}>
          Keluarkan Barang
        </SidebarLink>
        
        {/* Grup Navigasi: Stok */}
        <h3 className="mt-4 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stok</h3>
        <SidebarLink to="/stok" icon={Archive} onClick={handleLinkClick}>
          Kartu Stok
        </SidebarLink>
        {/* <SidebarLink to="/stok/opname" icon={ClipboardCheck} onClick={handleLinkClick}>
          Stok Opname
        </SidebarLink> */}
        <SidebarLink to="/stok/scrap" icon={Trash2} onClick={handleLinkClick}>
          Barang Rusak
        </SidebarLink>

        {/* Grup Navigasi: Master Data */}
        <h3 className="mt-4 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Master Data</h3>
        <SidebarLink to="/master/barang" icon={Package} onClick={handleLinkClick}>
          Master Barang
        </SidebarLink>
        <SidebarLink to="/master/pemasok" icon={Truck} onClick={handleLinkClick}>
          Master Pemasok
        </SidebarLink>
        <SidebarLink to="/master/tujuan" icon={Users} onClick={handleLinkClick}>
          Master Tujuan
        </SidebarLink>
      </nav>
    </aside>
  );
};

export default Sidebar;