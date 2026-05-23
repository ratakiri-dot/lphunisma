import React, { useState, useEffect } from 'react';
import { Sparkles, Wallet, Copy, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import NeumorphicCard from './NeumorphicCard';
import { generateFinancialRecap } from '../services/geminiService';
import { FinanceRecord, AppUser } from '../types';

interface AIWorkspaceProps {
  finance: FinanceRecord[];
  currentUser: AppUser | null;
}

const AIWorkspace: React.FC<AIWorkspaceProps> = ({
  finance,
  currentUser
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  // Task-specific form states
  const [financeYear, setFinanceYear] = useState<string>(new Date().getFullYear().toString());
  const [financeStartMonth, setFinanceStartMonth] = useState<string>('01');
  const [financeEndMonth, setFinanceEndMonth] = useState<string>('12');

  // Derived financial years list from real data
  const availableYears = Array.from(
    new Set(finance.map((item) => new Date(item.date).getFullYear().toString()))
  ).sort((a, b) => b.localeCompare(a));

  // Sync state if the default year isn't in availableYears
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(financeYear)) {
      setFinanceYear(availableYears[0]);
    }
  }, [availableYears, financeYear]);

  const ALL_MONTHS = [
    { value: '01', label: 'Januari' }, { value: '02', label: 'Februari' }, { value: '03', label: 'Maret' },
    { value: '04', label: 'April' }, { value: '05', label: 'Mei' }, { value: '06', label: 'Juni' },
    { value: '07', label: 'Juli' }, { value: '08', label: 'Agustus' }, { value: '09', label: 'September' },
    { value: '10', label: 'Oktober' }, { value: '11', label: 'November' }, { value: '12', label: 'Desember' }
  ];

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExecuteAI = async () => {
    setIsLoading(true);
    setResult('');

    try {
      if (parseInt(financeStartMonth) > parseInt(financeEndMonth)) {
        alert('Bulan Awal tidak boleh lebih besar dari Bulan Akhir.');
        setIsLoading(false);
        return;
      }
      const aiOutput = await generateFinancialRecap(financeYear, finance, financeStartMonth, financeEndMonth);
      setResult(aiOutput);
    } catch (error) {
      console.error(error);
      setResult('Terjadi kesalahan saat memproses permintaan asisten AI.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar Task Options */}
      <div className="lg:col-span-4 space-y-6">
        <NeumorphicCard className="flex flex-col gap-4">
          <h3 className="font-black text-slate-700 text-sm uppercase tracking-widest flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-500" /> PILIH TUGAS AI
          </h3>

          <div className="flex flex-col gap-3">
            <div
              className="w-full flex items-center justify-between p-4 rounded-2xl transition-all neu-inset text-indigo-600 font-black"
            >
              <div className="flex items-center gap-3">
                <Wallet size={18} />
                <span className="text-sm">Rekap Keuangan</span>
              </div>
            </div>
          </div>
        </NeumorphicCard>

        {/* Dynamic Parameter Forms */}
        <NeumorphicCard className="space-y-4">
          <h3 className="font-black text-slate-700 text-sm uppercase tracking-widest">
            PARAMETER INPUT
          </h3>

          <div className="space-y-4 text-xs font-bold text-slate-600">
            {/* Finance Recap Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block pl-1 text-[10px] text-slate-400 uppercase">Pilih Tahun</label>
                <select
                  value={financeYear}
                  onChange={(e) => { 
                    setFinanceYear(e.target.value); 
                    setFinanceStartMonth('01'); 
                    setFinanceEndMonth('12'); 
                  }}
                  className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent cursor-pointer"
                >
                  {availableYears.length > 0 ? (
                    availableYears.map((y) => <option key={y} value={y}>{y}</option>)
                  ) : (
                    <option value={new Date().getFullYear().toString()}>{new Date().getFullYear()}</option>
                  )}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">Bulan Awal</label>
                  <select
                    value={financeStartMonth}
                    onChange={(e) => setFinanceStartMonth(e.target.value)}
                    className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent cursor-pointer"
                  >
                    {ALL_MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">Bulan Akhir</label>
                  <select
                    value={financeEndMonth}
                    onChange={(e) => setFinanceEndMonth(e.target.value)}
                    className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent cursor-pointer"
                  >
                    {ALL_MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <p className="text-[10px] text-slate-400 pl-1 leading-relaxed">
                Data diambil dari tab <span className="font-black text-indigo-500">Finance</span>. Tentukan rentang periode analisis rekap (misal: Januari s/d Maret).
              </p>
            </div>

            <button
              onClick={handleExecuteAI}
              disabled={isLoading}
              className="w-full mt-6 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-black neu-button shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> PROSES DATA...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> KERJAKAN DENGAN AI
                </>
              )}
            </button>
          </div>
        </NeumorphicCard>
      </div>

      {/* Main Results Preview Window */}
      <div className="lg:col-span-8">
        <NeumorphicCard className="h-full min-h-[500px] flex flex-col p-0 overflow-hidden border border-white/40">
          {/* Preview Header */}
          <div className="p-4 bg-slate-700 text-white flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-3">
              <Sparkles size={18} className="text-amber-400" />
              <div>
                <h3 className="font-black text-sm leading-none">UNI AI Assistant Output</h3>
                <span className="text-[10px] opacity-80 font-bold uppercase tracking-widest">Preview Lembar Kerja</span>
              </div>
            </div>

            {result && !isLoading && (
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  title="Salin ke Clipboard"
                  className="p-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold"
                >
                  <Copy size={14} />
                  {isCopied ? 'Tersalin' : 'Salin'}
                </button>
              </div>
            )}
          </div>

          {/* Report/Letter Preview Area */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-white/70 backdrop-blur-md custom-scrollbar">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <p className="font-black uppercase tracking-widest text-xs">Asisten AI sedang menyusun dokumen...</p>
              </div>
            ) : result ? (
              <div className="prose-custom text-slate-800 text-sm leading-relaxed max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 text-slate-400 space-y-3">
                <Sparkles size={48} className="stroke-1 text-slate-300 animate-pulse" />
                <div>
                  <h4 className="font-black text-sm uppercase tracking-widest text-slate-500">Lembar Kerja Kosong</h4>
                  <p className="text-xs font-medium text-slate-400 mt-1 max-w-xs">
                    Tentukan rentang parameter di panel kiri, lalu klik tombol **"Kerjakan dengan AI"** untuk memulai.
                  </p>
                </div>
              </div>
            )}
          </div>
        </NeumorphicCard>
      </div>
    </div>
  );
};

export default AIWorkspace;
