import React from 'react';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { Document } from '../types';

interface DocumentsSectionProps {
  documents: Document[];
  onFileUpload: (documentId: string, file: File) => void;
  canUpload: boolean;
  error?: string;
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({ documents, onFileUpload, canUpload, error }) => {
  const requiredDocuments = documents.filter(d => d.required);

  if (requiredDocuments.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Documents</h3>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </p>
        </div>
      )}
      
      <div className="space-y-3">
        {requiredDocuments.map((document) => (
          <div key={document.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              {document.uploaded ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-red-300" />
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {document.name}
                  <span className="text-red-500 ml-1">*</span>
                </p>
                <p className="text-sm text-gray-600">
                  {document.uploaded ? 'Uploaded successfully' : 'Not uploaded'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {document.uploaded && document.file && (
                <p className="text-sm text-gray-500 truncate max-w-[120px]">{document.file.name}</p>
              )}
              <input
                type="file"
                id={`file-${document.id}`}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onFileUpload(document.id, file);
                  }
                }}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                disabled={!canUpload}
              />
              <label
                htmlFor={`file-${document.id}`}
                className={`inline-flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                  !canUpload
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : document.uploaded 
                      ? 'bg-green-50 border-green-300 text-green-700 cursor-pointer'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>{document.uploaded ? 'Replace' : 'Upload'}</span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentsSection;
