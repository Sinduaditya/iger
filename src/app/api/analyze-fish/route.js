import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Inisialisasi Gemini Client dengan API Key dari environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Fungsi untuk mengubah buffer menjadi base64
function bufferToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType,
    },
  };
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type;
    
    // Pilih model Gemini yang mendukung input gambar
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Anda adalah seorang ahli perikanan dan juru masak berpengalaman. Analisis gambar ikan ini dengan cermat. 
      Fokus pada mata, insang, sisik, dan tekstur daging jika terlihat.
      Berikan jawaban HANYA dalam format JSON yang valid tanpa tambahan teks atau markdown apapun.
      JSON harus memiliki struktur berikut:
      {
        "freshness": "Sangat Segar" | "Cukup Segar" | "Kurang Segar" | "Tidak Segar",
        "reason": "Penjelasan singkat dan jelas mengapa ikan dinilai seperti itu (maksimal 20 kata)."
      }
    `;

    const imagePart = bufferToGenerativePart(buffer, mimeType);

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();

    // Pastikan responseText adalah JSON yang valid sebelum diparsing
    const jsonResponse = JSON.parse(responseText.trim());

    return NextResponse.json(jsonResponse);

  } catch (error) {
    console.error("Error di API Route Gemini:", error);
    return NextResponse.json(
        { error: "Gagal menganalisis gambar. Silakan coba lagi." },
        { status: 500 }
    );
  }
}