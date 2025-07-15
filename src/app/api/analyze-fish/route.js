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
    // Validasi API Key
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY tidak ditemukan di environment variables");
      return NextResponse.json(
        { error: "Konfigurasi API tidak valid. Silakan hubungi administrator." }, 
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
    }

    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Gunakan JPG, PNG, atau WEBP." }, 
        { status: 400 }
      );
    }

    // Validasi ukuran file (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ukuran file terlalu besar. Maksimal 5MB." }, 
        { status: 400 }
      );
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

    console.log("Raw response from Gemini:", responseText);

    // Bersihkan response dari markdown atau karakter tidak perlu
    let cleanedResponse = responseText.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
    }
    if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
    }

    // Pastikan responseText adalah JSON yang valid sebelum diparsing
    const jsonResponse = JSON.parse(cleanedResponse);

    // Validasi struktur response
    if (!jsonResponse.freshness || !jsonResponse.reason) {
      throw new Error("Response format tidak valid dari AI");
    }

    return NextResponse.json(jsonResponse);

  } catch (error) {
    console.error("Error di API Route Gemini:", error);
    
    // Berikan response yang lebih informatif berdasarkan jenis error
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Gagal memproses response AI. Silakan coba lagi." },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Gagal menganalisis gambar. Silakan coba lagi." },
      { status: 500 }
    );
  }
}