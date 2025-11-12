import React, { useCallback, useState } from 'react';
import { UploadIcon } from './Icons';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  imageUrl: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, imageUrl }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);
  
  const dragDropClasses = isDragging
    ? 'border-blue-500 bg-blue-50/50'
    : 'border-slate-300 bg-slate-50/50';

  return (
    <div className="w-full">
      <label
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`group flex justify-center items-center w-full h-64 px-4 transition-colors duration-300 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-400 ${dragDropClasses}`}
      >
        {imageUrl ? (
          <div className="relative w-full h-full flex items-center justify-center p-2">
            <img src={imageUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded-md" />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center rounded-lg">
              <p className="text-white font-semibold text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4">
                Click or drag to change image
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <UploadIcon className="w-10 h-10 mb-3 text-slate-400" />
            <p className="mb-2 text-sm text-slate-500">
              <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-500">PNG, JPG, or Barcode Image</p>
          </div>
        )}
        <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
      </label>
    </div>
  );
};