import React from "react";

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  customText?: string; // EKLENDİ: Penaltı modu için gerekli
  customColor?: string; // EKLENDİ: Özelleştirme için gerekli
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  disabled = false,
  customText = "Bas!",
  customColor,
}) => {
  // Eğer özel renk gelirse onu kullan, yoksa varsayılanı kullan
  const baseColor = customColor || "bg-blue-600 hover:bg-blue-700";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-8 py-6 sm:px-12 sm:py-8 md:px-12 md:py-6 
        text-base sm:text-lg md:text-xl rounded-xl font-bold text-white transition transform active:scale-95
        ${
          disabled
            ? "bg-gray-600 cursor-not-allowed opacity-50"
            : `${baseColor} cursor-pointer shadow-lg hover:shadow-xl`
        }
      `}
    >
      {customText}
    </button>
  );
};

export default ActionButton;
