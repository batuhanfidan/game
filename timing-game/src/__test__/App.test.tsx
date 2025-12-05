// import { render, screen, fireEvent } from "@testing-library/react";
// import { describe, it, expect, beforeEach, vi } from "vitest";
// import App from "../App";

// vi.useFakeTimers();

// describe("Oyun Zamanlama Testi", () => {
//   beforeEach(() => {
//     vi.clearAllTimers();
//   });

//   it("butona basıldığında doğru ms değeri gösterilmeli", async () => {
//     render(<App />);

//     // Oyuncuları hazırla
//     fireEvent.click(screen.getAllByText(/Hazır/i)[0]);
//     fireEvent.click(screen.getAllByText(/Hazır/i)[1]);

//     // Geri sayımı bekle (3 saniye)
//     await vi.advanceTimersByTimeAsync(3000);

//     // 5 saniye 230 milisaniye ilerlet (5230ms)
//     // gameTime.ms = 230, 230 % 100 = 30
//     await vi.advanceTimersByTimeAsync(5230);

//     // Butona bas
//     fireEvent.click(screen.getByText("Bas!"));

//     // Ekranda (30ms) yazması lazım
//     expect(screen.getByText(/\(30ms\)/)).toBeInTheDocument();
//   });

//   it("gol atıldığında skor artmalı", async () => {
//     render(<App />);

//     // Oyuncuları hazırla
//     fireEvent.click(screen.getAllByText(/Hazır/i)[0]);
//     fireEvent.click(screen.getAllByText(/Hazır/i)[1]);

//     await vi.advanceTimersByTimeAsync(3000);

//     // 5000ms ilerlet -> 5000 % 100 = 0 -> GOL!
//     await vi.advanceTimersByTimeAsync(5000);

//     // Butona bas
//     fireEvent.click(screen.getByText("Bas!"));

//     // GOL mesajı ve (0ms) gösterilmeli
//     expect(screen.getByText(/GOL/i)).toBeInTheDocument();
//     expect(screen.getByText(/\(0ms\)/)).toBeInTheDocument();

//     // Skor 1 olmalı
//     expect(screen.getByText(/Skor: Oyuncu 1 \[1\]/)).toBeInTheDocument();
//   });

//   it("farklı ms değerleri doğru hesaplanmalı", async () => {
//     render(<App />);

//     fireEvent.click(screen.getAllByText(/Hazır/i)[0]);
//     fireEvent.click(screen.getAllByText(/Hazır/i)[1]);

//     await vi.advanceTimersByTimeAsync(3000);

//     // Test 1: 1750ms -> 750 % 100 = 50
//     await vi.advanceTimersByTimeAsync(1750);
//     fireEvent.click(screen.getByText("Bas!"));
//     expect(screen.getByText(/\(50ms\)/)).toBeInTheDocument();
//   });
// });
