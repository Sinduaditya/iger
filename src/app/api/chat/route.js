import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { messages } = await req.json();
    
    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: 'API Key tidak dikonfigurasi' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: 300, // Batasi output agar tidak terlalu panjang
        temperature: 0.7,
      }
    });

    const lastMessage = messages[messages.length - 1];
    
    if (!lastMessage?.content) {
      return Response.json({ error: 'Pesan tidak valid' }, { status: 400 });
    }

    const prompt = `Kamu adalah iGer AI, asisten pintar untuk budidaya perikanan. 

ATURAN PENTING:
- Berikan jawaban SINGKAT dan LANGSUNG TO THE POINT (maksimal 3-4 kalimat)
- Gunakan bahasa Indonesia yang mudah dipahami
- Fokus hanya pada ikan dan budidaya perikanan
- Jika ditanya hal lain, arahkan kembali ke topik perikanan
- Gunakan format markdown untuk penekanan (**bold**)

CONTOH JAWABAN YANG BAIK:
"**Ikan lele** sangat cocok untuk pemula karena mudah dipelihara dan tahan terhadap perubahan cuaca. Siapkan kolam dengan kedalaman **1-1.5 meter** dan beri pakan 2-3 kali sehari. Dalam **2-3 bulan** lele sudah bisa dipanen."

Pertanyaan: ${lastMessage.content}

Jawaban:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return Response.json({ message: text });

  } catch (error) {
    console.error('Error:', error.message);
    
    return Response.json({ 
      error: 'Terjadi kesalahan pada server',
      details: error.message 
    }, { status: 500 });
  }
}