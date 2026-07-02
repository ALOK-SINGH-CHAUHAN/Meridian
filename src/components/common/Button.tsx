import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none text-[14px] px-5 py-2.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] duration-200";
  
  let variantStyles = "";
  if (variant === 'primary') {
    variantStyles = "bg-[#17191c] text-white hover:bg-black dark:bg-[#f2f1ef] dark:text-[#121314] dark:hover:bg-white rounded-[14px] font-semibold shadow-sm";
  } else if (variant === 'outline') {
    variantStyles = "border border-hairline bg-transparent hover:bg-fog text-text-primary rounded-[14px]";
  } else if (variant === 'ghost') {
    variantStyles = "bg-transparent text-text-primary hover:text-rust underline underline-offset-4 decoration-1 rounded-[14px]";
  }

  return (
    <button className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </button>
  );
}
