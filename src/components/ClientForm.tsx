import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { ClientInfo, ChangeRequest, Document, Case } from '../types';
import AttachmentsPane from './AttachmentsPane';
import DocumentsSection from './DocumentsSection';

interface ClientFormProps {
  onSubmit: (case_: Case) => void;
  onCancel: () => void;
}

const documentsRequiredConfig: Record<string, string[]> = {
  'Address Update': ['Proof of Address'],
  'Entity Type Change': ['Certificate of Incorporation', 'Board Resolution'],
  'Name Change': ['Certificate of Name Change', 'Board Resolution'],
  'Contact Information': ['Proof of Identity'],
  'Other': [],  
};

const requiredDocuments: Document[] = [
  { id: '1', name: 'Proof of Address', required: false, uploaded: false },
  { id: '2', name: 'Certificate of Incorporation', required: false, uploaded: false },
  { id: '3', name: 'Board Resolution', required: false, uploaded: false },
  { id: '4', name: 'Certificate of Name Change', required: false, uploaded: false },
  { id: '5', name: 'Proof of Identity', required: false, uploaded: false },
];

const ClientForm: React.FC<ClientFormProps> = ({ onSubmit, onCancel }) => {
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    clientName: '',
    address: '',
    dateOfInformation: '',
    coltId: '',
    email: '',
  });

  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([
    { id: '1', hdiNumber: '', country: '', typeOfChange: '' }
  ]);

  const [documents, setDocuments] = useState<Document[]>(
    requiredDocuments.map(doc => ({ ...doc, uploaded: false, required: false }))
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDocumentsSection, setShowDocumentsSection] = useState(false);
  const [activeTab, setActiveTab] = useState<'client-info' | 'change-requests'>('client-info');
  const [tabErrors, setTabErrors] = useState({ 'client-info': false, 'change-requests': false });

  useEffect(() => {
    const requiredDocNames = new Set<string>();
    let anyDocsRequired = false;

    changeRequests.forEach(request => {
      const docsForChangeType = documentsRequiredConfig[request.typeOfChange];
      if (docsForChangeType && docsForChangeType.length > 0) {
        anyDocsRequired = true;
        docsForChangeType.forEach(docName => requiredDocNames.add(docName));
      }
    });

    setShowDocumentsSection(anyDocsRequired);

    setDocuments(prevDocs => 
      prevDocs.map(doc => ({
        ...doc,
        required: requiredDocNames.has(doc.name)
      }))
    );
  }, [changeRequests]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const newTabErrors = { 'client-info': false, 'change-requests': false };

    if (!clientInfo.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
      newTabErrors['client-info'] = true;
    }
    if (!clientInfo.address.trim()) {
      newErrors.address = 'Address is required';
      newTabErrors['client-info'] = true;
    }
    if (!clientInfo.dateOfInformation) {
      newErrors.dateOfInformation = 'Date of information is required';
      newTabErrors['client-info'] = true;
    }
    if (!clientInfo.coltId.trim()) {
      newErrors.coltId = 'COLTID is required';
      newTabErrors['client-info'] = true;
    }
    if (!clientInfo.email.trim()) {
      newErrors.email = 'Email is required';
      newTabErrors['client-info'] = true;
    } else if (!/\S+@\S+\.\S+/.test(clientInfo.email)) {
      newErrors.email = 'Email is invalid';
      newTabErrors['client-info'] = true;
    }

    changeRequests.forEach((request, index) => {
      if (!request.hdiNumber.trim()) {
        newErrors[`hdiNumber-${index}`] = 'HDI number is required';
        newTabErrors['change-requests'] = true;
      }
      if (!request.country.trim()) {
        newErrors[`country-${index}`] = 'Country is required';
        newTabErrors['change-requests'] = true;
      }
      if (!request.typeOfChange.trim()) {
        newErrors[`typeOfChange-${index}`] = 'Type of change is required';
        newTabErrors['change-requests'] = true;
      }
    });

    if (showDocumentsSection) {
      const requiredDocs = documents.filter(doc => doc.required && !doc.uploaded);
      if (requiredDocs.length > 0) {
        newErrors.documents = 'All required documents must be uploaded';
        newTabErrors['change-requests'] = true;
      }
    }

    setErrors(newErrors);
    setTabErrors(newTabErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const newCase: Case = {
      id: Date.now().toString(),
      clientInfo,
      changeRequests,
      documents,
      comments: [],
      status: 'pending',
      currentAssignee: 'System',
      submittedAt: new Date(),
      updatedAt: new Date(),
    };

    onSubmit(newCase);
  };

  const addChangeRequest = () => {
    const newRequest: ChangeRequest = {
      id: Date.now().toString(),
      hdiNumber: '',
      country: '',
      typeOfChange: '',
    };
    setChangeRequests([...changeRequests, newRequest]);
  };

  const removeChangeRequest = (id: string) => {
    setChangeRequests(changeRequests.filter(request => request.id !== id));
  };

  const updateChangeRequest = (id: string, field: keyof Omit<ChangeRequest, 'id'>, value: string) => {
    setChangeRequests(changeRequests.map(request =>
      request.id === id ? { ...request, [field]: value } : request
    ));
  };

  const handleFileUpload = (documentId: string, file: File) => {
    setDocuments(documents.map(doc =>
      doc.id === documentId 
        ? { ...doc, uploaded: true, file }
        : doc
    ));
  };

  const handleAwaitingFileUpload = (documentId: string, file: File) => {
    setDocuments(documents.map(doc =>
      doc.id === documentId
        ? { ...doc, uploaded: true, awaiting: false, file }
        : doc
    ));
  };

  const removeAttachment = (documentId: string) => {
    setDocuments(prevDocs => {
      const docToRemove = prevDocs.find(d => d.id === documentId);
      if (!docToRemove) return prevDocs;

      if (docToRemove.required) {
        // For required docs, just mark as not uploaded
        return prevDocs.map(d => d.id === documentId ? { ...d, uploaded: false, file: undefined } : d);
      } else {
        // For optional docs, remove from the array
        return prevDocs.filter(d => d.id !== documentId);
      }
    });
  };

  const addAttachment = () => {
    const docName = window.prompt("Please enter the name for the new attachment:");
    if (docName) {
      const newDoc: Document = {
        id: Date.now().toString(),
        name: docName,
        required: false,
        uploaded: false,
        awaiting: true
      };
      setDocuments(prevDocs => [...prevDocs, newDoc]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-8 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Submit New Case</h2>
              <p className="text-gray-600 mt-1">Please provide your account details and change requests</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('client-info')}
                    className={`flex items-center space-x-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'client-info'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } ${tabErrors['client-info'] && activeTab !== 'client-info' ? 'shake-animation' : ''}`}
                  >
                    <span>Client Information</span>
                    {tabErrors['client-info'] && <AlertCircle className="w-4 h-4 text-red-500" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('change-requests')}
                    className={`flex items-center space-x-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'change-requests'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } ${tabErrors['change-requests'] && activeTab !== 'change-requests' ? 'shake-animation' : ''}`}
                  >
                    <span>Immaterial Changes</span>
                    {tabErrors['change-requests'] && <AlertCircle className="w-4 h-4 text-red-500" />}
                  </button>
                </nav>
              </div>

              {activeTab === 'client-info' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Client Name *
                      </label>
                      <input
                        type="text"
                        value={clientInfo.clientName}
                        onChange={(e) => setClientInfo({ ...clientInfo, clientName: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.clientName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter client name"
                      />
                      {errors.clientName && (
                        <p className="text-red-600 text-sm mt-1">{errors.clientName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Information *
                      </label>
                      <input
                        type="date"
                        value={clientInfo.dateOfInformation}
                        onChange={(e) => setClientInfo({ ...clientInfo, dateOfInformation: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.dateOfInformation ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.dateOfInformation && (
                        <p className="text-red-600 text-sm mt-1">{errors.dateOfInformation}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        COLTID *
                      </label>
                      <input
                        type="text"
                        value={clientInfo.coltId}
                        onChange={(e) => setClientInfo({ ...clientInfo, coltId: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.coltId ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter COLTID"
                      />
                      {errors.coltId && (
                        <p className="text-red-600 text-sm mt-1">{errors.coltId}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={clientInfo.email}
                        onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter email address"
                      />
                      {errors.email && (
                        <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <textarea
                        value={clientInfo.address}
                        onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
                        rows={3}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.address ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Enter full address"
                      />
                      {errors.address && (
                        <p className="text-red-600 text-sm mt-1">{errors.address}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'change-requests' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Immaterial Changes</h3>
                    <button
                      type="button"
                      onClick={addChangeRequest}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Changes</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {changeRequests.map((request, index) => (
                      <div key={request.id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium text-gray-900">Request #{index + 1}</h4>
                          {changeRequests.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeChangeRequest(request.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              HDI Number *
                            </label>
                            <input
                              type="text"
                              value={request.hdiNumber}
                              onChange={(e) => updateChangeRequest(request.id, 'hdiNumber', e.target.value)}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                errors[`hdiNumber-${index}`] ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="HDI-XXX"
                            />
                            {errors[`hdiNumber-${index}`] && (
                              <p className="text-red-600 text-sm mt-1">{errors[`hdiNumber-${index}`]}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Country *
                            </label>
                            <input
                              type="text"
                              value={request.country}
                              onChange={(e) => updateChangeRequest(request.id, 'country', e.target.value)}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                errors[`country-${index}`] ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="Enter country"
                            />
                            {errors[`country-${index}`] && (
                              <p className="text-red-600 text-sm mt-1">{errors[`country-${index}`]}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Type of Change *
                            </label>
                            <select
                              value={request.typeOfChange}
                              onChange={(e) => updateChangeRequest(request.id, 'typeOfChange', e.target.value)}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                errors[`typeOfChange-${index}`] ? 'border-red-300' : 'border-gray-300'
                              }`}
                            >
                              <option value="">Select change type</option>
                              <option value="Address Update">Address Update</option>
                              <option value="Entity Type Change">Entity Type Change</option>
                              <option value="Name Change">Name Change</option>
                              <option value="Contact Information">Contact Information</option>
                              <option value="Other">Other</option>
                            </select>
                            {errors[`typeOfChange-${index}`] && (
                              <p className="text-red-600 text-sm mt-1">{errors[`typeOfChange-${index}`]}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Upload */}
              {showDocumentsSection && (
                <DocumentsSection
                  documents={documents}
                  onFileUpload={handleFileUpload}
                  canUpload={true}
                  error={errors.documents}
                />
              )}

              {/* Actions */}
              <div className="flex space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  Submit Case
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="lg:col-span-1">
          <AttachmentsPane 
            documents={documents}
            onAddAttachment={addAttachment}
            onRemoveAttachment={removeAttachment}
            onUploadAttachment={handleAwaitingFileUpload}
            canManageAttachments={true}
          />
        </div>
      </div>
    </div>
  );
};

export default ClientForm;