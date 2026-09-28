import React from 'react';
import { ActiveTab } from '../types';
import {
  LayoutDashboard,
  CalendarDays,
  Repeat,
  Calculator,
  Target,
  Settings,
} from 'lucide-react';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab }) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendário', icon: CalendarDays },
    { id: 'bills', label: 'Contas Fixas', icon: Repeat },
    { id: 'simulator', label: 'Simulador', icon: Calculator },
    { id: 'plannings', label: 'Planejar', icon: Target },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <>
      {/* Tablet horizontal top bar (hidden on mobile and hidden on lg desktop where sidebar operates) */}
      <nav className="hidden sm:block lg:hidden bg-white border-b border-slate-200 sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar (Ultra-clean modern fintech bottom bar) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 pb-safe">
        <div className="grid grid-cols-6 h-16">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className="flex flex-col items-center justify-center gap-1 transition-colors relative"
              >
                {isActive && (
                  <span className="absolute top-0 w-8 h-0.5 bg-emerald-500 rounded-full" />
                )}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>
                <span
                  className={`text-[10px] tracking-tight leading-none ${
                    isActive ? 'font-bold text-slate-900' : 'font-medium text-slate-400'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
