import React, { useState, useEffect, useRef } from "react";
import { Send, X, MessageSquare } from "lucide-react";
import { roomService, type ChatMessage } from "../../services/roomService";
import { secureStorage } from "../../shared/utils/secureStorage";

interface ChatBoxProps {
  roomId: string;
  variant: "lobby" | "ingame";
  isOpen?: boolean;
  onClose?: () => void;
  onNewMessage?: () => void; // YENİ: Bildirim için callback
}

const ChatBox: React.FC<ChatBoxProps> = ({
  roomId,
  variant,
  isOpen,
  onClose,
  onNewMessage,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mesaj sayısını takip etmek için ref (useEffect dependency loop'a girmemek için)
  const prevMessageCountRef = useRef(0);

  const myUid = secureStorage.getItem("timing_game_uid");
  const myName = secureStorage.getItem("timing_game_username") || "Ben";

  // Mesajları Dinle
  useEffect(() => {
    if (!roomId) return;
    const unsubscribe = roomService.subscribeToChat(roomId, (data) => {
      setMessages(data);
    });
    return () => unsubscribe();
  }, [roomId]);

  // Bildirim ve Scroll Mantığı
  useEffect(() => {
    // 1. Yeni mesaj var mı kontrol et
    if (messages.length > prevMessageCountRef.current) {
      // Eğer pencere kapalıysa ve yeni mesaj geldiyse ana ekrana bildir
      if (variant === "ingame" && !isOpen && onNewMessage) {
        // Kendi yazdığımız mesajda bildirim ötmesin
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.senderUid !== myUid) {
          onNewMessage();
        }
      }
      // Pencere açıksa aşağı kaydır
      if (isOpen || variant === "lobby") {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, isOpen, variant, onNewMessage, myUid]);

  // Pencere açıldığında da en aşağı kaydır
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !myUid) return;

    const textToSend = newMessage.trim();
    setNewMessage("");

    try {
      await roomService.sendMessage(
        roomId,
        { uid: myUid, username: myName },
        textToSend
      );
    } catch (error) {
      console.error("Mesaj gönderilemedi", error);
    }
  };

  // Render Logic
  if (variant === "ingame" && !isOpen) return null;

  // --- CSS DÜZENLEMELERİ ---

  // Lobi Modu (Değişmedi)
  const lobbyContainer =
    "w-full max-w-3xl bg-[#151515] border border-white/10 rounded-xl mt-4 flex flex-col h-64 shadow-2xl";

  // Oyun İçi Modu (YENİ KONUMLANDIRMA)
  // fixed inset-0 yerine -> fixed right-4 top-20 bottom-20 w-80 (Sağa yaslı dikey kutu)
  // Mobilde (sm altı) yine de biraz geniş olabilir ama sağa yaslı kalır.
  const ingameContainer =
    "fixed top-24 right-4 bottom-24 w-72 sm:w-80 z-50 animate-fade-in flex flex-col shadow-2xl";

  const containerClass = variant === "lobby" ? lobbyContainer : ingameContainer;

  // İçerik tasarımı
  const innerClass =
    variant === "lobby"
      ? "flex flex-col h-full w-full"
      : "bg-[#111]/95 backdrop-blur-md border border-white/10 flex-1 rounded-2xl flex flex-col overflow-hidden";

  const content = (
    <div className={innerClass} onClick={(e) => e.stopPropagation()}>
      {/* Header (Sadece Oyun İçi) */}
      {variant === "ingame" && (
        <div className="flex items-center justify-between p-3 border-b border-white/5 bg-[#1a1a1a]/80">
          <div className="flex items-center gap-2 font-bold text-white text-sm">
            <MessageSquare size={16} className="text-blue-500" /> SOHBET
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Mesaj Listesi */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 bg-transparent">
        {messages.length === 0 ? (
          <div className="text-center text-gray-600 text-xs italic mt-4 opacity-50">
            Sessiz...
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderUid === myUid;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  isMe ? "items-end" : "items-start"
                }`}
              >
                {!isMe && (
                  <div className="text-[9px] mb-0.5 font-bold text-gray-500 ml-1">
                    {msg.sender}
                  </div>
                )}
                <div
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium max-w-[90%] wrap-break-word ${
                    isMe
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-[#222] text-gray-200 rounded-tl-none border border-white/5"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Alanı */}
      <form
        onSubmit={handleSend}
        className="p-2 bg-[#1a1a1a]/90 border-t border-white/5 flex gap-2"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Yaz..."
          className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-colors"
          autoFocus={variant === "ingame"}
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );

  // Oyun içinde "arka planı karartma (backdrop)" özelliğini kaldırdık
  // Çünkü oyuncu oyunu görmek istiyor.
  // Sadece container'ı döndürüyoruz.
  return <div className={containerClass}>{content}</div>;
};

export default ChatBox;
