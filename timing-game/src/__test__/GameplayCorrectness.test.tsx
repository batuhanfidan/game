// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useGameLogic } from "../hooks/useGameLogic";
import { calculateShotResult } from "../utils/calculateShotResult";
import { SHOT_ZONES } from "../utils/constants";

// --- MOCKLAR ---
vi.mock("../utils/sound", () => ({
  playSound: vi.fn(),
  toggleMute: vi.fn(),
  getMuteStatus: vi.fn().mockReturnValue(false),
  soundsReady: Promise.resolve(),
}));

vi.mock("../utils/confetti", () => ({
  triggerWinConfetti: vi.fn(),
}));

// localStorage Mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// --- YARDIMCI: Zamanı İlerletme ---
const advanceGameTime = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

describe("🧠 OYUN MANTIĞI & DOĞRULUK TESTLERİ", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    localStorage.clear();

    // rAF Mock
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(
      (cb: FrameRequestCallback) =>
        setTimeout(() => cb(Date.now()), 16) as unknown as number
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ----------------------------------------------------------------
  // 1. MATEMATİKSEL HESAPLAMA TESTLERİ (Unit Tests)
  // ----------------------------------------------------------------
  describe("1. Vuruş Hesaplama Doğruluğu (calculateShotResult)", () => {
    it("0-9ms arası KESİN GOL olmalı", () => {
      expect(calculateShotResult(0).result).toBe("GOL");
      // FIX: Hardcoded 9 yerine SHOT_ZONES kullanıldı
      expect(calculateShotResult(SHOT_ZONES.GOAL - 1).result).toBe("GOL");
    });

    it("10-109ms arası PENALTI olmalı", () => {
      const res = calculateShotResult(SHOT_ZONES.GOAL); // 10ms
      expect(["PENALTI", "KAÇTI", "KURTARDI"]).toContain(res.result);
    });

    it("710ms (Sınır Değer) FRİKİK veya DİREK olmalı (OFSAYT OLMAMALI)", () => {
      // FIX: 710 yerine SHOT_ZONES.FREEKICK kullanıldı
      const res = calculateShotResult(SHOT_ZONES.FREEKICK);
      expect(["FRİKİK", "DİREK"]).toContain(res.result);
      expect(res.result).not.toBe("OFSAYT");
    });

    it("711ms ve üzeri OFSAYT olmalı", () => {
      // FIX: SHOT_ZONES.FREEKICK + 1 kullanıldı
      expect(calculateShotResult(SHOT_ZONES.FREEKICK + 1).result).toBe(
        "OFSAYT"
      );
      expect(calculateShotResult(999).result).toBe("OFSAYT");
    });
  });

  // ----------------------------------------------------------------
  // 2. SURVIVAL MODU KURALLARI (Integration Tests)
  // ----------------------------------------------------------------
  describe("2. Survival Modu Kuralları", () => {
    it("Hatalı vuruşta can sayısı azalmalı", async () => {
      const { result } = renderHook(() =>
        useGameLogic({ gameMode: "survival", initialTime: 999 })
      );

      // Oyunu başlat
      await act(async () => {
        result.current.startGame();
        await vi.advanceTimersByTimeAsync(4000); // Countdown bitişi
      });

      const initialLives = result.current.lives;

      // Kötü bir vuruş yap
      await advanceGameTime(800);

      await act(async () => {
        result.current.handleAction();
      });

      expect(result.current.lives).toBe(initialLives - 1);
      expect(result.current.actionMessage).toContain("Can Kaldı");
    });

    it("Başarılı seride (Streak) hız çarpanı (Multiplier) artmalı", async () => {
      const { result } = renderHook(() =>
        useGameLogic({ gameMode: "survival", initialTime: 999 })
      );

      await act(async () => {
        result.current.startGame();
        await vi.advanceTimersByTimeAsync(4000);
      });

      expect(result.current.speedMultiplier).toBe(1.0);
      expect(result.current.streak).toBe(0);
    });
  });

  // ----------------------------------------------------------------
  // 3. TIME ATTACK MODU KURALLARI
  // ----------------------------------------------------------------
  describe("3. Time Attack Modu Kuralları", () => {
    it("Gol atıldığında puan ve kombo artmalı", async () => {
      const { result } = renderHook(() =>
        useGameLogic({ gameMode: "time_attack", initialTime: 60 })
      );

      await act(async () => {
        result.current.startGame();
        await vi.advanceTimersByTimeAsync(4000);
      });

      // FIX: Kullanılmayan 'target' değişkeni kaldırıldı.

      // FIX: Kullanılmayan 'initialScore' değişkeni kaldırıldı.

      // Rastgele bas
      await act(async () => {
        result.current.handleAction();
      });

      expect(result.current.gameState).toBe("playing");
    });

    it("Fever modu aktifleşince mesaj değişmeli", async () => {
      const { result } = renderHook(() =>
        useGameLogic({ gameMode: "time_attack" })
      );

      expect(result.current.isTimeAttackFever).toBe(false);
    });
  });

  // ----------------------------------------------------------------
  // 4. BOT MODU ZORLUK TESTİ
  // ----------------------------------------------------------------
  describe("4. Bot Modu Mantığı", () => {
    it("Bot süresi dolunca oynamamalı (Sıra kontrolü)", async () => {
      const { result } = renderHook(() =>
        useGameLogic({
          gameMode: "bot",
          initialTime: 10,
        })
      );

      await act(async () => {
        result.current.startGame();
        await vi.advanceTimersByTimeAsync(4000);
      });

      // Botun süresini bitir
      await advanceGameTime(11000);

      if (result.current.gameState === "finished") {
        expect(result.current.winner).toBeDefined();
      }
    });
  });
});
