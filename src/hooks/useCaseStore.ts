import { useState } from 'react';
import { Case, Comment, UserRole } from '../types';
import { mockCases } from '../data/mockData';

export const useCaseStore = () => {
  const [cases, setCases] = useState<Case[]>(mockCases);

  const addCase = (newCase: Case) => {
    setCases(prev => [...prev, newCase]);
  };

  const updateCaseStatus = (caseId: string, status: Case['status'], assignee: string) => {
    setCases(prev => prev.map(case_ => 
      case_.id === caseId 
        ? { ...case_, status, currentAssignee: assignee, updatedAt: new Date() }
        : case_
    ));
  };

  const addComment = (caseId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => {
    const newComment: Comment = {
      ...comment,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    
    setCases(prev => prev.map(case_ => 
      case_.id === caseId 
        ? { ...case_, comments: [...case_.comments, newComment], updatedAt: new Date() }
        : case_
    ));
  };

  const getCase = (caseId: string) => cases.find(case_ => case_.id === caseId);

  const getCasesByStatus = (status: Case['status']) => 
    cases.filter(case_ => case_.status === status);

  const getCasesForRole = (role: UserRole) => {
    switch (role) {
      case 'client':
        return cases;
      case 'okw':
        return cases.filter(case_ => case_.status === 'with-okw' || case_.status === 'pending');
      case 'cdd':
        return cases.filter(case_ => case_.status === 'with-cdd');
      default:
        return cases;
    }
  };

  return {
    cases,
    addCase,
    updateCaseStatus,
    addComment,
    getCase,
    getCasesByStatus,
    getCasesForRole,
  };
};