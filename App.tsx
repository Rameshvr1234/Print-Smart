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
    <div className="flex items-center gap-4">
      <div className="text-right">
        <p className="text-sm font-medium text-gray-500">Logged in as</p>
        <p className="text-lg font-bold text-gray-800">{loggedInUserRole}</p>
      </div>
      <button onClick={() => setLoggedInUserRole(null)} title="Logout" className="text-gray-500 hover:text-brand-orange p-2 rounded-full hover:bg-gray-100 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
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
    <div className="min-h-screen bg-ui-background font-sans text-gray-800">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="text-3xl font-black text-brand-blue">Print Smart</h1>
            <UserInfo />
        </div>
      </header>

      <div className="container mx-auto p-4 md:p-6 space-y-6 pb-24 md:pb-6">
        {/* Mimicking the red banner from the image */}
        <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg text-center font-semibold">
          <p>This is a demo application for internal production tracking.</p>
        </div>

        {/* Mimicking the "Your Address" block */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold text-gray-500">Quick Look</h2>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-5xl font-bold text-gray-800 tracking-wider">
              Today's Dashboard
            </p>
          </div>
          <p className="text-gray-600 mt-2">Key metrics will be displayed here in a future update.</p>
        </div>

        {/* Desktop Tab Navigation */}
        <nav className="hidden md:flex bg-white p-2 rounded-lg shadow-lg items-center gap-2 overflow-x-auto">
            {visibleScreens.map(item => (
                <button
                    key={item.screen}
                    onClick={() => setActiveScreen(item.screen)}
                    className={`flex items-center gap-2 px-5 py-3 text-lg font-bold rounded-lg transition-colors duration-200 whitespace-nowrap ${
                        activeScreen === item.screen
                        ? 'bg-brand-orange text-white shadow-md'
                        : 'text-gray-600 hover:bg-orange-50'
                    }`}
                >
                    {item.icon}
                    <span>{item.screen}</span>
                </button>
            ))}
        </nav>

        <main>
            {renderScreen()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around z-50">
          {visibleScreens.map(item => (
              <button
                  key={item.screen}
                  onClick={() => setActiveScreen(item.screen)}
                  className={`flex flex-col items-center justify-center gap-1 w-full p-2 transition-colors duration-200 ${
                      activeScreen === item.screen
                      ? 'text-brand-orange'
                      : 'text-gray-500 hover:bg-orange-50'
                  }`}
                  aria-label={item.screen}
              >
                  {item.icon}
                  <span className="text-xs font-medium">{item.screen}</span>
              </button>
          ))}
      </nav>
    </div>
  );
};

export default App;