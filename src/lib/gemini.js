import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL_NAME = "gemini-pro";
const API_KEY = "AIzaSyCnJ3redQaRkD8kHJthlt0fHEOx0RcV-OU";

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

const SYSTEM_PROMPT = `Anda adalah asisten kesehatan AI yang membantu memberikan informasi kesehatan umum.
Berikan informasi yang akurat dan berbasis bukti.
Selalu ingatkan bahwa ini hanya informasi umum dan pengguna harus berkonsultasi dengan profesional kesehatan untuk diagnosis atau pengobatan spesifik.`;

export async function generateResponse(userInput) {
  try {
    if (!userInput?.trim()) {
      throw new Error("Input tidak boleh kosong");
    }

    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: userInput }
    ]);

    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error("Tidak ada respons dari AI");
    }

    return text;
  } catch (error) {
    console.error("Error generating response:", error);
    throw new Error("Maaf, terjadi kesalahan. Silakan coba lagi dalam beberapa saat.");
  }
}
