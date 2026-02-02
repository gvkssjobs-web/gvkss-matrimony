'use client';

import React, { useState } from 'react';

export default function ScrollingHeadline() {
  const [isHovering, setIsHovering] = useState(false);
  const welcomeText = "Formerly Manikanta Marriage Bureau-9573166450 ESTD-2010";

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
          {/* Three repetitions per half; minimal gap between last and first */}
          <span className="font-semibold text-sm" style={{ paddingLeft: '8vw', paddingRight: '15vw' }}>
            {welcomeText}
          </span>
          <span className="font-semibold text-sm" style={{ paddingRight: '15vw' }}>
            {welcomeText}
          </span>
          <span className="font-semibold text-sm" style={{ paddingRight: '57vw' }}>
            {welcomeText}
          </span>
          <span className="font-semibold text-sm" aria-hidden="true" style={{ paddingLeft: '8vw', paddingRight: '15vw' }}>
            {welcomeText}
          </span>
          <span className="font-semibold text-sm" aria-hidden="true" style={{ paddingRight: '15vw' }}>
            {welcomeText}
          </span>
          <span className="font-semibold text-sm" aria-hidden="true" style={{ paddingRight: '57vw' }}>
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
