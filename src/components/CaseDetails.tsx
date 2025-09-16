import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Case, Comment, UserRole } from '../types';

interface CaseDetailsProps {
  case_: Case;
  userRole: UserRole;
  onBack: () => void;
  onAddComment: (comment: Omit<Comment, 'id' | 'timestamp'>) => void;
  onStatusUpdate: (status: Case['status'], assignee: string) => void;
}

const CaseDetails: React.FC<CaseDetailsProps> = ({ 
  case_, 
  userRole, 
  onBack, 
  onAddComment, 
  onStatusUpdate 
}) => {
  const [commentText, setCommentText] = useState('');
  const [commentTarget, setCommentTarget] = useState<'client-info' | 'change-request'>('client-info');
  const [selectedChangeRequestId, setSelectedChangeRequestId] = useState<string>('');

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

  const canComment = userRole === 'okw' || userRole === 'cdd';
  const canApprove = userRole === 'cdd' && case_.status === 'with-cdd';
  const canMoveForward = userRole === 'okw' && (case_.status === 'pending' || case_.status === 'with-okw');

  const getCommentsForTarget = (target: string, targetId?: string) => {
    return case_.comments.filter(comment => 
      comment.target === target && 
      (target === 'client-info' || comment.targetId === targetId)
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>

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
          {/* Client Information */}
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

          {/* Change Requests */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Requests</h3>
            <div className="space-y-6">
              {case_.changeRequests.map((request, index) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-6">
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
                        <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
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

          {/* Documents */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="space-y-3">
                {case_.documents.map((document) => (
                  <div key={document.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      {document.uploaded ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {document.name}
                          {document.required && <span className="text-red-500 ml-1">*</span>}
                        </p>
                        <p className="text-sm text-gray-600">
                          {document.uploaded ? 'Uploaded' : 'Not uploaded'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Add Comment Section */}
          {canComment && (
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Comment</h3>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Comment on</label>
                    <select
                      value={commentTarget}
                      onChange={(e) => setCommentTarget(e.target.value as 'client-info' | 'change-request')}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="client-info">Client Information</option>
                      <option value="change-request">Change Request</option>
                    </select>
                  </div>
                  
                  {commentTarget === 'change-request' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Request</label>
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
                </div>

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
  );
};

export default CaseDetails;