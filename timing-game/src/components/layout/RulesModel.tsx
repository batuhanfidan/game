import React from "react";

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
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity"
      />

      {/* Modal İçeriği */}
      <div
        className="
          fixed 
          top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
          bg-neutral-900 text-gray-200
          rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)]
          border border-neutral-700
          w-[90vw] max-w-2xl max-h-[85vh]
          z-50 overflow-hidden flex flex-col
          animate-popup font-mono
        "
      >
        {/* Başlık */}
        <div className="p-6 border-b border-neutral-800 bg-neutral-900/50 sticky top-0 z-10 flex justify-between items-center">
          <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-linear-to-r from-yellow-400 to-orange-500">
            📜 OYUN KILAVUZU
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white text-2xl font-bold px-2 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scroll Edilebilir İçerik */}
        <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
          {/* Bölüm 1: Temel Mekanik */}
          <section>
            <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
              🕹️ NASIL OYNANIR?
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Kronometre çalışırken hedef <strong>milisaniyeyi (ms)</strong>{" "}
              yakalamaya çalış.
              <br />
              Sıran geldiğinde ekrandaki <strong>butona</strong> bas.
            </p>
          </section>

          {/* Bölüm 2: Modlar */}
          <section>
            <h3 className="text-lg font-bold text-purple-400 mb-3 flex items-center gap-2">
              🎮 OYUN MODLARI
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-neutral-800/50 p-3 rounded-lg border border-neutral-700">
                <h4 className="font-bold text-white mb-1">Klasik & Bot</h4>
                <p className="text-xs text-gray-400">
                  Belirlenen süre (örn: 3dk) iki oyuncuya paylaştırılır. Ana
                  süre dolana kadar en çok golü atan kazanır.
                </p>
              </div>
              <div className="bg-neutral-800/50 p-3 rounded-lg border border-neutral-700">
                <h4 className="font-bold text-red-400 mb-1">
                  💀 Hayatta Kalma
                </h4>
                <p className="text-xs text-gray-400">
                  Hata yapma lüksün yok! "GOL" harici herhangi bir sonuçta oyun
                  biter. Serini uzatmaya çalış.
                </p>
              </div>
              <div className="bg-neutral-800/50 p-3 rounded-lg border border-neutral-700">
                <h4 className="font-bold text-cyan-400 mb-1">
                  ⏱️ Zamana Karşı
                </h4>
                <p className="text-xs text-gray-400">
                  60 saniye içinde atabildiğin kadar gol at. Süre bitince oyun
                  biter.
                </p>
              </div>
              <div className="bg-neutral-800/50 p-3 rounded-lg border border-neutral-700">
                <h4 className="font-bold text-yellow-400 mb-1">🥅 Penaltı</h4>
                <p className="text-xs text-gray-400">
                  5'er atışlık seri penaltı atışları. Sadece "GOL" ve "PENALTI"
                  bölgeleri gol sayılır.
                </p>
              </div>
            </div>
          </section>

          {/* YENİ BÖLÜM: Varyasyonlar */}
          <section>
            <h3 className="text-lg font-bold text-pink-400 mb-3 flex items-center gap-2">
              🎲 OYUN VARYASYONLARI
            </h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-xl">🟢</span>
                <div>
                  <strong className="text-white">Klasik:</strong> Standart oyun
                  akışı. Hedef sabit 00ms.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xl">👻</span>
                <div>
                  <strong className="text-white">Hayalet:</strong> Sayaç
                  500ms'den sonra görünmez olur. İçgüdülerine güven!
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xl">📉</span>
                <div>
                  <strong className="text-white">Dengesiz:</strong> Zamanın akış
                  hızı rastgele yavaşlar ve hızlanır. Kaotik bir deneyim!
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xl">🔀</span>
                <div>
                  <strong className="text-white">Rastgele:</strong> Her tur
                  sayaç farklı bir ms değerinden başlar. Ezber yok!
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xl">🎯</span>
                <div>
                  <strong className="text-white">Gezgin:</strong> Hedef noktası
                  (00ms) sürekli yer değiştirir. Yardımcı barı takip etmek
                  zorundasın.
                </div>
              </li>
            </ul>
          </section>

          {/* Bölüm 4: Puanlama */}
          <section>
            <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
              🎯 VURUŞ BÖLGELERİ
            </h3>
            <div className="bg-neutral-800 rounded-lg overflow-hidden text-sm border border-neutral-700">
              <table className="w-full text-left">
                <thead className="bg-neutral-700 text-gray-300">
                  <tr>
                    <th className="p-3">Fark (ms)</th>
                    <th className="p-3">Sonuç</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-700 text-gray-400">
                  <tr className="bg-green-900/20">
                    <td className="p-3 font-bold text-green-400">0 ms</td>
                    <td className="p-3 font-bold text-white">
                      ⚽ MÜKEMMEL GOL
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3">1 - 10 ms</td>
                    <td className="p-3 text-yellow-200">
                      Penaltı (Yüksek Şans)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3">11 - 30 ms</td>
                    <td className="p-3">Şut (Orta Şans)</td>
                  </tr>
                  <tr>
                    <td className="p-3">31 - 50 ms</td>
                    <td className="p-3">Orta (Düşük Şans)</td>
                  </tr>
                  <tr>
                    <td className="p-3">51 - 70 ms</td>
                    <td className="p-3 text-orange-400">Frikik / Direk</td>
                  </tr>
                  <tr className="bg-red-900/20">
                    <td className="p-3 font-bold text-red-400">71+ ms</td>
                    <td className="p-3 font-bold">❌ OFSAYT / AUT</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Footer Buton */}
        <div className="p-6 border-t border-neutral-800 bg-neutral-900 sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-3 rounded-xl font-bold text-lg transition-all transform active:scale-95 shadow-lg"
          >
            TAMAM, ANLAŞILDI! 👍
          </button>
        </div>
      </div>
    </>
  );
};

export default RulesModal;
