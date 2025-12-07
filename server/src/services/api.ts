// client/src/services/api.ts

const API_URL = "http://localhost:3001/api"; // URL'i genel yaptık (/scores kısmını sildik)

export interface ScoreData {
  name: string;
  score: number;
  date?: string;
}

// YENİ: Giriş Fonksiyonu
export const loginOrRegister = async (username: string) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Hata varsa fırlat (Örn: "Bu isim alınmış")
      throw new Error(data.error || "Giriş başarısız");
    }

    return data; // { userId: "...", username: "...", success: true }
  } catch (error) {
    throw error;
  }
};

// Skorları Getir (URL güncellendi)
export const getLeaderboard = async (mode: string) => {
  try {
    const response = await fetch(`${API_URL}/scores/${mode}`);
    if (!response.ok) throw new Error("Skorlar alınamadı");
    return await response.json();
  } catch (error) {
    console.error("API Get Hatası:", error);
    return [];
  }
};

// Skor Kaydet (URL güncellendi)
export const saveScoreToApi = async (
  mode: string,
  name: string,
  score: number
) => {
  try {
    const response = await fetch(`${API_URL}/scores/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, score }),
    });
    if (!response.ok) throw new Error("Kayıt başarısız");
    return true;
  } catch (error) {
    console.error("API Save Hatası:", error);
    return false;
  }
};
