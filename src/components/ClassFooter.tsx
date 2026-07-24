import React from 'react';

export const ClassFooter: React.FC = () => {
  return (
    <div className="mt-6 pt-3 border-t border-slate-800/70 flex items-center justify-center gap-2 text-center text-slate-400 text-xs px-2">
      <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 flex items-center justify-center font-bold text-[11px] shrink-0 shadow-sm">
        i
      </div>
      <p className="text-[11px] text-slate-300 font-medium leading-tight">
        Buatan murid MAN 1 kota Makassar <strong className="text-cyan-300 font-bold">Muhammad Syauqi Fayyadh</strong>
      </p>
    </div>
  );
};
