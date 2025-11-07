// src/components/Modal.jsx

import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    // Backdrop
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 md:pt-20 bg-black bg-opacity-50" 
      onClick={onClose}
    >
      {/* Konten Modal */}
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden" 
        onClick={(e) => e.stopPropagation()} // Mencegah klik di dalam modal menutup modal
      >
        {/* Header Modal */}
        <div className="flex justify-between items-center p-5 bg-gray-50 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Body Modal (diisi oleh form) */}
        {children}

      </div>
    </div>
  );
};

export default Modal;