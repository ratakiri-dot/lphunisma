import React, { useState } from 'react';
import { Sparkles, Wallet, Mail, Copy, Printer, Save, Loader2, CheckCircle2, FileText, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import NeumorphicCard from './NeumorphicCard';
import { generateFinancialRecap, generateCooperationLetter, generateVehicleLoanLetter } from '../services/geminiService';
import { dataService } from '../services/dataService';
import { FinanceRecord, Auditor, Activity, AppUser, Letter } from '../types';

interface AIWorkspaceProps {
  finance: FinanceRecord[];
  auditors: Auditor[];
  activities: Activity[];
  currentUser: AppUser | null;
  onLetterSaved?: () => void;
}

type AITaskType = 'finance' | 'cooperation' | 'vehicle';

const AIWorkspace: React.FC<AIWorkspaceProps> = ({
  finance,
  auditors,
  activities,
  currentUser,
  onLetterSaved
}) => {
  const [activeTask, setActiveTask] = useState<AITaskType>('finance');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Task-specific form states
  const [financeYear, setFinanceYear] = useState<string>(new Date().getFullYear().toString());
  const [financeMonth, setFinanceMonth] = useState<string>('all');
  const [coopPartner, setCoopPartner] = useState<string>('');
  const [coopScope, setCoopScope] = useState<string>('');
  const [coopSigner, setCoopSigner] = useState<string>('Dr. Ahmad Fauzi, M.Si');
  const [coopDate, setCoopDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [loanAuditor, setLoanAuditor] = useState<string>('');
  const [loanEvent, setLoanEvent] = useState<string>('');
  const [loanVehicle, setLoanVehicle] = useState<string>('');
  const [loanSigner, setLoanSigner] = useState<string>('Dr. Ahmad Fauzi, M.Si');
  const [loanDate, setLoanDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Derived financial years list from real data
  const availableYears = Array.from(
    new Set(finance.map((item) => new Date(item.date).getFullYear().toString()))
  ).sort((a, b) => b.localeCompare(a));

  // Months that actually have data for the selected year
  const availableMonths = Array.from(
    new Set(
      finance
        .filter((item) => new Date(item.date).getFullYear().toString() === financeYear)
        .map((item) => (new Date(item.date).getMonth() + 1).toString().padStart(2, '0'))
    )
  ).sort();

  const MONTH_NAMES: Record<string, string> = {
    '01': 'Januari', '02': 'Februari', '03': 'Maret', '04': 'April',
    '05': 'Mei', '06': 'Juni', '07': 'Juli', '08': 'Agustus',
    '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember'
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePrint = () => {
    if (!result) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak Surat LPH UNISMA</title>
          <style>
            body {
              font-family: 'Times New Roman', Times, serif;
              line-height: 1.5;
              padding: 40px;
              color: #000;
              background-color: #fff;
            }
            pre {
              white-space: pre-wrap;
              font-family: 'Times New Roman', Times, serif;
              font-size: 12pt;
            }
            .prose-print {
              max-width: 800px;
              margin: 0 auto;
            }
            .kop-surat {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            /* Menghilangkan format markdown agar tercetak seperti surat dinas murni */
            h1, h2, h3, h4 {
              margin-top: 10px;
              margin-bottom: 5px;
            }
          </style>
        </head>
        <body>
          <div class="prose-print">
            <div id="content"></div>
          </div>
          <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
          <script>
            document.getElementById('content').innerHTML = marked.parse(\`${result.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`);
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSaveToLetters = async (title: string, type: 'Incoming' | 'Outgoing') => {
    if (!result || isSaved) return;
    setIsLoading(true);
    try {
      const username = currentUser?.fullName || currentUser?.username || 'System';
      const letterData: Partial<Letter> = {
        title: title,
        letterNumber: `[DRAF/${new Date().getFullYear()}]`,
        date: new Date().toISOString().split('T')[0],
        type: type,
        link: '',
        content: result,
        createdBy: username,
        updatedBy: username
      };

      await dataService.upsertLetter(letterData);
      setIsSaved(true);
      if (onLetterSaved) {
        onLetterSaved();
      }
      alert('Surat berhasil disimpan ke Arsip Surat!');
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan surat');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteAI = async () => {
    setIsLoading(true);
    setResult('');
    setIsSaved(false);

    try {
      let aiOutput = '';
      if (activeTask === 'finance') {
        aiOutput = await generateFinancialRecap(financeYear, finance, financeMonth);
      } else if (activeTask === 'cooperation') {
        if (!coopPartner.trim() || !coopScope.trim()) {
          alert('Mohon lengkapi Nama Mitra dan Bidang Kerja Sama.');
          setIsLoading(false);
          return;
        }
        aiOutput = await generateCooperationLetter(coopPartner, coopScope, coopSigner, coopDate);
      } else if (activeTask === 'vehicle') {
        if (!loanAuditor || !loanEvent || !loanVehicle.trim()) {
          alert('Mohon lengkapi data Auditor, Agenda Kegiatan, dan Detail Kendaraan.');
          setIsLoading(false);
          return;
        }
        aiOutput = await generateVehicleLoanLetter(loanAuditor, loanEvent, loanDate, loanVehicle, loanSigner);
      }

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
            <button
              onClick={() => { setActiveTask('finance'); setResult(''); }}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                activeTask === 'finance'
                  ? 'neu-inset text-indigo-600 font-black'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Wallet size={18} />
                <span className="text-sm">Rekap Keuangan</span>
              </div>
              <ChevronRight size={16} />
            </button>

            <button
              onClick={() => { setActiveTask('cooperation'); setResult(''); }}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                activeTask === 'cooperation'
                  ? 'neu-inset text-indigo-600 font-black'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Mail size={18} />
                <span className="text-sm">Surat Kerja Sama</span>
              </div>
              <ChevronRight size={16} />
            </button>

            <button
              onClick={() => { setActiveTask('vehicle'); setResult(''); }}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                activeTask === 'vehicle'
                  ? 'neu-inset text-indigo-600 font-black'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText size={18} />
                <span className="text-sm">Peminjaman Kendaraan</span>
              </div>
              <ChevronRight size={16} />
            </button>
          </div>
        </NeumorphicCard>

        {/* Dynamic Parameter Forms */}
        <NeumorphicCard className="space-y-4">
          <h3 className="font-black text-slate-700 text-sm uppercase tracking-widest">
            PARAMETER INPUT
          </h3>

          <div className="space-y-4 text-xs font-bold text-slate-600">
            {/* Finance Recap Form */}
            {activeTask === 'finance' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">Pilih Tahun</label>
                  <select
                    value={financeYear}
                    onChange={(e) => { setFinanceYear(e.target.value); setFinanceMonth('all'); }}
                    className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent cursor-pointer"
                  >
                    {availableYears.length > 0 ? (
                      availableYears.map((y) => <option key={y} value={y}>{y}</option>)
                    ) : (
                      <option value={new Date().getFullYear().toString()}>{new Date().getFullYear()}</option>
                    )}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">Filter Bulan <span className="text-indigo-400">(Opsional)</span></label>
                  <select
                    value={financeMonth}
                    onChange={(e) => setFinanceMonth(e.target.value)}
                    className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent cursor-pointer"
                  >
                    <option value="all">— Semua Bulan —</option>
                    {availableMonths.map((m) => (
                      <option key={m} value={m}>{MONTH_NAMES[m]}</option>
                    ))}
                  </select>
                </div>
                <p className="text-[10px] text-slate-400 pl-1 leading-relaxed">
                  Data diambil dari tab <span className="font-black text-indigo-500">Finance</span>. Pilih tahun dan bulan untuk membatasi periode rekap.
                </p>
              </div>
            )}

            {/* Cooperation Letter Form */}
            {activeTask === 'cooperation' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">Nama Instansi Mitra</label>
                  <input
                    value={coopPartner}
                    onChange={(e) => setCoopPartner(e.target.value)}
                    placeholder="e.g. Dinas Koperasi Malang"
                    className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">Ruang Lingkup Kerja Sama</label>
                  <input
                    value={coopScope}
                    onChange={(e) => setCoopScope(e.target.value)}
                    placeholder="e.g. Sertifikasi Halal 100 UMKM"
                    className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">Penandatangan Surat</label>
                  <input
                    value={coopSigner}
                    onChange={(e) => setCoopSigner(e.target.value)}
                    placeholder="Nama Lengkap & Gelar"
                    className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">Tanggal Surat</label>
                  <input
                    type="date"
                    value={coopDate}
                    onChange={(e) => setCoopDate(e.target.value)}
                    className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Vehicle Loan Form */}
            {activeTask === 'vehicle' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">Pilih Auditor</label>
                  <select
                    value={loanAuditor}
                    onChange={(e) => setLoanAuditor(e.target.value)}
                    className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent cursor-pointer"
                    required
                  >
                    <option value="">-- Pilih Auditor --</option>
                    {auditors.map((aud) => (
                      <option key={aud.id} value={aud.fullName}>{aud.fullName}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">Pilih Agenda Audit</label>
                  <select
                    value={loanEvent}
                    onChange={(e) => setLoanEvent(e.target.value)}
                    className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent cursor-pointer"
                    required
                  >
                    <option value="">-- Pilih Agenda --</option>
                    {activities.map((act) => (
                      <option key={act.id} value={`${act.event} (${act.location})`}>
                        {act.date} - {act.event}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">Detail Kendaraan Operasional</label>
                  <input
                    value={loanVehicle}
                    onChange={(e) => setLoanVehicle(e.target.value)}
                    placeholder="e.g. Avanza N 1234 XX / Mobil Dinas LPH"
                    className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">Penandatangan Surat</label>
                  <input
                    value={loanSigner}
                    onChange={(e) => setLoanSigner(e.target.value)}
                    placeholder="Nama Lengkap & Gelar"
                    className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">Tanggal Kegiatan</label>
                  <input
                    type="date"
                    value={loanDate}
                    onChange={(e) => setLoanDate(e.target.value)}
                    className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent cursor-pointer"
                  />
                </div>
              </div>
            )}

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
                {activeTask !== 'finance' && (
                  <>
                    <button
                      onClick={handlePrint}
                      title="Cetak Surat"
                      className="p-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold"
                    >
                      <Printer size={14} />
                      Cetak
                    </button>
                    <button
                      onClick={() => handleSaveToLetters(
                        activeTask === 'cooperation' 
                          ? `Penawaran Kerjasama ${coopPartner}` 
                          : `Peminjaman Kendaraan ${loanAuditor}`,
                        'Outgoing'
                      )}
                      disabled={isSaved}
                      className="p-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold"
                    >
                      {isSaved ? <CheckCircle2 size={14} /> : <Save size={14} />}
                      {isSaved ? 'Tersimpan' : 'Simpan ke Arsip'}
                    </button>
                  </>
                )}
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
                    Pilih tugas, sesuaikan parameter di panel kiri, lalu klik tombol **"Kerjakan dengan AI"** untuk memulai.
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
