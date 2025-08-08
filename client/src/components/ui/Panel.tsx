import React from 'react';

type PanelVariant = 'primary' | 'secondary' | 'tertiary' | 'glass';

interface PanelProps {
  children: React.ReactNode;
  variant?: PanelVariant;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const Panel: React.FC<PanelProps> = ({ 
  children, 
  variant = 'primary',
  className = '',
  title,
  subtitle
}) => {
  const baseClasses = 'panel-base backdrop-blur-md border rounded-xl';
  
  const variantClasses = {
    primary: 'bg-panel-gradient border-panel-dark-border shadow-panel-primary p-6',
    secondary: 'bg-panel-gradient border-panel-dark-border shadow-panel-secondary p-6',
    tertiary: 'bg-panel-gradient border-panel-dark-border shadow-panel-tertiary p-5',
    glass: 'bg-panel-glass-bg border-panel-glass-border backdrop-blur-lg p-6'
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {(title || subtitle) && (
        <div className="panel-header">
          {title && <h2 className="panel-title">{title}</h2>}
          {subtitle && <p className="panel-subtitle">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};
