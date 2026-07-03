import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import { Play, RotateCcw, XCircle } from 'lucide-react';

export function Jobs() {
  const { data } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const res = await api.get('/jobs');
      return res.data.data;
    }
  });

  const jobs = data || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'FAILED': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'COMPLETED': return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Job Explorer</h2>
        <div className="flex space-x-3">
          <input 
            type="text" 
            placeholder="Search by ID..." 
            className="bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-gray-800 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-900/50 text-gray-400 border-b border-gray-800">
            <tr>
              <th className="px-6 py-4 font-medium">Job ID</th>
              <th className="px-6 py-4 font-medium">Queue</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Worker</th>
              <th className="px-6 py-4 font-medium">Retries</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {jobs.map((job: any) => (
              <tr key={job.id} className="hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4 font-medium font-mono text-gray-300">{job.id.slice(0, 8)}...</td>
                <td className="px-6 py-4">{job.queueId.slice(0, 8)}...</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400">{job.workerId || '-'}</td>
                <td className="px-6 py-4">{job.retryCount}</td>
                <td className="px-6 py-4 text-right flex justify-end space-x-3">
                  {job.status === 'FAILED' && (
                    <button className="text-gray-400 hover:text-white" title="Retry">
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  )}
                  {job.status === 'QUEUED' && (
                    <button className="text-gray-400 hover:text-red-400" title="Cancel">
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                  <button className="text-primary hover:text-blue-400" title="View Details">
                    <Play className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
