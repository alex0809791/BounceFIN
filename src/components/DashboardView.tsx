import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatMonthYear, parseCurrencyInput } from '../utils/formatters';
import {
  Wallet,
  TrendingDown,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Edit3,
  CalendarCheck,
  PlusCircle,
  AlertCircle,
  Check,
  Sparkles,
  ChevronRight,
  Calendar,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface DashboardViewProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenAddBill: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenAddBill,
}) => {
  const { user } = useAuth();
  const {
    salary,
    updateSalary,
    selectedYearMonth,
    monthOccurrences,
    totalFixedBillsAmount,
    totalPaidAmount,
    totalPendingAmount,
    availableAfterBills,
    togglePayment,
    plannings,
  } = useFinance();

  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [salaryInput, setSalaryInput] = useState(salary > 0 ? salary.toString() : '');

  const handleSaveSalary = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseCurrencyInput(salaryInput);
    updateSalary(val);
    setIsEditingSalary(false);
  };

  const handleStartEditSalary = () => {
    setSalaryInput(salary > 0 ? salary.toString() : '');
    setIsEditingSalary(true);
  };

  // Metrics calculations
  const billRatio = salary > 0 ? Math.min(100, Math.round((totalFixedBillsAmount / salary) * 100)) : 0;
  const paidRatio =
    totalFixedBillsAmount > 0
      ? Math.min(100, Math.round((totalPaidAmount / totalFixedBillsAmount) * 100))
      : 0;

  // Filter pending and overdue bills
  const pendingBills = monthOccurrences.filter(b => !b.isPaid);
  const overdueBills = pendingBills.filter(b => b.isOverdue);
  const sortedUpcomingBills = [...pendingBills].sort((a, b) => a.dueDay - b.dueDay);

  // Dynamic greeting according to local time
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Bom dia!' : currentHour < 18 ? 'Boa tarde!' : 'Boa noite!';

  // User first name
  const firstName = user?.name ? user.name.split(' ')[0] : 'Usuário';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Greeting Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {greeting} 👋
            </h1>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Veja como estão suas finanças.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick salary button badge */}
          <button
            onClick={handleStartEditSalary}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-left"
            title="Alterar receita mensal"
          >
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Receita Base
              </span>
              <span className="text-sm font-extrabold text-slate-900">
                {formatCurrency(salary)}
              </span>
            </div>
            <Edit3 className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* New bill CTA */}
          <button
            onClick={onOpenAddBill}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-colors shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nova Conta Fixa</span>
          </button>
        </div>
      </div>

      {/* Salary Edit Modal */}
      {isEditingSalary && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Definir Salário / Receita
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Informe a renda líquida mensal para calcular o saldo disponível após o pagamento das contas.
            </p>

            <form onSubmit={handleSaveSalary} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Valor da Receita (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    R$
                  </span>
                  <input
                    type="text"
                    autoFocus
                    placeholder="4500,00"
                    value={salaryInput}
                    onChange={e => setSalaryInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingSalary(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Highlight Cards: Main Hero Card ("Saldo atual") + 4 Secondary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* CARD PRINCIPAL: SALDO ATUAL (Valor em destaque + Indicador de evolução mensal) */}
        <div
          className={`lg:col-span-5 rounded-2xl p-6 border shadow-sm relative overflow-hidden flex flex-col justify-between ${
            availableAfterBills >= 0
              ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white border-slate-800'
              : 'bg-gradient-to-br from-rose-950 via-slate-900 to-slate-900 text-white border-rose-900'
          }`}
        >
          {/* Subtle architectural background glow */}
          <div className="absolute right-0 top-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Saldo atual
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/10 text-emerald-300 border border-white/10">
                  Mês Ativo
                </span>
              </div>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  availableAfterBills >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>

            <div className="my-2">
              <span className="text-xs text-slate-400 block mb-1">Total em caixa projetado</span>
              <div
                className={`text-3xl sm:text-4xl font-black tracking-tight ${
                  availableAfterBills >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatCurrency(availableAfterBills)}
              </div>
            </div>
          </div>

          {/* Indicador de evolução mensal */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>
                {salary > 0
                  ? `${100 - billRatio}% de evolução positiva na receita`
                  : 'Cadastre sua receita mensal para medir a evolução'}
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('simulator')}
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 text-xs"
            >
              Simular gastos →
            </button>
          </div>
        </div>

        {/* CARDS SECUNDÁRIOS: Receitas | Despesas | Contas pendentes | Disponível após contas */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* 1. RECEITAS */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Receitas
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {formatCurrency(salary)}
              </div>
              <div className="mt-1 text-xs text-slate-500 flex items-center justify-between">
                <span>Renda mensal base</span>
                <button
                  onClick={handleStartEditSalary}
                  className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline"
                >
                  Alterar
                </button>
              </div>
            </div>
          </div>

          {/* 2. DESPESAS */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Despesas
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {formatCurrency(totalFixedBillsAmount)}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                <span>{monthOccurrences.length} contas comprometidas ({billRatio}% da renda)</span>
              </div>
            </div>
          </div>

          {/* 3. CONTAS PENDENTES */}
          <div className="bg-white rounded-2xl p-5 border border-amber-200/80 bg-gradient-to-b from-white to-amber-50/30 shadow-xs flex flex-col justify-between hover:border-amber-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Contas pendentes
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-amber-900 tracking-tight">
                {formatCurrency(totalPendingAmount)}
              </div>
              <div className="mt-1 text-xs text-amber-800/80 flex items-center justify-between">
                <span>{pendingBills.length} pendentes</span>
                {overdueBills.length > 0 && (
                  <span className="font-bold text-rose-600">
                    {overdueBills.length} vencida(s)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 4. DISPONÍVEL APÓS CONTAS */}
          <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 bg-gradient-to-b from-white to-emerald-50/30 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Disponível após contas
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CalendarCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-700 tracking-tight">
                {formatCurrency(availableAfterBills)}
              </div>
              <div className="mt-1 text-xs text-emerald-800/80 flex items-center justify-between">
                <span>{monthOccurrences.filter(b => b.isPaid).length} quitadas</span>
                <span className="font-bold">{paidRatio}% concluído</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Grid Two Columns: Contas Próximas do Vencimento + Resumo do Mês */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ÁREA: CONTAS PRÓXIMAS DO VENCIMENTO */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Contas Próximas do Vencimento
                </h2>
                <p className="text-xs text-slate-500">
                  Dê baixa imediata clicando no botão ao lado de cada conta.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('calendar')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 shrink-0"
              >
                <span>Ver Calendário</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {monthOccurrences.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-xl border border-dashed border-slate-200">
                <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                  <Calendar className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  Nenhuma conta fixa cadastrada para este mês
                </p>
                <p className="text-xs text-slate-400 mt-0.5 mb-3">
                  Adicione contas recorrentes como internet, aluguel, condomínio ou financiamentos.
                </p>
                <button
                  onClick={onOpenAddBill}
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Cadastrar Conta</span>
                </button>
              </div>
            ) : sortedUpcomingBills.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-emerald-50/50 border border-emerald-200/60 my-2">
                <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <h4 className="text-sm font-bold text-emerald-900">
                  Parabéns! Todas as contas do mês foram pagas.
                </h4>
                <p className="text-xs text-emerald-700/80 mt-1">
                  Seu compromisso financeiro para {formatMonthYear(selectedYearMonth)} está 100% quitado.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {sortedUpcomingBills.slice(0, 5).map(occ => {
                  return (
                    <div
                      key={occ.billId}
                      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                        occ.isOverdue
                          ? 'bg-rose-50/40 border-rose-200'
                          : 'bg-slate-50/60 border-slate-200/80 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 border ${
                            occ.isOverdue
                              ? 'bg-rose-100 border-rose-300 text-rose-800'
                              : 'bg-white border-slate-200 text-slate-800 shadow-2xs'
                          }`}
                        >
                          <span className="text-[9px] uppercase font-bold leading-none">
                            Dia
                          </span>
                          <span className="text-sm font-black leading-tight">
                            {occ.dueDay}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 truncate">
                              {occ.name}
                            </span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 shrink-0">
                              {occ.category}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>Vence dia {occ.dueDay}</span>
                            {occ.isOverdue && (
                              <span className="text-rose-600 font-bold flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Atrasada
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <span className="text-sm sm:text-base font-black text-slate-900">
                          {formatCurrency(occ.amount)}
                        </span>
                        <button
                          onClick={() => togglePayment(occ.billId)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            occ.isOverdue
                              ? 'bg-rose-600 text-white hover:bg-rose-700'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs'
                          }`}
                          title="Marcar como paga"
                        >
                          Pagar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {sortedUpcomingBills.length > 5 && (
            <div className="mt-3 pt-3 border-t border-slate-100 text-center">
              <button
                onClick={() => onNavigateTab('bills')}
                className="text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Ver todas as {sortedUpcomingBills.length} contas pendentes →
              </button>
            </div>
          )}
        </div>

        {/* ÁREA: RESUMO DO MÊS COM GRÁFICO VISUAL LIMPO */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
              Resumo do Mês
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Distribuição proporcional da sua renda entre custos fixos e saldo livre.
            </p>

            {/* Visual clean bar representing distribution */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700">Comprometimento de Renda</span>
                  <span className="text-slate-900">{billRatio}%</span>
                </div>
                {/* Clean segmented progress track */}
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${paidRatio}%` }}
                    className="bg-emerald-600 transition-all duration-500"
                    title={`Pago: ${paidRatio}%`}
                  />
                  <div
                    style={{
                      width: `${Math.max(0, billRatio - paidRatio)}%`,
                    }}
                    className="bg-amber-400 transition-all duration-500"
                    title={`Pendente: ${billRatio - paidRatio}%`}
                  />
                  <div
                    style={{ width: `${Math.max(0, 100 - billRatio)}%` }}
                    className="bg-slate-200 transition-all duration-500"
                    title={`Livre: ${100 - billRatio}%`}
                  />
                </div>
              </div>

              {/* Legend with clean indicators */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span className="text-slate-600">Quitado ({paidRatio}%)</span>
                  </div>
                  <span className="font-bold text-slate-900">{formatCurrency(totalPaidAmount)}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="text-slate-600">Pendente no Mês</span>
                  </div>
                  <span className="font-bold text-slate-900">{formatCurrency(totalPendingAmount)}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="text-slate-600">Saldo Livre Previsto</span>
                  </div>
                  <span className="font-bold text-emerald-700">{formatCurrency(Math.max(0, availableAfterBills))}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Clean safety card inside summary */}
          <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="text-[11px] text-slate-500 leading-snug">
              Seus registros são processados localmente. Nenhum dado financeiro transita por servidores externos.
            </p>
          </div>
        </div>
      </div>

      {/* 4. ÁREA DE PLANEJAMENTO FINANCEIRO (Destacado sem misturar com despesas reais) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-6 border border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Planejamentos e Metas Futuras
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/10 text-emerald-300">
                  Separado das Contas
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Metas para viagens, praia, reservas de emergência e reformas sem comprometer o fluxo de contas reais.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('plannings')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors border border-white/15 shrink-0 self-start sm:self-auto"
          >
            <span>Gerenciar Planejamentos</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {plannings.length === 0 ? (
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
            <span>Você ainda não tem nenhum planejamento criado. Crie seu primeiro projeto financeiro.</span>
            <button
              onClick={() => onNavigateTab('plannings')}
              className="text-emerald-400 font-bold hover:underline self-start sm:self-auto"
            >
              + Criar primeiro planejamento
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-4">
            {plannings.slice(0, 3).map(plan => {
              const totalItems = plan.items.reduce((acc, i) => acc + i.amount, 0);
              const doneItems = plan.items.filter(i => i.done).reduce((acc, i) => acc + i.amount, 0);
              const progress = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

              return (
                <div
                  key={plan.id}
                  onClick={() => onNavigateTab('plannings')}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                      {plan.title}
                    </span>
                    <span className="text-xs font-black text-emerald-400">
                      {progress}%
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mb-2.5">
                    {formatCurrency(doneItems)} de {formatCurrency(totalItems)}
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${progress}%` }}
                      className="h-full bg-emerald-400 rounded-full transition-all"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
