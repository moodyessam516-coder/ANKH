
import React from 'react';
import { AppView } from '../types';

interface NavbarProps {
  setPage: (page: AppView) => void;
  currentPage: AppView;
  isAdmin?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ setPage, currentPage, isAdmin }) => {
  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-[#111]/80 backdrop-blur-2xl border border-gray-800 rounded-3xl flex justify-around items-center py-2 px-2 z-[60] shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all">
      <button 
        onClick={() => setPage(AppView.HOME)}
        className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-300 ${currentPage === AppView.HOME ? 'text-yellow-500' : 'text-gray-500 hover:text-gray-300'}`}
      >
        <span className="text-xl">🏠</span>
      </button>
      <button 
        onClick={() => setPage(AppView.REELS)}
        className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-300 ${currentPage === AppView.REELS ? 'text-yellow-500' : 'text-gray-500 hover:text-gray-300'}`}
      >
        <span className="text-xl">🎬</span>
      </button>
      
      {/* Manifest Central Button */}
      <button 
        onClick={() => setPage(AppView.CREATE)}
        className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-500 transform ${currentPage === AppView.CREATE ? 'bg-yellow-600 text-black scale-110 -translate-y-4 shadow-[0_10px_25px_rgba(202,138,4,0.4)]' : 'bg-yellow-600/10 text-yellow-500 hover:scale-110 hover:-translate-y-2'}`}
      >
        <span className="text-3xl font-light">+</span>
      </button>

      <button 
        onClick={() => setPage(AppView.MESSAGES)}
        className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-300 ${currentPage === AppView.MESSAGES ? 'text-yellow-500' : 'text-gray-500 hover:text-gray-300'}`}
      >
        <span className="text-xl">💬</span>
      </button>
      
      <button 
        onClick={() => setPage(isAdmin && currentPage === AppView.PROFILE ? AppView.ADMIN : AppView.PROFILE)}
        className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-300 ${currentPage === AppView.PROFILE || currentPage === AppView.ADMIN ? 'text-yellow-500' : 'text-gray-500 hover:text-gray-300'}`}
      >
        <span className="text-xl">{isAdmin && currentPage !== AppView.PROFILE ? '🛠️' : '👤'}</span>
      </button>
    </nav>
  );
};
