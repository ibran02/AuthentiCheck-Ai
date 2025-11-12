import React from 'react';
import type { VerificationResult } from '../types';
import { ProductStatus } from '../types';
import { CloseIcon, CheckCircleIcon, XCircleIcon } from './Icons';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: VerificationResult[];
  onClear: () => void;
}

const HistoryItem: React.FC<{ result: VerificationResult }> = ({ result }) => {
  const isAuthentic = result.status === ProductStatus.AUTHENTIC;
  return (
    <div className="flex items-center gap-4 p-3 bg-white rounded-lg shadow-sm border border-slate-200">
      <img src={result.imageUrl} alt={`${result.brand} ${result.model}`} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
      <div className="flex-grow overflow-hidden">
        <p className="font-bold text-slate-800 truncate">{result.brand}</p>
        <p className="text-sm text-slate-500 truncate">{result.model}</p>
      </div>
      <div className={`flex items-center gap-1.5 text-sm font-semibold px-2.5 py-1 rounded-full ${isAuthentic ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
        {isAuthentic ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
        <span>{result.status}</span>
      </div>
    </div>
  );
};

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, history, onClear }) => {
  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-slate-50 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <header className="flex items-center justify-between p-4 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">Verification History</h2>
            <button onClick={onClose} className="p-1 text-slate-500 hover:bg-slate-200 rounded-full transition-colors" aria-label="Close history panel">
              <CloseIcon className="w-6 h-6" />
            </button>
          </header>

          {/* Body */}
          <div className="flex-1 p-4 overflow-y-auto">
            {history.length > 0 ? (
              <div className="space-y-3">
                {history.map((item, index) => (
                  <HistoryItem key={index} result={item} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
                <p className="font-semibold">No History Yet</p>
                <p className="text-sm">Your verified products will appear here.</p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          {history.length > 0 && (
             <footer className="p-4 border-t border-slate-200">
                <button 
                  onClick={onClear} 
                  className="w-full px-4 py-2.5 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                >
                    Clear History
                </button>
            </footer>
          )}
        </div>
      </div>
    </>
  );
};