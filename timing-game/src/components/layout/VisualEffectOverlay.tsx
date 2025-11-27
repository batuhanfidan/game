import React, { useEffect, useState } from "react";
import type { VisualEffectData } from "../../types";

interface VisualEffectOverlayProps {
  effect: VisualEffectData | null;
  isTwoPlayerMode?: boolean;
  currentPlayer?: "p1" | "p2";
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
      setKey((prev) => prev + 1);

      const isMobile = window.innerWidth < 768;

      if (isTwoPlayerMode) {
        if (effect.player === "p1") {
          setPosition({
            top: isMobile ? "85%" : "70%",
            left: isMobile ? "25%" : "30%",
            transform: "translate(-50%, -50%)",
          });
        } else {
          setPosition({
            top: isMobile ? "85%" : "70%",
            left: isMobile ? "75%" : "70%",
            transform: "translate(-50%, -50%)",
          });
        }
      } else {
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
    <div key={key} className="effect-item fixed z-100" style={position}>
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
      {effect.type === "save" && (
        <div className="animate-goal text-7xl sm:text-9xl drop-shadow-[0_0_30px_rgba(59,130,246,0.8)]">
          🧤
        </div>
      )}
    </div>
  );
};

export default VisualEffectOverlay;
