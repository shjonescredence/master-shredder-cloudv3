class MasterShredder {
    constructor() {
        this.currentContext = '';
        this.fileQueue = [];
        this.isProcessing = false;
        this.initializeEventListeners();
        console.log('🎯 Master Shredder initialized on Windows with drag & drop!');
    }
    
    initializeEventListeners() {
        // File input handling
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        }
        
        // Drag and drop handling
        const uploadArea = document.getElementById('uploadArea');
        const uploadPrompt = document.getElementById('uploadPrompt');
        const uploadOverlay = document.getElementById('uploadOverlay');
        
        if (uploadArea && uploadPrompt) {
            // Prevent default drag behaviors
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                uploadArea.addEventListener(eventName, this.preventDefaults, false);
                document.body.addEventListener(eventName, this.preventDefaults, false);
            });
            
            // Highlight drop area
            ['dragenter', 'dragover'].forEach(eventName => {
                uploadArea.addEventListener(eventName, () => {
                    uploadPrompt.classList.add('drag-over');
                    uploadOverlay.classList.add('show');
                }, false);
            });
            
            // Unhighlight drop area
            ['dragleave', 'drop'].forEach(eventName => {
                uploadArea.addEventListener(eventName, () => {
                    uploadPrompt.classList.remove('drag-over');
                    uploadOverlay.classList.remove('show');
                }, false);
            });
            
            // Handle dropped files
            uploadArea.addEventListener('drop', this.handleDrop.bind(this), false);
        }
        
        // Chat input handling
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        // Initialize status
        this.updateStatus('Ready');
        
        // Test connection on load
        this.testConnection();
    }
    
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        this.handleFiles(files);
    }
    
    handleFileSelect(event) {
        const files = event.target.files;
        this.handleFiles(files);
        // Clear the input so the same file can be selected again
        event.target.value = '';
    }
    
    handleFiles(files) {
        // Convert FileList to Array and filter for supported types
        const fileArray = Array.from(files).filter(file => {
            return file.name.toLowerCase().endsWith('.pdf') || 
                   file.name.toLowerCase().endsWith('.docx');
        });
        
        if (fileArray.length === 0) {
            this.addMessage('❌ Please upload only PDF or Word documents.', 'assistant');
            return;
        }
        
        if (fileArray.length > 5) {
            this.addMessage('❌ Please upload a maximum of 5 files at a time.', 'assistant');
            return;
        }
        
        // Add files to queue
        fileArray.forEach(file => {
            if (file.size > 50 * 1024 * 1024) { // 50MB limit
                this.addMessage(`❌ File "${file.name}" is too large. Please use files smaller than 50MB.`, 'assistant');
                return;
            }
            
            this.fileQueue.push({
                file: file,
                status: 'queued',
                id: Date.now() + Math.random()
            });
        });
        
        this.updateFileQueue();
        this.processQueue();
    }
    
    updateFileQueue() {
        const queueContainer = document.getElementById('fileQueue');
        const queueItems = document.getElementById('queueItems');
        
        if (this.fileQueue.length > 0) {
            queueContainer.classList.add('show');
            queueItems.innerHTML = '';
            
            this.fileQueue.forEach(item => {
                const queueItem = document.createElement('div');
                queueItem.className = 'file-queue-item';
                queueItem.innerHTML = `
                    <div class="file-info">
                        <div class="file-name">📄 ${item.file.name}</div>
                        <div class="file-size">${this.formatFileSize(item.file.size)}</div>
                    </div>
                    <div class="file-status ${item.status}">${this.getStatusText(item.status)}</div>
                `;
                queueItems.appendChild(queueItem);
            });
        } else {
            queueContainer.classList.remove('show');
        }
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    getStatusText(status) {
        const statusTexts = {
            'queued': '⏳ Queued',
            'processing': '🔄 Processing...',
            'complete': '✅ Complete',
            'error': '❌ Error'
        };
        return statusTexts[status] || status;
    }
    
    async processQueue() {
        if (this.isProcessing || this.fileQueue.length === 0) return;
        
        this.isProcessing = true;
        this.updateStatus('Processing files...');
        
        while (this.fileQueue.length > 0) {
            const item = this.fileQueue.find(f => f.status === 'queued');
            if (!item) break;
            
            item.status = 'processing';
            this.updateFileQueue();
            
            try {
                await this.processFile(item);
                item.status = 'complete';
            } catch (error) {
                item.status = 'error';
                console.error('File processing error:', error);
            }
            
            this.updateFileQueue();
            
            // Remove completed/error items after a delay
            setTimeout(() => {
                this.fileQueue = this.fileQueue.filter(f => f.id !== item.id);
                this.updateFileQueue();
            }, 3000);
        }
        
        this.isProcessing = false;
        this.updateStatus('Ready');
    }
    
    async processFile(item) {
        const file = item.file;
        
        console.log('📁 Processing file:', file.name);
        this.addMessage(`📤 Processing "${file.name}"...`, 'assistant');
        
        const apiKey = localStorage.getItem('openai_api_key');
        if (!apiKey) {
            window.location.href = '/setup';
            return;
        }
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);
        
       const response = await fetch('http://localhost:8000/upload', {
    method: 'POST',
    body: formData
});

        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ File processed successfully');
            this.displayFileResult(file.name, result.analysis);
            this.addMessage(`✅ Successfully analyzed "${file.name}"!\n\nKey insights have been extracted and are ready for your questions.`, 'assistant');
            this.currentContext += '\n\n' + result.analysis;
        } else {
            console.error('❌ File processing failed:', result.error);
            this.addMessage(`❌ Error processing "${file.name}": ${result.error}`, 'assistant');
            throw new Error(result.error);
        }
    }
    
    async testConnection() {
        try {
            const response = await fetch('/health');
            const result = await response.json();
            if (result.status === 'healthy') {
                console.log('✅ Backend connection successful');
                this.updateStatus('Connected');
            }
        } catch (error) {
            console.error('❌ Backend connection failed:', error);
            this.updateStatus('Connection Error');
            this.addMessage('⚠️ Having trouble connecting to the backend. Please check that the server is running with: python src\\app.py', 'assistant');
        }
    }
    
    displayFileResult(filename, analysis) {
        // Add to uploaded files list
        const filesContainer = document.getElementById('uploadedFiles');
        
        // Remove placeholder if it exists
        const placeholder = filesContainer.querySelector('.placeholder');
        if (placeholder) {
            placeholder.remove();
        }
        
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <strong>📄 ${filename}</strong>
            <small style="display: block; color: #6c757d; margin-top: 8px;">
                ✅ Processed at ${new Date().toLocaleTimeString()}
            </small>
        `;
        filesContainer.appendChild(fileItem);
        
        // Update analysis results panel
        const analysisContainer = document.getElementById('analysisResults');
        analysisContainer.innerHTML = `
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem; border-radius: 10px; margin-bottom: 1rem;">
                <strong>📊 Analysis: ${filename}</strong>
            </div>
            <div class="analysis-content">
                ${this.formatAnalysis(analysis)}
            </div>
        `;
    }
    
    formatAnalysis(analysis) {
        // Convert markdown-style formatting to HTML
        return analysis
            .replace(/## (.*?)\n/g, '<h3 style="color: #667eea; margin: 1.5rem 0 1rem 0; font-size: 1.1rem;">$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/(\d+\.)\s/g, '<br><strong>$1</strong> ');
    }
    
    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) {
            console.log('⚠️ Empty message, not sending');
            return;
        }
        
        console.log('💬 Sending message:', message);
        this.addMessage(message, 'user');
        input.value = '';
        
        // Show loading state
        this.updateStatus('Thinking...');
        const sendButton = document.getElementById('sendButton');
        const sendText = document.getElementById('sendText');
        const sendLoader = document.getElementById('sendLoader');
        
        sendButton.disabled = true;
        sendText.style.display = 'none';
        sendLoader.style.display = 'inline';
        
        try {
            const apiKey = localStorage.getItem('openai_api_key');
            if (!apiKey) {
                window.location.href = '/setup';
                return;
            }
            
            const formData = new FormData();
            formData.append('message', message);
            formData.append('api_key', apiKey);
            formData.append('context', this.currentContext);
            
            const response = await fetch('/chat', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success && result.response) {
                console.log('✅ Got AI response');
                this.addMessage(result.response, 'assistant');
            } else {
                console.error('❌ Chat error:', result.error);
                this.addMessage(`❌ I encountered an error: ${result.error}`, 'assistant');
            }
            
        } catch (error) {
            console.error('❌ Chat request failed:', error);
            this.addMessage(`❌ I'm having trouble connecting right now: ${error.message}`, 'assistant');
        } finally {
            // Reset loading state
            this.updateStatus('Ready');
            sendButton.disabled = false;
            sendText.style.display = 'inline';
            sendLoader.style.display = 'none';
        }
    }
    
    addMessage(content, type) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        if (type === 'assistant') {
            contentDiv.innerHTML = this.formatMessage(content);
        } else {
            contentDiv.textContent = content;
        }
        
        messageDiv.appendChild(contentDiv);
        messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        console.log(`💬 Added ${type} message:`, content.substring(0, 100) + '...');
    }
    
    formatMessage(content) {
        // Enhanced formatting for better readability
        return content
            .replace(/## (.*?)\n/g, '<h3 style="color: #667eea; margin: 1rem 0 0.5rem 0; font-size: 1.1rem;">$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #495057;">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>')
            .replace(/(\d+\.)\s/g, '<br><strong style="color: #667eea;">$1</strong> ')
            .replace(/• /g, '<br>• ');
    }
    
    updateStatus(status) {
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.textContent = status;
            console.log(`📊 Status updated: ${status}`);
        }
    }
}

// Quick action functions
function quickAction(action) {
    console.log(`🚀 Quick action: ${action}`);
    
    const messages = {
        'compliance-matrix': 'Please generate a detailed compliance matrix for the uploaded RFP document, showing all requirements and where they should be addressed in our response.',
        'timeline': 'Create a comprehensive proposal timeline with key milestones, deadlines, and Shipley methodology checkpoints.',
        'competitor-analysis': 'Analyze potential competitors for this opportunity and provide recommendations for our competitive positioning.'
    };
    
    const input = document.getElementById('chatInput');
    const message = messages[action] || `Help me with ${action}`;
    
    input.value = message;
    input.focus();
    
    // Auto-send the message
    window.assistant.sendMessage();
}

// Tool functions
function openTool(tool) {
    console.log(`🛠️ Opening tool: ${tool}`);
    
    const tools = {
        'shredder': 'Please perform a detailed RFP shredding analysis, extracting all requirements, deliverables, and compliance items from the uploaded document.',
        'matrix': 'Generate a compliance matrix showing how we can address each RFP requirement in our proposal response.',
        'timeline': 'Create a detailed proposal development timeline following Shipley methodology with all key milestones.',
        'teaming': 'Analyze our capability gaps and recommend potential teaming partners with rationale for each suggestion.'
    };
    
    const input = document.getElementById('chatInput');
    const message = tools[tool] || `Please help me with the ${tool} tool`;
    
    input.value = message;
    input.focus();
    
    // Auto-send the message
    window.assistant.sendMessage();
}

// Initialize the assistant when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded, initializing Master Shredder on Windows...');
    window.assistant = new MasterShredder();
});

// Make functions available globally
window.quickAction = quickAction;
window.openTool = openTool;
window.sendMessage = function() {
    if (window.assistant) {
        window.assistant.sendMessage();
    }
};

console.log('✅ Master Shredder script loaded for Windows with drag & drop support');