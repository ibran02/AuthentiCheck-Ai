import React from 'react';
import { ShieldCheckIcon, HistoryIcon } from './Icons';

interface HeaderProps {
  onHistoryToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onHistoryToggle }) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/80 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <ShieldCheckIcon className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Authenti<span className="text-blue-600">Check AI</span>
          </h1>
        </div>
        <button 
          onClick={onHistoryToggle}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
          aria-label="View verification history"
        >
          <HistoryIcon className="w-5 h-5" />
          <span className="hidden sm:inline font-medium">History</span>
        </button>
      </div>
    </header>
  );
};