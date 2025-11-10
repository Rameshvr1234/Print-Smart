import React, { useState } from 'react';
import { Screen } from './constants';
import { UserRole } from './types';
import DailyEntryScreen from './screens/DailyEntry';
import ClientsScreen from './screens/Clients';
import ItemsStockScreen from './screens/ItemsStock';
import ReportsScreen from './screens/Reports';

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<Screen>(Screen.DailyEntry);
  const [userRole, setUserRole] = useState<UserRole>('Admin');

  const renderScreen = () => {
    switch (activeScreen) {
      case Screen.DailyEntry:
        return <DailyEntryScreen userRole={userRole} />;
      case Screen.Clients:
        return <ClientsScreen />;
      case Screen.ItemsStock:
        return <ItemsStockScreen />;
      case Screen.Reports:
        return <ReportsScreen />;
      default:
        return <DailyEntryScreen userRole={userRole} />;
    }
  };

  const NavButton: React.FC<{ screen: Screen, icon: React.ReactElement }> = ({ screen, icon }) => {
    const isActive = activeScreen === screen;
    return (
        <button
            onClick={() => setActiveScreen(screen)}
            className={`flex flex-row items-center justify-start w-full gap-3 px-4 py-3 text-lg font-bold rounded-lg transition-colors duration-200 ${
                isActive
                ? 'bg-brand-orange text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
        >
            {icon}
            <span>{screen}</span>
        </button>
    );
  }

  const MobileNavButton: React.FC<{ screen: Screen, icon: React.ReactElement }> = ({ screen, icon }) => {
    const isActive = activeScreen === screen;
    return (
      <button
        onClick={() => setActiveScreen(screen)}
        className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors duration-200 ${
          isActive ? 'text-brand-orange' : 'text-gray-500 hover:text-brand-orange'
        }`}
      >
        {icon}
        <span className="text-xs font-medium">{screen}</span>
      </button>
    );
  };


  const UserRoleSwitcher: React.FC = () => (
    <div className="pt-4 border-t border-gray-200">
        <label className="block text-sm font-medium text-gray-500 mb-2">User Role</label>
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button 
                onClick={() => setUserRole('Admin')} 
                className={`w-1/2 py-2 text-center rounded-md text-lg font-semibold transition-all ${userRole === 'Admin' ? 'bg-white text-brand-orange shadow' : 'text-gray-600'}`}
            >
                Admin
            </button>
             <button 
                onClick={() => setUserRole('Designer')} 
                className={`w-1/2 py-2 text-center rounded-md text-lg font-semibold transition-all ${userRole === 'Designer' ? 'bg-white text-brand-orange shadow' : 'text-gray-600'}`}
            >
                Designer
            </button>
        </div>
    </div>
  );
  
  const screenConfig = [
    { screen: Screen.DailyEntry, icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> },
    { screen: Screen.Clients, icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> },
    { screen: Screen.ItemsStock, icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg> },
    { screen: Screen.Reports, icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"></path><path d="M18.7 8a6 6 0 0 0-6-6"></path><path d="M13 13a6 6 0 0 0 6 6"></path></svg> },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen font-sans bg-gray-50">
      {/* --- Desktop Sidebar --- */}
      <nav className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-4 gap-4">
        <h1 className="text-2xl font-black text-brand-blue mb-4">Graphic Solutions</h1>
        <div className="flex flex-col gap-4 w-full">
            {screenConfig.map(item => <NavButton key={item.screen} screen={item.screen} icon={item.icon} />)}
        </div>
        <div className="mt-auto">
            <UserRoleSwitcher />
        </div>
      </nav>
      
      {/* Wrapper for Mobile Header and Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* --- Mobile Header --- */}
        <header className="md:hidden w-full bg-white border-b border-gray-200 p-4 flex items-center shadow-sm">
            <h1 className="text-xl font-black text-brand-blue">Graphic Solutions</h1>
        </header>

        {/* --- Main Content --- */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
            {renderScreen()}
        </main>
      </div>

      {/* --- Mobile Bottom Nav Bar --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex justify-around items-center shadow-[0_-2px_5px_rgba(0,0,0,0.05)] z-40">
        {screenConfig.map(item => <MobileNavButton key={item.screen} screen={item.screen} icon={item.icon} />)}
      </nav>
    </div>
  );
};

export default App;