import React, { useState, useEffect, useRef } from 'react';
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

type AITaskType = 'finance' | 'vehicle' | 'auditor';

/* ─────────────────────────────────────────────────────────────────────────────
   SHARED LETTER TEMPLATE
   Renders the letter as inline-styled HTML so it looks identical
   whether it is displayed in the preview <div> or captured by html2canvas.
   
   IMPORTANT: Every px value here is tuned for a 794px-wide container
   (A4 / F4 at 96 dpi). The off-screen capture div uses the same width.
───────────────────────────────────────────────────────────────────────────── */

interface LetterTemplateProps {
  letterNo: string;
  letterDate: string;
  visitDate: string;      // ISO yyyy-mm-dd
  visitTime: string;
  visitPlace: string;
  getDay: (d: string) => string;
  formatDate: (d: string) => string;
  /** When true renders as an img src (for the off-screen capture clone) */
  base?: string;
}

/**
 * Returns a string of HTML that represents the letter body.
 * Used both by the React preview (dangerouslySetInnerHTML) and
 * by the off-screen div that html2canvas captures.
 */
function buildLetterHTML({
  letterNo,
  letterDate,
  visitDate,
  visitTime,
  visitPlace,
  getDay,
  formatDate,
  base = '',
}: LetterTemplateProps): string {
  const dayOfVisit = getDay(visitDate);
  const formattedDate = formatDate(visitDate);

  // F4 page dimensions (794px wide, 1247px tall at 96dpi → 210×330mm)
  const CONTENT_PAD_H = 72;   // ~19mm horizontal padding
  const CONTENT_PAD_T = 56;   // ~15mm top padding
  const FOOTER_H      = 60;   // footer image height
  const FOOTER_PAD_B  = 28;   // gap from bottom edge

  return `
<div style="
  position:relative;
  width:794px;
  min-height:1247px;
  background:#fff;
  font-family:'Times New Roman',Times,serif;
  font-size:14px;
  line-height:1.65;
  color:#000;
  box-sizing:border-box;
  overflow:hidden;
">

  <!-- WATERMARK -->
  <img
    src="${base}/assets/letter_images/watermark.png"
    style="
      position:absolute;
      top:50%; left:50%;
      transform:translate(-50%,-50%);
      width:68%;
      opacity:0.13;
      pointer-events:none;
      z-index:0;
      display:block;
    "
    crossorigin="anonymous"
  />

  <!-- MAIN CONTENT AREA -->
  <div style="
    position:relative;
    z-index:1;
    padding:${CONTENT_PAD_T}px ${CONTENT_PAD_H}px ${FOOTER_H + FOOTER_PAD_B + 32}px ${CONTENT_PAD_H}px;
    box-sizing:border-box;
  ">

    <!-- KOP SURAT ─────────────────────────────────────────────── -->
    <div style="
      display:flex;
      align-items:center;
      justify-content:space-between;
      border-bottom:3px double #13894B;
      padding-bottom:8px;
      margin-bottom:20px;
    ">
      <img
        src="${base}/assets/letter_images/image2.jpeg"
        style="width:76px;height:76px;object-fit:contain;display:block;"
        crossorigin="anonymous"
      />
      <div style="
        text-align:center;
        flex:1;
        padding:0 16px;
        font-family:'Bookman Old Style','Book Antiqua',Palatino,serif;
        color:#13894B;
      ">
        <div style="font-size:15pt;font-weight:bold;line-height:1.2;">UNIVERSITAS ISLAM MALANG</div>
        <div style="font-size:18pt;font-weight:bold;letter-spacing:4px;line-height:1.1;">( U N I S M A )</div>
        <div style="font-size:12.5pt;font-weight:bold;line-height:1.3;">LEMBAGA PEMERIKSA HALAL</div>
        <div style="font-size:7.5pt;margin-top:5px;font-family:Arial,Helvetica,sans-serif;color:#13894B;">
          Jalan Mayjend Haryono 193 Malang, Jawa Timur 65144 Indonesia
          Telp 0341 551932 &nbsp;Faks. 0341 552249 &nbsp;E-mail: lph@unisma.ac.id &nbsp;Website: unisma.ac.id
        </div>
      </div>
      <img
        src="${base}/assets/letter_images/image3.jpeg"
        style="width:76px;height:76px;object-fit:contain;display:block;"
        crossorigin="anonymous"
      />
    </div>

    <!-- NOMOR / TANGGAL ──────────────────────────────────────── -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
      <table style="border-collapse:collapse;font-size:14px;">
        <tbody>
          <tr>
            <td style="width:80px;vertical-align:top;padding:1px 0;">Nomor</td>
            <td style="vertical-align:top;padding:1px 0;">: ${letterNo}</td>
          </tr>
          <tr>
            <td style="vertical-align:top;padding:1px 0;">Lampiran</td>
            <td style="vertical-align:top;padding:1px 0;">: -</td>
          </tr>
          <tr>
            <td style="vertical-align:top;padding:1px 0;">Hal</td>
            <td style="vertical-align:top;padding:1px 0;">: <strong>Peminjaman Kendaraan</strong></td>
          </tr>
        </tbody>
      </table>
      <div style="text-align:right;font-size:14px;">${letterDate}</div>
    </div>

    <!-- PENERIMA ─────────────────────────────────────────────── -->
    <div style="margin-bottom:20px;line-height:1.8;font-size:14px;">
      Yth. Bapak Wakil Rektor<br/>
      Bagian Administrasi Umum, Keuangan, dan Personalia<br/>
      Universitas Islam Malang
    </div>

    <!-- SALAM PEMBUKA ────────────────────────────────────────── -->
    <div style="font-style:italic;margin-bottom:14px;font-size:14px;">
      Assalamualaikum War. Wab.
    </div>

    <!-- PARAGRAF 1 ───────────────────────────────────────────── -->
    <div style="margin-bottom:14px;text-align:justify;font-size:14px;">
      Salam silaturahmi semoga kita senantiasa dalam lindungan Allah Swt. dan dapat
      menyelesaikan tugas sehari-hari. Aamiin.
    </div>

    <!-- PARAGRAF 2 ───────────────────────────────────────────── -->
    <div style="margin-bottom:12px;text-align:justify;font-size:14px;">
      Sehubungan dengan adanya <strong>Audit Sertifikasi Halal Pelaku Usaha</strong>
      yang akan dilaksanakan pada:
    </div>

    <!-- TABEL KEGIATAN ───────────────────────────────────────── -->
    <table style="border-collapse:collapse;margin-left:44px;margin-bottom:14px;font-size:14px;">
      <tbody>
        <tr><td style="width:70px;font-weight:bold;padding:2px 0;">Hari</td><td style="padding:2px 0;">: ${dayOfVisit}</td></tr>
        <tr><td style="font-weight:bold;padding:2px 0;">Tanggal</td><td style="padding:2px 0;">: ${formattedDate}</td></tr>
        <tr><td style="font-weight:bold;padding:2px 0;">Waktu</td><td style="padding:2px 0;">: ${visitTime}</td></tr>
        <tr><td style="font-weight:bold;padding:2px 0;">Tempat</td><td style="padding:2px 0;">: ${visitPlace}</td></tr>
      </tbody>
    </table>

    <!-- PARAGRAF 3 ───────────────────────────────────────────── -->
    <div style="margin-bottom:14px;text-align:justify;font-size:14px;">
      dengan ini kami mengajukan permohonan peminjaman kendaraan untuk kegiatan tersebut.
    </div>

    <!-- PARAGRAF 4 ───────────────────────────────────────────── -->
    <div style="margin-bottom:14px;text-align:justify;font-size:14px;">
      Demikian permohonan ini, atas perhatiannya disampaikan terimakasih.
    </div>

    <!-- SALAM PENUTUP ────────────────────────────────────────── -->
    <div style="font-style:italic;margin-bottom:24px;font-size:14px;">
      Wassalamualaikum War. Wab.
    </div>

    <!-- TANDA TANGAN ─────────────────────────────────────────── -->
    <div style="text-align:right;margin-bottom:14px;font-size:14px;">
      <div style="display:inline-block;text-align:left;width:300px;">
        Kepala Lembaga Pemeriksa Halal UNISMA,<br/><br/><br/><br/><br/>
        <strong>Dr. Hj. Jeni Susyanti, SE, MM, BKP, C.B.V</strong><br/>
        <span style="font-size:10.5pt;">NPP 1950200019</span>
      </div>
    </div>

  </div><!-- /MAIN CONTENT -->

  <!-- FOOTER ─────────────────────────────────────────────────── -->
  <img
    src="${base}/assets/letter_images/footer.jpeg"
    style="
      position:absolute;
      bottom:${FOOTER_PAD_B}px;
      left:${CONTENT_PAD_H}px;
      width:${794 - CONTENT_PAD_H * 2}px;
      display:block;
      z-index:2;
    "
    crossorigin="anonymous"
  />

</div>`;
}

/* ─────────────────────────────────────────────────────────────────────────────
   SHARED LETTER TEMPLATE - AUDITOR ASSIGNMENT LETTER
   Renders the auditor assignment letter as inline-styled HTML.
───────────────────────────────────────────────────────────────────────────── */

interface AuditorLetterTemplateProps {
  letterNo: string;
  auditorName: string;
  auditorNpp: string;
  auditorName2?: string;
  auditorNpp2?: string;
  visitDate: string;      // ISO yyyy-mm-dd
  visitPlace: string;
  businessName: string;
  contactPerson: string;
  signDate: string;
  getDay: (d: string) => string;
  formatDate: (d: string) => string;
  base?: string;
}

function buildAuditorLetterHTML({
  letterNo,
  auditorName,
  auditorNpp,
  auditorName2,
  auditorNpp2,
  visitDate,
  visitPlace,
  businessName,
  contactPerson,
  signDate,
  getDay,
  formatDate,
  base = '',
}: AuditorLetterTemplateProps): string {
  const dayOfVisit = getDay(visitDate);
  const formattedDate = formatDate(visitDate);

  const CONTENT_PAD_H = 72;   // ~19mm horizontal padding
  const CONTENT_PAD_T = 56;   // ~15mm top padding
  const FOOTER_H      = 60;   // footer image height
  const FOOTER_PAD_B  = 28;   // gap from bottom edge

  const hasSecondAuditor = !!(auditorName2 && auditorName2.trim());

  const auditorDetailsHtml = hasSecondAuditor
    ? `
    <table style="border-collapse:collapse;margin-left:44px;margin-bottom:18px;font-size:14px;width:calc(100% - 44px);line-height:1.5;">
      <tbody>
        <tr>
          <td style="width:90px;vertical-align:top;padding:2px 0;">1. nama</td>
          <td style="vertical-align:top;padding:2px 0;">: ${auditorName}</td>
        </tr>
        <tr>
          <td style="vertical-align:top;padding:2px 0;">&nbsp;&nbsp;&nbsp;NPP</td>
          <td style="vertical-align:top;padding:2px 0;">: ${auditorNpp}</td>
        </tr>
        <tr>
          <td style="vertical-align:top;padding:2px 0;">&nbsp;&nbsp;&nbsp;jabatan</td>
          <td style="vertical-align:top;padding:2px 0;">: Auditor Halal Lembaga Pemeriksa Halal (LPH) UNISMA</td>
        </tr>
        <tr style="height:10px;"><td colspan="2"></td></tr>
        <tr>
          <td style="vertical-align:top;padding:2px 0;">2. nama</td>
          <td style="vertical-align:top;padding:2px 0;">: ${auditorName2}</td>
        </tr>
        <tr>
          <td style="vertical-align:top;padding:2px 0;">&nbsp;&nbsp;&nbsp;NPP</td>
          <td style="vertical-align:top;padding:2px 0;">: ${auditorNpp2 || '-'}</td>
        </tr>
        <tr>
          <td style="vertical-align:top;padding:2px 0;">&nbsp;&nbsp;&nbsp;jabatan</td>
          <td style="vertical-align:top;padding:2px 0;">: Auditor Halal Lembaga Pemeriksa Halal (LPH) UNISMA</td>
        </tr>
      </tbody>
    </table>
    `
    : `
    <table style="border-collapse:collapse;margin-left:44px;margin-bottom:18px;font-size:14px;width:calc(100% - 44px);line-height:1.5;">
      <tbody>
        <tr>
          <td style="width:90px;vertical-align:top;padding:2px 0;">nama</td>
          <td style="vertical-align:top;padding:2px 0;">: ${auditorName}</td>
        </tr>
        <tr>
          <td style="vertical-align:top;padding:2px 0;">NPP</td>
          <td style="vertical-align:top;padding:2px 0;">: ${auditorNpp}</td>
        </tr>
        <tr>
          <td style="vertical-align:top;padding:2px 0;">jabatan</td>
          <td style="vertical-align:top;padding:2px 0;">: Auditor Halal Lembaga Pemeriksa Halal (LPH) UNISMA</td>
        </tr>
      </tbody>
    </table>
    `;

  return `
<div style="
  position:relative;
  width:794px;
  min-height:1247px;
  background:#fff;
  font-family:'Times New Roman',Times,serif;
  font-size:14px;
  line-height:1.65;
  color:#000;
  box-sizing:border-box;
  overflow:hidden;
">
  <!-- WATERMARK -->
  <img
    src="${base}/assets/letter_images/watermark.png"
    style="
      position:absolute;
      top:50%; left:50%;
      transform:translate(-50%,-50%);
      width:68%;
      opacity:0.13;
      pointer-events:none;
      z-index:0;
      display:block;
    "
    crossorigin="anonymous"
  />
  <!-- MAIN CONTENT AREA -->
  <div style="
    position:relative;
    z-index:1;
    padding:${CONTENT_PAD_T}px ${CONTENT_PAD_H}px ${FOOTER_H + FOOTER_PAD_B + 32}px ${CONTENT_PAD_H}px;
    box-sizing:border-box;
  ">
    <!-- KOP SURAT ─────────────────────────────────────────────── -->
    <div style="
      display:flex;
      align-items:center;
      justify-content:space-between;
      border-bottom:3px double #13894B;
      padding-bottom:8px;
      margin-bottom:20px;
    ">
      <img
        src="${base}/assets/letter_images/image2.jpeg"
        style="width:76px;height:76px;object-fit:contain;display:block;"
        crossorigin="anonymous"
      />
      <div style="
        text-align:center;
        flex:1;
        padding:0 16px;
        font-family:'Bookman Old Style','Book Antiqua',Palatino,serif;
        color:#13894B;
      ">
        <div style="font-size:15pt;font-weight:bold;line-height:1.2;">UNIVERSITAS ISLAM MALANG</div>
        <div style="font-size:18pt;font-weight:bold;letter-spacing:4px;line-height:1.1;">( U N I S M A )</div>
        <div style="font-size:12.5pt;font-weight:bold;line-height:1.3;">LEMBAGA PEMERIKSA HALAL</div>
        <div style="font-size:7.5pt;margin-top:5px;font-family:Arial,Helvetica,sans-serif;color:#13894B;">
          Jalan Mayjend Haryono 193 Malang, Jawa Timur 65144 Indonesia
          Telp 0341 551932 &nbsp;Faks. 0341 552249 &nbsp;E-mail: lph@unisma.ac.id &nbsp;Website: unisma.ac.id
        </div>
      </div>
      <img
        src="${base}/assets/letter_images/image3.jpeg"
        style="width:76px;height:76px;object-fit:contain;display:block;"
        crossorigin="anonymous"
      />
    </div>

    <!-- TITLE SURAT TUGAS ──────────────────────────────────────── -->
    <div style="text-align:center;margin-bottom:20px;font-family:'Times New Roman',serif;">
      <div style="font-size:14pt;font-weight:bold;text-decoration:underline;letter-spacing:1px;line-height:1.2;">SURAT TUGAS</div>
      <div style="font-size:11pt;font-weight:bold;line-height:1.2;">NOMOR : ${letterNo}</div>
    </div>

    <!-- INTRO ─────────────────────────────────────────────────── -->
    <div style="margin-bottom:14px;text-align:justify;font-size:14px;line-height:1.5;">
      Kepala Lembaga Pemeriksa Halal (LPH) Universitas Islam Malang memberikan tugas kepada :
    </div>

    <!-- AUDITOR DETAILS ───────────────────────────────────────── -->
    ${auditorDetailsHtml}

    <!-- MISSION INTRO ─────────────────────────────────────────── -->
    <div style="margin-bottom:12px;text-align:justify;font-size:14px;line-height:1.5;">
      Untuk melakukan Audit Sertifikasi Halal di Fasilitas Produksi Pelaku Usaha pada :
    </div>

    <!-- AUDIT ACTIVITY DETAILS ────────────────────────────────── -->
    <table style="border-collapse:collapse;margin-left:44px;margin-bottom:18px;font-size:14px;width:calc(100% - 44px);line-height:1.6;">
      <tbody>
        <tr>
          <td style="width:110px;font-weight:bold;vertical-align:top;padding:2px 0;">Hari</td>
          <td style="vertical-align:top;padding:2px 0;">: ${dayOfVisit}</td>
        </tr>
        <tr>
          <td style="font-weight:bold;vertical-align:top;padding:2px 0;">Tanggal</td>
          <td style="vertical-align:top;padding:2px 0;">: ${formattedDate}</td>
        </tr>
        <tr>
          <td style="font-weight:bold;vertical-align:top;padding:2px 0;">Lokasi Audit</td>
          <td style="vertical-align:top;padding:2px 0;white-space:pre-line;">: ${visitPlace}</td>
        </tr>
        <tr>
          <td style="font-weight:bold;vertical-align:top;padding:2px 0;">Pelaku Usaha</td>
          <td style="vertical-align:top;padding:2px 0;">: ${businessName}</td>
        </tr>
        <tr>
          <td style="font-weight:bold;vertical-align:top;padding:2px 0;">Kontak Person</td>
          <td style="vertical-align:top;padding:2px 0;">: ${contactPerson}</td>
        </tr>
      </tbody>
    </table>

    <!-- OUTRO ─────────────────────────────────────────────────── -->
    <div style="margin-bottom:28px;text-align:justify;font-size:14px;line-height:1.6;">
      Demikian surat tugas ini dibuat untuk dilaksanakan dengan penuh tanggung jawab. Surat tugas ini berlaku sejak tanggal dikeluarkan sampai selesai proses Audit Sertifikasi Halal.
    </div>

    <!-- TANDA TANGAN ──────────────────────────────────────────── -->
    <div style="text-align:right;margin-bottom:14px;font-size:14px;line-height:1.5;">
      <div style="display:inline-block;text-align:left;width:300px;position:relative;z-index:10;">
        Malang, ${signDate}<br/>
        Kepala Lembaga Pemeriksa Halal UNISMA,<br/><br/><br/><br/><br/>
        <strong>Dr. Hj. Jeni Susyanti, SE, MM, BKP, C.B.V</strong><br/>
        <span style="font-size:10.5pt;">NPP 1950200019</span>
      </div>
    </div>
  </div><!-- /MAIN CONTENT -->
  <!-- FOOTER ─────────────────────────────────────────────────── -->
  <img
    src="${base}/assets/letter_images/footer.jpeg"
    style="
      position:absolute;
      bottom:${FOOTER_PAD_B}px;
      left:${CONTENT_PAD_H}px;
      width:${794 - CONTENT_PAD_H * 2}px;
      display:block;
      z-index:2;
    "
    crossorigin="anonymous"
  />
</div>`;
}

/* ─────────────────────────────────────────────────────────────────────────── */

const AIWorkspace: React.FC<AIWorkspaceProps> = ({
  finance,
  currentUser,
  onLetterSaved
}) => {
  // ── state ────────────────────────────────────────────────────────────────
  const [activeTask, setActiveTask] = useState<AITaskType>('finance');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Finance form states
  const [financeYear, setFinanceYear] = useState<string>(new Date().getFullYear().toString());
  const [financeStartMonth, setFinanceStartMonth] = useState<string>('01');
  const [financeEndMonth, setFinanceEndMonth] = useState<string>('12');

  // Vehicle form states
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

  // Auditor form states
  const [auditorLetterNo, setAuditorLetterNo] = useState<string>('17/P44/U.LPH/K/F.05/IV/2025');
  const [auditorName, setAuditorName] = useState<string>('Majida Ramadhan, S.Si., M.Si');
  const [auditorNpp, setAuditorNpp] = useState<string>('192082199332294');
  const [auditorVisitDate, setAuditorVisitDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [auditorVisitPlace, setAuditorVisitPlace] = useState<string>('');
  const [auditorBusinessName, setAuditorBusinessName] = useState<string>('');
  const [auditorContact, setAuditorContact] = useState<string>('');
  const [auditorSignDate, setAuditorSignDate] = useState<string>(() => {
    const d = new Date();
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  });
  const [auditorCount, setAuditorCount] = useState<number>(1);
  const [auditorName2, setAuditorName2] = useState<string>('');
  const [auditorNpp2, setAuditorNpp2] = useState<string>('');

  // ── derived ──────────────────────────────────────────────────────────────
  const availableYears = Array.from(
    new Set(finance.map((item) => new Date(item.date).getFullYear().toString()))
  ).sort((a, b) => b.localeCompare(a));

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

  // ── helpers ──────────────────────────────────────────────────────────────
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

  /** Build props shared by preview and capture */
  const letterProps = (): LetterTemplateProps => ({
    letterNo:   loanLetterNo,
    letterDate: loanLetterDate,
    visitDate:  loanVisitDate,
    visitTime:  loanVisitTime,
    visitPlace: loanVisitPlace,
    getDay:     getIndonesianDay,
    formatDate: formatIndonesianDate,
  });

  const auditorLetterProps = (): AuditorLetterTemplateProps => ({
    letterNo:      auditorLetterNo,
    auditorName:   auditorName,
    auditorNpp:    auditorNpp,
    auditorName2:  auditorCount === 2 ? auditorName2 : undefined,
    auditorNpp2:   auditorCount === 2 ? auditorNpp2 : undefined,
    visitDate:     auditorVisitDate,
    visitPlace:    auditorVisitPlace,
    businessName:  auditorBusinessName,
    contactPerson: auditorContact,
    signDate:      auditorSignDate,
    getDay:        getIndonesianDay,
    formatDate:    formatIndonesianDate,
  });

  // ── action handlers ───────────────────────────────────────────────────────
  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePrint = () => {
    if (!result || activeTask !== 'finance') return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak Rekap Keuangan LPH UNISMA</title>
          <style>
            body { font-family:'Times New Roman',Times,serif; line-height:1.5; padding:40px; color:#000; background:#fff; }
            pre  { white-space:pre-wrap; font-family:'Times New Roman',Times,serif; font-size:12pt; }
            .prose-print { max-width:800px; margin:0 auto; }
          </style>
        </head>
        <body>
          <div class="prose-print"><div id="content"></div></div>
          <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
          <script>
            document.getElementById('content').innerHTML = marked.parse(\`${result.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`);
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  /**
   * Export PDF.
   * For vehicle/auditor letters: renders the SAME HTML that buildLetterHTML() produces
   * into a fixed off-screen div, then captures with html2canvas.
   * For finance: converts markdown → image → multi-page PDF.
   */
  const handleExportPdf = async () => {
    if (!result) return;

    if (activeTask === 'vehicle' || activeTask === 'auditor') {
      const BASE  = window.location.origin;
      const F4_W  = 794;
      const F4_H  = 1247;

      // Build the exact same HTML used for the preview
      const html = activeTask === 'vehicle'
        ? buildLetterHTML({ ...letterProps(), base: BASE })
        : buildAuditorLetterHTML({ ...auditorLetterProps(), base: BASE });

      const pdfDiv = document.createElement('div');
      pdfDiv.style.cssText = `
        position:fixed;
        top:-99999px;
        left:-99999px;
        width:${F4_W}px;
        height:${F4_H}px;
        overflow:hidden;
        background:#fff;
      `;
      pdfDiv.innerHTML = html;
      document.body.appendChild(pdfDiv);

      // Wait for all images to load
      await Promise.all(
        Array.from(pdfDiv.querySelectorAll('img')).map(
          (img) => new Promise<void>((resolve) => {
            const el = img as HTMLImageElement;
            if (el.complete && el.naturalWidth > 0) resolve();
            else { el.onload = () => resolve(); el.onerror = () => resolve(); }
          })
        )
      );
      await new Promise((resolve) => setTimeout(resolve, 400));

      try {
        const canvas = await html2canvas(pdfDiv, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: F4_W,
          height: F4_H,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [210, 330] });
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 330);
        
        const filename = activeTask === 'vehicle'
          ? 'Surat_Peminjaman_Kendaraan.pdf'
          : 'Surat_Tugas_Auditor.pdf';
        pdf.save(filename);
      } catch (e) {
        console.error('PDF export failed', e);
        alert('Gagal mengekspor PDF.');
      } finally {
        document.body.removeChild(pdfDiv);
      }

    } else {
      // Finance recap → multi-page PDF
      const tempDiv = document.createElement('div');
      tempDiv.style.cssText = `
        position:fixed;top:-9999px;left:-9999px;
        width:794px;padding:76px;
        background:#fff;color:#000;
        font-family:'Times New Roman',serif;
        font-size:12pt;line-height:1.5;
        box-sizing:border-box;
      `;
      tempDiv.innerHTML = `<div>${marked.parse(result)}</div>`;
      document.body.appendChild(tempDiv);

      try {
        const canvas = await html2canvas(tempDiv, { scale: 2, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ unit: 'mm', format: [210, 330] });
        const pdfW = 210, pdfH = 330;
        const imgH = (canvas.height * pdfW) / canvas.width;
        let heightLeft = imgH, pos = 0;

        pdf.addImage(imgData, 'PNG', 0, pos, pdfW, imgH);
        heightLeft -= pdfH;

        while (heightLeft > 0) {
          pos = heightLeft - imgH;
          pdf.addPage([210, 330]);
          pdf.addImage(imgData, 'PNG', 0, pos, pdfW, imgH);
          heightLeft -= pdfH;
        }

        pdf.save('Rekap_Keuangan.pdf');
      } catch (e) {
        console.error('PDF export failed', e);
        alert('Gagal mengekspor PDF.');
      } finally {
        document.body.removeChild(tempDiv);
      }
    }
  };

  const handleSaveToLetters = async (title: string, type: 'Incoming' | 'Outgoing') => {
    if (!result || isSaved) return;
    setIsLoading(true);
    try {
      const username = currentUser?.fullName || currentUser?.username || 'System';
      const letterData: Partial<Letter> = {
        title,
        letterNumber: activeTask === 'vehicle'
          ? loanLetterNo
          : activeTask === 'auditor'
          ? auditorLetterNo
          : `[DRAF/${new Date().getFullYear()}]`,
        date: new Date().toISOString().split('T')[0],
        type,
        link: '',
        content: result,
        createdBy: username,
        updatedBy: username,
      };
      await dataService.upsertLetter(letterData);
      setIsSaved(true);
      if (onLetterSaved) onLetterSaved();
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
        // For vehicle we store a simple text record; the rich preview is rebuilt from form state
        const dayOfVisit = getIndonesianDay(loanVisitDate);
        const formattedVisitDate = formatIndonesianDate(loanVisitDate);
        const letterContent = `
Nomor : ${loanLetterNo}
Tanggal : ${loanLetterDate}
Hari : ${dayOfVisit}
Tanggal Kunjungan : ${formattedVisitDate}
Waktu : ${loanVisitTime}
Tempat : ${loanVisitPlace}
        `.trim();

        await new Promise((resolve) => setTimeout(resolve, 800));
        setResult(letterContent);

      } else if (activeTask === 'auditor') {
        if (!auditorName.trim()) {
          alert('Mohon lengkapi parameter Nama Auditor.');
          setIsLoading(false);
          return;
        }
        if (auditorCount === 2 && !auditorName2.trim()) {
          alert('Mohon lengkapi parameter Nama Auditor Ke-2.');
          setIsLoading(false);
          return;
        }
        if (!auditorVisitPlace.trim()) {
          alert('Mohon lengkapi parameter Lokasi Audit.');
          setIsLoading(false);
          return;
        }
        if (!auditorBusinessName.trim()) {
          alert('Mohon lengkapi parameter Pelaku Usaha.');
          setIsLoading(false);
          return;
        }

        const dayOfVisit = getIndonesianDay(auditorVisitDate);
        const formattedVisitDate = formatIndonesianDate(auditorVisitDate);

        const letterContent = `
Nomor : ${auditorLetterNo}
Auditor 1 : ${auditorName} (NPP: ${auditorNpp})
${auditorCount === 2 ? `Auditor 2 : ${auditorName2} (NPP: ${auditorNpp2})` : ''}
Hari : ${dayOfVisit}
Tanggal Audit : ${formattedVisitDate}
Lokasi Audit : ${auditorVisitPlace}
Pelaku Usaha : ${auditorBusinessName}
Kontak Person : ${auditorContact}
Tanggal Ttd : ${auditorSignDate}
        `.trim();

        await new Promise((resolve) => setTimeout(resolve, 800));
        setResult(letterContent);
      }
    } catch (error) {
      console.error(error);
      setResult('Terjadi kesalahan saat memproses permintaan asisten AI.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

      {/* ── Sidebar Task Options ────────────────────────────────────────── */}
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
              <div className="flex items-center gap-3"><Wallet size={18} /><span className="text-sm">Rekap Keuangan</span></div>
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
              <div className="flex items-center gap-3"><FileText size={18} /><span className="text-sm">Peminjaman Kendaraan</span></div>
              <ChevronRight size={16} />
            </button>

            <button
              onClick={() => { setActiveTask('auditor'); setResult(''); }}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                activeTask === 'auditor'
                  ? 'neu-inset text-indigo-600 font-black'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center gap-3"><FileText size={18} /><span className="text-sm">Surat Tugas Auditor</span></div>
              <ChevronRight size={16} />
            </button>
          </div>
        </NeumorphicCard>

        {/* ── Dynamic Parameter Form ──────────────────────────────────── */}
        <NeumorphicCard className="space-y-4">
          <h3 className="font-black text-slate-700 text-sm uppercase tracking-widest">PARAMETER INPUT</h3>

          <div className="space-y-4 text-xs font-bold text-slate-600">

            {/* Finance Recap Form */}
            {activeTask === 'finance' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">Pilih Tahun</label>
                  <select
                    value={financeYear}
                    onChange={(e) => { setFinanceYear(e.target.value); setFinanceStartMonth('01'); setFinanceEndMonth('12'); }}
                    className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent cursor-pointer"
                  >
                    {availableYears.length > 0
                      ? availableYears.map((y) => <option key={y} value={y}>{y}</option>)
                      : <option value={new Date().getFullYear().toString()}>{new Date().getFullYear()}</option>}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block pl-1 text-[10px] text-slate-400 uppercase">Bulan Awal</label>
                    <select value={financeStartMonth} onChange={(e) => setFinanceStartMonth(e.target.value)} className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent cursor-pointer">
                      {ALL_MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block pl-1 text-[10px] text-slate-400 uppercase">Bulan Akhir</label>
                    <select value={financeEndMonth} onChange={(e) => setFinanceEndMonth(e.target.value)} className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent cursor-pointer">
                      {ALL_MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 pl-1 leading-relaxed">
                  Data diambil dari tab <span className="font-black text-indigo-500">Finance</span>. Tentukan rentang periode analisis rekap.
                </p>
              </div>
            )}

            {/* Vehicle Loan Form */}
            {activeTask === 'vehicle' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">Nomor Surat</label>
                  <input value={loanLetterNo} onChange={(e) => setLoanLetterNo(e.target.value)} placeholder="e.g. 16/P44/U.LPH/K/L.25/IV/2025" className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent font-sans" />
                </div>
                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">Tanggal Surat</label>
                  <input value={loanLetterDate} onChange={(e) => setLoanLetterDate(e.target.value)} placeholder="e.g. 29 November 2025" className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent font-sans" />
                </div>
                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">Tanggal Kunjungan / Audit</label>
                  <input type="date" value={loanVisitDate} onChange={(e) => setLoanVisitDate(e.target.value)} className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent cursor-pointer font-sans" />
                  <p className="text-[9px] text-indigo-500 pl-1 font-bold">
                    Hari Terdeteksi: {getIndonesianDay(loanVisitDate) || '-'}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">Waktu / Jam Kunjungan</label>
                  <input value={loanVisitTime} onChange={(e) => setLoanVisitTime(e.target.value)} placeholder="e.g. Pukul 09.00 - Selesai" className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent font-sans" />
                </div>
                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">Tempat Yang Dikunjungi</label>
                  <textarea value={loanVisitPlace} onChange={(e) => setLoanVisitPlace(e.target.value)} placeholder="Masukkan tempat atau rute kunjungan..." className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent font-sans h-20 resize-none" />
                </div>
              </div>
            )}

            {/* Auditor Assignment Form */}
            {activeTask === 'auditor' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">Nomor Surat</label>
                  <input
                    value={auditorLetterNo}
                    onChange={(e) => setAuditorLetterNo(e.target.value)}
                    placeholder="e.g. 17/P44/U.LPH/K/F.05/IV/2025"
                    className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent font-sans"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">Jumlah Auditor</label>
                  <select
                    value={auditorCount}
                    onChange={(e) => setAuditorCount(Number(e.target.value))}
                    className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent cursor-pointer font-sans"
                  >
                    <option value={1}>1 Auditor</option>
                    <option value={2}>2 Auditor</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">{auditorCount === 2 ? 'Nama Auditor Ke-1' : 'Nama Auditor'}</label>
                  <input
                    value={auditorName}
                    onChange={(e) => setAuditorName(e.target.value)}
                    placeholder="e.g. Majida Ramadhan, S.Si., M.Si"
                    className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent font-sans"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">{auditorCount === 2 ? 'NPP Auditor Ke-1' : 'NPP Auditor'}</label>
                  <input
                    value={auditorNpp}
                    onChange={(e) => setAuditorNpp(e.target.value)}
                    placeholder="e.g. 192082199332294"
                    className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent font-sans"
                  />
                </div>

                {auditorCount === 2 && (
                  <>
                    <div className="space-y-2">
                      <label className="block pl-1 text-[10px] text-slate-400 uppercase">Nama Auditor Ke-2</label>
                      <input
                        value={auditorName2}
                        onChange={(e) => setAuditorName2(e.target.value)}
                        placeholder="e.g. Auditor Kedua, S.T."
                        className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent font-sans"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block pl-1 text-[10px] text-slate-400 uppercase">NPP Auditor Ke-2</label>
                      <input
                        value={auditorNpp2}
                        onChange={(e) => setAuditorNpp2(e.target.value)}
                        placeholder="e.g. 198239812938129"
                        className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent font-sans"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">Tanggal Audit</label>
                  <input
                    type="date"
                    value={auditorVisitDate}
                    onChange={(e) => setAuditorVisitDate(e.target.value)}
                    className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent cursor-pointer font-sans"
                  />
                  <p className="text-[9px] text-indigo-500 pl-1 font-bold">
                    Hari Terdeteksi: {getIndonesianDay(auditorVisitDate) || '-'}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">Lokasi Audit</label>
                  <textarea
                    value={auditorVisitPlace}
                    onChange={(e) => setAuditorVisitPlace(e.target.value)}
                    placeholder="e.g. Outlet Jack's & Co&#10;Jl. Raya Tlogomas No. 5 Lowokwaru, Kota Malang"
                    className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent font-sans h-20 resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">Pelaku Usaha</label>
                  <input
                    value={auditorBusinessName}
                    onChange={(e) => setAuditorBusinessName(e.target.value)}
                    placeholder="e.g. Davin Gunawan Alim"
                    className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent font-sans"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">Kontak Person</label>
                  <input
                    value={auditorContact}
                    onChange={(e) => setAuditorContact(e.target.value)}
                    placeholder="e.g. 0341575589"
                    className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent font-sans"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block pl-1 text-[10px] text-slate-400 uppercase">Tanggal Tanda Tangan (Malang, ...)</label>
                  <input
                    value={auditorSignDate}
                    onChange={(e) => setAuditorSignDate(e.target.value)}
                    placeholder="e.g. 29 April 2025"
                    className="w-full p-4 neu-inset rounded-xl outline-none bg-transparent font-sans"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleExecuteAI}
              disabled={isLoading}
              className="w-full mt-6 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-black neu-button shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
            >
              {isLoading
                ? <><Loader2 size={16} className="animate-spin" /> PROSES DATA...</>
                : <><Sparkles size={16} /> KERJAKAN DENGAN AI</>}
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

      {/* ── Main Results Preview Window ──────────────────────────────────── */}
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

                {activeTask === 'finance' ? (
                  <button
                    onClick={handlePrint}
                    title="Cetak Rekap"
                    className="p-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold"
                  >
                    <Printer size={14} /> Cetak
                  </button>
                ) : (
                  <button
                    onClick={handleExportPdf}
                    title="Convert ke PDF"
                    className="p-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold"
                  >
                    <FileText size={14} /> Convert to PDF
                  </button>
                )}

                {(activeTask === 'vehicle' || activeTask === 'auditor') && (
                  <button
                    onClick={() => handleSaveToLetters(
                      activeTask === 'vehicle'
                        ? `Peminjaman Kendaraan - ${loanVisitPlace}`
                        : `Surat Tugas Auditor - ${auditorBusinessName}`,
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

          {/* Report / Letter Preview Area */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-100 custom-scrollbar">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <p className="font-black uppercase tracking-widest text-xs">Asisten AI sedang menyusun dokumen...</p>
              </div>

            ) : result ? (

              activeTask === 'vehicle' ? (
                /*
                  VEHICLE LETTER PREVIEW
                  ─────────────────────
                  Rendered via dangerouslySetInnerHTML using the exact same
                  buildLetterHTML() function used for PDF capture.
                  We scale it down to fit the preview column (~650px)
                  via CSS transform-origin so no dimensions are altered.
                */
                <div className="overflow-x-auto flex justify-center">
                  <div
                    style={{
                      transformOrigin: 'top center',
                      /* Scale 794px template to fit preview area */
                      transform: 'scale(0.82)',
                      width:  '794px',
                      marginBottom: '-18%', // compensate for scale shrink
                    }}
                    dangerouslySetInnerHTML={{
                      __html: buildLetterHTML({
                        ...letterProps(),
                        base: window.location.origin,
                      })
                    }}
                  />
                </div>

              ) : activeTask === 'auditor' ? (
                /*
                  AUDITOR LETTER PREVIEW
                  ─────────────────────
                  Rendered via dangerouslySetInnerHTML using the exact same
                  buildAuditorLetterHTML() function.
                */
                <div className="overflow-x-auto flex justify-center">
                  <div
                    style={{
                      transformOrigin: 'top center',
                      /* Scale 794px template to fit preview area */
                      transform: 'scale(0.82)',
                      width:  '794px',
                      marginBottom: '-18%', // compensate for scale shrink
                    }}
                    dangerouslySetInnerHTML={{
                      __html: buildAuditorLetterHTML({
                        ...auditorLetterProps(),
                        base: window.location.origin,
                      })
                    }}
                  />
                </div>

              ) : (
                /* Finance Recap Preview */
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
                    Tentukan rentang parameter di panel kiri, lalu klik tombol <strong>"Kerjakan dengan AI"</strong> untuk memulai.
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
