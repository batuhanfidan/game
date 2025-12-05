import React, { useMemo, memo } from "react";
import type { VisualEffectData } from "../../shared/types";
import { useMediaQuery } from "../../hooks/core/useMediaQuery";
import { UI_CONSTANTS } from "../../shared/constants/ui";

interface VisualEffectOverlayProps {
  effect: VisualEffectData | null;
  isTwoPlayerMode?: boolean;
  currentPlayer?: "p1" | "p2";
}

const VisualEffectOverlay: React.FC<VisualEffectOverlayProps> = ({
  effect,
  isTwoPlayerMode,
}) => {
  const isMobile = useMediaQuery(
    `(max-width: ${UI_CONSTANTS.MOBILE_BREAKPOINT}px)`
  );

  const position = useMemo(() => {
    if (!effect) return {};

    if (isTwoPlayerMode) {
      if (effect.player === "p1") {
        return {
          top: isMobile ? "85%" : "70%",
          left: isMobile ? "25%" : "30%",
          transform: "translate(-50%, -50%)",
        };
      } else {
        return {
          top: isMobile ? "85%" : "70%",
          left: isMobile ? "75%" : "70%",
          transform: "translate(-50%, -50%)",
        };
      }
    } else {
      return {
        top: "25%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }
  }, [effect, isTwoPlayerMode, isMobile]);

  if (!effect) return null;

  return (
    <div
      className="effect-item fixed z-100 flex flex-col items-center justify-center"
      style={position}
    >
      {effect.type === "goal" && (
        <>
          <div className="animate-success-burst text-8xl sm:text-9xl drop-shadow-[0_0_50px_rgba(34,197,94,1)]">
            ⚽
          </div>
        </>
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

export default memo(VisualEffectOverlay);
