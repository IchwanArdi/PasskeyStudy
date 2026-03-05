import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  FileText,
  Bell,
  Users,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  User,
} from "lucide-react";

const navItems = [
  { to: "/admin", icon: Home, label: "Beranda" },
  { to: "/admin/pengajuan", icon: FileText, label: "Pengajuan" },
  { to: "/admin/pengaduan", icon: ShieldAlert, label: "Pengaduan" },
  { to: "/admin/pengumuman", icon: Bell, label: "Pengumuman" },
  { to: "/admin/users", icon: Users, label: "Warga" },
  { to: "/admin/profile", icon: User, label: "Profil" },
];

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-[var(--bg)] border-r border-white/5 z-50">
      <div className="p-6 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
          <ShieldCheck className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-[var(--heading-from)] to-[var(--heading-to)] bg-clip-text text-transparent">
            Panel Admin
          </h1>
          <p className="text-[10px] text-red-400 font-medium tracking-wider uppercase">
            Desa Karangpucung
          </p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
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
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <NavIcon
                className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? "text-red-400" : ""}`}
              />
              <span className="font-medium">{label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Keluar</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
