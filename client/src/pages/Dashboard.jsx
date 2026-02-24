import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { statsAPI, securityAPI, uxAPI } from '../services/api';
import { isAuthenticated, clearAuth } from '../utils/auth';
import { SuccessRateChart, ActivityOverTimeChart, ErrorDistributionChart } from '../components/StatsChart';
import { toast } from 'react-toastify';
import Feedback from '../components/Feedback';
import { Download, MessageSquare, Lightbulb, BarChart3, Key, Shield, Menu, User, ChevronRight, CheckCircle, Globe, UserCircle, PanelLeftClose, PanelLeftOpen, LogOut } from 'lucide-react';
import SecurityAnalysisTab from '../components/SecurityAnalysisTab';
import UXResearchTab from '../components/UXResearchTab';
import PerformanceTab from '../components/PerformanceTab';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('global');
  const [stats, setStats] = useState(null);
  const [securityData, setSecurityData] = useState(null);
  const [uxData, setUxData] = useState(null);
  const [loadingSecurity, setLoadingSecurity] = useState(false);
  const [loadingUX, setLoadingUX] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const scrollContainerRef = useRef(null);

  const fetchStats = useCallback(async () => {
    try {
      const data = await statsAPI.getStats(viewMode);
      setStats(data);
    } catch {
      toast.error('Gagal mengambil data statistik');
    }
  }, [viewMode]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchStats();
  }, [navigate, fetchStats]);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setStats(null);
    setActiveTab('overview');
  };

  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
    if (tab === 'security_intel' && !securityData) {
      loadSecurityIntel();
    } else if (tab === 'ux_research' && !uxData) {
      loadUXResearch();
    }
  };

  const handleLogout = () => {
    clearAuth();
    toast.info('Sesi berakhir. Anda telah keluar.');
    navigate('/login');
  };

  const loadSecurityIntel = async () => {
    setLoadingSecurity(true);
    try {
      const data = await securityAPI.getAnalysis(viewMode);
      setSecurityData(data);
    } catch {
      toast.error('Gagal memuat data keamanan');
    } finally {
      setLoadingSecurity(false);
    }
  };

  const loadUXResearch = async () => {
    setLoadingUX(true);
    try {
      const data = await uxAPI.getUXData(viewMode);
      setUxData(data);
    } catch {
      toast.error('Gagal memuat data UX');
    } finally {
      setLoadingUX(false);
    }
  };

  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Ringkasan', icon: BarChart3 },
    { id: 'security_intel', label: 'Analisis Keamanan', icon: Shield },
    { id: 'ux_research', label: 'Riset UX', icon: Lightbulb },
    { id: 'performance', label: 'Performa', icon: Key },
  ];

  return (
    <div className="h-screen bg-[#0a0a0f] text-white font-sans flex overflow-hidden selection:bg-blue-500/30">
      {/* Sidebar Backdrop for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-[#0a0a0f] border-r border-white/[0.06] flex flex-col h-full transform transition-all duration-300 lg:relative lg:translate-x-0 overflow-hidden
          ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:w-0 lg:opacity-0'}
        `}
      >
        <div className="p-6 pb-4 flex-1 flex flex-col min-w-[288px]">
          <div className="flex items-center justify-between gap-3 mb-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Shield className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-sm font-bold tracking-tight">Research Dashboard</span>
            </div>
            
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all flex"
              title="Collapse Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive ? 'bg-blue-500/10 text-blue-400 border border-blue-500/15' : 'text-gray-500 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4.5 h-4.5" />
                    {item.label}
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </nav>

          <div className="mt-10 pt-8 border-t border-white/[0.06] space-y-1">
            <p className="px-4 text-xs font-semibold text-gray-600 mb-3">Lainnya</p>
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:text-white hover:bg-white/[0.04] transition-all rounded-xl"
            >
              <MessageSquare className="w-4.5 h-4.5" />
              Berikan Feedback
            </button>
            <button
              onClick={() => window.open('https://github.com/IchwanArdi/PasskeyStudy', '_blank')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:text-white hover:bg-white/[0.04] transition-all rounded-xl"
            >
              <Download className="w-4.5 h-4.5" />
              Ekspor Data
            </button>
          </div>
        </div>

        <div className="p-6 space-y-3">
          <div className="p-4 bg-white/[0.03] border border-white/[0.06] rounded-xl">
            <p className="text-xs font-semibold text-gray-500 mb-2">Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-glow" />
              <span className="text-xs font-medium text-gray-400">Terautentikasi</span>
            </div>
          </div>

          <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-white transition-colors rounded-xl hover:bg-white/[0.04]">
            <User className="w-4.5 h-4.5" />
            Profil Saya
          </button>

          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 transition-colors rounded-xl hover:bg-red-500/10"
          >
            <LogOut className="w-4.5 h-4.5" />
            Keluar Sesi
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className={`flex-1 flex flex-col min-w-0 bg-[#0a0a0f] overflow-hidden relative transition-all duration-300`}>
        {/* Control Bar */}
        <header className="h-16 border-b border-white/[0.06] flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-[#0a0a0f] z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className={`p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all ${isSidebarOpen ? 'lg:hidden' : 'lg:flex'}`}
            >
              {isSidebarOpen ? <Menu className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
            </button>
            <h1 className="text-sm font-semibold text-white capitalize hidden xs:block">{activeTab.replace('_', ' ')}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl">
              <button
                onClick={() => handleViewModeChange('global')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${viewMode === 'global' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <Globe className="w-3.5 h-3.5" />
                Global
              </button>
              <button
                onClick={() => handleViewModeChange('my')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${viewMode === 'my' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <UserCircle className="w-3.5 h-3.5" />
                Personal
              </button>
            </div>
          </div>
        </header>

        {/* Content Scroll Area */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 lg:p-10 scrollbar-none">
          <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
            {activeTab === 'overview' && stats && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass-card rounded-2xl p-6 hover:border-blue-500/20 transition-all group glow-blue-hover">
                    <p className="text-xs font-semibold text-gray-500 mb-3 group-hover:text-blue-400 transition-colors">Total Sesi</p>
                    <p className="text-3xl font-bold">{stats.totalLogins}</p>
                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex justify-between items-center text-xs text-gray-600">
                      <span>Data Historis</span>
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="glass-card rounded-2xl p-6 hover:border-blue-500/20 transition-all group glow-blue-hover">
                    <p className="text-xs font-semibold text-gray-500 mb-3 group-hover:text-blue-400 transition-colors">Rasio WebAuthn</p>
                    <p className="text-3xl font-bold">{stats.webauthnRatio}%</p>
                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex justify-between items-center text-xs text-gray-600">
                      <span>Tingkat Adopsi</span>
                      <Key className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="glass-card rounded-2xl p-6 hover:border-blue-500/20 transition-all group glow-blue-hover">
                    <p className="text-xs font-semibold text-gray-500 mb-3 group-hover:text-blue-400 transition-colors">Skor Risiko Rata-rata</p>
                    <p className="text-3xl font-bold text-blue-400">{stats.avgRiskScore}</p>
                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex justify-between items-center text-xs text-gray-600">
                      <span>Analisis ML</span>
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="glass-card rounded-2xl p-6 hover:border-blue-500/20 transition-all group glow-blue-hover">
                    <p className="text-xs font-semibold text-gray-500 mb-3 group-hover:text-blue-400 transition-colors">Node Aktif</p>
                    <p className="text-3xl font-bold">{stats.uniqueIPs}</p>
                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex justify-between items-center text-xs text-gray-600">
                      <span>Entitas Unik</span>
                      <User className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 glass-card rounded-2xl p-6">
                    <h3 className="text-sm font-semibold mb-6">Ketahanan Autentikasi dari Waktu ke Waktu</h3>
                    <div className="h-[350px]">
                      <ActivityOverTimeChart data={stats.activityOverTime} />
                    </div>
                  </div>
                  <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-sm font-semibold mb-6">Distribusi</h3>
                    <div className="h-[350px]">
                      <ErrorDistributionChart data={stats.errorDistribution} />
                    </div>
                  </div>
                </div>

                {/* Success Rate */}
                <div className="glass-card rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-semibold">Perbandingan Tingkat Keberhasilan</h3>
                    <div className="flex gap-4 text-xs font-medium text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> WebAuthn
                      </span>
                      <span className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-sm bg-gray-700" /> Password
                      </span>
                    </div>
                  </div>
                  <div className="h-[300px]">
                    <SuccessRateChart data={stats.successRates} />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'security_intel' && <SecurityAnalysisTab securityData={securityData} loadingSecurity={loadingSecurity} />}

            {activeTab === 'ux_research' && <UXResearchTab uxData={uxData} loadingUX={loadingUX} setUxData={setUxData} />}

            {activeTab === 'performance' && <PerformanceTab />}
          </div>
        </div>

        {/* Feedback Modal */}
        <Feedback isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} onSuccess={fetchStats} />
      </main>
    </div>
  );
};

export default Dashboard;
