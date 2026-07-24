import React from 'react';

export const OceanBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-gradient-to-b from-slate-950 via-cyan-950 to-slate-950">
      {/* Deep Ocean Water Glow Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.25),rgba(255,255,255,0))]" />
      
      {/* Aquatic Light Beams */}
      <div className="absolute top-0 left-1/4 w-96 h-[500px] bg-cyan-400/10 blur-[120px] rounded-full transform -rotate-12 animate-pulse" />
      <div className="absolute top-10 right-1/4 w-80 h-[400px] bg-blue-500/10 blur-[100px] rounded-full transform rotate-12 animate-pulse" />

      {/* Floating Sea Bubbles */}
      <div className="absolute bottom-10 left-[10%] w-3 h-3 rounded-full bg-cyan-300/30 blur-[1px] animate-[float-bubble_6s_infinite_linear]" />
      <div className="absolute bottom-10 left-[30%] w-5 h-5 rounded-full bg-sky-200/25 blur-[1px] animate-[float-bubble_9s_infinite_linear_2s]" />
      <div className="absolute bottom-10 left-[60%] w-2 h-2 rounded-full bg-teal-300/40 blur-[1px] animate-[float-bubble_7s_infinite_linear_1s]" />
      <div className="absolute bottom-10 left-[85%] w-4 h-4 rounded-full bg-cyan-200/30 blur-[1px] animate-[float-bubble_8s_infinite_linear_4s]" />

      {/* Bottom Ocean Waves */}
      <div className="absolute bottom-0 left-0 w-[200%] h-24 opacity-25">
        <svg className="w-full h-full animate-wave" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path
            d="M0,0 C150,90 350,-40 500,60 C650,160 900,10 1200,40 L1200,120 L0,120 Z"
            fill="url(#oceanGrad1)"
          />
          <defs>
            <linearGradient id="oceanGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 w-[200%] h-20 opacity-15">
        <svg className="w-full h-full animate-wave" style={{ animationDuration: '16s', animationDelay: '-3s' }} viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path
            d="M0,30 C200,80 400,0 600,50 C800,100 1000,20 1200,60 L1200,120 L0,120 Z"
            fill="#38bdf8"
          />
        </svg>
      </div>
    </div>
  );
};
