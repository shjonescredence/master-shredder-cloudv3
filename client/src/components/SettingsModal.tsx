import React, { useEffect, useRef } from 'react';
import { SettingsPanel } from './SettingsPanel';
import './SettingsModal.css';

interface AppConfig {
  defaultModel: string;
  allowUserTokens: boolean;
  systemTokenAvailable: boolean;
  environment: string;
  version: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  userApiKey: string;
  appConfig: AppConfig | null;
  onTokenReset?: () => void;
  showShipleyIndicators: boolean;
  onToggleShipley: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  selectedModel,
  onModelChange,
  userApiKey,
  appConfig,
  onTokenReset,
  showShipleyIndicators,
  onToggleShipley
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle click outside modal
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay" onClick={handleOverlayClick}>
      <div className="settings-modal" ref={modalRef}>
        <div className="settings-modal-header">
          <h2>⚙️ Settings</h2>
          <button 
            className="settings-modal-close" 
            onClick={onClose}
            aria-label="Close settings"
          >
            ×
          </button>
        </div>
        
        <div className="settings-modal-content">
          {/* Settings Panel Content */}
          <div className="settings-section">
            <h3>� Model Configuration</h3>
            <SettingsPanel
              selectedModel={selectedModel}
              onModelChange={onModelChange}
              userApiKey={userApiKey}
              appConfig={appConfig}
              onTokenReset={onTokenReset}
            />
          </div>

          {/* System Information */}
          <div className="settings-section">
            <h3>ℹ️ System Information</h3>
            <div className="system-info">
              <div className="info-item">
                <span className="info-label">Environment:</span>
                <span className="info-value">{appConfig?.environment || 'development'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Version:</span>
                <span className="info-value">v{appConfig?.version || '3.0'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">User Token:</span>
                <span className="info-value">{userApiKey ? '✅ Configured' : '❌ Not set'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">System Token:</span>
                <span className="info-value">{appConfig?.systemTokenAvailable ? '✅ Available' : '❌ Not available'}</span>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="settings-section">
            <h3>⚙️ Advanced Options</h3>
            
            {/* Shipley Methodology Toggle */}
            <div className="setting-group">
              <div className="setting-header">
                <h4>📚 Shipley Methodology</h4>
                <p>Enable Shipley compliance indicators and methodologies</p>
              </div>
              <div className="toggle-container">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={showShipleyIndicators}
                    onChange={onToggleShipley}
                    aria-label="Show Shipley compliance indicators"
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span className="toggle-label">Show Shipley compliance indicators</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
