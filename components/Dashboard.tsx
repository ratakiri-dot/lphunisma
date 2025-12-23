
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import NeumorphicCard from './NeumorphicCard';
import { getDashboardInsight } from '../services/geminiService';
import { Bot, TrendingUp, Users, CheckCircle } from 'lucide-react';
import { UserRole } from '../types';

interface DashboardProps {
  role: UserRole;
}

const Dashboard: React.FC<DashboardProps> = ({ role }) => {
  const [insight, setInsight] = useState<string>("Menganalisis data...");
  const isPublic = role === UserRole.PUBLIC;

  // Mock data for charts
  const puData = [
    { name: 'Certified', value: 45, color: '#4CAF50' },
    { name: 'On Process', value: 30, color: '#FFC107' },
    { name: 'Prospect', value: 25, color: '#2196F3' },
  ];

  const peopleData = [
    { name: 'Internal', count: 12, color: '#6366F1' }, // Indigo
    { name: 'Auditor', count: 8, color: '#A855F7' },  // Purple
    { name: 'Partners', count: 15, color: '#0EA5E9' }, // Sky Blue
  ];

  const financeData = [
    { month: 'Jan', balance: 4000 },
    { month: 'Feb', balance: 5200 },
    { month: 'Mar', balance: 4800 },
    { month: 'Apr', balance: 7000 },
    { month: 'May', balance: 6500 },
    { month: 'Jun', balance: 9000 },
  ];

  useEffect(() => {
    const fetchInsight = async () => {
      const summary = await getDashboardInsight({ puData, peopleData, financeData });
      setInsight(summary || "Data siap dianalisis.");
    };
    fetchInsight();
  }, []);

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
          <h3 className="font-bold text-lg">{isPublic ? 'Tren Pertumbuhan' : 'Pertumbuhan Saldo'}</h3>
        </div>
        <div className="flex-grow">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={financeData}>
              <defs>
                <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818CF8" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#818CF8" stopOpacity={0}/>
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
    </div>
  );
};

export default Dashboard;
