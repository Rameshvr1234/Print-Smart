import React, { useState } from 'react';
import { Screen } from './constants';
import { UserRole } from './types';
import DailyEntryScreen from './screens/DailyEntry';
import ClientsScreen from './screens/Clients';
import ItemsStockScreen from './screens/ItemsStock';
import ReportsScreen from './screens/Reports';
import AccountsScreen from './screens/Accounts';
import DashboardScreen from './screens/Dashboard';
import LoginScreen from './screens/Login';

const App: React.FC = () => {
  const [loggedInUserRole, setLoggedInUserRole] = useState<UserRole | null>(null);
  const [activeScreen, setActiveScreen] = useState<Screen>(Screen.DailyEntry);

  if (!loggedInUserRole) {
    return <LoginScreen onLogin={setLoggedInUserRole} />;
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case Screen.DailyEntry:
        return <DailyEntryScreen userRole={loggedInUserRole} />;
      case Screen.Clients:
        return <ClientsScreen />;
      case Screen.ItemsStock:
        return <ItemsStockScreen />;
      case Screen.Reports:
        return <ReportsScreen />;
      case Screen.Accounts:
        return <AccountsScreen loggedInUserRole={loggedInUserRole} />;
      case Screen.Dashboard:
        return <DashboardScreen />;
      default:
        return <DailyEntryScreen userRole={loggedInUserRole} />;
    }
  };

  const UserInfo: React.FC = () => (
    <div className="flex items-center gap-3 md:gap-4">
      <div className="hidden sm:flex items-center gap-3 bg-white/50 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/30 shadow-md">
        <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center text-white font-bold text-sm">
          {loggedInUserRole?.charAt(0)}
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-gray-500">Logged in as</p>
          <p className="text-sm font-bold text-gray-800">{loggedInUserRole}</p>
        </div>
      </div>
      <button
        onClick={() => setLoggedInUserRole(null)}
        title="Logout"
        className="flex items-center gap-2 text-gray-600 hover:text-brand-orange-500 bg-white/50 hover:bg-white px-3 md:px-4 py-2.5 rounded-xl border border-white/30 hover:border-brand-orange-200 hover:shadow-md transition-all duration-300 group"
      >
        <svg className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span className="hidden md:inline text-sm font-semibold">Logout</span>
      </button>
    </div>
  );
  
  const screenConfig = [
    { screen: Screen.DailyEntry, icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> },
    { screen: Screen.Dashboard, icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20V16"></path></svg> },
    { screen: Screen.Accounts, icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg> },
    { screen: Screen.Clients, icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> },
    { screen: Screen.ItemsStock, icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg> },
    { screen: Screen.Reports, icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"></path><path d="M18.7 8a6 6 0 0 0-6-6"></path><path d="M13 13a6 6 0 0 0 6 6"></path></svg> },
  ];

  const restrictedScreens: Screen[] = [Screen.Accounts, Screen.Dashboard];
  const visibleScreens = screenConfig.filter(s => 
    !restrictedScreens.includes(s.screen) || (loggedInUserRole === 'Admin' || loggedInUserRole === 'Accounts')
  );

  return (
    <div className="min-h-screen bg-ui-background font-sans text-gray-800 gradient-mesh">
      {/* Modern header with glassmorphism */}
      <header className="glass sticky top-0 z-50 shadow-lg border-b border-white/20 animate-slide-down">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-orange flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-brand-orange-500 to-brand-blue-600 bg-clip-text text-transparent">
                Print Smart
              </h1>
            </div>

            {/* User info */}
            <UserInfo />
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6 pb-24 md:pb-8 animate-fade-in">
        {/* Desktop Tab Navigation with modern design */}
        <nav className="hidden md:flex glass rounded-2xl p-2 shadow-card items-center gap-2 overflow-x-auto border border-white/20">
          {visibleScreens.map(item => (
            <button
              key={item.screen}
              onClick={() => setActiveScreen(item.screen)}
              className={`flex items-center gap-2 px-5 py-3.5 text-base font-bold rounded-xl transition-all duration-300 whitespace-nowrap relative overflow-hidden group ${
                activeScreen === item.screen
                  ? 'gradient-orange text-white shadow-lg scale-105'
                  : 'text-gray-700 hover:bg-white/50 hover:shadow-md'
              }`}
            >
              <div className={`transition-transform duration-300 ${activeScreen === item.screen ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </div>
              <span>{item.screen}</span>
              {activeScreen === item.screen && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-full"></div>
              )}
            </button>
          ))}
        </nav>

        {/* Main content area */}
        <main className="animate-slide-up">
          {renderScreen()}
        </main>
      </div>

      {/* Modern Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/20 z-50 shadow-2xl">
        <div className="flex justify-around">
          {visibleScreens.map(item => (
            <button
              key={item.screen}
              onClick={() => setActiveScreen(item.screen)}
              className={`flex flex-col items-center justify-center gap-1.5 w-full py-3 px-2 transition-all duration-300 relative ${
                activeScreen === item.screen
                  ? 'text-brand-orange-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-label={item.screen}
            >
              <div className={`transition-all duration-300 ${activeScreen === item.screen ? 'scale-110' : ''}`}>
                {item.icon}
              </div>
              <span className={`text-xs font-semibold transition-all duration-300 ${
                activeScreen === item.screen ? 'text-brand-orange-500' : 'text-gray-600'
              }`}>
                {item.screen}
              </span>
              {activeScreen === item.screen && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 gradient-orange rounded-b-full"></div>
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default App;