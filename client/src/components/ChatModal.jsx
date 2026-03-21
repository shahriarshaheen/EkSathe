import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Car, MapPin, Loader2 } from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";

const POLL_INTERVAL = 5000;

const theme = {
  carpool: {
    headerBg: "bg-teal-600",
    icon: Car,
    myBubble: "bg-teal-600 text-white rounded-2xl rounded-tr-sm",
    theirBubble:
      "bg-white text-stone-800 border border-stone-200 rounded-2xl rounded-tl-sm",
    sendBtn: "bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300",
    inputFocus: "focus:ring-teal-500/20 focus:border-teal-500",
    label: "Ride Chat",
    myTime: "text-teal-100",
    theirTime: "text-stone-400",
  },
  parking: {
    headerBg: "bg-stone-900",
    icon: MapPin,
    myBubble: "bg-stone-900 text-white rounded-2xl rounded-tr-sm",
    theirBubble:
      "bg-amber-50 text-stone-800 border border-amber-200 rounded-2xl rounded-tl-sm",
    sendBtn: "bg-stone-900 hover:bg-stone-700 disabled:bg-stone-400",
    inputFocus: "focus:ring-stone-400/20 focus:border-stone-500",
    label: "Booking Chat",
    myTime: "text-stone-400",
    theirTime: "text-stone-400",
  },
};

function Avatar({ user }) {
  return (
    <div className="w-7 h-7 rounded-full overflow-hidden bg-stone-200 flex items-center justify-center flex-shrink-0">
      {user?.photoUrl ? (
        <img
          src={user.photoUrl}
          alt={user.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-xs font-bold text-stone-500">
          {user?.name?.[0]?.toUpperCase() || "?"}
        </span>
      )}
    </div>
  );
}

function MessageBubble({ msg, isMe, t }) {
  const time = new Date(msg.createdAt).toLocaleTimeString("en-BD", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isMe) {
    return (
      <div className="flex flex-col items-end gap-0.5">
        <div
          className={`px-4 py-2.5 max-w-[75%] text-sm leading-relaxed shadow-sm ${t.myBubble}`}
        >
          {msg.text}
        </div>
        <span className={`text-xs px-1 ${t.myTime}`}>{time}</span>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2 max-w-[80%]">
      <Avatar user={msg.sender} />
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-stone-400 font-medium px-1">
          {msg.sender?.name?.split(" ")[0]}
        </span>
        <div
          className={`px-4 py-2.5 text-sm leading-relaxed shadow-sm ${t.theirBubble}`}
        >
          {msg.text}
        </div>
        <span className={`text-xs px-1 ${t.theirTime}`}>{time}</span>
      </div>
    </div>
  );
}

export default function ChatModal({
  contextType,
  contextId,
  title,
  participants = [],
  onClose,
}) {
  const { user } = useAuth();
  const t = theme[contextType] || theme.carpool;
  const Icon = t.icon;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const pollRef = useRef(null);
  const lastCountRef = useRef(0);

  // Get current user's ID — try multiple fields
  const myId = user?._id || user?.id || "";

  const isMine = (msg) => {
    const senderId = msg.sender?._id || msg.sender?.id || msg.sender;
    return senderId?.toString() === myId?.toString();
  };

  const scrollToBottom = (smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  const fetchMessages = useCallback(
    async (silent = false) => {
      try {
        const res = await api.get(`/messages/${contextType}/${contextId}`);
        const msgs = res.data.data || [];
        if (msgs.length !== lastCountRef.current) {
          setMessages(msgs);
          lastCountRef.current = msgs.length;
          setTimeout(() => scrollToBottom(lastCountRef.current > 0), 80);
        }
      } catch {
        if (!silent) setError("Could not load messages.");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [contextType, contextId],
  );

  useEffect(() => {
    fetchMessages(false);
    inputRef.current?.focus();
    pollRef.current = setInterval(() => fetchMessages(true), POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [fetchMessages]);

  useEffect(() => {
    if (!loading) setTimeout(() => scrollToBottom(false), 60);
  }, [loading]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setText("");
    try {
      const res = await api.post(`/messages/${contextType}/${contextId}`, {
        text: trimmed,
      });
      setMessages((prev) => [...prev, res.data.data]);
      lastCountRef.current += 1;
      setTimeout(() => scrollToBottom(true), 60);
    } catch {
      setError("Failed to send.");
      setText(trimmed);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Group messages by date
  const grouped = messages.reduce((acc, msg) => {
    const date = new Date(msg.createdAt).toLocaleDateString("en-BD", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(msg);
    return acc;
  }, {});

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          className="relative w-full sm:max-w-md bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden z-10"
          style={{ height: "85vh", maxHeight: 640 }}
        >
          {/* Header */}
          <div className={`${t.headerBg} px-5 py-4 flex-shrink-0`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm truncate">{title}</p>
                <p className="text-white/60 text-xs">{t.label}</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Participants */}
            {participants.length > 0 && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                <div className="flex -space-x-2">
                  {participants.slice(0, 4).map((p, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full overflow-hidden bg-white/20 border-2 border-white/30 flex items-center justify-center"
                    >
                      {p.photoUrl ? (
                        <img
                          src={p.photoUrl}
                          className="w-full h-full object-cover"
                          alt={p.name}
                        />
                      ) : (
                        <span className="text-xs font-bold text-white">
                          {p.name?.[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                  ))}
                  {participants.length > 4 && (
                    <div className="w-6 h-6 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">
                        +{participants.length - 4}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-white/60 text-xs">
                  {participants.length} participant
                  {participants.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 bg-stone-50/60">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 text-stone-400 animate-spin" />
                  <p className="text-xs text-stone-400">Loading messages...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    contextType === "carpool" ? "bg-teal-50" : "bg-amber-50"
                  }`}
                >
                  <Icon
                    className={`w-7 h-7 ${contextType === "carpool" ? "text-teal-400" : "text-amber-400"}`}
                  />
                </div>
                <p className="text-sm font-bold text-stone-600">
                  No messages yet
                </p>
                <p className="text-xs text-stone-400 leading-relaxed">
                  {contextType === "carpool"
                    ? "Start the conversation — coordinate pickup with your ride group."
                    : "Chat with the homeowner about parking access or any questions."}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {Object.entries(grouped).map(([date, msgs]) => (
                  <div key={date}>
                    <div className="flex items-center gap-2 my-4">
                      <div className="flex-1 h-px bg-stone-200" />
                      <span className="text-xs text-stone-400 font-medium px-2 bg-stone-50/60">
                        {date}
                      </span>
                      <div className="flex-1 h-px bg-stone-200" />
                    </div>
                    <div className="space-y-3">
                      {msgs.map((msg) => (
                        <MessageBubble
                          key={msg._id}
                          msg={msg}
                          isMe={isMine(msg)}
                          t={t}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="text-xs text-red-500 text-center py-2">
                {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 bg-white border-t border-stone-100 flex-shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                maxLength={500}
                rows={1}
                className={`flex-1 resize-none rounded-2xl border border-stone-200 px-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 hover:border-stone-300 transition-colors ${t.inputFocus}`}
                style={{ maxHeight: 100, overflowY: "auto" }}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height =
                    Math.min(e.target.scrollHeight, 100) + "px";
                }}
              />
              <button
                onClick={handleSend}
                disabled={!text.trim() || sending}
                className={`w-11 h-11 rounded-2xl ${t.sendBtn} text-white flex items-center justify-center transition-all active:scale-95 flex-shrink-0`}
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-stone-400 mt-1.5 text-center">
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
