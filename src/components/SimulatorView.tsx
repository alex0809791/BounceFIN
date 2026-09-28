import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, parseCurrencyInput } from '../utils/formatters';
import {
  Calculator,
  Plus,
  Trash2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Info,
} from 'lucide-react';

export const SimulatorView: React.FC = () => {
  const {
    salary,
    totalFixedBillsAmount,
    availableAfterBills,
    simulations,
    addSimulationItem,
    removeSimulationItem,
    clearSimulations,
    simulatedTotalBills,
    simulatedRemaining,
  } = useFinance();

  const [simName, setSimName] = useState('');
  const [simAmountStr, setSimAmountStr] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseCurrencyInput(simAmountStr);

    if (!simName.trim()) {
      setErrorMsg('Informe o nome ou descrição da despesa simulada.');
      return;
    }
    if (parsedAmount <= 0) {
      setErrorMsg('Informe um valor válido maior que zero.');
      return;
    }

    addSimulationItem(simName.trim(), parsedAmount);
    setSimName('');
    setSimAmountStr('');
    setErrorMsg('');
  };

  const totalSimulatedExtra = simulations.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Simular Contas
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Ambiente de Testes
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Faça simulações seguras de novas compras ou despesas. Esta área é 100% isolada e <strong>NÃO</strong> altera suas contas reais ou o Dashboard.
          </p>
        </div>

        {simulations.length > 0 && (
          <button
            onClick={clearSimulations}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar Simulações</span>
          </button>
        )}
      </div>

      {/* Comparison Grid: Real vs Simulated */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Real Scenario Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Cenário Real Atual (Dashboard)
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              Contas Reais
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Salário:</span>
              <span className="font-bold text-slate-900">{formatCurrency(salary)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Contas fixas atuais:</span>
              <span className="font-bold text-slate-900">{formatCurrency(totalFixedBillsAmount)}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">Sobra atual:</span>
              <span className="text-lg font-black text-emerald-600">
                {formatCurrency(availableAfterBills)}
              </span>
            </div>
          </div>
        </div>

        {/* Simulated Scenario Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 border border-indigo-800 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-800 pb-3">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              Resultado com a Simulação
            </span>
            <span className="text-xs font-semibold text-indigo-200 bg-indigo-800/60 px-2 py-0.5 rounded">
              Apenas Simulado
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-indigo-200">
              <span className="text-sm">Salário:</span>
              <span className="font-bold text-white">{formatCurrency(salary)}</span>
            </div>
            <div className="flex items-center justify-between text-indigo-200">
              <span className="text-sm">Contas atuais + simuladas:</span>
              <span className="font-bold text-white">{formatCurrency(simulatedTotalBills)}</span>
            </div>
            <div className="pt-2 border-t border-indigo-800/80 flex items-center justify-between">
              <span className="text-sm font-bold text-white">Sobra simulada:</span>
              <span
                className={`text-xl font-black ${
                  simulatedRemaining >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatCurrency(simulatedRemaining)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Form to Add Simulation */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Adicionar Nova Conta para Simular
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Ex: "Viagem de fim de semana", "Novo Curso", "Revisão do Carro", "Parcela Celular", etc.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAddSimulation} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-6">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nome da Nova Conta Simulada
            </label>
            <input
              type="text"
              placeholder="Ex: Viagem, Notebook, Curso..."
              value={simName}
              onChange={e => setSimName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Valor da Despesa (R$)
            </label>
            <input
              type="text"
              placeholder="Ex: 800,00"
              value={simAmountStr}
              onChange={e => setSimAmountStr(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Simular</span>
            </button>
          </div>
        </form>
      </div>

      {/* Simulated Items List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Itens na Simulação ({simulations.length})
          </span>
          <span className="text-xs font-semibold text-slate-600">
            Total Simulado Extra: <strong>{formatCurrency(totalSimulatedExtra)}</strong>
          </span>
        </div>

        {simulations.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <Info className="w-6 h-6 mx-auto mb-2 text-slate-300" />
            Nenhuma simulação ativa no momento. Adicione um item acima para ver o impacto no seu orçamento.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {simulations.map(sim => (
              <div
                key={sim.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-900 block">
                      {sim.name}
                    </span>
                    <span className="text-[11px] text-indigo-600 font-medium">
                      Simulação Temporária
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-black text-sm sm:text-base text-slate-900">
                    {formatCurrency(sim.amount)}
                  </span>
                  <button
                    onClick={() => removeSimulationItem(sim.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remover simulação"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
