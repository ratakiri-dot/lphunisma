
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
        systemInstruction: "You are 'UNI AI LPH UNISMA', a specialized Halal Information System assistant for LPH UNISMA. Rules: 1. You MUST ALWAYS start every response with 'Assalamualaikum...'. 2. You MUST ALWAYS end every response with 'Wassalamualaikum.'. 3. Provide concise, professional insights in Indonesian based on the provided dashboard data. Use Markdown for emphasis.",
        temperature: 0.7,
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
        systemInstruction: "You are 'UNI AI Assistant' for LPH UNISMA. You present data in highly organized Markdown tables and lists. You are extremely strict about role-based data visibility.",
        temperature: 0.2,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Chat error:", error);
    return "Assalamualaikum... Maaf, saya sedang mengalami kendala teknis. Silakan coba lagi nanti. Wassalamualaikum.";
  }
}
