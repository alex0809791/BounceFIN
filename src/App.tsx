import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { ActiveTab } from './types';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { CalendarView } from './components/CalendarView';
import { FixedBillsView } from './components/FixedBillsView';
import { SimulatorView } from './components/SimulatorView';
import { PlanningsView } from './components/PlanningsView';
import { SettingsView } from './components/SettingsView';
import { AuthView } from './components/AuthView';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // If user is not logged in, show modern Auth screen
  if (!user) {
    return <AuthView />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900">
      {/* 1. Desktop Elegant Sidebar (hidden on tablet/mobile) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSettings={() => setActiveTab('settings')}
      />

      {/* 2. Main Content Flow Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-16 sm:pb-0">
        {/* Top Header with Month Navigator and User Avatar */}
        <Navbar onOpenSettings={() => setActiveTab('settings')} />

        {/* Tablet Horizontal Tab bar (visible only on small tablets, hidden on desktop and mobile) */}
        <Navigation activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Dynamic View Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigateTab={tab => setActiveTab(tab)}
              onOpenAddBill={() => setActiveTab('bills')}
            />
          )}

          {activeTab === 'calendar' && <CalendarView />}

          {activeTab === 'bills' && <FixedBillsView />}

          {activeTab === 'simulator' && <SimulatorView />}

          {activeTab === 'plannings' && <PlanningsView />}

          {activeTab === 'settings' && <SettingsView />}
        </main>

        {/* Minimal Subtle Footer */}
        <footer className="bg-white border-t border-slate-200/80 py-4 text-center text-xs text-slate-400">
          <p>BounceFIN • Organize seu dinheiro. Recupere o controle.</p>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <MainApp />
      </FinanceProvider>
    </AuthProvider>
  );
}
