import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center glass-panel p-8 rounded-3xl shadow-2xl">
        <div className="inline-flex p-4 rounded-2xl bg-brand-500/10 text-brand-500 mb-4">
          <HelpCircle className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          404 - Page Not Found
        </h1>
        
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2">
          The requested page or telemetry resource does not exist.
        </p>

        <div className="mt-6 flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
