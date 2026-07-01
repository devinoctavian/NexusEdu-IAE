import React from 'react';

export default function Card({ children, className = '', ...props }) {
  return (
    <div 
      className={`rounded-md border border-border bg-surface p-lg shadow-sm shadow-primary/5 ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
}
