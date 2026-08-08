import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Droplets, Menu, X, LogOut, ChevronDown, Bell, Search, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleTranslate from '../components/GoogleTranslate';
import ChatbotWidget from '../components/ChatbotWidget';
import type { ChatRole } from '../api/chatbot';

interface NavItem {
  label: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  path: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

interface DashboardLayoutProps {
  navItems: NavItem[];
  navSections?: NavSection[];
  role: string;
  basePath: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  navItems,
  navSections,
  role,
  basePath,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const sections: NavSection[] = useMemo(
    () => navSections ?? [{ items: navItems }],
    [navSections, navItems]
  );

  const chatbotRole: ChatRole = useMemo(() => {
    if (role === 'Main Admin' || user?.role === 'MAIN_ADMIN') return 'MAIN_ADMIN';
    if (role === 'Community Admin' || user?.role === 'COMMUNITY_ADMIN') return 'COMMUNITY_ADMIN';
    return 'RESIDENT';
  }, [role, user?.role]);

  const currentPage = useMemo(() => {
    const match = navItems.find(item =>
      item.path === basePath
        ? location.pathname === basePath
        : location.pathname.startsWith(item.path)
    );
    return match?.label ?? 'Dashboard';
  }, [navItems, basePath, location.pathname]);

  useEffect(() => {
    setSidebarOpen(false);
    setUserMenuOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const close = () => { setUserMenuOpen(false); setNotifOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <>
      <div className="saas-sidebar-brand">
        <div className="saas-sidebar-logo">
          <Droplets size={22} />
        </div>
        <div className="saas-sidebar-brand-text">
          <span className="saas-sidebar-brand-name">AquaTrack</span>
          <span className="saas-sidebar-brand-role">{role}</span>
        </div>
      </div>

      <nav className="saas-sidebar-nav">
        {sections.map((section, si) => (
          <div key={si} className="saas-nav-section">
            {section.title && (
              <p className="saas-nav-section-title">{section.title}</p>
            )}
            {section.items.map(({ label, icon: Icon, path }) => (
              <NavLink
                key={path}
                to={path}
                end={path === basePath}
                className={({ isActive }) =>
                  `saas-nav-link ${isActive ? 'saas-nav-link--active' : ''}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="saas-sidebar-footer">
        <div className="saas-sidebar-user">
          <div className="saas-sidebar-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="saas-sidebar-user-info">
            <span className="saas-sidebar-user-name">{user?.name}</span>
            <span className="saas-sidebar-user-email">{user?.email}</span>
          </div>
        </div>
        <button onClick={handleLogout} className="saas-nav-link saas-nav-link--logout">
          <LogOut size={18} />
          <span>Sign out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="saas-shell">
      <aside className="saas-sidebar">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="saas-mobile-drawer">
          <div className="saas-mobile-backdrop" onClick={() => setSidebarOpen(false)} />
          <aside className="saas-mobile-sidebar">
            <button
              className="saas-mobile-close"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="saas-main">
        <header className="saas-topbar">
          <div className="saas-topbar-left">
            <button
              className="saas-hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="saas-breadcrumb">
              <span className="saas-breadcrumb-root">AquaTrack</span>
              <ChevronRight size={14} className="saas-breadcrumb-sep" />
              <span className="saas-breadcrumb-current">{currentPage}</span>
            </div>
          </div>

          <div className="saas-topbar-search">
            <Search size={16} className="saas-search-icon" />
            <input
              type="text"
              placeholder="Search residents, bills, units..."
              className="saas-search-input"
            />
          </div>

          <div className="saas-topbar-right">
            <GoogleTranslate />
            <div className="saas-notif-wrap" onClick={e => e.stopPropagation()}>
              <button
                className="saas-icon-btn"
                title="Notifications"
                onClick={() => setNotifOpen(v => !v)}
              >
                <Bell size={18} />
                <span className="saas-icon-btn-dot" />
              </button>
              {notifOpen && (
                <div className="saas-notif-dropdown">
                  <div className="saas-notif-header">Notifications</div>
                  <div className="saas-notif-item">
                    <span className="saas-notif-dot saas-notif-dot--info" />
                    <div>
                      <p className="saas-notif-text">Billing cycle updated</p>
                      <p className="saas-notif-time">2 hours ago</p>
                    </div>
                  </div>
                  <div className="saas-notif-item">
                    <span className="saas-notif-dot saas-notif-dot--warn" />
                    <div>
                      <p className="saas-notif-text">High usage alert detected</p>
                      <p className="saas-notif-time">5 hours ago</p>
                    </div>
                  </div>
                  <div className="saas-notif-empty">View all in Alerts</div>
                </div>
              )}
            </div>

            <div className="saas-profile-wrap" onClick={e => e.stopPropagation()}>
              <button
                className="saas-profile-btn"
                onClick={() => setUserMenuOpen(v => !v)}
              >
                <div className="saas-profile-avatar">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="saas-profile-info">
                  <span className="saas-profile-name">{user?.name}</span>
                  <span className="saas-profile-role">{role}</span>
                </div>
                <ChevronDown size={14} />
              </button>
              {userMenuOpen && (
                <div className="saas-profile-dropdown">
                  <div className="saas-profile-dropdown-header">
                    <p className="saas-profile-name">{user?.name}</p>
                    <p className="saas-profile-email">{user?.email}</p>
                  </div>
                  <button onClick={handleLogout} className="saas-profile-logout">
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="saas-content">
          <Outlet />
        </main>

        {/* Global Dashboard Chatbot */}
        <ChatbotWidget role={chatbotRole} />
      </div>
    </div>
  );
};

export default DashboardLayout;
