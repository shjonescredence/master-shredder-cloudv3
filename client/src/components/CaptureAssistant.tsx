import React, { useState } from 'react';
import './CaptureAssistant.css';

interface CaptureAssistantProps {
  onPromptSelect: (prompt: string, context?: string) => void;
  isTokenValid: boolean;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  prompt: string;
  requiresDocument?: boolean;
}

const CAPTURE_QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'rfp-analysis',
    title: 'RFP/RFI Analysis',
    description: 'Comprehensive breakdown of solicitation requirements and evaluation criteria',
    icon: '📋',
    prompt: 'Analyze this RFP/RFI document and provide a comprehensive breakdown including: 1) Key requirements and scope, 2) Evaluation criteria and weights, 3) Submission requirements and deadlines, 4) Compliance matrix, 5) Risk areas and ambiguities that need clarification.',
    requiresDocument: true
  },
  {
    id: 'gap-analysis',
    title: 'Capability Gap Analysis',
    description: 'Compare company capabilities against opportunity requirements',
    icon: '🔍',
    prompt: 'Perform a capability gap analysis for this opportunity: 1) Map our company strengths to RFP requirements, 2) Identify capability gaps and weaknesses, 3) Assess past performance alignment, 4) Recommend teaming or partnership strategies, 5) Provide bid/no-bid recommendation with PWin assessment.',
    requiresDocument: true
  },
  {
    id: 'competitor-intel',
    title: 'Competitive Intelligence',
    description: 'Research competitors and market positioning',
    icon: '🎯',
    prompt: 'Conduct competitive intelligence analysis: 1) Identify likely competitors for this opportunity, 2) Analyze their strengths, weaknesses, and past performance, 3) Assess potential teaming arrangements, 4) Compare our competitive positioning, 5) Recommend differentiation strategies.',
    requiresDocument: false
  },
  {
    id: 'partner-search',
    title: 'Teaming Partner Research',
    description: 'Find potential partners to fill capability gaps',
    icon: '🤝',
    prompt: 'Help identify optimal teaming partners: 1) Analyze our capability gaps from the RFP requirements, 2) Research companies with complementary capabilities, 3) Assess potential partners\' past performance and reputation, 4) Recommend partnership strategies and roles, 5) Draft initial teaming approach talking points.',
    requiresDocument: true
  },
  {
    id: 'win-strategy',
    title: 'Win Strategy Development',
    description: 'Develop win themes and competitive strategy',
    icon: '🏆',
    prompt: 'Develop a comprehensive win strategy: 1) Identify customer hot buttons and priorities, 2) Create compelling win themes and differentiators, 3) Develop ghost strategies against key competitors, 4) Recommend pricing strategy considerations, 5) Outline capture activities and timeline.',
    requiresDocument: true
  },
  {
    id: 'compliance-matrix',
    title: 'Compliance Matrix',
    description: 'Generate detailed compliance tracking matrix',
    icon: '✅',
    prompt: 'Create a detailed compliance matrix: 1) Extract all "shall" and "must" requirements from the RFP, 2) Map each requirement to our proposed solution approach, 3) Identify compliance risks and gaps, 4) Create tracking format for proposal team, 5) Highlight critical compliance deadlines.',
    requiresDocument: true
  },
  {
    id: 'rfi-response',
    title: 'RFI Response Support',
    description: 'Draft comprehensive RFI responses using company templates',
    icon: '📝',
    prompt: 'Help create a professional RFI response: 1) Analyze the RFI questions and requirements, 2) Structure response using best practices, 3) Identify areas needing specific company information, 4) Draft initial response content, 5) Highlight sections requiring executive review or specialized input.',
    requiresDocument: true
  },
  {
    id: 'amendment-analysis',
    title: 'Amendment Impact Analysis',
    description: 'Analyze RFP amendments and their strategic impact',
    icon: '📄',
    prompt: 'Analyze this RFP amendment: 1) Summarize all changes from the original solicitation, 2) Assess impact on our win strategy and approach, 3) Identify new requirements or modified evaluation criteria, 4) Recommend strategy adjustments, 5) Update compliance and risk assessments.',
    requiresDocument: true
  }
];

export const CaptureAssistant: React.FC<CaptureAssistantProps> = ({
  onPromptSelect,
  isTokenValid
}) => {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [documentContext, setDocumentContext] = useState<string>('');
  const [showDocumentInput, setShowDocumentInput] = useState<boolean>(false);

  const handleActionClick = (action: QuickAction) => {
    if (!isTokenValid) {
      alert('Please validate your API token first');
      return;
    }

    setSelectedAction(action.id);
    
    if (action.requiresDocument) {
      setShowDocumentInput(true);
    } else {
      onPromptSelect(action.prompt);
    }
  };

  const handleExecuteWithDocument = () => {
    const action = CAPTURE_QUICK_ACTIONS.find(a => a.id === selectedAction);
    if (action && documentContext.trim()) {
      const fullPrompt = `${action.prompt}\n\nDocument/Context to analyze:\n${documentContext}`;
      onPromptSelect(fullPrompt);
      setShowDocumentInput(false);
      setDocumentContext('');
      setSelectedAction(null);
    }
  };

  const handleCancel = () => {
    setShowDocumentInput(false);
    setDocumentContext('');
    setSelectedAction(null);
  };

  return (
    <div className="capture-assistant">
      <div className="capture-header">
        <div className="capture-title">
          <h2>🎯 Federal Contract Capture Assistant</h2>
          <p>Specialized AI support for government contracting professionals</p>
        </div>
      </div>

      {!showDocumentInput ? (
        <div className="quick-actions-grid">
          {CAPTURE_QUICK_ACTIONS.map((action) => (
            <div
              key={action.id}
              className={`quick-action-card ${!isTokenValid ? 'disabled' : ''}`}
              onClick={() => handleActionClick(action)}
            >
              <div className="action-icon">{action.icon}</div>
              <div className="action-content">
                <h3>{action.title}</h3>
                <p>{action.description}</p>
                {action.requiresDocument && (
                  <span className="document-required">📄 Requires document/context</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="document-input-modal">
          <div className="modal-header">
            <h3>
              {CAPTURE_QUICK_ACTIONS.find(a => a.id === selectedAction)?.icon} {' '}
              {CAPTURE_QUICK_ACTIONS.find(a => a.id === selectedAction)?.title}
            </h3>
            <p>Please paste the document content, RFP text, or relevant context below:</p>
          </div>
          
          <textarea
            className="document-textarea"
            value={documentContext}
            onChange={(e) => setDocumentContext(e.target.value)}
            placeholder="Paste RFP sections, solicitation text, or relevant documents here..."
            rows={15}
          />
          
          <div className="modal-actions">
            <button 
              className="execute-btn"
              onClick={handleExecuteWithDocument}
              disabled={!documentContext.trim()}
            >
              🚀 Analyze & Execute
            </button>
            <button 
              className="cancel-btn"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="capture-footer">
        <div className="capabilities-summary">
          <h4>🔧 Key Capabilities</h4>
          <div className="capability-tags">
            <span className="tag">RFP Analysis</span>
            <span className="tag">Gap Assessment</span>
            <span className="tag">Competitive Intel</span>
            <span className="tag">Partner Research</span>
            <span className="tag">Win Strategy</span>
            <span className="tag">Compliance Tracking</span>
            <span className="tag">RFI Responses</span>
            <span className="tag">FAR/DFARS Expert</span>
          </div>
        </div>
      </div>
    </div>
  );
};
