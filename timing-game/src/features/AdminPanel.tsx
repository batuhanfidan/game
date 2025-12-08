import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  ArrowLeft,
  ShieldAlert,
  Loader2,
  Users,
  FileText,
  Activity,
} from "lucide-react";
import { db, auth } from "../../src/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  getAllUsers,
  deleteUser,
  getAdminStats,
  type ScoreData,
} from "../../src/services/api";

// Tipler
interface AdminScoreData extends ScoreData {
  id: string;
}

interface AdminUserData {
  id: string;
  username: string;
  bestScore: number;
  createdAt: string;
  role?: string;
}

type TabType = "dashboard" | "scores" | "users";

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Veriler
  const [scores, setScores] = useState<AdminScoreData[]>([]);
  const [users, setUsers] = useState<AdminUserData[]>([]);
  const [stats, setStats] = useState({ totalScores: 0, totalUsers: 0 });

  // 1. Veri Çekme Fonksiyonları
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    const data = await getAdminStats();
    setStats(data);
    setLoading(false);
  }, []);

  const loadScores = useCallback(async () => {
    setLoading(true);
    const q = query(
      collection(db, "scores"),
      orderBy("date", "desc"),
      limit(50)
    );
    const snapshot = await getDocs(q);
    setScores(
      snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AdminScoreData))
    );
    setLoading(false);
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data as AdminUserData[]);
    setLoading(false);
  }, []);

  // 2. Yetki Kontrolü
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Burada veritabanından rol kontrolü yapılabilir ama
        // şimdilik sadece giriş yapmış mı diye bakıyoruz.
        // Asıl güvenlik Firestore Rules tarafında.
        setIsAdmin(true);
        loadDashboard(); // İlk açılışta dashboard gelsin
      } else {
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [navigate, loadDashboard]);

  // Tab değişince veri yükle
  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab === "dashboard") loadDashboard();
    if (activeTab === "scores") loadScores();
    if (activeTab === "users") loadUsers();
  }, [activeTab, isAdmin, loadDashboard, loadScores, loadUsers]);

  // Silme İşlemleri
  const handleDeleteScore = async (id: string) => {
    if (!confirm("Skor silinsin mi?")) return;
    try {
      await deleteDoc(doc(db, "scores", id));
      setScores((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert("Yetkin yok!");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Kullanıcı ve verileri silinsin mi?")) return;
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      alert("Yetkin yok!");
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#0f0f11] text-white font-mono p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-black text-red-500 flex items-center gap-2">
            <ShieldAlert /> ADMIN PANELİ
          </h1>
          <button
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-white flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg"
          >
            <ArrowLeft size={18} /> Oyuna Dön
          </button>
        </div>

        {/* Sekmeler */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === "dashboard"
                ? "bg-red-600 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            <Activity size={18} /> Özet
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === "users"
                ? "bg-blue-600 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            <Users size={18} /> Kullanıcılar
          </button>
          <button
            onClick={() => setActiveTab("scores")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
              activeTab === "scores"
                ? "bg-green-600 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            <FileText size={18} /> Skorlar
          </button>
        </div>

        {/* İçerik Alanı */}
        <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 shadow-2xl">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-red-500" size={40} />
            </div>
          ) : (
            <>
              {/* DASHBOARD TAB */}
              {activeTab === "dashboard" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-500/10 p-6 rounded-xl border border-blue-500/20">
                    <h3 className="text-blue-400 font-bold mb-2">
                      Toplam Kullanıcı
                    </h3>
                    <p className="text-5xl font-black">{stats.totalUsers}</p>
                  </div>
                  <div className="bg-green-500/10 p-6 rounded-xl border border-green-500/20">
                    <h3 className="text-green-400 font-bold mb-2">
                      Toplam Skor Kaydı
                    </h3>
                    <p className="text-5xl font-black">{stats.totalScores}</p>
                  </div>
                </div>
              )}

              {/* USERS TAB */}
              {activeTab === "users" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-gray-400 uppercase">
                      <tr>
                        <th className="p-3">Kullanıcı Adı</th>
                        <th className="p-3">Kayıt Tarihi</th>
                        <th className="p-3">En İyi Skor</th>
                        <th className="p-3 text-right">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-white/5">
                          <td className="p-3 font-bold text-blue-300">
                            {u.username}{" "}
                            {u.role === "admin" && (
                              <span className="text-[10px] bg-red-500 text-white px-1 rounded ml-2">
                                ADMIN
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-gray-500">
                            {u.createdAt
                              ? new Date(u.createdAt).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="p-3 font-mono">{u.bestScore}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="bg-red-500/20 hover:bg-red-500/40 text-red-400 p-2 rounded transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SCORES TAB */}
              {activeTab === "scores" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-gray-400 uppercase">
                      <tr>
                        <th className="p-3">Oyuncu</th>
                        <th className="p-3">Mod</th>
                        <th className="p-3">Skor</th>
                        <th className="p-3">Tarih</th>
                        <th className="p-3 text-right">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {scores.map((s) => (
                        <tr key={s.id} className="hover:bg-white/5">
                          <td className="p-3 font-bold">{s.name}</td>
                          <td className="p-3 text-gray-400">{s.mode}</td>
                          <td className="p-3 font-mono text-lg text-green-400">
                            {s.score}
                          </td>
                          <td className="p-3 text-gray-500 text-xs">
                            {s.date ? new Date(s.date).toLocaleString() : "-"}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteScore(s.id)}
                              className="bg-red-500/20 hover:bg-red-500/40 text-red-400 p-2 rounded transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
