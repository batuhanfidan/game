interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-8 py-4 text-xl rounded-xl font-bold text-white transition ${
        disabled ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
      }`}
    >
      Bas!
    </button>
  );
};

export default ActionButton;
