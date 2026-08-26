import React, { useState } from 'react';
import { X, Send, Image as ImageIcon, Loader2 } from 'lucide-react';

const ImagePreviewModal = ({ isOpen, imageFile, onClose, onSend, sending }) => {
  const [caption, setCaption] = useState('');

  if (!isOpen || !imageFile) return null;

  const imageUrl = URL.createObjectURL(imageFile);
  const fileSizeKB = Math.round(imageFile.size / 1024);
  const fileSizeStr = fileSizeKB > 1024 ? `${(fileSizeKB / 1024).toFixed(1)} MB` : `${fileSizeKB} KB`;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend({ file: imageFile, caption: caption.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Image Preview</h3>
              <p className="text-[11px] text-slate-400">
                {imageFile.name} • {fileSizeStr}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={sending}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Preview Box */}
        <div className="p-4 flex-1 overflow-y-auto flex items-center justify-center bg-slate-950/70 min-h-[260px] max-h-[420px]">
          <img
            src={imageUrl}
            alt="Preview"
            className="max-h-[380px] max-w-full rounded-2xl object-contain border border-slate-800 shadow-xl"
          />
        </div>

        {/* Caption & Send Controls */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-800 bg-slate-900 space-y-3">
          <input
            type="text"
            autoFocus
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add an optional caption..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-white placeholder-slate-500 text-xs outline-none transition-all"
          />

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {sending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Image</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
