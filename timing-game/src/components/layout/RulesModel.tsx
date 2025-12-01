import React from "react";
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
          w-[95vw] max-w-3xl max-h-[90vh]
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
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 tracking-tight">
              OYUN KILAVUZU v2.0
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
              <Gamepad2 size={20} /> NASIL OYNANIR?
            </h3>
            <div className="bg-blue-900/10 p-4 rounded-xl border border-blue-500/20 text-sm text-gray-300 leading-relaxed">
              <p>
                Kronometre çalışırken{" "}
                <strong>hedef milisaniyeyi (genellikle 00ms)</strong> yakalamaya
                çalış. Sıran geldiğinde ekrandaki <strong>BUTONA</strong> bas.
                Hedefe ne kadar yakınsan şutun o kadar isabetli olur!
              </p>
            </div>
          </section>

          {/* 2. Vuruş Bölgeleri  */}
          <section>
            <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2 border-b border-green-900/30 pb-2">
              <Target size={20} /> VURUŞ BÖLGELERİ (MS)
            </h3>
            <div className="bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 shadow-lg">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-800 text-gray-400 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="p-3">Fark (ms)</th>
                    <th className="p-3">Sonuç</th>
                    <th className="p-3 text-right">Etki</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 text-gray-300">
                  <tr className="bg-green-500/10">
                    <td className="p-3 font-mono font-bold text-green-400">
                      0 - 9
                    </td>
                    <td className="p-3 font-bold text-white flex items-center gap-2">
                      ⚽ MÜKEMMEL GOL
                    </td>
                    <td className="p-3 text-right text-green-400 font-bold">
                      Kesin Gol
                    </td>
                  </tr>
                  <tr className="bg-yellow-500/5">
                    <td className="p-3 font-mono text-yellow-200">10 - 109</td>
                    <td className="p-3">Penaltı</td>
                    <td className="p-3 text-right text-yellow-500">%75 Gol</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-blue-300">110 - 309</td>
                    <td className="p-3">Şut</td>
                    <td className="p-3 text-right text-blue-400">%30 Gol</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-gray-400">310 - 509</td>
                    <td className="p-3">Orta</td>
                    <td className="p-3 text-right text-gray-500">%20 Gol</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-orange-400">510 - 710</td>
                    <td className="p-3">Frikik / Direk</td>
                    <td className="p-3 text-right text-orange-500">
                      Çok Düşük
                    </td>
                  </tr>
                  <tr className="bg-red-500/10">
                    <td className="p-3 font-mono font-bold text-red-500">
                      711+
                    </td>
                    <td className="p-3 font-bold text-red-400">
                      ❌ OFSAYT / AUT
                    </td>
                    <td className="p-3 text-right text-red-500">Sıra Geçer</td>
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
                <Bot size={20} /> BOTA KARŞI
              </h3>
              <div className="bg-neutral-800/50 p-4 rounded-xl border border-neutral-700 space-y-3">
                <p className="text-xs text-gray-300">
                  Botun zorluk seviyesini seç ve zamana karşı yarış.
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs border-b border-white/5 pb-1">
                    <span className="text-gray-400">Kolay</span>
                    <span className="text-green-400 font-mono">
                      700ms Hata Payı
                    </span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-white/5 pb-1">
                    <span className="text-gray-400">Orta</span>
                    <span className="text-yellow-400 font-mono">
                      200ms Hata Payı
                    </span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-white/5 pb-1">
                    <span className="text-gray-400">Zor</span>
                    <span className="text-orange-400 font-mono">
                      50ms Hata Payı
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-red-400 font-bold">İmkansız</span>
                    <span className="text-red-400 font-mono font-bold">
                      10ms (Mükemmel)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SURVIVAL MODU */}
            <div>
              <h3 className="text-lg font-bold text-red-500 mb-3 flex items-center gap-2">
                <Skull size={20} /> HAYATTA KALMA
              </h3>
              <div className="bg-red-950/20 p-4 rounded-xl border border-red-900/50 space-y-3 text-sm">
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <ShieldAlert size={16} className="text-red-500 mt-0.5" />
                    <span>
                      <strong>Can:</strong> 3 can ile oyuna başlarsın. Hata
                      yaparsan can kaybedersin. Her 10 puanda bir can
                      kazanırsın.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle
                      size={16}
                      className="text-orange-500 mt-0.5"
                    />
                    <span>
                      <strong>Lanetler:</strong> Her 15 turda bir lanet gelir.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Flame size={16} className="text-yellow-500 mt-0.5" />
                    <span>
                      <strong>Fever & Adrenalin:</strong> Kritik vuruşlarla barı
                      doldur, zamanı yavaşlat!
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* TIME ATTACK */}
            <div>
              <h3 className="text-lg font-bold text-cyan-400 mb-3 flex items-center gap-2">
                <Clock size={20} /> ZAMANA KARŞI
              </h3>
              <div className="bg-cyan-950/20 p-4 rounded-xl border border-cyan-900/50 space-y-3 text-sm">
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold">60sn</span> içinde
                    en yüksek puanı topla.
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap size={14} className="text-yellow-400" />
                    <span>
                      <strong>Kombo:</strong> Gol attıkça çarpan artar (5x'e
                      kadar).
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ShieldAlert size={14} className="text-red-500" />
                    <span>
                      <strong>Kırmızı Hedef:</strong> Vurursan{" "}
                      <span className="text-red-400 font-bold">-10sn</span>{" "}
                      ceza!
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Flame size={14} className="text-purple-400" />
                    <span>
                      <strong>Fever:</strong> 10 Kombo yaparsan zaman donar!
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* OYUN VARYASYONLARI */}
            <div>
              <h3 className="text-lg font-bold text-purple-400 mb-3 flex items-center gap-2">
                <Shuffle size={20} /> VARYASYONLAR
              </h3>
              <div className="bg-purple-900/10 p-4 rounded-xl border border-purple-500/20 text-xs space-y-2 text-gray-300">
                <p>
                  <strong className="text-green-400">Klasik:</strong> Standart
                  00ms hedefi.
                </p>
                <div className="flex items-center gap-2">
                  <Ghost size={14} className="text-purple-400" />
                  <span>
                    <strong>Hayalet:</strong> 500ms'den sonra sayaç kaybolur.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-orange-400" />
                  <span>
                    <strong>Dengesiz:</strong> Zaman hızı rastgele değişir
                    (Kaos).
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Shuffle size={14} className="text-blue-400" />
                  <span>
                    <strong>Rastgele:</strong> Sayaç her tur farklı başlar.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Target size={14} className="text-red-400" />
                  <span>
                    <strong>Gezgin:</strong> Hedef (00ms) sürekli yer
                    değiştirir.
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
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-4 rounded-xl font-black text-lg tracking-widest transition-all transform active:scale-[0.98] shadow-lg hover:shadow-blue-900/30 flex items-center justify-center gap-2"
          >
            HAZIRIM! <Zap size={20} className="fill-white" />
          </button>
        </div>
      </div>
    </>
  );
};

export default RulesModal;
