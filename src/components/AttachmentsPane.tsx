import React from 'react';
import { Plus, Upload, CheckCircle, Trash2 } from 'lucide-react';
import { Document } from '../types';

interface AttachmentsPaneProps {
  documents: Document[];
  onAddAttachment: () => void;
  onRemoveAttachment: (documentId: string) => void;
  onUploadAttachment: (documentId: string, file: File) => void;
}

const AttachmentsPane: React.FC<AttachmentsPaneProps> = ({ documents, onAddAttachment, onRemoveAttachment, onUploadAttachment }) => {
  const attachsExist = documents.filter(d => d.uploaded || d.awaiting).length > 0;
  const uploadedDocuments = documents.filter(d => d.uploaded);
  const awaitingDocuments = documents.filter(d => d.awaiting);

  const handleRemoveClick = (doc: Document) => {
    if (window.confirm(`Are you sure you want to remove the attachment "${doc.name}"?`)) {
      onRemoveAttachment(doc.id);
    }
  };

  return (
    <div className="sticky top-8 bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-5 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Attachments</h3>
      </div>
      <div className="p-6 space-y-4">
        {attachsExist ? (
          <>
            {uploadedDocuments.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <p className="font-medium text-gray-800 truncate">{doc.name}</p>
                    <p className="text-sm text-gray-500 truncate">{doc.file?.name}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveClick(doc)}
                  className="text-gray-400 hover:text-red-600 ml-2 flex-shrink-0"
                  aria-label={`Remove ${doc.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {awaitingDocuments.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <Upload className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <p className="font-medium text-gray-800 truncate">{doc.name}</p>
                    <p className="text-sm text-yellow-700 truncate">Awaiting file upload</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-2">
                  <input
                    type="file"
                    id={`file-awaiting-${doc.id}`}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onUploadAttachment(doc.id, file);
                      }
                    }}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor={`file-awaiting-${doc.id}`}
                    className="inline-flex items-center space-x-2 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md cursor-pointer hover:bg-gray-50 text-sm transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveClick(doc)}
                    className="text-gray-400 hover:text-red-600 flex-shrink-0"
                    aria-label={`Remove ${doc.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No attachments yet.</p>
        )}
        
        <button
          type="button"
          onClick={onAddAttachment}
          className="w-full mt-3 flex items-center justify-center space-x-2 text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Attachment</span>
        </button>
      </div>
    </div>
  );
};

export default AttachmentsPane;
