import { useState, useEffect, useCallback } from 'react';
import { performanceAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Activity, Clock, ArrowUpDown, HardDrive, TrendingUp, Zap } from 'lucide-react';
import MetricInfoButton from './MetricInfoButton';

const PerformanceTab = () => {
  const [comparison, setComparison] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [compRes, sumRes] = await Promise.all([
        performanceAPI.getComparison(),
        performanceAPI.getSummary(),
      ]);
      setComparison(compRes);
      setSummary(sumRes);
    } catch (err) {
      console.error('Performance data error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const latencyChartData = comparison ? [
    { name: 'Avg Response Time', WebAuthn: comparison.webauthn?.avgResponseTime || 0, Password: comparison.password?.avgResponseTime || 0 },
    { name: 'P50 Latency', WebAuthn: comparison.webauthn?.p50 || 0, Password: comparison.password?.p50 || 0 },
    { name: 'P95 Latency', WebAuthn: comparison.webauthn?.p95 || 0, Password: comparison.password?.p95 || 0 },
  ] : [];

  const sizeChartData = comparison ? [
    { name: 'Request Size', WebAuthn: comparison.webauthn?.avgRequestSize || 0, Password: comparison.password?.avgRequestSize || 0 },
    { name: 'Response Size', WebAuthn: comparison.webauthn?.avgResponseSize || 0, Password: comparison.password?.avgResponseSize || 0 },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Pengukuran Performa</h2>
        <p className="text-sm text-gray-500">Data kuantitatif real-time — latency, payload, round-trips</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={<Activity className="w-5 h-5 text-blue-400" />}
          label="Total Request"
          value={summary?.totalRequests || 0}
          detail="Request tercatat"
          infoTitle="Total Request Tercatat"
          infoDescription="Jumlah total HTTP request yang berkaitan dengan autentikasi yang tercatat oleh Performance Logger. Ini mencakup request untuk registration options, login options, verify registration, dan verify login."
          infoRelevance="Setiap autentikasi WebAuthn membutuhkan minimal 2 request (get options + verify), sedangkan password hanya 1 request. Total request yang lebih tinggi di WebAuthn bukan berarti kurang efisien — ini adalah trade-off keamanan untuk challenge-response protocol yang mencegah replay attack."
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-emerald-400" />}
          label="Avg Response Time"
          value={`${summary?.overall?.avgResponseTime || 0}ms`}
          detail={`P95: ${summary?.overall?.p95 || 0}ms`}
          infoTitle="Average Response Time & P95"
          infoDescription="Avg Response Time: waktu rata-rata server merespon request autentikasi. P95 (Persentil 95): 95% dari semua request selesai dalam waktu ini. P95 lebih representatif karena menunjukkan worst-case realistic, bukan outlier."
          infoRelevance="WebAuthn bisa memiliki response time lebih tinggi karena operasi kriptografi (verify signature ECDSA/RSA) vs password (bcrypt hash compare). Namun, total user-perceived latency WebAuthn sering lebih rendah karena: (1) Tidak perlu mengetik password, (2) Biometrik bersifat near-instant untuk pengguna, (3) Bottleneck ada di interaksi user, bukan server."
        />
        <StatCard
          icon={<Zap className="w-5 h-5 text-amber-400" />}
          label="Round-Trips"
          value={`WebAuthn: ${comparison?.webauthn?.roundTrips || 2}`}
          detail={`Password: ${comparison?.password?.roundTrips || 1}`}
          infoTitle="Round-Trips (Perjalanan Bolak-Balik)"
          infoDescription="Jumlah HTTP request round-trip yang diperlukan untuk menyelesaikan satu siklus autentikasi. Password: 1 round-trip (kirim username+password → terima token). WebAuthn: 2 round-trips (1. request options/challenge → 2. kirim signed response → terima token)."
          infoRelevance="WebAuthn membutuhkan 2 round-trips karena menggunakan challenge-response protocol: server mengirim challenge random, authenticator menandatanganinya dengan private key, lalu server memverifikasi signature. Extra round-trip ini adalah 'harga' keamanan yang membuat replay attack mustahil — challenge selalu unik dan single-use. Password tidak memiliki mekanisme ini sehingga rentan terhadap credential replay."
        />
      </div>

      {/* Latency Comparison Chart */}
      {latencyChartData.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            Perbandingan Latency
            <MetricInfoButton
              title="Perbandingan Latency"
              description="Grafik yang membandingkan 3 metrik latency antara WebAuthn dan Password: (1) Avg Response Time — rata-rata waktu respon, (2) P50 Latency — median (50% request lebih cepat dari ini), (3) P95 Latency — persentil ke-95 (hanya 5% request lebih lambat). Satuan dalam milidetik (ms)."
              relevance="Perbandingan latency menunjukkan trade-off performa. WebAuthn bisa sedikit lebih lambat di sisi server karena operasi kriptografi (ECDSA signature verification vs bcrypt password comparison). Namun, end-to-end latency yang dirasakan pengguna sering lebih rendah karena eliminasi waktu mengetik password. P95 lebih penting dari rata-rata karena menunjukkan pengalaman worst-case yang masih acceptable."
            />
          </h3>
          <p className="text-sm text-gray-500 mb-4">Response time dalam milidetik (ms)</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={latencyChartData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} unit="ms" />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '13px' }}
                labelStyle={{ color: '#fff', fontWeight: 600 }}
              />
              <Legend wrapperStyle={{ fontSize: '13px' }} />
              <Bar dataKey="WebAuthn" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Password" fill="#6b7280" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Payload Size Comparison */}
      {sizeChartData.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            Perbandingan Payload
            <MetricInfoButton
              title="Perbandingan Payload Size"
              description="Grafik yang membandingkan ukuran data (dalam bytes) yang dikirim dan diterima antara WebAuthn dan Password. Request Size: ukuran data yang dikirim client ke server. Response Size: ukuran data yang dikirim server ke client."
              relevance="WebAuthn memiliki payload lebih besar karena: (1) Request mengandung authenticator data (CBOR-encoded), client data JSON, dan signature, (2) Response mengandung challenge, relying party info, dan credential parameters. Password hanya mengirim username+password (plaintext kecil). Payload lebih besar ≠ kurang efisien; ini adalah data kriptografi yang memberikan keamanan jauh lebih tinggi. Perbedaan ukuran umumnya negligible (<5KB) dalam konteks bandwidth modern."
            />
          </h3>
          <p className="text-sm text-gray-500 mb-4">Ukuran request/response dalam bytes</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={sizeChartData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.06)' }} unit="B" />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '13px' }}
                labelStyle={{ color: '#fff', fontWeight: 600 }}
              />
              <Legend wrapperStyle={{ fontSize: '13px' }} />
              <Bar dataKey="WebAuthn" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Password" fill="#6b7280" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Analysis */}
      {comparison?.comparison && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-blue-400" />
            Analisis Perbandingan
            <MetricInfoButton
              title="Analisis Perbandingan Kuantitatif"
              description="Ringkasan perbedaan kuantitatif antara WebAuthn dan Password: (1) Response Time Diff — selisih waktu respon (+ berarti WebAuthn lebih lambat), (2) Request/Response Size Diff — selisih ukuran payload, (3) Round-Trip Diff — selisih jumlah round-trip. Nilai positif menunjukkan WebAuthn lebih besar/lambat pada metrik tersebut."
              relevance="Analisis ini membuktikan bahwa trade-off performa WebAuthn minimal dibandingkan keuntungan keamanannya. Meskipun WebAuthn membutuhkan +1 round-trip dan payload sedikit lebih besar, keunggulan keamanan (phishing-resistant, no shared secrets, cryptographic verification) jauh melebihi overhead performa yang umumnya hanya beberapa milidetik dan kilobyte."
            />
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <ComparisonRow label="Response Time Diff" value={`${comparison.comparison.responseTimeDiff > 0 ? '+' : ''}${comparison.comparison.responseTimeDiff}ms`} />
            <ComparisonRow label="Request Size Diff" value={`${comparison.comparison.requestSizeDiff > 0 ? '+' : ''}${comparison.comparison.requestSizeDiff}B`} />
            <ComparisonRow label="Response Size Diff" value={`${comparison.comparison.responseSizeDiff > 0 ? '+' : ''}${comparison.comparison.responseSizeDiff}B`} />
            <ComparisonRow label="Round-Trip Diff" value={`+${comparison.comparison.roundTripDiff} round-trip`} />
          </div>
          <div className="p-4 bg-blue-500/[0.04] border border-blue-500/10 rounded-xl">
            <p className="text-sm text-gray-300 leading-relaxed">{comparison.comparison.analysis}</p>
          </div>
        </div>
      )}

      {/* Top Endpoints */}
      {summary?.endpoints?.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-4">Endpoint Performance</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {summary.endpoints.slice(0, 10).map((ep, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono text-white truncate">{ep.endpoint}</p>
                  <p className="text-xs text-gray-500">{ep.count} requests · {ep.successRate}% success</p>
                </div>
                <div className="text-right ml-3 shrink-0">
                  <p className="text-sm font-semibold text-white">{ep.avgResponseTime}ms</p>
                  <p className="text-xs text-gray-500">P95: {ep.p95}ms</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!summary?.totalRequests || summary.totalRequests === 0) && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Belum ada data performa. Lakukan autentikasi untuk mengumpulkan data.</p>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, detail, infoTitle, infoDescription, infoRelevance }) => (
  <div className="glass-card rounded-2xl p-5">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">{icon}</div>
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
      {infoTitle && (
        <MetricInfoButton
          title={infoTitle}
          description={infoDescription}
          relevance={infoRelevance}
          className="ml-auto"
        />
      )}
    </div>
    <p className="text-xl font-bold text-white">{value}</p>
    {detail && <p className="text-xs text-gray-500 mt-1">{detail}</p>}
  </div>
);

const ComparisonRow = ({ label, value }) => (
  <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
    <span className="text-sm text-gray-400">{label}</span>
    <span className="text-sm font-semibold font-mono text-white">{value}</span>
  </div>
);

export default PerformanceTab;
