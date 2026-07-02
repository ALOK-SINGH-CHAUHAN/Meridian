import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = React.memo(function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-card rounded-[18px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.015)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-hairline hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});
