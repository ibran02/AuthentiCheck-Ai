import React from 'react';

export const Loader: React.FC = () => {
  const messages = [
    "Analyzing image features...",
    "Comparing with our database...",
    "Verifying barcode integrity...",
    "Running OCR on labels...",
    "Finalizing confidence score...",
  ];
  const [message, setMessage] = React.useState(messages[0]);

  React.useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setMessage(messages[index]);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold text-slate-600 transition-opacity duration-500">{message}</p>
    </div>
  );
};