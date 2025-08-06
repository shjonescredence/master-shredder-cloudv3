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
    <div className={`collapsible-card ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="card-header" onClick={toggleExpanded}>
        <div className="header-left">
          <span className="card-icon">{icon}</span>
          <h5 className="card-title">{title}</h5>
        </div>
        <div className="header-right">
          <span className={`expand-arrow ${isExpanded ? 'rotated' : ''}`}>
            ▼
          </span>
        </div>
      </div>
      
      <div className={`card-content ${isExpanded ? 'show' : 'hide'}`}>
        <div className="content-inner">
          <pre className="analysis-text">{content}</pre>
        </div>
      </div>
    </div>
  );
};
