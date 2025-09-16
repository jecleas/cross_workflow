import { useState } from 'react';
import { Case, UserRole, Comment, Document } from '../types';
import { mockCases } from '../data/mockData';

export const useCaseStore = () => {
  const [cases, setCases] = useState<Case[]>(mockCases);

  const addCase = (newCase: Case) => {
    setCases(prevCases => [...prevCases, newCase]);
  };

  const updateCaseStatus = (caseId: string, status: Case['status'], assignee: string) => {
    setCases(prevCases =>
      prevCases.map(c =>
        c.id === caseId ? { ...c, status, currentAssignee: assignee, updatedAt: new Date() } : c
      )
    );
  };

  const addComment = (caseId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => {
    const newComment: Comment = {
      ...comment,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setCases(prevCases =>
      prevCases.map(c =>
        c.id === caseId
          ? { ...c, comments: [...c.comments, newComment], updatedAt: new Date() }
          : c
      )
    );
  };

  const addAttachment = (caseId: string, newDoc: Document) => {
    setCases(prevCases =>
      prevCases.map(c =>
        c.id === caseId
          ? { ...c, documents: [...c.documents, newDoc], updatedAt: new Date() }
          : c
      )
    );
  };

  const removeAttachment = (caseId: string, documentId: string) => {
    setCases(prevCases =>
      prevCases.map(c => {
        if (c.id === caseId) {
          const docToRemove = c.documents.find(d => d.id === documentId);
          if (!docToRemove) return c;

          let updatedDocuments: Document[];
          if (docToRemove.required) {
            // For required docs, just mark as not uploaded
            updatedDocuments = c.documents.map(d => d.id === documentId ? { ...d, uploaded: false, file: undefined } : d);
          } else {
            // For optional docs, remove from the array
            updatedDocuments = c.documents.filter(d => d.id !== documentId);
          }
          return { ...c, documents: updatedDocuments, updatedAt: new Date() };
        }
        return c;
      })
    );
  };

  const uploadAttachment = (caseId: string, documentId: string, file: File) => {
    setCases(prevCases =>
      prevCases.map(c =>
        c.id === caseId
          ? {
              ...c,
              documents: c.documents.map(doc =>
                doc.id === documentId
                  ? { ...doc, uploaded: true, awaiting: false, file }
                  : doc
              ),
              updatedAt: new Date(),
            }
          : c
      )
    );
  };

  const getCase = (caseId: string): Case | undefined => {
    return cases.find(c => c.id === caseId);
  };

  const getCasesForRole = (role: UserRole): Case[] => {
    if (role === 'client') {
      return cases.filter(c => c.clientInfo.clientName === 'MPJORGAN'); // Example client filter
    }
    return cases; // OKW and CDD see all cases
  };

  return {
    cases,
    addCase,
    updateCaseStatus,
    addComment,
    addAttachment,
    removeAttachment,
    uploadAttachment,
    getCase,
    getCasesForRole,
  };
};