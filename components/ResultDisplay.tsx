import React, { useState } from 'react';
import type { VerificationResult } from '../types';
import { ProductStatus } from '../types';
import { CheckCircleIcon, XCircleIcon, RefreshIcon, ShareIcon } from './Icons';


interface ResultDisplayProps {
  result: VerificationResult;
  onReset: () => void;
}

const statusConfig = {
  [ProductStatus.AUTHENTIC]: {
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-800',
    ringColor: 'stroke-emerald-500',
    icon: <CheckCircleIcon className="w-8 h-8 text-emerald-600" />,
  },
  [ProductStatus.COUNTERFEIT]: {
    bgColor: 'bg-rose-100',
    textColor: 'text-rose-800',
    ringColor: 'stroke-rose-500',
    icon: <XCircleIcon className="w-8 h-8 text-rose-600" />,
  },
};

const ConfidenceRing: React.FC<{ confidence: number, status: ProductStatus }> = ({ confidence, status }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (confidence / 100) * circumference;
  const color = status === ProductStatus.AUTHENTIC ? 'text-emerald-500' : 'text-rose-500';

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full" viewBox="0 0 120 120">
        <circle
          className="text-slate-200"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
        />
        <circle
          className={`${color} transition-all duration-1000 ease-in-out`}
          strokeWidth="10"
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
          style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${status === ProductStatus.AUTHENTIC ? 'text-emerald-600' : 'text-rose-600'}`}>{confidence}%</span>
        <span className="text-xs text-slate-500 font-medium">Confidence</span>
      </div>
    </div>
  );
};


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, onReset }) => {
  const config = statusConfig[result.status];
  const [shareError, setShareError] = useState<string | null>(null);

  const handleShare = async () => {
    setShareError(null);
    const shareData = {
      title: 'AuthentiCheck AI Result',
      text: `My ${result.brand} ${result.model} was verified as ${result.status} with ${result.confidence}% confidence by AuthentiCheck AI.`,
      url: window.location.origin, // Share the app's origin URL
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // User cancelled the share sheet, do nothing.
        console.log("Share cancelled by user.");
      } else {
        console.error('Error sharing the result:', err);
        setShareError('Oops! Sharing failed. Please try again.');
        // Hide the error message after 3 seconds
        setTimeout(() => setShareError(null), 3000);
      }
    }
  };

  return (
    <div className="animate-fade-in-up bg-slate-50 rounded-xl p-6 border border-slate-200">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-start gap-6 border-b border-slate-200 pb-6">
        <div className="flex-shrink-0">
          <img
            src={result.imageUrl}
            alt="Verified product"
            className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-lg border-4 border-white shadow-md"
          />
        </div>
        <div className="text-center md:text-left">
          <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full ${config.bgColor} ${config.textColor}`}>
            {config.icon}
            <span className="text-xl font-bold">{result.status}</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mt-3">{result.brand}</h2>
          <p className="text-lg text-slate-500">{result.model}</p>
        </div>
      </div>
      
      {/* Body Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        {/* Confidence Score */}
        <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Confidence Score</h3>
          <ConfidenceRing confidence={result.confidence} status={result.status} />
        </div>
        
        {/* Analysis Breakdown */}
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-700 mb-4 text-left">Analysis Breakdown</h3>
          <ul className="space-y-4">
            {result.reasons.map((reason, index) => (
              <li key={index} className="flex items-start gap-3">
                {reason.passed ? (
                  <CheckCircleIcon className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircleIcon className="w-6 h-6 text-rose-500 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold text-slate-800">{reason.title}</p>
                  <p className="text-sm text-slate-600">{reason.details}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Footer Section */}
      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-6 py-3 bg-slate-700 text-white font-semibold rounded-lg shadow-md hover:bg-slate-800 transition-colors focus:outline-none focus:ring-4 focus:ring-slate-300"
            >
              <RefreshIcon className="w-5 h-5" />
              Verify Another Product
            </button>
            {typeof navigator.share === 'function' && (
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-4 focus:ring-blue-300"
                aria-label="Share verification result"
              >
                <ShareIcon className="w-5 h-5" />
                Share Result
              </button>
            )}
        </div>
        {shareError && (
          <p className="text-rose-600 text-sm animate-fade-in">{shareError}</p>
        )}
      </div>
    </div>
  );
};