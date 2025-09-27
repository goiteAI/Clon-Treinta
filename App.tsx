import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import type { Page } from './types';

import BottomNav from './components/layout/BottomNav';
import DashboardScreen from './screens/DashboardScreen';
import SalesScreen from './screens/SalesScreen';
import InventoryScreen from './screens/InventoryScreen';
import ExpensesScreen from './screens/ExpensesScreen';
import ContactsScreen from './screens/ContactsScreen';
import SettingsScreen from './screens/SettingsScreen';
import DebtsScreen from './screens/DebtsScreen';
import AuthScreen from './screens/AuthScreen';

// This component contains the main app view after a user has logged in.
const MainApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'sales':
        return <SalesScreen />;
      case 'inventory':
        return <InventoryScreen />;
      case 'expenses':
        return <ExpensesScreen />;
      case 'contacts':
        return <ContactsScreen />;
       case 'settings':
        return <SettingsScreen />;
       case 'debts':
        return <DebtsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <main className="pb-16">
          {renderContent()}
        </main>
        <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </div>
  );
};

// This component checks for an active user session and routes accordingly.
const AppContent: React.FC = () => {
    const { currentUser } = useAppContext();
    if (currentUser === undefined) {
        // Still determining auth state, show a loader
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
            </div>
        )
    }
    return currentUser ? <MainApp /> : <AuthScreen />;
}


const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;