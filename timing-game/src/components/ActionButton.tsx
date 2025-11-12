interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-8 py-6 sm:px-12 sm:py-8 md:px-12 md:py-6 text-base sm:text-lg md:text-xl rounded-xl font-bold text-white transition ${
        disabled ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
      }`}
    >
      Bas!
    </button>
  );
};

export default ActionButton;
