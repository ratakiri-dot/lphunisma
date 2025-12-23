
import { supabase } from './supabaseClient';
import { PUCertified, PUOnProcess, PUProspect, FinanceRecord, Activity, Asset, Documentation, Letter, InternalMember, Auditor, Partner, AppUser } from '../types';

export const dataService = {
    // PU Certified
    async getPUCertified() {
        const { data, error } = await supabase.from('pu_certified').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },
    async upsertPUCertified(item: Partial<PUCertified>) {
        const { data, error } = await supabase.from('pu_certified').upsert(item).select().single();
        if (error) throw error;
        return data;
    },
    async deletePUCertified(id: string) {
        const { error } = await supabase.from('pu_certified').delete().eq('id', id);
        if (error) throw error;
    },

    // PU On Process
    async getPUOnProcess() {
        const { data, error } = await supabase.from('pu_on_process').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },
    async upsertPUOnProcess(item: Partial<PUOnProcess>) {
        const { data, error } = await supabase.from('pu_on_process').upsert(item).select().single();
        if (error) throw error;
        return data;
    },
    async deletePUOnProcess(id: string) {
        const { error } = await supabase.from('pu_on_process').delete().eq('id', id);
        if (error) throw error;
    },

    // PU Prospect
    async getPUProspect() {
        const { data, error } = await supabase.from('pu_prospect').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },
    async upsertPUProspect(item: Partial<PUProspect>) {
        const { data, error } = await supabase.from('pu_prospect').upsert(item).select().single();
        if (error) throw error;
        return data;
    },
    async deletePUProspect(id: string) {
        const { error } = await supabase.from('pu_prospect').delete().eq('id', id);
        if (error) throw error;
    },

    // Finance
    async getFinance() {
        const { data, error } = await supabase.from('finance_records').select('*').order('date', { ascending: true });
        if (error) throw error;
        return data;
    },
    async upsertFinance(item: Partial<FinanceRecord>) {
        const { data, error } = await supabase.from('finance_records').upsert(item).select().single();
        if (error) throw error;
        return data;
    },
    async deleteFinance(id: string) {
        const { error } = await supabase.from('finance_records').delete().eq('id', id);
        if (error) throw error;
    },

    // Schedule / Activities
    async getActivities() {
        const { data, error } = await supabase.from('activities').select('*').order('date', { ascending: true });
        if (error) throw error;
        return data;
    },
    async upsertActivity(item: Partial<Activity>) {
        const { data, error } = await supabase.from('activities').upsert(item).select().single();
        if (error) throw error;
        return data;
    },
    async deleteActivity(id: string) {
        const { error } = await supabase.from('activities').delete().eq('id', id);
        if (error) throw error;
    },

    // Assets
    async getAssets() {
        const { data, error } = await supabase.from('assets').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },
    async upsertAsset(item: Partial<Asset>) {
        const { data, error } = await supabase.from('assets').upsert(item).select().single();
        if (error) throw error;
        return data;
    },
    async deleteAsset(id: string) {
        const { error } = await supabase.from('assets').delete().eq('id', id);
        if (error) throw error;
    },

    // Internal
    async getInternal() {
        const { data, error } = await supabase.from('internal_members').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },
    async upsertInternal(item: Partial<InternalMember>) {
        const { data, error } = await supabase.from('internal_members').upsert(item).select().single();
        if (error) throw error;
        return data;
    },
    async deleteInternal(id: string) {
        const { error } = await supabase.from('internal_members').delete().eq('id', id);
        if (error) throw error;
    },

    // Auditors
    async getAuditors() {
        const { data, error } = await supabase.from('auditors').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },
    async upsertAuditor(item: Partial<Auditor>) {
        const { data, error } = await supabase.from('auditors').upsert(item).select().single();
        if (error) throw error;
        return data;
    },
    async deleteAuditor(id: string) {
        const { error } = await supabase.from('auditors').delete().eq('id', id);
        if (error) throw error;
    },

    // Partners
    async getPartners() {
        const { data, error } = await supabase.from('partners').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },
    async upsertPartner(item: Partial<Partner>) {
        const { data, error } = await supabase.from('partners').upsert(item).select().single();
        if (error) throw error;
        return data;
    },
    async deletePartner(id: string) {
        const { error } = await supabase.from('partners').delete().eq('id', id);
        if (error) throw error;
    },

    // Letters
    async getLetters() {
        const { data, error } = await supabase.from('letters').select('*').order('date', { ascending: false });
        if (error) throw error;
        return data;
    },
    async upsertLetter(item: Partial<Letter>) {
        const { data, error } = await supabase.from('letters').upsert(item).select().single();
        if (error) throw error;
        return data;
    },
    async deleteLetter(id: string) {
        const { error } = await supabase.from('letters').delete().eq('id', id);
        if (error) throw error;
    },

    // Docs
    async getDocs() {
        const { data, error } = await supabase.from('documentation').select('*').order('upload_date', { ascending: false });
        if (error) throw error;
        return data;
    },
    async upsertDoc(item: Partial<Documentation>) {
        const { data, error } = await supabase.from('documentation').upsert(item).select().single();
        if (error) throw error;
        return data;
    },

    // App Users
    async getUsers() {
        const { data, error } = await supabase.from('app_users').select('*').order('username', { ascending: true });
        if (error) throw error;
        return data;
    },
    async upsertUser(item: Partial<AppUser>) {
        // Map types to DB columns if necessary, but AppUser matches app_users table
        const { data, error } = await supabase.from('app_users').upsert(item).select().single();
        if (error) throw error;
        return data;
    },
    async deleteUser(id: string) {
        const { error } = await supabase.from('app_users').delete().eq('id', id);
        if (error) throw error;
    }
};
