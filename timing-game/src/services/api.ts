import { db, auth } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
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
  uid?: string;
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

// 2. SKORLARI GETİR
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
    const currentUser = auth.currentUser;
    const uid = currentUser ? currentUser.uid : null;

    await addDoc(scoresRef, {
      mode: mode,
      name: name,
      score: Number(score),
      date: new Date().toISOString(),
      uid: uid,
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
    // 1. Yeni isim müsait mi?
    const checkQ = query(usersRef, where("username", "==", newName));
    const checkSnap = await getDocs(checkQ);
    if (!checkSnap.empty) throw new Error("Bu kullanıcı adı zaten kullanımda.");

    // 2. Mevcut kullanıcının (Auth ID'sine göre) dokümanını bul
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Oturum açık değil.");

    // Kullanıcının kendi profilini UID ile bul
    const userDocRef = doc(db, "users", currentUser.uid);

    // --- ADIM A: PROFİLİ GÜNCELLE ---
    const userBatch = writeBatch(db);
    userBatch.update(userDocRef, { username: newName });
    await userBatch.commit();

    // Önce UID ile ara (En güvenlisi)
    let scoresQ = query(scoresRef, where("uid", "==", currentUser.uid));
    let scoresSnap = await getDocs(scoresQ);

    // Eğer UID ile skor bulamazsak (Eski kayıtlar), isme göre ara
    if (scoresSnap.empty) {
      scoresQ = query(scoresRef, where("name", "==", currentName));
      scoresSnap = await getDocs(scoresQ);
    }

    if (scoresSnap.empty) return true;

    // Batch ile güncelle
    let batch = writeBatch(db);
    let operationCount = 0;

    for (const doc of scoresSnap.docs) {
      // Skoru güncelle ve EĞER YOKSA ona UID de ekle (Veri iyileştirme)
      batch.update(doc.ref, {
        name: newName,
        uid: currentUser.uid,
      });
      operationCount++;

      if (operationCount >= 400) {
        await batch.commit();
        batch = writeBatch(db);
        operationCount = 0;
      }
    }

    if (operationCount > 0) {
      await batch.commit();
    }

    return true;
  } catch (error) {
    console.error("İsim değiştirme hatası:", error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const q = query(usersRef, orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Kullanıcıları çekme hatası:", error);
    return [];
  }
};

export const deleteUser = async (userId: string) => {
  try {
    await deleteDoc(doc(db, "users", userId));
    return true;
  } catch (error) {
    console.error("Kullanıcı silme hatası:", error);
    throw error;
  }
};

export const getAdminStats = async () => {
  try {
    const scoresCount = await getCountFromServer(scoresRef);
    const usersCount = await getCountFromServer(usersRef);

    return {
      totalScores: scoresCount.data().count,
      totalUsers: usersCount.data().count,
    };
  } catch (error) {
    console.error("Admin stats hatası:", error);
    return { totalScores: 0, totalUsers: 0 };
  }
};

// 9. ID İLE KULLANICI GETİR
export const getUserByUid = async (uid: string) => {
  try {
    const userDocRef = doc(db, "users", uid);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("UID sorgu hatası:", error);
    return null;
  }
};

// 10. SKOR SENKRONİZASYONU (İsim değişince eski skorları düzeltir)
export const syncUserScores = async (
  uid: string,
  oldName: string,
  newName: string
) => {
  try {
    console.log(`Skorlar senkronize ediliyor: ${oldName} -> ${newName}`);

    // 1. UID ile ara
    let q = query(collection(db, "scores"), where("uid", "==", uid));
    let snapshot = await getDocs(q);

    // 2. Bulamazsan eski isimle ara
    if (snapshot.empty && oldName) {
      q = query(collection(db, "scores"), where("name", "==", oldName));
      snapshot = await getDocs(q);
    }

    if (snapshot.empty) return;

    const batch = writeBatch(db);
    let operationCount = 0;

    snapshot.docs.forEach((doc) => {
      if (doc.data().name !== newName) {
        batch.update(doc.ref, {
          name: newName,
          uid: uid,
        });
        operationCount++;
      }
    });

    if (operationCount > 0) {
      await batch.commit();
      console.log("Skorlar başarıyla güncellendi.");
    }
  } catch (error) {
    console.error("Senkronizasyon hatası:", error);
  }
};
