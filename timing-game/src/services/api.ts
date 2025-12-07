import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

export interface ScoreData {
  name: string;
  score: number;
  date?: string;
}

// Koleksiyon Referansları
const usersRef = collection(db, "users");
const scoresRef = collection(db, "scores");

// 1. GİRİŞ VE KAYIT (Doğrudan Firebase)
export const loginOrRegister = async (username: string) => {
  try {
    const q = query(usersRef, where("username", "==", username));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      throw new Error("Bu kullanıcı adı zaten alınmış.");
    }

    const docRef = await addDoc(usersRef, {
      username: username,
      createdAt: new Date().toISOString(),
      bestScore: 0,
    });

    return {
      userId: docRef.id,
      username: username,
      success: true,
    };
  } catch (error) {
    console.error("Firebase Login Hatası:", error);
    throw error;
  }
};

// 2. SKORLARI GETİR
export const getLeaderboard = async (mode: string) => {
  try {
    const q = query(
      scoresRef,
      where("mode", "==", mode),
      orderBy("score", "desc"),
      limit(10)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      ...doc.data(),
    })) as ScoreData[];
  } catch (error) {
    console.error("Firebase Get Hatası:", error);
    return [];
  }
};

// 3. SKOR KAYDET
export const saveScoreToApi = async (
  mode: string,
  name: string,
  score: number
) => {
  try {
    await addDoc(scoresRef, {
      mode: mode,
      name: name,
      score: Number(score),
      date: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error("Firebase Save Hatası:", error);
    return false;
  }
};
