import React from 'react';
import { Clock, Users, TrendingUp, Download, Calendar } from 'lucide-react';
import { Case } from '../types';

interface ReportsProps {
  cases: Case[];
}

const Reports: React.FC<ReportsProps> = ({ cases }) => {
  // Calculate team performance metrics
  const calculateTeamMetrics = () => {
    const metrics = {
      okw: { totalCases: 0, avgDays: 0, totalDays: 0 },
      cdd: { totalCases: 0, avgDays: 0, totalDays: 0 },
      overall: { totalCases: cases.length, avgDays: 0, totalDays: 0 }
    };

    cases.forEach(case_ => {
      const submittedDate = case_.submittedAt;
      const updatedDate = case_.updatedAt;
      const daysDiff = Math.ceil((updatedDate.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      metrics.overall.totalDays += daysDiff;
      
      if (case_.status === 'with-okw' || case_.status === 'with-cdd' || case_.status === 'approved' || case_.status === 'rejected') {
        metrics.okw.totalCases++;
        metrics.okw.totalDays += Math.min(daysDiff, 3); // Assume OKW gets 3 days max
      }
      
      if (case_.status === 'with-cdd' || case_.status === 'approved' || case_.status === 'rejected') {
        metrics.cdd.totalCases++;
        metrics.cdd.totalDays += Math.max(0, daysDiff - 3); // CDD gets remaining days
      }
    });

    metrics.okw.avgDays = metrics.okw.totalCases > 0 ? metrics.okw.totalDays / metrics.okw.totalCases : 0;
    metrics.cdd.avgDays = metrics.cdd.totalCases > 0 ? metrics.cdd.totalDays / metrics.cdd.totalCases : 0;
    metrics.overall.avgDays = metrics.overall.totalCases > 0 ? metrics.overall.totalDays / metrics.overall.totalCases : 0;

    return metrics;
  };

  const metrics = calculateTeamMetrics();

  const statusDistribution = {
    pending: cases.filter(c => c.status === 'pending').length,
    withOkw: cases.filter(c => c.status === 'with-okw').length,
    withCdd: cases.filter(c => c.status === 'with-cdd').length,
    approved: cases.filter(c => c.status === 'approved').length,
    rejected: cases.filter(c => c.status === 'rejected').length,
  };

  const handleExportReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalCases: cases.length,
        teamMetrics: metrics,
        statusDistribution
      },
      caseDetails: cases.map(case_ => ({
        id: case_.id,
        clientName: case_.clientInfo.clientName,
        status: case_.status,
        submittedAt: case_.submittedAt.toISOString(),
        updatedAt: case_.updatedAt.toISOString(),
        daysSinceSubmission: Math.ceil((new Date().getTime() - case_.submittedAt.getTime()) / (1000 * 60 * 60 * 24)),
        currentAssignee: case_.currentAssignee
      }))
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
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Team Performance Reports</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Analyze case processing times and team efficiency</p>
        </div>
        <button
          onClick={handleExportReport}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.overall.avgDays.toFixed(1)}</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Avg Days Overall</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.okw.avgDays.toFixed(1)}</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Avg Days OKW</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.cdd.avgDays.toFixed(1)}</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Avg Days CDD</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{cases.length}</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Cases</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Case Status Distribution</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Pending</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${(statusDistribution.pending / cases.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8">{statusDistribution.pending}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">With OKW</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(statusDistribution.withOkw / cases.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8">{statusDistribution.withOkw}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">With CDD</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${(statusDistribution.withCdd / cases.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8">{statusDistribution.withCdd}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Approved</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(statusDistribution.approved / cases.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8">{statusDistribution.approved}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Rejected</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${(statusDistribution.rejected / cases.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white w-8">{statusDistribution.rejected}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Performance Comparison */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Performance</h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">OKW Team</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{metrics.okw.avgDays.toFixed(1)} days avg</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min((metrics.okw.avgDays / 10) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{metrics.okw.totalCases} cases processed</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">CDD Team</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{metrics.cdd.avgDays.toFixed(1)} days avg</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-purple-500 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min((metrics.cdd.avgDays / 10) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{metrics.cdd.totalCases} cases processed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Case List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Case Processing Times</h3>
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
                  Days Since Submission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Current Assignee
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {cases.map((case_) => {
                const daysSinceSubmission = Math.ceil((new Date().getTime() - case_.submittedAt.getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <tr key={case_.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      #{case_.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {case_.clientInfo.clientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        case_.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        case_.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        case_.status === 'with-cdd' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                        case_.status === 'with-okw' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {case_.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        {daysSinceSubmission} days
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {case_.currentAssignee}
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

export default Reports;