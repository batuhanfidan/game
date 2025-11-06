interface TurnInfoProps {
  currentPlayer: string;
  turnTimeLeft: number;
}

const TurnInfo: React.FC<TurnInfoProps> = ({ currentPlayer, turnTimeLeft }) => {
  return (
    <div className="text-center mt-4 text-lg">
      <p>🕹️ Sıra: <strong>{currentPlayer}</strong></p>
      <p>Kalan süre: {turnTimeLeft}s</p>
    </div>
  );
};

export default TurnInfo;
