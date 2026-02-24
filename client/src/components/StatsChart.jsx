import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#111118] border border-white/[0.08] p-4 rounded-xl shadow-2xl">
        <p className="text-gray-400 font-semibold text-xs mb-3 border-b border-white/[0.06] pb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex justify-between items-center gap-6 mb-1">
            <span className="text-xs font-medium" style={{ color: entry.color }}>
              {entry.name}
            </span>
            <span className="text-sm font-bold font-mono text-white">
              {entry.value} {entry.dataKey.includes('Rate') ? '%' : ''}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const SuccessRateChart = ({ data }) => {
  if (!data || !Array.isArray(data)) return null;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="name" stroke="#444" fontSize={12} fontWeight="500" tickLine={false} axisLine={false} />
        <YAxis stroke="#444" fontSize={12} fontWeight="500" tickLine={false} axisLine={false} domain={[0, 100]} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="webauthn" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
        <Bar dataKey="password" fill="#1f2937" radius={[6, 6, 0, 0]} barSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const SuccessRateChartFixed = ({ data }) => {
  if (!data || !data.summary) return null;

  const chartData = [
    { name: 'Password', value: parseFloat(data.summary.password.successRate) },
    { name: 'WebAuthn', value: parseFloat(data.summary.webauthn.successRate) },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="name" stroke="#444" fontSize={12} fontWeight="500" tickLine={false} axisLine={false} />
        <YAxis stroke="#444" fontSize={12} fontWeight="500" tickLine={false} axisLine={false} domain={[0, 100]} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.name === 'WebAuthn' ? '#3b82f6' : '#1f2937'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export const ActivityOverTimeChart = ({ data }) => {
  if (!data || !Array.isArray(data)) return null;

  const chartData = data.map((item) => ({
    date: item.date,
    Password: item.password,
    WebAuthn: item.webauthn,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="date" stroke="#444" fontSize={12} fontWeight="500" tickLine={false} axisLine={false} />
        <YAxis stroke="#444" fontSize={12} fontWeight="500" tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="Password" stroke="#4b5563" strokeWidth={2} dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: '#4b5563' }} />
        <Line type="monotone" dataKey="WebAuthn" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: '#3b82f6' }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const ErrorDistributionChart = ({ data }) => {
  if (!data || !Array.isArray(data)) return null;
  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="name" stroke="#444" fontSize={11} fontWeight="500" tickLine={false} axisLine={false} angle={-45} textAnchor="end" height={60} />
        <YAxis stroke="#444" fontSize={12} fontWeight="500" tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="value" fill="#3b82f6" barSize={40} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
