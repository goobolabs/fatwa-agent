"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface FatwaBlock {
  xukun: string;
  faahfaahin: string;
  ikhtilaf: string;
  gunaanad: string;
  tixraac: string[];
}

interface Msg {
  role: "user" | "agent";
  text: string;
  fatwa?: FatwaBlock;
  time: string;
}

function now() {
  return new Date().toLocaleTimeString("so-SO", { hour: "2-digit", minute: "2-digit" });
}

const QUICK = [
  "Liqidda xaakadu soonka ma jabisaa?",
  "Qof sooman dhiig ma iska qaadi karaa?",
  "Hadii aan dhunkado xaaskayga soonku ma iga burayaa?",
];

/** Extract YouTube video ID from youtu.be/... or youtube.com/watch?v=... */
function getYouTubeId(url: string): string | null {
  const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (short) return short[1];
  const long = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (long) return long[1];
  return null;
}

/** Parse tixraac string — could be "Sheikh name - url" or just a url */
function parseTixraac(raw: string): { label: string; url: string | null; youtubeId: string | null } {
  const urlMatch = raw.match(/(https?:\/\/[^\s]+)/);
  const url = urlMatch ? urlMatch[1] : null;
  const label = raw.replace(urlMatch?.[0] ?? "", "").replace(/[-–—|]+$/, "").trim() || "Tixraac";
  const youtubeId = url ? getYouTubeId(url) : null;
  return { label, url, youtubeId };
}

function YouTubeCard({ label, url, videoId }: { label: string; url: string; videoId: string }) {
  const [showEmbed, setShowEmbed] = useState(false);
  const thumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-secondary)" }}>
      {showEmbed ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full"
          style={{ height: 200, border: "none" }}
        />
      ) : (
        <button
          onClick={() => setShowEmbed(true)}
          className="relative w-full group block"
          style={{ height: 160 }}
        >
          {/* Thumbnail */}
          <Image
            src={thumb}
            alt={label}
            fill
            className="object-cover"
            unoptimized
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition-colors" />
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ background: "rgba(255,0,0,0.88)", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
              <svg className="w-6 h-6 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </button>
      )}
      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2.5"
        style={{ background: "rgba(29,110,199,0.08)", borderTop: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 min-w-0">
          <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="#FF0000">
            <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1C4.5 20.5 12 20.5 12 20.5s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8z"/>
            <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
          </svg>
          <span className="text-[12px] font-medium truncate" style={{ color: "var(--text)" }}>{label}</span>
        </div>
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="flex-shrink-0 ml-2 text-[10px] font-medium px-2 py-1 rounded-md transition-colors"
          style={{ color: "var(--secondary)", background: "rgba(29,110,199,0.1)" }}
          onClick={(e) => e.stopPropagation()}>
          Fur
        </a>
      </div>
    </div>
  );
}

const SectionIcon = ({ name, className }: { name: "xukun" | "faahfaahin" | "ikhtilaf" | "gunaanad" | "tixraac"; className?: string }) => {
  const size = 16;
  const icons = {
    xukun: (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v18" /><path d="M6 6h12" />
        <path d="M8 6v4l-2 4h4l2-4V6" /><path d="M16 6v4l-2 4h4l2-4V6" />
      </svg>
    ),
    faahfaahin: (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <path d="M8 7h8" /><path d="M8 11h6" />
      </svg>
    ),
    ikhtilaf: (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4v6" /><path d="M8 14l4 6 4-6" />
        <path d="M6 12h2" /><path d="M16 12h2" />
      </svg>
    ),
    gunaanad: (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
      </svg>
    ),
    tixraac: (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <path d="M8 7h8" /><path d="M12 11v6" /><path d="m10 15 2 2 2-2" />
      </svg>
    ),
  };
  return icons[name];
};

function FatwaCard({ fatwa }: { fatwa: FatwaBlock }) {
  const sections = [
    { key: "xukun",      icon: "xukun" as const,      title: "Xukunka",     color: "var(--primary)",        bg: "rgba(255,163,53,0.07)" },
    { key: "faahfaahin", icon: "faahfaahin" as const, title: "Faahfaahin",  color: "var(--secondary)",      bg: "rgba(29,110,199,0.07)" },
    // { key: "ikhtilaf",   icon: "ikhtilaf" as const,   title: "Ikhtilaaf",   color: "var(--green)",          bg: "rgba(16,185,129,0.06)" },
    { key: "gunaanad",   icon: "gunaanad" as const,   title: "Gunaanad",    color: "var(--primary-bright)", bg: "rgba(255,184,92,0.06)" },
  ] as const;

  const tixraacParsed = (fatwa.tixraac ?? []).map(parseTixraac);

  return (
    <div className="mt-2 rounded-2xl overflow-hidden animate-fade-in" style={{ border: "1px solid var(--border)" }}>
      {sections.map((s) => {
        const val = fatwa[s.key];
        if (!val) return null;
        return (
          <div key={s.key} className="px-4 py-3.5 transition-all duration-200" style={{ background: s.bg, borderBottom: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex-shrink-0" style={{ color: s.color }}>
                <SectionIcon name={s.icon} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: s.color }}>{s.title}</span>
            </div>
            <p className="text-[13.5px] leading-[1.75] text-[var(--text)]">{val}</p>
          </div>
        );
      })}

      {tixraacParsed.length > 0 && (
        <div className="px-4 pt-3 pb-4 space-y-2.5" style={{ background: "rgba(255,255,255,0.015)" }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex-shrink-0 text-[var(--text-muted)]">
              <SectionIcon name="tixraac" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">Tixraacyada</span>
          </div>
          {tixraacParsed.map((t, i) =>
            t.youtubeId && t.url ? (
              <YouTubeCard key={i} label={t.label} url={t.url} videoId={t.youtubeId} />
            ) : t.url ? (
              <a key={i} href={t.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 glass glass-secondary"
                style={{ color: "var(--secondary)" }}>
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                <span className="text-[12px] font-medium truncate">{t.label || t.url}</span>
              </a>
            ) : (
              <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium glass" style={{ color: "var(--primary)" }}>
                {t.label}
              </span>
            )
          )}
        </div>
      )}
    </div>
  );
}

function ChatInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sideOpen, setSideOpen] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const autoSent = useRef(false);

  const scroll = () => setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 80);

  const send = useCallback(async (q: string) => {
    if (!q.trim() || loading) return;
    const userMsg: Msg = { role: "user", text: q.trim(), time: now() };
    setMsgs((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);
    scroll();

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || "Server error");

      const text = data.message || data.answer || data.text || "";
      const agentMsg: Msg = { role: "agent", text, time: now() };
      if (data.fatwa && data.fatwa.xukun) agentMsg.fatwa = data.fatwa;
      setMsgs((p) => [...p, agentMsg]);
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : "Khalad dhacay";
      setMsgs((p) => [...p, { role: "agent", text: `⚠️ ${errMsg}`, time: now() }]);
    } finally {
      setLoading(false);
      scroll();
    }
  }, [loading]);

  useEffect(() => {
    const q = params.get("q");
    if (q && !autoSent.current) {
      autoSent.current = true;
      send(q);
    }
  }, [params, send]);

  useEffect(() => { inputRef.current?.focus(); }, [loading]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-deep)" }}>
      {/* ════ SIDEBAR ════ */}
      <aside
        className={`${sideOpen ? "w-72" : "w-0"} flex-shrink-0 transition-all duration-300 overflow-hidden border-r border-[var(--border)]`}
        style={{ background: "var(--bg-sidebar)" }}
      >
        <div className="flex flex-col h-full w-72">
          {/* Sidebar header */}
          <div className="p-5 border-b border-[var(--border)]">
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/assets/logo-white.png"
                alt="Fatwa Agent"
                width={110}
                height={30}
                className="group-hover:brightness-125 transition-all"
              />
            </Link>
            <p className="text-[10px] text-[var(--text-muted)] mt-1.5">Ramadan Fiqh AI Agent</p>
          </div>

          {/* New chat */}
          <div className="p-4">
            <button
              onClick={() => { setMsgs([]); router.push("/chat"); }}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl glass glass-primary transition-all duration-200 text-sm font-medium text-[var(--primary)]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
              Wadahadal Cusub
            </button>
          </div>

          {/* Quick questions */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3 px-1">Su&apos;aalo Degdeg ah</p>
            <div className="space-y-1.5">
              {QUICK.map((q, i) => (
                <button
                  key={i}
                  onClick={() => send(q)}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-[12px] text-[var(--text-secondary)] hover:text-[var(--text)] glass-hover transition-all duration-200 truncate"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* History */}
            {msgs.filter(m => m.role === "user").length > 0 && (
              <>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mt-6 mb-3 px-1">Taariikh</p>
                <div className="space-y-1">
                  {msgs.filter(m => m.role === "user").map((m, i) => (
                    <div key={i} className="px-3 py-2 rounded-lg text-[12px] text-[var(--text-muted)] truncate">
                      {m.text}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-[var(--border)]">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg glass">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse" />
              <span className="text-[11px] text-[var(--text-muted)]">Nidaamku waa shaqaynayaa</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ════ MAIN ════ */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Topbar */}
        <header className="flex items-center gap-3 px-5 h-16 border-b border-[var(--border)] flex-shrink-0" style={{ background: "rgba(5,8,15,0.85)", backdropFilter: "blur(16px)" }}>
          <button onClick={() => setSideOpen(!sideOpen)} className="p-2 rounded-lg glass-hover transition-colors">
            <svg className="w-5 h-5 text-[var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round"/></svg>
          </button>
          <div className="w-8 h-8 rounded-lg gradient-secondary-soft flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full" style={{ background: "var(--secondary)" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--text)]">Fiqh Evidence Assistant</p>
            <p className="text-[10px] text-[var(--text-muted)]">Powered by Gemini AI</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-[10px] text-[var(--green)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse" />
            Online
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-5 py-6">
            {msgs.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-fade-in">
                <Image
                  src="/assets/logo-white.png"
                  alt="Fatwa Agent"
                  width={180}
                  height={50}
                  className="mb-8 animate-float drop-shadow-[0_0_25px_rgba(255,163,53,0.2)]"
                />
                <h2 className="text-xl font-bold text-[var(--text)] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Assalaamu Calaykum</h2>
                <p className="text-sm text-[var(--text-muted)] mb-8 max-w-sm">Waxaan ahay Fatwa Agent — su&apos;aashaada ku saabsan Axkaamta Soonka ii weydii.</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
                  {QUICK.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => send(q)}
                      className="p-4 rounded-xl text-left text-[12px] text-[var(--text-secondary)] glass glass-primary transition-all duration-200 hover:text-[var(--text)]"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {msgs.map((m, i) => (
              <div key={i} className={`flex gap-3 mb-6 animate-fade-up ${m.role === "user" ? "justify-end" : "justify-start"}`} style={{ animationDelay: "0.05s" }}>
                {m.role === "agent" && (
                  <div className="w-8 h-8 rounded-lg gradient-secondary-soft flex-shrink-0 flex items-center justify-center mt-1">
                    <div className="w-3 h-3 rounded-full" style={{ background: "var(--secondary)" }} />
                  </div>
                )}
                <div className={`max-w-[75%] ${m.role === "user" ? "order-first" : ""}`}>
                  {/* Only show raw text bubble when there is no structured fatwa */}
                  {(!m.fatwa || !m.fatwa.xukun) && (
                    <div
                      className={`rounded-2xl px-5 py-3.5 ${
                        m.role === "user"
                          ? "gradient-primary text-white rounded-br-md"
                          : "glass rounded-bl-md"
                      }`}
                    >
                      <p className="text-[13.5px] leading-[1.75] whitespace-pre-wrap">{m.text}</p>
                    </div>
                  )}
                  {m.fatwa && m.fatwa.xukun && <FatwaCard fatwa={m.fatwa} />}
                  <p className={`text-[10px] mt-1.5 ${m.role === "user" ? "text-right text-[var(--primary-dim)]" : "text-[var(--text-muted)]"}`}>{m.time}</p>
                </div>
                {m.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-[rgba(255,163,53,0.1)] flex-shrink-0 flex items-center justify-center text-sm mt-1">👤</div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 mb-6 animate-fade-in">
                <div className="w-8 h-8 rounded-lg gradient-secondary-soft flex-shrink-0 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full" style={{ background: "var(--secondary)" }} />
                </div>
                <div className="glass rounded-2xl rounded-bl-md px-5 py-4">
                  <div className="flex items-center gap-2">
                    <p className="text-[12px] text-[var(--text-muted)] mr-2">Waan raadinayaa jawaabta</p>
                    <span className="w-2 h-2 rounded-full bg-[var(--primary)] dot-1" />
                    <span className="w-2 h-2 rounded-full bg-[var(--secondary)] dot-2" />
                    <span className="w-2 h-2 rounded-full bg-[var(--primary)] dot-3" />
                  </div>
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>
        </div>

        {/* Input bar */}
        <div className="flex-shrink-0 border-t border-[var(--border)] px-5 py-4" style={{ background: "rgba(5,8,15,0.9)", backdropFilter: "blur(16px)" }}>
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-3 glass-strong rounded-2xl px-4 py-3 transition-all duration-200 focus-within:border-[var(--border-primary)]">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                placeholder="Su'aashaada halkan ku qor..."
                className="flex-1 bg-transparent text-[14px] text-[var(--text)] placeholder:text-[var(--text-muted)] resize-none min-h-[24px] max-h-[120px] leading-relaxed"
                disabled={loading}
              />
              <button
                onClick={() => send(input)}
                disabled={loading || !input.trim()}
                className="p-2.5 rounded-xl gradient-primary text-white transition-all duration-200 hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 flex-shrink-0"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-2 text-center">
              Fatwa Agent waa kaaliye — culimo weydii xukun sharci ah.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center" style={{ background: "var(--bg-deep)" }}>
        <div className="flex items-center gap-3">
          <Image src="/assets/logo-white.png" alt="Fatwa" width={120} height={33} className="animate-pulse" />
        </div>
      </div>
    }>
      <ChatInner />
    </Suspense>
  );
}
