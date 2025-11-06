interface GameOverModalProps {
  winner: string;
  onRestart: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ winner, onRestart }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl text-center">
        <h2 className="text-2xl font-bold mb-4">🏆 Oyun Bitti!</h2>
        <p className="text-xl mb-6">{winner} kazandı!</p>
        <button
          onClick={onRestart}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          Tekrar Oyna
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;
