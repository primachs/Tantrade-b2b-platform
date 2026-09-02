import { useState, useEffect, useRef } from "react";
import { apiRequest } from "../../../api/client";
import { EngagementMessage } from "./types";
import { Send, X, MessageSquare } from "lucide-react";

type ChatModalProps = {
  token: string;
  sessionId: string;
  myBusinessId: string;
  otherPartyName: string;
  isOpen: boolean;
  onClose: () => void;
  disabled?: boolean;
};

export const ChatModal = ({ token, sessionId, myBusinessId, otherPartyName, isOpen, onClose, disabled }: ChatModalProps) => {
  const [messages, setMessages] = useState<EngagementMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiRequest<EngagementMessage[]>(
        `/engagement-sessions/${sessionId}/messages?business_id=${myBusinessId}`,
        { token }
      );
      setMessages(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && sessionId) {
      loadMessages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const body = draft.trim();
    if (!body || sending) return;

    setSending(true);
    setError(null);
    try {
      const message = await apiRequest<EngagementMessage>(`/engagement-sessions/${sessionId}/messages`, {
        method: "POST",
        token,
        body: { sender_business_id: myBusinessId, body },
      });
      setMessages((prev) => [...prev, message]);
      setDraft("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "480px",
          height: "600px",
          maxHeight: "90vh",
          padding: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <MessageSquare style={{ width: "18px", height: "18px", color: "#2563eb" }} />
            <h3 style={{ margin: 0, fontSize: "1rem", color: "#0f172a" }}>{otherPartyName}</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b", display: "flex" }}
          >
            <X style={{ width: "20px", height: "20px" }} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "1rem", background: "#f8fafc" }}>
          {loading ? (
            <p style={{ color: "#64748b", textAlign: "center", fontSize: "0.875rem" }}>Loading messages...</p>
          ) : messages.length === 0 ? (
            <p style={{ color: "#64748b", textAlign: "center", fontSize: "0.875rem" }}>
              No messages yet. Say hello to start the conversation.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {messages.map((msg) => {
                const isMine = msg.sender_business_id === myBusinessId;
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isMine ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "75%",
                        padding: "0.5rem 0.875rem",
                        borderRadius: "12px",
                        background: isMine ? "#2563eb" : "#ffffff",
                        color: isMine ? "#ffffff" : "#0f172a",
                        border: isMine ? "none" : "1px solid #e2e8f0",
                        fontSize: "0.875rem",
                        lineHeight: 1.5,
                        wordBreak: "break-word",
                      }}
                    >
                      {msg.body}
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "0.25rem" }}>
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {error && (
          <div style={{ padding: "0.5rem 1rem", background: "#fef2f2", color: "#991b1b", fontSize: "0.8rem" }}>
            {error}
          </div>
        )}

        <div style={{ padding: "0.75rem", borderTop: "1px solid #e2e8f0", display: "flex", gap: "0.5rem" }}>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "This engagement was rejected; messaging is closed." : "Type a message..."}
            disabled={disabled || sending}
            rows={1}
            style={{
              flex: 1,
              resize: "none",
              padding: "0.5rem 0.75rem",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              fontSize: "0.875rem",
              fontFamily: "inherit",
            }}
          />
          <button
            onClick={handleSend}
            disabled={disabled || sending || !draft.trim()}
            style={{
              padding: "0.5rem 0.875rem",
              background: disabled || !draft.trim() ? "#cbd5e1" : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: disabled || !draft.trim() ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Send style={{ width: "16px", height: "16px" }} />
          </button>
        </div>
      </div>
    </div>
  );
};