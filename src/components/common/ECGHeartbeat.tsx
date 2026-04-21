import React from 'react';

export const ECGHeartbeat: React.FC<{ color?: string; className?: string }> = ({ color = '#0EA5E9', className = "" }) => {
  return (
    <div className={`relative w-16 h-8 ${className}`}>
      <svg
        viewBox="0 0 100 40"
        className="w-full h-full overflow-visible"
      >
        <path
          d="M 0 20 L 10 20 L 15 15 L 20 25 L 25 20 L 35 20 L 40 5 L 45 35 L 50 20 L 60 20 L 65 15 L 70 25 L 75 20 L 100 20"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ecg-line"
        />
        {/* Glow effect */}
        <path
          d="M 0 20 L 10 20 L 15 15 L 20 25 L 25 20 L 35 20 L 40 5 L 45 35 L 50 20 L 60 20 L 65 15 L 70 25 L 75 20 L 100 20"
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ecg-line blur-[2px] opacity-30"
        />
      </svg>
    </div>
  );
};
