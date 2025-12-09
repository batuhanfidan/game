import React, { useState } from "react";
import { User, ArrowRight, Loader2 } from "lucide-react";
import { loginOrRegister } from "../../services/api";
import { useTranslation } from "react-i18next";
import { secureStorage } from "../../shared/utils/secureStorage";

interface UsernameModalProps {
  onLoginSuccess: (username: string) => void;
}

const UsernameModal: React.FC<UsernameModalProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || username.length < 3) {
      setError("İsim en az 3 karakter olmalı.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await loginOrRegister(username);

      secureStorage.setItem("timing_game_username", result.username);
      secureStorage.setItem("timing_game_uid", result.userId);

      onLoginSuccess(username);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-neutral-900 border border-neutral-700 w-full max-w-md p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Dekoratif Arka Plan */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 text-center">
          <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-neutral-700">
            <User size={32} className="text-blue-400" />
          </div>

          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
            {t("auth.title")}
          </h2>
          <p className="text-gray-400 text-sm mb-8">{t("auth.subtitle")}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("auth.placeholder")}
                className="w-full bg-black/50 border border-neutral-700 text-white px-5 py-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600 font-bold text-lg text-center"
                autoFocus
              />
            </div>

            {error && (
              <div className="text-red-400 text-xs font-bold bg-red-500/10 py-2 rounded-lg animate-pulse">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  {t("auth.submit")} <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UsernameModal;
