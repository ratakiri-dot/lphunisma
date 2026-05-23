import React, { useState, useEffect } from 'react';
import { Sparkles, Wallet, Copy, Loader2, Printer, Save, CheckCircle2, FileText, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import NeumorphicCard from './NeumorphicCard';
import { generateFinancialRecap } from '../services/geminiService';
import { dataService } from '../services/dataService';
import { FinanceRecord, AppUser, Letter } from '../types';
import { marked } from 'marked';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface AIWorkspaceProps {
  finance: FinanceRecord[];
  currentUser: AppUser | null;
  onLetterSaved?: () => void;
}

type AITaskType = 'finance' | 'vehicle';

const AIWorkspace: React.FC<AIWorkspaceProps> = ({
  finance,
  currentUser,
  onLetterSaved
}) => {
  const [activeTask, setActiveTask] = useState<AITaskType>('finance');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Finance form states
  const [financeYear, setFinanceYear] = useState<string>(new Date().getFullYear().toString());
  const [financeStartMonth, setFinanceStartMonth] = useState<string>('01');
  const [financeEndMonth, setFinanceEndMonth] = useState<string>('12');

  // Vehicle form states (matching the official letter template)
  const [loanLetterNo, setLoanLetterNo] = useState<string>('16/P44/U.LPH/K/L.25/IV/2025');
  const [loanLetterDate, setLoanLetterDate] = useState<string>(() => {
    const d = new Date();
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  });
  const [loanVisitDate, setLoanVisitDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loanVisitTime, setLoanVisitTime] = useState<string>('Pukul 09.00 - Selesai');
  const [loanVisitPlace, setLoanVisitPlace] = useState<string>('');

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

  // Helper date formatters
  const formatIndonesianDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getIndonesianDay = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[date.getDay()];
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

    if (activeTask === 'vehicle') {
      const dayOfVisit = getIndonesianDay(loanVisitDate);
      const formattedVisitDate = formatIndonesianDate(loanVisitDate);

      printWindow.document.write(`<!DOCTYPE html>
<html>
  <head>
    <title>Cetak Surat Peminjaman Kendaraan</title>
            <style>
              @page {
                size: 210mm 330mm; /* F4 */
                  margin: 1cm 2cm 2cm 2cm !important; /* enforce margins */
              }
              html, body {
                margin: 0;
                padding: 0;
                font-family: 'Times New Roman', serif;
              }
              .letter-container {
                max-width: 800px;
                margin: 0;
              }
              .kop-surat {
                text-align: center;
                border-bottom: 3px double #000;
                padding-bottom: 8px;
                margin-bottom: 25px;
              }
              .kop-title-1 { font-size: 15pt; font-weight: bold; color: #0d5c3a; margin: 0; }
              .kop-title-2 { font-size: 18pt; font-weight: bold; color: #0d5c3a; margin: 0; letter-spacing: 2px; }
              .kop-title-3 { font-size: 13pt; font-weight: bold; color: #0d5c3a; margin: 0; }
              .kop-address { font-size: 8pt; color: #0d5c3a; margin: 5px 0 0 0; font-style: italic; }
              .meta-section { display: flex; justify-content: space-between; margin-bottom: 25px; }
              .meta-left table { border-collapse: collapse; }
              .meta-left td { padding: 2px 5px 2px 0; vertical-align: top; }
              .meta-right { text-align: right; }
              .address-section { margin-bottom: 25px; }
              .salutation { margin-bottom: 15px; }
              .content-paragraph { margin-bottom: 15px; text-align: justify; }
              .details-table { margin: 15px 0 15px 40px; border-collapse: collapse; }
              .details-table td { padding: 3px 10px 3px 0; vertical-align: top; }
              .signature-section { display: flex; justify-content: flex-end; margin-top: 50px; }
              .signature-block { width: 350px; text-align: left; }
            </style>
          </head>
          <body>
            <div class="letter-container" style="position: relative; z-index: 1;">
              <img src="/assets/letter_images/watermark.png" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80%; opacity: 0.15; z-index: -1;" alt="" />
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 25px;">
                <img src="/assets/letter_images/image2.jpeg" style="width: 80px; height: 80px; object-fit: contain;" alt="Logo Kiri" />
                <div style="text-align: center; flex: 1; padding: 0 15px; font-family: 'Bookman Old Style', serif; color: #13894B;">
                  <h2 style="font-size: 15pt; font-weight: bold; margin: 0; line-height: 1.2;">UNIVERSITAS ISLAM MALANG</h2>
                  <h1 style="font-size: 18pt; font-weight: bold; margin: 0; letter-spacing: 2px; line-height: 1;">( U N I S M A )</h1>
                  <h3 style="font-size: 13pt; font-weight: bold; margin: 0; line-height: 1.5;">LEMBAGA PEMERIKSA HALAL</h3>
                  <p style="font-size: 8pt; margin: 5px 0 0 0; font-family: Arial, sans-serif;">Jalan Mayjend Haryono 193 Malang, Jawa Timur 65144 Indonesia Telp 0341 551932 Faks. 0341 552249 E-mail: lph@unisma.ac.id Website: unisma.ac.id</p>
                </div>
                <img src="/assets/letter_images/image3.jpeg" style="width: 80px; height: 80px; object-fit: contain;" alt="Logo Kanan" />
              </div>
              
              <div class="meta-section">
                <div class="meta-left">
                  <table>
                    <tbody>
                      <tr><td style="width: 70px;">Nomor</td><td>: ${loanLetterNo}</td></tr>
                      <tr><td>Lampiran</td><td>: -</td></tr>
                      <tr><td>Hal</td><td>: <strong>Peminjaman Kendaraan</strong></td></tr>
                    </tbody>
                  </table>
                </div>
                <div class="meta-right">
                  ${loanLetterDate}
                </div>
              </div>

              <div class="address-section">
                Yth. Bapak Wakil Rektor<br />
                Bagian Administrasi Umum, Keuangan, dan Personalia<br />
                Universitas Islam Malang
              </div>

              <div class="salutation">
                <em>Assalamualaikum War. Wab.</em>
              </div>

              <div class="content-paragraph">
                Salam silaturahmi semoga kita senantiasa dalam lindungan Allah Swt. dan dapat menyelesaikan tugas sehari-hari. Aamiin.
              </div>

              <div class="content-paragraph">
                Sehubungan dengan adanya <strong>Audit Sertifikasi Halal Pelaku Usaha</strong> yang akan dilaksanakan pada:
              </div>

              <table class="details-table">
                <tbody>
                  <tr><td style="width: 80px; font-weight: bold;">Hari</td><td>: ${dayOfVisit}</td></tr>
                  <tr><td style="font-weight: bold;">Tanggal</td><td>: ${formattedVisitDate}</td></tr>
                  <tr><td style="font-weight: bold;">Waktu</td><td>: ${loanVisitTime}</td></tr>
                  <tr><td style="font-weight: bold;">Tempat</td><td>: ${loanVisitPlace}</td></tr>
                </tbody>
              </table>

              <div class="content-paragraph">
                dengan ini kami mengajukan permohonan peminjaman kendaraan untuk kegiatan tersebut.
              </div>

              <div class="content-paragraph">
                Demikian permohonan ini, atas perhatiannya disampaikan terimakasih.
              </div>

              <div class="salutation">
                <em>Wassalamualaikum War. Wab.</em>
              </div>

              <div class="signature-section">
                <div class="signature-block">
                  Kepala Lembaga Pemeriksa Halal UNISMA,<br /><br /><br /><br /><br />
                  <strong>Dr. Hj. Jeni Susyanti, SE, MM, BKP, C.B.V</strong><br />
                  NPP 1950200019
                </div>
              </div>
              <img src="/assets/letter_images/footer.jpeg" style="width: 100%; margin-top: 40px;" alt="Footer" />
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
    } else {
      // Standard printing for finance recap
      printWindow.document.write(`
        <html>
          <head>
            <title>Cetak Rekap Keuangan LPH UNISMA</title>
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
    }
    printWindow.document.close();
  };

  // Export the current result as a PDF matching the preview layout
  const handleExportPdf = async () => {
    if (!result) return;
    // Create a temporary container with the rendered HTML
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'fixed';
    tempDiv.style.top = '-9999px';
    tempDiv.innerHTML = `<div class="prose-print" style="max-width:800px;margin:0 auto;">
      <div id="content">${marked.parse(result)}</div>
    </div>`;
    document.body.appendChild(tempDiv);
    try {
      const canvas = await html2canvas(tempDiv, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ unit: 'mm', format: [210, 330] }); // F4 size
      const marginTop = 10; // 1cm = 10mm
      const marginSide = 20; // 2cm = 20mm
      const pdfWidth = 210 - marginSide * 2; // 170mm usable width
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', marginSide, marginTop, pdfWidth, pdfHeight);
      pdf.save('lembar_kerja.pdf');
    } catch (e) {
      console.error('PDF export failed', e);
    } finally {
      document.body.removeChild(tempDiv);
    }
  };

  const handleSaveToLetters = async (title: string, type: 'Incoming' | 'Outgoing') => {
    if (!result || isSaved) return;
    setIsLoading(true);
    try {
      const username = currentUser?.fullName || currentUser?.username || 'System';
      const letterData: Partial<Letter> = {
        title: title,
        letterNumber: activeTask === 'vehicle' ? loanLetterNo : `[DRAF/${new Date().getFullYear()}]`,
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
      if (activeTask === 'finance') {
        if (parseInt(financeStartMonth) > parseInt(financeEndMonth)) {
          alert('Bulan Awal tidak boleh lebih besar dari Bulan Akhir.');
          setIsLoading(false);
          return;
        }
        const aiOutput = await generateFinancialRecap(financeYear, finance, financeStartMonth, financeEndMonth);
        setResult(aiOutput);
      } else if (activeTask === 'vehicle') {
        if (!loanVisitPlace.trim()) {
          alert('Mohon lengkapi parameter Tempat yang dikunjungi.');
          setIsLoading(false);
          return;
        }

        const dayOfVisit = getIndonesianDay(loanVisitDate);
        const formattedVisitDate = formatIndonesianDate(loanVisitDate);

        // Standardized dynamic text content matching the layout exactly
        const letterContent = `
# UNIVERSITAS ISLAM MALANG
## ( U N I S M A )
### LEMBAGA PEMERIKSA HALAL
*Jalan Mayjend Haryono 193 Malang, Jawa Timur 65144 Indonesia Telp 0341 551932 Faks. 0341 552249 E-mail: lph@unisma.ac.id Website: unisma.ac.id*
***

Nomor : ${loanLetterNo}  
Lampiran : -  
Hal : **Peminjaman Kendaraan**  

<div style="text-align: right;">${loanLetterDate}</div>

Yth. Bapak Wakil Rektor  
Bagian Administrasi Umum, Keuangan, dan Personalia  
Universitas Islam Malang  

*Assalamualaikum War. Wab.*

Salam silaturahmi semoga kita senantiasa dalam lindungan Allah Swt. dan dapat menyelesaikan tugas sehari-hari. Aamiin.

Sehubungan dengan adanya **Audit Sertifikasi Halal Pelaku Usaha** yang akan dilaksanakan pada:

Hari : ${dayOfVisit}  
Tanggal : ${formattedVisitDate}  
Waktu : ${loanVisitTime}  
Tempat : ${loanVisitPlace}  

dengan ini kami mengajukan permohonan peminjaman kendaraan untuk kegiatan tersebut.

Demikian permohonan ini, atas perhatiannya disampaikan terimakasih.

*Wassalamualaikum War. Wab.*

Kepala Lembaga Pemeriksa Halal UNISMA,

**Dr. Hj. Jeni Susyanti, SE, MM, BKP, C.B.V**  
NPP 1950200019
        `.trim();

        // Artificial dynamic delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setResult(letterContent);
      }
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
            )}

            {/* Vehicle Loan Form */}
            {activeTask === 'vehicle' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">Nomor Surat</label>
                  <input
                    value={loanLetterNo}
                    onChange={(e) => setLoanLetterNo(e.target.value)}
                    placeholder="e.g. 16/P44/U.LPH/K/L.25/IV/2025"
                    className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent font-sans"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">Tanggal Surat</label>
                  <input
                    value={loanLetterDate}
                    onChange={(e) => setLoanLetterDate(e.target.value)}
                    placeholder="e.g. 29 November 2025"
                    className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent font-sans"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">Tanggal Kunjungan / Audit</label>
                  <input
                    type="date"
                    value={loanVisitDate}
                    onChange={(e) => setLoanVisitDate(e.target.value)}
                    className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent cursor-pointer font-sans"
                    required
                  />
                  <p className="text-[9px] text-indigo-500 pl-1 font-bold">
                    Hari Terdeteksi: {getIndonesianDay(loanVisitDate) || '-'}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">Waktu / Jam Kunjungan</label>
                  <input
                    value={loanVisitTime}
                    onChange={(e) => setLoanVisitTime(e.target.value)}
                    placeholder="e.g. Pukul 09.00 - Selesai"
                    className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent font-sans"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">Tempat Yang Dikunjungi</label>
                  <textarea
                    value={loanVisitPlace}
                    onChange={(e) => setLoanVisitPlace(e.target.value)}
                    placeholder="Masukkan tempat atau rute kunjungan..."
                    className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent font-sans h-20 resize-none"
                    required
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
            <button
              onClick={handleExportPdf}
              disabled={!result}
              className="w-full mt-2 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black neu-button shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
            >
              <FileText size={16} /> Convert to PDF
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
                <button
                  onClick={handlePrint}
                  title="Cetak Surat"
                  className="p-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold"
                >
                  <Printer size={14} />
                  Cetak
                </button>
                {activeTask === 'vehicle' && (
                  <button
                    onClick={() => handleSaveToLetters(
                      `Peminjaman Kendaraan - ${loanVisitPlace}`,
                      'Outgoing'
                    )}
                    disabled={isSaved}
                    className="p-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold"
                  >
                    {isSaved ? <CheckCircle2 size={14} /> : <Save size={14} />}
                    {isSaved ? 'Tersimpan' : 'Simpan ke Arsip'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Report/Letter Preview Area */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-100 custom-scrollbar">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <p className="font-black uppercase tracking-widest text-xs">Asisten AI sedang menyusun dokumen...</p>
              </div>
            ) : result ? (
              activeTask === 'vehicle' ? (
                /* Premium Simulated Letter Paper sheet */
                <div className="bg-white p-8 md:p-12 shadow-lg border border-slate-300 rounded-lg max-w-[700px] mx-auto text-black text-[11pt] leading-relaxed relative selection:bg-indigo-100 font-serif z-10 overflow-hidden" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                  {/* Decorative green top bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-700 rounded-t-lg z-20"></div>

                  {/* Watermark */}
                  <img src="/assets/letter_images/watermark.png" alt="" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] opacity-15 pointer-events-none z-0 select-none" />

                  <div className="relative z-10">
                    <div className="flex justify-between items-center border-b-[3px] border-double border-black pb-2 mb-6">
                      <img src="/assets/letter_images/image2.jpeg" alt="Logo Kiri" className="w-20 h-20 object-contain" />
                      <div className="text-center flex-1 px-4" style={{ fontFamily: "'Bookman Old Style', serif", color: '#13894B' }}>
                        <h2 className="text-[14pt] font-bold m-0 leading-tight">UNIVERSITAS ISLAM MALANG</h2>
                        <h1 className="text-[17pt] font-bold m-0 tracking-wider leading-none">( U N I S M A )</h1>
                        <h3 className="text-[12pt] font-bold m-0 leading-normal">LEMBAGA PEMERIKSA HALAL</h3>
                        <p className="text-[7.5pt] m-0 mt-1" style={{ fontFamily: "Arial, sans-serif" }}>Jalan Mayjend Haryono 193 Malang, Jawa Timur 65144 Indonesia Telp 0341 551932 Faks. 0341 552249 E-mail: lph@unisma.ac.id Website: unisma.ac.id</p>
                      </div>
                      <img src="/assets/letter_images/image3.jpeg" alt="Logo Kanan" className="w-20 h-20 object-contain" />
                    </div>

                  <div className="flex justify-between mb-6">
                    <div>
                      <table>
                        <tbody>
                          <tr><td className="w-20">Nomor</td><td>: {loanLetterNo}</td></tr>
                          <tr><td>Lampiran</td><td>: -</td></tr>
                          <tr><td>Hal</td><td>: <strong>Peminjaman Kendaraan</strong></td></tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="text-right">
                      {loanLetterDate}
                    </div>
                  </div>

                  <div className="mb-6">
                    Yth. Bapak Wakil Rektor<br />
                    Bagian Administrasi Umum, Keuangan, dan Personalia<br />
                    Universitas Islam Malang
                  </div>

                  <div className="italic mb-4">
                    Assalamualaikum War. Wab.
                  </div>

                  <div className="mb-4 text-justify">
                    Salam silaturahmi semoga kita senantiasa dalam lindungan Allah Swt. dan dapat menyelesaikan tugas sehari-hari. Aamiin.
                  </div>

                  <div className="mb-2 text-justify">
                    Sehubungan dengan adanya <strong>Audit Sertifikasi Halal Pelaku Usaha</strong> yang akan dilaksanakan pada:
                  </div>

                  <table className="ml-8 mb-4">
                    <tbody>
                      <tr><td className="w-20 font-bold">Hari</td><td>: {getIndonesianDay(loanVisitDate)}</td></tr>
                      <tr><td className="font-bold">Tanggal</td><td>: {formatIndonesianDate(loanVisitDate)}</td></tr>
                      <tr><td className="font-bold">Waktu</td><td>: {loanVisitTime}</td></tr>
                      <tr><td className="font-bold">Tempat</td><td>: {loanVisitPlace}</td></tr>
                    </tbody>
                  </table>

                  <div className="mb-4 text-justify">
                    dengan ini kami mengajukan permohonan peminjaman kendaraan untuk kegiatan tersebut.
                  </div>

                  <div className="mb-4 text-justify">
                    Demikian permohonan ini, atas perhatiannya disampaikan terimakasih.
                  </div>

                  <div className="italic mb-8">
                    Wassalamualaikum War. Wab.
                  </div>

                  <div className="flex justify-end">
                    <div className="w-[300px] text-left relative z-10">
                      Kepala Lembaga Pemeriksa Halal UNISMA,<br /><br /><br /><br /><br />
                      <strong>Dr. Hj. Jeni Susyanti, SE, MM, BKP, C.B.V</strong><br />
                      <span className="text-[10pt]">NPP 1950200019</span>
                    </div>
                  </div>
                  <img src="/assets/letter_images/footer.jpeg" alt="Footer" className="w-full mt-10" />
                  </div>
                </div>
              ) : (
                <div className="bg-white/70 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-inner min-h-[400px] prose-custom text-slate-800 text-sm leading-relaxed max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                </div>
              )
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
