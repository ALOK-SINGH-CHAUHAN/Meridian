import React from 'react';

interface BadgeProps {
  type: 'priority' | 'status' | 'taskStatus';
  value: string;
  className?: string;
}

export const Badge = React.memo(function Badge({ type, value, className = '' }: BadgeProps) {
  let badgeStyles = "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-full tracking-wide uppercase border cursor-default ";
  const val = value.toLowerCase();

  if (type === 'priority') {
    if (val === 'high') {
      badgeStyles += "text-red-800 bg-red-50 dark:text-red-400 dark:bg-red-950/40 border-red-300 dark:border-red-900/50";
    } else if (val === 'medium') {
      badgeStyles += "text-amber-800 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900/50";
    } else {
      badgeStyles += "text-green-800 bg-green-50 dark:text-green-400 dark:bg-green-950/40 border-green-300 dark:border-green-900/50";
    }
  } else if (type === 'status' || type === 'taskStatus') {
    if (val === 'active' || val === 'done') {
      badgeStyles += "text-green-800 bg-green-50 dark:text-green-400 dark:bg-green-950/40 border-green-300 dark:border-green-900/50";
    } else if (val === 'on-leave' || val === 'overdue') {
      badgeStyles += "text-red-800 bg-red-50 dark:text-red-400 dark:bg-red-950/40 border-red-300 dark:border-red-900/50";
    } else if (val === 'in-progress') {
      badgeStyles += "text-blue-800 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40 border-blue-300 dark:border-blue-900/50";
    } else { // inactive / todo
      badgeStyles += "text-zinc-700 bg-zinc-100 dark:text-zinc-400 dark:bg-zinc-800/60 border-zinc-300 dark:border-zinc-700/50";
    }
  }

  const displayLabel = val === 'done' ? '✓ Done' : value.replace('-', ' ');

  const getBullet = () => {
    if (val === 'done') return null;
    if (type === 'priority') {
      if (val === 'high') return <span className="w-1.5 h-1.5 rounded-full bg-red-500" />;
      if (val === 'medium') return <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />;
      return <span className="w-1.5 h-1.5 rounded-full bg-green-500" />;
    }
    if (val === 'active') return <span className="w-1.5 h-1.5 rounded-full bg-green-500" />;
    if (val === 'on-leave' || val === 'overdue') return <span className="w-1.5 h-1.5 rounded-full bg-red-500" />;
    if (val === 'in-progress') return <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />;
    return <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />;
  };

  return (
    <span className={`${badgeStyles} ${className}`}>
      {getBullet()}
      {displayLabel}
    </span>
  );
});
