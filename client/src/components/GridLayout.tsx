import React from 'react';
import './GridLayout.css';

interface GridLayoutProps {
  children: React.ReactNode;
  columns?: number;
  gap?: string;
  className?: string;
}

export const GridLayout: React.FC<GridLayoutProps> = ({
  children,
  columns = 3,
  gap = '1.5rem',
  className = ''
}) => {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: gap,
    width: '100%',
    maxWidth: '1400px',
    margin: '0 auto'
  };

  return (
    <div 
      className={`grid-layout ${className}`} 
      style={gridStyle}
    >
      {children}
    </div>
  );
};

interface GridItemProps {
  children: React.ReactNode;
  span?: number;
  className?: string;
}

export const GridItem: React.FC<GridItemProps> = ({
  children,
  span = 1,
  className = ''
}) => {
  const itemStyle = {
    gridColumn: `span ${span}`
  };

  return (
    <div 
      className={`grid-item ${className}`} 
      style={itemStyle}
    >
      {children}
    </div>
  );
};
