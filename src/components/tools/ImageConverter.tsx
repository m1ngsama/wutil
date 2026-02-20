/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { toast } from 'sonner';

export default function ImageConverterComponent() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [format, setFormat] = useState('image/jpeg');
  const [quality, setQuality] = useState(0.8);
  const [width, setWidth] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [processing, setProcessing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setProcessedImage(null);
      
      // Reset dimensions to original
      const img = new Image();
      img.onload = () => {
        setWidth(img.width);
        setHeight(img.height);
      };
      img.src = URL.createObjectURL(file);
  };

  const processImage = () => {
    if (!imageFile || !canvasRef.current) return;
    setProcessing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Calculate dimensions
      let targetWidth = width || img.width;
      let targetHeight = height || img.height;

      // Maintain aspect ratio if one is missing (though simpler logic for now)
      if (width && !height) {
        const ratio = img.height / img.width;
        targetHeight = Math.round(Number(width) * ratio);
        setHeight(targetHeight);
      } else if (!width && height) {
        const ratio = img.width / img.height;
        targetWidth = Math.round(Number(height) * ratio);
        setWidth(targetWidth);
      }

      canvas.width = Number(targetWidth);
      canvas.height = Number(targetHeight);

      // Draw and convert
      ctx.drawImage(img, 0, 0, Number(targetWidth), Number(targetHeight));
      
      const dataUrl = canvas.toDataURL(format, quality);
      setProcessedImage(dataUrl);
      setProcessing(false);
      toast.success('Image converted successfully!');
    };
    img.src = previewUrl!;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
       <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
            Image Converter & Compressor
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Convert, resize, and compress images entirely in your browser.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <div 
            className={`bg-white dark:bg-gray-800 shadow rounded-lg p-6 border-2 border-dashed transition-colors ${
              isDragging ? 'border-blue-500 bg-blue-50 dark:bg-gray-700' : 'border-transparent'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Image</label>
             <input
               type="file"
               accept="image/*"
               onChange={handleFileChange}
               className="block w-full text-sm text-gray-500
                 file:mr-4 file:py-2 file:px-4
                 file:rounded-full file:border-0
                 file:text-sm file:font-semibold
                 file:bg-blue-50 file:text-blue-700
                 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-200"
             />
             <p className="mt-2 text-xs text-gray-400">or drag and drop here</p>
             {imageFile && (
               <p className="mt-2 text-sm text-gray-500">
                 Original: {formatSize(imageFile.size)} | {imageFile.type}
               </p>
             )}
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4">
             <h3 className="text-lg font-medium text-gray-900 dark:text-white">Settings</h3>
             
             <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Format</label>
               <select
                 value={format}
                 onChange={(e) => setFormat(e.target.value)}
                 className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
               >
                 <option value="image/jpeg">JPEG</option>
                 <option value="image/png">PNG</option>
                 <option value="image/webp">WebP</option>
               </select>
             </div>

             {format !== 'image/png' && (
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                   Quality ({Math.round(quality * 100)}%)
                 </label>
                 <input
                   type="range"
                   min="0.1"
                   max="1"
                   step="0.1"
                   value={quality}
                   onChange={(e) => setQuality(parseFloat(e.target.value))}
                   className="w-full"
                 />
               </div>
             )}

             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Width (px)</label>
                 <input
                   type="number"
                   value={width}
                   onChange={(e) => setWidth(e.target.value ? Number(e.target.value) : '')}
                   className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Height (px)</label>
                 <input
                   type="number"
                   value={height}
                   onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : '')}
                   className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                 />
               </div>
             </div>

             <button
               onClick={processImage}
               disabled={!imageFile || processing}
               className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
             >
               {processing ? 'Processing...' : 'Convert Image'}
             </button>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-gray-300 dark:border-gray-700">
           {processedImage ? (
             <div className="text-center w-full">
               <img src={processedImage} alt="Processed" className="max-h-[500px] mx-auto mb-4 shadow-lg rounded" />
               <a
                 href={processedImage}
                 download={`converted.${format.split('/')[1]}`}
                 className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none"
               >
                 Download Image
               </a>
             </div>
           ) : previewUrl ? (
             <img src={previewUrl} alt="Preview" className="max-h-[500px] opacity-70" />
           ) : (
             <div className="text-center text-gray-500">
               <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
               </svg>
               <p className="mt-1">No image uploaded</p>
             </div>
           )}
           <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
}
