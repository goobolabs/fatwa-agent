"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

const EXAMPLES = [
  { q: "Dabaashu soonka ma jabisaa?", icon: "🌙", label: "Soon" },
  { q: "xaakadu soonka ma jabisaa?", icon: "🌙", label: "Soon" },
  { q: "Dumarka ma isticmaali karaan kaniini caadada ka joojiya si ay u soomaan?", icon: "🌙", label: "Soon" },
  { q: "Qofka bukaanka ah ee Ramadaanka soomin kari waaya maxuu yeelayaa?", icon: "🌙", label: "Soon" },
  { q: "Qof sooman dhiig ma iska qaadi karaa?", icon: "🌙", label: "Soon" },
  { q: "Fidyada lacag ahaan ma u siin karaa qofka?", icon: "🌙", label: "Soon" },
];

const FEATURES = [
  {
    icon: "🔍",
    title: "Raadinta Caqliga leh",
    desc: "AI-gu wuxuu isticmaalaa Gemini embeddings si uu kuu helo fatwa-da ugu dhow su'aashaada.",
    color: "var(--secondary)",
  },
  {
    icon: "📚",
    title: "Hadda waxaa ku kaydsan Su'aalaha Soonka ",
    desc: "Xogta waxaa laga soo qaaday culimada Soomaaliyeed oo la xaqiijiyay — Sh. Dirir, Sh. Umal, iyo qaar kale.",
    color: "var(--primary)",
  },
  // {
  //   icon: "⚖️",
  //   title: "Jawaab Qaab-dhismeed leh",
  //   desc: "Jawaab kasta waxay ku dhisantahay: Xukunka, Faahfaahin, Ikhtilaaf, Gunaanad, iyo Tixraac.",
  //   color: "var(--secondary)",
  // },
  {
    icon: "🛡️",
    title: "Amaan & Dhexdhexaad ah",
    desc: "Haddii uusan jawaabaha culimada helin, jawaab cusub ma alifyo",
    color: "var(--primary)",
  },
];

const SCHOLARS = [
  { name: "Sh. Maxamed Cumar Dirir", count: "90+" },
  { name: "Sh. Maxamuud Shibli", count: "30+" },
  { name: "Dr Khadar Xasan Axmed", count: "18+" },
  { name: "Culimada kale", count: "20+" },
];

function Particle({ delay, x, size, color }: { delay: number; x: number; size: number; color: string }) {
  return (
    <div
      className="absolute rounded-full animate-float"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${20 + Math.random() * 60}%`,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        animationDelay: `${delay}s`,
        animationDuration: `${4 + Math.random() * 3}s`,
      }}
    />
  );
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen gradient-dark">
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 hero-glow" />
        {mounted && Array.from({ length: 12 }).map((_, i) => (
          <Particle
            key={i}
            delay={i * 0.4}
            x={8 + (i * 7.5)}
            size={4 + Math.random() * 8}
            color={i % 2 === 0 ? "rgba(255,163,53,0.15)" : "rgba(29,110,199,0.12)"}
          />
        ))}

        {/* Decorative rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-[rgba(29,110,199,0.05)] animate-rotate-slow pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-[rgba(255,163,53,0.03)] animate-rotate-slow pointer-events-none" style={{ animationDirection: "reverse", animationDuration: "30s" }} />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          {/* Logo */}
          <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="mx-auto mb-8 animate-pulse-ring rounded-2xl inline-block">
              <Image
                src="/assets/logo-white.png"
                alt="Fatwa Agent"
                width={220}
                height={60}
                className="drop-shadow-[0_0_30px_rgba(255,163,53,0.3)]"
                priority
              />
            </div>
          </div>

          <div className="animate-fade-up" style={{ animationDelay: "0.25s" }}>
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[var(--secondary-bright)] mb-4">Somali Fatwa AI Agent</p>
          </div>

          <h1 className="animate-fade-up text-5xl md:text-6xl font-black tracking-tight mb-6 text-balance" style={{ animationDelay: "0.35s", fontFamily: "'Playfair Display', serif" }}>
            <span className="gradient-text-secondary">Su&apos;aashaada</span>{" "}
            <span className="gradient-text-primary">Weydii</span>
          </h1>

          <p className="animate-fade-up text-base md:text-lg text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed mb-3 text-balance" style={{ animationDelay: "0.45s" }}>
            Nidaam AI ah oo ku salaysan jawaabaha culimada Soomaaliyeed. Weydii su&apos;aashaada — hel jawaab daliil ku salaysan.
          </p>

          <div className="animate-fade-up flex items-center justify-center gap-2 text-xs text-[var(--text-muted)] mb-10" style={{ animationDelay: "0.55s" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse" />
            Nidaamka hadda waxaad ka heli kartaa su'aalaha Ramadaanta kaliya
          </div>

          {/* CTA */}
          <div className="animate-fade-up flex flex-col sm:flex-row items-center justify-center gap-4" style={{ animationDelay: "0.65s" }}>
            <Link
              href="/chat"
              className="group relative inline-flex items-center justify-center gap-3 px-10 py-4 rounded-2xl text-base font-bold transition-all duration-300 hover:scale-[1.03] gradient-primary text-white glow-primary-strong"
            >
              <span>Hadda waydii</span>
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-medium text-[var(--text-secondary)] glass glass-hover transition-all duration-200"
            >
              Wax badan ka ogow
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 9 6 6 6-6"/></svg>
            </a>
          </div>

          {/* Stats */}
          <div className="animate-fade-up mt-16 inline-flex items-center gap-6 px-8 py-4 rounded-2xl glass" style={{ animationDelay: "0.8s" }}>
            {[
              { val: "138", label: "Fatwa", color: "var(--primary)" },
              { val: "5+", label: "Culimo", color: "var(--secondary)" },
              { val: "AI", label: "Gemini", color: "var(--primary)" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                {i > 0 && <div className="w-px h-8 bg-[var(--border)]" />}
                <div className="text-center px-2">
                  <p className="text-2xl font-bold" style={{ color: s.color }}>{s.val}</p>
                  <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-5 h-8 rounded-full border border-[var(--border-hover)] flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
          </div>
        </div>
      </section>

      {/* ═══ EXAMPLES ═══ */}
      <section className="relative py-20 px-6 islamic-bg">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[var(--primary-dim)] mb-3">Tusaaleyaasha</p>
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--text)] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>Su&apos;aalaha Badanaa</h2>
          <p className="text-sm text-[var(--text-muted)] mb-12 max-w-md mx-auto">Guji mid ka mid ah si aad isla markiiba u bilowdo wadahadal</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {EXAMPLES.map((ex, i) => (
              <Link
                key={i}
                href={`/chat?q=${encodeURIComponent(ex.q)}`}
                className="group relative p-5 rounded-2xl text-left transition-all duration-300 glass glass-primary animate-fade-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex items-center gap-2.5 mb-2.5">
                  <span className="text-lg">{ex.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary-dim)]">{ex.label}</span>
                </div>
                <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed group-hover:text-[var(--text)] transition-colors line-clamp-2">
                  {ex.q}
                </p>
                <div className="absolute bottom-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4 text-[var(--primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="relative py-24 px-6">
        <div className="absolute inset-0 gradient-radial pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[var(--secondary-dim)] mb-3">Sida uu u shaqeeyo</p>
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--text)]" style={{ fontFamily: "'Playfair Display', serif" }}>Nidaam Caqli leh</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl glass glass-hover transition-all duration-300 animate-fade-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 group-hover:scale-110 transition-transform"
                  style={{ background: f.color === "var(--secondary)" ? "rgba(29,110,199,0.1)" : "rgba(255,163,53,0.1)" }}
                >
                  {f.icon}
                </div>
                <h3 className="text-sm font-bold text-[var(--text)] mb-2">{f.title}</h3>
                <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FLOW DIAGRAM ═══ */}
      <section className="py-20 px-6 islamic-bg">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[var(--primary-dim)] mb-3">Qaab-dhismeedka</p>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-12" style={{ fontFamily: "'Playfair Display', serif" }}>Socodka Jawaabta</h2>

          <div className="space-y-0">
            {[
              { step: "01", label: "Su'aashaada", icon: "💬", color: "var(--primary)" },
              { step: "02", label: "Domain Detection", icon: "🔒", color: "var(--secondary)" },
              { step: "03", label: "Raadinta Xogta (Embeddings)", icon: "🔍", color: "var(--primary)" },
              { step: "04", label: "Gemini AI Reasoning", icon: "🧠", color: "var(--secondary)" },
              { step: "05", label: "Jawaab Qaab-dhismeed leh", icon: "✨", color: "var(--primary)" },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex items-center gap-3 px-5 py-3 rounded-xl glass" style={{ minWidth: 280 }}>
                  <span className="text-lg">{s.icon}</span>
                  <div className="text-left">
                    <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: s.color }}>{s.step}</p>
                    <p className="text-sm text-[var(--text)]">{s.label}</p>
                  </div>
                </div>
                {i < 4 && (
                  <div className="w-px h-6" style={{ background: "var(--border-hover)" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SCHOLARS ═══ */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[var(--secondary-dim)] mb-3">Culimada</p>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-10" style={{ fontFamily: "'Playfair Display', serif" }}>Xogta Waxaa La Soo Qaaday</h2>

          <div className="grid grid-cols-3 gap-4">
            {SCHOLARS.map((s, i) => (
              <div key={i} className="p-5 rounded-2xl glass animate-fade-up text-center" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-14 h-14 mx-auto rounded-full gradient-secondary-soft flex items-center justify-center text-2xl mb-3">👤</div>
                <p className="text-sm font-semibold text-[var(--text)] mb-1">{s.name}</p>
                <p className="text-2xl font-bold gradient-text-primary">{s.count}</p>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">fatwa</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 hero-glow pointer-events-none" />
        <div className="max-w-xl mx-auto text-center relative z-10">
          <Image
            src="/assets/logo-white.png"
            alt="Fatwa Agent"
            width={160}
            height={44}
            className="mx-auto mb-8 drop-shadow-[0_0_20px_rgba(255,163,53,0.2)]"
          />
          <h2 className="text-3xl font-bold gradient-text mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>Diyaar ma tahay?</h2>
          <p className="text-sm text-[var(--text-muted)] mb-8">Bilow waydiinta su&apos;aalaha Ramadaanta oo hel jawaabaha culimada.</p>
          <Link
            href="/chat"
            className="group inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-base font-bold transition-all duration-300 hover:scale-[1.03] gradient-primary text-white glow-primary-strong"
          >
            Bilow Hadda
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-8 px-6 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/assets/logo-white.png" alt="Fatwa" width={80} height={22} />
          </div>
          <p className="text-[10px] text-[var(--text-muted)]">
            Nidaamkan waa kaaliye — ma beddeli karo fatwa culimada.
          </p>
        </div>
      </footer>
    </div>
  );
}
