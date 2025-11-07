// src/components/MessageBar.jsx

import React from 'react';
import { useAppContext } from '../context/AppContext';

const MessageBar = () => {
  const { message } = useAppContext();

  if (!message.text) {
    return null; // Jangan render apapun jika tidak ada pesan
  }

  // Tentukan warna berdasarkan tipe
  const colors = {
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className={`p-4 mb-6 rounded-lg ${colors[message.type] || colors.info}`}>
      {message.text}
    </div>
  );
};

export default MessageBar;