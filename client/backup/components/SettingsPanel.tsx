import React, { useState, useEffect } from 'react';
import './SettingsPanel.css';

interface AppConfig {
  defaultModel: string;
  allowUserTokens: boolean;
  systemTokenAvailable: boolean;
  environment: string;
  version: string;
}

interface SettingsPanelProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  userApiKey: string;
  appConfig: AppConfig | null;
  onTokenReset?: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  selectedModel,
  onModelChange,
  userApiKey,
  appConfig,
  onTokenReset
}) => {
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState<boolean>(false);
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number>(4000);

  // Load available models when token changes
  useEffect(() => {
    if (userApiKey) {
      loadAvailableModels();
    } else {
      // Use default models when no user token
      setAvailableModels(['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo']);
    }
  }, [userApiKey]);

  const loadAvailableModels = async () => {
    if (!userApiKey) return;

    setLoadingModels(true);
    try {
      const response = await fetch('/api/settings/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: userApiKey }),
      });

      const result = await response.json();

      if (result.success) {
        setAvailableModels(result.models);
      } else {
        console.error('Failed to load models:', result.error);
        setAvailableModels(['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo']);
      }
    } catch (error) {
      console.error('Error loading models:', error);
      setAvailableModels(['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo']);
    } finally {
      setLoadingModels(false);
    }
  };

  const resetToDefaults = () => {
    setTemperature(0.7);
    setMaxTokens(4000);
    onModelChange(appConfig?.defaultModel || 'gpt-4-turbo');
  };

  const getModelDescription = (model: string) => {
    const descriptions: { [key: string]: string } = {
      'gpt-4-turbo': 'Latest GPT-4 with improved speed and performance',
      'gpt-4': 'Most capable model, best for complex tasks',
      'gpt-3.5-turbo': 'Fast and efficient, good for most tasks',
      'gpt-4o': 'GPT-4 optimized for speed and cost efficiency',
      'gpt-4o-mini': 'Lightweight version of GPT-4o'
    };
    return descriptions[model] || 'AI language model';
  };

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h2>⚙️ Settings</h2>
      </div>

      <div className="settings-section">
        <h3>🤖 Model Configuration</h3>
        
        <div className="input-group">
          <label htmlFor="model-select">Model</label>
          <select
            id="model-select"
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="model-select"
            disabled={loadingModels}
          >
            {availableModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
          {loadingModels && <span className="loading-text">Loading models...</span>}
        </div>

        <div className="model-description">
          <p>{getModelDescription(selectedModel)}</p>
        </div>

        <div className="input-group">
          <label htmlFor="temperature">
            Temperature: {temperature}
            <span className="help-text">Controls randomness (0.0 = focused, 1.0 = creative)</span>
          </label>
          <input
            id="temperature"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="slider"
          />
        </div>

        <div className="input-group">
          <label htmlFor="max-tokens">
            Max Tokens: {maxTokens}
            <span className="help-text">Maximum response length</span>
          </label>
          <input
            id="max-tokens"
            type="range"
            min="100"
            max="8000"
            step="100"
            value={maxTokens}
            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
            className="slider"
          />
        </div>

        <button onClick={resetToDefaults} className="btn btn-outline btn-sm">
          Reset to Defaults
        </button>
      </div>

      <div className="settings-section">
        <h3>📊 System Info</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Version:</span>
            <span className="info-value">{appConfig?.version || 'Unknown'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Environment:</span>
            <span className="info-value">{appConfig?.environment || 'Unknown'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">User Tokens:</span>
            <span className="info-value">
              {appConfig?.allowUserTokens ? '✅ Enabled' : '❌ Disabled'}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">System Token:</span>
            <span className="info-value">
              {appConfig?.systemTokenAvailable ? '✅ Available' : '❌ Not Available'}
            </span>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>🔧 Advanced</h3>
        <div className="advanced-controls">
          <button 
            onClick={loadAvailableModels} 
            disabled={!userApiKey || loadingModels}
            className="btn btn-outline btn-sm"
          >
            {loadingModels ? 'Loading...' : 'Refresh Models'}
          </button>
          
          <div className="setting-toggle">
            <label>
              <input type="checkbox" defaultChecked />
              Auto-scroll chat
            </label>
          </div>
          
          <div className="setting-toggle">
            <label>
              <input type="checkbox" defaultChecked />
              Show timestamps
            </label>
          </div>
        </div>
      </div>

      {onTokenReset && (
        <div className="settings-section">
          <h3>🔑 API Key</h3>
          <div className="token-controls">
            <div className="token-status">
              <span className="status-indicator">
                {userApiKey ? '✅ API Key Configured' : '❌ No API Key'}
              </span>
            </div>
            <button 
              onClick={onTokenReset}
              className="btn btn-outline btn-sm"
            >
              🔄 Change API Key
            </button>
          </div>
        </div>
      )}

      <div className="settings-section">
        <h3>ℹ️ Help</h3>
        <div className="help-links">
          <a href="https://platform.openai.com/docs/models" target="_blank" rel="noopener noreferrer">
            📚 OpenAI Models Guide
          </a>
          <a href="https://platform.openai.com/docs/api-reference" target="_blank" rel="noopener noreferrer">
            🔧 API Documentation
          </a>
          <a href="https://platform.openai.com/usage" target="_blank" rel="noopener noreferrer">
            📊 Usage Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};
