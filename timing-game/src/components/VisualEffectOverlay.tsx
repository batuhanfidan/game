import React, { useEffect, useState } from "react";

// Gelen efekt verisinin tipini tanımlıyoruz
interface VisualEffectData {
  type: "goal" | "post" | "miss" | "save";
  player: "p1" | "p2";
}

interface VisualEffectOverlayProps {
  effect: VisualEffectData | null; // Artık nesne bekliyor
  isTwoPlayerMode?: boolean;
  currentPlayer?: "p1" | "p2"; // Geriye dönük uyumluluk için
}

const VisualEffectOverlay: React.FC<VisualEffectOverlayProps> = ({
  effect,
  isTwoPlayerMode,
}) => {
  const [key, setKey] = useState(0);
  const [position, setPosition] = useState<{
    top: string;
    left: string;
    transform: string;
  }>({
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  });

  useEffect(() => {
    if (effect) {
      setKey((prev) => prev + 1); // Her yeni efektte animasyonu sıfırla

      const isMobile = window.innerWidth < 768;

      if (isTwoPlayerMode) {
        // --- 2 KİŞİLİK MOD ---
        // Efektin sahibi kimse (effect.player) onun tarafında göster
        if (effect.player === "p1") {
          setPosition({
            top: isMobile ? "85%" : "70%",
            left: isMobile ? "25%" : "30%",
            transform: "translate(-50%, -50%)",
          });
        } else {
          // p2
          setPosition({
            top: isMobile ? "85%" : "70%",
            left: isMobile ? "75%" : "70%",
            transform: "translate(-50%, -50%)",
          });
        }
      } else {
        // --- BOT MODU (TEK KİŞİLİK) ---
        setPosition({
          top: isMobile ? "72%" : "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        });
      }
    }
  }, [effect, isTwoPlayerMode]);

  if (!effect) return null;

  return (
    <div key={key} className="effect-item fixed z-[100]" style={position}>
      {effect.type === "goal" && (
        <div className="animate-goal text-7xl sm:text-9xl drop-shadow-[0_0_30px_rgba(34,197,94,0.8)]">
          ⚽
        </div>
      )}
      {effect.type === "post" && (
        <div className="animate-post text-7xl sm:text-9xl drop-shadow-[0_0_30px_rgba(234,179,8,0.8)]">
          🥅
        </div>
      )}
      {effect.type === "miss" && (
        <div className="animate-miss text-7xl sm:text-8xl opacity-60 grayscale">
          ❌
        </div>
      )}
      {/* 'save' tipi henüz kullanılmıyor olabilir ama hata vermemesi için ekledik */}
      {effect.type === "save" && (
        <div className="animate-goal text-7xl sm:text-9xl drop-shadow-[0_0_30px_rgba(59,130,246,0.8)]">
          🧤
        </div>
      )}
    </div>
  );
};

export default VisualEffectOverlay;
