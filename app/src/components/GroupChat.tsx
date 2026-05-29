"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { collection, onSnapshot, orderBy, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { sendMessageAction, type ChatMessage } from "@/app/groups/[id]/actions";
import { ProfileAvatar } from "./ProfileAvatar";

interface Props {
  groupId: string;
  currentUserId: string;
  initialMessages: ChatMessage[];
}

export function GroupChat({ groupId, currentUserId, initialMessages }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages ?? []);
  const [input, setInput]       = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Suscripción en tiempo real con onSnapshot
  useEffect(() => {
    const q = query(
      collection(db, "groups", groupId, "messages"),
      orderBy("createdAt", "asc"),
      limit(100),
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ChatMessage, "id">) })),
      );
    });
    return unsub;
  }, [groupId]);

  // Scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input;
    setInput("");
    startTransition(() => sendMessageAction(groupId, text));
  }

  return (
    <div className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <div className="border-b border-[var(--border)] px-4 py-3">
        <p className="font-semibold text-sm">💬 Chat del grupo</p>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto px-4 py-3" style={{ minHeight: 260, maxHeight: 400 }}>
        {messages.length === 0 && (
          <p className="text-center text-sm text-[var(--muted)] mt-8">
            Aún no hay mensajes. ¡Sé el primero! 👋
          </p>
        )}
        {messages.map((msg) => {
          const isMe = msg.userId === currentUserId;
          return (
            <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
              <ProfileAvatar
                avatarUrl={msg.avatarUrl ?? undefined}
                displayName={msg.displayName}
                size="sm"
                zoomable={false}
              />
              <div className={`flex flex-col gap-0.5 max-w-[75%] ${isMe ? "items-end" : ""}`}>
                <div className={`flex items-baseline gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                  <span className="text-xs font-medium">{isMe ? "Tú" : msg.displayName}</span>
                  <span className="text-[10px] text-[var(--muted)]">
                    {new Date(msg.createdAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div
                  className={`rounded-2xl px-3 py-2 text-sm ${
                    isMe
                      ? "bg-[var(--brand)] text-white rounded-tr-sm"
                      : "bg-[var(--background)] border border-[var(--border)] rounded-tl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-[var(--border)] px-3 py-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje..."
          maxLength={500}
          disabled={isPending}
          className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isPending || !input.trim()}
          className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-strong)] disabled:opacity-40 transition-opacity"
        >
          {isPending ? "…" : "Enviar"}
        </button>
      </form>
    </div>
  );
}
