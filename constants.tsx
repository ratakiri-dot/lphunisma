
import React from 'react';
import { 
  LayoutDashboard, 
  CheckCircle, 
  Loader2, 
  Target, 
  Users, 
  UserCheck, 
  Handshake, 
  FileText, 
  Mail, 
  Package, 
  Calendar, 
  Wallet, 
  Settings 
} from 'lucide-react';
import { NavItem, PUCertified, PUOnProcess, PUProspect, InternalMember, Auditor, Partner, Documentation, Letter, Asset, Activity, FinanceRecord } from './types';

export const MENU_ITEMS: { name: NavItem; icon: React.ReactNode; category: string }[] = [
  { name: 'Dashboard', icon: <LayoutDashboard size={20} />, category: 'Main' },
  { name: 'PU Certified', icon: <CheckCircle size={20} />, category: 'Business' },
  { name: 'PU On Process', icon: <Loader2 size={20} />, category: 'Business' },
  { name: 'PU Prospect', icon: <Target size={20} />, category: 'Business' },
  { name: 'Internal', icon: <Users size={20} />, category: 'Management' },
  { name: 'Auditor', icon: <UserCheck size={20} />, category: 'Management' },
  { name: 'Partners', icon: <Handshake size={20} />, category: 'Management' },
  { name: 'Docs', icon: <FileText size={20} />, category: 'Office' },
  { name: 'Letters', icon: <Mail size={20} />, category: 'Office' },
  { name: 'Assets', icon: <Package size={20} />, category: 'Office' },
  { name: 'Schedule', icon: <Calendar size={20} />, category: 'Admin' },
  { name: 'Finance', icon: <Wallet size={20} />, category: 'Admin' },
  { name: 'Settings', icon: <Settings size={20} />, category: 'System' },
];

export const MOCK_PU_CERTIFIED: PUCertified[] = [
  { id: '1', regNo: 'SH-001', businessName: 'Bakery UNISMA', ownerName: 'Ahmad Fauzi', waNumber: '08123456789', email: 'ahmad@unisma.ac.id', businessAddress: 'Malang', productionAddress: 'Lowokwaru', nib: '12345678', halalId: 'ID35110001', expiryDate: '2027-12-01' },
  { id: '2', regNo: 'SH-002', businessName: 'Sambal Gami', ownerName: 'Siti Aminah', waNumber: '08567891234', email: 'siti@gmail.com', businessAddress: 'Batu', productionAddress: 'Batu Town', nib: '87654321', halalId: 'ID35110002', expiryDate: '2028-05-20' },
];

export const MOCK_PU_ON_PROCESS: PUOnProcess[] = [
  { id: 'p1', regNo: 'PRC-001', businessName: 'Kopi Kenangan Kampus', ownerName: 'Doni Tata', waNumber: '0812121212', email: 'doni@kopi.com', socialMedia: '@kopikenangan', businessAddress: 'Malang', productionAddress: 'Dinoyo', nib: '10293847', status: 'Audit Lapangan' },
  { id: 'p2', regNo: 'PRC-002', businessName: 'Catering Sehat', ownerName: 'Rina Nose', waNumber: '0855443322', email: 'rina@catering.com', socialMedia: '@catersehat', businessAddress: 'Malang', productionAddress: 'Sukarno Hatta', nib: '56473829', status: 'Verifikasi Dokumen' },
];

export const MOCK_PU_PROSPECT: PUProspect[] = [
  { id: 'pr1', businessName: 'Warung Barokah', ownerName: 'Pak Haji', waNumber: '0811998877', email: 'barokah@gmail.com', socialMedia: '-', followUpDate: '2024-04-10', notes: 'Tertarik skema Self Declare' },
  { id: 'pr2', businessName: 'Snack Kriuk', ownerName: 'Ibu Ratna', waNumber: '0812334455', email: 'ratna@snack.id', socialMedia: '@snackkriuk', followUpDate: '2024-04-15', notes: 'Menunggu konfirmasi biaya audit' },
];

export const MOCK_FINANCE: FinanceRecord[] = [
  { id: '1', date: '2023-10-01', description: 'Initial Balance', debit: 5000000, credit: 0, balance: 5000000 },
  { id: '2', date: '2023-10-15', description: 'Certification Fee PU1', debit: 1500000, credit: 0, balance: 6500000 },
  { id: '3', date: '2023-11-05', description: 'Auditor Transport', debit: 0, credit: 200000, balance: 6300000 },
  { id: '4', date: '2023-11-20', description: 'Event Sponsorship', debit: 2000000, credit: 0, balance: 8300000 },
  { id: '5', date: '2023-12-01', description: 'Office Supplies', debit: 0, credit: 500000, balance: 7800000 },
];

export const MOCK_SCHEDULE: Activity[] = [
  { id: '1', delegates: ['Ahmad Fauzi', 'Dr. Khoirul'], event: 'Halal Expo 2024', location: 'Jakarta Convention Center', time: '09:00', date: '2024-03-12', notes: 'Exhibition booth setup' },
  { id: '2', delegates: ['Siti Aminah'], event: 'Auditor Training', location: 'UNISMA Hall', time: '13:00', date: '2024-02-15', notes: 'Requirement update session' },
];

export const MOCK_ASSETS: Asset[] = [
  { id: '1', name: 'MacBook Pro 14 M2', receivedDate: '2023-05-10', estimatedValue: 25000000, condition: 'Good' },
  { id: '2', name: 'Printer Epson L3210', receivedDate: '2022-11-15', estimatedValue: 2500000, condition: 'Good' },
  { id: '3', name: 'Projector Sony VPL-DX221', receivedDate: '2021-08-20', estimatedValue: 4500000, condition: 'Maintenance' },
  { id: '4', name: 'Office Desk A1', receivedDate: '2020-01-05', estimatedValue: 1200000, condition: 'Good' },
];

export const MOCK_DOCS: Documentation[] = [
  { id: '1', title: 'SOP Sertifikasi Self-Declare', category: 'SOP', uploadDate: '2023-08-12', link: '#' },
  { id: '2', title: 'Panduan Audit On-Site', category: 'Guideline', uploadDate: '2023-09-05', link: '#' },
  { id: '3', title: 'Regulasi JPH Terbaru 2024', category: 'Regulation', uploadDate: '2024-01-10', link: '#' },
];

export const MOCK_LETTERS: Letter[] = [
  { id: '1', title: 'Undangan Rapat BPJPH', letterNumber: '045/LPH/UNISMA/III/2024', date: '2024-03-01', type: 'Incoming', link: '#' },
  { id: '2', title: 'Permohonan Kerjasama Pemda Malang', letterNumber: '012/LPH-OUT/II/2024', date: '2024-02-25', type: 'Outgoing', link: '#' },
  { id: '3', title: 'Surat Tugas Auditor - CV Maju Jaya', letterNumber: 'ST-088/LPH/2024', date: '2024-03-05', type: 'Outgoing', link: '#' },
];

export const MOCK_INTERNAL: InternalMember[] = [
  { id: '1', fullName: 'Dr. Ahmad Fauzi, M.Si', position: 'Kepala LPH', address: 'Malang', waNumber: '08123456789', email: 'fauzi@unisma.ac.id' },
  { id: '2', fullName: 'Siti Rohmah, M.E', position: 'Sekretaris', address: 'Batu', waNumber: '08567891234', email: 'rohmah@unisma.ac.id' },
  { id: '3', fullName: 'Budi Santoso', position: 'Staff IT', address: 'Malang', waNumber: '08991122334', email: 'budi@unisma.ac.id' },
];

export const MOCK_AUDITORS: Auditor[] = [
  { id: '1', fullName: 'H. Abdullah, Ph.D', position: 'Senior Auditor', certNumber: 'AUD-99212', address: 'Surabaya', waNumber: '081122334455', email: 'abdullah@audit.id' },
  { id: '2', fullName: 'Ir. Maria Ulfa', position: 'Lead Auditor Food', certNumber: 'AUD-88123', address: 'Malang', waNumber: '087766554433', email: 'maria@audit.id' },
];

export const MOCK_PARTNERS: Partner[] = [
  { id: '1', fullName: 'PT. Halal Solution Indonesia', position: 'Business Partner', cert: 'Kemitraan Strategis', address: 'Jakarta', waNumber: '021-998877', email: 'info@halalsolution.com' },
  { id: '2', fullName: 'Asosiasi Pengusaha Muslim', position: 'community Partner', cert: 'MoU 2023', address: 'Bandung', waNumber: '0812233445', email: 'contact@apm.id' },
];
