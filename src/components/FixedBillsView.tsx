import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { FixedBill, BillCategory } from '../types';
import {
  parseCurrencyInput,
  formatCurrency,
  formatMonthYear,
  MONTH_NAMES,
} from '../utils/formatters';
import {
  Plus,
  Trash2,
  Edit2,
  Calendar,
  X,
  AlertCircle,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

const CATEGORIES: BillCategory[] = [
  'Moradia',
  'Telecomunicações',
  'Serviços',
  'Transporte',
  'Saúde',
  'Educação',
  'Alimentação',
  'Seguros',
  'Lazer',
  'Outros',
];

interface FixedBillsViewProps {
  onOpenAddModal?: () => void;
}

export const FixedBillsView: React.FC<FixedBillsViewProps> = () => {
  const { fixedBills, addFixedBill, updateFixedBill, deleteFixedBill, selectedYearMonth } = useFinance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<FixedBill | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [dueDay, setDueDay] = useState<number>(10);
  const [startDate, setStartDate] = useState(`${new Date().getFullYear()}-01`);
  const [endDate, setEndDate] = useState(`${new Date().getFullYear()}-12`);
  const [category, setCategory] = useState<BillCategory>('Moradia');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpenAdd = () => {
    setEditingBill(null);
    setName('');
    setAmountStr('');
    setDueDay(10);
    const yr = new Date().getFullYear();
    setStartDate(`${yr}-01`);
    setEndDate(`${yr}-12`);
    setCategory('Moradia');
    setNotes('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (bill: FixedBill) => {
    setEditingBill(bill);
    setName(bill.name);
    setAmountStr(bill.amount.toString());
    setDueDay(bill.dueDay);
    setStartDate(bill.startDate.slice(0, 7));
    setEndDate(bill.endDate.slice(0, 7));
    setCategory(bill.category);
    setNotes(bill.notes || '');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseCurrencyInput(amountStr);

    if (!name.trim()) {
      setErrorMsg('Informe o nome da conta.');
      return;
    }
    if (parsedAmount <= 0) {
      setErrorMsg('Informe um valor válido maior que zero.');
      return;
    }
    if (dueDay < 1 || dueDay > 31) {
      setErrorMsg('O dia de vencimento deve estar entre 1 e 31.');
      return;
    }
    if (!startDate || !endDate) {
      setErrorMsg('Selecione os meses de início e fim da recorrência.');
      return;
    }
    if (startDate > endDate) {
      setErrorMsg('O mês de início não pode ser posterior ao mês final.');
      return;
    }

    if (editingBill) {
      updateFixedBill({
        ...editingBill,
        name: name.trim(),
        amount: parsedAmount,
        dueDay,
        startDate,
        endDate,
        category,
        notes: notes.trim() || undefined,
      });
    } else {
      addFixedBill({
        name: name.trim(),
        amount: parsedAmount,
        dueDay,
        startDate,
        endDate,
        category,
        notes: notes.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a conta fixa "${name}"? Todas as suas ocorrências mensais serão removidas.`)) {
      deleteFixedBill(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Contas Fixas Recorrentes
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Uma conta cadastrada aqui repete-se automaticamente mês a mês dentro do período estipulado.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Conta Fixa</span>
        </button>
      </div>

      {/* Explanatory banner about recurring rule */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
          <HelpCircle className="w-4 h-4" />
        </div>
        <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p className="font-bold text-white mb-1">
            Como funcionam as contas recorrentes no BounceFIN:
          </p>
          <p>
            Ao cadastrar uma conta (ex: Aluguel de Jan/2026 a Dez/2026), ela é gerada todo mês.
            Marcar a conta como <strong className="text-emerald-400">Paga</strong> em Janeiro não altera nem apaga Fevereiro. Cada mês tem seu próprio status independente e ela só deixa de aparecer quando o período contratado chegar ao fim.
          </p>
        </div>
      </div>

      {/* Fixed Bills List */}
      {fixedBills.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Nenhuma conta fixa cadastrada ainda
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
            Cadastre compromissos mensais regulares como Aluguel, Condomínio, Internet, Energia, Financiamentos ou Assinaturas.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Minha Primeira Conta
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {fixedBills.length} Contas Fixas Cadastradas
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {fixedBills.map(bill => {
              const startFormatted = formatMonthYear(bill.startDate);
              const endFormatted = formatMonthYear(bill.endDate);

              return (
                <div
                  key={bill.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Left: Info */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base sm:text-lg font-bold text-slate-900">
                        {bill.name}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {bill.category}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">
                        Vencimento: todo dia {bill.dueDay}
                      </span>
                      <span className="text-slate-300 hidden sm:inline">|</span>
                      <span className="flex items-center gap-1">
                        Período: <strong className="text-slate-700">{startFormatted}</strong>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <strong className="text-slate-700">{endFormatted}</strong>
                      </span>
                    </div>

                    {bill.notes && (
                      <p className="text-xs text-slate-400 italic">
                        Obs: {bill.notes}
                      </p>
                    )}
                  </div>

                  {/* Right: Value & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <span className="text-xs text-slate-400 block font-medium">
                        Valor mensal
                      </span>
                      <span className="text-lg sm:text-xl font-black text-slate-900">
                        {formatCurrency(bill.amount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(bill)}
                        className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors"
                        title="Editar conta fixa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(bill.id, bill.name)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Excluir conta fixa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingBill ? 'Editar Conta Fixa' : 'Cadastrar Nova Conta Fixa'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome da Conta *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aluguel, Internet, Financiamento, Energia..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Valor Mensal (R$) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 1200,00"
                    value={amountStr}
                    onChange={e => setAmountStr(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dia do Vencimento (1 a 31) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    required
                    value={dueDay}
                    onChange={e => setDueDay(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mês de Início *
                  </label>
                  <input
                    type="month"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Primeiro mês em que a conta vence
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mês Final (Término) *
                  </label>
                  <input
                    type="month"
                    required
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Último mês em que a conta existirá
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as BillCategory)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Observação (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Contrato de 1 ano, débito em conta..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  {editingBill ? 'Salvar Alterações' : 'Cadastrar Conta Fixa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
