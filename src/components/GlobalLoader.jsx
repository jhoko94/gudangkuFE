// src/components/GlobalLoader.jsx

import React from 'react';
import { Loader2 } from 'lucide-react'; // Icon spinner yang bagus
import { useAppContext } from '../context/AppContext';

const GlobalLoader = () => {
  const { isLoading } = useAppContext();

  // Jika tidak loading, jangan render apa-apa
  if (!isLoading) {
    return null;
  }

  // Jika loading, tampilkan overlay
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex justify-center items-center">
      <div className="flex flex-col items-center">
        {/* Ini adalah ikon spinner yang berputar */}
        <Loader2 className="w-12 h-12 text-white animate-spin" />
        <span className="text-white text-lg mt-3 font-medium">Memproses...</span>
      </div>
    </div>
  );
};

export default GlobalLoader;