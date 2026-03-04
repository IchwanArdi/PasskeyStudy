import AdminSidebar from './AdminSidebar';
import AdminBottomNav from './AdminBottomNav';

const AdminNavLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Desktop Layout */}
      <div className="hidden md:flex">
        <AdminSidebar />
        <main className="flex-1 ml-64 min-h-screen relative overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px] -mr-64 -mt-64" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-yellow-500/5 rounded-full blur-[100px] -ml-32 -mb-32" />
          
          <div className="relative max-w-6xl mx-auto p-4 sm:p-8 lg:p-12">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <main className="min-h-screen pb-24 relative overflow-hidden">
          {/* Mobile Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] -mr-32 -mt-32" />
          {children}
        </main>
        <AdminBottomNav />
      </div>
    </div>
  );
};

export default AdminNavLayout;
