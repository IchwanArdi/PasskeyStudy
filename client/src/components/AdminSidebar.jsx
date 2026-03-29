import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, FileText, Users, LogOut, ShieldCheck, User, ChevronRight, Sparkles, Sun, Moon } from "lucide-react";
import { useTheme } from "../utils/useTheme";

// Item navigasi untuk bilah samping admin
const navItems = [
  { to: "/admin", icon: Home, label: "Beranda" },
  { to: "/admin/pengajuan", icon: FileText, label: "Pengajuan" },
  { to: "/admin/users", icon: Users, label: "Warga" },
  { to: "/admin/profile", icon: User, label: "Profil" },
];

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  // Fungsi untuk menangani keluar sistem
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="hidden md:flex flex-col w-72 h-[calc(100vh-2.5rem)] fixed left-5 top-5 bg-[var(--bg)]/60 backdrop-blur-3xl border border-[var(--card-border)] rounded-[3rem] z-50 shadow-2xl shadow-red-500/5 overflow-hidden">
      {/* Bagian Brand / Identitas Panel */}
      <div className="p-8 pb-6 flex items-center gap-4 relative overflow-hidden group">
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-red-500/10 blur-3xl rounded-full group-hover:bg-red-500/20 transition-all duration-700" />
        <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20 border border-white/10 relative z-10">
          <ShieldCheck className="w-7 h-7 text-white" />
        </div>
        <div className="relative z-10">
          <h1 className="text-xl font-black bg-gradient-to-r from-[var(--heading-from)] via-red-300 to-orange-400 bg-clip-text text-transparent tracking-tight">
            Panel Admin
          </h1>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <p className="text-[10px] text-red-400/80 font-black uppercase tracking-[0.2em]">
              System Control
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 mb-6">
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--card-border)] to-transparent" />
      </div>

      {/* Menu Navigasi Utama */}
      <nav className="flex-1 px-6 space-y-2.5 overflow-y-auto">
        {navItems.map((item) => {
          const { to, label } = item;
          const NavIcon = item.icon;
          const isActive =
            location.pathname === to ||
            (to !== "/admin" && location.pathname.startsWith(to));
          
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-300 relative group overflow-hidden ${
                isActive 
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-lg shadow-red-500/5' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--card-bg)]'
              }`}
            >
              {/* Efek Cahaya Latar saat Aktif */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-50" />
              )}
              
              <div className={`relative z-10 flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>
                <NavIcon className={`w-5 h-5 ${isActive ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]' : ''}`} />
              </div>
              
              <span className={`relative z-10 font-bold text-sm tracking-wide ${isActive ? 'text-[var(--text)]' : ''}`}>
                {label}
              </span>

              {/* Indikator Titik Terang saat Aktif */}
              {isActive && (
                <div className="ml-auto relative z-10">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.8)]" />
                </div>
              )}
              
              {/* Icon panah saat di-hover */}
              {!isActive && (
                <ChevronRight className="ml-auto w-4 h-4 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-red-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bagian Bawah Bilah Samping */}
      <div className="p-6 mt-auto">
        <div className="flex flex-col gap-3">
          {/* Tombol Toggle Tema */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-between px-4 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl hover:border-red-500/30 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                {isDark ? 'Mode Gelap' : 'Mode Terang'}
              </span>
            </div>
            <div className={`w-9 h-5 rounded-full p-0.5 transition-all ${isDark ? 'bg-red-600' : 'bg-gray-300'}`}>
              <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isDark ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </button>

          {/* Info Singkat Admin */}
          <div className="px-4 py-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl mb-1 group/tip">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-red-400 group-hover/tip:rotate-12 transition-all duration-500" />
              <span className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Pusat Kontrol</span>
            </div>
            <div className="flex flex-col gap-2">
              <Link to="/admin/panduan" className="text-[11px] font-bold text-[var(--text-muted)] hover:text-red-400 transition-colors flex items-center justify-between group/link">
                FAQ & Panduan <ChevronRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" />
              </Link>
            </div>
          </div>

          {/* Tombol Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 w-full px-5 py-4 rounded-[1.5rem] text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 border border-transparent hover:border-red-500/20 group font-bold text-sm"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
