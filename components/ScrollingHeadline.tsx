'use client';

import React from 'react';

export default function ScrollingHeadline() {
  const welcomeText = "Manikanta Marriage Bureau 9573166450";
  const repeatedText = welcomeText.repeat(8);

  return (
    <>
      <div 
        className="fixed top-0 left-0 right-0 z-[60] bg-pink-600 text-white overflow-hidden flex items-center" 
        style={{ height: '30px' }}
      >
        <div 
          className="flex items-center whitespace-nowrap"
          style={{
            animation: 'scrollHeadline 25s linear infinite',
            display: 'inline-flex'
          }}
        >
          {/* Equal spacing at start - using viewport width for consistent spacing */}
          <span className="font-semibold text-sm" style={{ paddingLeft: '50vw', paddingRight: '1rem' }}>
            {repeatedText}
          </span>
          {/* Duplicate for seamless loop with equal spacing at end */}
          <span className="font-semibold text-sm" aria-hidden="true" style={{ paddingRight: '50vw' }}>
            {repeatedText}
          </span>
        </div>
      </div>
      <style jsx global>{`
        @keyframes scrollHeadline {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </>
  );
}
