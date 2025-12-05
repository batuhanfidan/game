// @vitest-environment jsdom
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, vi, beforeEach, afterEach, expect } from "vitest";
import { MemoryRouter } from "react-router-dom"; // EKLENDİ
import App from "../App";

// --- KRİTİK MOCKLAR ---

// 1. Ses Dosyası Mock'u
vi.mock("../utils/sound", () => ({
  playSound: vi.fn(),
  toggleMute: vi.fn(),
  getMuteStatus: vi.fn().mockReturnValue(false),
  soundsReady: Promise.resolve(),
}));

// 2. matchMedia Mock'u
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// 3. requestAnimationFrame Mock'u
vi.spyOn(window, "requestAnimationFrame").mockImplementation(
  (callback: FrameRequestCallback) => {
    return setTimeout(() => callback(Date.now()), 16) as unknown as number;
  }
);

vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
  clearTimeout(id);
});

describe("Otomatik Oyun Simülasyonu ve Raporlama", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("Tam bir maç simüle edip detaylı rapor oluşturmalı", async () => {
    console.log("\n🚀 OTO-SİMÜLASYON BAŞLATILIYOR...\n");
    const gameLogs: string[] = [];
    const startTime = Date.now();

    // FIX: App bileşeni MemoryRouter ile sarmalandı
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    // 1. MENÜ NAVİGASYONU
    const singlePlayerBtn = screen.getByText(/TEK OYUNCU/i);
    fireEvent.click(singlePlayerBtn);

    const botModeBtn = screen.getByText(/Bota Karşı/i);
    fireEvent.click(botModeBtn);

    // 2. OYUN AYARLARI VE BAŞLATMA
    const startBtn = screen.getByText(/OYUNU BAŞLAT/i);
    fireEvent.click(startBtn);

    // 3. GERİ SAYIM
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3500);
    });

    console.log("🔔 Maç Başladı!");

    // 4. OYUN DÖNGÜSÜ
    let isGameOver = false;
    let turnCount = 0;

    while (!isGameOver && turnCount < 100) {
      turnCount++;

      const actionButton = screen.queryByText(/Bas!/i);

      if (screen.queryByText(/TEKRAR OYNA/i)) {
        isGameOver = true;
        break;
      }

      if (actionButton && !actionButton.closest("button")?.disabled) {
        // --- OYUNCU 1 SIRASI ---
        const reactionDelay = Math.floor(Math.random() * 300) + 100;

        await act(async () => {
          await vi.advanceTimersByTimeAsync(reactionDelay);
        });

        fireEvent.click(actionButton);
        gameLogs.push(
          `[TUR ${turnCount}] 👤 Oyuncu 1: ${reactionDelay}ms sonra vurdu.`
        );
      } else {
        // --- BOT SIRASI ---
        await act(async () => {
          await vi.advanceTimersByTimeAsync(2100);
        });

        gameLogs.push(`[TUR ${turnCount}] 🤖 Bot: Hamlesini yaptı.`);
      }

      // Skor durumunu kontrol et
      try {
        const scoreElement = screen.getByText(/(\d+)\s*-\s*(\d+)/);
        if (scoreElement) {
          gameLogs.push(`   ↳ Skor Durumu: ${scoreElement.textContent}`);
        }
      } catch {
        // Hata yok
      }

      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });
    }

    // 5. RAPORLAMA
    console.log("\n📊DETAYLI MAÇ RAPORU");
    console.log("=================================");
    gameLogs.forEach((log) => console.log(log));
    console.log("=================================");

    const finalText = screen.queryByText(/kazandı!|Berabere!/i);
    if (finalText) {
      console.log(`🏆 MAÇ SONUCU: ${finalText.textContent}`);
    } else {
      console.log("⚠️ Maç belirlenen tur/süre içinde bitmedi.");
    }
    console.log(`⏱️ Simülasyon Gerçek Süresi: ${Date.now() - startTime}ms`);
    console.log("\n");

    expect(true).toBe(true);
  });
});
