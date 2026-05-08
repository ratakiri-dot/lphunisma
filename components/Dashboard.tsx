
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, Legend } from 'recharts';
import NeumorphicCard from './NeumorphicCard';
import { getDashboardInsight } from '../services/geminiService';
import { Bot, TrendingUp, Users, CheckCircle, Zap, MapPin, Github, Globe, Database, Cpu } from 'lucide-react';
import { PUCertified, PUOnProcess, PUProspect, InternalMember, Auditor, Partner, FinanceRecord, UserRole } from '../types';

interface DashboardProps {
  role: UserRole;
  data: {
    puCertified: PUCertified[];
    puOnProcess: PUOnProcess[];
    puProspect: PUProspect[];
    internal: InternalMember[];
    auditors: Auditor[];
    partners: Partner[];
    finance: FinanceRecord[];
  };
}

const Dashboard: React.FC<DashboardProps> = ({ role, data }) => {
  const [insight, setInsight] = useState<string>("Menganalisis data...");
  const isPublic = role === UserRole.PUBLIC;

  const { puCertified, puOnProcess, puProspect, internal, auditors, partners, finance } = data;

  // Real data for charts
  const totalPU = puCertified.length + puOnProcess.length + puProspect.length || 1; // avoid div by zero
  const puData = [
    { name: 'Certified', value: Math.round((puCertified.length / totalPU) * 100), color: '#4CAF50' },
    { name: 'On Process', value: Math.round((puOnProcess.length / totalPU) * 100), color: '#FFC107' },
    { name: 'Prospect', value: Math.round((puProspect.length / totalPU) * 100), color: '#2196F3' },
  ];

  const peopleData = [
    { name: 'Internal', count: internal.length, color: '#6366F1' },
    { name: 'Auditor', count: auditors.length, color: '#A855F7' },
    { name: 'Partners', count: partners.length, color: '#0EA5E9' },
  ];

  // Calculate the actual total balance manually from all records to ensure perfect accuracy
  const manualBalance = finance.reduce((acc, curr) => acc + (Number(curr.debit) || 0) - (Number(curr.credit) || 0), 0);
  const dbBalance = finance.length > 0 ? Number(finance[0].balance) : 0;
  const latestBalance = manualBalance; // We trust manual sum for the primary display
  const hasDiscrepancy = Math.abs(manualBalance - dbBalance) > 1;

  // Group finance by month-year to show the latest balance of each month
  const financeSorted = [...finance].sort((a, b) => {
    const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return (a.createdAt || '').localeCompare(b.createdAt || '');
  });
  
  const monthGroups: { [key: string]: { month: string, balance: number, timestamp: number } } = {};
  
  financeSorted.forEach(curr => {
    const d = new Date(curr.date);
    const monthLabel = d.toLocaleDateString('id-ID', { month: 'short' });
    const yearLabel = d.getFullYear();
    const fullLabel = `${monthLabel} ${yearLabel}`;
    // Use first day of month as timestamp for stable chronological sorting of groups
    const timestamp = new Date(yearLabel, d.getMonth(), 1).getTime();
    
    // For the chart, we need the running balance at the end of each month.
    // We'll calculate this by finding the latest transaction of the month and using its balance field,
    // but since we're now being extra careful, let's ensure we use the record that has the highest chronological position.
    
    monthGroups[fullLabel] = {
      month: fullLabel,
      balance: Number(curr.balance),
      timestamp: timestamp
    };
  });
  
  // Final verification: ensure the last point on the chart EXACTLY matches our manual latestBalance
  const financeDataArray = Object.values(monthGroups).sort((a, b) => a.timestamp - b.timestamp);
  if (financeDataArray.length > 0) {
    financeDataArray[financeDataArray.length - 1].balance = latestBalance;
  }
  
  const financeData = financeDataArray.length > 0
    ? financeDataArray
    : [
      { month: 'Jan 2025', balance: 0 },
      { month: 'Feb 2025', balance: 0 },
      { month: 'Mar 2025', balance: 0 },
    ];

  // SLA Calculation
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  
  // Initialize data array with all months
  const initialSlaData = months.map(month => ({ 
    month, 
    "2024": null, 
    "2025": null, 
    "2026": null, 
    counts: { "2024": 0, "2025": 0, "2026": 0 }, 
    totals: { "2024": 0, "2025": 0, "2026": 0 } 
  }));

  const slaDataByMonth = puCertified.reduce((acc: any[], curr) => {
    if (curr.lphProcessDate && curr.lphFinishedDate) {
      const processDate = new Date(curr.lphProcessDate);
      const finishedDate = new Date(curr.lphFinishedDate);
      
      const monthIndex = processDate.getMonth();
      const year = processDate.getFullYear().toString();
      
      const diffTime = finishedDate.getTime() - processDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (['2024', '2025', '2026'].includes(year)) {
        acc[monthIndex].totals[year] += diffDays;
        acc[monthIndex].counts[year] += 1;
      }
    }
    return acc;
  }, initialSlaData);

  const slaData = slaDataByMonth.map(item => {
    const result: any = { month: item.month };
    ['2024', '2025', '2026'].forEach(year => {
      if (item.counts[year] > 0) {
        result[year] = Math.round(item.totals[year] / item.counts[year]);
      }
    });
    return result;
  });

  useEffect(() => {
    const fetchInsight = async () => {
      const summary = await getDashboardInsight({ puData, peopleData, financeData, slaData });
      setInsight(summary || "Data siap dianalisis.");
    };
    fetchInsight();
  }, []);

  const CustomSLATooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/40">
          <p className="text-xs font-black text-slate-700 mb-2 border-b border-slate-200 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <p className="text-xs font-bold text-slate-600">{entry.name}</p>
              </div>
              <p className="text-xs font-black" style={{ color: entry.color }}>
                {entry.value} Hari
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip to hide numbers for Guest Mode
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 backdrop-blur-md p-3 rounded-xl shadow-lg border border-white/40">
          <p className="text-xs font-black text-slate-700 mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            <p className="text-xs font-bold text-indigo-600">
              {isPublic ? 'Tren: Terdeteksi' : `Saldo: Rp ${payload[0].value.toLocaleString('id-ID')}`}
            </p>
          </div>
          {isPublic && (
            <p className="text-[10px] text-slate-400 mt-1 italic font-medium">Nominal disembunyikan (Akses Publik)</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
      {/* Financial Summary Stat Card */}
      {!isPublic && (
        <NeumorphicCard className="col-span-1 md:col-span-2 lg:col-span-3 border-l-4 border-emerald-400 bg-emerald-50/30">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 neu-button rounded-2xl text-emerald-600">
                <TrendingUp size={32} />
              </div>
              <div>
                <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Saldo Kas LPH UNISMA</h3>
                <p className="text-3xl font-black text-slate-800 tracking-tight">
                  Rp {latestBalance.toLocaleString('id-ID')}
                </p>
                {hasDiscrepancy && (
                  <div className="mt-2 p-2 bg-rose-100 rounded-lg border border-rose-200">
                    <p className="text-[9px] font-black text-rose-600 uppercase">Perhatian: Selisih Terdeteksi</p>
                    <p className="text-[10px] text-rose-500 font-medium">
                      Saldo Manual: Rp {manualBalance.toLocaleString('id-ID')} vs Saldo DB: Rp {dbBalance.toLocaleString('id-ID')}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Status Keuangan</p>
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <div className={`w-2 h-2 rounded-full animate-pulse ${hasDiscrepancy ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                {hasDiscrepancy ? 'Butuh Sinkronisasi Manual' : 'Terverifikasi & Sinkron'}
              </div>
            </div>
          </div>
        </NeumorphicCard>
      )}

      {/* AI Insight Section */}
      <NeumorphicCard className="col-span-1 md:col-span-2 lg:col-span-3 border-l-4 border-indigo-400 bg-indigo-50/30">
        <div className="flex items-start gap-4">
          <div className="p-3 neu-button rounded-xl text-indigo-600">
            <Bot size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-black text-indigo-500 uppercase tracking-widest mb-1">UNI AI LPH UNISMA</h3>
            <p className="text-gray-700 leading-relaxed font-medium italic text-sm">"{insight}"</p>
          </div>
        </div>
      </NeumorphicCard>

      {/* Chart 1: PU Status */}
      <NeumorphicCard className="h-96 flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <CheckCircle className="text-green-500" size={20} />
          <h3 className="font-bold text-lg">Status Pelaku Usaha</h3>
        </div>
        <div className="flex-grow">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={puData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {puData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-around mt-4 text-xs font-medium">
          {puData.map(d => (
            <div key={d.name} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
              <span>{d.name} ({d.value}%)</span>
            </div>
          ))}
        </div>
      </NeumorphicCard>

      {/* Chart 2: Internal/External Management - Multi Color Bars */}
      <NeumorphicCard className="h-96 flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <Users className="text-blue-500" size={20} />
          <h3 className="font-bold text-lg">Distribusi SDM</h3>
        </div>
        <div className="flex-grow">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={peopleData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CBD5E1" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#F1F5F9', opacity: 0.4 }} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={40}>
                {peopleData.map((entry, index) => (
                  <Cell key={`bar-cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-around mt-4 text-xs font-medium">
          {peopleData.map(d => (
            <div key={d.name} className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }}></div>
              <span className="text-slate-500">{d.name}</span>
            </div>
          ))}
        </div>
      </NeumorphicCard>

      {/* Chart 3: Financial Growth - Privacy Enabled for Guest */}
      <NeumorphicCard className="h-96 flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-indigo-500" size={20} />
          <h3 className="font-bold text-lg">{isPublic ? 'Performa Finansial' : 'Performa Keuangan'}</h3>
        </div>
        <div className="flex-grow">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={financeData}>
              <defs>
                <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818CF8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#818CF8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#818CF8"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorBal)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {isPublic && (
          <div className="mt-4 p-3 neu-inset rounded-xl text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Visualisasi Tren Terproteksi</p>
          </div>
        )}
      </NeumorphicCard>

      {/* Chart 4: SLA Performance */}
      <NeumorphicCard className="col-span-1 md:col-span-2 lg:col-span-3 h-96 flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="text-yellow-500" size={20} />
          <h3 className="font-bold text-lg">Performa SLA LPH</h3>
        </div>
        <div className="flex-grow">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={slaData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CBD5E1" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#F1F5F9', opacity: 0.4 }} content={<CustomSLATooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Line type="monotone" dataKey="2024" name="2024" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, fill: '#EF4444' }} activeDot={{ r: 6 }} connectNulls />
              <Line type="monotone" dataKey="2025" name="2025" stroke="#EAB308" strokeWidth={3} dot={{ r: 4, fill: '#EAB308' }} activeDot={{ r: 6 }} connectNulls />
              <Line type="monotone" dataKey="2026" name="2026" stroke="#22C55E" strokeWidth={3} dot={{ r: 4, fill: '#22C55E' }} activeDot={{ r: 6 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-center text-xs text-slate-500 italic font-medium">
          *Rata-rata SLA (Hari) - Semakin cepat semakin baik
        </div>
      </NeumorphicCard>

      {/* Map Section */}
      <NeumorphicCard className={`col-span-1 md:col-span-2 ${isPublic ? 'lg:col-span-3' : 'lg:col-span-2'} flex flex-col`}>
        <div className="flex items-center gap-2 mb-6">
          <MapPin className="text-red-500" size={20} />
          <h3 className="font-bold text-lg">Peta Persebaran Mitra Halal LPH UNISMA</h3>
        </div>
        <div className="w-full h-[480px] rounded-xl overflow-hidden shadow-inner bg-slate-100">
          <iframe 
            src="https://www.google.com/maps/d/u/0/embed?mid=1vGztQ3Y4d5WFmNEPfDA4POtQAf9z5wo&ehbc=2E312F" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Mitra Halal LPH UNISMA"
          />
        </div>
      </NeumorphicCard>

      {!isPublic && (
        <NeumorphicCard className="col-span-1 md:col-span-2 lg:col-span-1 flex flex-col justify-between border-t-4 border-slate-800 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Cpu className="text-slate-700" size={20} />
              <h3 className="font-black text-lg tracking-tight">System & Infra</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 neu-inset rounded-xl">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Github size={18} className="text-slate-800" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Repository</p>
                  <p className="text-xs font-bold text-slate-700">github.com/ratakiri-dot/lphunisma</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 neu-inset rounded-xl">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Globe size={18} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deployment</p>
                  <p className="text-xs font-bold text-slate-700">Vercel: lphunisma.vercel.app</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 neu-inset rounded-xl">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Database size={18} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Database Service</p>
                  <p className="text-xs font-bold text-slate-700">Supabase (ratakiri.dot@gmail.com)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-200">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 text-center">Tech Stack</p>
            <div className="flex justify-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all">
              <span className="px-2 py-1 bg-slate-200 rounded-md text-[9px] font-black">REACT 19</span>
              <span className="px-2 py-1 bg-slate-200 rounded-md text-[9px] font-black">VITE</span>
              <span className="px-2 py-1 bg-slate-200 rounded-md text-[9px] font-black">TAILWIND</span>
            </div>
          </div>
        </NeumorphicCard>
      )}
    </div>
  );
};

export default Dashboard;
