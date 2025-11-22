import React from 'react';

export const Logo: React.FC = () => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
    <defs>
      <linearGradient id="logo_bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#022c22" />
        <stop offset="1" stopColor="#064e3b" />
      </linearGradient>
      
      <linearGradient id="logo_border" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#34d399" stopOpacity="0.5" />
        <stop offset="0.5" stopColor="#34d399" stopOpacity="0.1" />
        <stop offset="1" stopColor="#34d399" stopOpacity="0.5" />
      </linearGradient>
      
      <linearGradient id="text_grad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor="#6ee7b7" />
      </linearGradient>

      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
        <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.3)" />
      </filter>
    </defs>

    {/* Main Body */}
    <rect x="3" y="3" width="94" height="94" rx="24" fill="url(#logo_bg)" />
    <rect x="3" y="3" width="94" height="94" rx="24" stroke="url(#logo_border)" strokeWidth="2" />
    
    {/* Top Gloss Reflection - Adjusted curve for liquid feel */}
    <path d="M 12 30 Q 12 12 30 12 H 70 Q 88 12 88 30 Q 88 45 50 50 Q 12 45 12 30 Z" fill="white" fillOpacity="0.07" />

    {/* Bottom Rim Light (Subtle) */}
    <path d="M 20 90 Q 50 96 80 90" stroke="#34d399" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />

    {/* Centered Text */}
    <text 
      x="50" 
      y="54" 
      textAnchor="middle" 
      dominantBaseline="central"
      fontFamily="'Grand Hotel', cursive" 
      fontSize="70" 
      fill="url(#text_grad)"
      filter="url(#glow)"
      style={{ userSelect: 'none', textShadow: '0 2px 10px rgba(52, 211, 153, 0.2)' }}
    >
      B
    </text>
  </svg>
);