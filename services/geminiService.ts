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
      model: 'gemini-1.5-flash',
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
      model: 'gemini-1.5-flash',
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

export async function generateFinancialRecap(year: string, financeData: any[]) {
  try {
    if (!isAIReady()) return "Assalamualaikum... Layanan AI belum dikonfigurasi. Wassalamualaikum.";

    const yearData = financeData.filter((item: any) => {
      if (!item.date) return false;
      return new Date(item.date).getFullYear().toString() === year;
    });

    if (yearData.length === 0) {
      return `Assalamualaikum... Tidak ditemukan data keuangan untuk tahun ${year}. Wassalamualaikum.`;
    }

    const prompt = `Analisis data keuangan LPH UNISMA berikut untuk tahun ${year} dan susun laporan rekapitulasi keuangan yang komprehensif.
    
    Data Transaksi Keuangan (${year}):
    ${JSON.stringify(yearData)}
    
    Format Laporan Harus Mengikuti Struktur:
    1. **Ringkasan Keuangan Global**: Total Pemasukan (Debit), Total Pengeluaran (Kredit), dan Saldo Bersih (Net Mutasi) selama tahun tersebut.
    2. **Kategorisasi Transaksi**: Kelompokkan transaksi ke dalam beberapa kategori logis (misalnya: Biaya Sertifikasi/Pemasukan Mitra, Biaya Perjalanan Audit, Operasional Kantor/ATK, Kegiatan/Sponsorship, Pajak/Lainnya) lengkap dengan persentase estimasi terhadap total anggaran.
    3. **Analisis Transaksi Terbesar**: Sebutkan transaksi masuk terbesar dan transaksi keluar terbesar dengan rincian keterangannya.
    4. **Evaluasi & Rekomendasi Anggaran**: Berikan opini singkat dan profesional mengenai efisiensi keuangan di tahun tersebut serta rekomendasi alokasi anggaran untuk tahun berikutnya.
    
    Aturan Penulisan:
    - Gunakan Bahasa Indonesia yang formal dan profesional.
    - Format menggunakan Markdown yang rapi (gunakan bold, bullet points, dan tabel untuk data perbandingan).
    - Selalu mulai laporan dengan "Assalamualaikum..." dan akhiri dengan "Wassalamualaikum."`;

    const systemInstruction = "Anda adalah 'UNI AI Financial Analyst' untuk LPH UNISMA. Tugas Anda menganalisis data transaksi mentah dan menghasilkan laporan keuangan yang sangat detail, profesional, dan akurat menggunakan format Markdown.";

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
    console.error("Error generating finance recap:", error);
    return "Assalamualaikum... Gagal menyusun rekap keuangan tahunan karena kendala teknis. Wassalamualaikum.";
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
      model: 'gemini-1.5-flash',
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
