import React, { useState } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ClientForm from './components/ClientForm';
import CaseDetails from './components/CaseDetails';
import Reports from './components/Reports';
import Sidebar from './components/Sidebar';
import { useCaseStore } from './hooks/useCaseStore';
import { useTheme } from './hooks/useTheme';
import { User, UserRole, Case, Comment } from './types';

type View = 'dashboard' | 'client-form' | 'case-details' | 'reports';

function App() {
  const [user, setUser] = useState<User>({ role: 'client', name: 'John Doe' });
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const {
    cases,
    addCase,
    updateCaseStatus,
    addComment,
    getCase,
    getCasesForRole,
  } = useCaseStore();

  const handleRoleChange = (role: UserRole) => {
    const names = {
      client: 'MPJORGAN',
      okw: 'OKW TEAM',
      cdd: 'CDD TEAM',
    };
    setUser({ role, name: names[role] });
    setCurrentView('dashboard');
  };

  const handleCaseSubmit = (newCase: Case) => {
    addCase(newCase);
    setCurrentView('dashboard');
    // Simulate automatic assignment to OKW team
    setTimeout(() => {
      updateCaseStatus(newCase.id, 'with-okw', 'OKW Team');
    }, 1000);
  };

  const handleCaseSelect = (caseId: string) => {
    setSelectedCaseId(caseId);
    setCurrentView('case-details');
  };

  const handleAddComment = (caseId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => {
    addComment(caseId, comment);
  };

  const handleStatusUpdate = (caseId: string, status: Case['status'], assignee: string) => {
    updateCaseStatus(caseId, status, assignee);
  };

  const filteredCases = getCasesForRole(user.role);
  const selectedCase = selectedCaseId ? getCase(selectedCaseId) : null;

  const handleSidebarNavigate = (page: 'dashboard' | 'reports') => {
    setCurrentView(page);
    setSelectedCaseId('');
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header 
        user={user} 
        onRoleChange={handleRoleChange}
        onMenuToggle={() => setIsSidebarOpen(true)}
        theme={theme}
        onThemeToggle={toggleTheme}
      />
      
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={handleSidebarNavigate}
        currentView={currentView}
      />
      
      <main>
        {currentView === 'dashboard' && (
          <Dashboard
            cases={filteredCases}
            userRole={user.role}
            onCaseSelect={handleCaseSelect}
            onCreateNew={() => setCurrentView('client-form')}
          />
        )}

        {currentView === 'client-form' && (
          <ClientForm
            onSubmit={handleCaseSubmit}
            onCancel={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'case-details' && selectedCase && (
          <CaseDetails
            case_={selectedCase}
            userRole={user.role}
            onBack={() => setCurrentView('dashboard')}
            onAddComment={(comment) => handleAddComment(selectedCase.id, comment)}
            onStatusUpdate={(status, assignee) => handleStatusUpdate(selectedCase.id, status, assignee)}
          />
        )}

        {currentView === 'reports' && (
          <Reports cases={cases} />
        )}
      </main>
    </div>
  );
}

export default App;