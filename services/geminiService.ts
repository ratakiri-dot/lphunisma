import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_OPENROUTER_API_KEY;
const isOpenRouter = apiKey && typeof apiKey === 'string' && apiKey.startsWith('sk-or-');

let ai: any = null;

if (apiKey && typeof apiKey === 'string' && apiKey.length > 10) {
  if (!isOpenRouter) {
    try {
      ai = new GoogleGenAI({ apiKey });
      console.log("UNI AI: Client initialized successfully with Gemini API Key");
    } catch (err) {
      console.error("UNI AI: Initialization error:", err);
    }
  } else {
    console.log("UNI AI: Running in OpenRouter Mode");
  }
} else {
  console.warn("UNI AI: API Key missing or invalid.");
}

async function callOpenRouter(systemInstruction: string, prompt: string, model: string = 'google/gemini-2.0-flash') {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin || 'http://localhost:3000',
        'X-Title': 'LPH UNISMA MIS'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenRouter error response:", errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Gagal menghasilkan konten dari OpenRouter.';
  } catch (error) {
    console.error("OpenRouter call failed:", error);
    throw error;
  }
}

function isAIReady(): boolean {
  return !!ai || !!isOpenRouter;
}

export async function getDashboardInsight(data: any) {
  try {
    if (!isAIReady()) return "Assalamualaikum... Sistem siap melayani. Wassalamualaikum.";

    const prompt = `Analyze this LPH UNISMA Dashboard data and provide a brief professional summary (max 3 sentences) in Indonesian for the dashboard.
    Data: ${JSON.stringify(data)}`;

    const systemInstruction = "Anda adalah 'UNI AI LPH UNISMA', asisten khusus Sistem Informasi Halal UNISMA. ATURAN KETAT: 1. MUDAH: Selalu mulai dengan 'Assalamualaikum...' dan akhiri dengan 'Wassalamualaikum.'. 2. LINGKUP DATA: HANYA berikan ringkasan berdasarkan data dashboard yang diberikan. JANGAN berikan informasi, saran, atau prediksi di luar data tersebut. 3. PERAN: Sesuaikan kedalaman informasi dengan data yang tersedia. Jika data kosong, katakan data belum tersedia. 4. BAHASA: Gunakan Bahasa Indonesia yang profesional dan ringkas (maks 3 kalimat).";

    if (isOpenRouter) {
      return await callOpenRouter(systemInstruction, prompt);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.1,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error fetching Gemini insight:", error);
    return "Assalamualaikum... Selamat datang di Dashboard LPH UNISMA. Sistem saat ini berjalan normal dan siap melayani manajemen sertifikasi halal Anda. Wassalamualaikum.";
  }
}

export async function chatWithAI(userMessage: string, contextData: any) {
  try {
    if (!isAIReady()) return "Assalamualaikum... Layanan AI belum dikonfigurasi. Silakan hubungi admin. Wassalamualaikum.";

    const prompt = `User Question: ${userMessage}
    
    Current System Data Context (Role: ${contextData.viewerRole}):
    ${JSON.stringify(contextData)}
    
    STRICT PRESENTATION RULES:
    1. FORMAT: Use Markdown for EVERYTHING.
    2. DATA LISTS: Use bulleted lists. Bold the key labels (e.g., **Nama Usaha:**).
    3. TABLES: If comparing 2 or more items, use a Markdown table with clear headers.
    4. SPACING: Add a blank line between different data records to avoid clutter.
    5. PRIVACY: If data is 'ACCESS_DENIED_FOR_GUEST' or 'ACCESS_DENIED_FOR_NON_ADMIN', DO NOT SHOW IT. Politely explain: 'Maaf, akses Anda (Guest) tidak diizinkan untuk melihat data ini.'
    
    TONE: Professional, structured, and helpful. 
    MANDATORY: Start with 'Assalamualaikum...' and end with 'Wassalamualaikum.'.`;

    const systemInstruction = "Anda adalah 'UNI AI Assistant' khusus LPH UNISMA. TUGAS: Menjawab pertanyaan terkait data Manajemen LPH UNISMA. ATURAN KETAT: 1. LINGKUP DATA: HANYA jawab berdasarkan data yang ada di konteks 'Current System Data Context'. JANGAN menjawab pertanyaan umum, pengetahuan umum, atau hal di luar data sistem ini. 2. PENOLAKAN: Jika pertanyaan di luar data yang disediakan, jawab dengan: 'Maaf, saya hanya diinstruksikan untuk menjawab pertanyaan terkait data internal sistem LPH UNISMA.' 3. PERAN (ROLE): Patuhi visibilitas data berdasarkan Role. Jika Role adalah GUEST/PUBLIC, JANGAN bocorkan data sensitif meskipun ada di konteks (kecuali yang ditandai public). 4. FORMAT: Gunakan Markdown (tabel/list) untuk kerapian. 5. SALAM: Wajib mulai dengan 'Assalamualaikum...' dan akhiri dengan 'Wassalamualaikum.'.";

    if (isOpenRouter) {
      return await callOpenRouter(systemInstruction, prompt);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.1,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Chat error:", error);
    return "Assalamualaikum... Maaf, saya sedang mengalami kendala teknis. Silakan coba lagi nanti. Wassalamualaikum.";
  }
}
function formatRupiah(value: number): string {
  return "Rp " + Math.round(value).toLocaleString("id-ID");
}

function generateLocalFinancialRecap(periodLabel: string, filteredData: any[]): string {
  // 1. Calculate global summaries
  let totalDebit = 0;
  let totalCredit = 0;
  
  filteredData.forEach(item => {
    totalDebit += Number(item.debit || 0);
    totalCredit += Number(item.credit || 0);
  });
  
  const netMutasi = totalDebit - totalCredit;
  const statusKeuangan = netMutasi >= 0 ? "Surplus (Sehat/Positif)" : "Defisit (Negatif)";

  // 2. Categorize transactions
  const categories = {
    sertifikasi: { name: "Biaya Sertifikasi & Mitra", debit: 0, credit: 0, count: 0 },
    perjalanan: { name: "Perjalanan Audit & Akomodasi", debit: 0, credit: 0, count: 0 },
    operasional: { name: "Operasional Kantor & ATK", debit: 0, credit: 0, count: 0 },
    kegiatan: { name: "Kegiatan & Pertemuan", debit: 0, credit: 0, count: 0 },
    lainnya: { name: "Lain-lain / Umum", debit: 0, credit: 0, count: 0 }
  };

  filteredData.forEach(item => {
    const desc = (item.description || "").toLowerCase();
    let cat: keyof typeof categories = "lainnya";

    if (desc.includes("sertifikasi") || desc.includes("mitra") || desc.includes("pembayaran") || desc.includes("tarif") || desc.includes("debit")) {
      cat = "sertifikasi";
    } else if (desc.includes("audit") || desc.includes("jalan") || desc.includes("perdin") || desc.includes("bensin") || desc.includes("transport") || desc.includes("akomodasi") || desc.includes("makan") || desc.includes("hotel") || desc.includes("tol")) {
      cat = "perjalanan";
    } else if (desc.includes("operasional") || desc.includes("atk") || desc.includes("kertas") || desc.includes("kantor") || desc.includes("listrik") || desc.includes("internet") || desc.includes("sewa") || desc.includes("telepon") || desc.includes("print") || desc.includes("tinta")) {
      cat = "operasional";
    } else if (desc.includes("panitia") || desc.includes("kegiatan") || desc.includes("rapat") || desc.includes("konsumsi") || desc.includes("acara") || desc.includes("sponsorship") || desc.includes("workshop") || desc.includes("seminar")) {
      cat = "kegiatan";
    }

    categories[cat].debit += Number(item.debit || 0);
    categories[cat].credit += Number(item.credit || 0);
    categories[cat].count += 1;
  });

  // 3. Find largest transactions
  let largestDebitItem: any = null;
  let largestCreditItem: any = null;

  filteredData.forEach(item => {
    const debit = Number(item.debit || 0);
    const credit = Number(item.credit || 0);

    if (debit > 0 && (!largestDebitItem || debit > Number(largestDebitItem.debit || 0))) {
      largestDebitItem = item;
    }
    if (credit > 0 && (!largestCreditItem || credit > Number(largestCreditItem.credit || 0))) {
      largestCreditItem = item;
    }
  });

  // 4. Build recommendations and evaluations
  let evaluasiText = "";
  let rekomendasiPoints = [];

  if (netMutasi >= 0) {
    evaluasiText = `Arus kas pada periode ini menunjukkan kondisi yang sangat sehat dengan mencatatkan **surplus bersih** sebesar **${formatRupiah(netMutasi)}**. Total pemasukan (debit) sebesar ${formatRupiah(totalDebit)} berhasil menutupi pengeluaran (kredit) yang sebesar ${formatRupiah(totalCredit)}. Rasio efisiensi pengeluaran terhadap pendapatan berada pada tingkat yang aman.`;
    rekomendasiPoints = [
      "Pertahankan kestabilan alokasi dana operasional dan pastikan cadangan kas (surplus) dialokasikan untuk dana darurat atau pengembangan sarana pendukung LPH.",
      "Optimalkan proses penagihan biaya sertifikasi halal dari pelaku usaha agar perputaran kas tetap terjaga dengan cepat.",
      "Lakukan investasi atau program peningkatan kapasitas kompetensi bagi para auditor halal memanfaatkan dana surplus yang ada."
    ];
  } else {
    evaluasiText = `Arus kas pada periode ini mencatatkan **defisit bersih** sebesar **${formatRupiah(Math.abs(netMutasi))}**. Total pengeluaran operasional dan akomodasi mencapai ${formatRupiah(totalCredit)}, melebihi pemasukan yang hanya sebesar ${formatRupiah(totalDebit)}. Kondisi ini memerlukan evaluasi segera terhadap efisiensi anggaran belanja lembaga.`;
    rekomendasiPoints = [
      "Lakukan peninjauan ulang dan pengetatan anggaran operasional kantor serta biaya akomodasi/perjalanan audit yang tidak mendesak.",
      "Tingkatkan volume sertifikasi halal atau jangkauan promosi LPH UNISMA untuk memperbesar arus kas masuk (debit) di periode mendatang.",
      "Susun skala prioritas pengeluaran bulanan dan lakukan negosiasi ulang dengan vendor atau mitra penyedia layanan jika memungkinkan."
    ];
  }

  // 5. Generate Markdown Report
  let md = `Assalamualaikum...

Berikut adalah **Laporan Rekapitulasi Keuangan LPH UNISMA** yang disusun secara profesional dan sistematis untuk periode **${periodLabel}**.

---

### 1. PERIODE LAPORAN
* **Rentang Waktu:** ${periodLabel}
* **Jumlah Transaksi Tercatat:** ${filteredData.length} transaksi

---

### 2. RINGKASAN KEUANGAN GLOBAL
Di bawah ini adalah ringkasan keseluruhan mutasi keuangan selama periode laporan berlangsung:

| Parameter Keuangan | Nilai Nominal | Keterangan |
| :--- | :--- | :--- |
| **Total Pemasukan (Debit)** | **${formatRupiah(totalDebit)}** | Seluruh arus kas masuk |
| **Total Pengeluaran (Kredit)** | **${formatRupiah(totalCredit)}** | Seluruh arus kas keluar |
| **Net Mutasi / Saldo Bersih** | **${formatRupiah(netMutasi)}** | Selisih bersih pemasukan dan pengeluaran |
| **Status Neraca** | **${statusKeuangan}** | Kondisi likuiditas kas |

---

### 3. KATEGORISASI TRANSAKSI
Rincian alokasi keuangan yang dikelompokkan berdasarkan kategori operasional lembaga:

| Kategori Operasional | Jml Transaksi | Total Debit (Pemasukan) | Total Kredit (Pengeluaran) | Estimasi Kontribusi |
| :--- | :---: | :--- | :--- | :---: |
`;

  Object.values(categories).forEach(cat => {
    const totalCat = cat.debit + cat.credit;
    if (totalCat > 0 || cat.count > 0) {
      const percentage = totalDebit > 0 ? ((cat.debit / totalDebit) * 100).toFixed(1) + "%" : "0%";
      md += `| ${cat.name} | ${cat.count} | ${formatRupiah(cat.debit)} | ${formatRupiah(cat.credit)} | ${percentage} dari Pemasukan |\n`;
    }
  });

  md += `
---

### 4. ANALISIS TRANSAKSI TERBESAR
* **Transaksi Masuk Terbesar (Pemasukan Utama):**
  ${largestDebitItem 
    ? `Tercatat pada tanggal **${new Date(largestDebitItem.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}** sebesar **${formatRupiah(largestDebitItem.debit)}** dengan keterangan: *"${largestDebitItem.description}"*.`
    : "Tidak ada transaksi masuk yang tercatat."}
  
* **Transaksi Keluar Terbesar (Pengeluaran Terbesar):**
  ${largestCreditItem 
    ? `Tercatat pada tanggal **${new Date(largestCreditItem.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}** sebesar **${formatRupiah(largestCreditItem.credit)}** dengan keterangan: *"${largestCreditItem.description}"*.`
    : "Tidak ada transaksi keluar yang tercatat."}

---

### 5. EVALUASI KONDISI KEUANGAN
${evaluasiText}

---

### 6. REKOMENDASI STRATEGIS
${rekomendasiPoints.map((point, index) => `${index + 1}. **${point.split(':')[0]}**: ${point.substring(point.indexOf('.') + 1).trim()}`).join('\n')}

---

Laporan rekapitulasi keuangan ini dibuat secara otomatis dan komprehensif berdasarkan data transaksi riil LPH UNISMA. Semoga dapat menjadi bahan pertimbangan yang andal bagi pengambilan kebijakan berikutnya.

Wassalamualaikum.`;

  return md;
}

export async function generateFinancialRecap(year: string, financeData: any[], startMonth?: string, endMonth?: string) {
  let periodLabel = `Tahun ${year}`;
  let filteredData: any[] = [];
  
  try {
    // Filter berdasarkan tahun
    filteredData = financeData.filter((item: any) => {
      if (!item.date) return false;
      return new Date(item.date).getFullYear().toString() === year;
    });

    // Filter berdasarkan rentang bulan
    if (startMonth && endMonth) {
      filteredData = filteredData.filter((item: any) => {
        const itemMonth = new Date(item.date).getMonth() + 1;
        return itemMonth >= parseInt(startMonth) && itemMonth <= parseInt(endMonth);
      });
    }

    const MONTH_NAMES: Record<string, string> = {
      '01': 'Januari', '02': 'Februari', '03': 'Maret', '04': 'April',
      '05': 'Mei', '06': 'Juni', '07': 'Juli', '08': 'Agustus',
      '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember'
    };
    
    if (startMonth && endMonth) {
      if (startMonth === endMonth) {
        periodLabel = `Bulan ${MONTH_NAMES[startMonth]} ${year}`;
      } else if (startMonth === '01' && endMonth === '12') {
        periodLabel = `Tahun ${year} (Seluruh Bulan)`;
      } else {
        periodLabel = `Bulan ${MONTH_NAMES[startMonth]} - ${MONTH_NAMES[endMonth]} ${year}`;
      }
    }

    if (filteredData.length === 0) {
      return `Assalamualaikum... Tidak ditemukan data keuangan untuk periode ${periodLabel}. Wassalamualaikum.`;
    }

    // If Gemini API Key is missing or invalid, fall back to local generator immediately
    if (!isAIReady()) {
      return generateLocalFinancialRecap(periodLabel, filteredData);
    }

    const prompt = `Analisis data keuangan LPH UNISMA berikut untuk periode **${periodLabel}** dan susun laporan rekapitulasi keuangan yang komprehensif.
    
    Data Transaksi Keuangan (${periodLabel}):
    ${JSON.stringify(filteredData)}
    
    Format Laporan Harus Mengikuti Struktur:
    1. **Periode Laporan**: Sebutkan periode rekap (${periodLabel}).
    2. **Ringkasan Keuangan Global**: Total Pemasukan (Debit), Total Pengeluaran (Kredit), dan Saldo Bersih (Net Mutasi) selama periode tersebut.
    3. **Kategorisasi Transaksi**: Kelompokkan transaksi ke dalam beberapa kategori logis (misalnya: Biaya Sertifikasi/Pemasukan Mitra, Biaya Perjalanan Audit, Operasional Kantor/ATK, Kegiatan/Sponsorship, Lainnya) lengkap dengan nominal dan persentase terhadap total.
    4. **Analisis Transaksi Terbesar**: Sebutkan transaksi masuk terbesar dan transaksi keluar terbesar beserta keterangannya.
    5. **Evaluasi & Rekomendasi**: Berikan opini singkat dan profesional mengenai kondisi keuangan di periode tersebut serta rekomendasi yang relevan.
    
    Aturan Penulisan:
    - Gunakan Bahasa Indonesia yang formal dan profesional.
    - Format menggunakan Markdown yang rapi (gunakan bold, bullet points, dan tabel untuk data perbandingan).
    - Tampilkan nilai nominal dalam format Rupiah (Rp).
    - Selalu mulai laporan dengan "Assalamualaikum..." dan akhiri dengan "Wassalamualaikum."`;

    const systemInstruction = "Anda adalah 'UNI AI Financial Analyst' untuk LPH UNISMA. Tugas Anda menganalisis data transaksi keuangan dan menghasilkan laporan rekapitulasi yang detail, profesional, dan akurat menggunakan format Markdown.";

    if (isOpenRouter) {
      return await callOpenRouter(systemInstruction, prompt);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error generating finance recap via Gemini, falling back to local generator:", error);
    // If the API call fails (e.g. Quota Exceeded), return the locally generated beautiful report!
    try {
      if (filteredData.length > 0) {
        return generateLocalFinancialRecap(periodLabel, filteredData);
      }
    } catch (localErr) {
      console.error("Local fallback generator also failed:", localErr);
    }
    return "Assalamualaikum... Gagal menyusun rekap keuangan karena kendala teknis. Wassalamualaikum.";
  }
}



export async function generateCooperationLetter(partnerName: string, scope: string, signer: string, date: string) {
  try {
    if (!isAIReady()) return "Layanan AI belum dikonfigurasi.";

    const formattedDate = date ? new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Tanggal Surat';

    const prompt = `Buatlah draf surat penawaran kerja sama resmi (surat keluar) dari LPH UNISMA.
    
    Informasi Detail:
    - Nama Instansi/Mitra Penerima: ${partnerName}
    - Ruang Lingkup Kerja Sama: ${scope}
    - Nama Penandatangan Surat: ${signer}
    - Tanggal Surat: ${formattedDate}
    
    Instruksi Format Surat Dinas Indonesia Resmi:
    1. Tuliskan KOP SURAT resmi LPH UNISMA di bagian atas (menggunakan format teks tebal/bold, center):
       **LEMBAGA PEMERIKSA HALAL (LPH) UNIVERSITAS ISLAM MALANG**
       *Jl. MT Haryono 193 Malang, Jawa Timur | Telp: (0341) 551932 | Email: lph@unisma.ac.id*
       ---------------------------------------------------------------------------------------
    2. Bagian Administrasi Surat:
       - Nomor Surat: [Nomor Surat/LPH-UNISMA/OUT/${new Date(date).getFullYear() || new Date().getFullYear()}] (biarkan nomor surat memiliki bagian placeholder agar staf bisa melengkapinya)
       - Lampiran: 1 (satu) Berkas
       - Perihal: Penawaran Kerja Sama Sertifikasi Halal (${scope})
    3. Alamat Penerima:
       Yth. Pimpinan/Kepala
       ${partnerName}
       di Tempat
    4. Salam Pembuka: Assalamualaikum Wr. Wb.
    5. Isi Surat:
       - Paragraf Pembuka: Perkenalkan LPH UNISMA sebagai Lembaga Pemeriksa Halal yang terakreditasi dan berada di bawah naungan Universitas Islam Malang yang siap mendukung program jaminan produk halal.
       - Paragraf Isi: Menawarkan kerja sama konkret terkait ${scope}. Jelaskan secara profesional keuntungan bermitra dengan LPH UNISMA (fasilitas, auditor berkompeten, layanan profesional, dll).
       - Paragraf Penutup: Menyampaikan harapan agar penawaran ini dapat ditindaklanjuti dengan diskusi atau MoU.
    6. Salam Penutup: Wassalamualaikum Wr. Wb.
    7. Tanda Tangan (di bagian kanan bawah):
       Malang, ${formattedDate}
       Hormat kami,
       LPH Universitas Islam Malang
       
       [Tanda Tangan]
       
       **${signer}**
       Kepala LPH UNISMA
    
    Aturan Tambahan:
    - Gunakan Bahasa Indonesia yang sangat formal, sopan, dan baku.
    - Format output sebagai Markdown murni agar rapi saat ditampilkan dan disalin.`;

    const systemInstruction = "Anda adalah 'UNI AI Document Drafter' khusus LPH UNISMA. Tugas Anda menyusun draf surat resmi instansi/surat dinas Indonesia yang sangat rapi, formal, mengikuti kaidah bahasa baku, dan berstruktur standar.";

    if (isOpenRouter) {
      return await callOpenRouter(systemInstruction, prompt);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error generating cooperation letter:", error);
    return "Gagal membuat draf surat penawaran kerja sama.";
  }
}

export async function generateVehicleLoanLetter(auditorName: string, eventName: string, date: string, vehicleInfo: string, signer: string) {
  try {
    if (!isAIReady()) return "Layanan AI belum dikonfigurasi.";

    const formattedDate = date ? new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Tanggal Surat';

    const prompt = `Buatlah draf surat permohonan peminjaman kendaraan operasional dinas resmi dari LPH UNISMA ditujukan kepada Bagian Umum/Sarana Prasarana UNISMA.
    
    Informasi Detail:
    - Nama Auditor yang Bertugas: ${auditorName}
    - Nama Kegiatan/Agenda Audit: ${eventName}
    - Tanggal Kegiatan/Peminjaman: ${formattedDate}
    - Detail Kendaraan yang Diminta: ${vehicleInfo}
    - Nama Penandatangan Surat (Kepala LPH): ${signer}
    
    Instruksi Format Surat Dinas Indonesia Resmi:
    1. Tuliskan KOP SURAT resmi LPH UNISMA di bagian atas (menggunakan format teks tebal/bold, center):
       **LEMBAGA PEMERIKSA HALAL (LPH) UNIVERSITAS ISLAM MALANG**
       *Jl. MT Haryono 193 Malang, Jawa Timur | Telp: (0341) 551932 | Email: lph@unisma.ac.id*
       ---------------------------------------------------------------------------------------
    2. Bagian Administrasi Surat:
       - Nomor Surat: [Nomor Surat/LPH-UNISMA/OUT/${new Date().getFullYear()}]
       - Lampiran: -
       - Perihal: Permohonan Peminjaman Kendaraan Operasional untuk Audit Lapangan
    3. Alamat Penerima:
       Yth. Kepala Bagian Umum dan Sarana Prasarana
       Universitas Islam Malang
       di Tempat
    4. Salam Pembuka: Assalamualaikum Wr. Wb.
    5. Isi Surat:
       - Menjelaskan bahwa sehubungan dengan adanya agenda kegiatan LPH UNISMA yaitu: "${eventName}" yang akan dilaksanakan pada tanggal ${formattedDate}.
       - Menyatakan bahwa untuk kelancaran transportasi auditor pelaksana yaitu Bapak/Ibu **${auditorName}**, maka LPH UNISMA bermaksud memohon peminjaman kendaraan operasional berupa **${vehicleInfo}**.
       - Menyebutkan komitmen untuk menjaga kebersihan dan keamanan kendaraan operasional tersebut selama digunakan.
    6. Salam Penutup: Demikian permohonan ini kami sampaikan, atas perhatian dan kerja samanya kami ucapan terima kasih. Wassalamualaikum Wr. Wb.
    7. Tanda Tangan (di bagian kanan bawah):
       Malang, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
       Hormat kami,
       LPH Universitas Islam Malang
       
       [Tanda Tangan]
       
       **${signer}**
       Kepala LPH UNISMA
       
    Aturan Tambahan:
    - Gunakan Bahasa Indonesia yang sangat formal, sopan, dan baku.
    - Format output sebagai Markdown murni agar rapi saat ditampilkan dan disalin.`;

    const systemInstruction = "Anda adalah 'UNI AI Document Drafter' khusus LPH UNISMA. Tugas Anda menyusun draf surat resmi instansi/surat dinas Indonesia yang sangat rapi, formal, mengikuti kaidah bahasa baku, dan berstruktur standar.";

    if (isOpenRouter) {
      return await callOpenRouter(systemInstruction, prompt);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error generating vehicle loan letter:", error);
    return "Gagal membuat draf surat peminjaman kendaraan.";
  }
}
