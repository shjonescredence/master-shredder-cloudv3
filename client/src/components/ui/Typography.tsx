import React from 'react';

type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'body-sm' | 'caption';

interface TypographyProps {
  variant: TypographyVariant;
  children: React.ReactNode;
  className?: string;
}

export const Typography: React.FC<TypographyProps> = ({
  variant,
  children,
  className = ''
}) => {
  const variants = {
    h1: 'text-4xl font-bold tracking-tight',
    h2: 'panel-title text-2xl font-bold',
    h3: 'text-xl font-semibold',
    h4: 'text-lg font-medium',
    body: 'text-base',
    'body-sm': 'text-sm',
    caption: 'text-sm text-gray-400'
  };

  const Component = ['h1', 'h2', 'h3', 'h4'].includes(variant) ? variant : 'p';

  return React.createElement(
    Component,
    { className: `${variants[variant]} ${className}`.trim() },
    children
  );
};
