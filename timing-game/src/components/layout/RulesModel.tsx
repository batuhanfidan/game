import React from "react";
import { useTranslation, Trans } from "react-i18next"; // <-- Trans eklendi
import {
  Trophy,
  Skull,
  Zap,
  Target,
  Clock,
  Bot,
  ShieldAlert,
  Flame,
  Gamepad2,
  Ghost,
  Activity,
  Shuffle,
  AlertTriangle,
} from "lucide-react";

interface RulesModalProps {
  showRules: boolean;
  onClose: () => void;
}

const RulesModal: React.FC<RulesModalProps> = ({ showRules, onClose }) => {
  const { t } = useTranslation();

  if (!showRules) return null;

  return (
    <>
      {/* Arka Plan Karartma */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-100 transition-opacity"
      />

      {/* Modal İçeriği */}
      <div
        className="
          fixed 
          top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
          bg-[#09090b] text-gray-200
          rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)]
          border border-neutral-700
          w-[95vw] max-w-3xl max-h-[85vh] sm:max-h-[90vh]
          z-100 overflow-hidden flex flex-col
          animate-popup font-mono
        "
      >
        {/* Başlık */}
        <div className="p-6 border-b border-neutral-800 bg-neutral-900/80 sticky top-0 z-10 flex justify-between items-center backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/20 p-2 rounded-lg">
              <Trophy className="text-yellow-500" size={24} />
            </div>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-orange-500 tracking-tight">
              {t("rules.title")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="bg-neutral-800 hover:bg-neutral-700 text-gray-400 hover:text-white w-8 h-8 rounded-lg flex items-center justify-center transition-all font-bold"
          >
            ✕
          </button>
        </div>

        {/* Scroll Edilebilir İçerik */}
        <div className="p-6 overflow-y-auto space-y-10 custom-scrollbar bg-[#09090b]">
          {/* 1. Temel Oynanış */}
          <section>
            <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2 border-b border-blue-900/30 pb-2">
              <Gamepad2 size={20} /> {t("rules.how_to_play.title")}
            </h3>
            <div className="bg-blue-900/10 p-4 rounded-xl border border-blue-500/20 text-sm text-gray-300 leading-relaxed">
              <p>
                <Trans i18nKey="rules.how_to_play.text">
                  Kronometre çalışırken{" "}
                  <strong>hedef milisaniyeyi (genellikle 00ms)</strong>{" "}
                  yakalamaya çalış. Sıran geldiğinde ekrandaki{" "}
                  <strong>BUTONA</strong> bas. Hedefe ne kadar yakınsan şutun o
                  kadar isabetli olur!
                </Trans>
              </p>
            </div>
          </section>

          {/* 2. Vuruş Bölgeleri  */}
          <section>
            <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2 border-b border-green-900/30 pb-2">
              <Target size={20} /> {t("rules.hit_zones.title")}
            </h3>
            <div className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 shadow-lg">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-800 text-gray-400 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="p-3">{t("rules.hit_zones.table.diff")}</th>
                    <th className="p-3">{t("rules.hit_zones.table.result")}</th>
                    <th className="p-3 text-right">
                      {t("rules.hit_zones.table.effect")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 text-gray-300">
                  <tr className="bg-green-500/10">
                    <td className="p-3 font-mono font-bold text-green-400">
                      0
                    </td>
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      {t("rules.hit_zones.table.perfect")}
                    </td>
                    <td className="p-3 text-right text-green-400 font-bold">
                      {t("rules.hit_zones.table.perfect_effect")}
                    </td>
                  </tr>
                  <tr className="bg-yellow-500/5">
                    <td className="p-3 font-mono text-yellow-200">1 - 9</td>
                    <td className="p-3">
                      {t("rules.hit_zones.table.penalty")}
                    </td>
                    <td className="p-3 text-right text-yellow-500">
                      {t("rules.hit_zones.table.penalty_effect")}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-blue-300">11 - 39</td>
                    <td className="p-3">{t("rules.hit_zones.table.shot")}</td>
                    <td className="p-3 text-right text-blue-400">
                      {t("rules.hit_zones.table.shot_effect")}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-gray-400">31 - 59</td>
                    <td className="p-3">{t("rules.hit_zones.table.cross")}</td>
                    <td className="p-3 text-right text-gray-500">
                      {t("rules.hit_zones.table.cross_effect")}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-orange-400">51 - 70</td>
                    <td className="p-3">
                      {t("rules.hit_zones.table.freekick")}
                    </td>
                    <td className="p-3 text-right text-orange-500">
                      {t("rules.hit_zones.table.freekick_effect")}
                    </td>
                  </tr>
                  <tr className="bg-red-500/10">
                    <td className="p-3 font-mono font-bold text-red-500">
                      71+
                    </td>
                    <td className="p-3 font-bold text-red-400">
                      {t("rules.hit_zones.table.offside")}
                    </td>
                    <td className="p-3 text-right text-red-500">
                      {t("rules.hit_zones.table.offside_effect")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 3. Oyun Modları Detay */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* BOT MODU */}
            <div>
              <h3 className="text-lg font-bold text-indigo-400 mb-3 flex items-center gap-2">
                <Bot size={20} /> {t("rules.modes.bot.title")}
              </h3>
              <div className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-700 space-y-3">
                <p className="text-xs text-gray-300">
                  {t("rules.modes.bot.desc")}
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs border-b border-white/5 pb-1">
                    <span className="text-gray-400">
                      {t("difficulty.easy")}
                    </span>
                    <span className="text-green-400 font-mono">
                      {t("rules.modes.bot.diff_easy")}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-white/5 pb-1">
                    <span className="text-gray-400">
                      {t("difficulty.medium")}
                    </span>
                    <span className="text-yellow-400 font-mono">
                      {t("rules.modes.bot.diff_medium")}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-white/5 pb-1">
                    <span className="text-gray-400">
                      {t("difficulty.hard")}
                    </span>
                    <span className="text-orange-400 font-mono">
                      {t("rules.modes.bot.diff_hard")}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-red-400 font-bold">
                      {t("difficulty.impossible")}
                    </span>
                    <span className="text-red-400 font-mono font-bold">
                      {t("rules.modes.bot.diff_impossible")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SURVIVAL MODU */}
            <div>
              <h3 className="text-lg font-bold text-red-500 mb-3 flex items-center gap-2">
                <Skull size={20} /> {t("rules.modes.survival.title")}
              </h3>
              <div className="bg-red-950/20 p-4 rounded-xl border border-red-900/50 space-y-3 text-sm">
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <ShieldAlert size={16} className="text-red-500 mt-0.5" />
                    <span>
                      <Trans i18nKey="rules.modes.survival.lives">
                        <strong>Can:</strong> 3 can ile oyuna başlarsın.
                      </Trans>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle
                      size={16}
                      className="text-orange-500 mt-0.5"
                    />
                    <span>
                      <Trans i18nKey="rules.modes.survival.curses">
                        <strong>Lanetler:</strong> Her 15 turda bir lanet gelir.
                      </Trans>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Flame size={16} className="text-yellow-500 mt-0.5" />
                    <span>
                      <Trans i18nKey="rules.modes.survival.fever">
                        <strong>Fever:</strong> Barı doldur!
                      </Trans>
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* TIME ATTACK */}
            <div>
              <h3 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2">
                <Clock size={20} /> {t("rules.modes.time_attack.title")}
              </h3>
              <div className="bg-cyan-950/20 p-4 rounded-xl border border-cyan-900/50 space-y-3 text-sm">
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <Trans i18nKey="rules.modes.time_attack.objective">
                      <span className="text-cyan-400 font-bold">60sn</span>{" "}
                      içinde topla.
                    </Trans>
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap size={14} className="text-yellow-400" />
                    <span>
                      <Trans i18nKey="rules.modes.time_attack.combo">
                        <strong>Kombo:</strong> Çarpan artar.
                      </Trans>
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldAlert size={14} className="text-red-500" />
                    <span>
                      <Trans i18nKey="rules.modes.time_attack.red_target">
                        <strong>Kırmızı:</strong>{" "}
                        <span className="text-red-400 font-bold">-10sn</span>{" "}
                        ceza!
                      </Trans>
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Flame size={14} className="text-purple-400" />
                    <span>
                      <Trans i18nKey="rules.modes.time_attack.fever">
                        <strong>Fever:</strong> Zaman donar!
                      </Trans>
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* OYUN VARYASYONLARI */}
            <div>
              <h3 className="text-lg font-bold text-purple-400 mb-3 flex items-center gap-2">
                <Shuffle size={20} /> {t("rules.modes.variants.title")}
              </h3>
              <div className="bg-purple-900/10 p-4 rounded-xl border border-purple-500/20 text-xs space-y-2 text-gray-300">
                <p>
                  <Trans i18nKey="rules.modes.variants.classic">
                    <strong className="text-green-400">Klasik:</strong> Standart
                    00ms.
                  </Trans>
                </p>
                <div className="flex items-center gap-2">
                  <Ghost size={14} className="text-purple-400" />
                  <span>
                    <Trans i18nKey="rules.modes.variants.ghost">
                      <strong>Hayalet:</strong> Kaybolur.
                    </Trans>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-orange-400" />
                  <span>
                    <Trans i18nKey="rules.modes.variants.unstable">
                      <strong>Dengesiz:</strong> Kaos.
                    </Trans>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shuffle size={14} className="text-blue-400" />
                  <span>
                    <Trans i18nKey="rules.modes.variants.random">
                      <strong>Rastgele:</strong> Farklı başlar.
                    </Trans>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Target size={14} className="text-red-400" />
                  <span>
                    <Trans i18nKey="rules.modes.variants.moving">
                      <strong>Gezgin:</strong> Hareket eder.
                    </Trans>
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Buton */}
        <div className="p-6 border-t border-neutral-800 bg-neutral-900 sticky bottom-0 z-10 backdrop-blur-xl">
          <button
            onClick={onClose}
            className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-4 rounded-xl font-black text-lg tracking-widest transition-all transform active:scale-[0.98] shadow-lg hover:shadow-blue-900/30 flex items-center justify-center gap-2"
          >
            {t("rules.ready_btn")} <Zap size={20} className="fill-white" />
          </button>
        </div>
      </div>
    </>
  );
};

export default RulesModal;
