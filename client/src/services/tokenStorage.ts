/**
 * Secure Token Storage Service
 * Handles secure storage and retrieval of OpenAI API tokens
 */

// Simple encryption key - in production, this could be more sophisticated
const ENCRYPTION_KEY = 'master-shredder-v3-token-key';
const STORAGE_KEY = 'ms_openai_token';
const SETUP_COMPLETE_KEY = 'ms_setup_complete';

/**
 * Simple XOR encryption for token storage
 * Note: This is basic obfuscation. For production, consider more robust encryption
 */
function encryptToken(token: string): string {
  let encrypted = '';
  for (let i = 0; i < token.length; i++) {
    const keyChar = ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
    const tokenChar = token.charCodeAt(i);
    encrypted += String.fromCharCode(tokenChar ^ keyChar);
  }
  return btoa(encrypted); // Base64 encode
}

/**
 * Decrypt the stored token
 */
function decryptToken(encryptedToken: string): string {
  try {
    const encrypted = atob(encryptedToken); // Base64 decode
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
      const keyChar = ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
      const encryptedChar = encrypted.charCodeAt(i);
      decrypted += String.fromCharCode(encryptedChar ^ keyChar);
    }
    return decrypted;
  } catch (error) {
    console.error('Failed to decrypt token:', error);
    return '';
  }
}

/**
 * Store the OpenAI API token securely
 */
export function storeToken(token: string): void {
  try {
    const encryptedToken = encryptToken(token);
    localStorage.setItem(STORAGE_KEY, encryptedToken);
    localStorage.setItem(SETUP_COMPLETE_KEY, 'true');
  } catch (error) {
    console.error('Failed to store token:', error);
    throw new Error('Failed to store API key securely');
  }
}

/**
 * Retrieve the stored OpenAI API token
 */
export function getStoredToken(): string | null {
  try {
    const encryptedToken = localStorage.getItem(STORAGE_KEY);
    if (!encryptedToken) {
      return null;
    }
    const decryptedToken = decryptToken(encryptedToken);
    return decryptedToken || null;
  } catch (error) {
    console.error('Failed to retrieve token:', error);
    return null;
  }
}

/**
 * Check if the initial setup has been completed
 */
export function isSetupComplete(): boolean {
  return localStorage.getItem(SETUP_COMPLETE_KEY) === 'true';
}

/**
 * Clear stored token and reset setup
 */
export function clearToken(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SETUP_COMPLETE_KEY);
}

/**
 * Validate OpenAI API key format (client-side quick check only)
 * Real validation happens on the backend for security
 */
export function validateToken(token: string): { isValid: boolean; error?: string } {
  if (!token || token.trim().length === 0) {
    return { isValid: false, error: 'API key is required' };
  }

  // OpenAI API keys can be:
  // - Legacy format: sk-[48+ characters]
  // - New format: sk-proj-[100+ characters]
  const apiKeyRegex = /^sk-[a-zA-Z0-9\-_]{20,200}$/;
  
  if (!apiKeyRegex.test(token)) {
    return { 
      isValid: false, 
      error: 'Invalid API key format. OpenAI keys start with "sk-" followed by alphanumeric characters.' 
    };
  }

  if (token.length < 20) {
    return { 
      isValid: false, 
      error: 'API key appears to be too short. Please check your key.' 
    };
  }

  // Note: This is only basic format validation
  // Real security validation happens on the backend
  return { isValid: true };
}

/**
 * Test if an API key is valid by using the backend validation endpoint
 */
export async function testToken(token: string): Promise<{ isValid: boolean; error?: string }> {
  try {
    const response = await fetch('/api/settings/validate-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: token
      }),
    });

    const result = await response.json();
    
    if (result.success) {
      return { isValid: true };
    } else {
      return { isValid: false, error: result.error || 'Failed to validate API key' };
    }
  } catch (error) {
    console.error('Token validation error:', error);
    return { 
      isValid: false, 
      error: 'Network error while validating API key. Please check your connection.' 
    };
  }
}

/**
 * Get token status for UI display
 */
export function getTokenStatus(): {
  hasToken: boolean;
  isSetupComplete: boolean;
  needsSetup: boolean;
} {
  const hasToken = !!getStoredToken();
  const setupComplete = isSetupComplete();
  
  return {
    hasToken,
    isSetupComplete: setupComplete,
    needsSetup: !hasToken || !setupComplete
  };
}
