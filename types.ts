
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  PUBLIC = 'PUBLIC'
}

export interface AppUser {
  id: string;
  username: string;
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
  | 'Settings';

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
}

export interface InternalMember {
  id: string;
  fullName: string; // public
  position: string; // public
  address: string;
  waNumber: string;
  email: string;
}

export interface Auditor {
  id: string;
  fullName: string; // public
  position: string; // public
  certNumber: string;
  address: string;
  waNumber: string;
  email: string;
}

export interface Partner {
  id: string;
  fullName: string; // public
  position: string;
  cert: string;
  address: string;
  waNumber: string;
  email: string;
}

export interface Documentation {
  id: string;
  title: string;
  category: string;
  uploadDate: string;
  link: string;
}

export interface Letter {
  id: string;
  title: string;
  letterNumber: string;
  date: string;
  type: 'Incoming' | 'Outgoing';
  link: string;
}

export interface Asset {
  id: string;
  name: string;
  receivedDate: string;
  estimatedValue: number;
  condition: 'Good' | 'Broken' | 'Maintenance';
}

export interface Activity {
  id: string;
  delegates: string[]; // public
  event: string; // public
  location: string; // public
  time: string; // public
  date: string; // public
  notes: string; // public
}

export interface FinanceRecord {
  id: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}
