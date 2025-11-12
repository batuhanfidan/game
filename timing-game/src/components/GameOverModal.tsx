interface GameOverModalProps {
  winner: string;
  finalScore: string;
  onRestart: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ winner, finalScore, onRestart }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4">
      <div className="bg-white p-6 sm:p-8 rounded-2xl text-center max-w-sm w-full shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800">
          🎮 Oyun Sona Erdi!
        </h2>
        <p className="text-lg sm:text-xl mb-2 font-semibold text-gray-700">
          {winner}
        </p>
        <p className="text-base sm:text-lg mb-6 text-gray-600">
          {finalScore}
        </p>
        <button
          onClick={onRestart}
          className="bg-blue-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl hover:bg-blue-700 transition font-bold text-base sm:text-lg"
        >
          🔄 Tekrar Oyna
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;
