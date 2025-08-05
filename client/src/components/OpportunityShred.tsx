import React, { useState } from 'react';
import './OpportunityShred.css';

interface ShredSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  result?: string;
  prompt: string;
  priority: number;
}

interface OpportunityShredProps {
  onShredComplete: (results: ShredSection[]) => void;
  uploadedFiles: any[];
  isTokenValid: boolean;
}

export const OpportunityShred: React.FC<OpportunityShredProps> = ({
  onShredComplete,
  uploadedFiles,
  isTokenValid,
}) => {
  const [shredSections, setShredSections] = useState<ShredSection[]>([
    {
      id: 'executive-summary',
      title: '1. Executive Summary',
      description: 'High-level opportunity overview and scope assessment (2-3 sentences)',
      icon: '📊',
      status: 'pending',
      priority: 1,
      prompt: `EXECUTIVE SUMMARY ANALYSIS:

As a capture manager reviewing this Performance Work Statement (PWS) or solicitation document, provide a concise executive summary that frames this opportunity for bid/no-bid decision-making.

OUTPUT FORMAT:
Provide an executive summary of the performance work statement and what the work will entail in 2-3 professional sentences suitable for executive briefing.

REQUIREMENTS:
- Focus on the core mission and business value
- Identify the requesting agency and primary objectives
- Highlight strategic importance and scope scale
- Use professional federal contracting language
- Exclude emojis, symbols, or informal language
- Ensure content is exportable to Word/Excel/PDF formats

SOURCE CITATION:
Include document name, section, and page number for all key facts referenced.`
    },
    {
      id: 'detailed-shred',
      title: '2. Detailed Opportunity Shred',
      description: 'Systematic extraction of agency, scope, technical requirements, and deal breakers',
      icon: '�',
      status: 'pending',
      priority: 2,
      prompt: `COMPREHENSIVE OPPORTUNITY SHRED ANALYSIS:

Extract the following structured information from the PWS/solicitation document:

**AGENCY INFORMATION:**
- Agency (Who is requesting the work)
- Contracting office/organization
- Program office or customer organization

**SCOPE ANALYSIS:**
Extract all verbatim task headers representing technical scope of work, regardless of where they appear in the document. These headers may fall under section titles such as "Specific Tasks," "Performance Requirements," "Functional Requirements," "Task Areas," "Areas of Interest," or similar language.

For each task header:
- Provide the exact verbatim task title (do not summarize or merge)
- Add 2-3 bullet points summarizing activities, scope, or functions under that header
- Consolidate only if sub-tasks are clearly nested under a parent task
- Exclude general administrative items like Monthly Status Reports, QASP, or boilerplate reporting unless explicitly requested
- If location is unclear, cite document name, section header, and page number

**TECHNICAL REQUIREMENTS:**
- Core technical capabilities required
- Performance standards and metrics
- Integration requirements
- Compliance standards (NIST, FedRAMP, etc.)
- Personnel requirements and clearance levels

**CONTRACT DETAILS:**
- Period of Performance (MM/DD/YYYY – MM/DD/YYYY format)
- Place of Performance (specific locations)
- Contract type and estimated value (if available)
- Key milestones and delivery dates

**DEAL BREAKERS ASSESSMENT:**
Look for and flag mention of:
- Approved Purchasing System requirements
- Contractor Facility Requirements
- Requirements for SCIF space
- NIPR/SIPR/JWICS Access requirements
- Other specialized facility or certification requirements

**GUARDRAILS:**
- Do not fabricate content
- Mark unclear requirements as "To Be Confirmed" or "Not Stated"
- If multiple documents uploaded, distinguish which file each data point comes from
- Include source citations: document name, section, page number for every extracted data point
- Flag any AI inference vs. sourced data
- Identify areas requiring SME review

OUTPUT FORMATTING:
All content must be professionally formatted for direct use in federal proposal workflows and exportable to Word, Excel, or PDF formats.`
    },
    {
      id: 'competitive-analysis',
      title: '3. Competitive Analysis & Decision Utility',
      description: 'Market analysis, competitor identification, and bid/no-bid assessment',
      icon: '�',
      status: 'pending',
      priority: 3,
      prompt: `COMPETITIVE ANALYSIS AND DECISION UTILITY:

Based on the opportunity requirements identified in the PWS/solicitation, conduct the following analysis:

**COMPETITIVE LANDSCAPE ANALYSIS:**
- Identify likely prime contractors based on:
  - Technical capability alignment
  - Contract vehicle access
  - Past performance in similar work
  - Agency relationship history
- Assess market dynamics and competition level
- Identify incumbent advantages or challenges

**CAPABILITY ASSESSMENT:**
- Map our company capabilities to opportunity requirements
- Identify strengths and competitive advantages
- Flag capability gaps or areas requiring partnerships
- Assess past performance alignment

**TEAMING ANALYSIS:**
- Identify potential teaming partners to fill capability gaps
- Assess which identified competitors might be viable teaming partners
- Recommend teaming strategies (prime vs. sub positions)
- Flag competitive threats from strong team formations

**BID/NO-BID DECISION FACTORS:**
- PWin assessment based on:
  - Technical capability fit
  - Past performance strength
  - Competitive positioning
  - Resource requirements vs. company capacity
- Strategic value assessment
- Risk factors and mitigation requirements
- Resource investment required vs. potential return

**DECISION UTILITY SUMMARY:**
Provide clear recommendation on bid/no-bid decision with supporting rationale including:
- PWin percentage estimate with confidence level
- Key success factors required to win
- Major risks and mitigation strategies
- Strategic importance to company growth

**TEAMING FLAG:**
Specifically identify if any competitors are viable teaming partners and recommended approach.

**GUARDRAILS:**
- Base analysis on factual requirements from the solicitation
- Clearly distinguish between sourced data and AI inference
- Mark speculative assessments with appropriate disclaimers
- Flag areas requiring SME review or additional market research
- Avoid fabricated competitor capabilities or relationships

**SOURCE REQUIREMENTS:**
- Include document references for all requirement-based assessments
- Cite specific sections supporting capability gap analysis
- Reference solicitation requirements in competitive positioning

OUTPUT FORMATTING:
Professional federal contracting language suitable for capture decision briefings and exportable to standard business formats.`
    }
  ]);

  const [isShredding, setIsShredding] = useState(false);
  const [currentSection, setCurrentSection] = useState<string | null>(null);

  const canStartShred = () => {
    if (!isTokenValid) return false;
    if (uploadedFiles.length === 0) return false;
    
    // Check if we have PWS, RFP, or similar documents
    const hasRelevantDocs = uploadedFiles.some(file => 
      file.name.toLowerCase().includes('pws') ||
      file.name.toLowerCase().includes('rfp') ||
      file.name.toLowerCase().includes('rfi') ||
      file.name.toLowerCase().includes('solicitation') ||
      file.type.includes('pdf') ||
      file.type.includes('word')
    );
    
    return hasRelevantDocs;
  };

  const startOpportunityShred = async () => {
    if (!canStartShred()) return;

    setIsShredding(true);
    const sectionsToProcess = [...shredSections].sort((a, b) => a.priority - b.priority);

    for (const section of sectionsToProcess) {
      setCurrentSection(section.id);
      
      // Update section status to processing
      setShredSections(prev => prev.map(s => 
        s.id === section.id ? { ...s, status: 'processing' } : s
      ));

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: section.prompt + '\n\n' + uploadedFiles.map(file => 
              `--- FILE: ${file.name} ---\n${file.content}\n--- END FILE ---`
            ).join(''),
            context: [],
            model: 'gpt-4o',
          }),
        });

        const result = await response.json();

        if (result.success) {
          // Update section with results
          setShredSections(prev => prev.map(s => 
            s.id === section.id 
              ? { ...s, status: 'complete', result: result.reply }
              : s
          ));
        } else {
          // Mark section as error
          setShredSections(prev => prev.map(s => 
            s.id === section.id 
              ? { ...s, status: 'error', result: result.error || 'Analysis failed' }
              : s
          ));
        }
      } catch (error) {
        // Mark section as error
        setShredSections(prev => prev.map(s => 
          s.id === section.id 
            ? { ...s, status: 'error', result: 'Network error occurred' }
            : s
        ));
      }

      // Brief pause between sections
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setCurrentSection(null);
    setIsShredding(false);

    // Notify parent component
    const completedSections = shredSections.filter(s => s.status === 'complete');
    onShredComplete(completedSections);
  };

  const resetShred = () => {
    setShredSections(prev => prev.map(section => ({
      ...section,
      status: 'pending',
      result: undefined
    })));
    setIsShredding(false);
    setCurrentSection(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'processing': return '🔄';
      case 'complete': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  const getCompletionStats = () => {
    const completed = shredSections.filter(s => s.status === 'complete').length;
    const total = shredSections.length;
    const errors = shredSections.filter(s => s.status === 'error').length;
    return { completed, total, errors };
  };

  const stats = getCompletionStats();

  return (
    <div className="opportunity-shred">
      <div className="shred-header">
        <h3>🔍 Federal Capture Methodology - Professional Opportunity Shred</h3>
        <p>Comprehensive 3-component analysis framework for PWS/RFP documents designed for capture manager decision-making</p>
        
        <div className="methodology-info">
          <div className="method-component">
            <strong>1. Executive Summary:</strong> High-level opportunity framing (2-3 sentences)
          </div>
          <div className="method-component">
            <strong>2. Detailed Shred:</strong> Agency, scope, technical requirements, and deal breakers
          </div>
          <div className="method-component">
            <strong>3. Competitive Analysis:</strong> Market analysis and bid/no-bid decision utility
          </div>
        </div>
        
        <div className="shred-stats">
          <div className="stat-item">
            <span className="stat-label">Documents:</span>
            <span className="stat-value">{uploadedFiles.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Sections:</span>
            <span className="stat-value">{stats.completed}/{stats.total}</span>
          </div>
          {stats.errors > 0 && (
            <div className="stat-item error">
              <span className="stat-label">Errors:</span>
              <span className="stat-value">{stats.errors}</span>
            </div>
          )}
        </div>

        <div className="shred-controls">
          {!isTokenValid && (
            <div className="requirement-message error">
              ⚠️ Valid OpenAI API token required to execute capture methodology
            </div>
          )}
          
          {isTokenValid && uploadedFiles.length === 0 && (
            <div className="requirement-message warning">
              📄 Please upload PWS, RFP, or solicitation documents to begin analysis
            </div>
          )}
          
          {isTokenValid && uploadedFiles.length > 0 && !canStartShred() && (
            <div className="requirement-message warning">
              📋 Upload relevant federal documents (PWS, RFP, RFI, or solicitation files)
            </div>
          )}
          
          <button
            onClick={startOpportunityShred}
            disabled={!canStartShred() || isShredding}
            className="btn btn-primary shred-start"
          >
            {isShredding ? '🔄 Processing Methodology...' : '🚀 Execute Federal Capture Shred'}
          </button>
          
          {stats.completed > 0 && (
            <button
              onClick={resetShred}
              disabled={isShredding}
              className="btn btn-outline shred-reset"
            >
              🔄 Reset Analysis
            </button>
          )}
        </div>
      </div>

      <div className="shred-sections">
        {shredSections.map((section) => (
          <div 
            key={section.id} 
            className={`shred-section ${section.status} ${currentSection === section.id ? 'active' : ''}`}
          >
            <div className="section-header">
              <div className="section-info">
                <span className="section-icon">{section.icon}</span>
                <div className="section-details">
                  <h4>{section.title}</h4>
                  <p>{section.description}</p>
                </div>
              </div>
              <div className="section-status">
                <span className="status-icon">{getStatusIcon(section.status)}</span>
                <span className="status-text">{section.status}</span>
              </div>
            </div>
            
            {section.result && (
              <div className="section-result">
                <div className="result-content">
                  {section.result}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
