
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  PUBLIC = 'PUBLIC'
}

export interface AppUser {
  id: string;
  username: string;
  fullName?: string;
  role: UserRole;
  password: string;
}

export type NavItem =
  | 'Dashboard'
  | 'PU Certified'
  | 'PU On Process'
  | 'PU Prospect'
  | 'Internal'
  | 'Auditor'
  | 'Partners'
  | 'Docs'
  | 'Letters'
  | 'Assets'
  | 'Schedule'
  | 'Finance'
  | 'Settings'
  | 'Tasks';

export interface PUCertified {
  id: string;
  regNo: string; // public
  businessName: string; // public
  ownerName: string;
  waNumber: string;
  email: string;
  businessAddress: string;
  productionAddress: string;
  nib: string;
  halalId: string; // public
  expiryDate: string; // public
  createdBy?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface PUOnProcess {
  id: string;
  regNo: string; // public
  businessName: string; // public
  ownerName: string;
  waNumber: string;
  email: string;
  socialMedia: string;
  businessAddress: string;
  productionAddress: string;
  nib: string;
  status: string; // public
  createdBy?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface PUProspect {
  id: string;
  businessName: string;
  ownerName: string;
  waNumber: string;
  email: string;
  socialMedia: string;
  followUpDate: string;
  notes: string;
  createdBy?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface InternalMember {
  id: string;
  fullName: string; // public
  position: string; // public
  address: string;
  waNumber: string;
  email: string;
  createdBy?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface Auditor {
  id: string;
  fullName: string; // public
  position: string; // public
  certNumber: string;
  address: string;
  waNumber: string;
  email: string;
  createdBy?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface Partner {
  id: string;
  fullName: string; // public
  position: string;
  cert: string;
  address: string;
  waNumber: string;
  email: string;
  createdBy?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface Documentation {
  id: string;
  title: string;
  category: string;
  uploadDate: string;
  link: string;
  createdBy?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface Letter {
  id: string;
  title: string;
  letterNumber: string;
  date: string;
  type: 'Incoming' | 'Outgoing';
  link: string;
  createdBy?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface Asset {
  id: string;
  assetNo?: string;
  name: string;
  receivedDate: string;
  estimatedValue: number;
  condition: 'Good' | 'Broken' | 'Maintenance';
  createdBy?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface Activity {
  id: string;
  delegates: string[]; // public
  event: string; // public
  location: string; // public
  time: string; // public
  date: string; // public
  notes: string; // public
  createdBy?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface FinanceRecord {
  id: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  createdBy?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface UserTask {
  id: string;
  title: string;
  description?: string;
  isPinned: boolean;
  status: 'Pending' | 'Completed';
  createdBy: string;
  completedBy?: string;
  completedAt?: string;
  createdAt?: string;
}
