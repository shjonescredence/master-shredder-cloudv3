import React, { useState, useEffect } from 'react';
import { TokenManager } from './components/TokenManager';
import { ChatInterface } from './components/ChatInterface';
import { SettingsPanel } from './components/SettingsPanel';
import './App.css';

interface AppConfig {
  defaultModel: string;
  allowUserTokens: boolean;
  systemTokenAvailable: boolean;
  environment: string;
  version: string;
}

function App() {
  const [userApiKey, setUserApiKey] = useState<string>('');
  const [isTokenValid, setIsTokenValid] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4-turbo');
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load app configuration on startup
  useEffect(() => {
    fetchAppConfig();
  }, []);

  const fetchAppConfig = async () => {
    try {
      const response = await fetch('/api/settings/config');
      if (response.ok) {
        const config = await response.json();
        setAppConfig(config.config);
        setSelectedModel(config.config.defaultModel);
      }
    } catch (error) {
      console.error('Failed to load app config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTokenValidated = (token: string, valid: boolean) => {
    setUserApiKey(token);
    setIsTokenValid(valid);
  };

  if (loading) {
    return (
      <div className="app-container loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Master Shredder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="centered-layout">
        {/* Token Management Panel */}
        <div className="panel">
          <TokenManager
            onTokenValidated={handleTokenValidated}
            currentToken={userApiKey}
            isValid={isTokenValid}
            systemTokenAvailable={appConfig?.systemTokenAvailable || false}
          />
        </div>

        {/* Main Chat Interface */}
        <div className="panel chat-panel">
          <ChatInterface
            userApiKey={userApiKey}
            isTokenValid={isTokenValid}
            selectedModel={selectedModel}
            systemTokenAvailable={appConfig?.systemTokenAvailable || false}
          />
        </div>

        {/* Settings Panel */}
        <div className="panel">
          <SettingsPanel
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            userApiKey={userApiKey}
            appConfig={appConfig}
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <p>Master Shredder Cloud v{appConfig?.version || '3.0'} | {appConfig?.environment || 'development'}</p>
      </footer>
    </div>
  );
}

export default App;
