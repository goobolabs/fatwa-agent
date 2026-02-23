"use client";

import { useState, useRef, useEffect } from "react";

/* ─────────────────────────── Types ─────────────────────────── */
interface FatwaSection {
  xukunka: string;
  faahfaahin: string;
  ikhtilaaf: string;
  gunaanad: string;
  tixraac: string;
  raw: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "agent";
  text: string;
  response?: FatwaSection;
  evidenceCount?: number;
  outOfDomain?: boolean;
  noEvidence?: boolean;
  error?: string;
  detail?: string;
  timestamp: number;
}

interface HistoryItem {
  id: string;
  question: string;
  timestamp: number;
}

/* ─────────────────────── Sidebar Icons ─────────────────────── */
const IconMoon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
);
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);
const IconSend = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
);
const IconBook = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
);
const IconClock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
);
const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

/* ───────────────────── Typing Dots ─────────────────────────── */
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <div className="w-2 h-2 rounded-full bg-[var(--gold)] dot-1" />
      <div className="w-2 h-2 rounded-full bg-[var(--gold)] dot-2" />
      <div className="w-2 h-2 rounded-full bg-[var(--gold)] dot-3" />
    </div>
  );
}

/* ───────────────────── Section Badge ───────────────────────── */
function FatwaBlock({ label, icon, color, content }: {
  label: string; icon: string; color: string; content: string;
}) {
  if (!content) return null;
  return (
    <div className="mt-3 animate-fade-up" style={{ animationDelay: "0.1s" }}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-sm">{icon}</span>
        <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color }}>{label}</span>
      </div>
      <p className="text-sm leading-relaxed text-[var(--text-secondary)] pl-6">{content}</p>
    </div>
  );
}

/* ──────────────────── Example Questions ────────────────────── */
const EXAMPLES = [
  { q: "Injekshinku soonka ma jabiyaa?", icon: "💉" },
  { q: "Qofku hadduu biyo ku galo afkiisa si aan ula kasdamin soonkiisa ma jabtaa?", icon: "💧" },
  { q: "Dumarka ma isticmaali karaan kaniini si ay u soomaan?", icon: "💊" },
  { q: "Qofka bukaan ah ee Ramadaanka soomin kari waaya maxuu yeelayaa?", icon: "🏥" },
  { q: "Taraweexda Ramadaanka ma waajib baa mise sunno?", icon: "🕌" },
  { q: "Sigaarka cabidda soonka ma jabisaa?", icon: "🚬" },
];

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════ */
export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isLanding = messages.length === 0;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
    }
  }, [input]);

  const sendMessage = async (q?: string) => {
    const text = (q || input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
      timestamp: Date.now(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    setHistory((h) => {
      const exists = h.some((x) => x.question === text);
      if (exists) return h;
      return [{ id: `h-${Date.now()}`, question: text, timestamp: Date.now() }, ...h].slice(0, 20);
    });

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text }),
      });
      const data = await res.json();

      const agentMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "agent",
        text: "",
        response: data.success ? data.response : undefined,
        evidenceCount: data.evidenceCount,
        outOfDomain: data.outOfDomain,
        noEvidence: data.noEvidence,
        error: data.error,
        detail: data.detail,
        timestamp: Date.now(),
      };
      setMessages((m) => [...m, agentMsg]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: `e-${Date.now()}`,
          role: "agent",
          text: "",
          error: "Khalad ka dhacay. Internet-ka hubi oo dib u isku day.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setInput("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ════════════ SIDEBAR ════════════ */}
      <aside
        className={`${sidebarOpen ? "w-72" : "w-0"} flex-shrink-0 transition-all duration-300 overflow-hidden`}
        style={{ background: "var(--bg-sidebar)", borderRight: sidebarOpen ? "1px solid var(--border)" : "none" }}
      >
        <div className="flex flex-col h-full w-72">
          {/* Sidebar header */}
          <div className="p-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg gradient-gold flex items-center justify-center animate-pulse-ring">
                <IconMoon />
              </div>
              <div>
                <h1 className="text-sm font-bold gradient-text">Fatwa Agent</h1>
                <p className="text-[10px] text-[var(--text-muted)]">Ramadan Fiqh AI</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card-hover)] transition-colors">
              <IconX />
            </button>
          </div>

          {/* New chat button */}
          <div className="p-3">
            <button
              onClick={startNewChat}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
              style={{ border: "1px solid var(--border-hover)", color: "var(--text-secondary)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--gold-dim)"; e.currentTarget.style.color = "var(--gold)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
            >
              <IconPlus /> Su&apos;aal Cusub
            </button>
          </div>

          {/* Info card */}
          <div className="px-3 mb-3">
            <div className="rounded-lg p-3 glass">
              <div className="flex items-center gap-2 mb-2">
                <IconBook />
                <span className="text-xs font-semibold text-[var(--gold)]">Xogta</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                138 fatwa oo laga soo qaaday culimada Soomaaliyeed. Waxaa ku jira Sh. Maxamed Cumar Dirir, Sh. Maxamed Cabdi Umal, iyo qaar kale.
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)]" />
                <span className="text-[10px] text-[var(--green)]">Nidaamku waa shaqaynayaa</span>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="flex-1 overflow-y-auto px-3">
            <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 px-1">Taariikhda</p>
            {history.length === 0 ? (
              <p className="text-[11px] text-[var(--text-muted)] px-1 italic">Wali su&apos;aal la weydiin.</p>
            ) : (
              <div className="space-y-1">
                {history.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => sendMessage(h.question)}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-[11px] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text)] transition-all duration-150 animate-slide-in truncate flex items-center gap-2"
                  >
                    <IconClock />
                    <span className="truncate">{h.question}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar footer */}
          <div className="p-3" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 px-1">
              <span className="text-[10px] text-[var(--text-muted)]">Fatwa Agent v1.0</span>
              <span className="text-[8px] text-[var(--text-muted)]">·</span>
              <span className="text-[10px] text-[var(--text-muted)]">Memvid + Gemini</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ════════════ MAIN CONTENT ════════════ */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden islamic-pattern">

        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 glass" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card-hover)] transition-colors">
                <IconMenu />
              </button>
            )}
            <div className="flex items-center gap-2">
              {!sidebarOpen && <div className="w-6 h-6 rounded-md gradient-gold flex items-center justify-center"><IconMoon /></div>}
              <span className="text-sm font-semibold text-[var(--text)]">
                {isLanding ? "Su'aalaha Fiqhiga Ramadaanka" : "Wadahadal"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2.5 py-1 rounded-full font-medium" style={{ background: "var(--gold-glow)", color: "var(--gold)", border: "1px solid rgba(212,168,83,0.2)" }}>
              Ramadan Fiqh
            </span>
          </div>
        </header>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto">
          {isLanding ? (
            /* ──────── LANDING PAGE ──────── */
            <div className="flex flex-col items-center justify-center h-full px-4 animate-fade-up">
              <div className="max-w-2xl w-full text-center space-y-8">
                {/* Hero */}
                <div className="space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-2xl gradient-gold flex items-center justify-center glow-gold animate-pulse-ring">
                    <span className="text-3xl">☽</span>
                  </div>
                  <h2 className="text-3xl font-bold gradient-text">Su&apos;aal Fiqhi Weydii</h2>
                  <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
                    Nidaamkan AI wuxuu ku salaysan yahay xogta culimada Soomaaliyeed. Weydii su&apos;aashaada oo hel jawaab ku salaysan daliil.
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold gradient-text">138</p>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Fatwa</p>
                  </div>
                  <div className="w-px h-8" style={{ background: "var(--border)" }} />
                  <div className="text-center">
                    <p className="text-2xl font-bold gradient-text">5+</p>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Culimo</p>
                  </div>
                  <div className="w-px h-8" style={{ background: "var(--border)" }} />
                  <div className="text-center">
                    <p className="text-2xl font-bold gradient-text">AI</p>
                    <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Gemini</p>
                  </div>
                </div>

                {/* Example questions */}
                <div className="grid grid-cols-2 gap-2 max-w-lg mx-auto">
                  {EXAMPLES.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(ex.q)}
                      className="group text-left px-3.5 py-3 rounded-xl text-[12px] text-[var(--text-secondary)] transition-all duration-200 glass glass-hover"
                      style={{ animationDelay: `${i * 0.08}s` }}
                    >
                      <span className="mr-1.5">{ex.icon}</span>
                      <span className="group-hover:text-[var(--gold)] transition-colors line-clamp-2">{ex.q}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ──────── CHAT MESSAGES ──────── */
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className="animate-fade-up">
                  {msg.role === "user" ? (
                    /* User bubble */
                    <div className="flex justify-end">
                      <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-br-md text-sm" style={{ background: "rgba(212,168,83,0.12)", border: "1px solid rgba(212,168,83,0.15)", color: "var(--text)" }}>
                        {msg.text}
                      </div>
                    </div>
                  ) : (
                    /* Agent bubble */
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg gradient-gold flex items-center justify-center mt-1 text-sm">☽</div>
                      <div className="flex-1 min-w-0">
                        <div className="rounded-2xl rounded-tl-md px-4 py-3 glass" style={{ maxWidth: "95%" }}>

                          {/* Out of domain */}
                          {msg.outOfDomain && (
                            <div className="flex items-start gap-2">
                              <span className="text-xl">🚫</span>
                              <div>
                                <p className="text-xs font-semibold text-red-400 mb-1">Domain ka baxsan</p>
                                <p className="text-sm text-[var(--text-secondary)]">Qaybtan wali kuma jirto nidaamka. Hadda waxaan ka jawaabaa su&apos;aalaha Ramadaanka oo keliya.</p>
                              </div>
                            </div>
                          )}

                          {/* No evidence */}
                          {msg.noEvidence && (
                            <div className="flex items-start gap-2">
                              <span className="text-xl">📭</span>
                              <div>
                                <p className="text-xs font-semibold text-[var(--gold)] mb-1">Xog la&apos;aan</p>
                                <p className="text-sm text-[var(--text-secondary)]">Su&apos;aashan xog sugan lagama hayo kaydka fataawada.</p>
                              </div>
                            </div>
                          )}

                          {/* Error */}
                          {msg.error && (
                            <div className="flex items-start gap-2">
                              <span className="text-xl">⚠️</span>
                              <div>
                                <p className="text-sm text-red-400">{msg.error}</p>
                                {msg.detail && <p className="text-[11px] text-[var(--text-muted)] mt-1">{msg.detail}</p>}
                              </div>
                            </div>
                          )}

                          {/* Success */}
                          {msg.response && (
                            <div>
                              {msg.evidenceCount && (
                                <div className="flex items-center gap-1.5 mb-3">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)]" />
                                  <span className="text-[10px] text-[var(--green)] font-medium">{msg.evidenceCount} daliil la helay</span>
                                </div>
                              )}
                              <FatwaBlock label="Xukunka" icon="⚖️" color="var(--gold)" content={msg.response.xukunka} />
                              <FatwaBlock label="Faahfaahin" icon="📖" color="var(--green)" content={msg.response.faahfaahin} />
                              <FatwaBlock label="Ikhtilaaf" icon="🔄" color="#60a5fa" content={msg.response.ikhtilaaf} />
                              <FatwaBlock label="Gunaanad" icon="📝" color="#a78bfa" content={msg.response.gunaanad} />
                              <FatwaBlock label="Tixraac" icon="🔗" color="var(--gold)" content={msg.response.tixraac} />
                            </div>
                          )}
                        </div>

                        <span className="text-[10px] text-[var(--text-muted)] mt-1.5 block pl-1">
                          {new Date(msg.timestamp).toLocaleTimeString("so-SO", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 animate-fade-up">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg gradient-gold flex items-center justify-center text-sm">☽</div>
                  <div className="glass rounded-2xl rounded-tl-md">
                    <TypingDots />
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* ──────── INPUT BAR ──────── */}
        <div className="px-4 py-3" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2 rounded-xl p-2 glass" style={{ border: loading ? "1px solid rgba(212,168,83,0.3)" : "1px solid var(--border)" }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Su'aashaada halkan ku qor..."
                rows={1}
                maxLength={500}
                disabled={loading}
                className="flex-1 bg-transparent text-sm text-[var(--text)] placeholder-[var(--text-muted)] resize-none py-2 px-2 max-h-40"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-30"
                style={{
                  background: input.trim() && !loading ? "var(--gold)" : "transparent",
                  color: input.trim() && !loading ? "var(--bg-primary)" : "var(--text-muted)",
                }}
              >
                {loading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-[var(--gold)] border-t-transparent animate-spin" />
                ) : (
                  <IconSend />
                )}
              </button>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] text-center mt-2">
              Nidaamkan waa kaaliye oo ma beddeli karo fatwa culimada. Enter si aad u dirto.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
