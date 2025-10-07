import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import type { Page } from './types';

import BottomNav from './components/layout/BottomNav';
import DashboardScreen from './screens/DashboardScreen';
import SalesScreen from './screens/SalesScreen';
import InventoryScreen from './screens/InventoryScreen';
import ExpensesScreen from './screens/ExpensesScreen';
import ContactsScreen from './screens/ContactsScreen';
import SettingsScreen from './screens/SettingsScreen';
import DebtsScreen from './screens/DebtsScreen';

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


const App: React.FC = () => {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
};

export default App;