'use client';

import React, { useState } from 'react';

export default function ScrollingHeadline() {
  const [isHovering, setIsHovering] = useState(false);
  const welcomeText = "Formerly Known as Manikanta Marriage Bureau Contact Number: 9573166450";

  return (
    <>
      <div 
        className="fixed top-0 left-0 right-0 z-[60] text-white overflow-hidden flex items-center cursor-default"
        style={{ height: '30px', backgroundColor: '#16a34a' }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div 
          className="flex items-center whitespace-nowrap"
          style={{
            animation: 'scrollHeadline 50s linear infinite',
            animationPlayState: isHovering ? 'paused' : 'running',
            display: 'inline-flex'
          }}
        >
          {/* Only two repetitions with large gap (25vw) between them; two identical halves for seamless loop */}
          <span className="font-semibold text-sm" style={{ paddingLeft: '15vw', paddingRight: '20vw' }}>
            {welcomeText}
          </span>
          <span className="font-semibold text-sm" style={{ paddingRight: '25vw' }}>
            {welcomeText}
          </span>
          <span className="font-semibold text-sm" aria-hidden="true" style={{ paddingLeft: '50vw', paddingRight: '25vw' }}>
            {welcomeText}
          </span>
          <span className="font-semibold text-sm" aria-hidden="true" style={{ paddingRight: '25vw' }}>
            {welcomeText}
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
