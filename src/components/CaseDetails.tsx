import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, CheckCircle, XCircle, Clock, Plus, Upload, Trash2 } from 'lucide-react';
import { Case, Comment, UserRole, Document } from '../types';
import AttachmentsPane from './AttachmentsPane';
import DocumentsSection from './DocumentsSection';

interface CaseDetailsProps {
  case_: Case;
  userRole: UserRole;
  onBack: () => void;
  onAddComment: (comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  onStatusUpdate: (status: Case['status'], assignee: string) => void;
  onAddAttachment: (newDoc: Document) => void;
  onRemoveAttachment: (documentId: string) => void;
  onUploadAttachment: (documentId: string, file: File) => void;
}

const CaseDetails: React.FC<CaseDetailsProps> = ({ 
  case_, 
  userRole, 
  onBack, 
  onAddComment, 
  onStatusUpdate,
  onAddAttachment,
  onRemoveAttachment,
  onUploadAttachment,
}) => {
  const [commentText, setCommentText] = useState('');
  const [commentTarget, setCommentTarget] = useState<'client-info' | 'change-request'>('client-info');
  const [selectedChangeRequestId, setSelectedChangeRequestId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'client-info' | 'change-requests'>('client-info');

  const roleToAssigneeMap: Record<UserRole, string> = {
    client: 'Client',
    okw: 'OKW Team',
    cdd: 'CDD Team',
  };
  const isAssignedUser = roleToAssigneeMap[userRole] === case_.currentAssignee;

  useEffect(() => {
    if (activeTab === 'client-info') {
      setCommentTarget('client-info');
      setSelectedChangeRequestId('');
    } else {
      setCommentTarget('change-request');
      // Default to the first change request if none is selected
      if (!selectedChangeRequestId && case_.changeRequests.length > 0) {
        setSelectedChangeRequestId(case_.changeRequests[0].id);
      }
    }
  }, [activeTab, case_.changeRequests, selectedChangeRequestId]);

  const handleAddAttachment = () => {
    const docName = window.prompt("Please enter the name for the new attachment:");
    if (docName) {
      const newDoc: Document = {
        id: Date.now().toString(),
        name: docName,
        required: false,
        uploaded: false,
        awaiting: true,
      };
      onAddAttachment(newDoc);
    }
  };

  const handleRemoveAttachment = (documentId: string) => {
    onRemoveAttachment(documentId);
  };

  const handleUploadAttachment = (documentId: string, file: File) => {
    onUploadAttachment(documentId, file);
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;

    const comment: Omit<Comment, 'id' | 'timestamp'> = {
      text: commentText,
      author: userRole === 'okw' ? 'OKW Team' : userRole === 'cdd' ? 'CDD Team' : 'Client',
      target: commentTarget,
      targetId: commentTarget === 'change-request' ? selectedChangeRequestId : undefined,
    };

    onAddComment(comment);
    setCommentText('');
  };

  const handleApprove = () => {
    onStatusUpdate('approved', 'System');
    // Simulate email notification
    alert(`Email sent to ${case_.clientInfo.clientName}: Your case #${case_.id} has been approved.`);
  };

  const handleReject = () => {
    onStatusUpdate('rejected', 'System');
    // Simulate email notification
    alert(`Email sent to ${case_.clientInfo.clientName}: Your case #${case_.id} has been rejected.`);
  };

  const handleMoveToNext = () => {
    if (case_.status === 'pending' || case_.status === 'with-okw') {
      onStatusUpdate('with-cdd', 'CDD Team');
    }
  };

  const canComment = isAssignedUser;
  const canApprove = isAssignedUser && case_.status === 'with-cdd';
  const canMoveForward = (userRole === 'okw' && case_.status === 'pending') || (isAssignedUser && case_.status === 'with-okw');

  const getCommentsForTarget = (target: string, targetId?: string) => {
    return case_.comments.filter(comment => 
      comment.target === target && 
      (target === 'client-info' || comment.targetId === targetId)
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Case #{case_.id}</h2>
                  <p className="text-gray-600 mt-1">
                    Submitted on {case_.submittedAt.toLocaleDateString()} • 
                    Last updated {case_.updatedAt.toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                    case_.status === 'approved' ? 'bg-green-100 text-green-800' :
                    case_.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    case_.status === 'with-cdd' ? 'bg-purple-100 text-purple-800' :
                    case_.status === 'with-okw' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {case_.status.replace('-', ' ')}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 mb-8">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('client-info')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'client-info'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Client Information
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('change-requests')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'change-requests'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Immaterial Changes
                  </button>
                </nav>
              </div>

              {activeTab === 'client-info' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                        <p className="text-gray-900">{case_.clientInfo.clientName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Information</label>
                        <p className="text-gray-900">{case_.clientInfo.dateOfInformation}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">COLTID</label>
                        <p className="text-gray-900">{case_.clientInfo.coltId}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <p className="text-gray-900">{case_.clientInfo.email}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <p className="text-gray-900">{case_.clientInfo.address}</p>
                      </div>
                    </div>

                    {/* Comments for Client Info */}
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-900 mb-3">Comments</h4>
                      <div className="space-y-3">
                        {getCommentsForTarget('client-info').map((comment) => (
                          <div key={comment.id} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-gray-900">{comment.author}</span>
                              <span className="text-sm text-gray-500">
                                {comment.timestamp.toLocaleDateString()} {comment.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-gray-700">{comment.text}</p>
                          </div>
                        ))}
                        {getCommentsForTarget('client-info').length === 0 && (
                          <p className="text-gray-500 italic">No comments yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'change-requests' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Immaterial Changes</h3>
                  <div className="space-y-6">
                    {case_.changeRequests.map((request, index) => (
                      <div key={request.id} className="bg-gray-50 rounded-lg p-6">
                        <h4 className="font-medium text-gray-900 mb-4">Request #{index + 1}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">HDI Number</label>
                            <p className="text-gray-900">{request.hdiNumber}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                            <p className="text-gray-900">{request.country}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type of Change</label>
                            <p className="text-gray-900">{request.typeOfChange}</p>
                          </div>
                        </div>

                        {/* Comments for Change Request */}
                        <div className="mt-6">
                          <h5 className="font-medium text-gray-900 mb-3">Comments</h5>
                          <div className="space-y-3">
                            {getCommentsForTarget('change-request', request.id).map((comment) => (
                              <div key={comment.id} className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-medium text-gray-900">{comment.author}</span>
                                  <span className="text-sm text-gray-500">
                                    {comment.timestamp.toLocaleDateString()} {comment.timestamp.toLocaleTimeString()}
                                  </span>
                                </div>
                                <p className="text-gray-700">{comment.text}</p>
                              </div>
                            ))}
                            {getCommentsForTarget('change-request', request.id).length === 0 && (
                              <p className="text-gray-500 italic">No comments yet</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-8">
                <DocumentsSection
                  documents={case_.documents}
                  onFileUpload={handleUploadAttachment}
                  canUpload={isAssignedUser}
                />
              </div>

              {/* Add Comment Section */}
              {canComment && (
                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Comment</h3>
                  <div className="space-y-4">
                    {commentTarget === 'change-request' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Request to Comment On</label>
                        <select
                          value={selectedChangeRequestId}
                          onChange={(e) => setSelectedChangeRequestId(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select a request</option>
                          {case_.changeRequests.map((request, index) => (
                            <option key={request.id} value={request.id}>
                              Request #{index + 1} - {request.hdiNumber}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add your comment..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <button
                      onClick={handleAddComment}
                      disabled={!commentText.trim() || (commentTarget === 'change-request' && !selectedChangeRequestId)}
                      className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Add Comment</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="border-t border-gray-200 pt-8">
                <div className="flex space-x-4">
                  {canMoveForward && (
                    <button
                      onClick={handleMoveToNext}
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Move to CDD Review</span>
                    </button>
                  )}
                  
                  {canApprove && (
                    <>
                      <button
                        onClick={handleApprove}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve Case</span>
                      </button>
                      
                      <button
                        onClick={handleReject}
                        className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject Case</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <AttachmentsPane
            documents={case_.documents}
            onAddAttachment={handleAddAttachment}
            onRemoveAttachment={handleRemoveAttachment}
            onUploadAttachment={handleUploadAttachment}
            canManageAttachments={isAssignedUser}
          />
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;