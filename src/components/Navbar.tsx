import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { formatMonthYear } from '../utils/formatters';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Settings,
  LogOut,
  Bell,
} from 'lucide-react';
import { BounceFinLogo } from './BounceFinLogo';

interface NavbarProps {
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSettings }) => {
  const { user, logout } = useAuth();
  const { selectedYearMonth, prevMonth, nextMonth, goToCurrentMonth } = useFinance();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Mobile / Tablet Logo (hidden on large screen where Sidebar is displayed) */}
        <div className="flex items-center gap-3 lg:hidden">
          <BounceFinLogo size="sm" showText={true} showSlogan={true} />
        </div>

        {/* Desktop Breadcrumb/Status indicator */}
        <div className="hidden lg:flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Ambiente:</span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100/90 px-2.5 py-1 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Gestão Local e Segura</span>
          </div>
        </div>

        {/* Month Selector in Header */}
        <div className="flex items-center gap-1 sm:gap-2 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
          <button
            onClick={prevMonth}
            title="Mês anterior"
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all shadow-none hover:shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={goToCurrentMonth}
            title="Clique para ir ao mês atual"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-slate-800 hover:text-emerald-700 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span className="capitalize">{formatMonthYear(selectedYearMonth)}</span>
          </button>

          <button
            onClick={nextMonth}
            title="Próximo mês"
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all shadow-none hover:shadow-xs"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Actions & Profile (Mobile & Tablet visible, plus desktop shortcuts) */}
        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenSettings}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 text-left"
                title="Abrir Configurações e Perfil"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/20"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:block lg:hidden">
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {user.name.split(' ')[0]}
                  </p>
                </div>
              </button>

              <button
                onClick={logout}
                title="Sair da Conta"
                className="lg:hidden p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
