import React from 'react';
import { X, Download } from 'lucide-react';

const ImageLightboxModal = ({ isOpen, imageUrl, onClose }) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in cursor-zoom-out"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center cursor-default"
      >
        {/* Floating Action Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors shadow-lg backdrop-blur-md"
            title="Open Original / Download"
          >
            <Download className="w-4 h-4" />
          </a>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors shadow-lg backdrop-blur-md cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Full Image */}
        <img
          src={imageUrl}
          alt="Full View"
          className="max-w-full max-h-[85vh] rounded-3xl object-contain shadow-2xl border border-slate-800"
        />
      </div>
    </div>
  );
};

export default ImageLightboxModal;
