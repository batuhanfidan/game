import React, { useEffect, useState, useCallback } from "react";
import {
  X,
  User,
  Trophy,
  Calendar,
  Gamepad2,
  Clock,
  Loader2,
  Edit2,
  Save,
} from "lucide-react";
import {
  getUserStats,
  updateUsername,
  type ScoreData,
} from "../../services/api";
import { useTranslation } from "react-i18next";
import { secureStorage } from "../../shared/utils/secureStorage";

interface UserStats {
  username: string;
  createdAt: string;
  bestTimeAttack: number;
  bestSurvival: number;
  totalGames: number;
  recentGames: ScoreData[];
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Düzenleme Modu
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const currentUsername = secureStorage.getItem("timing_game_username");

  const loadData = useCallback(async () => {
    if (!currentUsername) return;
    setLoading(true);
    try {
      const data = (await getUserStats(currentUsername)) as UserStats;
      setStats(data);
      setNewUsername(currentUsername);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [currentUsername]);

  useEffect(() => {
    if (isOpen) loadData();
  }, [isOpen, loadData]);

  const handleSaveName = async () => {
    if (!currentUsername || !newUsername.trim()) return;
    if (newUsername === currentUsername) {
      setIsEditing(false);
      return;
    }
    if (newUsername.length < 3) {
      setEditError(t("profile.edit.error_min"));
      return;
    }

    setEditLoading(true);
    setEditError(null);

    try {
      await updateUsername(currentUsername, newUsername);
      secureStorage.setItem("timing_game_username", newUsername);
      window.location.reload();
    } catch (error) {
      if (error instanceof Error) setEditError(error.message);
      else setEditError(t("profile.edit.error_generic"));
    } finally {
      setEditLoading(false);
    }
  };

  if (!isOpen) return null;

  const displayName = isEditing
    ? newUsername
    : stats?.username || currentUsername;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-[#09090b] border border-neutral-800 w-full max-w-2xl rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />

        {/* --- HEADER --- */}
        <div className="p-6 border-b border-white/5 flex justify-between items-start relative z-10">
          <div className="flex items-center gap-4 w-full">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <User size={32} className="text-white" />
            </div>

            <div className="flex-1">
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-white font-bold text-xl w-full max-w-[200px] focus:outline-none focus:border-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={editLoading}
                      className="bg-green-600 hover:bg-green-500 p-2 rounded-lg text-white transition-colors disabled:opacity-50"
                    >
                      {editLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Save size={18} />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditError(null);
                        setNewUsername(currentUsername || "");
                      }}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  {editError && (
                    <span className="text-red-400 text-xs font-bold">
                      {editError}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    {displayName}
                  </h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-500 hover:text-white transition-colors p-1"
                    title={t("profile.edit.save")}
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              )}

              {!isEditing && (
                <p className="text-gray-500 text-xs flex items-center gap-1.5 mt-1 font-mono">
                  <Calendar size={12} />
                  {t("profile.joined")}{" "}
                  {stats?.createdAt
                    ? new Date(stats.createdAt).toLocaleDateString("tr-TR")
                    : t("profile.unknown_date")}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* --- BODY --- */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          ) : (
            <>
              {/* İstatistikler */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-cyan-950/30 p-4 rounded-2xl border border-cyan-500/20 flex flex-col items-center justify-center text-center">
                  <Clock className="text-cyan-400 mb-2" size={24} />
                  <span className="text-3xl font-black text-white tracking-tighter">
                    {stats?.bestTimeAttack || 0}
                  </span>
                  <span className="text-[10px] text-cyan-200/60 uppercase tracking-widest font-bold">
                    {t("profile.stats.best_time_attack")}
                  </span>
                </div>

                <div className="bg-red-950/30 p-4 rounded-2xl border border-red-500/20 flex flex-col items-center justify-center text-center">
                  <Trophy className="text-red-500 mb-2" size={24} />
                  <span className="text-3xl font-black text-white tracking-tighter">
                    {stats?.bestSurvival || 0}
                  </span>
                  <span className="text-[10px] text-red-200/60 uppercase tracking-widest font-bold">
                    {t("profile.stats.best_survival")}
                  </span>
                </div>

                <div className="bg-neutral-900/50 p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center">
                  <Gamepad2 className="text-gray-400 mb-2" size={24} />
                  <span className="text-3xl font-black text-white tracking-tighter">
                    {stats?.totalGames || 0}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                    {t("profile.stats.total_games")}
                  </span>
                </div>
              </div>

              {/* Son Maçlar Listesi */}
              <div>
                <h3 className="text-gray-400 font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                  <Clock size={16} /> {t("profile.history.title")}
                </h3>

                <div className="space-y-3">
                  {stats?.recentGames?.map((game, index) => {
                    const isTimeAttack = game.mode === "time_attack";
                    const scoreColor = isTimeAttack
                      ? "text-cyan-400"
                      : "text-red-400";
                    const iconColor = isTimeAttack
                      ? "bg-cyan-500"
                      : "bg-red-500";

                    const modeName = isTimeAttack
                      ? t("leaderboard.tabs.time_attack")
                      : t("leaderboard.tabs.survival");

                    return (
                      <div
                        key={index}
                        className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-3 h-3 rounded-full ${iconColor} shadow-lg shadow-${
                              isTimeAttack ? "cyan" : "red"
                            }-500/50`}
                          />
                          <div className="flex flex-col">
                            <span className="text-base font-bold text-gray-200 group-hover:text-white transition-colors">
                              {modeName}
                            </span>
                            <span className="text-xs text-gray-500 font-mono mt-0.5">
                              {game.date
                                ? new Date(game.date).toLocaleDateString(
                                    "tr-TR"
                                  )
                                : "-"}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`font-black font-mono text-xl ${scoreColor}`}
                        >
                          {game.score}
                        </span>
                      </div>
                    );
                  })}

                  {(!stats?.recentGames || stats.recentGames.length === 0) && (
                    <div className="text-center text-gray-500 text-sm py-8 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                      {t("profile.empty")}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
