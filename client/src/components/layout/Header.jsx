import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import ConnectionIndicator from '../common/ConnectionIndicator';
import {
  Sun,
  Moon,
  Bell,
  LogOut,
  User,
  Menu,
  Shield,
  CheckCircle,
  AlertTriangle,
  X,
} from 'lucide-react';

const Header = ({ onToggleMobileSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { alerts, clearAlerts, dismissAlert } = useSocket();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case 'analyst':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'viewer':
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/30';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 glass-panel border-b border-gray-200/80 dark:border-dark-border/80 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left side: Mobile Menu toggle & Title breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-white">PulseStream</span>
          <span>/</span>
          <span className="capitalize">{user?.role || 'Admin'} Console</span>
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Live Socket Status Badge */}
        <ConnectionIndicator />

        {/* Dark / Light Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        {/* Real-time Alerts Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsDropdown((prev) => !prev)}
            className="relative p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
          >
            <Bell className="w-4 h-4" />
            {alerts.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </button>

          {/* Alerts Dropdown Drawer */}
          {showAlertsDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel shadow-2xl p-4 z-50 animate-slide-up border border-gray-200 dark:border-dark-border">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-dark-border">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    Live Alerts ({alerts.length})
                  </span>
                </div>
                {alerts.length > 0 && (
                  <button
                    onClick={clearAlerts}
                    className="text-[11px] text-gray-500 hover:text-brand-500 font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-dark-border/40 my-2">
                {alerts.length === 0 ? (
                  <div className="py-8 text-center text-gray-400">
                    <CheckCircle className="w-6 h-6 mx-auto mb-1.5 text-emerald-500/70" />
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      All systems operating normally
                    </p>
                    <p className="text-[11px] text-gray-500">No active anomaly triggers</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className="py-2.5 flex items-start gap-2.5 group">
                      <div className="p-1 rounded-md bg-rose-500/10 text-rose-500 shrink-0 mt-0.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-900 dark:text-white font-mono">
                            {alert.deviceId}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 font-medium line-clamp-2">
                          {alert.message}
                        </p>
                      </div>
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu((prev) => !prev)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
          >
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'User'}`}
              alt={user?.name}
              className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 object-cover"
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[120px]">
                {user?.name}
              </span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold uppercase tracking-wider ${getRoleBadge(user?.role)}`}>
                {user?.role}
              </span>
            </div>
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel shadow-2xl p-2 z-50 animate-slide-up border border-gray-200 dark:border-dark-border">
              <div className="px-3 py-2 border-b border-gray-100 dark:border-dark-border">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-[11px] text-gray-500 truncate font-mono">
                  {user?.email}
                </p>
              </div>

              <div className="py-1">
                <div className="px-3 py-1.5 flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-brand-500" />
                    Role
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${getRoleBadge(user?.role)}`}>
                    {user?.role}
                  </span>
                </div>
              </div>

              <div className="pt-1 border-t border-gray-100 dark:border-dark-border">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
