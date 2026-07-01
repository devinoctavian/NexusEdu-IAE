import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, id, className = '', ...props }, ref) => {
  return (
    <div className="w-full flex flex-col gap-xs">
      {label && (
        <label htmlFor={id} className="text-label text-secondary">
          {label}
        </label>
      )}
      <input
        id={id}
        ref={ref}
        className={`w-full rounded-sm border border-border bg-surface px-sm py-sm text-body-md text-primary placeholder:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:border-tertiary transition-all ${className}`}
        {...props}
      />
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
