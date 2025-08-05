import React, { useState } from 'react';
import './TokenSetupModal.css';
import { storeToken, validateToken, testToken } from '../services/tokenStorage';

interface TokenSetupModalProps {
  onSetupComplete: (token: string) => void;
  onSkip?: () => void;
  allowSkip?: boolean;
}

export const TokenSetupModal: React.FC<TokenSetupModalProps> = ({ 
  onSetupComplete, 
  onSkip,
  allowSkip = false 
}) => {
  const [token, setToken] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'welcome' | 'input' | 'validating' | 'success'>('welcome');

  const handleContinue = () => {
    setStep('input');
  };

  const handleTokenSubmit = async () => {
    if (!token.trim()) {
      setError('Please enter your OpenAI API key');
      return;
    }

    // Basic validation
    const validation = validateToken(token.trim());
    if (!validation.isValid) {
      setError(validation.error || 'Invalid API key format');
      return;
    }

    setIsValidating(true);
    setError('');
    setStep('validating');

    try {
      // Test the token
      const testResult = await testToken(token.trim());
      
      if (testResult.isValid) {
        // Store the token
        storeToken(token.trim());
        setStep('success');
        
        // Complete setup after a brief success display
        setTimeout(() => {
          onSetupComplete(token.trim());
        }, 1500);
      } else {
        setError(testResult.error || 'Failed to validate API key');
        setStep('input');
      }
    } catch (error) {
      setError('Failed to validate API key. Please try again.');
      setStep('input');
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isValidating) {
      handleTokenSubmit();
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  return (
    <div className="token-setup-overlay">
      <div className="token-setup-modal">
        
        {step === 'welcome' && (
          <div className="setup-step welcome-step">
            <div className="setup-header">
              <div className="setup-icon">🚀</div>
              <h2>Welcome to Master Shredder!</h2>
              <p>Your Federal Contract Capture Assistant</p>
            </div>
            
            <div className="setup-content">
              <p>To get started, you'll need to provide your OpenAI API key once. This will be stored securely on your device and used for all AI interactions.</p>
              
              <div className="setup-features">
                <div className="feature-item">
                  <span className="feature-icon">🔒</span>
                  <span>Secure local storage with encryption</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">⚡</span>
                  <span>One-time setup, seamless experience</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🤖</span>
                  <span>Automatic model selection for optimal results</span>
                </div>
              </div>
              
              <div className="setup-note">
                <p><strong>Don't have an OpenAI API key?</strong></p>
                <p>Get one at <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">platform.openai.com/api-keys</a></p>
              </div>
            </div>
            
            <div className="setup-actions">
              <button onClick={handleContinue} className="btn btn-primary">
                Set Up API Key
              </button>
              {allowSkip && (
                <button onClick={handleSkip} className="btn btn-outline">
                  Skip for Now
                </button>
              )}
            </div>
          </div>
        )}

        {step === 'input' && (
          <div className="setup-step input-step">
            <div className="setup-header">
              <div className="setup-icon">🔑</div>
              <h2>Enter Your OpenAI API Key</h2>
              <p>This will be stored securely on your device</p>
            </div>
            
            <div className="setup-content">
              <div className="input-group">
                <label htmlFor="api-key">OpenAI API Key</label>
                <input
                  id="api-key"
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="sk-..."
                  className={`token-input ${error ? 'error' : ''}`}
                  disabled={isValidating}
                  autoFocus
                />
                {error && <div className="input-error">{error}</div>}
              </div>
              
              <div className="setup-info">
                <div className="info-item">
                  <span className="info-icon">🔒</span>
                  <span>Your API key is encrypted and stored locally</span>
                </div>
                <div className="info-item">
                  <span className="info-icon">🌐</span>
                  <span>Keys are only sent directly to OpenAI's servers</span>
                </div>
                <div className="info-item">
                  <span className="info-icon">💾</span>
                  <span>No server storage - complete privacy</span>
                </div>
              </div>
            </div>
            
            <div className="setup-actions">
              <button 
                onClick={handleTokenSubmit} 
                disabled={!token.trim() || isValidating}
                className="btn btn-primary"
              >
                {isValidating ? 'Validating...' : 'Validate & Save'}
              </button>
              <button 
                onClick={() => setStep('welcome')} 
                className="btn btn-outline"
                disabled={isValidating}
              >
                Back
              </button>
            </div>
          </div>
        )}

        {step === 'validating' && (
          <div className="setup-step validating-step">
            <div className="setup-header">
              <div className="setup-icon spinning">⚡</div>
              <h2>Validating API Key</h2>
              <p>Testing connection to OpenAI...</p>
            </div>
            
            <div className="setup-content">
              <div className="validation-progress">
                <div className="progress-bar">
                  <div className="progress-fill"></div>
                </div>
                <p>This may take a few seconds</p>
              </div>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="setup-step success-step">
            <div className="setup-header">
              <div className="setup-icon">✅</div>
              <h2>Setup Complete!</h2>
              <p>Your API key has been validated and stored securely</p>
            </div>
            
            <div className="setup-content">
              <div className="success-message">
                <p>🎉 You're all set to use Master Shredder!</p>
                <p>Starting your Federal Contract Capture Assistant...</p>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};
