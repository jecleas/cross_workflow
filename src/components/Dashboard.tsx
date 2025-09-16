import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, Users, FileText } from 'lucide-react';
import { Case, UserRole } from '../types';

interface DashboardProps {
  cases: Case[];
  allCases: Case[];
  userRole: UserRole;
  onCaseSelect: (caseId: string) => void;
  onCreateNew: () => void;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  'with-okw': 'bg-blue-100 text-blue-800',
  'with-cdd': 'bg-purple-100 text-purple-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

const statusIcons = {
  pending: Clock,
  'with-okw': FileText,
  'with-cdd': Users,
  approved: CheckCircle,
  rejected: XCircle,
};

type FilterType = 'total' | 'pending' | 'inReview' | 'completed';

const Dashboard: React.FC<DashboardProps> = ({ cases, allCases, userRole, onCaseSelect, onCreateNew }) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('total');

  const stats = {
    total: allCases.length,
    pending: allCases.filter(c => c.status === 'pending').length,
    inReview: allCases.filter(c => c.status === 'with-okw' || c.status === 'with-cdd').length,
    completed: allCases.filter(c => c.status === 'approved' || c.status === 'rejected').length,
  };

  const filteredCases = allCases.filter(c => {
    if (activeFilter === 'pending') return c.status === 'pending';
    if (activeFilter === 'inReview') return c.status === 'with-okw' || c.status === 'with-cdd';
    if (activeFilter === 'completed') return c.status === 'approved' || c.status === 'rejected';
    return true; // 'total'
  });

  const StatCard: React.FC<{ title: string; value: number; icon: React.ElementType; filter: FilterType }> = ({ title, value, icon: Icon, filter }) => {
    const isActive = activeFilter === filter;
    return (
      <button
        onClick={() => setActiveFilter(filter)}
        className={`w-full bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border transition-all ${
          isActive ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
        }`}
      >
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${
            filter === 'total' ? 'bg-blue-100' :
            filter === 'pending' ? 'bg-yellow-100' :
            filter === 'inReview' ? 'bg-purple-100' :
            'bg-green-100'
          }`}>
            <Icon className={`w-6 h-6 ${
              filter === 'total' ? 'text-blue-600' :
              filter === 'pending' ? 'text-yellow-600' :
              filter === 'inReview' ? 'text-purple-600' :
              'text-green-600'
            }`} />
          </div>
          <div className="ml-4 text-left">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{title}</p>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor and manage client cases</p>
        </div>
        {userRole === 'client' && (
          <button
            onClick={onCreateNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Submit New Case
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Cases" value={stats.total} icon={FileText} filter="total" />
        <StatCard title="Pending" value={stats.pending} icon={Clock} filter="pending" />
        <StatCard title="In Review" value={stats.inReview} icon={Users} filter="inReview" />
        <StatCard title="Completed" value={stats.completed} icon={CheckCircle} filter="completed" />
      </div>

      {/* Cases Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Cases</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Case ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCases.map((case_) => {
                const StatusIcon = statusIcons[case_.status];
                return (
                  <tr key={case_.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{case_.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{case_.clientInfo.clientName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{case_.changeRequests.length} change{case_.changeRequests.length !== 1 ? 's' : ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        case_.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        case_.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        case_.status === 'with-cdd' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                        case_.status === 'with-okw' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {case_.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {case_.currentAssignee}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {case_.updatedAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => onCaseSelect(case_.id)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;