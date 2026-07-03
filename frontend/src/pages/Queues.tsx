import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

export function Queues() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['queues'],
    queryFn: async () => {
      const res = await api.get('/queues');
      return res.data.data;
    }
  });

  const queues = data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Queues</h2>
        <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Create Queue
        </button>
      </div>

      <div className="bg-card rounded-2xl border border-gray-800 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-900/50 text-gray-400 border-b border-gray-800">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Priority</th>
              <th className="px-6 py-4 font-medium">Concurrency</th>
              <th className="px-6 py-4 font-medium">Pending Jobs</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {queues.map((q: any) => (
              <tr key={q.id} className="hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4 font-medium">{q.name}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400">
                    Priority {q.priority}
                  </span>
                </td>
                <td className="px-6 py-4">{q.concurrencyLimit}</td>
                <td className="px-6 py-4">
                  {q._count?.jobs > 0 ? (
                    <span className="text-yellow-500 font-medium">{q._count.jobs}</span>
                  ) : (
                    <span className="text-gray-500">Empty</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-white mr-3">Pause</button>
                  <button className="text-primary hover:text-blue-400">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
