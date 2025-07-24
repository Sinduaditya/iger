import { NextResponse } from "next/server";

export async function POST(request) {
  try {
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

    console.log('🚀 Starting fish analysis with Hugging Face model...');

    // URL API Hugging Face Anda
    const apiUrl = "https://jovansantosa-iger-fish.hf.space/predict";
    
    // Buat FormData untuk dikirim ke model
    const modelFormData = new FormData();
    modelFormData.append("file", file);

    console.log('📡 Sending request to Hugging Face model...');

    // Kirim request ke model Hugging Face
    const response = await fetch(apiUrl, {
      method: "POST",
      body: modelFormData,
    });

    if (!response.ok) {
      console.error('❌ Hugging Face API error:', response.status, response.statusText);
      throw new Error(`Model API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Hugging Face model response:', result);

    // Validasi response dari model
    if (!result.prediction || typeof result.confidence === 'undefined') {
      console.error('❌ Invalid response format from model:', result);
      throw new Error("Invalid response format from model");
    }

    // Konversi confidence ke persentase dan format response
    const confidencePercent = (result.confidence * 100);
    
    // Mapping prediction ke format yang diharapkan aplikasi
    let freshness;
    let reason;
    
    // Sesuaikan dengan output model Anda - hanya Fresh atau Not Fresh
    if (result.prediction.toLowerCase().includes('fresh') || 
        result.prediction.toLowerCase().includes('segar')) {
      freshness = 'Segar';
      reason = `Model AI mendeteksi ikan dengan tingkat keyakinan ${confidencePercent.toFixed(1)}%`;
    } else {
      freshness = 'Tidak Segar';
      reason = `Model AI mendeteksi ikan dengan dengan tingkat keyakinan ${confidencePercent.toFixed(1)}%`;
    }

    // Format response sesuai dengan struktur yang diharapkan
    const analysisResult = {
      freshness: freshness,
      reason: reason,
      confidence: result.confidence,
      confidencePercent: confidencePercent.toFixed(1),
      prediction: result.prediction,
      model_source: 'huggingface',
      api_url: apiUrl
    };

    console.log('📊 Final analysis result:', analysisResult);

    return NextResponse.json(analysisResult);

  } catch (error) {
    console.error("❌ Error in fish analysis API:", error);
    
    // Error handling yang lebih spesifik
    if (error.message.includes('fetch')) {
      return NextResponse.json(
        { 
          error: "Gagal terhubung ke model AI. Silakan coba lagi.", 
          details: "Network connection error"
        },
        { status: 503 }
      );
    }
    
    if (error.message.includes('Model API error')) {
      return NextResponse.json(
        { 
          error: "Model AI sedang tidak tersedia. Silakan coba lagi nanti.", 
          details: error.message
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { 
        error: "Gagal menganalisis gambar. Silakan coba lagi.", 
        details: error.message 
      },
      { status: 500 }
    );
  }
}