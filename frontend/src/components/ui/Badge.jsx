import React from 'react';

export default function Badge({ children, variant = 'info', className = '' }) {
  const variants = {
    success: 'bg-success/10 text-success',
    error: 'bg-error/10 text-error',
    warning: 'bg-warning/10 text-warning',
    info: 'bg-info/10 text-info',
    neutral: 'bg-border text-secondary'
  };

  return (
    <span className={`inline-flex items-center rounded-pill px-sm py-1 text-[12px] font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
