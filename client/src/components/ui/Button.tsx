import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'capture' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  isLoading,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200';
  
  const variantClasses = {
    primary: 'btn-primary text-white',
    secondary: 'btn-secondary text-gray-200',
    ghost: 'btn-ghost hover:bg-white/5',
    capture: 'btn-capture hover:bg-white/5',
    icon: 'btn-icon'
  };

  const sizeClasses = {
    sm: 'btn-sm',
    md: 'px-6 py-3',
    lg: 'btn-lg'
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isDisabled ? 'btn-disabled' : ''}
        ${isLoading ? 'btn-loading' : ''}
        ${className}
      `.trim()}
      disabled={isDisabled}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {isLoading ? (
        <span className="spinner" />
      ) : children}
    </button>
  );
};
