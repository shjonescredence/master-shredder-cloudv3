import React, { useState } from 'react';

interface CollapsibleCardProps {
  title: string;
  icon: string;
  content: string;
  defaultExpanded?: boolean;
}

export const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  title,
  icon,
  content,
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`collapsible-card-modern ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="card-header-modern" onClick={toggleExpanded}>
        <div className="header-left-modern">
          <span className="card-icon-modern">{icon}</span>
          <h5 className="card-title-modern">{title}</h5>
        </div>
        <div className="header-right-modern">
          <span className={`expand-arrow-modern ${isExpanded ? 'rotated' : ''}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </span>
        </div>
      </div>
      
      <div className={`card-content-modern ${isExpanded ? 'show' : 'hide'}`}>
        <div className="content-inner-modern">
          <pre className="analysis-text-modern">{content}</pre>
        </div>
      </div>
    </div>
  );
};
