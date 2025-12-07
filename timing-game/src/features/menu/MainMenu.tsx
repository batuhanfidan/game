import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  Skull,
  Timer,
  Gamepad2,
  Trophy,
  Globe,
  Lock,
  MousePointer2,
  User,
} from "lucide-react";
import { WelcomeModal } from "../../components/common/WelcomeModal";
import { useTranslation } from "react-i18next";
import ProfileModal from "./ProfileModal";

const MainMenu = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "tr" ? "en" : "tr";
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen w-screen bg-[#0f0f11] text-white font-mono flex flex-col items-center py-12 px-4 relative overflow-hidden selection:bg-cyan-500/30">
      {/* --- ARKA PLAN --- */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-900/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Texture */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] pointer-events-none mix-blend-overlay"></div>

      {/* --- BAŞLIK: HIT MS! --- */}
      <div className="z-10 text-center mb-16 relative group cursor-default">
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-white via-gray-200 to-gray-500 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] relative z-10">
          Time iT!
        </h1>

        <div className="flex items-center justify-center gap-3 mt-4 opacity-40">
          <div className="h-px w-12 bg-white"></div>
          <p className="text-sm font-light tracking-[0.5em] uppercase text-white">
            {t("menu.subtitle")}
          </p>
          <div className="h-px w-12 bg-white"></div>
        </div>
      </div>

      {/* --- KARTLAR GRID --- */}
      <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 z-10 pb-24">
        {/* MOD LİSTESİ */}
        {[
          {
            id: "survival",

            title: t("menu.modes.survival.title"),

            desc: t("menu.modes.survival.desc"),

            icon: <Skull size={24} />,

            BigIcon: Skull,

            tag: "HARDCORE",

            color: "text-red-300",

            bg: "bg-red-500/20",

            border: "group-hover:border-red-500/30",

            path: "/game/survival",
          },

          {
            id: "time",

            title: t("menu.modes.time_attack.title"),

            desc: t("menu.modes.time_attack.desc"),

            icon: <Timer size={24} />,

            BigIcon: Timer,

            tag: "HIZLI",

            color: "text-cyan-300",

            bg: "bg-cyan-500/20",

            border: "group-hover:border-cyan-500/30",

            path: "/game/time-attack",
          },

          {
            id: "bot",

            title: t("menu.modes.bot.title"),

            desc: t("menu.modes.bot.desc"),

            icon: <Bot size={24} />,

            BigIcon: Bot,

            tag: "AI",

            color: "text-blue-300",

            bg: "bg-blue-500/20",

            border: "group-hover:border-blue-500/30",

            path: "/game/bot",
          },

          {
            id: "2p",

            title: t("menu.modes.multiplayer.title"),

            desc: t("menu.modes.multiplayer.desc"),

            icon: <Gamepad2 size={24} />,

            BigIcon: Gamepad2,

            tag: "LOCAL",

            color: "text-emerald-300",

            bg: "bg-emerald-500/20",

            border: "group-hover:border-emerald-500/30",

            path: "/game/2p",
          },

          {
            id: "penalty",

            title: t("menu.modes.penalty.title"),

            desc: t("menu.modes.penalty.desc"),

            icon: <Trophy size={24} />,

            BigIcon: Trophy,

            tag: "RANKED",

            color: "text-purple-300",

            bg: "bg-purple-500/20",

            border: "group-hover:border-purple-500/30",

            path: "/game/penalty",
          },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            onMouseEnter={() => setHoveredCard(item.id)}
            onMouseLeave={() => setHoveredCard(null)}
            className={`
              group relative h-48 w-full text-left p-6 rounded-4xl transition-all duration-500
              border border-white/5 ${item.border}
              bg-white/2 backdrop-blur-xl hover:bg-white/5
              shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_16px_48px_0_rgba(0,0,0,0.5)]
              hover:-translate-y-1 overflow-hidden
            `}
          >
            {/* Arka Plan Watermark İkonu (Sağ Alt Köşe) */}
            <div
              className={`absolute -bottom-6 -right-6 text-white/3 transform transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-12 ${
                hoveredCard === item.id ? "text-white/6" : ""
              }`}
            >
              <item.BigIcon size={160} strokeWidth={1} />
            </div>

            {/* İÇERİK YAPISI */}
            <div className="relative z-10 flex flex-col h-full justify-between">
              {/* ÜST SATIR */}
              <div className="flex justify-between items-start">
                {/* İkon */}
                <div
                  className={`p-3.5 rounded-2xl ${item.bg} ${item.color} backdrop-blur-md border border-white/5 shadow-inner group-hover:scale-110 transition-transform duration-300`}
                >
                  {item.icon}
                </div>

                {/* Etiket (Pill) */}
                <div
                  className={`px-3 py-1.5 rounded-full border border-white/5 bg-white/5 backdrop-blur-md text-[10px] font-bold tracking-widest ${item.color} shadow-sm group-hover:bg-white/10 transition-colors`}
                >
                  {item.tag}
                </div>
              </div>

              {/* ALT SATIR */}
              <div>
                <h3 className="text-xl font-black text-white/90 mb-1 tracking-tight group-hover:text-white transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs font-medium text-white/40 group-hover:text-white/60 transition-colors">
                  {item.desc}
                </p>
              </div>
            </div>

            {/* Hover Shine Effect */}
            <div className="absolute inset-0 bg-linear-to-tr from-white/0 via-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </button>
        ))}

        {/* ONLINE (Kilitli Mod) */}
        <div className="relative h-48 rounded-4xl p-6 border border-white/5 bg-black/20 backdrop-blur-sm flex flex-col justify-between group cursor-not-allowed overflow-hidden">
          {/* Watermark */}
          <Globe
            className="absolute -bottom-8 -right-8 text-white/2 -rotate-12 group-hover:rotate-0 transition-transform duration-700"
            size={160}
          />

          <div className="relative z-10 flex justify-between items-start opacity-40 group-hover:opacity-60 transition-opacity">
            <div className="p-3.5 rounded-2xl bg-white/5 text-gray-400 border border-white/5">
              <Globe size={24} />
            </div>
            <div className="px-3 py-1.5 rounded-full border border-white/5 bg-white/5 text-[10px] font-bold text-gray-500 tracking-widest flex items-center gap-1.5">
              <Lock size={10} /> LOCKED
            </div>
          </div>

          <div className="relative z-10 opacity-40 group-hover:opacity-60 transition-opacity">
            <h3 className="text-xl font-black text-white mb-1 tracking-tight">
              ONLINE ARENA
            </h3>
            <p className="text-xs font-medium text-white/40">Yakında...</p>
          </div>
        </div>
      </div>

      {/* --- ALT BAR (TUTORIAL) --- */}
      <div className="fixed bottom-10 z-20 flex gap-4">
        {/* Tutorial Butonu */}
        <button
          onClick={() => navigate("/game/tutorial")}
          className="
            flex items-center gap-3 px-6 py-3.5 rounded-full 
            bg-gray-800/80 backdrop-blur-xl border border-white/10 
            text-xs font-bold text-gray-300 hover:text-white hover:bg-gray-700 
            transition-all hover:scale-105 shadow-xl group
          "
        >
          <div className="bg-cyan-500/10 p-1.5 rounded-full group-hover:bg-cyan-500/20 transition-colors">
            <MousePointer2 size={16} className="text-cyan-400" />
          </div>
          <span>{t("menu.tutorial_btn")}</span>
        </button>

        {/* YENİ: Leaderboard Butonu */}
        <button
          onClick={() => navigate("/leaderboard")}
          className="
            flex items-center gap-3 px-6 py-3.5 rounded-full 
            bg-yellow-900/40 backdrop-blur-xl border border-yellow-500/20 
            text-xs font-bold text-yellow-100 hover:text-white hover:bg-yellow-900/60 
            transition-all hover:scale-105 shadow-xl group
          "
        >
          <div className="bg-yellow-500/10 p-1.5 rounded-full group-hover:bg-yellow-500/20 transition-colors">
            <Trophy size={16} className="text-yellow-400" />
          </div>
          <span>{t("leaderboard.title")}</span>
        </button>
      </div>
      <WelcomeModal />
      {/* GEÇİCİ DİL BUTONU */}
      <button
        onClick={toggleLanguage}
        className="
          fixed top-6 right-6 z-50 
          group flex items-center gap-3 
          px-4 py-2.5 
          rounded-full 
          bg-neutral-900/40 backdrop-blur-xl 
          border border-white/10 
          hover:border-cyan-500/50 hover:bg-neutral-900/80 
          transition-all duration-300 ease-out
          shadow-lg hover:shadow-cyan-500/20 
          active:scale-95 cursor-pointer
        "
      >
        <div className="p-1.5 rounded-full bg-white/5 group-hover:bg-cyan-500/20 transition-colors duration-300">
          <Globe
            size={16}
            className="text-gray-400 group-hover:text-cyan-400 transition-colors"
          />
        </div>

        <span className="text-xs font-black text-gray-300 group-hover:text-white tracking-[0.2em] font-mono">
          {i18n.language === "tr" ? "EN" : "TR"}
        </span>
      </button>
      <button
        onClick={() => setShowProfile(true)}
        className="
          fixed top-6 left-6 z-50 
          group flex items-center gap-3 
          px-4 py-2.5 
          rounded-full 
          bg-neutral-900/40 backdrop-blur-xl 
          border border-white/10 
          hover:border-blue-500/50 hover:bg-neutral-900/80 
          transition-all duration-300 ease-out
          shadow-lg hover:shadow-blue-500/20 
          active:scale-95 cursor-pointer
        "
      >
        <div className="p-1.5 rounded-full bg-white/5 group-hover:bg-blue-500/20 transition-colors duration-300">
          <User
            size={16}
            className="text-gray-400 group-hover:text-blue-400 transition-colors"
          />
        </div>
        <span className="text-xs font-black text-gray-300 group-hover:text-white tracking-widest font-mono">
          PROFİL
        </span>
      </button>
      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </div>
  );
};

export default MainMenu;
