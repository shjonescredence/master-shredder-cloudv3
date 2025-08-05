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
      title: 'Executive Summary Extract',
      description: 'Key opportunity highlights, value, timeline, and strategic importance',
      icon: '📊',
      status: 'pending',
      priority: 1,
      prompt: `Extract and summarize the executive-level information from this opportunity:
        1. CONTRACT BASICS: Agency, office, contract type, estimated value, period of performance
        2. OPPORTUNITY OVERVIEW: Core mission, primary objectives, strategic importance to customer
        3. KEY DATES: RFP release, Q&A deadline, proposal due date, award date, start date
        4. COMPETITIVE LANDSCAPE: Set-aside type, competition level, incumbent information
        5. STRATEGIC ASSESSMENT: Why this matters to our business, alignment with company goals`
    },
    {
      id: 'requirements-matrix',
      title: 'Requirements Extraction',
      description: 'Systematic extraction of all functional and technical requirements',
      icon: '📋',
      status: 'pending',
      priority: 2,
      prompt: `Perform a comprehensive requirements extraction and create a structured matrix:
        1. FUNCTIONAL REQUIREMENTS: All "shall" and "must" requirements with section references
        2. TECHNICAL SPECIFICATIONS: Performance standards, compatibility, integration needs
        3. DELIVERY REQUIREMENTS: Locations, schedules, milestones, acceptance criteria
        4. PERSONNEL REQUIREMENTS: Key personnel, qualifications, clearance levels, experience
        5. COMPLIANCE ITEMS: Certifications, standards, regulations, reporting requirements
        6. EVALUATION CRITERIA: How each requirement will be scored and weighted`
    },
    {
      id: 'evaluation-intelligence',
      title: 'Evaluation Criteria Analysis',
      description: 'Deep dive into how proposals will be scored and ranked',
      icon: '🎯',
      status: 'pending',
      priority: 3,
      prompt: `Analyze the evaluation methodology and create scoring intelligence:
        1. EVALUATION FACTORS: Technical, management, past performance, price weights and priorities
        2. SCORING METHODOLOGY: Point systems, adjectival ratings, trade-off analysis approach
        3. DISCRIMINATORS: What will separate winning from losing proposals
        4. HOT BUTTONS: Customer priorities, pain points, must-have capabilities
        5. GOTCHAS: Hidden requirements, unclear evaluation criteria, potential traps
        6. WIN STRATEGY IMPLICATIONS: How to position our response for maximum score`
    },
    {
      id: 'compliance-checklist',
      title: 'Compliance & Submission',
      description: 'All submission requirements and compliance obligations',
      icon: '✅',
      status: 'pending',
      priority: 4,
      prompt: `Create a comprehensive compliance and submission checklist:
        1. PROPOSAL STRUCTURE: Required volumes, page limits, format specifications
        2. SUBMISSION PROCESS: Where, when, how to submit (electronic/physical)
        3. MANDATORY DOCUMENTS: Required forms, certifications, attachments
        4. FORMATTING RULES: Fonts, margins, numbering, labeling requirements
        5. COMPLIANCE MATRIX: Track every "shall," "must," and "will" requirement
        6. RISK AREAS: Potential compliance failures and mitigation strategies`
    },
    {
      id: 'competitive-analysis',
      title: 'Competitive Landscape',
      description: 'Market analysis and competitor positioning intelligence',
      icon: '🏁',
      status: 'pending',
      priority: 5,
      prompt: `Analyze the competitive environment for strategic positioning:
        1. MARKET ANALYSIS: Contract vehicle, incumbent advantages, market dynamics
        2. LIKELY COMPETITORS: Prime and subcontractor prospects based on capability fit
        3. COMPETITIVE ADVANTAGES: Our unique strengths vs. likely competition
        4. TEAMING IMPLICATIONS: Partnership opportunities and competitive threats
        5. PRICING CONSIDERATIONS: Market rates, competitive pressure points
        6. DIFFERENTIATION STRATEGY: How to stand out in the competitive field`
    },
    {
      id: 'risk-assessment',
      title: 'Risk & Opportunity Analysis',
      description: 'Comprehensive risk identification and mitigation strategies',
      icon: '⚠️',
      status: 'pending',
      priority: 6,
      prompt: `Conduct thorough risk assessment and opportunity analysis:
        1. TECHNICAL RISKS: Complex requirements, unproven technology, integration challenges
        2. BUSINESS RISKS: Pricing pressure, capability gaps, resource constraints
        3. COMPETITIVE RISKS: Strong incumbents, well-positioned competitors, teaming conflicts
        4. COMPLIANCE RISKS: Ambiguous requirements, tight deadlines, complex submission process
        5. MITIGATION STRATEGIES: How to address each identified risk category
        6. OPPORTUNITY UPSIDE: Growth potential, follow-on opportunities, strategic value`
    },
    {
      id: 'capture-roadmap',
      title: 'Capture Strategy Roadmap',
      description: 'Actionable capture plan with activities and timeline',
      icon: '🗺️',
      status: 'pending',
      priority: 7,
      prompt: `Develop a comprehensive capture strategy and execution roadmap:
        1. BID/NO-BID ANALYSIS: PWin assessment, resource requirements, strategic fit
        2. CAPTURE ACTIVITIES: Customer engagement, teaming, competitive intelligence tasks
        3. PROPOSAL STRATEGY: Win themes, ghost strategies, key personnel assignments
        4. TIMELINE & MILESTONES: Critical path activities from RFP to proposal submission
        5. RESOURCE REQUIREMENTS: Personnel, budget, external support needed
        6. SUCCESS METRICS: How to measure capture progress and proposal quality`
    }
  ]);

  const [isShredding, setIsShredding] = useState(false);
  const [currentSection, setCurrentSection] = useState<string | null>(null);

  const canStartShred = () => {
    return isTokenValid && uploadedFiles.length > 0;
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
        <h3>🔍 Comprehensive Opportunity Shred</h3>
        <p>Systematic analysis of federal opportunities for maximum capture intelligence</p>
        
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
          <button
            onClick={startOpportunityShred}
            disabled={!canStartShred() || isShredding}
            className="btn btn-primary shred-start"
          >
            {isShredding ? '🔄 Shredding...' : '🚀 Start Comprehensive Shred'}
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
