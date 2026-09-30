export type BillCategory =
  | 'Moradia'
  | 'Telecomunicações'
  | 'Serviços'
  | 'Transporte'
  | 'Saúde'
  | 'Educação'
  | 'Alimentação'
  | 'Seguros'
  | 'Lazer'
  | 'Outros';

export interface FixedBill {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // 1 to 31
  startDate: string; // YYYY-MM
  endDate: string; // YYYY-MM
  category: BillCategory;
  notes?: string;
  createdAt: string;
}

export interface BillOccurrence {
  billId: string;
  name: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  dueDay: number;
  category: BillCategory;
  notes?: string;
  isPaid: boolean;
  paidAt?: string;
  isOverdue: boolean;
  yearMonth: string; // YYYY-MM
}

export interface PaymentRecord {
  paid: boolean;
  paidAt?: string;
}

export interface SimulationItem {
  id: string;
  name: string;
  amount: number;
  category?: string;
}

export interface PlanningItem {
  id: string;
  name: string;
  amount: number;
  done?: boolean;
}

export interface Planning {
  id: string;
  title: string;
  targetAmount?: number;
  items: PlanningItem[];
  notes?: string;
  createdAt: string;
}

export interface SubscriptionStatus {
  isTrial: boolean;
  trialDaysTotal: number;
  trialDaysLeft: number;
  isExpired: boolean;
  isSubscribed: boolean;
  accessGranted: boolean;
  registeredAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  hasBiometrics?: boolean;
  biometricCredentialId?: string;
  isSubscribed?: boolean;
  subscriptionPlan?: string;
  subscriptionExpiresAt?: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'calendar'
  | 'bills'
  | 'simulator'
  | 'plannings'
  | 'settings';
