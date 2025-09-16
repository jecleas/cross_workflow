import React from 'react';
import { X, Home, FileBarChart, Download } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: 'dashboard' | 'reports') => void;
  currentView: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNavigate, currentView }) => {
  const handleDownloadReport = () => {
    // Simulate report generation and download
    const reportData = {
      generatedAt: new Date().toISOString(),
      summary: "Team Performance Report",
      // This would contain actual case timing data in a real implementation
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-performance-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Navigation</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          
          {/* Navigation Items */}
          <div className="flex-1 p-6">
            <nav className="space-y-2">
              <button
                onClick={() => {
                  onNavigate('dashboard');
                  onClose();
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  currentView === 'dashboard' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </button>
              
              <button
                onClick={() => {
                  onNavigate('reports');
                  onClose();
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  currentView === 'reports' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <FileBarChart className="w-5 h-5" />
                <span className="font-medium">Team Reports</span>
              </button>
            </nav>
            
            {/* Quick Actions */}
            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Quick Actions
              </h3>
              <button
                onClick={handleDownloadReport}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
              >
                <Download className="w-5 h-5" />
                <span className="font-medium">Download Report</span>
              </button>
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ClientFlow v1.0
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;