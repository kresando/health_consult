import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyDymatDeXkjfzb5PUIs3wsqGr2aInkhYvM";
const MODEL_NAME = "gemini-pro";

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

const SYSTEM_PROMPT = `Anda adalah konsultan kesehatan AI yang membantu dan berpengetahuan. Peran Anda adalah:
1. Memberikan informasi kesehatan umum dan saran
2. Membantu pengguna memahami gejala umum
3. Menyarankan perbaikan gaya hidup dan tindakan pencegahan
4. Merekomendasikan kapan harus mencari bantuan medis profesional

Penting: Selalu sertakan disclaimer bahwa Anda adalah AI dan bukan pengganti saran medis profesional.

Berikan respons dalam Bahasa Indonesia yang sopan dan mudah dipahami.`;

export async function getHealthConsultation(userMessage) {
  try {
    // Create a more focused health-related prompt in Indonesian
    const formattedPrompt = `Sebagai konsultan kesehatan AI, mohon bantu dengan masalah kesehatan berikut: ${userMessage}

Mohon berikan:
1. Penilaian awal
2. Kemungkinan penyebab
3. Saran umum
4. Kapan harus ke dokter

Berikan respons dalam Bahasa Indonesia yang jelas dan mudah dipahami.`;

    const result = await model.generateContent(formattedPrompt);
    const response = await result.response;
    
    if (response && response.text) {
      return {
        success: true,
        content: response.text() + "\n\nDisclaimer: Ini adalah saran yang dihasilkan oleh AI dan tidak menggantikan konsultasi medis profesional. Jika Anda memiliki masalah kesehatan serius, silakan konsultasikan dengan tenaga medis."
      };
    } else {
      throw new Error("Format respons tidak valid");
    }
  } catch (error) {
    console.error("Error in health consultation:", error);
    return {
      success: false,
      content: "Maaf, saat ini saya mengalami kesulitan dalam memproses permintaan Anda. Silakan coba lagi nanti.",
      error: error.message
    };
  }
}
