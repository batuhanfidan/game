// import express, { type Request, type Response } from "express";
// import cors from "cors";
// import { initializeApp, cert } from "firebase-admin/app";
// import { getFirestore } from "firebase-admin/firestore";
// import path from "path";

// // --- FIREBASE KURULUMU ---
// const serviceAccount = require(path.join(
//   __dirname,
//   "../serviceAccountKey.json"
// ));

// initializeApp({
//   credential: cert(serviceAccount),
// });

// const db = getFirestore();
// const scoresCollection = db.collection("scores");
// const usersCollection = db.collection("users"); // Yeni Koleksiyon

// // --- SERVER AYARLARI ---
// const app = express();
// app.use(cors());
// app.use(express.json());

// // --- TİPLER ---
// interface ScoreRequestBody {
//   name: string;
//   score: number;
// }

// interface LoginRequestBody {
//   username: string;
// }

// // --- API ENDPOINT'LERİ ---

// // 1. KULLANICI GİRİŞİ / KAYDI (YENİ)
// app.post(
//   "/api/auth/login",
//   async (req: Request, res: Response): Promise<void> => {
//     try {
//       const { username } = req.body as LoginRequestBody;

//       if (!username || username.length < 3) {
//         res
//           .status(400)
//           .json({ error: "Kullanıcı adı en az 3 karakter olmalı." });
//         return;
//       }

//       // 1. Bu isimde biri var mı diye bak
//       const snapshot = await usersCollection
//         .where("username", "==", username)
//         .get();

//       if (!snapshot.empty) {
//         // İsim alınmışsa hata dön
//         res.status(409).json({ error: "Bu kullanıcı adı zaten alınmış." });
//         return;
//       }

//       // 2. Yoksa yeni kullanıcı oluştur
//       const newUser = {
//         username: username,
//         createdAt: new Date().toISOString(),
//         bestScore: 0,
//       };

//       const docRef = await usersCollection.add(newUser);

//       // 3. Frontend'e ID ve İsmi gönder
//       res.json({
//         userId: docRef.id,
//         username: username,
//         success: true,
//       });
//     } catch (error) {
//       console.error("Login hatası:", error);
//       res.status(500).json({ error: "Sunucu hatası oluştu." });
//     }
//   }
// );

// // 2. SKORLARI GETİR (MEVCUT)
// app.get("/api/scores/:mode", async (req: Request, res: Response) => {
//   try {
//     const mode = req.params.mode;
//     const snapshot = await scoresCollection
//       .where("mode", "==", mode)
//       .orderBy("score", "desc")
//       .limit(10)
//       .get();

//     const scores = snapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     }));

//     res.json(scores);
//   } catch (error) {
//     console.error("Firestore okuma hatası:", error);
//     res.status(500).json({ error: "Veriler çekilemedi" });
//   }
// });

// // 3. SKOR KAYDET (GÜNCELLENDİ)
// app.post("/api/scores/:mode", async (req: Request, res: Response) => {
//   try {
//     const mode = req.params.mode;
//     const { name, score } = req.body as ScoreRequestBody;

//     // Skoru kaydet
//     await scoresCollection.add({
//       mode: mode,
//       name: name || "Anonim",
//       score: Number(score),
//       date: new Date().toISOString(),
//     });

//     // İLERİDE BURAYA EKLENECEK:
//     // Eğer kullanıcının rekoruysa "users" tablosundaki bestScore'u da güncelleyeceğiz.

//     res.json({ success: true });
//   } catch (error) {
//     console.error("Firestore yazma hatası:", error);
//     res.status(500).json({ error: "Kayıt başarısız" });
//   }
// });

// const PORT = 3001;
// app.listen(PORT, () => {
//   console.log(
//     `🔥 Firebase Server (Auth + Game) çalışıyor: http://localhost:${PORT}`
//   );
// });
