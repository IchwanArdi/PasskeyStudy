import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { statsAPI, userAPI, securityAPI, uxAPI, costAPI, compatibilityAPI } from '../services/api';
import { isAuthenticated, clearAuth } from '../utils/auth';
import { DurationComparisonChart, SuccessRateChart, ActivityOverTimeChart, PercentileChart, ErrorDistributionChart, DeviceBreakdownChart, HourlyActivityChart, DayOfWeekChart } from '../components/StatsChart';
import { toast } from 'react-toastify';
import Feedback from '../components/Feedback';
import { Search, Github, Download, MessageSquare, Lightbulb, Zap, Lock, BarChart3, Smartphone, Clock, Key, Shield } from 'lucide-react';
import SecurityAnalysisTab from '../components/SecurityAnalysisTab';
import UXResearchTab from '../components/UXResearchTab';
import CostAnalysisTab from '../components/CostAnalysisTab';
import CompatibilityTab from '../components/CompatibilityTab';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [myStats, setMyStats] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('global'); // 'global' or 'my'
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastLoginMethod, setLastLoginMethod] = useState(null);
  const [lastLoginDuration, setLastLoginDuration] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [securityData, setSecurityData] = useState(null);
  const [uxData, setUxData] = useState(null);
  const [costData, setCostData] = useState(null);
  const [compatibilityData, setCompatibilityData] = useState(null);
  const [loadingSecurity, setLoadingSecurity] = useState(false);
  const [loadingUX, setLoadingUX] = useState(false);
  const [loadingCost, setLoadingCost] = useState(false);
  const [loadingCompatibility, setLoadingCompatibility] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    loadData();
  }, [navigate]);

  // Load data when tab changes
  useEffect(() => {
    if (!isAuthenticated()) return;

    const loadTabData = async () => {
      if (activeTab === 'security' && !securityData) {
        setLoadingSecurity(true);
        try {
          const [phishing, vulnerability, attackSurface, securityScore] = await Promise.all([securityAPI.getPhishingResistance(), securityAPI.getVulnerabilityAssessment(), securityAPI.getAttackSurface(), securityAPI.getSecurityScore()]);
          setSecurityData({
            phishing: phishing.data,
            vulnerability: vulnerability.data,
            attackSurface: attackSurface.data,
            securityScore: securityScore.data,
          });
        } catch (error) {
          console.error('Failed to load security data:', error);
        } finally {
          setLoadingSecurity(false);
        }
      }

      if (activeTab === 'ux' && !uxData) {
        setLoadingUX(true);
        try {
          const [sus, cognitive, task] = await Promise.all([uxAPI.getSUSResults(), uxAPI.getCognitiveLoadResults(), uxAPI.getTaskCompletionResults()]);
          setUxData({
            sus: sus.data,
            cognitive: cognitive.data,
            task: task.data,
          });
        } catch (error) {
          console.error('Failed to load UX data:', error);
        } finally {
          setLoadingUX(false);
        }
      }

      if (activeTab === 'cost' && !costData) {
        setLoadingCost(true);
        try {
          const [implementation, operational, roi, comparison] = await Promise.all([costAPI.getImplementationCost(), costAPI.getOperationalCost(), costAPI.getROI(), costAPI.getCostComparison()]);
          setCostData({
            implementation: implementation.data,
            operational: operational.data,
            roi: roi.data,
            comparison: comparison.data,
          });
        } catch (error) {
          console.error('Failed to load cost data:', error);
        } finally {
          setLoadingCost(false);
        }
      }

      if (activeTab === 'compatibility' && !compatibilityData) {
        setLoadingCompatibility(true);
        try {
          const [browser, device, accessibility] = await Promise.all([compatibilityAPI.getBrowserMatrix(), compatibilityAPI.getDeviceSupport(), compatibilityAPI.getAccessibility()]);
          setCompatibilityData({
            browser: browser.data,
            device: device.data,
            accessibility: accessibility.data,
          });
        } catch (error) {
          console.error('Failed to load compatibility data:', error);
        } finally {
          setLoadingCompatibility(false);
        }
      }
    };

    loadTabData();
  }, [activeTab, securityData, uxData, costData, compatibilityData]);

  const loadData = async () => {
    try {
      const [globalStatsResponse, myStatsResponse, userResponse] = await Promise.all([statsAPI.getGlobalStats(), statsAPI.getMyStats(), userAPI.getProfile()]);

      // Transform global stats to match the expected format
      const globalStats = {
        summary: {
          password: globalStatsResponse.data.summary?.password || globalStatsResponse.data.password,
          webauthn: globalStatsResponse.data.summary?.webauthn || globalStatsResponse.data.webauthn,
        },
        recentLogs: globalStatsResponse.data.recentLogs || [],
        logsByDate: globalStatsResponse.data.logsByDate || {},
        statisticalAnalysis: globalStatsResponse.data.statisticalAnalysis,
      };

      // Transform my stats to match the expected format
      const myStatsFormatted = {
        summary: {
          password: myStatsResponse.data.summary?.password || myStatsResponse.data.password,
          webauthn: myStatsResponse.data.summary?.webauthn || myStatsResponse.data.webauthn,
        },
        recentLogs: myStatsResponse.data.recentLogs || [],
        logsByDate: myStatsResponse.data.logsByDate || {},
        statisticalAnalysis: myStatsResponse.data.statisticalAnalysis,
      };

      setMyStats(myStatsFormatted);
      setStats(viewMode === 'global' ? globalStats : myStatsFormatted);
      setUser(userResponse.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewModeChange = async (mode) => {
    setViewMode(mode);
    if (mode === 'global') {
      try {
        // Load global stats
        const response = await statsAPI.getGlobalStats();
        const globalStats = {
          summary: {
            password: response.data.summary?.password || response.data.password,
            webauthn: response.data.summary?.webauthn || response.data.webauthn,
          },
          recentLogs: response.data.recentLogs || [],
          logsByDate: response.data.logsByDate || {},
          statisticalAnalysis: response.data.statisticalAnalysis,
        };
        setStats(globalStats);
      } catch (error) {
        toast.error('Failed to load global stats');
        console.error(error);
      }
    } else {
      // Use my stats
      if (myStats) {
        setStats(myStats);
      } else {
        // Reload my stats if not loaded yet
        try {
          const response = await statsAPI.getMyStats();
          const myStatsFormatted = {
            summary: {
              password: response.data.summary?.password || response.data.password,
              webauthn: response.data.summary?.webauthn || response.data.webauthn,
            },
            recentLogs: response.data.recentLogs || [],
            logsByDate: response.data.logsByDate || {},
            statisticalAnalysis: response.data.statisticalAnalysis,
          };
          setMyStats(myStatsFormatted);
          setStats(myStatsFormatted);
        } catch (error) {
          toast.error('Failed to load my stats');
          console.error(error);
        }
      }
    }
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
    toast.info('Logged out successfully');
  };

  const exportToCSV = () => {
    if (!stats || !stats.recentLogs) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Method', 'Timestamp', 'Duration (ms)', 'Status', 'IP Address'];
    const rows = stats.recentLogs.map((log) => [log.method, new Date(log.timestamp).toLocaleString(), log.duration, log.success ? 'Success' : 'Failed', log.ipAddress]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `auth-stats-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Data exported to CSV');
  };

  const getInsights = () => {
    if (!stats || !stats.summary) return [];

    const insights = [];
    const password = stats.summary.password;
    const webauthn = stats.summary.webauthn;

    // Check if data exists and has required properties
    if (!password || !webauthn) return [];

    // Performance insight
    if (password.avgDuration && webauthn.avgDuration && webauthn.avgDuration < password.avgDuration) {
      insights.push({
        type: 'performance',
        icon: Zap,
        title: 'WebAuthn Lebih Cepat',
        message: `WebAuthn ${(((password.avgDuration - webauthn.avgDuration) / password.avgDuration) * 100).toFixed(1)}% lebih cepat dari password`,
      });
    }

    // Security insight
    if (password.successRate && webauthn.successRate && parseFloat(webauthn.successRate) > parseFloat(password.successRate)) {
      insights.push({
        type: 'security',
        icon: Lock,
        title: 'WebAuthn Lebih Reliable',
        message: `Success rate WebAuthn ${webauthn.successRate}% vs Password ${password.successRate}%`,
      });
    }

    // Usage insight
    if (webauthn.total > 0 && password.total > 0) {
      const webauthnRatio = (webauthn.total / (webauthn.total + password.total)) * 100;
      if (webauthnRatio > 50) {
        insights.push({
          type: 'usage',
          icon: BarChart3,
          title: 'WebAuthn Populer',
          message: `${webauthnRatio.toFixed(1)}% pengguna memilih WebAuthn`,
        });
      }
    }

    return insights;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-white font-semibold text-sm hover:text-gray-300 transition-colors">
              WebAuthn Research
            </Link>
            <Link to="/docs" className="text-gray-400 hover:text-white transition-colors hidden md:block text-sm">
              Dokumentasi
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-gray-900 border border-gray-800 rounded-lg text-xs text-gray-400 hover:border-gray-700 transition-all cursor-pointer">
              <Search className="w-3.5 h-3.5" />
              <span>Cari</span>
              <span className="ml-1.5 px-1 py-0.5 bg-gray-800 rounded text-xs">Ctrl K</span>
            </div>
            <a href="#" className="text-gray-400 hover:text-white p-1.5 hover:bg-gray-800 rounded-lg transition-all" aria-label="GitHub">
              <Github className="w-5 h-5" />
            </a>
            <button onClick={() => navigate('/profile')} className="px-3 py-1.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-all">
              Profil
            </button>
            <button onClick={handleLogout} className="px-3 py-1.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-20 pb-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-400">Selamat datang, {user?.username || user?.email}!</p>
          </div>

          {/* View Mode Toggle */}
          <div className="mb-6 flex items-center gap-3">
            <button
              onClick={() => handleViewModeChange('global')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'global' ? 'bg-white text-black hover:bg-gray-200 shadow-lg' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              Statistik Global
            </button>
            <button
              onClick={() => handleViewModeChange('my')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'my' ? 'bg-white text-black hover:bg-gray-200 shadow-lg' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              Statistik Saya
            </button>
          </div>

          {stats && (
            <div className="space-y-6">
              {/* Insights Section */}
              {getInsights().length > 0 && (
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    <span>Insights & Rekomendasi</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {getInsights().map((insight, index) => {
                      const IconComponent = insight.icon;
                      return (
                        <div key={index} className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-all">
                          <div className="flex items-start gap-3">
                            <IconComponent className="w-6 h-6 text-yellow-400 shrink-0" />
                            <div>
                              <h4 className="font-semibold text-white mb-1">{insight.title}</h4>
                              <p className="text-sm text-gray-400">{insight.message}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button onClick={exportToCSV} className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-all flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Data ke CSV
                </button>
                <button onClick={() => setShowFeedback(true)} className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-all flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Berikan Feedback
                </button>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
                  <h3 className="text-xl font-semibold mb-4 text-red-400 flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Password Authentication
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Attempts:</span>
                      <span className="text-white font-medium">{stats.summary.password.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Success:</span>
                      <span className="text-green-400 font-medium">{stats.summary.password.success}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Failed:</span>
                      <span className="text-red-400 font-medium">{stats.summary.password.failed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Success Rate:</span>
                      <span className="text-white font-medium">{stats.summary.password.successRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg Duration:</span>
                      <span className="text-white font-medium">{stats.summary.password.avgDuration}ms</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
                  <h3 className="text-xl font-semibold mb-4 text-green-400 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    WebAuthn Authentication
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Attempts:</span>
                      <span className="text-white font-medium">{stats.summary.webauthn.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Success:</span>
                      <span className="text-green-400 font-medium">{stats.summary.webauthn.success}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Failed:</span>
                      <span className="text-red-400 font-medium">{stats.summary.webauthn.failed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Success Rate:</span>
                      <span className="text-white font-medium">{stats.summary.webauthn.successRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg Duration:</span>
                      <span className="text-white font-medium">{stats.summary.webauthn.avgDuration}ms</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-1 flex gap-1 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'performance', label: 'Performance', icon: Zap },
                  { id: 'security', label: 'Security', icon: Lock },
                  { id: 'devices', label: 'Devices', icon: Smartphone },
                  { id: 'time', label: 'Time Analysis', icon: Clock },
                  { id: 'statistics', label: 'Statistical Analysis', icon: BarChart3 },
                  { id: 'security', label: 'Security Analysis', icon: Shield },
                  { id: 'ux', label: 'UX Research', icon: Lightbulb },
                  { id: 'cost', label: 'Cost Analysis', icon: BarChart3 },
                  { id: 'compatibility', label: 'Compatibility', icon: Smartphone },
                ].map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                        activeTab === tab.id ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <>
                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
                      <h3 className="text-lg font-semibold mb-4">Perbandingan Durasi Login Rata-rata</h3>
                      <DurationComparisonChart data={stats} />
                    </div>

                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
                      <h3 className="text-lg font-semibold mb-4">Perbandingan Success Rate</h3>
                      <SuccessRateChart data={stats} />
                    </div>

                    <div className="lg:col-span-2 bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
                      <h3 className="text-lg font-semibold mb-4">Aktivitas dari Waktu ke Waktu (30 Hari Terakhir)</h3>
                      <ActivityOverTimeChart data={stats} />
                    </div>
                  </div>
                </>
              )}

              {/* Performance Tab */}
              {activeTab === 'performance' && (
                <div className="space-y-6">
                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
                    <h3 className="text-lg font-semibold mb-4">Analisis Percentile Durasi</h3>
                    <p className="text-sm text-gray-400 mb-4">Distribusi durasi login berdasarkan percentile (P50, P95, P99)</p>
                    <PercentileChart data={stats} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
                      <h4 className="text-md font-semibold mb-4 text-red-400">Password Performance Metrics</h4>
                      {stats.summary.password?.percentiles && (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Min:</span>
                            <span className="text-white font-medium">{stats.summary.password.percentiles.min}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">P50 (Median):</span>
                            <span className="text-white font-medium">{stats.summary.password.percentiles.p50}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">P95:</span>
                            <span className="text-white font-medium">{stats.summary.password.percentiles.p95}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">P99:</span>
                            <span className="text-white font-medium">{stats.summary.password.percentiles.p99}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Max:</span>
                            <span className="text-white font-medium">{stats.summary.password.percentiles.max}ms</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
                      <h4 className="text-md font-semibold mb-4 text-green-400">WebAuthn Performance Metrics</h4>
                      {stats.summary.webauthn?.percentiles && (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Min:</span>
                            <span className="text-white font-medium">{stats.summary.webauthn.percentiles.min}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">P50 (Median):</span>
                            <span className="text-white font-medium">{stats.summary.webauthn.percentiles.p50}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">P95:</span>
                            <span className="text-white font-medium">{stats.summary.webauthn.percentiles.p95}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">P99:</span>
                            <span className="text-white font-medium">{stats.summary.webauthn.percentiles.p99}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Max:</span>
                            <span className="text-white font-medium">{stats.summary.webauthn.percentiles.max}ms</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
                    <h3 className="text-lg font-semibold mb-4">Distribusi Error</h3>
                    <p className="text-sm text-gray-400 mb-4">Kategori error berdasarkan metode autentikasi</p>
                    <ErrorDistributionChart data={stats} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
                      <h4 className="text-md font-semibold mb-4 text-red-400">Password Security Metrics</h4>
                      {stats.summary.password?.security && (
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Total IP Addresses:</span>
                            <span className="text-white font-medium">{stats.summary.password.security.totalIPs}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Suspicious IPs:</span>
                            <span className="text-red-400 font-medium">{stats.summary.password.security.suspiciousIPs.length}</span>
                          </div>
                          {stats.summary.password.security.suspiciousIPs.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm text-gray-400 mb-2">Suspicious IP Addresses:</p>
                              <div className="space-y-1">
                                {stats.summary.password.security.suspiciousIPs.slice(0, 5).map((item, idx) => (
                                  <div key={idx} className="text-xs bg-red-500/10 border border-red-500/30 rounded p-2">
                                    <div className="flex justify-between">
                                      <span className="text-red-400">{item.ip}</span>
                                      <span className="text-gray-400">
                                        {item.failed}/{item.attempts} ({item.ratio}%)
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
                      <h4 className="text-md font-semibold mb-4 text-green-400">WebAuthn Security Metrics</h4>
                      {stats.summary.webauthn?.security && (
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Total IP Addresses:</span>
                            <span className="text-white font-medium">{stats.summary.webauthn.security.totalIPs}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Suspicious IPs:</span>
                            <span className="text-red-400 font-medium">{stats.summary.webauthn.security.suspiciousIPs.length}</span>
                          </div>
                          {stats.summary.webauthn.security.suspiciousIPs.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm text-gray-400 mb-2">Suspicious IP Addresses:</p>
                              <div className="space-y-1">
                                {stats.summary.webauthn.security.suspiciousIPs.slice(0, 5).map((item, idx) => (
                                  <div key={idx} className="text-xs bg-red-500/10 border border-red-500/30 rounded p-2">
                                    <div className="flex justify-between">
                                      <span className="text-red-400">{item.ip}</span>
                                      <span className="text-gray-400">
                                        {item.failed}/{item.attempts} ({item.ratio}%)
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Devices Tab */}
              {activeTab === 'devices' && (
                <div className="space-y-6">
                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
                    <h3 className="text-lg font-semibold mb-4">Browser Breakdown</h3>
                    <p className="text-sm text-gray-400 mb-4">Distribusi penggunaan berdasarkan browser</p>
                    <DeviceBreakdownChart data={stats} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
                      <h4 className="text-md font-semibold mb-4 text-red-400">Password - Device Breakdown</h4>
                      {stats.summary.password?.deviceBreakdown && (
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-400 mb-2">Browsers:</p>
                            <div className="space-y-1">
                              {Object.entries(stats.summary.password.deviceBreakdown.browsers || {})
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 5)
                                .map(([browser, count]) => (
                                  <div key={browser} className="flex justify-between text-sm">
                                    <span className="text-gray-300">{browser}</span>
                                    <span className="text-white font-medium">{count}</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-2">Devices:</p>
                            <div className="space-y-1">
                              {Object.entries(stats.summary.password.deviceBreakdown.devices || {})
                                .sort((a, b) => b[1] - a[1])
                                .map(([device, count]) => (
                                  <div key={device} className="flex justify-between text-sm">
                                    <span className="text-gray-300">{device}</span>
                                    <span className="text-white font-medium">{count}</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
                      <h4 className="text-md font-semibold mb-4 text-green-400">WebAuthn - Device Breakdown</h4>
                      {stats.summary.webauthn?.deviceBreakdown && (
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-400 mb-2">Browsers:</p>
                            <div className="space-y-1">
                              {Object.entries(stats.summary.webauthn.deviceBreakdown.browsers || {})
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 5)
                                .map(([browser, count]) => (
                                  <div key={browser} className="flex justify-between text-sm">
                                    <span className="text-gray-300">{browser}</span>
                                    <span className="text-white font-medium">{count}</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400 mb-2">Devices:</p>
                            <div className="space-y-1">
                              {Object.entries(stats.summary.webauthn.deviceBreakdown.devices || {})
                                .sort((a, b) => b[1] - a[1])
                                .map(([device, count]) => (
                                  <div key={device} className="flex justify-between text-sm">
                                    <span className="text-gray-300">{device}</span>
                                    <span className="text-white font-medium">{count}</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Time Analysis Tab */}
              {activeTab === 'time' && (
                <div className="space-y-6">
                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
                    <h3 className="text-lg font-semibold mb-4">Aktivitas per Jam (24 Jam)</h3>
                    <p className="text-sm text-gray-400 mb-4">Distribusi aktivitas login berdasarkan jam dalam sehari</p>
                    <HourlyActivityChart data={stats} />
                  </div>

                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
                    <h3 className="text-lg font-semibold mb-4">Aktivitas per Hari dalam Seminggu</h3>
                    <p className="text-sm text-gray-400 mb-4">Distribusi aktivitas login berdasarkan hari dalam seminggu</p>
                    <DayOfWeekChart data={stats} />
                  </div>
                </div>
              )}

              {/* Statistical Analysis Tab */}
              {activeTab === 'statistics' && stats?.statisticalAnalysis && (
                <div className="space-y-6">
                  {/* Sample Size Analysis */}
                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Analisis Sample Size & Power
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="text-md font-semibold text-gray-300">Sample Size Saat Ini</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Password:</span>
                            <span className="text-white font-medium">{stats.statisticalAnalysis.sampleSize.current.password}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">WebAuthn:</span>
                            <span className="text-white font-medium">{stats.statisticalAnalysis.sampleSize.current.webauthn}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-gray-800">
                            <span className="text-gray-400">Total:</span>
                            <span className="text-white font-medium">{stats.statisticalAnalysis.sampleSize.current.password + stats.statisticalAnalysis.sampleSize.current.webauthn}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-md font-semibold text-gray-300">Rekomendasi</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Minimum per kelompok:</span>
                            <span className="text-white font-medium">{stats.statisticalAnalysis.sampleSize.recommended}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Status:</span>
                            <span className={`font-medium ${stats.statisticalAnalysis.sampleSize.adequacy === 'Adequate' ? 'text-green-400' : 'text-yellow-400'}`}>{stats.statisticalAnalysis.sampleSize.adequacy}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-gray-800">
                            <span className="text-gray-400">Power:</span>
                            <span className="text-white font-medium">{(stats.statisticalAnalysis.powerAnalysis.power * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {stats.statisticalAnalysis.sampleSize.adequacy === 'Insufficient' && (
                      <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <p className="text-sm text-yellow-400">⚠️ Sample size belum mencukupi. Disarankan untuk mengumpulkan lebih banyak data untuk meningkatkan power statistik.</p>
                      </div>
                    )}
                  </div>

                  {/* T-Test Results for Duration */}
                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
                    <h3 className="text-lg font-semibold mb-4">Uji t-test untuk Durasi Login</h3>
                    <p className="text-sm text-gray-400 mb-4">Menguji apakah ada perbedaan signifikan dalam durasi login antara Password dan WebAuthn</p>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="text-md font-semibold text-red-400">Password</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Mean:</span>
                              <span className="text-white font-medium">{Math.round(stats.statisticalAnalysis.duration.tTest.mean1)}ms</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">95% CI:</span>
                              <span className="text-white font-medium">
                                [{Math.round(stats.statisticalAnalysis.duration.confidenceIntervals.password.lower)} - {Math.round(stats.statisticalAnalysis.duration.confidenceIntervals.password.upper)}]ms
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-md font-semibold text-green-400">WebAuthn</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Mean:</span>
                              <span className="text-white font-medium">{Math.round(stats.statisticalAnalysis.duration.tTest.mean2)}ms</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">95% CI:</span>
                              <span className="text-white font-medium">
                                [{Math.round(stats.statisticalAnalysis.duration.confidenceIntervals.webauthn.lower)} - {Math.round(stats.statisticalAnalysis.duration.confidenceIntervals.webauthn.upper)}]ms
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-gray-800 space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <span className="text-xs text-gray-400 block mb-1">t-value</span>
                            <span className="text-lg font-semibold text-white">{stats.statisticalAnalysis.duration.tTest.tValue.toFixed(3)}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-400 block mb-1">p-value</span>
                            <span className={`text-lg font-semibold ${stats.statisticalAnalysis.duration.tTest.pValue < 0.05 ? 'text-green-400' : 'text-gray-400'}`}>
                              {stats.statisticalAnalysis.duration.tTest.pValue.toFixed(4)}
                              {stats.statisticalAnalysis.duration.tTest.pValue < 0.05 && ' *'}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-400 block mb-1">Effect Size (d)</span>
                            <span className="text-lg font-semibold text-white">{stats.statisticalAnalysis.duration.tTest.effectSize.toFixed(3)}</span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-400 block mb-1">df</span>
                            <span className="text-lg font-semibold text-white">{stats.statisticalAnalysis.duration.tTest.df}</span>
                          </div>
                        </div>
                        <div className="p-4 bg-gray-900 rounded-lg">
                          <p className="text-sm text-white font-medium mb-2">Interpretasi:</p>
                          <p className="text-sm text-gray-300">{stats.statisticalAnalysis.duration.tTest.interpretation}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            Effect Size: <span className="text-white">{stats.statisticalAnalysis.duration.tTest.effectSizeInterpretation}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chi-Square Test Results for Success Rate */}
                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
                    <h3 className="text-lg font-semibold mb-4">Uji Chi-Square untuk Success Rate</h3>
                    <p className="text-sm text-gray-400 mb-4">Menguji apakah ada perbedaan signifikan dalam success rate antara Password dan WebAuthn</p>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <span className="text-xs text-gray-400 block mb-1">Chi-square</span>
                          <span className="text-lg font-semibold text-white">{stats.statisticalAnalysis.successRate.chiSquare.chiSquare.toFixed(3)}</span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400 block mb-1">p-value</span>
                          <span className={`text-lg font-semibold ${stats.statisticalAnalysis.successRate.chiSquare.pValue < 0.05 ? 'text-green-400' : 'text-gray-400'}`}>
                            {stats.statisticalAnalysis.successRate.chiSquare.pValue.toFixed(4)}
                            {stats.statisticalAnalysis.successRate.chiSquare.pValue < 0.05 && ' *'}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400 block mb-1">df</span>
                          <span className="text-lg font-semibold text-white">{stats.statisticalAnalysis.successRate.chiSquare.df}</span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-400 block mb-1">Significant</span>
                          <span className={`text-lg font-semibold ${stats.statisticalAnalysis.successRate.chiSquare.significant ? 'text-green-400' : 'text-gray-400'}`}>
                            {stats.statisticalAnalysis.successRate.chiSquare.significant ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-900 rounded-lg">
                        <p className="text-sm text-white font-medium mb-2">Interpretasi:</p>
                        <p className="text-sm text-gray-300">{stats.statisticalAnalysis.successRate.chiSquare.interpretation}</p>
                      </div>
                    </div>
                  </div>

                  {/* Statistical Summary */}
                  <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
                    <h3 className="text-lg font-semibold mb-4">Kesimpulan Statistik</h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-gray-900 rounded-lg">
                        <h4 className="text-md font-semibold text-white mb-2">Hipotesis 1: Durasi Login</h4>
                        <p className="text-sm text-gray-300">
                          {stats.statisticalAnalysis.duration.tTest.significant ? (
                            <>
                              <span className="text-green-400 font-semibold">H₁ Diterima</span> - Ada perbedaan signifikan dalam durasi login (p = {stats.statisticalAnalysis.duration.tTest.pValue.toFixed(4)}).{' '}
                              {stats.statisticalAnalysis.duration.tTest.mean1 > stats.statisticalAnalysis.duration.tTest.mean2 ? 'WebAuthn lebih cepat daripada Password.' : 'Password lebih cepat daripada WebAuthn.'}
                            </>
                          ) : (
                            <>
                              <span className="text-gray-400 font-semibold">H₀ Gagal Ditolak</span> - Tidak ada perbedaan signifikan dalam durasi login (p = {stats.statisticalAnalysis.duration.tTest.pValue.toFixed(4)}).
                            </>
                          )}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-900 rounded-lg">
                        <h4 className="text-md font-semibold text-white mb-2">Hipotesis 2: Success Rate</h4>
                        <p className="text-sm text-gray-300">
                          {stats.statisticalAnalysis.successRate.chiSquare.significant ? (
                            <>
                              <span className="text-green-400 font-semibold">H₁ Diterima</span> - Ada perbedaan signifikan dalam success rate (p = {stats.statisticalAnalysis.successRate.chiSquare.pValue.toFixed(4)}).
                            </>
                          ) : (
                            <>
                              <span className="text-gray-400 font-semibold">H₀ Gagal Ditolak</span> - Tidak ada perbedaan signifikan dalam success rate (p = {stats.statisticalAnalysis.successRate.chiSquare.pValue.toFixed(4)}).
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Analysis Tab */}
              {activeTab === 'security' && <SecurityAnalysisTab securityData={securityData} loadingSecurity={loadingSecurity} setSecurityData={setSecurityData} setLoadingSecurity={setLoadingSecurity} />}

              {/* UX Research Tab */}
              {activeTab === 'ux' && <UXResearchTab uxData={uxData} loadingUX={loadingUX} setUxData={setUxData} setLoadingUX={setLoadingUX} />}

              {/* Cost Analysis Tab */}
              {activeTab === 'cost' && <CostAnalysisTab costData={costData} loadingCost={loadingCost} setCostData={setCostData} setLoadingCost={setLoadingCost} />}

              {/* Compatibility Tab */}
              {activeTab === 'compatibility' && (
                <CompatibilityTab compatibilityData={compatibilityData} loadingCompatibility={loadingCompatibility} setCompatibilityData={setCompatibilityData} setLoadingCompatibility={setLoadingCompatibility} />
              )}

              {/* Recent Logs */}
              <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-all">
                <h3 className="text-lg font-semibold mb-4">{viewMode === 'global' ? 'Percobaan Login Terbaru (Semua User)' : 'Percobaan Login Terbaru'}</h3>
                {stats && stats.recentLogs && stats.recentLogs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-800">
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Method</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Timestamp</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Duration (ms)</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                          <th className="text-left py-3 px-4 text-gray-400 font-medium">IP Address</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentLogs.map((log, index) => (
                          <tr key={index} className="border-b border-gray-800 hover:bg-gray-900 transition-colors">
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${log.method === 'webauthn' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>{log.method}</span>
                            </td>
                            <td className="py-3 px-4 text-gray-300">{new Date(log.timestamp).toLocaleString('id-ID')}</td>
                            <td className="py-3 px-4 text-gray-300">{log.duration}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${log.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{log.success ? 'Success' : 'Failed'}</span>
                            </td>
                            <td className="py-3 px-4 text-gray-300">{log.ipAddress}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">Tidak ada percobaan login terbaru</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showFeedback && <Feedback onClose={() => setShowFeedback(false)} authMethod={lastLoginMethod || 'password'} duration={lastLoginDuration || 0} />}
    </div>
  );
};

export default Dashboard;
