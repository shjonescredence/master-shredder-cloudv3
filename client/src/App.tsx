import React, { useState, useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { SettingsPanel } from './components/SettingsPanel';
import { CaptureAssistant } from './components/CaptureAssistant';
import { TokenSetupModal } from './components/TokenSetupModal';
import { GridLayout } from './components/GridLayout';
import { getStoredToken, getTokenStatus } from './services/tokenStorage';
import './App.css';

interface AppConfig {
  defaultModel: string;
  allowUserTokens: boolean;
  systemTokenAvailable: boolean;
  environment: string;
  version: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
  uploadDate: Date;
}

function App() {
  const [userApiKey, setUserApiKey] = useState<string>('');
  const [isTokenValid, setIsTokenValid] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4-turbo');
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [capturePrompt, setCapturePrompt] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showTokenSetup, setShowTokenSetup] = useState<boolean>(false);

  // Load app configuration and check token status on startup
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Load app configuration
      const response = await fetch('/api/settings/config');
      if (response.ok) {
        const config = await response.json();
        setAppConfig(config.config);
        setSelectedModel(config.config.defaultModel);
      }

      // Check token status
      const tokenStatus = getTokenStatus();
      if (tokenStatus.hasToken && tokenStatus.isSetupComplete) {
        const storedToken = getStoredToken();
        if (storedToken) {
          setUserApiKey(storedToken);
          setIsTokenValid(true);
        }
      } else {
        // Show setup modal if no token or setup not complete
        setShowTokenSetup(true);
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
      // Show setup modal on error as fallback
      setShowTokenSetup(true);
    } finally {
      setLoading(false);
    }
  };

  const handleTokenSetupComplete = (token: string) => {
    setUserApiKey(token);
    setIsTokenValid(true);
    setShowTokenSetup(false);
  };

  const handleTokenSetupSkip = () => {
    setShowTokenSetup(false);
    // Continue with system token if available
  };

  const handleCapturePrompt = (prompt: string) => {
    setCapturePrompt(prompt);
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
      {/* Token Setup Modal */}
      {showTokenSetup && (
        <TokenSetupModal
          onSetupComplete={handleTokenSetupComplete}
          onSkip={handleTokenSetupSkip}
          allowSkip={appConfig?.systemTokenAvailable}
        />
      )}

      <GridLayout
        columns={12}
        gap="20px"
        className="main-layout"
      >
        {/* Federal Contract Capture Assistant - Full width */}
        <div className="panel capture-panel" data-grid-column="1 / -1">
          <CaptureAssistant
            onPromptSelect={handleCapturePrompt}
            isTokenValid={isTokenValid}
            uploadedFiles={uploadedFiles}
          />
        </div>

        {/* Main Chat Interface - Takes majority of width */}
        <div className="panel chat-panel expanded" data-grid-column="1 / 9">
          <ChatInterface
            userApiKey={userApiKey}
            isTokenValid={isTokenValid}
            selectedModel={selectedModel}
            systemTokenAvailable={appConfig?.systemTokenAvailable || false}
            initialPrompt={capturePrompt}
            onPromptUsed={() => setCapturePrompt('')}
          />
        </div>

        {/* Settings Panel - Right sidebar */}
        <div className="panel settings-panel" data-grid-column="9 / -1">
          <SettingsPanel
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            userApiKey={userApiKey}
            appConfig={appConfig}
            onTokenReset={() => setShowTokenSetup(true)}
          />
        </div>
      </GridLayout>

      {/* Footer */}
      <footer className="app-footer">
        <p>Master Shredder Cloud v{appConfig?.version || '3.0'} - Federal Contract Capture Assistant | {appConfig?.environment || 'development'}</p>
        <p>🎯 Specialized AI for Government Contracting Professionals</p>
      </footer>
    </div>
  );
}

export default App;
