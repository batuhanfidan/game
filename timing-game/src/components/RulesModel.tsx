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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
      />

      <div
        className="
          absolute 
          top-[60px] right-[70px]
          max-sm:right-2 max-sm:top-14
          bg-neutral-900 text-gray-200
          rounded-xl shadow-xl
          p-4 w-64
          z-50 border border-neutral-700
          animate-popup
        "
      >
        <h2 className="text-xl font-bold mb-2">🎮 Kurallar</h2>

        <div className="text-left space-y-1.5 text-sm leading-relaxed">
          <p>
            • <strong>Timing-Game</strong>, doğru milisaniyeyi yakalayarak gol
            atmaya çalıştığın bir refleks oyunudur.
          </p>
          <p>
            • Zamanlayıcı dönerken doğru anda tıklayıp en iyi vuruşu yapmaya
            çalış.
          </p>
          <p>• Her ms aralığı farklı bir aksiyon üretir:</p>

          <p>
            — <strong>00 ms</strong> → Gol ⚽
          </p>
          <p>
            — <strong>01–10 ms</strong> → Penaltı
          </p>
          <p>
            — <strong>11–30 ms</strong> → Şut
          </p>
          <p>
            — <strong>31–50 ms</strong> → Orta
          </p>
          <p>
            — <strong>51–70 ms</strong> → Frikik
          </p>
          <p>
            — <strong>70 ms üzeri</strong> → Ofsayt ❌
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-3 bg-gray-800 text-white py-1.5 rounded-lg"
        >
          Kapat
        </button>
      </div>
    </>
  );
};

export default RulesModal;
