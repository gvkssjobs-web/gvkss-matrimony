import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export default function Card({ children, className = '', title }: CardProps) {
  return (
    <div className={`p-6 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 ${className}`} style={{ backgroundColor: '#FFFFFF' }}>
      {title && (
        <h2 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">{title}</h2>
      )}
      {children}
    </div>
  );
}
