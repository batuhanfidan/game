import React, { memo } from "react";

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  customText?: string;
  customColor?: string;
  isFirstTurn?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = memo(
  ({
    onClick,
    disabled = false,
    customText = "Bas!",
    customColor,
    isFirstTurn = false,
  }) => {
    const baseColor = customColor || "bg-blue-600 hover:bg-blue-500";

    return (
      <div className="relative">
        {isFirstTurn && !disabled && (
          <div className="absolute inset-0 rounded-xl animate-pulse-ring pointer-events-none"></div>
        )}

        <button
          onClick={onClick}
          disabled={disabled}
          className={`
            relative z-10
            px-8 py-6 sm:px-12 sm:py-8 md:px-16 md:py-8
            text-lg sm:text-xl md:text-2xl font-black tracking-wider text-white 
            rounded-2xl transition-all duration-150 transform
            focus:outline-none focus-visible:ring-4 focus-visible:ring-white/50
            optimize-gpu select-none
            ${
              disabled
                ? "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700 shadow-[0_4px_0_rgb(0,0,0,0.2)]"
                : `${baseColor} cursor-pointer shadow-[0_8px_0_rgb(0,0,0,0.3)] active:shadow-none active:translate-y-2 hover:brightness-110`
            }
          `}
        >
          {customText}
        </button>
      </div>
    );
  }
);

ActionButton.displayName = "ActionButton";
export default ActionButton;
