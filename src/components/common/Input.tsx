import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-[13px] font-semibold text-gray-700 dark:text-text-graphite">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full bg-white dark:bg-card rounded-[12px] border border-gray-300 dark:border-hairline px-4 py-2.5 text-[14px] placeholder-gray-400 dark:placeholder-text-graphite/60 text-gray-900 dark:text-text-primary focus:outline-none focus:border-blue-accent focus:ring-2 focus:ring-blue-500/15 transition-all ${
            error ? 'border-rust-light dark:border-rust border-2' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-[12px] text-rust font-medium">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
