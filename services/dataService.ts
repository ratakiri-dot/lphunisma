
import { supabase } from './supabaseClient';
import { PUCertified, PUOnProcess, PUProspect, FinanceRecord, Activity, Asset, Documentation, Letter, InternalMember, Auditor, Partner, AppUser, UserTask } from '../types';

const mapToSnake = (obj: any) => {
    if (!obj) return obj;
    const mapped: any = {};
    Object.keys(obj).forEach(key => {
        const snakeKey = key.replace(/[A-Z]/g, match => `_${match.toLowerCase()}`);
        mapped[snakeKey] = obj[key];
    });
    return mapped;
};

const mapToCamel = (obj: any) => {
    if (!obj) return obj;
    const mapped: any = {};
    Object.keys(obj).forEach(key => {
        const camelKey = key.replace(/(_\w)/g, match => match[1].toUpperCase());
        mapped[camelKey] = obj[key];
    });
    return mapped;
};

export const dataService = {
    // PU Certified
    async getPUCertified() {
        const { data, error } = await supabase.from('pu_certified').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(mapToCamel);
    },
    async upsertPUCertified(item: Partial<PUCertified>) {
        const snakeItem = mapToSnake(item);
        const { data, error } = await supabase.from('pu_certified').upsert(snakeItem).select().single();
        if (error) throw error;
        return mapToCamel(data);
    },
    async deletePUCertified(id: string) {
        const { error } = await supabase.from('pu_certified').delete().eq('id', id);
        if (error) throw error;
    },

    // PU On Process
    async getPUOnProcess() {
        const { data, error } = await supabase.from('pu_on_process').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(mapToCamel);
    },
    async upsertPUOnProcess(item: Partial<PUOnProcess>) {
        const snakeItem = mapToSnake(item);
        const { data, error } = await supabase.from('pu_on_process').upsert(snakeItem).select().single();
        if (error) throw error;
        return mapToCamel(data);
    },
    async deletePUOnProcess(id: string) {
        const { error } = await supabase.from('pu_on_process').delete().eq('id', id);
        if (error) throw error;
    },

    // PU Prospect
    async getPUProspect() {
        const { data, error } = await supabase.from('pu_prospect').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(mapToCamel);
    },
    async upsertPUProspect(item: Partial<PUProspect>) {
        const snakeItem = mapToSnake(item);
        const { data, error } = await supabase.from('pu_prospect').upsert(snakeItem).select().single();
        if (error) throw error;
        return mapToCamel(data);
    },
    async deletePUProspect(id: string) {
        const { error } = await supabase.from('pu_prospect').delete().eq('id', id);
        if (error) throw error;
    },

    // Finance
    async getFinance() {
        const { data, error } = await supabase.from('finance_records').select('*').order('date', { ascending: true });
        if (error) throw error;
        return data.map(mapToCamel);
    },
    async upsertFinance(item: Partial<FinanceRecord>) {
        const snakeItem = mapToSnake(item);
        const { data, error } = await supabase.from('finance_records').upsert(snakeItem).select().single();
        if (error) throw error;
        return mapToCamel(data);
    },
    async deleteFinance(id: string) {
        const { error } = await supabase.from('finance_records').delete().eq('id', id);
        if (error) throw error;
    },

    // Schedule / Activities
    async getActivities() {
        const { data, error } = await supabase.from('activities').select('*').order('date', { ascending: true });
        if (error) throw error;
        return data.map(mapToCamel);
    },
    async upsertActivity(item: Partial<Activity>) {
        const snakeItem = mapToSnake(item);
        const { data, error } = await supabase.from('activities').upsert(snakeItem).select().single();
        if (error) throw error;
        return mapToCamel(data);
    },
    async deleteActivity(id: string) {
        const { error } = await supabase.from('activities').delete().eq('id', id);
        if (error) throw error;
    },

    // Assets
    async getAssets() {
        const { data, error } = await supabase.from('assets').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(mapToCamel);
    },
    async upsertAsset(item: Partial<Asset>) {
        const snakeItem = mapToSnake(item);
        const { data, error } = await supabase.from('assets').upsert(snakeItem).select().single();
        if (error) throw error;
        return mapToCamel(data);
    },
    async deleteAsset(id: string) {
        const { error } = await supabase.from('assets').delete().eq('id', id);
        if (error) throw error;
    },

    // Internal
    async getInternal() {
        const { data, error } = await supabase.from('internal_members').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(mapToCamel);
    },
    async upsertInternal(item: Partial<InternalMember>) {
        const snakeItem = mapToSnake(item);
        const { data, error } = await supabase.from('internal_members').upsert(snakeItem).select().single();
        if (error) throw error;
        return mapToCamel(data);
    },
    async deleteInternal(id: string) {
        const { error } = await supabase.from('internal_members').delete().eq('id', id);
        if (error) throw error;
    },

    // Auditors
    async getAuditors() {
        const { data, error } = await supabase.from('auditors').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(mapToCamel);
    },
    async upsertAuditor(item: Partial<Auditor>) {
        const snakeItem = mapToSnake(item);
        const { data, error } = await supabase.from('auditors').upsert(snakeItem).select().single();
        if (error) throw error;
        return mapToCamel(data);
    },
    async deleteAuditor(id: string) {
        const { error } = await supabase.from('auditors').delete().eq('id', id);
        if (error) throw error;
    },

    // Partners
    async getPartners() {
        const { data, error } = await supabase.from('partners').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(mapToCamel);
    },
    async upsertPartner(item: Partial<Partner>) {
        const snakeItem = mapToSnake(item);
        const { data, error } = await supabase.from('partners').upsert(snakeItem).select().single();
        if (error) throw error;
        return mapToCamel(data);
    },
    async deletePartner(id: string) {
        const { error } = await supabase.from('partners').delete().eq('id', id);
        if (error) throw error;
    },

    // Letters
    async getLetters() {
        const { data, error } = await supabase.from('letters').select('*').order('date', { ascending: false });
        if (error) throw error;
        return data.map(mapToCamel);
    },
    async upsertLetter(item: Partial<Letter>) {
        const snakeItem = mapToSnake(item);
        const { data, error } = await supabase.from('letters').upsert(snakeItem).select().single();
        if (error) throw error;
        return mapToCamel(data);
    },
    async deleteLetter(id: string) {
        const { error } = await supabase.from('letters').delete().eq('id', id);
        if (error) throw error;
    },

    // Docs
    async getDocs() {
        const { data, error } = await supabase.from('documentation').select('*').order('upload_date', { ascending: false });
        if (error) throw error;
        return data.map(mapToCamel);
    },
    async upsertDoc(item: Partial<Documentation>) {
        const snakeItem = mapToSnake(item);
        const { data, error } = await supabase.from('documentation').upsert(snakeItem).select().single();
        if (error) throw error;
        return mapToCamel(data);
    },
    async deleteDoc(id: string) {
        const { error } = await supabase.from('documentation').delete().eq('id', id);
        if (error) throw error;
    },

    // App Users
    async getUsers() {
        const { data, error } = await supabase.from('app_users').select('*').order('username', { ascending: true });
        if (error) throw error;
        return data.map(mapToCamel);
    },
    async upsertUser(item: Partial<AppUser>) {
        const snakeItem = mapToSnake(item);
        const { data, error } = await supabase.from('app_users').upsert(snakeItem).select().single();
        if (error) throw error;
        return mapToCamel(data);
    },
    async deleteUser(id: string) {
        const { error } = await supabase.from('app_users').delete().eq('id', id);
        if (error) throw error;
    },
    async verifyUser(username: string, password: string) {
        const { data, error } = await supabase
            .from('app_users')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .single();
        if (error) return null;
        return mapToCamel(data) as AppUser;
    },

    // Tasks API
    async getTasks() {
        const { data, error } = await supabase.from('user_tasks').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data.map(mapToCamel);
    },
    async upsertTask(task: Partial<UserTask>) {
        const snakeItem = mapToSnake(task);
        const { data, error } = await supabase.from('user_tasks').upsert(snakeItem).select().single();
        if (error) throw error;
        return mapToCamel(data);
    },
    async deleteTask(id: string) {
        const { error } = await supabase.from('user_tasks').delete().eq('id', id);
        if (error) throw error;
    }
};
