import { useNavigate } from "react-router-dom";

const MainMenu = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center bg-linear-to-br from-gray-900 to-black text-white font-mono">
      <h1 className="text-4xl md:text-6xl font-extrabold mb-10 text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-green-400 drop-shadow-lg animate-pulse">
        TIMING GAME
      </h1>
      <div className="flex flex-col gap-4 w-64">
        <button
          onClick={() => navigate("/game/2p")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-900/20 transition transform hover:scale-105 active:scale-95"
        >
          👥 2 Kişilik Oyun
        </button>
        <button
          onClick={() => navigate("/game/bot")}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-green-900/20 transition transform hover:scale-105 active:scale-95"
        >
          🤖 Bota Karşı Oyna
        </button>
      </div>
      <div className="mt-8 text-gray-500 text-sm">v0.1</div>
    </div>
  );
};
export default MainMenu;
