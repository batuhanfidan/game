import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

// Anahtarları tanınmaz hale getirmek için Hash fonksiyonu
const hashKey = (key: string) => {
  return CryptoJS.SHA256(key + SECRET_KEY).toString();
};

export const secureStorage = {
  // Veri Kaydet (Hem Anahtarı Hem Değeri Şifrele)
  setItem: (key: string, value: string) => {
    try {
      const encryptedKey = hashKey(key); // Anahtarı Hashle
      const encryptedValue = CryptoJS.AES.encrypt(value, SECRET_KEY).toString(); // Değeri Şifrele
      localStorage.setItem(encryptedKey, encryptedValue);
    } catch (error) {
      console.error("Şifreleme hatası:", error);
    }
  },

  // Veri Oku (Akıllı Mod: Önce şifreli anahtara bak, yoksa eskiye bak ve taşı)
  getItem: (key: string): string | null => {
    const encryptedKey = hashKey(key);
    const storedValue = localStorage.getItem(encryptedKey);

    // 1. Yeni sistemde (Şifreli Anahtar) veri var mı?
    if (storedValue) {
      try {
        const bytes = CryptoJS.AES.decrypt(storedValue, SECRET_KEY);
        const decryptedValue = bytes.toString(CryptoJS.enc.Utf8);
        return decryptedValue || null;
      } catch {
        return null;
      }
    }

    // 2. Yoksa, Eski sistemde (Düz Anahtar) veri var mı? (Migration)
    const oldData = localStorage.getItem(key);
    if (oldData) {
      let realValue = oldData;

      // Eski veri şifreli miydi? (Önceki adımdan kalma)
      try {
        const bytes = CryptoJS.AES.decrypt(oldData, SECRET_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (decrypted) realValue = decrypted;
      } catch {
        // Şifreli değilmiş, düz metinmiş
      }

      // Bulduğumuz veriyi hemen YENİ sisteme taşıyalım
      secureStorage.setItem(key, realValue); // Şifreli anahtarla kaydet
      localStorage.removeItem(key); // Eski düz anahtarı sil

      console.log(`Veri güvenli anahtara taşındı: ${key}`);
      return realValue;
    }

    return null;
  },

  // Veri Sil
  removeItem: (key: string) => {
    const encryptedKey = hashKey(key);
    localStorage.removeItem(encryptedKey);
    // Ne olur ne olmaz eskiyi de sil
    localStorage.removeItem(key);
  },

  // Temizle
  clear: () => {
    localStorage.clear();
  },
};
