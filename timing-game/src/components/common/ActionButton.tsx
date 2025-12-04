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
      <div className="relative group">
        {isFirstTurn && !disabled && (
          <div className="absolute inset-0 rounded-2xl animate-pulse-ring pointer-events-none"></div>
        )}

        <button
          onClick={onClick}
          disabled={disabled}
          aria-label={customText}
          aria-disabled={disabled}
          className={`
            relative z-10
            w-full sm:w-auto min-w-40 md:min-w-[200px]
            px-8 py-5 sm:px-10 sm:py-6 md:px-12 md:py-7
            text-xl sm:text-2xl font-black tracking-widest text-white uppercase
            rounded-2xl transition-all duration-150 transform
            focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black
            optimize-gpu select-none
            ${
              disabled
                ? "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700 shadow-none translate-y-1"
                : `${baseColor} cursor-pointer shadow-[0_6px_0_rgba(0,0,0,0.3)] active:shadow-none active:translate-y-1.5 hover:-translate-y-0.5 hover:shadow-[0_8px_0_rgba(0,0,0,0.3)]`
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
