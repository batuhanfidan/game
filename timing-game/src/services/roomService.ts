import { rtdb } from "../firebase";
import {
  ref,
  set,
  get,
  update,
  onValue,
  off,
  remove,
  query,
  orderByChild,
  equalTo,
  serverTimestamp,
  onDisconnect,
} from "firebase/database";

const generateRoomCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export interface RoomPlayer {
  uid: string;
  username: string;
  isReady: boolean;
  score: number;
}

export interface GameRoom {
  id: string;
  meta: {
    roomName: string;
    hostName: string;
    hostUid: string;
    isPublic: boolean;
    status: "waiting" | "playing" | "finished";
    spectatorCount: number;
  };
  settings: {
    variant: "classic" | "ghost" | "unstable" | "random" | "moving";
    duration: number;
    showProgressBar: boolean;
  };
  players: {
    p1: RoomPlayer;
    p2: RoomPlayer | null;
  };
  spectators?: Record<string, { name: string }>;
  createdAt: number;
}

export const roomService = {
  createRoom: async (
    player: { uid: string; username: string },
    options: { roomName: string; isPublic: boolean }
  ): Promise<string> => {
    const roomId = generateRoomCode();
    const roomRef = ref(rtdb, `rooms/${roomId}`);

    const initialData: GameRoom = {
      id: roomId,
      meta: {
        roomName: options.roomName || `${player.username}'in Odası`,
        hostName: player.username,
        hostUid: player.uid,
        isPublic: options.isPublic,
        status: "waiting",
        spectatorCount: 0,
      },
      settings: {
        variant: "classic",
        duration: 180,
        showProgressBar: true,
      },
      players: {
        p1: { ...player, isReady: false, score: 0 },
        p2: null,
      },
      createdAt: Date.now(),
    };

    await set(roomRef, initialData);
    return roomId;
  },

  joinRoom: async (
    roomId: string,
    player: { uid: string; username: string }
  ): Promise<{ success: boolean; message?: string }> => {
    const roomRef = ref(rtdb, `rooms/${roomId}`);
    const snapshot = await get(roomRef);

    if (!snapshot.exists()) {
      return { success: false, message: "Oda bulunamadı." };
    }

    const roomData = snapshot.val() as GameRoom;

    // Zaten odada mıyım? (Host veya P2)
    if (
      roomData.players.p1.uid === player.uid ||
      roomData.players.p2?.uid === player.uid
    ) {
      return { success: true };
    }

    // P2 Boş ise -> OYUNCU OLARAK GİR
    if (!roomData.players.p2) {
      await update(roomRef, {
        "players/p2": { ...player, isReady: false, score: 0 },
      });
      return { success: true };
    }

    // P2 Dolu ise -> İZLEYİCİ OLARAK GİR
    const spectators = roomData.spectators || {};
    if (Object.keys(spectators).length >= 5) {
      return { success: false, message: "Oda ve izleyici kapasitesi dolu!" };
    }

    // İzleyici listesine ekle
    await set(ref(rtdb, `rooms/${roomId}/spectators/${player.uid}`), {
      name: player.username,
    });

    return { success: true, message: "İzleyici olarak katıldınız." };
  },

  leaveRoom: async (roomId: string, uid: string, isHost: boolean) => {
    const roomRef = ref(rtdb, `rooms/${roomId}`);

    if (isHost) {
      await remove(roomRef);
      await remove(ref(rtdb, `games/${roomId}`));
    } else {
      const snapshot = await get(roomRef);
      if (!snapshot.exists()) return;
      const data = snapshot.val() as GameRoom;

      if (data.players.p2?.uid === uid) {
        // Misafir ise P2'yi boşalt
        await update(roomRef, {
          "players/p2": null,
          "meta/status": "waiting",
        });
      } else {
        // İzleyici ise listeden sil
        await remove(ref(rtdb, `rooms/${roomId}/spectators/${uid}`));
      }
    }
  },

  kickGuest: async (roomId: string) => {
    const p2Ref = ref(rtdb, `rooms/${roomId}/players/p2`);
    await set(p2Ref, null);
  },

  updateSettings: async (
    roomId: string,
    settings: Partial<GameRoom["settings"]>
  ) => {
    const settingsRef = ref(rtdb, `rooms/${roomId}/settings`);
    await update(settingsRef, settings);
  },

  subscribeToRoom: (
    roomId: string,
    callback: (data: GameRoom | null) => void
  ) => {
    const roomRef = ref(rtdb, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      callback(snapshot.val());
    });
    return () => off(roomRef, "value", unsubscribe);
  },

  listenToPublicRooms: (callback: (rooms: GameRoom[]) => void) => {
    const roomsRef = ref(rtdb, "rooms");
    const publicRoomsQuery = query(
      roomsRef,
      orderByChild("meta/isPublic"),
      equalTo(true)
    );

    const unsubscribe = onValue(publicRoomsQuery, (snapshot) => {
      const rooms: GameRoom[] = [];
      snapshot.forEach((child) => {
        const room = child.val();
        if (room && room.players) rooms.push(room);
      });
      callback(rooms.reverse());
    });

    return () => off(publicRoomsQuery, "value", unsubscribe);
  },

  startGame: async (roomId: string, durationMinutes: number = 3) => {
    // Varsayılan 3dk
    const roomRef = ref(rtdb, `rooms/${roomId}/meta`);
    await update(roomRef, { status: "playing" });

    const totalSeconds = durationMinutes * 60;
    const now = serverTimestamp();

    const gameRef = ref(rtdb, `games/${roomId}`);
    await update(gameRef, {
      status: "playing",
      scores: { p1: 0, p2: 0 },
      currentTurn: "p1",
      roundStartTime: now,
      turnStartTime: now,
      roundSeed: Math.floor(Math.random() * 1000),
      isPaused: false,
      totalPaused: 0,
      rematchRequested: false,
      timeRemaining: {
        p1: totalSeconds,
        p2: totalSeconds,
      },
      gameStartTime: serverTimestamp(),
    });
  },

  toggleReady: async (roomId: string, role: "p1" | "p2", isReady: boolean) => {
    const playerRef = ref(rtdb, `rooms/${roomId}/players/${role}/isReady`);
    await set(playerRef, isReady);
  },

  // --- DÜZELTME BURADA ---
  resetGame: async (roomId: string) => {
    // 1. Oyun durumunu "waiting" yap
    //  OnlineGameMode'daki useEffect tetiklenir ve lobiye atar.
    const gameRef = ref(rtdb, `games/${roomId}`);
    await update(gameRef, {
      timeRemaining: { p1: 180, p2: 180 },
      status: "waiting",
      scores: { p1: 0, p2: 0 },
      currentTurn: "p1",
      roundStartTime: null,
      turnStartTime: null,
      lastAction: null,
      isPaused: false,
      totalPaused: 0,
      rematchRequested: false,
    });

    // 2. Oda durumunu 'waiting' yap ve oyuncuları 'not ready' yap
    const roomRef = ref(rtdb, `rooms/${roomId}`);
    await update(roomRef, {
      "meta/status": "waiting",
      "players/p1/isReady": false,
      "players/p2/isReady": false,
    });
  },

  toggleGamePause: async (roomId: string, isPaused: boolean) => {
    const gameRef = ref(rtdb, `games/${roomId}`);
    const snapshot = await get(gameRef);
    if (!snapshot.exists()) return;

    const data = snapshot.val();

    const updates: {
      isPaused: boolean;
      pausedAt?: object | null;
      totalPaused?: number;
    } = { isPaused };

    if (isPaused) {
      updates.pausedAt = serverTimestamp();
    } else {
      updates.pausedAt = null;
      const pausedAt = data.pausedAt || Date.now();
      const diff = Date.now() - pausedAt;
      const currentTotal = data.totalPaused || 0;
      updates.totalPaused = currentTotal + diff;
    }

    await update(gameRef, updates);
  },

  requestRematch: async (roomId: string) => {
    const gameRef = ref(rtdb, `games/${roomId}`);
    await update(gameRef, { rematchRequested: true });
  },

  // --- GÜVENLİK ---
  setupDisconnectHandlers: (roomId: string, uid: string, isHost: boolean) => {
    const roomRef = ref(rtdb, `rooms/${roomId}`);
    const gameRef = ref(rtdb, `games/${roomId}`);

    if (isHost) {
      onDisconnect(roomRef).remove();
      onDisconnect(gameRef).remove();
    } else {
      const p2Ref = ref(rtdb, `rooms/${roomId}/players/p2`);
      const statusRef = ref(rtdb, `rooms/${roomId}/meta/status`);
      const readyRef = ref(rtdb, `rooms/${roomId}/players/p2/isReady`);

      onDisconnect(p2Ref).remove();
      onDisconnect(readyRef).remove();
      onDisconnect(statusRef).set("waiting");

      const spectatorRef = ref(rtdb, `rooms/${roomId}/spectators/${uid}`);
      onDisconnect(spectatorRef).remove();
    }
  },

  cancelDisconnectHandlers: (roomId: string, isHost: boolean) => {
    const roomRef = ref(rtdb, `rooms/${roomId}`);
    if (isHost) {
      onDisconnect(roomRef).cancel();
    }
  },
};
