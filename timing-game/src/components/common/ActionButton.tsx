import React, { memo } from "react";

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  customText?: string;
  customColor?: string;
  isFirstTurn?: boolean;
  className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = memo(
  ({
    onClick,
    disabled = false,
    customText = "BAS!",
    customColor,
    isFirstTurn = false,
    className = "",
  }) => {
    const baseColor = customColor || "bg-blue-600 hover:bg-blue-500";

    const pulseEffect = !disabled
      ? "animate-pulse shadow-[0_0_20px_rgba(255,255,255,0.4)]"
      : "";

    return (
      <div className="relative group touch-manipulation">
        {isFirstTurn && !disabled && (
          <div className="absolute inset-0 rounded-2xl animate-pulse-ring pointer-events-none border-2 border-white/50"></div>
        )}

        <button
          onClick={onClick}
          disabled={disabled}
          aria-label={customText}
          className={`
            relative z-10
            min-w-40 md:min-w-[220px]
            px-8 py-6 md:px-10 md:py-8
            text-2xl md:text-3xl font-black tracking-widest text-white uppercase italic
            rounded-2xl transition-all duration-150 transform
            focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50
            active:scale-95
            ${
              disabled
                ? "bg-neutral-800 text-neutral-600 cursor-not-allowed border border-neutral-700 translate-y-1"
                : `${baseColor} cursor-pointer shadow-[0_8px_0_rgba(0,0,0,0.4)] active:shadow-none active:translate-y-2 hover:-translate-y-1 ${pulseEffect}`
            }
            ${className} 
          `}
        >
          <span className="drop-shadow-md">{customText}</span>
        </button>
      </div>
    );
  }
);

ActionButton.displayName = "ActionButton";
export default ActionButton;
