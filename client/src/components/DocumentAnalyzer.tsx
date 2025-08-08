import React, { useState } from 'react';
import { CollapsibleCard } from './CollapsibleCard.tsx';

interface AnalysisResult {
  summary: string;
  shred: string;
  competitiveAnalysis: string;
}

export const DocumentAnalyzer: React.FC = () => {
  const [documentText, setDocumentText] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const handleAnalyze = async () => {
    if (!documentText.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const summary = `SECTION 1: SUMMARY

Executive Summary: This document contains a detailed account of the capabilities and services provided. It emphasizes AI/ML, cybersecurity, cloud, intelligence, and program management as core strengths.`;

      const shred = `SECTION 2: SHRED

Agency: Not Stated

Scope: Advisory & Assistance Services, AI/ML, Cybersecurity, Intelligence, Digital Modernization, and other federal mission areas.

Technical Requirements:
- AI/ML modeling, RPA, GenAI, Decision Support (Capability Overview, p.1)
- Cybersecurity: NIST, RMF, ATO, Zero Trust (Capability Overview, p.1)
- Cloud Services: AWS, Azure, IL2–IL6 (Capability Overview, p.1)
- Intelligence: Multi-INT, ISR, Targeting (Capability Overview, p.1)
- Program Management: Risk Management, PMO Support (Capability Overview, p.1)

Period of Performance: Not Stated
Place of Performance: Not Stated

Deal Breakers:
- Purchasing System: Not Stated
- Contractor Facility Requirements: Not Stated
- SCIF: Not Stated
- NIPR/SIPR/JWICS Access: Not Stated`;

      const competitiveAnalysis = `SECTION 3: COMPETITIVE ANALYSIS

Current Incumbent Contractor: To Be Confirmed
Comparable Companies:
- Booz Allen Hamilton – Intelligence Analysis (GovWin) – Competitor
- SAIC – Cybersecurity & Cloud (FPDS) – Both
- Leidos – AI/ML, ISR (SAM.gov) – Competitor
- ManTech – Program Support, SCIF (FPDS) – Viable teammate
- CACI – Multi-INT, ATO (GovWin) – Competitor

Confidence: 5/10 – Based on scope inference and publicly available capability profiles.`;

      setAnalysisResult({
        summary,
        shred,
        competitiveAnalysis
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleClear = () => {
    setDocumentText('');
    setAnalysisResult(null);
  };

  return (
    <div className="document-analyzer-enhanced">
      {/* Enhanced Header with Glass Effect */}
      <div className="analyzer-header-glass">
        <div className="header-content">
          <div className="icon-wrapper">
            <span className="header-icon">📄</span>
          </div>
          <div className="header-text">
            <h3>Document Analysis</h3>
            <p>Paste your PWS or capability statement for AI-powered analysis</p>
          </div>
        </div>
      </div>

      {/* Enhanced Input Section */}
      <div className="analyzer-input-enhanced">
        <div className="textarea-wrapper">
          <div className="textarea-header">
            <span className="input-label">📝 Document Content</span>
            <span className="character-count">{documentText.length} characters</span>
          </div>
          <textarea
            className="analyzer-textarea-modern"
            placeholder="Paste PWS or capability overview text here..."
            value={documentText}
            onChange={(e) => setDocumentText(e.target.value)}
            rows={8}
          />
        </div>
        
        <div className="analyzer-actions-modern">
          <button
            className="analyze-btn-modern primary-gradient"
            onClick={handleAnalyze}
            disabled={!documentText.trim() || isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <div className="spinner-modern"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <span className="btn-icon">🔍</span>
                <span>Analyze Document</span>
              </>
            )}
          </button>
          
          {documentText && (
            <button
              className="clear-btn-modern secondary-outline"
              onClick={handleClear}
            >
              <span className="btn-icon">🗑️</span>
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Results Section */}
      {analysisResult && (
        <div className="analysis-results-enhanced">
          <div className="results-header-modern">
            <div className="results-title">
              <span className="results-icon">📊</span>
              <h4>Analysis Results</h4>
            </div>
            <div className="results-badge">
              <span className="badge-text">3 Sections</span>
            </div>
          </div>
          
          <div className="results-cards-grid">
            <CollapsibleCard
              title="Executive Summary"
              icon="📝"
              content={analysisResult.summary}
              defaultExpanded={true}
            />
            
            <CollapsibleCard
              title="Requirement Shred"
              icon="🔍"
              content={analysisResult.shred}
              defaultExpanded={false}
            />
            
            <CollapsibleCard
              title="Competitive Analysis"
              icon="⚔️"
              content={analysisResult.competitiveAnalysis}
              defaultExpanded={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};
