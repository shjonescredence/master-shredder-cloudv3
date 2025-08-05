import React, { useState } from 'react';
import './TokenManager.css';

interface TokenManagerProps {
  onTokenValidated: (token: string, valid: boolean) => void;
  currentToken: string;
  isValid: boolean;
  systemTokenAvailable: boolean;
}

export const TokenManager: React.FC<TokenManagerProps> = ({
  onTokenValidated,
  currentToken,
  isValid,
  systemTokenAvailable
}) => {
  const [token, setToken] = useState<string>(currentToken);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [showToken, setShowToken] = useState<boolean>(false);

  const validateToken = async (apiKey: string) => {
    if (!apiKey.trim()) {
      setValidationMessage('Please enter an API key');
      onTokenValidated('', false);
      return;
    }

    setIsValidating(true);
    setValidationMessage('Validating...');

    try {
      const response = await fetch('/api/settings/validate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });

      const result = await response.json();

      if (result.success) {
        setValidationMessage('✅ Token is valid!');
        onTokenValidated(apiKey, true);
      } else {
        setValidationMessage(`❌ ${result.error}`);
        onTokenValidated(apiKey, false);
      }
    } catch (error) {
      setValidationMessage('❌ Failed to validate token');
      onTokenValidated(apiKey, false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleTokenChange = (value: string) => {
    setToken(value);
    setValidationMessage('');
    
    // Auto-validate if it looks like a complete key
    if (value.startsWith('sk-') && value.length >= 49) {
      setTimeout(() => validateToken(value), 500);
    } else {
      onTokenValidated(value, false);
    }
  };

  const clearToken = () => {
    setToken('');
    setValidationMessage('');
    onTokenValidated('', false);
  };

  const useSystemToken = () => {
    setToken('');
    setValidationMessage('Using system token');
    onTokenValidated('', true);
  };

  const maskToken = (token: string) => {
    if (token.length < 8) return token;
    return token.substring(0, 8) + '•'.repeat(token.length - 12) + token.substring(token.length - 4);
  };

  return (
    <div className="token-manager">
      <div className="token-header">
        <h2>🔐 OpenAI Token</h2>
        <p className="token-description">
          Enter your OpenAI API key to use your own token for chat completions.
        </p>
      </div>

      <div className="token-input-section">
        <div className="input-group">
          <label htmlFor="api-key">API Key</label>
          <div className="token-input-container">
            <input
              id="api-key"
              type={showToken ? 'text' : 'password'}
              value={token}
              onChange={(e) => handleTokenChange(e.target.value)}
              placeholder="sk-..."
              className={`token-input ${isValid ? 'valid' : ''} ${validationMessage.includes('❌') ? 'invalid' : ''}`}
              disabled={isValidating}
            />
            <button
              type="button"
              className="toggle-visibility"
              onClick={() => setShowToken(!showToken)}
              title={showToken ? 'Hide token' : 'Show token'}
            >
              {showToken ? '👁️‍🗨️' : '👁️'}
            </button>
          </div>
        </div>

        {validationMessage && (
          <div className={`validation-message ${isValid ? 'success' : 'error'}`}>
            {validationMessage}
          </div>
        )}

        <div className="token-actions">
          <button
            onClick={() => validateToken(token)}
            disabled={isValidating || !token.trim()}
            className="btn btn-primary"
          >
            {isValidating ? 'Validating...' : 'Validate Token'}
          </button>
          
          {token && (
            <button
              onClick={clearToken}
              className="btn btn-secondary"
            >
              Clear
            </button>
          )}

          {systemTokenAvailable && (
            <button
              onClick={useSystemToken}
              className="btn btn-outline"
              title="Use the system-provided token instead"
            >
              Use System Token
            </button>
          )}
        </div>
      </div>

      {currentToken && (
        <div className="token-status">
          <h3>Current Token</h3>
          <div className="token-display">
            <code>{showToken ? currentToken : maskToken(currentToken)}</code>
            <span className={`status-indicator ${isValid ? 'valid' : 'invalid'}`}>
              {isValid ? '✅' : '❌'}
            </span>
          </div>
        </div>
      )}

      <div className="token-info">
        <h3>🛡️ Security</h3>
        <ul>
          <li>Your token is stored locally in your browser only</li>
          <li>Tokens are never saved to our servers</li>
          <li>Each request uses your personal OpenAI quota</li>
          <li>You can clear your token anytime</li>
        </ul>

        <h3>📝 How to Get a Token</h3>
        <ol>
          <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI API Keys</a></li>
          <li>Click "Create new secret key"</li>
          <li>Copy the key (starts with "sk-")</li>
          <li>Paste it above and click "Validate Token"</li>
        </ol>
      </div>
    </div>
  );
};
