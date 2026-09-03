import { useState, useEffect, useRef } from "react";
import { apiRequest, apiUpload } from "../../../api/client";
import { EngagementMessage } from "./types";
import { Send, X, MessageSquare, Paperclip, FileText, Download } from "lucide-react";

type ChatModalProps = {
  token: string;
  sessionId: string;
  myBusinessId: string;
  otherPartyName: string;
  isOpen: boolean;
  onClose: () => void;
  disabled?: boolean;
};

const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // 10MB, matches backend limit
const ALLOWED_EXTENSIONS = ".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.png,.jpg,.jpeg,.webp";

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const ChatModal = ({ token, sessionId, myBusinessId, otherPartyName, isOpen, onClose, disabled }: ChatModalProps) => {
  const [messages, setMessages] = useState<EngagementMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_ATTACHMENT_BYTES) {
      setError(`"${file.name}" is too large. Maximum attachment size is 10 MB.`);
      e.target.value = "";
      return;
    }

    setError(null);
    setSelectedFile(file);
    e.target.value = ""; // allow re-selecting the same file later
  };

  const handleSend = async () => {
    const body = draft.trim();
    if ((!body && !selectedFile) || sending) return;

    setSending(true);
    setError(null);
    try {
      let message: EngagementMessage;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("sender_business_id", myBusinessId);
        if (body) formData.append("body", body);
        formData.append("attachment", selectedFile);

        message = await apiUpload<EngagementMessage>(`/engagement-sessions/${sessionId}/messages`, {
          token,
          formData,
        });
      } else {
        message = await apiRequest<EngagementMessage>(`/engagement-sessions/${sessionId}/messages`, {
          method: "POST",
          token,
          body: { sender_business_id: myBusinessId, body },
        });
      }

      setMessages((prev) => [...prev, message]);
      setDraft("");
      setSelectedFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleDownload = (messageId: string) => {
    const url = `${(import.meta.env.VITE_API_BASE ?? "/api").toString().replace(/\/$/, "")}/engagement-sessions/${sessionId}/messages/${messageId}/attachment?business_id=${myBusinessId}`;
    window.open(url, "_blank", "noopener,noreferrer");
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
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.4rem",
                      }}
                    >
                      {msg.body && <span>{msg.body}</span>}
                      {msg.attachment && (
                        <button
                          onClick={() => handleDownload(msg.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            padding: "0.4rem 0.6rem",
                            borderRadius: "8px",
                            background: isMine ? "rgba(255,255,255,0.15)" : "#f1f5f9",
                            border: "none",
                            cursor: "pointer",
                            textAlign: "left",
                            color: isMine ? "#fff" : "#0f172a",
                            fontSize: "0.8rem",
                          }}
                          title={`Download ${msg.attachment.original_name}`}
                        >
                          <FileText style={{ width: "16px", height: "16px", flexShrink: 0 }} />
                          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {msg.attachment.original_name}
                          </span>
                          <Download style={{ width: "14px", height: "14px", flexShrink: 0 }} />
                        </button>
                      )}
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

        {selectedFile && (
          <div
            style={{
              margin: "0 0.75rem",
              padding: "0.5rem 0.75rem",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.8rem",
            }}
          >
            <FileText style={{ width: "16px", height: "16px", color: "#2563eb", flexShrink: 0 }} />
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#1e40af" }}>
              {selectedFile.name} ({formatFileSize(selectedFile.size)})
            </span>
            <button
              onClick={() => setSelectedFile(null)}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b", display: "flex" }}
            >
              <X style={{ width: "14px", height: "14px" }} />
            </button>
          </div>
        )}

        <div style={{ padding: "0.75rem", borderTop: "1px solid #e2e8f0", display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_EXTENSIONS}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || sending}
            title="Attach a document"
            style={{
              padding: "0.5rem",
              background: "transparent",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              cursor: disabled ? "default" : "pointer",
              display: "flex",
              color: "#64748b",
            }}
          >
            <Paperclip style={{ width: "16px", height: "16px" }} />
          </button>
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
            disabled={disabled || sending || (!draft.trim() && !selectedFile)}
            style={{
              padding: "0.5rem 0.875rem",
              background: disabled || (!draft.trim() && !selectedFile) ? "#cbd5e1" : "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: disabled || (!draft.trim() && !selectedFile) ? "default" : "pointer",
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