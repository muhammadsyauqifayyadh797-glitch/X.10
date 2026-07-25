import React from 'react';

export const ClassFooter: React.FC = () => {
  const handleDownloadSingleHTML = () => {
    const link = document.createElement('a');
    link.href = '/absen_piket_x10.html';
    link.download = 'absen_piket_x10.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-6 pt-3 border-t border-slate-800/70 flex flex-col items-center justify-center gap-2 text-center text-slate-400 text-xs px-2">
      <button
        onClick={handleDownloadSingleHTML}
        type="button"
        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950 via-slate-900 to-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold text-[11px] flex items-center gap-1.5 hover:border-cyan-400 hover:text-cyan-200 transition-all shadow-md active:scale-95"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>Unduh Single File HTML Utuh (.html)</span>
      </button>

      <div className="flex items-center gap-1.5 text-center">
        <div className="w-4 h-4 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 flex items-center justify-center font-bold text-[10px] shrink-0">
          i
        </div>
        <p className="text-[11px] text-slate-300 font-medium leading-tight">
          Buatan murid MAN 1 kota Makassar <strong className="text-cyan-300 font-bold">Muhammad Syauqi Fayyadh</strong>
        </p>
      </div>
    </div>
  );
};

