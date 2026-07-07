import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const UserRoleBarChart = ({ stats, loading }) => {
    if (loading) return (
        <div className="w-full h-32 flex items-center justify-center bg-neutral-50 rounded-2xl animate-pulse">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Loading Data...</span>
        </div>
    );

    const data = [
        { name: 'Admin', count: stats.admin, color: '#5B58EB' },
        { name: 'Suprv.', count: stats.supervisor, color: '#4F46E5' },
        { name: 'User', count: stats.user, color: '#10B981' }
    ];

    return (
        <div className="w-full h-32">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }}
                    />
                    <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '10px' }}
                        cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={24}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default UserRoleBarChart;
