interface RulesModalProps {
  showRules: boolean;
  onClose: () => void;
}

const RulesModal: React.FC<RulesModalProps> = ({ showRules, onClose }) => {
  if (!showRules) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
      />

      <div
        className="
          absolute 
          top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
          bg-neutral-900 text-gray-200
          rounded-xl shadow-2xl
          p-6 w-80 sm:w-96
          z-50 border border-neutral-700
          animate-popup
        "
      >
        <h2 className="text-2xl font-bold mb-4 text-yellow-400">
          🎮 Oyun Kuralları
        </h2>

        <div className="text-left space-y-2 text-sm leading-relaxed text-gray-300">
          <p>
            ⏱️ <strong>Amaç:</strong> Kronometredeki milisaniyeyi (ms)
            yakalayarak en iyi vuruşu yap!
          </p>

          <div className="bg-gray-800 p-3 rounded-lg my-2">
            <p className="text-green-400 font-bold">🎯 Vuruş Bölgeleri:</p>
            <ul className="ml-2 mt-1 space-y-1">
              <li>
                • <strong>00 ms</strong> → GOL! (Tam isabet) ⚽
              </li>
              <li>
                • <strong>01-10 ms</strong> → Penaltı (%75 Gol)
              </li>
              <li>
                • <strong>11-30 ms</strong> → Şut (%25 Gol)
              </li>
              <li>
                • <strong>31-50 ms</strong> → Orta (%20 Gol)
              </li>
              <li>
                • <strong>51-70 ms</strong> → Frikik (%20 Gol)
              </li>
              <li>
                • <strong>70+ ms</strong> → Ofsayt ❌
              </li>
            </ul>
          </div>

          <p>
            ⌨️ <strong>Kontrol:</strong> Fare ile butona tıklayabilir veya{" "}
            <strong>SPACE</strong> tuşunu kullanabilirsin.
          </p>

          <p>
            🤖 <strong>Bot Modu:</strong> Zorluk seviyesi seçebilir ve en yüksek
            skorunu kaydedebilirsin.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold transition"
        >
          Anlaşıldı!
        </button>
      </div>
    </>
  );
};

export default RulesModal;
