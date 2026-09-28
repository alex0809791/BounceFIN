import React from 'react';
import { ActiveTab } from '../types';
import {
  LayoutDashboard,
  CalendarDays,
  Repeat,
  Calculator,
  Target,
  Settings,
  LogOut,
  ChevronRight,
  TrendingUp,
  Shield,
} from 'lucide-react';
import { BounceFinLogo } from './BounceFinLogo';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettings,
}) => {
  const { user, logout } = useAuth();

  const navItems: { id: ActiveTab; label: string; icon: React.ElementType; description: string }[] = [
    {
      id: 'dashboard',
      label: 'Visão Geral',
      icon: LayoutDashboard,
      description: 'Saldo e métricas do mês',
    },
    {
      id: 'calendar',
      label: 'Calendário',
      icon: CalendarDays,
      description: 'Vencimentos diários',
    },
    {
      id: 'bills',
      label: 'Contas Fixas',
      icon: Repeat,
      description: 'Despesas recorrentes',
    },
    {
      id: 'simulator',
      label: 'Simular Contas',
      icon: Calculator,
      description: 'Testar novos gastos',
    },
    {
      id: 'plannings',
      label: 'Planejamentos',
      icon: Target,
      description: 'Metas e orçamentos',
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      description: 'Segurança, dados e perfil',
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 min-h-screen sticky top-0 shrink-0 z-40 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-100">
        <BounceFinLogo size="md" showText={true} showSlogan={true} />
        <p className="text-[11px] font-semibold text-emerald-600 mt-2 tracking-tight">
          Organize seu dinheiro. Recupere o controle.
        </p>
      </div>

      {/* Main Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navegação Principal
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all group ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-100 text-slate-500 group-hover:text-slate-800 group-hover:bg-slate-200/70'
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="text-left">
                  <div className="leading-snug">{item.label}</div>
                  <div
                    className={`text-[10px] font-normal transition-colors ${
                      isActive ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
              </div>
              <ChevronRight
                className={`w-4 h-4 transition-transform ${
                  isActive
                    ? 'text-emerald-400 translate-x-0.5'
                    : 'text-slate-300 opacity-0 group-hover:opacity-100'
                }`}
              />
            </button>
          );
        })}
      </nav>

      {/* Security and Privacy Assurance Kicker */}
      <div className="px-4 py-3 mx-4 mb-4 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          <Shield className="w-3.5 h-3.5" />
        </div>
        <div className="text-[11px] leading-tight text-slate-500">
          <span className="font-bold text-slate-700 block">Privacidade Total</span>
          Dados 100% criptografados e salvos localmente.
        </div>
      </div>

      {/* User Footer Profile & Logout */}
      {user && (
        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-3 text-left p-1.5 rounded-xl hover:bg-slate-50 transition-colors flex-1 min-w-0"
              title="Abrir configurações e perfil"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/20 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
              </div>
            </button>

            <button
              onClick={logout}
              title="Sair da Conta"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
