import React from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  formatCurrency,
  formatMonthYear,
  getDaysInMonth,
  parseYearMonth,
  WEEK_DAYS,
} from '../utils/formatters';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  CircleAlert,
  Check,
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const {
    selectedYearMonth,
    setSelectedYearMonth,
    prevMonth,
    nextMonth,
    goToCurrentMonth,
    monthOccurrences,
    togglePayment,
    totalFixedBillsAmount,
    totalPaidAmount,
    totalPendingAmount,
  } = useFinance();

  const { year, monthIndex } = parseYearMonth(selectedYearMonth);
  const daysInMonth = getDaysInMonth(year, monthIndex);

  // First day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = new Date(year, monthIndex, 1).getDay();

  // Group occurrences by day number
  const billsByDay = React.useMemo(() => {
    const map: Record<number, typeof monthOccurrences> = {};
    for (const occ of monthOccurrences) {
      if (!map[occ.dueDay]) {
        map[occ.dueDay] = [];
      }
      map[occ.dueDay].push(occ);
    }
    return map;
  }, [monthOccurrences]);

  // Calendar cells calculation
  const calendarCells = React.useMemo(() => {
    const cells: { type: 'empty' | 'day'; day?: number }[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push({ type: 'empty' });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ type: 'day', day: d });
    }
    return cells;
  }, [firstDayOfWeek, daysInMonth]);

  const today = new Date();
  const isCurrentMonthActive =
    today.getFullYear() === year && today.getMonth() === monthIndex;
  const currentDay = isCurrentMonthActive ? today.getDate() : -1;

  return (
    <div className="space-y-6">
      {/* Top Header & Month Navigation */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Calendário de Contas
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Visualização cronológica por data de vencimento de todas as contas do mês.
          </p>
        </div>

        {/* Month Navigator Controls */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all shadow-none hover:shadow-xs"
            title="Mês anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={goToCurrentMonth}
            className="px-3.5 py-1.5 font-bold text-sm text-slate-800 hover:text-emerald-700 capitalize flex items-center gap-1.5 transition-colors"
          >
            <CalendarIcon className="w-4 h-4 text-emerald-600" />
            {formatMonthYear(selectedYearMonth)}
          </button>

          <button
            onClick={nextMonth}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all shadow-none hover:shadow-xs"
            title="Próximo mês"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Month Totals Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Total do Mês
          </span>
          <span className="text-lg font-black text-slate-900">
            {formatCurrency(totalFixedBillsAmount)}
          </span>
        </div>
        <div className="bg-emerald-50/70 rounded-xl p-4 border border-emerald-200 shadow-2xs flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            Total Pago
          </span>
          <span className="text-lg font-black text-emerald-700">
            {formatCurrency(totalPaidAmount)}
          </span>
        </div>
        <div className="bg-amber-50/70 rounded-xl p-4 border border-amber-200 shadow-2xs flex items-center justify-between">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
            Total Pendente
          </span>
          <span className="text-lg font-black text-amber-800">
            {formatCurrency(totalPendingAmount)}
          </span>
        </div>
      </div>

      {/* Grid Calendar Visualizer (for Tablet & Desktop) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs hidden md:block">
        <div className="grid grid-cols-7 gap-2 mb-2 text-center">
          {WEEK_DAYS.map(day => (
            <div
              key={day}
              className="text-xs font-bold uppercase text-slate-400 py-2 tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarCells.map((cell, idx) => {
            if (cell.type === 'empty') {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[100px] rounded-xl bg-slate-50/50 border border-transparent"
                />
              );
            }

            const dayNum = cell.day!;
            const dayBills = billsByDay[dayNum] || [];
            const isToday = dayNum === currentDay;

            return (
              <div
                key={`day-${dayNum}`}
                className={`min-h-[110px] p-2 rounded-xl border transition-all flex flex-col justify-between ${
                  isToday
                    ? 'border-emerald-500 bg-emerald-50/20 ring-2 ring-emerald-500/20'
                    : dayBills.length > 0
                    ? 'border-slate-200 bg-white hover:border-slate-300'
                    : 'border-slate-100 bg-slate-50/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-emerald-600 text-white'
                        : dayBills.length > 0
                        ? 'text-slate-900 bg-slate-100'
                        : 'text-slate-400'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayBills.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-400">
                      {dayBills.length} conta{dayBills.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <div className="mt-1 space-y-1 flex-1 overflow-y-auto max-h-[85px] scrollbar-none">
                  {dayBills.map(bill => (
                    <button
                      key={bill.billId}
                      onClick={() => togglePayment(bill.billId)}
                      title={`${bill.name} - ${formatCurrency(bill.amount)} (${bill.isPaid ? 'Pago' : 'Pendente'})`}
                      className={`w-full text-left p-1 rounded-md text-[11px] font-medium leading-tight flex items-center justify-between gap-1 transition-all ${
                        bill.isPaid
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 line-through'
                          : bill.isOverdue
                          ? 'bg-rose-100 text-rose-900 hover:bg-rose-200'
                          : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                      }`}
                    >
                      <span className="truncate">{bill.name}</span>
                      <span className="shrink-0 font-bold">
                        {formatCurrency(bill.amount).replace('R$', '').trim()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chronological List of Monthly Bills (Responsive & Clean) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Contas por Data de Vencimento
          </h2>
          <span className="text-xs text-slate-500">
            {monthOccurrences.length} contas neste mês
          </span>
        </div>

        {monthOccurrences.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-slate-200">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Nenhuma conta vence em {formatMonthYear(selectedYearMonth)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Navegue pelos meses ou cadastre contas na aba "Contas Fixas".
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {monthOccurrences.map(occ => {
              const isPaid = occ.isPaid;
              return (
                <div
                  key={occ.billId}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    isPaid
                      ? 'bg-emerald-50/30 border-emerald-200'
                      : occ.isOverdue
                      ? 'bg-rose-50/30 border-rose-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Status dot icon */}
                    <div
                      className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                        isPaid
                          ? 'bg-emerald-500 ring-4 ring-emerald-100'
                          : occ.isOverdue
                          ? 'bg-rose-500 ring-4 ring-rose-100'
                          : 'bg-amber-500 ring-4 ring-amber-100'
                      }`}
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          Dia {occ.dueDay} de {formatMonthYear(selectedYearMonth).split(' ')[0]}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {occ.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5">
                        <h4
                          className={`text-base font-bold ${
                            isPaid ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {occ.name}
                        </h4>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                            isPaid
                              ? 'bg-emerald-100 text-emerald-800'
                              : occ.isOverdue
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isPaid ? '🟢 Paga' : occ.isOverdue ? '🔴 Atrasada' : '🔴 Pendente'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <span
                      className={`text-lg font-black ${
                        isPaid ? 'text-emerald-700' : 'text-slate-900'
                      }`}
                    >
                      {formatCurrency(occ.amount)}
                    </span>

                    <button
                      onClick={() => togglePayment(occ.billId)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                        isPaid
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300'
                      }`}
                      title={isPaid ? 'Clique para marcar como pendente' : 'Clique para marcar como pago'}
                    >
                      {isPaid ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Paga</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Marcar como Paga</span>
                        </>
                      )}
                    </button>
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
