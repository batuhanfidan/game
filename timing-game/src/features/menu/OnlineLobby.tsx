import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Copy,
  Loader2,
  ArrowLeft,
  Globe,
  Lock,
  Settings2,
  CheckCircle,
  Search,
  Plus,
  Hash,
  RefreshCw,
  LogOut,
  UserX,
  Users,
  Play,
  Zap,
  ArrowRight,
} from "lucide-react";
import { roomService, type GameRoom } from "../../services/roomService";
import { secureStorage } from "../../shared/utils/secureStorage";
import { VARIANTS } from "../../shared/constants/game";
import VariantIcon from "../../components/game/VariantIcon";
import toast from "react-hot-toast";

const OnlineLobby = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- KULLANICI BİLGİSİ ---
  const myUid =
    secureStorage.getItem("timing_game_uid") || "anon_" + Date.now();
  const myName = secureStorage.getItem("timing_game_username") || "Misafir";

  const initialRoomId = location.state?.roomId || "";
  const initialView = initialRoomId ? "lobby" : "browser";

  // State
  const [view, setView] = useState<"browser" | "lobby">(initialView);
  const [roomId, setRoomId] = useState(initialRoomId);

  // Manuel çıkış yapıldığını takip eden ref
  const isLeavingRef = useRef(false);

  useEffect(() => {
    if (location.state?.roomId) {
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.roomId]);

  const [publicRooms, setPublicRooms] = useState<GameRoom[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinCodeModal, setShowJoinCodeModal] = useState(false);

  const [roomData, setRoomData] = useState<GameRoom | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [createForm, setCreateForm] = useState({
    roomName: `${myName}'in Odası`,
    isPublic: true,
  });
  const [joinCode, setJoinCode] = useState("");

  // --- LİSTENERS ---

  // 1. ODA LİSTESİ
  useEffect(() => {
    if (view === "browser") {
      setLoadingList(true);
      const unsubscribe = roomService.listenToPublicRooms((rooms) => {
        setPublicRooms(rooms);
        setLoadingList(false);
      });
      return () => unsubscribe();
    }
  }, [view]);

  // 2. ODA İÇİ
  useEffect(() => {
    if (view === "lobby" && roomId) {
      // Odaya girince çıkış flagini sıfırla
      isLeavingRef.current = false;

      const unsubscribe = roomService.subscribeToRoom(roomId, (data) => {
        if (isLeavingRef.current) return;

        if (!data) {
          toast.error("Oda kapatıldı.", { id: "room-closed" });
          setRoomId("");
          setRoomData(null);
          setView("browser");
          return;
        }
        setRoomData(data);

        const imHost = data.meta.hostUid === myUid;
        const imGuest = data.players.p2?.uid === myUid;
        const imSpectator = data.spectators && data.spectators[myUid];

        if (!imHost && !imGuest && !imSpectator) {
          toast.error("Odadan atıldınız!", { id: "kicked-user" });
          setRoomId("");
          setRoomData(null);
          setView("browser");
          return;
        }

        if (data.meta.status === "playing") {
          navigate(`/game/online/${roomId}`);
        }
      });
      return () => unsubscribe();
    }
  }, [view, roomId, navigate, myUid]);

  // --- ACTIONS ---

  const handleCreateRoom = async () => {
    if (!createForm.roomName.trim()) return;
    setActionLoading(true);
    try {
      const code = await roomService.createRoom(
        { uid: myUid, username: myName },
        { roomName: createForm.roomName, isPublic: createForm.isPublic }
      );
      setRoomId(code);
      setView("lobby");
      setShowCreateModal(false);
    } catch {
      toast.error("Hata: Oda oluşturulamadı.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinRoom = async (codeToJoin: string) => {
    if (!codeToJoin) return;
    setActionLoading(true);
    try {
      const result = await roomService.joinRoom(codeToJoin.toUpperCase(), {
        uid: myUid,
        username: myName,
      });
      if (result.success) {
        setRoomId(codeToJoin.toUpperCase());
        setView("lobby");
        setShowJoinCodeModal(false);
      } else {
        alert(result.message);
      }
    } catch {
      toast.error("Bağlantı hatası.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveRoom = useCallback(
    (notifyServer = true) => {
      // 1. Dinleyiciyi kör et
      isLeavingRef.current = true;

      const currentRoomId = roomId;
      const currentIsHost = roomData?.meta.hostUid === myUid;

      // 2. UI'ı ANINDA güncelle (Bekleme yok)
      setRoomId("");
      setRoomData(null);
      setView("browser");

      // 3. Sunucu işlemini arkada yap
      if (notifyServer && currentRoomId) {
        roomService
          .leaveRoom(currentRoomId, myUid, currentIsHost)
          .catch((err) => {
            console.error("Çıkış hatası:", err);
          });
      }
    },
    [roomId, roomData, myUid]
  );

  const handleKickGuest = async () => {
    if (roomId && confirm("Oyuncuyu atmak istiyor musun?")) {
      await roomService.kickGuest(roomId);
    }
  };

  const handleStartGame = async () => {
    if (roomId) await roomService.startGame(roomId);
  };

  const updateSettings = async (
    key: string,
    value: string | number | boolean
  ) => {
    if (roomId && roomData?.meta.hostUid === myUid) {
      await roomService.updateSettings(roomId, { [key]: value });
    }
  };

  const toggleReady = async () => {
    if (roomId && roomData?.players.p2?.uid === myUid) {
      await roomService.toggleReady(roomId, "p2", !roomData.players.p2.isReady);
    }
  };

  const filteredRooms = useMemo(() => {
    return publicRooms.filter(
      (r) =>
        r.meta.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [publicRooms, searchQuery]);

  const isHost = roomData?.meta.hostUid === myUid;
  const isGuest = roomData?.players.p2?.uid === myUid;

  useEffect(() => {
    if (roomData && roomData.meta.hostUid === myUid) {
      if (roomData.meta.status === "playing" && !roomData.players.p2) {
        toast("Rakip kaçtı! Oyun sonlandırılıyor.");
        handleLeaveRoom(true);
      }
    }
  }, [handleLeaveRoom, myUid, roomData]);

  // RENDER
  const Background = () => (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div className="absolute inset-0 bg-[#0a0a0a]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[32px_32px] mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
    </div>
  );

  if (view === "lobby" && roomData) {
    return (
      <div className="min-h-screen w-screen font-mono flex flex-col items-center justify-center p-4 text-gray-200 relative">
        <Background />
        <div className="w-full max-w-3xl bg-[#151515] border border-white/10 rounded-xl shadow-2xl overflow-hidden relative z-10 animate-fade-in">
          {/* Lobi Header */}
          <div className="bg-[#1a1a1a] px-6 py-4 flex justify-between items-center border-b border-white/5">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {roomData.meta.roomName}
                <span
                  className={`text-[10px] px-2 py-0.5 rounded border font-bold ${
                    roomData.meta.isPublic
                      ? "border-green-800 text-green-500 bg-green-900/10"
                      : "border-red-800 text-red-500 bg-red-900/10"
                  }`}
                >
                  {roomData.meta.isPublic ? "PUBLIC" : "PRIVATE"}
                </span>
              </h2>
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 font-bold">
                <span>
                  ID:{" "}
                  <span className="text-gray-300 font-bold select-all">
                    {roomData.id}
                  </span>
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(roomData.id)}
                  className="hover:text-white"
                >
                  <Copy size={12} />
                </button>
              </div>
            </div>
            <button
              onClick={() => handleLeaveRoom(true)}
              className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 hover:bg-red-500/10 px-3 py-1.5 rounded transition-colors"
            >
              <LogOut size={14} /> AYRIL
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SOL: OYUNCULAR */}
            <div className="space-y-3">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Users size={12} /> OYUNCULAR
              </div>

              {/* P1 */}
              <div className="bg-[#222] p-3 rounded border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-700 rounded flex items-center justify-center font-bold text-white text-sm">
                    1
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">
                      {roomData.players.p1.username}
                    </div>
                    <div className="text-[9px] text-blue-400 font-bold">
                      HOST
                    </div>
                  </div>
                </div>
                <CheckCircle size={16} className="text-blue-500" />
              </div>

              {/* P2 */}
              <div
                className={`p-3 rounded border flex items-center justify-between ${
                  roomData.players.p2
                    ? "bg-[#222] border-white/5"
                    : "bg-[#1a1a1a] border-white/5 border-dashed"
                }`}
              >
                {roomData.players.p2 ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-700 rounded flex items-center justify-center font-bold text-white text-sm">
                        2
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">
                          {roomData.players.p2.username}
                        </div>
                        <div className="text-[9px] text-red-400 font-bold">
                          MİSAFİR
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isHost && (
                        <button
                          onClick={handleKickGuest}
                          className="text-gray-600 hover:text-red-500 transition-colors"
                          title="At"
                        >
                          <UserX size={16} />
                        </button>
                      )}
                      {roomData.players.p2.isReady ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : (
                        <Loader2
                          size={16}
                          className="text-gray-600 animate-spin"
                        />
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-gray-600 font-bold w-full text-center py-1">
                    RAKİP BEKLENİYOR...
                  </div>
                )}
              </div>

              {/* ACTION BUTTON */}
              <div className="mt-6">
                {isHost ? (
                  <button
                    onClick={handleStartGame}
                    disabled={
                      !roomData.players.p2 || !roomData.players.p2.isReady
                    }
                    className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 disabled:bg-[#333] disabled:text-gray-600 text-black font-bold rounded shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    {roomData.players.p2 ? (
                      roomData.players.p2.isReady ? (
                        <>
                          BAŞLAT <Zap size={16} fill="black" />
                        </>
                      ) : (
                        "HAZIRLIK BEKLENİYOR"
                      )
                    ) : (
                      "BEKLENİYOR"
                    )}
                  </button>
                ) : isGuest ? (
                  <button
                    onClick={toggleReady}
                    className={`w-full py-3 font-bold rounded shadow-lg transition-all flex items-center justify-center gap-2 text-sm ${
                      roomData.players.p2?.isReady
                        ? "bg-green-600 hover:bg-green-500 text-white"
                        : "bg-[#333] text-gray-400 hover:bg-[#444]"
                    }`}
                  >
                    {roomData.players.p2?.isReady ? "HAZIRSIN" : "HAZIR OL"}
                  </button>
                ) : (
                  <div className="w-full py-3 bg-[#222] text-gray-500 text-center text-xs font-bold rounded">
                    İZLEYİCİ MODU
                  </div>
                )}
              </div>
            </div>

            {/* SAĞ: AYARLAR */}
            <div className="space-y-4">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Settings2 size={12} /> AYARLAR
              </div>

              {/* Modlar */}
              <div className="bg-[#222] border border-white/5 rounded overflow-hidden">
                {VARIANTS.map((v) => (
                  <button
                    key={v.key}
                    disabled={!isHost}
                    onClick={() => updateSettings("variant", v.key)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-bold border-b border-white/5 last:border-0 hover:bg-[#2a2a2a] transition-colors ${
                      roomData.settings.variant === v.key
                        ? "text-blue-400 bg-blue-900/10"
                        : "text-gray-500"
                    } ${!isHost && "cursor-default"}`}
                  >
                    <VariantIcon variant={v.key} size={14} />
                    {v.key.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Süre */}
              <div className="flex bg-[#222] p-1 rounded border border-white/5">
                {[60, 180, 300].map((d) => (
                  <button
                    key={d}
                    disabled={!isHost}
                    onClick={() => updateSettings("duration", d)}
                    className={`flex-1 py-1 text-[10px] font-bold rounded transition-colors ${
                      roomData.settings.duration === d
                        ? "bg-gray-600 text-white"
                        : "text-gray-500 hover:text-gray-300"
                    } ${!isHost && "cursor-default"}`}
                  >
                    {d / 60} DK
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. BROWSER
  return (
    <div className="min-h-screen w-screen font-mono flex flex-col items-center justify-center p-4 text-gray-200">
      <Background />
      <div className="w-full max-w-4xl bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col h-[600px] overflow-hidden relative z-10 animate-fade-in">
        {/* ÜST BAR */}
        <div className="bg-white/5 p-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-black text-white flex items-center gap-2 tracking-tight">
              <Globe size={18} className="text-blue-500" /> ONLINE ARENA
            </h1>
            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold tracking-wider">
              {publicRooms.length} ODA
            </span>
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-md ml-auto">
            <div className="flex-1 relative group">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors"
              />
              <input
                type="text"
                placeholder="Oda Ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 text-gray-300 text-xs font-bold py-2.5 pl-9 pr-3 rounded-lg focus:border-blue-500/50 focus:bg-black/60 focus:outline-none transition-all"
              />
            </div>
            <button
              onClick={() => {}}
              className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg transition-colors"
              title="Yenile"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* ORTA: İÇERİK */}
        <div className="flex flex-1 overflow-hidden">
          {/* SOL: ODA LİSTESİ */}
          <div className="flex-1 flex flex-col border-r border-white/5 bg-[#0a0a0a]/50">
            <div className="flex items-center px-5 py-3 bg-white/5 border-b border-white/5 text-[10px] font-black text-gray-600 uppercase tracking-widest">
              <div className="flex-1">ODA DETAYLARI</div>
              <div className="w-24 text-center hidden sm:block">MOD</div>
              <div className="w-24 text-right">DURUM</div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {loadingList ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-3">
                  <Loader2 className="animate-spin text-blue-500" size={24} />
                  <span className="text-xs font-bold tracking-widest">
                    TARANIYOR...
                  </span>
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-700 gap-2 opacity-50">
                  <Search size={40} />
                  <span className="text-xs font-bold tracking-widest">
                    AÇIK ODA YOK
                  </span>
                </div>
              ) : (
                filteredRooms.map((room) => {
                  const isFull = !!room.players.p2;
                  const isPlaying = room.meta.status === "playing";
                  return (
                    <div
                      key={room.id}
                      className="group flex items-center px-5 py-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-default"
                    >
                      <div className="flex-1 pr-2">
                        <div className="text-sm font-bold text-gray-300 group-hover:text-white truncate transition-colors">
                          {room.meta.roomName}
                        </div>
                        <div className="text-[10px] text-gray-600 font-bold flex items-center gap-1.5 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50"></span>
                          {room.meta.hostName}
                        </div>
                      </div>
                      <div className="w-24 text-center text-[10px] text-gray-500 font-black uppercase tracking-wider hidden sm:block">
                        {room.settings.variant}
                      </div>
                      <div className="w-24 flex justify-end">
                        {isPlaying ? (
                          <span className="text-[10px] font-black text-yellow-600 bg-yellow-900/10 px-2 py-1 rounded border border-yellow-600/20 flex items-center gap-1">
                            <Play size={8} fill="currentColor" /> OYUNDA
                          </span>
                        ) : isFull ? (
                          <span className="text-[10px] font-black text-red-500 bg-red-900/10 px-2 py-1 rounded border border-red-500/20">
                            DOLU
                          </span>
                        ) : (
                          <button
                            onClick={() => handleJoinRoom(room.id)}
                            className="px-3 py-1.5 bg-white/5 hover:bg-blue-600 hover:text-white text-gray-300 border border-white/10 hover:border-blue-500 text-[10px] font-black rounded flex items-center gap-1 transition-all active:scale-95"
                          >
                            KATIL <ArrowRight size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* SAĞ: AKSİYON PANELİ */}
          <div className="w-56 bg-[#111]/80 p-5 flex flex-col gap-3 border-l border-white/5">
            <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">
              HIZLI İŞLEM
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Plus size={14} strokeWidth={3} /> ODA KUR
            </button>
            <button
              onClick={() => setShowJoinCodeModal(true)}
              className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 border border-white/10 transition-all"
            >
              <Hash size={14} /> KODLA GİR
            </button>

            <div className="mt-auto pt-4 border-t border-white/5 text-center">
              <div className="text-[10px] text-gray-600 font-bold mb-1">
                OTURUM
              </div>
              <div className="text-xs text-gray-300 font-bold truncate bg-black/30 py-1.5 px-2 rounded border border-white/5">
                {myName}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-[#111] border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <Settings2 className="text-blue-500" size={20} /> YENİ ODA
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-500 block mb-1.5 ml-1 tracking-widest">
                  ODA İSMİ
                </label>
                <input
                  autoFocus
                  type="text"
                  value={createForm.roomName}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, roomName: e.target.value })
                  }
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white font-bold outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-700"
                  maxLength={20}
                />
              </div>

              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={createForm.isPublic}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, isPublic: e.target.checked })
                  }
                  className="w-4 h-4 accent-blue-500 cursor-pointer"
                />
                <label
                  htmlFor="isPublic"
                  className="flex-1 cursor-pointer select-none"
                >
                  <div className="text-xs font-bold text-gray-200">
                    Listede Göster
                  </div>
                  <div className="text-[9px] text-gray-500 font-bold">
                    Herkese açık oda oluşturur
                  </div>
                </label>
                {createForm.isPublic ? (
                  <Globe size={16} className="text-green-500" />
                ) : (
                  <Lock size={16} className="text-red-500" />
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-black rounded-xl transition-colors"
                >
                  İPTAL
                </button>
                <button
                  onClick={handleCreateRoom}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    "OLUŞTUR"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showJoinCodeModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowJoinCodeModal(false)}
        >
          <div
            className="bg-[#111] border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-4 border border-white/5">
              <Hash size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-black text-white mb-1">
              KOD İLE KATIL
            </h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-6">
              Arkadaşının verdiği kodu gir
            </p>

            <input
              autoFocus
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-center text-2xl font-black font-mono text-white focus:border-blue-500/50 outline-none transition-all uppercase mb-6 placeholder:text-gray-800 tracking-widest"
              placeholder="CODE"
              maxLength={6}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinCodeModal(false)}
                className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-black rounded-xl transition-colors"
              >
                İPTAL
              </button>
              <button
                onClick={() => handleJoinRoom(joinCode)}
                disabled={actionLoading || joinCode.length < 6}
                className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20 disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  "KATIL"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnlineLobby;
