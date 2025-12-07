// client/src/features/menu/Leaderboard.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Loader2, Timer, Skull } from "lucide-react";
import {
  getLeaderboard,
  type ScoreData,
} from "../../../../server/src/services/api";

type TabMode = "time_attack" | "survival";

const Leaderboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabMode>("time_attack");
  const [scores, setScores] = useState<ScoreData[]>([]);
  const [loading, setLoading] = useState(false);

  // Verileri Sunucudan Çek
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = (await getLeaderboard(activeTab)) as ScoreData[];
        setScores(data);
      } catch (error) {
        console.error("Liderlik tablosu hatası:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  return (
    <div className="min-h-screen w-screen bg-[#0f0f11] text-white font-mono flex flex-col items-center py-8 px-4 overflow-hidden relative">
      {/* Arka Plan Efektleri */}
      <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-yellow-500/10 via-[#0f0f11] to-[#0f0f11] pointer-events-none" />

      {/* Başlık */}
      <div className="z-10 text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-linear-to-b from-yellow-300 to-yellow-600 drop-shadow-lg flex items-center justify-center gap-3">
          <Trophy className="text-yellow-500 fill-yellow-500/20" size={40} />
          LİDERLİK TABLOSU
        </h1>
        <p className="text-gray-500 text-sm mt-2 font-bold tracking-widest uppercase">
          Tüm Zamanların En İyileri
        </p>
      </div>

      {/* Sekmeler (Tabs) */}
      <div className="z-10 flex gap-2 p-1 bg-neutral-900/80 rounded-xl border border-white/10 mb-6 backdrop-blur-md">
        <button
          onClick={() => setActiveTab("time_attack")}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
            activeTab === "time_attack"
              ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/20"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Timer size={18} /> ZAMANA KARŞI
        </button>
        <button
          onClick={() => setActiveTab("survival")}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
            activeTab === "survival"
              ? "bg-red-600 text-white shadow-lg shadow-red-500/20"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Skull size={18} /> HAYATTA KALMA
        </button>
      </div>

      {/* Liste */}
      <div className="z-10 w-full max-w-3xl bg-neutral-900/60 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl min-h-[400px] relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="animate-spin text-yellow-500" size={48} />
          </div>
        ) : scores.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
            <Trophy size={48} className="mb-4 opacity-20" />
            <p>Henüz kayıtlı skor yok.</p>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[60vh] custom-scrollbar">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider sticky top-0 backdrop-blur-md z-10">
                <tr>
                  <th className="p-4 text-center w-16">#</th>
                  <th className="p-4">OYUNCU</th>
                  <th className="p-4 text-right">TARİH</th>
                  <th className="p-4 text-right w-32">SKOR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {scores.map((s, index) => (
                  <tr
                    key={index}
                    className={`
                      group hover:bg-white/5 transition-colors
                      ${index === 0 ? "bg-yellow-500/10" : ""}
                      ${index === 1 ? "bg-gray-400/10" : ""}
                      ${index === 2 ? "bg-orange-700/10" : ""}
                    `}
                  >
                    <td className="p-4 text-center font-black text-lg text-gray-500">
                      {index === 0
                        ? "🥇"
                        : index === 1
                        ? "🥈"
                        : index === 2
                        ? "🥉"
                        : index + 1}
                    </td>
                    <td className="p-4 font-bold text-white group-hover:text-yellow-400 transition-colors">
                      {s.name}
                    </td>
                    <td className="p-4 text-right text-gray-500 text-xs font-mono">
                      {s.date
                        ? new Date(s.date).toLocaleDateString("tr-TR")
                        : "-"}
                    </td>
                    <td className="p-4 text-right font-black text-xl text-white font-mono tracking-tighter">
                      {s.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Geri Dön Butonu */}
      <button
        onClick={() => navigate("/")}
        className="z-10 mt-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-white/5 px-6 py-3 rounded-full hover:bg-white/10"
      >
        <ArrowLeft size={18} /> Ana Menüye Dön
      </button>
    </div>
  );
};

export default Leaderboard;
