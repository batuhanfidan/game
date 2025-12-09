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
  Search,
  Filter,
  Ban,
  CheckCircle,
  Eye,
  X,
  Clock,
  Trophy,
  Calendar,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { db, auth } from "../../src/firebase";
import { deleteDoc, doc } from "firebase/firestore";
import {
  deleteUser,
  getAdminStats,
  searchUsers,
  getFilteredScores,
  toggleBanUser,
  getScoresByUid,
  type ScoreData,
  getUserByUid,
} from "../../src/services/api";

interface AdminScoreData extends ScoreData {
  id: string;
}

interface AdminUserData {
  id: string;
  username: string;
  bestScore: number;
  createdAt: string;
  role?: string;
  isBanned?: boolean;
}

type TabType = "dashboard" | "scores" | "users";
type UserFilterType = "all" | "banned" | "admin";
type TimeFilterType = "all" | "daily" | "weekly";

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [scores, setScores] = useState<AdminScoreData[]>([]);
  const [users, setUsers] = useState<AdminUserData[]>([]);
  const [stats, setStats] = useState({ totalScores: 0, totalUsers: 0 });

  // Filtreler
  const [userSearch, setUserSearch] = useState("");
  const [scoreFilter, setScoreFilter] = useState<string>("all");
  const [scoreTimeFilter, setScoreTimeFilter] = useState<TimeFilterType>("all");
  const [userFilter, setUserFilter] = useState<UserFilterType>("all");

  // Sıralama
  const [scoreSortBy, setScoreSortBy] = useState<"score" | "date">("date");
  const [scoreSortOrder, setScoreSortOrder] = useState<"asc" | "desc">("desc");

  const [selectedUser, setSelectedUser] = useState<AdminUserData | null>(null);
  const [userDetailScores, setUserDetailScores] = useState<AdminScoreData[]>(
    []
  );
  const [detailLoading, setDetailLoading] = useState(false);

  // --- VERİ YÜKLEME ---
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    const data = await getAdminStats();
    setStats(data);
    setLoading(false);
  }, []);

  const loadScores = useCallback(async () => {
    setLoading(true);
    const data = await getFilteredScores(
      scoreFilter,
      scoreTimeFilter,
      scoreSortBy,
      scoreSortOrder
    );
    setScores(data as AdminScoreData[]);
    setLoading(false);
  }, [scoreFilter, scoreTimeFilter, scoreSortBy, scoreSortOrder]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const data = await searchUsers(userSearch);

    let filteredData = data as AdminUserData[];
    if (userFilter === "banned") {
      filteredData = filteredData.filter((u) => u.isBanned);
    } else if (userFilter === "admin") {
      filteredData = filteredData.filter((u) => u.role === "admin");
    }

    setUsers(filteredData);
    setLoading(false);
  }, [userSearch, userFilter]);

  // --- DEDEKTİF MODU ---
  const openUserDetail = async (user: AdminUserData) => {
    setSelectedUser(user);
    setDetailLoading(true);
    const scores = await getScoresByUid(user.id);
    setUserDetailScores(scores as AdminScoreData[]);
    setDetailLoading(false);
  };

  const handleBanToggle = async (user: AdminUserData) => {
    const action = user.isBanned ? "Ban Kaldır" : "BANLA";
    if (!confirm(`${user.username} için ${action} işlemi yapılsın mı?`)) return;

    try {
      await toggleBanUser(user.id, !user.isBanned);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, isBanned: !u.isBanned } : u
        )
      );
      if (selectedUser?.id === user.id) {
        setSelectedUser((prev) =>
          prev ? { ...prev, isBanned: !prev.isBanned } : null
        );
      }
    } catch {
      alert("İşlem başarısız!");
    }
  };

  // Yetki Kontrolü
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setLoading(true); // Kontrol ederken yükleniyor göster

        try {
          // Veritabanından kullanıcının rolünü çek

          const userData = await getUserByUid(user.uid);

          // Eğer kullanıcı varsa VE rolü 'admin' ise içeri al

          if (userData && userData.role === "admin") {
            setIsAdmin(true);
            loadDashboard(); // Verileri çekmeye başla
          } else {
            // Giriş yapmış ama admin değil -> Ana sayfaya şutla
            console.warn("Yetkisiz erişim denemesi!");
            navigate("/");
          }
        } catch (error) {
          console.error("Yetki kontrol hatası:", error);
          navigate("/");
        } finally {
          setLoading(false);
        }
      } else {
        // Giriş yapmamış -> Ana sayfaya şutla
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate, loadDashboard]);

  // Tab Değişimi
  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab === "dashboard") loadDashboard();
    if (activeTab === "scores") loadScores();
    if (activeTab === "users") loadUsers();
  }, [activeTab, isAdmin, loadScores, loadUsers, loadDashboard]);

  const handleDeleteScore = async (id: string) => {
    if (!confirm("Skor silinsin mi?")) return;
    try {
      await deleteDoc(doc(db, "scores", id));
      setScores((prev) => prev.filter((s) => s.id !== id));
      if (selectedUser)
        setUserDetailScores((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert("Yetkin yok!");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Kullanıcı silinsin mi?")) return;
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      if (selectedUser?.id === id) setSelectedUser(null);
    } catch {
      alert("Yetkin yok!");
    }
  };

  if (loading && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0f0f11] flex items-center justify-center">
        <Loader2 className="animate-spin text-red-500" size={48} />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#0f0f11] text-white font-mono p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
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
          {[
            {
              id: "dashboard",
              label: "Özet",
              icon: Activity,
              color: "bg-red-600",
            },
            {
              id: "users",
              label: "Kullanıcılar",
              icon: Users,
              color: "bg-blue-600",
            },
            {
              id: "scores",
              label: "Skorlar",
              icon: FileText,
              color: "bg-green-600",
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                activeTab === tab.id
                  ? `${tab.color} text-white`
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>

        {/* --- LAYOUT DÜZELTMESİ: FLEX ROW CONTAINER --- */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* SOL TARAF: ANA İÇERİK */}
          <div
            className={`bg-[#18181b] border border-white/10 rounded-2xl p-6 shadow-2xl min-h-[400px] flex-1 ${
              selectedUser ? "hidden lg:block" : ""
            }`}
          >
            {/* YÜKLEME EKRANI */}
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-white/50" size={48} />
              </div>
            ) : (
              <>
                {/* DASHBOARD TAB */}
                {activeTab === "dashboard" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                    <div className="bg-blue-500/10 p-8 rounded-xl border border-blue-500/20 text-center">
                      <h3 className="text-blue-400 font-bold mb-2 uppercase tracking-widest">
                        Toplam Kullanıcı
                      </h3>
                      <p className="text-6xl font-black">{stats.totalUsers}</p>
                    </div>
                    <div className="bg-green-500/10 p-8 rounded-xl border border-green-500/20 text-center">
                      <h3 className="text-green-400 font-bold mb-2 uppercase tracking-widest">
                        Toplam Skor
                      </h3>
                      <p className="text-6xl font-black">{stats.totalScores}</p>
                    </div>
                  </div>
                )}

                {/* USERS TAB */}
                {activeTab === "users" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Search
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                          size={18}
                        />
                        <input
                          type="text"
                          placeholder="Kullanıcı adı ara..."
                          className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:border-blue-500 outline-none"
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-1 bg-black/20 p-1 rounded-lg">
                        {["all", "banned", "admin"].map((f) => (
                          <button
                            key={f}
                            onClick={() => setUserFilter(f as UserFilterType)}
                            className={`px-3 py-2 rounded-md text-xs font-bold uppercase transition-all ${
                              userFilter === f
                                ? "bg-white/10 text-white"
                                : "text-gray-500 hover:text-gray-300"
                            }`}
                          >
                            {f === "all"
                              ? "Tümü"
                              : f === "banned"
                              ? "Banlı"
                              : "Admin"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-gray-400 uppercase">
                          <tr>
                            <th className="p-3">Kullanıcı</th>
                            <th className="p-3">Kayıt</th>
                            <th className="p-3">Skor</th>
                            <th className="p-3 text-right">İşlem</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {users.map((u) => (
                            <tr
                              key={u.id}
                              className={`hover:bg-white/5 ${
                                u.isBanned ? "bg-red-500/10" : ""
                              }`}
                            >
                              <td className="p-3 font-bold text-blue-300 flex items-center gap-2">
                                {u.username}
                                {u.role === "admin" && (
                                  <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded">
                                    ADM
                                  </span>
                                )}
                                {u.isBanned && (
                                  <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded">
                                    BAN
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-gray-500">
                                {u.createdAt
                                  ? new Date(u.createdAt).toLocaleDateString()
                                  : "-"}
                              </td>
                              <td className="p-3 font-mono">{u.bestScore}</td>
                              <td className="p-3 text-right flex justify-end gap-2">
                                <button
                                  onClick={() => openUserDetail(u)}
                                  className="bg-white/10 hover:bg-white/20 text-white p-2 rounded transition"
                                  title="Detay"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => handleBanToggle(u)}
                                  className={`${
                                    u.isBanned
                                      ? "bg-green-500/20 text-green-400"
                                      : "bg-orange-500/20 text-orange-400"
                                  } p-2 rounded transition`}
                                  title={u.isBanned ? "Banı Kaldır" : "Banla"}
                                >
                                  {u.isBanned ? (
                                    <CheckCircle size={16} />
                                  ) : (
                                    <Ban size={16} />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="bg-red-500/20 hover:bg-red-500/40 text-red-400 p-2 rounded transition"
                                  title="Sil"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* SCORES TAB */}
                {activeTab === "scores" && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
                      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar max-w-full">
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase mr-2 shrink-0">
                          <Filter size={14} /> Filtrele:
                        </div>
                        {[
                          "all",
                          "time_attack",
                          "survival",
                          "bot",
                          "penalty",
                        ].map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setScoreFilter(mode)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${
                              scoreFilter === mode
                                ? "bg-green-600 text-white border-green-500"
                                : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                            }`}
                          >
                            {mode === "all"
                              ? "TÜMÜ"
                              : mode.toUpperCase().replace("_", " ")}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <div className="flex gap-1 bg-black/20 p-1 rounded-lg">
                          {[
                            { id: "all", label: "Tümü" },
                            { id: "weekly", label: "Hafta" },
                            { id: "daily", label: "Bugün" },
                          ].map((t) => (
                            <button
                              key={t.id}
                              onClick={() =>
                                setScoreTimeFilter(t.id as TimeFilterType)
                              }
                              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                                scoreTimeFilter === t.id
                                  ? "bg-white/10 text-white"
                                  : "text-gray-500 hover:text-gray-300"
                              }`}
                            >
                              <Calendar size={12} /> {t.label}
                            </button>
                          ))}
                        </div>

                        <div className="flex gap-1 bg-black/20 p-1 rounded-lg">
                          <button
                            onClick={() =>
                              setScoreSortBy(
                                scoreSortBy === "date" ? "score" : "date"
                              )
                            }
                            className="px-3 py-1.5 rounded-md text-xs font-bold bg-white/5 text-gray-300 hover:text-white transition-all flex items-center gap-2"
                          >
                            {scoreSortBy === "date" ? (
                              <Clock size={14} />
                            ) : (
                              <Trophy size={14} />
                            )}
                            {scoreSortBy === "date" ? "Tarih" : "Puan"}
                          </button>

                          <button
                            onClick={() =>
                              setScoreSortOrder(
                                scoreSortOrder === "desc" ? "asc" : "desc"
                              )
                            }
                            className="px-3 py-1.5 rounded-md text-xs font-bold bg-white/5 text-gray-300 hover:text-white transition-all flex items-center gap-1"
                            title={
                              scoreSortOrder === "desc" ? "Azalan" : "Artan"
                            }
                          >
                            {scoreSortOrder === "desc" ? (
                              <ArrowDown size={14} />
                            ) : (
                              <ArrowUp size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

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
                                {s.date
                                  ? new Date(s.date).toLocaleString()
                                  : "-"}
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
                  </div>
                )}
              </>
            )}
          </div>

          {/* SAĞ TARAF: DEDEKTİF MODU (MODAL DEĞİL, YAN PANEL) */}
          {selectedUser && (
            <div className="w-full lg:w-96 bg-[#18181b] border border-white/10 rounded-2xl p-6 shadow-2xl fixed lg:static inset-0 lg:inset-auto z-50 lg:z-0 overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black text-white">
                    {selectedUser.username}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">
                    {selectedUser.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-400 hover:text-white bg-white/5 p-2 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div
                  className={`p-4 rounded-xl border ${
                    selectedUser.isBanned
                      ? "bg-red-500/10 border-red-500/30"
                      : "bg-green-500/10 border-green-500/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {selectedUser.isBanned ? (
                      <Ban className="text-red-500" />
                    ) : (
                      <CheckCircle className="text-green-500" />
                    )}
                    <div>
                      <p
                        className={`font-bold ${
                          selectedUser.isBanned
                            ? "text-red-400"
                            : "text-green-400"
                        }`}
                      >
                        {selectedUser.isBanned
                          ? "YASAKLI KULLANICI"
                          : "AKTİF OYUNCU"}
                      </p>
                      <button
                        onClick={() => handleBanToggle(selectedUser)}
                        className="text-xs underline opacity-70 hover:opacity-100 mt-1"
                      >
                        {selectedUser.isBanned ? "Yasağı Kaldır" : "Yasakla"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/20 p-3 rounded-lg text-center">
                    <Trophy
                      size={20}
                      className="text-yellow-500 mx-auto mb-2"
                    />
                    <div className="text-2xl font-black">
                      {selectedUser.bestScore}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase">
                      En İyi Skor
                    </div>
                  </div>
                  <div className="bg-black/20 p-3 rounded-lg text-center">
                    <Clock size={20} className="text-blue-500 mx-auto mb-2" />
                    <div className="text-xs font-bold text-gray-300 mt-1">
                      {selectedUser.createdAt
                        ? new Date(selectedUser.createdAt).toLocaleDateString()
                        : "?"}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase mt-1">
                      Kayıt Tarihi
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">
                    Skor Geçmişi
                  </h4>
                  {detailLoading ? (
                    <Loader2 className="animate-spin mx-auto text-gray-500" />
                  ) : userDetailScores.length === 0 ? (
                    <p className="text-center text-gray-600 text-xs italic">
                      Kayıtlı skor yok.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                      {userDetailScores.map((s) => (
                        <div
                          key={s.id}
                          className="bg-white/5 p-3 rounded-lg flex justify-between items-center text-xs"
                        >
                          <div>
                            <span className="font-bold text-gray-300 block">
                              {s.mode}
                            </span>
                            <span className="text-[10px] text-gray-600">
                              {s.date
                                ? new Date(s.date).toLocaleDateString()
                                : "-"}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-black text-green-400 block">
                              {s.score}
                            </span>
                            <button
                              onClick={() => handleDeleteScore(s.id)}
                              className="text-red-500 hover:text-red-400 mt-1"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
