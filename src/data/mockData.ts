import { Case, Document } from '../types';

export const requiredDocuments: Document[] = [
  { id: '1', name: 'Identity Verification Document', required: true, uploaded: false },
  { id: '2', name: 'Proof of Address', required: true, uploaded: false },
  { id: '3', name: 'Account Statement', required: true, uploaded: false },
  { id: '4', name: 'Tax Documentation', required: false, uploaded: false },
  { id: '5', name: 'Business Registration (if applicable)', required: false, uploaded: false },
];

export const mockCases: Case[] = [
  {
    id: '1',
    clientInfo: {
      clientName: 'Acme Corporation',
      address: '123 Business Ave, New York, NY 10001',
      dateOfInformation: '2024-01-15',
    },
    changeRequests: [
      {
        id: '1',
        hdiNumber: 'HDI-001',
        country: 'United States',
        typeOfChange: 'Address Update',
      },
    ],
    documents: requiredDocuments.map(doc => ({ ...doc, uploaded: doc.id === '1' || doc.id === '2' })),
    comments: [],
    status: 'with-okw',
    currentAssignee: 'OKW Team',
    submittedAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-16T09:30:00Z'),
  },
  {
    id: '2',
    clientInfo: {
      clientName: 'Global Tech Solutions',
      address: '456 Tech Blvd, San Francisco, CA 94105',
      dateOfInformation: '2024-01-18',
    },
    changeRequests: [
      {
        id: '2',
        hdiNumber: 'HDI-002',
        country: 'United States',
        typeOfChange: 'Entity Type Change',
      },
    ],
    documents: requiredDocuments,
    comments: [],
    status: 'with-cdd',
    currentAssignee: 'CDD Team',
    submittedAt: new Date('2024-01-18T14:20:00Z'),
    updatedAt: new Date('2024-01-19T11:15:00Z'),
  },
];