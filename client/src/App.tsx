import React, { useState, useEffect } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { SettingsPanel } from './components/SettingsPanel';
import { CaptureAssistant } from './components/CaptureAssistant';
import { TokenSetupModal } from './components/TokenSetupModal';
import { DocumentAnalyzer } from './components/DocumentAnalyzer';
import { getStoredToken, getTokenStatus } from './services/tokenStorage';
import './App.css';
import './components/DocumentAnalyzer.css';

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
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o');
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [capturePrompt, setCapturePrompt] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showTokenSetup, setShowTokenSetup] = useState<boolean>(false);
  const [showShipleyIndicators, setShowShipleyIndicators] = useState<boolean>(false);

  // Load app configuration and check token status on startup
  useEffect(() => {
    initializeApp();
  }, []);

  // Handler functions for UI interactions
  const handleQuickAction = (action: string) => {
    console.log(`Quick action: ${action}`);
    // TODO: Implement quick action functionality
    switch (action) {
      case 'compliance':
        setCapturePrompt('Generate a compliance matrix for the uploaded RFP document');
        break;
      case 'timeline':
        setCapturePrompt('Create a project timeline based on the RFP requirements');
        break;
      case 'competitor':
        setCapturePrompt('Analyze competitors for this opportunity');
        break;
      default:
        break;
    }
  };

  const handleCapability = (capability: string) => {
    console.log(`Capability selected: ${capability}`);
    // TODO: Implement capability-specific functionality
    switch (capability) {
      case 'rfp-analysis':
        setCapturePrompt('Analyze the uploaded RFP document for key requirements and opportunities');
        break;
      case 'compliance':
        setCapturePrompt('Generate compliance matrices and requirement checklists');
        break;
      case 'teaming':
        setCapturePrompt('Develop teaming strategy and partner recommendations');
        break;
      case 'market-research':
        setCapturePrompt('Conduct market research and competitor analysis');
        break;
      case 'proposal-support':
        setCapturePrompt('Provide proposal writing support and win theme development');
        break;
      default:
        break;
    }
  };

  const handleAppTool = (tool: string) => {
    console.log(`App tool selected: ${tool}`);
    // TODO: Implement app tool functionality
    switch (tool) {
      case 'rfp-shredder':
        setCapturePrompt('Shred and analyze the RFP document for key insights');
        break;
      case 'compliance-matrix':
        setCapturePrompt('Generate a detailed compliance matrix');
        break;
      case 'timeline-builder':
        setCapturePrompt('Build a project timeline and milestone tracker');
        break;
      case 'teaming-strategy':
        setCapturePrompt('Develop comprehensive teaming strategy');
        break;
      default:
        break;
    }
  };

  const toggleShipley = () => {
    setShowShipleyIndicators(!showShipleyIndicators);
    console.log(`Shipley indicators ${!showShipleyIndicators ? 'enabled' : 'disabled'}`);
  };

  const initializeApp = async () => {
    try {
      // Load app configuration
      const response = await fetch('/api/settings/config');
      if (response.ok) {
        const config = await response.json();
        setAppConfig(config.config);
        // Lock to GPT-4o instead of using dynamic model selection
        setSelectedModel('gpt-4o');
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
      {/* App Header with Master Shredder Branding */}
      <header className="app-header">
        <div className="brand-section">
          <img 
            src="/shredder-logo.png?v=1" 
            alt="Master Shredder" 
            className="app-logo"
            onError={(e) => {
              console.log('Logo failed to load, falling back to SVG');
              e.currentTarget.src = '/shredder-logo.svg';
            }}
          />
          <div className="brand-text">
            <h1>Master Shredder</h1>
            <p>Federal Contract Capture Assistant</p>
          </div>
        </div>
        <div className="connection-status">
          <span className="status-indicator connected"></span>
          <span>Connected</span>
        </div>
      </header>

      {/* Token Setup Modal */}
      {showTokenSetup && (
        <TokenSetupModal
          onSetupComplete={handleTokenSetupComplete}
          onSkip={handleTokenSetupSkip}
          allowSkip={appConfig?.systemTokenAvailable}
        />
      )}

      <div className="main-layout">
        {/* Upload Panel */}
        <div className="panel upload-panel">
          <DocumentAnalyzer />
        </div>

        {/* Assistant Panel */}
        <div className="panel assistant-panel">
          <div className="assistant-content">
            <div className="assistant-header">
              <img 
                src="/shredder-logo.png?v=1" 
                alt="Master Shredder" 
                className="assistant-logo"
                onError={(e) => {
                  console.log('Assistant logo failed to load, falling back to SVG');
                  e.currentTarget.src = '/shredder-logo.svg';
                }}
              />
              <div>
                <h3>Master Shredder AI Assistant</h3>
                <p>I'm your AI assistant for federal capture management running on Windows. I can help you with:</p>
              </div>
            </div>
            
            <div className="capability-cards">
              <div className="capability-card" onClick={() => handleCapability('rfp-analysis')}>
                <div className="capability-icon">�</div>
                <div className="capability-content">
                  <h4>RFP Analysis</h4>
                  <p>Upload or drag-drop documents for instant shredding and requirement extraction</p>
                </div>
              </div>
              
              <div className="capability-card" onClick={() => handleCapability('compliance')}>
                <div className="capability-icon">�</div>
                <div className="capability-content">
                  <h4>Compliance</h4>
                  <p>Generate compliance matrices and checklists</p>
                </div>
              </div>
              
              <div className="capability-card" onClick={() => handleCapability('teaming')}>
                <div className="capability-icon">🤝</div>
                <div className="capability-content">
                  <h4>Teaming Strategy</h4>
                  <p>Strategy recommendations and partner analysis</p>
                </div>
              </div>
              
              <div className="capability-card" onClick={() => handleCapability('market-research')}>
                <div className="capability-icon">📊</div>
                <div className="capability-content">
                  <h4>Market Research</h4>
                  <p>Competitor analysis and opportunity assessment</p>
                </div>
              </div>
              
              <div className="capability-card" onClick={() => handleCapability('proposal-support')}>
                <div className="capability-icon">�</div>
                <div className="capability-content">
                  <h4>Proposal Support</h4>
                  <p>Content development and win themes</p>
                </div>
              </div>
            </div>
            
            <div className="get-started">
              <p><strong>Get Started:</strong> Upload an RFP document or ask me anything about capture management!</p>
            </div>
          </div>
        </div>

        {/* Chat Interface - Main panel */}
        <div className="panel chat-panel">
          <ChatInterface
            userApiKey={userApiKey}
            isTokenValid={isTokenValid}
            selectedModel={selectedModel}
            systemTokenAvailable={appConfig?.systemTokenAvailable || false}
            initialPrompt={capturePrompt}
            onPromptUsed={() => setCapturePrompt('')}
          />
        </div>

        {/* Settings Panel */}
        <div className="panel settings-panel">
          <div className="settings-content">
            {/* Top App Icons */}
            <div className="app-icons-section">
              <div className="app-icon master-shredder-icon" onClick={() => handleAppTool('rfp-shredder')} title="Master Shredder - RFP Analysis">
                <img 
                  src="/shredder-logo.png?v=1" 
                  alt="Master Shredder" 
                  className="shredder-icon-img"
                  onError={(e) => {
                    console.log('Settings logo failed to load, falling back to SVG');
                    e.currentTarget.src = '/shredder-logo.svg';
                  }}
                />
                <span>Master Shredder</span>
              </div>
              <div className="app-icon" onClick={() => handleAppTool('compliance-matrix')} title="Compliance Matrix">
                <div className="icon">✅</div>
                <span>Compliance Matrix</span>
              </div>
              <div className="app-icon" onClick={() => handleAppTool('timeline-builder')} title="Timeline Builder">
                <div className="icon">📅</div>
                <span>Timeline Builder</span>
              </div>
              <div className="app-icon" onClick={() => handleAppTool('teaming-strategy')} title="Teaming Strategy">
                <div className="icon">🤝</div>
                <span>Teaming Strategy</span>
              </div>
            </div>
            
            {/* Current Analysis Section */}
            <div className="current-analysis-section">
              <h4>📊 Current Analysis</h4>
              <div className="analysis-placeholder">
                <p>Upload a document to see detailed analysis results here</p>
              </div>
            </div>
            
            {/* Shipley Methodology Toggle */}
            <div className="shipley-section">
              <h4>📚 Shipley Methodology</h4>
              <div className="toggle-container">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={showShipleyIndicators}
                    onChange={() => toggleShipley()}
                    aria-label="Show Shipley compliance indicators"
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span className="toggle-label">Show Shipley compliance indicators</span>
              </div>
            </div>
            
            {/* Settings Panel Content */}
            <SettingsPanel
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              userApiKey={userApiKey}
              appConfig={appConfig}
              onTokenReset={() => setShowTokenSetup(true)}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <p>Master Shredder Cloud v{appConfig?.version || '3.0'} - Federal Contract Capture Assistant | {appConfig?.environment || 'development'}</p>
        <p>🎯 Specialized AI for Government Contracting Professionals</p>
      </footer>
    </div>
  );
}

export default App;
