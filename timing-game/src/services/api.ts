import { db, auth } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  getCountFromServer,
  type QueryConstraint,
} from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";

export interface ScoreData {
  name: string;
  score: number;
  date?: string;
  mode?: string;
}

const usersRef = collection(db, "users");
const scoresRef = collection(db, "scores");

// 1. GİRİŞ VE KAYIT
export const loginOrRegister = async (username: string) => {
  try {
    const q = query(usersRef, where("username", "==", username));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      throw new Error("Bu kullanıcı adı zaten alınmış.");
    }

    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;

    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      await setDoc(userDocRef, {
        username: username,
        uid: user.uid,
        createdAt: new Date().toISOString(),
        bestScore: 0,
      });
    }

    return {
      userId: user.uid,
      username: username,
      success: true,
    };
  } catch (error) {
    console.error("Auth Hatası:", error);
    const firebaseError = error as { code?: string; message?: string };
    if (firebaseError.code === "auth/operation-not-allowed") {
      throw new Error("Anonim giriş kapalı. Konsoldan açmalısın.");
    }
    throw error;
  }
};

// 2. SKORLARI GETİR (Filtreli)
export const getLeaderboard = async (
  mode: string,
  timeFrame: "daily" | "weekly" | "all_time" = "all_time"
) => {
  try {
    let constraints: QueryConstraint[] = [
      where("mode", "==", mode),
      orderBy("score", "desc"),
      limit(50),
    ];

    if (timeFrame !== "all_time") {
      const now = new Date();
      const startDate = new Date();

      if (timeFrame === "daily") {
        startDate.setHours(0, 0, 0, 0);
      } else {
        startDate.setDate(now.getDate() - 7);
      }

      constraints = [
        where("mode", "==", mode),
        where("date", ">=", startDate.toISOString()),
        orderBy("score", "desc"),
        limit(50),
      ];
    }

    const q = query(scoresRef, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => ({
      ...d.data(),
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

// 4. KULLANICI İSTATİSTİKLERİNİ GETİR
export const getUserStats = async (username: string) => {
  try {
    const userQ = query(usersRef, where("username", "==", username));
    const userSnapshot = await getDocs(userQ);
    if (userSnapshot.empty) return null;
    const userData = userSnapshot.docs[0].data();

    const scoresQ = query(
      scoresRef,
      where("name", "==", username),
      orderBy("date", "desc"),
      limit(20)
    );
    const scoresSnapshot = await getDocs(scoresQ);
    const recentGames = scoresSnapshot.docs.map((d) => d.data() as ScoreData);

    // Mod bazlı rekorlar
    const taQ = query(
      scoresRef,
      where("name", "==", username),
      where("mode", "==", "time_attack"),
      orderBy("score", "desc"),
      limit(1)
    );
    const taSnap = await getDocs(taQ);
    const bestTimeAttack = taSnap.empty ? 0 : taSnap.docs[0].data().score;

    const sQ = query(
      scoresRef,
      where("name", "==", username),
      where("mode", "==", "survival"),
      orderBy("score", "desc"),
      limit(1)
    );
    const sSnap = await getDocs(sQ);
    const bestSurvival = sSnap.empty ? 0 : sSnap.docs[0].data().score;

    const countSnap = await getCountFromServer(
      query(scoresRef, where("name", "==", username))
    );
    const totalGames = countSnap.data().count;

    return {
      ...userData,
      bestTimeAttack,
      bestSurvival,
      totalGames,
      recentGames,
    };
  } catch (error) {
    console.error("Profil verisi çekilemedi:", error);
    return null;
  }
};

// 5. İSİM DEĞİŞTİRME
export const updateUsername = async (currentName: string, newName: string) => {
  if (currentName === newName) return true;

  try {
    const checkQ = query(usersRef, where("username", "==", newName));
    const checkSnap = await getDocs(checkQ);
    if (!checkSnap.empty) throw new Error("Bu kullanıcı adı zaten kullanımda.");

    const userQ = query(usersRef, where("username", "==", currentName));
    const userSnap = await getDocs(userQ);
    if (userSnap.empty) throw new Error("Kullanıcı bulunamadı.");

    const userDoc = userSnap.docs[0];
    const batch = writeBatch(db);

    batch.update(userDoc.ref, { username: newName });

    const scoresQ = query(scoresRef, where("name", "==", currentName));
    const scoresSnap = await getDocs(scoresQ);

    scoresSnap.docs.forEach((doc) => {
      batch.update(doc.ref, { name: newName });
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error("İsim değiştirme hatası:", error);
    throw error;
  }
};
