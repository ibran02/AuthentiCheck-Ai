import React, { useState, useEffect } from 'react';
import type { VerificationResult } from './types';
import { verifyProduct, verifyProductByBarcode } from './services/verificationService';

import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { Loader } from './components/Loader';
import { ResultDisplay } from './components/ResultDisplay';
import { MetricsDisplay } from './components/MetricsDisplay';
import { HistoryPanel } from './components/HistoryPanel';
import { Chatbot } from './components/Chatbot';
import { ChatIcon, BarcodeIcon } from './components/Icons';


const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [barcode, setBarcode] = useState<string>('');
  const [inputMode, setInputMode] = useState<'upload' | 'manual'>('upload');

  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [history, setHistory] = useState<VerificationResult[]>(() => {
    try {
      const savedHistory = localStorage.getItem('verificationHistory');
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (e) {
      console.error("Failed to parse history from localStorage", e);
      return [];
    }
  });

  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('verificationHistory', JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save history to localStorage", e);
    }
  }, [history]);

  const handleFileSelect = (selectedFile: File) => {
    if (isLoading) return;
    setResult(null);
    setError(null);
    setFile(selectedFile);
    
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setImageUrl(objectUrl);
  };

  const handleVerification = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let verificationResult: Omit<VerificationResult, 'imageUrl'>;
      let finalImageUrl: string;

      if (inputMode === 'upload' && file) {
        verificationResult = await verifyProduct(file);
        finalImageUrl = imageUrl!;
      } else if (inputMode === 'manual' && barcode.trim()) {
        verificationResult = await verifyProductByBarcode(barcode.trim());
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="60" viewBox="0 0 240 60"><rect width="240" height="60" fill="white"/><g transform="translate(10, 5)" stroke="black" stroke-width="2.5"><path d="M5 0V50 M10 0V50 M17.5 0V50 M22.5 0V50 M30 0V50 M40 0V50 M45 0V50 M55 0V50 M62.5 0V50 M70 0V50 M80 0V50 M87.5 0V50 M92.5 0V50 M100 0V50 M110 0V50 M117.5 0V50 M125 0V50 M130 0V50 M140 0V50 M145 0V50 M155 0V50 M162.5 0V50 M167.5 0V50 M175 0V50 M185 0V50 M190 0V50 M200 0V50 M205 0V50 M215 0V50 M220 0V50"/></g></svg>`;
        finalImageUrl = `data:image/svg+xml;base64,${btoa(svg)}`;
      } else {
        throw new Error("Please select a file or enter a barcode to verify.");
      }
      
      const finalResult = { ...verificationResult, imageUrl: finalImageUrl };
      setResult(finalResult);
      setHistory(prevHistory => [finalResult, ...prevHistory]);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setIsLoading(false);
    setBarcode('');
    setInputMode('upload');
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
      setImageUrl(null);
    }
  };
  
  const handleClearHistory = () => {
    setHistory([]);
  }

  const isVerificationDisabled = 
    (inputMode === 'upload' && !file) || 
    (inputMode === 'manual' && !barcode.trim());

  return (
    <div className="bg-slate-100 min-h-screen font-sans">
      <Header onHistoryToggle={() => setIsHistoryPanelOpen(true)} />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-3xl font-bold text-center text-slate-800">
              Verify Your Product's Authenticity
            </h2>
            <p className="mt-2 text-center text-slate-500 max-w-xl mx-auto">
              Upload a photo or enter a barcode, and our AI will analyze it to detect counterfeits.
            </p>

            <div className="mt-8">
              {!result && !isLoading && (
                 <div className="animate-fade-in-up">
                    <div className="mb-6 p-1 bg-slate-200 rounded-lg flex items-center justify-center max-w-sm mx-auto">
                      <button 
                        onClick={() => setInputMode('upload')}
                        className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-all ${inputMode === 'upload' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:bg-slate-200/70'}`}
                      >
                        Upload Image
                      </button>
                      <button 
                        onClick={() => setInputMode('manual')}
                        className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-all ${inputMode === 'manual' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:bg-slate-200/70'}`}
                      >
                        Enter Barcode
                      </button>
                    </div>

                    <div className="min-h-[16rem] flex flex-col items-center justify-center">
                      {inputMode === 'upload' ? (
                         <FileUpload onFileSelect={handleFileSelect} imageUrl={imageUrl} />
                      ) : (
                        <div className="w-full max-w-md">
                          <label htmlFor="barcode-input" className="block text-sm font-medium text-slate-700 mb-2">
                            Barcode Number
                          </label>
                          <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <BarcodeIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
                            </div>
                            <input
                              type="text"
                              id="barcode-input"
                              value={barcode}
                              onChange={(e) => setBarcode(e.target.value)}
                              placeholder="e.g., 036000291452"
                              className="block w-full rounded-md border-slate-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                     <div className="mt-6 text-center">
                        <button 
                          onClick={handleVerification} 
                          disabled={isVerificationDisabled}
                          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                          Verify Product
                        </button>
                      </div>
                 </div>
              )}
              {isLoading && <Loader />}
              {result && !isLoading && (
                <ResultDisplay result={result} onReset={handleReset} />
              )}
            </div>

            {error && !isLoading && (
              <div className="mt-6 text-center bg-rose-100 text-rose-700 p-4 rounded-lg">
                <p className="font-semibold">Verification Failed</p>
                <p>{error}</p>
                <button 
                   onClick={handleReset}
                   className="mt-2 px-4 py-1 bg-rose-600 text-white rounded-md text-sm font-medium hover:bg-rose-700"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
          <MetricsDisplay />
        </div>
      </main>
      
      <HistoryPanel 
        isOpen={isHistoryPanelOpen}
        onClose={() => setIsHistoryPanelOpen(false)}
        history={history}
        onClear={handleClearHistory}
      />
      
      {!isChatbotOpen && (
        <button
          onClick={() => setIsChatbotOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300 z-40"
          aria-label="Open chat assistant"
        >
          <ChatIcon className="w-8 h-8" />
        </button>
      )}
      
      {isChatbotOpen && <Chatbot onClose={() => setIsChatbotOpen(false)} />}
    </div>
  );
};

export default App;
