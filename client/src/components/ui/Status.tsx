import React from 'react';
import { cn } from '../../utils/cn';

type StatusVariant = 'ready' | 'processing' | 'error';

interface StatusProps {
  variant: StatusVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  ready: 'bg-status-ready/20',
  processing: 'bg-status-processing/20',
  error: 'bg-status-error/20'
};

const dotColors: Record<StatusVariant, string> = {
  ready: 'bg-status-ready',
  processing: 'bg-status-processing',
  error: 'bg-status-error'
};

export const Status = ({ variant, children, className }: StatusProps) => {
  return (
    <div className={cn(
      'inline-flex items-center px-4 py-2 rounded-md',
      variantStyles[variant],
      className
    )}>
      <div className={cn(
        'w-2 h-2 rounded-full mr-2',
        dotColors[variant]
      )} />
      {children}
    </div>
  );
};
