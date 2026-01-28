import React from 'react';
import Link from 'next/link';

interface ButtonProps {
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  href?: string;
  className?: string;
  fullWidth?: boolean;
}

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  href,
  className = '',
  fullWidth = false,
}: ButtonProps) {
  const baseClass = 'font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl';
  
  const getVariantStyle = () => {
    if (variant === 'primary' || variant === 'danger' || variant === 'success') {
      return { backgroundColor: '#E94B6A', color: '#FFFFFF' };
    }
    return { backgroundColor: '#4B5563', color: '#FFFFFF' };
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const combinedClass = `${baseClass} ${sizeStyles[size]} ${widthClass} ${className}`;
  const variantStyle = getVariantStyle();

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (!disabled && !loading && (variant === 'primary' || variant === 'danger' || variant === 'success')) {
      e.currentTarget.style.backgroundColor = '#C7365A';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    if (!disabled && !loading && (variant === 'primary' || variant === 'danger' || variant === 'success')) {
      e.currentTarget.style.backgroundColor = '#E94B6A';
    }
  };

  if (href) {
    return (
      <Link 
        href={href} 
        className={combinedClass}
        style={variantStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={combinedClass}
      style={variantStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
