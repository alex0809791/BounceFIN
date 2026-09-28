import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Planning } from '../types';
import { formatCurrency, parseCurrencyInput } from '../utils/formatters';
import {
  Target,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  HelpCircle,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const PlanningsView: React.FC = () => {
  const {
    plannings,
    addPlanning,
    deletePlanning,
    addPlanningItem,
    togglePlanningItem,
    deletePlanningItem,
  } = useFinance();

  // Create planning modal state
  const [isCreatingPlanning, setIsCreatingPlanning] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTargetStr, setNewTargetStr] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Add item inline state per planning
  const [activePlanIdForNewItem, setActivePlanIdForNewItem] = useState<string | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemAmountStr, setItemAmountStr] = useState('');

  const handleCreatePlanning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const target = newTargetStr ? parseCurrencyInput(newTargetStr) : undefined;
    addPlanning(newTitle.trim(), target, newNotes.trim());
    setNewTitle('');
    setNewTargetStr('');
    setNewNotes('');
    setIsCreatingPlanning(false);
  };

  const handleAddItem = (planningId: string, e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseCurrencyInput(itemAmountStr);
    if (!itemName.trim() || amount <= 0) return;

    addPlanningItem(planningId, itemName.trim(), amount);
    setItemName('');
    setItemAmountStr('');
    setActivePlanIdForNewItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Planejamentos & Somativas
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Metas Separadas
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Crie orçamentos independentes para Férias, Praia, Viagem, Reforma, Carro ou Natal sem misturar com as contas do mês.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingPlanning(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Planejamento</span>
        </button>
      </div>

      {/* Explanatory note */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <span>
          <strong>Lembrete importante:</strong> Todos os itens cadastrados aqui são somativas para objetivos futuros e <strong>NÃO</strong> entram como despesas no seu Dashboard nem afetam o cálculo do seu salário disponível mensal.
        </span>
      </div>

      {/* Create Planning Modal */}
      {isCreatingPlanning && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Criar Novo Planejamento
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Dê um nome ao seu objetivo e opcionalmente uma meta financeira.
            </p>

            <form onSubmit={handleCreatePlanning} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome do Planejamento *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: Férias, Praia, Viagem, Reforma da Casa, Carro..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Meta Total Desejada (Opcional - R$)
                </label>
                <input
                  type="text"
                  placeholder="Ex: 3000,00"
                  value={newTargetStr}
                  onChange={e => setNewTargetStr(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Observações (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Planejado para o final do ano com a família..."
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingPlanning(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs"
                >
                  Criar Planejamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List of Plannings */}
      {plannings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <Target className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Nenhum planejamento criado ainda
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            Crie planejamentos como Férias, Viagem ou Reforma para somar custos e definir metas sem afetar seu orçamento mensal.
          </p>
          <button
            onClick={() => setIsCreatingPlanning(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Criar Meu Primeiro Planejamento
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {plannings.map(plan => {
            const totalItemsAmount = plan.items.reduce((acc, curr) => acc + curr.amount, 0);
            const totalDoneAmount = plan.items
              .filter(i => i.done)
              .reduce((acc, curr) => acc + curr.amount, 0);
            const target = plan.targetAmount;
            const progress = target && target > 0 ? Math.min(100, Math.round((totalItemsAmount / target) * 100)) : null;

            const isAddingToThis = activePlanIdForNewItem === plan.id;

            return (
              <div
                key={plan.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Planning Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold">
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900">
                          {plan.title}
                        </h3>
                        {plan.notes && (
                          <p className="text-xs text-slate-500 mt-0.5">{plan.notes}</p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm(`Excluir o planejamento "${plan.title}"?`)) {
                          deletePlanning(plan.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Excluir planejamento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Target & Totals */}
                  <div className="bg-slate-50 rounded-xl p-3.5 mb-4 flex items-center justify-between border border-slate-100">
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Total dos Itens
                      </span>
                      <span className="text-lg font-black text-slate-900">
                        {formatCurrency(totalItemsAmount)}
                      </span>
                    </div>

                    {target ? (
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Meta Estipulada
                        </span>
                        <span className="text-lg font-black text-emerald-700">
                          {formatCurrency(target)}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {progress !== null && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                        <span>Progresso da meta</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Items List */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase">
                      <span>Itens do Planejamento ({plan.items.length})</span>
                      <button
                        onClick={() => {
                          setActivePlanIdForNewItem(isAddingToThis ? null : plan.id);
                          setItemName('');
                          setItemAmountStr('');
                        }}
                        className="text-emerald-600 hover:underline flex items-center gap-1 font-bold text-xs"
                      >
                        <Plus className="w-3 h-3" />
                        Adicionar Item
                      </button>
                    </div>

                    {plan.items.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">
                        Nenhum item adicionado ainda (Ex: Hotel, Combustível, Alimentação, Passeios...)
                      </p>
                    ) : (
                      <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto pr-1">
                        {plan.items.map(item => (
                          <div
                            key={item.id}
                            className="py-2 flex items-center justify-between gap-2 text-xs"
                          >
                            <button
                              onClick={() => togglePlanningItem(plan.id, item.id)}
                              className="flex items-center gap-2 text-left hover:text-slate-900 group"
                            >
                              {item.done ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-300 shrink-0 group-hover:text-slate-500" />
                              )}
                              <span
                                className={`font-semibold ${
                                  item.done ? 'line-through text-slate-400' : 'text-slate-800'
                                }`}
                              >
                                {item.name}
                              </span>
                            </button>

                            <div className="flex items-center gap-3">
                              <span
                                className={`font-bold ${
                                  item.done ? 'text-slate-400' : 'text-slate-900'
                                }`}
                              >
                                {formatCurrency(item.amount)}
                              </span>
                              <button
                                onClick={() => deletePlanningItem(plan.id, item.id)}
                                className="text-slate-300 hover:text-rose-500 p-0.5"
                                title="Remover item"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline Add Item Form */}
                {isAddingToThis && (
                  <form
                    onSubmit={e => handleAddItem(plan.id, e)}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 mt-2"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Nome (Ex: Hotel, Gasolina...)"
                        autoFocus
                        value={itemName}
                        onChange={e => setItemName(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <input
                        type="text"
                        placeholder="Valor (Ex: 800,00)"
                        value={itemAmountStr}
                        onChange={e => setItemAmountStr(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setActivePlanIdForNewItem(null)}
                        className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200/60 rounded-md"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 text-xs bg-emerald-600 text-white rounded-md font-semibold hover:bg-emerald-700"
                      >
                        Salvar Item
                      </button>
                    </div>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
