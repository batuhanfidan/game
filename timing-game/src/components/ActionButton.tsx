interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-4 text-base sm:text-lg md:text-xl rounded-xl font-bold text-white transition ${
        disabled ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
      }`}
    >
      Bas!
    </button>
  );
};

export default ActionButton;
