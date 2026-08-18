import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';

const Unauthorized = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center glass-panel p-8 rounded-3xl shadow-2xl border border-rose-500/20">
        <div className="inline-flex p-4 rounded-2xl bg-rose-500/10 text-rose-500 mb-4 animate-bounce">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          403 - Access Restricted
        </h1>
        
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2">
          Your current account role (<span className="font-bold text-rose-500 uppercase">{user?.role}</span>) does not have sufficient clearance to access this administrative resource.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-100 dark:bg-dark-surface hover:bg-gray-200 dark:hover:bg-dark-border text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            Switch Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
