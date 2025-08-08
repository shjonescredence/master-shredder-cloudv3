import React, { useCallback, useState } from 'react';
import './FileUpload.css';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
  uploadDate: Date;
}

interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  uploadedFiles: UploadedFile[];
  onFileRemove: (fileId: string) => void;
  maxFiles?: number;
  maxSizeBytes?: number;
  acceptedTypes?: string[];
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesUploaded,
  uploadedFiles,
  onFileRemove,
  maxFiles = 10,
  maxSizeBytes = 10 * 1024 * 1024, // 10MB default
  acceptedTypes = ['.pdf', '.doc', '.docx', '.txt', '.md', '.rtf']
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSizeBytes) {
      return `File "${file.name}" is too large. Maximum size is ${formatFileSize(maxSizeBytes)}.`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type "${fileExtension}" is not supported. Accepted types: ${acceptedTypes.join(', ')}.`;
    }

    // Check max files limit
    if (uploadedFiles.length >= maxFiles) {
      return `Maximum ${maxFiles} files allowed.`;
    }

    return null;
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        resolve(result);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const processFiles = async (files: FileList) => {
    setIsProcessing(true);
    setError('');

    const newFiles: UploadedFile[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(validationError);
        continue;
      }

      try {
        const content = await readFileContent(file);
        const uploadedFile: UploadedFile = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          content,
          uploadDate: new Date()
        };
        newFiles.push(uploadedFile);
      } catch (err) {
        errors.push(`Failed to read file "${file.name}"`);
      }
    }

    if (errors.length > 0) {
      setError(errors.join(' '));
    }

    if (newFiles.length > 0) {
      onFilesUploaded(newFiles);
    }

    setIsProcessing(false);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [uploadedFiles.length, maxFiles, maxSizeBytes, acceptedTypes]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input value to allow same file to be selected again
    e.target.value = '';
  };

  const getFileIcon = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'txt':
        return '📋';
      case 'md':
        return '📖';
      case 'rtf':
        return '📃';
      default:
        return '📄';
    }
  };

  return (
    <div className="file-upload-container">
      {/* Upload Zone */}
      <div
        className={`upload-zone ${isDragOver ? 'drag-over' : ''} ${isProcessing ? 'processing' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        <div className="upload-content">
          {isProcessing ? (
            <>
              <div className="upload-spinner"></div>
              <p>Processing files...</p>
            </>
          ) : (
            <>
              <div className="upload-icon">📁</div>
              <h3>Drop contract documents here</h3>
              <p>or click to browse files</p>
              <div className="upload-specs">
                <span>Supported: {acceptedTypes.join(', ')}</span>
                <span>Max size: {formatFileSize(maxSizeBytes)}</span>
                <span>Max files: {maxFiles}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="upload-error">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="uploaded-files">
          <h4>📋 Uploaded Documents ({uploadedFiles.length})</h4>
          <div className="files-list">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="file-item">
                <div className="file-info">
                  <span className="file-icon">{getFileIcon(file.name)}</span>
                  <div className="file-details">
                    <div className="file-name" title={file.name}>
                      {file.name}
                    </div>
                    <div className="file-meta">
                      {formatFileSize(file.size)} • {file.uploadDate.toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <button
                  className="file-remove"
                  onClick={() => onFileRemove(file.id)}
                  title="Remove file"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="files-summary">
            Total: {uploadedFiles.length} files • {formatFileSize(uploadedFiles.reduce((sum, f) => sum + f.size, 0))}
          </div>
        </div>
      )}
    </div>
  );
};
