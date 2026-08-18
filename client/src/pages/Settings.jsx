import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Settings as SettingsIcon, User, Shield, Radio, Check, Key, Server, RefreshCw } from 'lucide-react';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { status, latency } = useSocket();

  const [name, setName] = useState(user?.name || '');
  const [saved, setSaved] = useState(false);

  const handleProfileSave = (e) => {
    e.preventDefault();
    updateUser({ name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const rolePermissions = [
    {
      role: 'admin',
      label: 'Administrator',
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/30',
      description: 'Unrestricted read/write access. Can create, modify, and delete telemetry records and configure all telemetry nodes.',
      access: ['View Dashboard', 'Real-time WebSocket Stream', 'Export CSV Data', 'Create Records', 'Edit Records', 'Delete Records'],
    },
    {
      role: 'analyst',
      label: 'Analyst',
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
      description: 'Analytics, filtering, inspection, and report export capabilities without record modification privileges.',
      access: ['View Dashboard', 'Real-time WebSocket Stream', 'Export CSV Data', 'Time-series Trends', 'Category Analytics'],
    },
    {
      role: 'viewer',
      label: 'Viewer',
      color: 'text-gray-500 bg-gray-500/10 border-gray-500/30',
      description: 'Read-only access to dashboard KPIs and telemetry feed.',
      access: ['View Dashboard', 'Real-time WebSocket Stream'],
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
          System & Profile Settings
          <span className="p-1 rounded-full bg-brand-500/20 text-brand-500">
            <SettingsIcon className="w-4 h-4" />
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your account profile, inspect role-based privileges, and review live WebSocket telemetry health
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="glass-panel p-6 rounded-2xl lg:col-span-2">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-dark-border mb-5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                User Profile
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Personal credentials & details
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-dark-surface/50 border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-500 cursor-not-allowed font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Assigned Role
              </label>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 font-mono text-xs font-bold uppercase">
                <Shield className="w-3.5 h-3.5" />
                {user?.role}
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    Saved Successfully!
                  </>
                ) : (
                  'Update Profile'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live Engine Diagnostic */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-dark-border mb-4">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Telemetry Engine
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Real-time connection stats
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border">
                <span className="text-gray-500">WebSocket Status:</span>
                <span className="font-bold text-emerald-500 uppercase">{status}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border">
                <span className="text-gray-500">Ping Latency:</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">
                  {latency ? `${latency} ms` : 'Active'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-dark-surface border border-gray-100 dark:border-dark-border">
                <span className="text-gray-500">Stream Interval:</span>
                <span className="font-mono font-bold text-brand-500">3,000 ms</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border flex items-center justify-between text-[11px] text-gray-400">
            <span>Node.js / Express / Socket.io</span>
            <span>MongoDB v8</span>
          </div>
        </div>
      </div>

      {/* Role-Based Access Control Matrix */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-dark-border mb-6">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Role-Based Access Control (RBAC) Specification
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Overview of security tiers and permission sets
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rolePermissions.map((rp) => (
            <div
              key={rp.role}
              className={`p-5 rounded-2xl border transition-all ${
                user?.role === rp.role
                  ? 'border-brand-500/50 bg-brand-500/5 shadow-md'
                  : 'border-gray-200 dark:border-dark-border bg-gray-50/50 dark:bg-dark-surface/40'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${rp.color}`}>
                  {rp.label}
                </span>
                {user?.role === rp.role && (
                  <span className="text-[10px] font-bold text-brand-500">CURRENT</span>
                )}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-4 min-h-[48px]">
                {rp.description}
              </p>
              <div className="space-y-1.5 border-t border-gray-100 dark:border-dark-border pt-3">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Allowed Capabilities:
                </span>
                {rp.access.map((acc, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{acc}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
