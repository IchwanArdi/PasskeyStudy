import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-3 shadow-xl">
        <p className="text-white font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value} {entry.dataKey.includes('Rate') ? '%' : 'ms'}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const DurationComparisonChart = ({ data }) => {
  if (!data || !data.summary) return null;

  const chartData = [
    {
      name: 'Password',
      'Durasi Rata-rata (ms)': parseInt(data.summary.password.avgDuration),
    },
    {
      name: 'WebAuthn',
      'Durasi Rata-rata (ms)': parseInt(data.summary.webauthn.avgDuration),
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="name" stroke="#9CA3AF" />
        <YAxis stroke="#9CA3AF" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="Durasi Rata-rata (ms)" fill="#3B82F6" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const SuccessRateChart = ({ data }) => {
  if (!data || !data.summary) return null;

  const chartData = [
    {
      name: 'Password',
      'Success Rate (%)': parseFloat(data.summary.password.successRate),
    },
    {
      name: 'WebAuthn',
      'Success Rate (%)': parseFloat(data.summary.webauthn.successRate),
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="name" stroke="#9CA3AF" />
        <YAxis stroke="#9CA3AF" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="Success Rate (%)" fill="#10B981" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const ActivityOverTimeChart = ({ data }) => {
  if (!data || !data.logsByDate) return null;

  const chartData = Object.entries(data.logsByDate).map(([date, values]) => ({
    date,
    Password: values.password,
    WebAuthn: values.webauthn,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="date" stroke="#9CA3AF" />
        <YAxis stroke="#9CA3AF" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line type="monotone" dataKey="Password" stroke="#3B82F6" strokeWidth={2} />
        <Line type="monotone" dataKey="WebAuthn" stroke="#10B981" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Percentile Comparison Chart
export const PercentileChart = ({ data }) => {
  if (!data || !data.summary || !data.summary.password?.percentiles || !data.summary.webauthn?.percentiles) return null;

  const chartData = [
    { name: 'Min', Password: data.summary.password.percentiles.min, WebAuthn: data.summary.webauthn.percentiles.min },
    { name: 'P50', Password: data.summary.password.percentiles.p50, WebAuthn: data.summary.webauthn.percentiles.p50 },
    { name: 'P95', Password: data.summary.password.percentiles.p95, WebAuthn: data.summary.webauthn.percentiles.p95 },
    { name: 'P99', Password: data.summary.password.percentiles.p99, WebAuthn: data.summary.webauthn.percentiles.p99 },
    { name: 'Max', Password: data.summary.password.percentiles.max, WebAuthn: data.summary.webauthn.percentiles.max },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="name" stroke="#9CA3AF" />
        <YAxis stroke="#9CA3AF" label={{ value: 'Duration (ms)', angle: -90, position: 'insideLeft' }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="Password" fill="#3B82F6" />
        <Bar dataKey="WebAuthn" fill="#10B981" />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

// Error Distribution Chart
export const ErrorDistributionChart = ({ data }) => {
  if (!data || !data.summary) return null;

  const passwordErrors = data.summary.password?.errorCategories || {};
  const webauthnErrors = data.summary.webauthn?.errorCategories || {};

  const allCategories = new Set([...Object.keys(passwordErrors), ...Object.keys(webauthnErrors)]);
  const chartData = Array.from(allCategories).map((category) => ({
    category,
    Password: passwordErrors[category] || 0,
    WebAuthn: webauthnErrors[category] || 0,
  }));

  if (chartData.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="category" stroke="#9CA3AF" angle={-45} textAnchor="end" height={80} />
        <YAxis stroke="#9CA3AF" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="Password" fill="#EF4444" />
        <Bar dataKey="WebAuthn" fill="#F59E0B" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Device Breakdown Chart
export const DeviceBreakdownChart = ({ data }) => {
  if (!data || !data.summary) return null;

  const passwordBrowsers = data.summary.password?.deviceBreakdown?.browsers || {};
  const webauthnBrowsers = data.summary.webauthn?.deviceBreakdown?.browsers || {};

  const allBrowsers = new Set([...Object.keys(passwordBrowsers), ...Object.keys(webauthnBrowsers)]);
  const browserData = Array.from(allBrowsers).map((browser) => ({
    browser,
    Password: passwordBrowsers[browser] || 0,
    WebAuthn: webauthnBrowsers[browser] || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={browserData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="browser" stroke="#9CA3AF" />
        <YAxis stroke="#9CA3AF" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="Password" fill="#3B82F6" />
        <Bar dataKey="WebAuthn" fill="#10B981" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Time Analysis Chart (Hourly)
export const HourlyActivityChart = ({ data }) => {
  if (!data || !data.summary) return null;

  const passwordHours = data.summary.password?.timeAnalysis?.hours || {};
  const webauthnHours = data.summary.webauthn?.timeAnalysis?.hours || {};

  const chartData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    Password: passwordHours[i] || 0,
    WebAuthn: webauthnHours[i] || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="hour" stroke="#9CA3AF" angle={-45} textAnchor="end" height={80} />
        <YAxis stroke="#9CA3AF" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line type="monotone" dataKey="Password" stroke="#3B82F6" strokeWidth={2} />
        <Line type="monotone" dataKey="WebAuthn" stroke="#10B981" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Day of Week Chart
export const DayOfWeekChart = ({ data }) => {
  if (!data || !data.summary) return null;

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const passwordDays = data.summary.password?.timeAnalysis?.days || {};
  const webauthnDays = data.summary.webauthn?.timeAnalysis?.days || {};

  const chartData = days.map((day, index) => ({
    day,
    Password: passwordDays[index] || 0,
    WebAuthn: webauthnDays[index] || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="day" stroke="#9CA3AF" />
        <YAxis stroke="#9CA3AF" />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="Password" fill="#3B82F6" />
        <Bar dataKey="WebAuthn" fill="#10B981" />
      </BarChart>
    </ResponsiveContainer>
  );
};
