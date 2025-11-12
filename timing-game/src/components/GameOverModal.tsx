interface GameOverModalProps {
  winner: string;
  onRestart: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ winner, onRestart }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4">
      <div className="bg-white p-6 sm:p-8 rounded-xl text-center max-w-sm w-full">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">🏆 Oyun Bitti!</h2>
        <p className="text-lg sm:text-xl mb-6">{winner} kazandı!</p>
        <button
          onClick={onRestart}
          className="bg-green-600 text-white px-5 py-2 sm:px-6 sm:py-3 rounded-lg hover:bg-green-700 text-base sm:text-lg"
        >
          Tekrar Oyna
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;
