import { UserProfile, FixedBill, PaymentRecord, Planning, SimulationItem } from '../types';

export interface UserFinancialData {
  salary: number;
  fixedBills: FixedBill[];
  payments: Record<string, PaymentRecord>; // Key: `${billId}_${yearMonth}`
  plannings: Planning[];
  simulations: SimulationItem[];
}

// Primary keys (BounceFin)
const USERS_KEY = 'bouncefin_users';
const ACTIVE_USER_ID_KEY = 'bouncefin_active_user_id';
const DATA_PREFIX = 'bouncefin_data_';

// Legacy keys (FinUP) preserved intact for retroactive fallback and safety
const LEGACY_USERS_KEY = 'finup_users';
const LEGACY_ACTIVE_USER_ID_KEY = 'finup_active_user_id';
const LEGACY_DATA_PREFIX = 'finup_data_';

/**
 * Automatically migrates existing local data from legacy finup_* keys to bouncefin_* keys.
 * Crucial rules:
 * - Runs once per browser session/start.
 * - Does NOT delete any finup_* keys (preserves them intact).
 * - Avoids overwriting or duplicating if bouncefin_* already contains newer data.
 */
export function migrateFinUpToBounceFin(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;

  try {
    // 1. Migrate users list
    const legacyUsersRaw = localStorage.getItem(LEGACY_USERS_KEY);
    const modernUsersRaw = localStorage.getItem(USERS_KEY);

    if (legacyUsersRaw && !modernUsersRaw) {
      localStorage.setItem(USERS_KEY, legacyUsersRaw);
    } else if (legacyUsersRaw && modernUsersRaw) {
      // Merge unique users without duplicates in case user was created on either side
      try {
        const legacyList: UserProfile[] = JSON.parse(legacyUsersRaw);
        const modernList: UserProfile[] = JSON.parse(modernUsersRaw);
        const modernIds = new Set(modernList.map(u => u.id));
        const merged = [...modernList];
        for (const user of legacyList) {
          if (!modernIds.has(user.id)) {
            merged.push(user);
          }
        }
        localStorage.setItem(USERS_KEY, JSON.stringify(merged));
      } catch {
        // Keep modern if parsing error
      }
    }

    // 2. Migrate active session
    const legacyActiveId = localStorage.getItem(LEGACY_ACTIVE_USER_ID_KEY);
    const modernActiveId = localStorage.getItem(ACTIVE_USER_ID_KEY);
    if (legacyActiveId && !modernActiveId) {
      localStorage.setItem(ACTIVE_USER_ID_KEY, legacyActiveId);
    }

    // 3. Migrate user financial data keys: finup_data_${userId} -> bouncefin_data_${userId}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(LEGACY_DATA_PREFIX)) {
        const userId = key.slice(LEGACY_DATA_PREFIX.length);
        const modernKey = `${DATA_PREFIX}${userId}`;
        const modernVal = localStorage.getItem(modernKey);
        const legacyVal = localStorage.getItem(key);

        if (legacyVal && !modernVal) {
          localStorage.setItem(modernKey, legacyVal);
        }
      }
    }
  } catch (err) {
    console.error('Erro na rotina de migração FinUP -> BounceFin:', err);
  }
}

// Automatically execute migration on module load
if (typeof window !== 'undefined' && window.localStorage) {
  migrateFinUpToBounceFin();
}

export function getStoredUsers(): UserProfile[] {
  try {
    // 1. Look for BounceFin keys first
    const modernRaw = localStorage.getItem(USERS_KEY);
    if (modernRaw) {
      return JSON.parse(modernRaw);
    }
    // 2. Fallback to legacy FinUP keys
    const legacyRaw = localStorage.getItem(LEGACY_USERS_KEY);
    if (legacyRaw) {
      return JSON.parse(legacyRaw);
    }
    return [];
  } catch (err) {
    console.error('Erro ao ler usuários:', err);
    return [];
  }
}

export function saveStoredUsers(users: UserProfile[]): void {
  try {
    const serialized = JSON.stringify(users);
    // Save to BounceFin key
    localStorage.setItem(USERS_KEY, serialized);
    // Synchronize to legacy key to maintain dual compatibility without data loss
    localStorage.setItem(LEGACY_USERS_KEY, serialized);
  } catch (err) {
    console.error('Erro ao salvar usuários:', err);
  }
}

export function getActiveUserId(): string | null {
  try {
    // 1. Look for BounceFin active user first
    const modernId = localStorage.getItem(ACTIVE_USER_ID_KEY);
    if (modernId) return modernId;

    // 2. Fallback to legacy FinUP active user
    return localStorage.getItem(LEGACY_ACTIVE_USER_ID_KEY);
  } catch {
    return null;
  }
}

export function setActiveUserId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_USER_ID_KEY, id);
      localStorage.setItem(LEGACY_ACTIVE_USER_ID_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_USER_ID_KEY);
      localStorage.removeItem(LEGACY_ACTIVE_USER_ID_KEY);
    }
  } catch (err) {
    console.error('Erro ao salvar sessão ativa:', err);
  }
}

const getDefaultFinancialData = (): UserFinancialData => ({
  salary: 0,
  fixedBills: [],
  payments: {},
  plannings: [],
  simulations: [],
});

export function getUserFinancialData(userId: string): UserFinancialData {
  if (!userId) return getDefaultFinancialData();
  try {
    const modernKey = `${DATA_PREFIX}${userId}`;
    const legacyKey = `${LEGACY_DATA_PREFIX}${userId}`;

    // 1. Look for BounceFin key first
    let raw = localStorage.getItem(modernKey);
    // 2. Fallback to legacy FinUP key
    if (!raw) {
      raw = localStorage.getItem(legacyKey);
    }

    if (!raw) return getDefaultFinancialData();
    const parsed = JSON.parse(raw);
    return {
      salary: typeof parsed.salary === 'number' ? parsed.salary : 0,
      fixedBills: Array.isArray(parsed.fixedBills) ? parsed.fixedBills : [],
      payments: parsed.payments && typeof parsed.payments === 'object' ? parsed.payments : {},
      plannings: Array.isArray(parsed.plannings) ? parsed.plannings : [],
      simulations: Array.isArray(parsed.simulations) ? parsed.simulations : [],
    };
  } catch (err) {
    console.error('Erro ao carregar dados financeiros do usuário:', err);
    return getDefaultFinancialData();
  }
}

export function saveUserFinancialData(userId: string, data: UserFinancialData): void {
  if (!userId) return;
  try {
    const modernKey = `${DATA_PREFIX}${userId}`;
    const legacyKey = `${LEGACY_DATA_PREFIX}${userId}`;
    const serialized = JSON.stringify(data);

    // Save to modern key
    localStorage.setItem(modernKey, serialized);
    // Synchronize to legacy key so user never loses data regardless of key checked
    localStorage.setItem(legacyKey, serialized);
  } catch (err) {
    console.error('Erro ao salvar dados financeiros:', err);
  }
}

export function exportUserData(userId: string): string {
  const users = getStoredUsers();
  const user = users.find(u => u.id === userId);
  const financialData = getUserFinancialData(userId);
  const exportPayload = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    profile: user ? { id: user.id, email: user.email, name: user.name } : null,
    financialData,
  };
  return JSON.stringify(exportPayload, null, 2);
}

export function importUserData(userId: string, jsonString: string): boolean {
  try {
    if (!userId || !jsonString || typeof jsonString !== 'string') return false;
    // Limit import payload size to prevent memory exhaustion attacks (max 5MB)
    if (jsonString.length > 5 * 1024 * 1024) return false;

    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object' || !parsed.financialData) return false;
    const { salary, fixedBills, payments, plannings, simulations } = parsed.financialData;

    // Validate and sanitize salary
    const safeSalary = typeof salary === 'number' && !isNaN(salary) && salary >= 0 && isFinite(salary)
      ? Number(salary.toFixed(2))
      : 0;

    // Validate and sanitize fixedBills
    const safeFixedBills: FixedBill[] = [];
    if (Array.isArray(fixedBills)) {
      for (const bill of fixedBills) {
        if (
          bill &&
          typeof bill.id === 'string' &&
          typeof bill.name === 'string' &&
          typeof bill.amount === 'number' &&
          !isNaN(bill.amount) &&
          bill.amount >= 0 &&
          typeof bill.dueDay === 'number' &&
          bill.dueDay >= 1 &&
          bill.dueDay <= 31 &&
          typeof bill.startDate === 'string' &&
          typeof bill.endDate === 'string'
        ) {
          safeFixedBills.push({
            id: bill.id.slice(0, 50),
            name: bill.name.slice(0, 100),
            amount: Number(bill.amount.toFixed(2)),
            dueDay: Math.min(31, Math.max(1, Math.round(bill.dueDay))),
            startDate: bill.startDate.slice(0, 7),
            endDate: bill.endDate.slice(0, 7),
            category: typeof bill.category === 'string' ? bill.category : 'Outros',
            notes: typeof bill.notes === 'string' ? bill.notes.slice(0, 200) : undefined,
            createdAt: typeof bill.createdAt === 'string' ? bill.createdAt : new Date().toISOString(),
          });
        }
      }
    }

    // Validate and sanitize payments
    const safePayments: Record<string, PaymentRecord> = {};
    if (payments && typeof payments === 'object' && !Array.isArray(payments)) {
      for (const [key, record] of Object.entries(payments)) {
        if (typeof key === 'string' && key.length < 80 && record && typeof record === 'object') {
          safePayments[key] = {
            paid: Boolean((record as PaymentRecord).paid),
            paidAt: typeof (record as PaymentRecord).paidAt === 'string' ? (record as PaymentRecord).paidAt : undefined,
          };
        }
      }
    }

    // Validate and sanitize plannings
    const safePlannings: Planning[] = [];
    if (Array.isArray(plannings)) {
      for (const plan of plannings) {
        if (plan && typeof plan.id === 'string' && typeof plan.title === 'string') {
          const safeItems: Planning['items'] = [];
          if (Array.isArray(plan.items)) {
            for (const item of plan.items) {
              if (item && typeof item.id === 'string' && typeof item.name === 'string' && typeof item.amount === 'number') {
                safeItems.push({
                  id: item.id.slice(0, 50),
                  name: item.name.slice(0, 100),
                  amount: Number(Math.max(0, item.amount).toFixed(2)),
                  done: Boolean(item.done),
                });
              }
            }
          }
          safePlannings.push({
            id: plan.id.slice(0, 50),
            title: plan.title.slice(0, 100),
            targetAmount: typeof plan.targetAmount === 'number' && !isNaN(plan.targetAmount) ? Number(plan.targetAmount.toFixed(2)) : undefined,
            notes: typeof plan.notes === 'string' ? plan.notes.slice(0, 300) : undefined,
            items: safeItems,
            createdAt: typeof plan.createdAt === 'string' ? plan.createdAt : new Date().toISOString(),
          });
        }
      }
    }

    // Validate and sanitize simulations
    const safeSimulations: SimulationItem[] = [];
    if (Array.isArray(simulations)) {
      for (const sim of simulations) {
        if (sim && typeof sim.id === 'string' && typeof sim.name === 'string' && typeof sim.amount === 'number') {
          safeSimulations.push({
            id: sim.id.slice(0, 50),
            name: sim.name.slice(0, 100),
            amount: Number(Math.max(0, sim.amount).toFixed(2)),
          });
        }
      }
    }

    saveUserFinancialData(userId, {
      salary: safeSalary,
      fixedBills: safeFixedBills,
      payments: safePayments,
      plannings: safePlannings,
      simulations: safeSimulations,
    });
    return true;
  } catch (err) {
    console.error('Erro ao importar dados:', err);
    return false;
  }
}
