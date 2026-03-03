import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

const NavLayout = ({ children }) => {
  const location = useLocation();

  // Pages where nav should be hidden (already handled in BottomNav, but for NavLayout we need it too)
  const hideNav = ['/', '/login', '/register', '/recovery'].includes(location.pathname) || 
                  location.pathname.startsWith('/admin');

  if (hideNav) {
    return <div className="min-h-screen bg-[var(--bg)]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Desktop Layout */}
      <div className="hidden md:flex">
        <Sidebar />
        <main className="flex-1 ml-64 min-h-screen relative overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -mr-64 -mt-64" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -ml-32 -mb-32" />
          
          <div className="relative max-w-6xl mx-auto p-8 lg:p-12">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <main className="min-h-screen pb-24">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
};

export default NavLayout;
