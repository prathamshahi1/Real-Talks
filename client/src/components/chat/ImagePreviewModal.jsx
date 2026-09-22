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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#03150f] border-2 border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] animate-slide-up">
        {/* Header */}
        <div className="p-4 border-b border-emerald-500/20 bg-emerald-50/50 dark:bg-[#06241a]/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate">Image Preview</h3>
              <p className="text-[11px] text-slate-500 dark:text-emerald-300/70 truncate">
                {imageFile.name} • {fileSizeStr}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={sending}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-emerald-500/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Preview Box */}
        <div className="p-4 flex-1 overflow-y-auto flex items-center justify-center bg-slate-100/60 dark:bg-black/40 min-h-[220px] max-h-[420px]">
          <img
            src={imageUrl}
            alt="Preview"
            className="max-h-[360px] max-w-full rounded-2xl object-contain border border-emerald-500/20 shadow-xl"
          />
        </div>

        {/* Caption & Send Controls */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-emerald-500/20 bg-white dark:bg-[#03150f] space-y-3">
          <input
            type="text"
            autoFocus
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add an optional caption..."
            className="w-full px-4 py-3 rounded-2xl bg-emerald-50/60 dark:bg-[#020e0a] border-2 border-emerald-200/70 dark:border-emerald-800/60 focus:border-emerald-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-emerald-600/60 text-xs sm:text-sm outline-none transition-all"
          />

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-slate-700 dark:text-emerald-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
