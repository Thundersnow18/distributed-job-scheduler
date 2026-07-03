import { Activity, Server, CheckCircle, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { time: '10:00', throughput: 400 },
  { time: '10:05', throughput: 300 },
  { time: '10:10', throughput: 550 },
  { time: '10:15', throughput: 450 },
  { time: '10:20', throughput: 700 },
  { time: '10:25', throughput: 650 },
];

export function Dashboard() {
  const stats = [
    { name: 'Active Workers', value: '12', icon: Server, color: 'text-blue-500' },
    { name: 'Jobs Processing', value: '1,429', icon: Activity, color: 'text-purple-500' },
    { name: 'Completed Today', value: '45.2K', icon: CheckCircle, color: 'text-green-500' },
    { name: 'Failed Jobs', value: '23', icon: AlertTriangle, color: 'text-red-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-card p-6 rounded-2xl border border-gray-800 flex items-center shadow-sm">
            <div className={`p-4 rounded-xl bg-gray-900/50 ${stat.color} mr-4`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-400">{stat.name}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card p-6 rounded-2xl border border-gray-800 shadow-sm mt-8">
        <h3 className="text-lg font-medium mb-6">System Throughput</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorThroughput" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="time" stroke="#6b7280" tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} />
              <YAxis stroke="#6b7280" tick={{fill: '#6b7280'}} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #374151', borderRadius: '0.5rem' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Area type="monotone" dataKey="throughput" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorThroughput)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
