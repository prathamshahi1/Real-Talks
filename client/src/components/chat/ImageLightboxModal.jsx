import React from 'react';
import { X, Download } from 'lucide-react';

const ImageLightboxModal = ({ isOpen, imageUrl, onClose }) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl animate-fade-in cursor-zoom-out"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[92dvh] flex flex-col items-center justify-center cursor-default"
      >
        {/* Floating Action Controls */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2 z-10">
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="p-2.5 rounded-2xl bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white border border-emerald-500/30 transition-all shadow-xl backdrop-blur-md"
            title="Open Original / Download"
          >
            <Download className="w-4 h-4 text-emerald-400" />
          </a>
          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white border border-emerald-500/30 transition-all shadow-xl backdrop-blur-md cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Full Image */}
        <img
          src={imageUrl}
          alt="Full View"
          className="max-w-full max-h-[85dvh] rounded-3xl object-contain shadow-2xl border-2 border-emerald-500/20"
        />
      </div>
    </div>
  );
};

export default ImageLightboxModal;
