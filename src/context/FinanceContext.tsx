import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  FixedBill,
  BillOccurrence,
  PaymentRecord,
  Planning,
  PlanningItem,
  SimulationItem,
} from '../types';
import {
  getUserFinancialData,
  saveUserFinancialData,
  UserFinancialData,
} from '../utils/storage';
import {
  toYearMonth,
  parseYearMonth,
  getDaysInMonth,
  isMonthInRange,
  isDateOverdue,
} from '../utils/formatters';
import { useAuth } from './AuthContext';

interface FinanceContextType {
  salary: number;
  updateSalary: (val: number) => void;

  selectedYearMonth: string;
  setSelectedYearMonth: (ym: string) => void;
  prevMonth: () => void;
  nextMonth: () => void;
  goToCurrentMonth: () => void;

  fixedBills: FixedBill[];
  addFixedBill: (bill: Omit<FixedBill, 'id' | 'createdAt'>) => void;
  updateFixedBill: (bill: FixedBill) => void;
  deleteFixedBill: (billId: string) => void;

  monthOccurrences: BillOccurrence[];
  totalFixedBillsAmount: number;
  totalPaidAmount: number;
  totalPendingAmount: number;
  availableAfterBills: number;
  togglePayment: (billId: string, ym?: string) => void;

  simulations: SimulationItem[];
  addSimulationItem: (name: string, amount: number) => void;
  removeSimulationItem: (id: string) => void;
  clearSimulations: () => void;
  simulatedTotalBills: number;
  simulatedRemaining: number;

  plannings: Planning[];
  addPlanning: (title: string, targetAmount?: number, notes?: string) => void;
  updatePlanning: (planning: Planning) => void;
  deletePlanning: (id: string) => void;
  addPlanningItem: (planningId: string, name: string, amount: number) => void;
  togglePlanningItem: (planningId: string, itemId: string) => void;
  deletePlanningItem: (planningId: string, itemId: string) => void;

  refreshData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Current calendar month navigation
  const now = new Date();
  const currentYM = toYearMonth(now.getFullYear(), now.getMonth());
  const [selectedYearMonth, setSelectedYearMonth] = useState<string>(currentYM);

  // Core financial state
  const [salary, setSalaryState] = useState<number>(0);
  const [fixedBills, setFixedBills] = useState<FixedBill[]>([]);
  const [payments, setPayments] = useState<Record<string, PaymentRecord>>({});
  const [plannings, setPlannings] = useState<Planning[]>([]);
  const [simulations, setSimulations] = useState<SimulationItem[]>([]);

  // Load data whenever user changes
  const loadUserData = () => {
    if (!user) {
      setSalaryState(0);
      setFixedBills([]);
      setPayments({});
      setPlannings([]);
      setSimulations([]);
      return;
    }
    const data = getUserFinancialData(user.id);
    setSalaryState(data.salary || 0);
    setFixedBills(data.fixedBills || []);
    setPayments(data.payments || {});
    setPlannings(data.plannings || []);
    setSimulations(data.simulations || []);
  };

  useEffect(() => {
    loadUserData();
  }, [user]);

  // Persist helper
  const persist = (updated: Partial<UserFinancialData>) => {
    if (!user) return;
    const current = getUserFinancialData(user.id);
    const merged: UserFinancialData = {
      salary: updated.salary !== undefined ? updated.salary : current.salary,
      fixedBills: updated.fixedBills !== undefined ? updated.fixedBills : current.fixedBills,
      payments: updated.payments !== undefined ? updated.payments : current.payments,
      plannings: updated.plannings !== undefined ? updated.plannings : current.plannings,
      simulations: updated.simulations !== undefined ? updated.simulations : current.simulations,
    };
    saveUserFinancialData(user.id, merged);
  };

  const updateSalary = (val: number) => {
    const numeric = typeof val === 'number' && !isNaN(val) ? Math.max(0, Number(val.toFixed(2))) : 0;
    setSalaryState(numeric);
    persist({ salary: numeric });
  };

  // Month navigation helpers
  const prevMonth = () => {
    const { year, monthIndex } = parseYearMonth(selectedYearMonth);
    const newDate = new Date(year, monthIndex - 1, 1);
    setSelectedYearMonth(toYearMonth(newDate.getFullYear(), newDate.getMonth()));
  };

  const nextMonth = () => {
    const { year, monthIndex } = parseYearMonth(selectedYearMonth);
    const newDate = new Date(year, monthIndex + 1, 1);
    setSelectedYearMonth(toYearMonth(newDate.getFullYear(), newDate.getMonth()));
  };

  const goToCurrentMonth = () => {
    const d = new Date();
    setSelectedYearMonth(toYearMonth(d.getFullYear(), d.getMonth()));
  };

  // Fixed Bills Management
  const addFixedBill = (billData: Omit<FixedBill, 'id' | 'createdAt'>) => {
    const newBill: FixedBill = {
      ...billData,
      id: 'bill_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      amount: Number(billData.amount.toFixed(2)),
      dueDay: Math.max(1, Math.min(31, Math.round(billData.dueDay))),
      createdAt: new Date().toISOString(),
    };
    const updated = [...fixedBills, newBill];
    setFixedBills(updated);
    persist({ fixedBills: updated });
  };

  const updateFixedBill = (updatedBill: FixedBill) => {
    const sanitized: FixedBill = {
      ...updatedBill,
      amount: Number(updatedBill.amount.toFixed(2)),
      dueDay: Math.max(1, Math.min(31, Math.round(updatedBill.dueDay))),
    };
    const updated = fixedBills.map(b => (b.id === sanitized.id ? sanitized : b));
    setFixedBills(updated);
    persist({ fixedBills: updated });
  };

  const deleteFixedBill = (billId: string) => {
    const updated = fixedBills.filter(b => b.id !== billId);
    setFixedBills(updated);
    persist({ fixedBills: updated });
  };

  // Generate Occurrences for the selected month
  const monthOccurrences: BillOccurrence[] = useMemo(() => {
    const { year, monthIndex } = parseYearMonth(selectedYearMonth);
    const maxDays = getDaysInMonth(year, monthIndex);

    const occurrences: BillOccurrence[] = [];

    for (const bill of fixedBills) {
      // Check if bill period covers this yearMonth
      if (!isMonthInRange(selectedYearMonth, bill.startDate, bill.endDate)) {
        continue; // Outside period, does not exist in this month!
      }

      // Safe day for months with fewer days (e.g. Feb 28/29 or April 30)
      const day = Math.min(bill.dueDay, maxDays);
      const dayStr = String(day).padStart(2, '0');
      const dueDate = `${selectedYearMonth}-${dayStr}`;

      const paymentKey = `${bill.id}_${selectedYearMonth}`;
      const payment = payments[paymentKey];
      const isPaid = !!payment?.paid;

      occurrences.push({
        billId: bill.id,
        name: bill.name,
        amount: bill.amount,
        dueDate,
        dueDay: day,
        category: bill.category,
        notes: bill.notes,
        isPaid,
        paidAt: payment?.paidAt,
        isOverdue: isDateOverdue(dueDate, isPaid),
        yearMonth: selectedYearMonth,
      });
    }

    // Sort by due day, then name
    return occurrences.sort((a, b) => a.dueDay - b.dueDay || a.name.localeCompare(b.name));
  }, [fixedBills, payments, selectedYearMonth]);

  // Toggle paid status for a specific month occurrence
  const togglePayment = (billId: string, ym = selectedYearMonth) => {
    const key = `${billId}_${ym}`;
    const currentlyPaid = !!payments[key]?.paid;
    const updatedPayments = {
      ...payments,
      [key]: {
        paid: !currentlyPaid,
        paidAt: !currentlyPaid ? new Date().toISOString() : undefined,
      },
    };
    setPayments(updatedPayments);
    persist({ payments: updatedPayments });
  };

  // Totals calculations
  const totalFixedBillsAmount = useMemo(() => {
    return monthOccurrences.reduce((acc, curr) => acc + curr.amount, 0);
  }, [monthOccurrences]);

  const totalPaidAmount = useMemo(() => {
    return monthOccurrences.filter(b => b.isPaid).reduce((acc, curr) => acc + curr.amount, 0);
  }, [monthOccurrences]);

  const totalPendingAmount = useMemo(() => {
    return monthOccurrences.filter(b => !b.isPaid).reduce((acc, curr) => acc + curr.amount, 0);
  }, [monthOccurrences]);

  // Available after all fixed bills = SALÁRIO - CONTAS DO MÊS
  const availableAfterBills = useMemo(() => {
    return Number((salary - totalFixedBillsAmount).toFixed(2));
  }, [salary, totalFixedBillsAmount]);

  // Simulations Management
  const addSimulationItem = (name: string, amount: number) => {
    const trimmed = name.trim();
    if (!trimmed || isNaN(amount) || amount <= 0) return;
    const newItem: SimulationItem = {
      id: 'sim_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: trimmed,
      amount: Number(amount.toFixed(2)),
    };
    const updated = [...simulations, newItem];
    setSimulations(updated);
    persist({ simulations: updated });
  };

  const removeSimulationItem = (id: string) => {
    const updated = simulations.filter(s => s.id !== id);
    setSimulations(updated);
    persist({ simulations: updated });
  };

  const clearSimulations = () => {
    setSimulations([]);
    persist({ simulations: [] });
  };

  const simulatedAdditionalAmount = useMemo(() => {
    return simulations.reduce((acc, curr) => acc + curr.amount, 0);
  }, [simulations]);

  const simulatedTotalBills = useMemo(() => {
    return Number((totalFixedBillsAmount + simulatedAdditionalAmount).toFixed(2));
  }, [totalFixedBillsAmount, simulatedAdditionalAmount]);

  const simulatedRemaining = useMemo(() => {
    return Number((salary - simulatedTotalBills).toFixed(2));
  }, [salary, simulatedTotalBills]);

  // Plannings (Somativas) Management
  const addPlanning = (title: string, targetAmount?: number, notes?: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const newPlan: Planning = {
      id: 'plan_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      title: trimmed,
      targetAmount: targetAmount && targetAmount > 0 ? Number(targetAmount.toFixed(2)) : undefined,
      notes: notes?.trim(),
      items: [],
      createdAt: new Date().toISOString(),
    };
    const updated = [newPlan, ...plannings];
    setPlannings(updated);
    persist({ plannings: updated });
  };

  const updatePlanning = (planning: Planning) => {
    const updated = plannings.map(p => (p.id === planning.id ? planning : p));
    setPlannings(updated);
    persist({ plannings: updated });
  };

  const deletePlanning = (id: string) => {
    const updated = plannings.filter(p => p.id !== id);
    setPlannings(updated);
    persist({ plannings: updated });
  };

  const addPlanningItem = (planningId: string, name: string, amount: number) => {
    const trimmed = name.trim();
    if (!trimmed || isNaN(amount) || amount <= 0) return;
    const newItem: PlanningItem = {
      id: 'item_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: trimmed,
      amount: Number(amount.toFixed(2)),
      done: false,
    };
    const updated = plannings.map(p => {
      if (p.id === planningId) {
        return {
          ...p,
          items: [...p.items, newItem],
        };
      }
      return p;
    });
    setPlannings(updated);
    persist({ plannings: updated });
  };

  const togglePlanningItem = (planningId: string, itemId: string) => {
    const updated = plannings.map(p => {
      if (p.id === planningId) {
        return {
          ...p,
          items: p.items.map(item =>
            item.id === itemId ? { ...item, done: !item.done } : item
          ),
        };
      }
      return p;
    });
    setPlannings(updated);
    persist({ plannings: updated });
  };

  const deletePlanningItem = (planningId: string, itemId: string) => {
    const updated = plannings.map(p => {
      if (p.id === planningId) {
        return {
          ...p,
          items: p.items.filter(item => item.id !== itemId),
        };
      }
      return p;
    });
    setPlannings(updated);
    persist({ plannings: updated });
  };

  return (
    <FinanceContext.Provider
      value={{
        salary,
        updateSalary,
        selectedYearMonth,
        setSelectedYearMonth,
        prevMonth,
        nextMonth,
        goToCurrentMonth,
        fixedBills,
        addFixedBill,
        updateFixedBill,
        deleteFixedBill,
        monthOccurrences,
        totalFixedBillsAmount,
        totalPaidAmount,
        totalPendingAmount,
        availableAfterBills,
        togglePayment,
        simulations,
        addSimulationItem,
        removeSimulationItem,
        clearSimulations,
        simulatedTotalBills,
        simulatedRemaining,
        plannings,
        addPlanning,
        updatePlanning,
        deletePlanning,
        addPlanningItem,
        togglePlanningItem,
        deletePlanningItem,
        refreshData: loadUserData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance deve ser usado dentro de FinanceProvider');
  }
  return context;
};
