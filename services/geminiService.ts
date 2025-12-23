
import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let ai: any = null;
// Robust check for API Key
if (apiKey && typeof apiKey === 'string' && apiKey.length > 10) {
  try {
    ai = new GoogleGenAI({ apiKey });
    console.log("UNI AI: Client initialized successfully");
  } catch (err) {
    console.error("UNI AI: Initialization error:", err);
  }
} else {
  console.warn("UNI AI: API Key missing or invalid. Check VITE_GEMINI_API_KEY in Vercel Settings.");
}

export async function getDashboardInsight(data: any) {
  try {
    if (!ai) return "Assalamualaikum... Sistem siap melayani. Wassalamualaikum.";

    const prompt = `Analyze this LPH UNISMA Dashboard data and provide a brief professional summary (max 3 sentences) in Indonesian for the dashboard.
    Data: ${JSON.stringify(data)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Anda adalah 'UNI AI LPH UNISMA', asisten khusus Sistem Informasi Halal UNISMA. ATURAN KETAT: 1. MUDAH: Selalu mulai dengan 'Assalamualaikum...' dan akhiri dengan 'Wassalamualaikum.'. 2. LINGKUP DATA: HANYA berikan ringkasan berdasarkan data dashboard yang diberikan. JANGAN berikan informasi, saran, atau prediksi di luar data tersebut. 3. PERAN: Sesuaikan kedalaman informasi dengan data yang tersedia. Jika data kosong, katakan data belum tersedia. 4. BAHASA: Gunakan Bahasa Indonesia yang profesional dan ringkas (maks 3 kalimat).",
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
    if (!ai) return "Assalamualaikum... Layanan AI belum dikonfigurasi. Silakan hubungi admin. Wassalamualaikum.";

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

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Anda adalah 'UNI AI Assistant' khusus LPH UNISMA. TUGAS: Menjawab pertanyaan terkait data Manajemen LPH UNISMA. ATURAN KETAT: 1. LINGKUP DATA: HANYA jawab berdasarkan data yang ada di konteks 'Current System Data Context'. JANGAN menjawab pertanyaan umum, pengetahuan umum, atau hal di luar data sistem ini. 2. PENOLAKAN: Jika pertanyaan di luar data yang disediakan, jawab dengan: 'Maaf, saya hanya diinstruksikan untuk menjawab pertanyaan terkait data internal sistem LPH UNISMA.' 3. PERAN (ROLE): Patuhi visibilitas data berdasarkan Role. Jika Role adalah GUEST/PUBLIC, JANGAN bocorkan data sensitif meskipun ada di konteks (kecuali yang ditandai public). 4. FORMAT: Gunakan Markdown (tabel/list) untuk kerapian. 5. SALAM: Wajib mulai dengan 'Assalamualaikum...' dan akhiri dengan 'Wassalamualaikum.'.",
        temperature: 0.1,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Chat error:", error);
    return "Assalamualaikum... Maaf, saya sedang mengalami kendala teknis. Silakan coba lagi nanti. Wassalamualaikum.";
  }
}
