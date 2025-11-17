import React, { useState } from 'react';
import { UserRole } from '../types';

interface LoginScreenProps {
  onLogin: (role: UserRole) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // WARNING: Hardcoded credentials - FOR DEMO/DEVELOPMENT ONLY
    // In production, implement proper authentication with backend API
    // Default credentials: admin/admin, print01/print01, accounts/accounts
    if (username === 'admin' && password === 'admin') {
      onLogin('Admin');
    } else if (username === 'print01' && password === 'print01') {
      onLogin('Designer');
    } else if (username === 'accounts' && password === 'accounts') {
      onLogin('Accounts');
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen gradient-mesh relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-brand-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md px-6 relative z-10 animate-fade-in">
        {/* Modern glass card */}
        <div className="glass backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 space-y-8 border border-white/20">
          {/* Logo and title */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-orange shadow-lg mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>

            <h1 className="text-5xl font-black bg-gradient-to-r from-brand-orange-500 via-brand-orange-600 to-brand-blue-600 bg-clip-text text-transparent">
              Print Smart
            </h1>
            <p className="text-gray-600 font-medium text-lg">
              Production Tracker
            </p>
          </div>

          {/* Login form */}
          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="bg-danger-light border-l-4 border-danger text-danger-dark px-4 py-3 rounded-lg animate-slide-down">
                <p className="font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Username input */}
              <div className="group">
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-brand-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    className="block w-full pl-12 pr-4 py-3.5 bg-white/50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-orange-500 focus:ring-4 focus:ring-brand-orange-100 transition-all text-base font-medium"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              {/* Password input */}
              <div className="group">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-brand-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="block w-full pl-12 pr-4 py-3.5 bg-white/50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-orange-500 focus:ring-4 focus:ring-brand-orange-100 transition-all text-base font-medium"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full gradient-orange text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-lg focus:outline-none focus:ring-4 focus:ring-brand-orange-200 mt-6"
            >
              <span className="flex items-center justify-center gap-2">
                Sign In
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-center text-xs text-gray-500 font-medium">
              Demo credentials: admin/admin • print01/print01 • accounts/accounts
            </p>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center mt-6 text-sm text-gray-600 font-medium">
          Secure Production Tracking System
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;