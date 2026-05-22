import React, { useState, useEffect, useRef, useCallback } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

const queryClient = new QueryClient();

type Project = {
  name: string;
  client: string;
  category: string;
  bg: string;
  labelColor: string;
  nameColor: string;
  clientColor: string;
  desc: string;
  images?: string[];
  phoneFrame?: boolean;
  caseStudy?: {
    challenge: string;
    approach: string;
    stats?: { value: string; label: string }[];
  };
};

function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;
    let revealed = false;

    const onMove = (e: MouseEvent) => {
      el.style.transform = `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))`;
      if (!revealed) {
        revealed = true;
        el.style.opacity = "1";
      }
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const isHovered = !!(
        t.closest("button") ||
        t.closest("a") ||
        t.closest("[data-cursor-hover]") ||
        t.closest(".group")
      );
      el.classList.toggle("cursor-hovered", isHovered);
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="custom-cursor fixed top-0 left-0 pointer-events-none z-[99999] select-none"
      style={{ opacity: 0, willChange: "transform" }}
    >
      <span className="cursor-scale-wrapper">
        <span className="cursor-inner">✳</span>
      </span>
    </div>
  );
}

function CarouselModal({
  projects,
  initialIndex,
  onClose,
}: {
  projects: Project[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [caseStudyOpen, setCaseStudyOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const project = projects[currentIndex];
  const imgs = project.images ?? [];

  const go = useCallback((dir: number) => {
    setDirection(dir);
    setLightboxIndex(null);
    setCaseStudyOpen(false);
    setCurrentIndex((i) => (i + dir + projects.length) % projects.length);
  }, [projects.length]);

  const lbGo = useCallback((dir: number) => {
    setLightboxIndex((i) => i === null ? null : (i + dir + imgs.length) % imgs.length);
  }, [imgs.length]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const prev = document.activeElement as HTMLElement | null;
    const timer = setTimeout(() => dialogRef.current?.focus(), 50);
    return () => { clearTimeout(timer); document.body.style.overflow = ""; prev?.focus(); };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightboxIndex !== null) { setLightboxIndex(null); return; }
        onClose();
        return;
      }
      if (lightboxIndex !== null) {
        if (e.key === "ArrowLeft") { e.preventDefault(); lbGo(-1); return; }
        if (e.key === "ArrowRight") { e.preventDefault(); lbGo(1); return; }
        return;
      }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); return; }
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); return; }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'
      ));
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, go, lbGo, lightboxIndex]);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) go(delta < 0 ? 1 : -1);
    touchStartX.current = null;
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="carousel-title"
      ref={dialogRef}
      tabIndex={-1}
      className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex flex-col focus:outline-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      data-testid="project-modal"
    >
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 md:px-14 py-4 border-b border-[#1a1a1a] flex-shrink-0" onClick={e => e.stopPropagation()}>
        <div>
          <div className="font-sans font-light text-[10px] uppercase tracking-[0.25em] text-[#FF4D00]" aria-hidden="true">
            {project.category}
          </div>
          <h2 id="carousel-title" className="font-serif font-bold text-xl md:text-3xl text-[#F5F0E8] uppercase leading-none">
            {project.name}
          </h2>
        </div>
        <div className="flex items-center gap-6">
          <span className="font-sans font-light text-xs text-[#F5F0E8]/30 tabular-nums hidden md:block" aria-label={`Project ${currentIndex + 1} of ${projects.length}`}>
            {String(currentIndex + 1).padStart(2, "0")}&nbsp;/&nbsp;{String(projects.length).padStart(2, "0")}
          </span>
          <button
            onClick={onClose}
            aria-label="Close project viewer"
            className="font-sans font-light text-[10px] text-muted-foreground hover:text-[#F5F0E8] uppercase tracking-[0.2em] transition-colors flex items-center gap-2"
            data-testid="project-modal-close"
          >
            <span aria-hidden="true">CLOSE</span>
            <span className="text-base leading-none" aria-hidden="true">✕</span>
          </button>
        </div>
      </div>

      {/* Slide area */}
      <div className="relative flex-1 overflow-hidden flex items-center" onClick={e => e.stopPropagation()}>
        {/* Prev project arrow */}
        <button
          onClick={() => go(-1)}
          aria-label={`Previous: ${projects[(currentIndex - 1 + projects.length) % projects.length].name}`}
          className="absolute left-3 md:left-6 z-20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-[#F5F0E8]/25 hover:text-[#FF4D00] hover:bg-white/5 transition-all duration-200"
        >
          <span className="text-2xl md:text-3xl" aria-hidden="true">←</span>
        </button>

        {/* Animated slide */}
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
            className="absolute inset-0 overflow-y-auto"
          >
            {/* Description strip */}
            <div className="px-14 md:px-24 pt-8 pb-5">
              <p className="font-sans font-light text-sm text-muted-foreground leading-relaxed max-w-2xl">
                {project.desc}
              </p>
            </div>

            {/* Case study toggle */}
            {project.caseStudy && (
              <div className="px-14 md:px-24 pb-2">
                <button
                  onClick={() => setCaseStudyOpen(o => !o)}
                  aria-expanded={caseStudyOpen}
                  style={{ cursor: "none" }}
                  className="flex items-center gap-3 bg-[#FF4D00] text-black font-sans font-semibold text-[11px] uppercase tracking-[0.2em] px-5 py-3 hover:opacity-90 transition-opacity duration-200 focus:outline-none"
                >
                  <span>Case Study</span>
                  <span
                    className="text-base font-bold transition-transform duration-300 leading-none"
                    style={{ display: "inline-block", transform: caseStudyOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                    aria-hidden="true"
                  >+</span>
                </button>
                <AnimatePresence>
                  {caseStudyOpen && (
                    <motion.div
                      key="case-study"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 border border-[#1a1a1a]">
                        {/* Stats bar */}
                        {project.caseStudy.stats && project.caseStudy.stats.length > 0 && (
                          <div className="grid border-b border-[#1a1a1a]" style={{ gridTemplateColumns: `repeat(${project.caseStudy.stats.length}, 1fr)` }}>
                            {project.caseStudy.stats.map((stat, i) => (
                              <div key={i} className={`bg-[#111] px-5 py-4 flex flex-col gap-1 ${i < project.caseStudy!.stats!.length - 1 ? "border-r border-[#1a1a1a]" : ""}`}>
                                <span className="font-serif font-bold text-2xl text-[#FF4D00] leading-none">{stat.value}</span>
                                <span className="font-sans font-light text-[10px] uppercase tracking-[0.2em] text-[#F5F0E8]/40">{stat.label}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {/* Challenge / Approach */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#1a1a1a]">
                          <div className="bg-[#0a0a0a] p-6">
                            <div className="font-sans font-light text-[10px] uppercase tracking-[0.25em] text-[#FF4D00] mb-3">The Challenge</div>
                            <p className="font-sans font-light text-sm text-[#F5F0E8]/70 leading-relaxed">{project.caseStudy.challenge}</p>
                          </div>
                          <div className="bg-[#0a0a0a] p-6">
                            <div className="font-sans font-light text-[10px] uppercase tracking-[0.25em] text-[#FF4D00] mb-3">The Approach</div>
                            <p className="font-sans font-light text-sm text-[#F5F0E8]/70 leading-relaxed">{project.caseStudy.approach}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {imgs.length > 0 ? (
              project.phoneFrame ? (
                /* Phone frames: centered wrap */
                <div className="flex flex-wrap justify-center gap-8 px-14 md:px-24 pb-16">
                  {imgs.map((src, i) => (
                    <button
                      key={i}
                      className="focus:outline-none focus:ring-2 focus:ring-[#FF4D00]"
                      onClick={() => setLightboxIndex(i)}
                      aria-label={`View ${project.name} screen ${i + 1}`}
                      style={{
                        background: "#0a0a0a",
                        border: "2px solid #2a2a2a",
                        padding: "28px 10px 14px",
                        position: "relative",
                        width: 200,
                        flexShrink: 0,
                        boxShadow: "0 28px 56px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.07)",
                      }}
                    >
                      <div aria-hidden="true" style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", width: 70, height: 6, background: "#1a1a1a" }} />
                      <img
                        src={src}
                        alt={`${project.name} screen ${i + 1}`}
                        className="w-full h-auto block"
                        loading={i === 0 ? "eager" : "lazy"}
                      />
                    </button>
                  ))}
                </div>
              ) : (
                /* 3-column thumbnail grid */
                <div className="grid grid-cols-3 gap-1 px-14 md:px-24 pb-16">
                  {imgs.map((src, i) => (
                    <button
                      key={i}
                      className="aspect-square overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#FF4D00] focus:ring-inset"
                      onClick={() => setLightboxIndex(i)}
                      aria-label={`View ${project.name} image ${i + 1} of ${imgs.length}`}
                    >
                      <img
                        src={src}
                        alt={`${project.name} — ${i + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        loading={i === 0 ? "eager" : "lazy"}
                      />
                    </button>
                  ))}
                </div>
              )
            ) : (
              /* No images fallback */
              <div className="flex items-center justify-center px-14 md:px-24 pb-16">
                <div
                  className="w-full h-64 md:h-96 flex items-center justify-center"
                  style={{ backgroundColor: project.bg }}
                >
                  <span
                    className="font-serif font-bold text-3xl md:text-5xl uppercase tracking-tight"
                    style={{ color: project.nameColor }}
                  >
                    {project.name}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Next project arrow */}
        <button
          onClick={() => go(1)}
          aria-label={`Next: ${projects[(currentIndex + 1) % projects.length].name}`}
          className="absolute right-3 md:right-6 z-20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-[#F5F0E8]/25 hover:text-[#FF4D00] hover:bg-white/5 transition-all duration-200"
        >
          <span className="text-2xl md:text-3xl" aria-hidden="true">→</span>
        </button>
      </div>

      {/* Dot nav */}
      <div
        className="relative z-10 flex items-center justify-center gap-2 py-4 flex-shrink-0 border-t border-[#1a1a1a]"
        onClick={e => e.stopPropagation()}
      >
        {projects.map((p, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i); setLightboxIndex(null); setCaseStudyOpen(false); }}
            aria-label={`Go to ${p.name}`}
            aria-current={i === currentIndex ? "true" : undefined}
            className={`h-[3px] transition-all duration-300 ${i === currentIndex ? "w-6 bg-[#FF4D00]" : "w-[6px] bg-[#2a2a2a] hover:bg-[#555]"}`}
          />
        ))}
      </div>

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[99999] bg-black/92 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${project.name} image ${lightboxIndex + 1} of ${imgs.length}`}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center text-[#F5F0E8]/50 hover:text-[#F5F0E8] transition-colors"
            onClick={() => setLightboxIndex(null)}
            aria-label="Close image"
          >
            <span className="text-2xl leading-none" aria-hidden="true">✕</span>
          </button>

          {/* Prev image */}
          {imgs.length > 1 && (
            <button
              className="absolute left-4 z-10 w-12 h-12 flex items-center justify-center text-[#F5F0E8]/40 hover:text-[#FF4D00] transition-colors"
              onClick={e => { e.stopPropagation(); lbGo(-1); }}
              aria-label="Previous image"
            >
              <span className="text-3xl" aria-hidden="true">←</span>
            </button>
          )}

          {/* Full image */}
          <img
            src={imgs[lightboxIndex]}
            alt={`${project.name} — image ${lightboxIndex + 1}`}
            className="max-h-screen max-w-full object-contain"
            onClick={e => e.stopPropagation()}
          />

          {/* Next image */}
          {imgs.length > 1 && (
            <button
              className="absolute right-4 z-10 w-12 h-12 flex items-center justify-center text-[#F5F0E8]/40 hover:text-[#FF4D00] transition-colors"
              onClick={e => { e.stopPropagation(); lbGo(1); }}
              aria-label="Next image"
            >
              <span className="text-3xl" aria-hidden="true">→</span>
            </button>
          )}

          {/* Counter */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 font-sans font-light text-xs text-[#F5F0E8]/35 tabular-nums tracking-widest">
            {lightboxIndex + 1}&nbsp;/&nbsp;{imgs.length}
          </div>
        </div>
      )}
    </div>
  );
}


const SERVICES = [
  "Brand Identity",
  "Social Media & Content",
  "Merch / Apparel",
  "Campaign Design",
  "Web Design",
  "Print & Signage",
  "Something else",
];

const BUDGETS = ["< $500", "$500–$2,500", "$2,500–$5k", "$5k–$20k", "$20k+", "Not sure yet"];

// Replace with your actual Calendly or Google Calendar booking URL
const BOOKING_URL = "https://calendly.com/isaacfigueroa";

function ContactFormModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"message" | "call">("message");
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [services, setServices] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const timer = setTimeout(() => dialogRef.current?.focus(), 50);
    return () => { clearTimeout(timer); prev?.focus(); };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'
      ));
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const toggleService = (s: string) =>
    setServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const projectParts = [
        services.length ? services.join(", ") : null,
        budget ? `Budget: ${budget}` : null,
        form.company ? `Company: ${form.company}` : null,
      ].filter(Boolean);
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          project: projectParts.join(" · ") || null,
          message: form.message,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full bg-transparent border-b border-[#2a2a2a] focus:border-[#FF4D00] outline-none font-sans font-light text-[#F5F0E8] text-sm py-3 placeholder:text-[#444] transition-colors";
  const labelClass = "font-sans font-light text-[10px] uppercase tracking-[0.2em] text-[#666] mb-2 block";

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-form-title"
      className="fixed inset-0 z-[9999] flex items-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" aria-hidden="true" />
      <motion.div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full bg-[#0D0D0D] flex flex-col focus:outline-none"
        style={{ maxHeight: "92vh", overflowY: "auto" }}
        initial={{ y: "100%" }}
        animate={{ y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
        exit={{ y: "100%", transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } }}
        onClick={e => e.stopPropagation()}
      >
        {/* drag handle */}
        <div className="flex justify-center pt-4 pb-2 flex-shrink-0" onClick={onClose} aria-hidden="true" style={{ cursor: "pointer" }}>
          <div className="w-10 h-[3px] bg-[#2a2a2a]" />
        </div>

        <div className="px-6 md:px-14 pt-4 pb-14">
          {/* header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="font-sans font-light text-[10px] uppercase tracking-[0.25em] text-[#FF4D00] mb-1">Start A Project</div>
              <h3 id="contact-form-title" className="font-serif font-bold text-3xl md:text-5xl text-[#F5F0E8] uppercase leading-tight m-0">
                Let's Make Something <span className="text-[#FF4D00] italic normal-case">worth</span> It.
              </h3>
            </div>
            <button onClick={onClose} aria-label="Close" className="w-9 h-9 flex items-center justify-center border border-[#2a2a2a] text-[#F5F0E8] hover:border-[#F5F0E8] transition-colors text-lg leading-none flex-shrink-0 mt-1" style={{ cursor: "none" }}>
              ×
            </button>
          </div>

          {/* tab switcher */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setTab("message")}
              className={`font-sans font-light text-xs uppercase tracking-widest px-5 py-2.5 border transition-colors ${tab === "message" ? "bg-[#F5F0E8] text-[#0D0D0D] border-[#F5F0E8]" : "border-[#2a2a2a] text-[#666] hover:border-[#666]"}`}
              style={{ cursor: "none" }}
            >
              Send a message
            </button>
            <button
              onClick={() => setTab("call")}
              className={`font-sans font-light text-xs uppercase tracking-widest px-5 py-2.5 border transition-colors ${tab === "call" ? "bg-[#F5F0E8] text-[#0D0D0D] border-[#F5F0E8]" : "border-[#2a2a2a] text-[#666] hover:border-[#666]"}`}
              style={{ cursor: "none" }}
            >
              Book a call
            </button>
          </div>

          <div aria-live="polite" aria-atomic="true">
            {/* ── SEND A MESSAGE TAB ── */}
            {tab === "message" && (
              <>
                {sent ? (
                  <div className="py-16 text-center max-w-lg">
                    <div className="text-[#FF4D00] font-serif font-bold text-5xl mb-4">✓</div>
                    <p className="font-sans font-light text-[#F5F0E8] text-lg mb-2">Message received.</p>
                    <p className="font-sans font-light text-[#666] text-sm">Isaac will get back to you within 24 hours.</p>
                    <button onClick={onClose} className="mt-8 border border-[#2a2a2a] text-[#F5F0E8] font-sans font-light text-xs uppercase tracking-widest px-6 py-3 hover:border-[#F5F0E8] transition-colors" style={{ cursor: "none" }}>Close</button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-7 max-w-2xl" noValidate>
                    {/* name + email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="cf-name" className={labelClass}>Your Name *</label>
                        <input id="cf-name" required className={inputClass} placeholder="Jane Smith" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                      </div>
                      <div>
                        <label htmlFor="cf-email" className={labelClass}>Email Address *</label>
                        <input id="cf-email" required type="email" className={inputClass} placeholder="jane@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                      </div>
                    </div>

                    {/* company */}
                    <div>
                      <label htmlFor="cf-company" className={labelClass}>Company or Project Name <span className="normal-case text-[#444]">(optional)</span></label>
                      <input id="cf-company" className={inputClass} placeholder="Acme Inc." value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
                    </div>

                    {/* services */}
                    <div>
                      <label className={labelClass}>What Do You Need? <span className="normal-case text-[#444]">(pick any)</span></label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {SERVICES.map(s => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => toggleService(s)}
                            className={`font-sans font-light text-xs px-4 py-2 border transition-colors ${services.includes(s) ? "border-[#FF4D00] text-[#FF4D00]" : "border-[#2a2a2a] text-[#666] hover:border-[#444]"}`}
                            style={{ cursor: "none" }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* budget */}
                    <div>
                      <label className={labelClass}>Rough Budget</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {BUDGETS.map(b => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setBudget(prev => prev === b ? "" : b)}
                            className={`font-sans font-light text-xs px-4 py-2 border transition-colors ${budget === b ? "border-[#FF4D00] text-[#FF4D00]" : "border-[#2a2a2a] text-[#666] hover:border-[#444]"}`}
                            style={{ cursor: "none" }}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* message */}
                    <div>
                      <label htmlFor="cf-message" className={labelClass}>Tell Me About It *</label>
                      <textarea id="cf-message" required rows={4} className={inputClass + " resize-none"} placeholder="Describe your project, timeline, and any key details..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                    </div>

                    {error && (
                      <p className="font-sans font-light text-sm text-red-400">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="self-start bg-[#FF4D00] text-black font-serif font-semibold uppercase tracking-wide px-10 py-4 text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                      style={{ cursor: "none" }}
                    >
                      {submitting ? "Sending..." : "Send Message →"}
                    </button>
                  </form>
                )}
              </>
            )}

            {/* ── BOOK A CALL TAB ── */}
            {tab === "call" && (
              <div className="max-w-2xl">
                <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
                  <div className="flex-1">
                    <p className="font-sans font-light text-[#F5F0E8] text-base md:text-lg leading-relaxed mb-6">
                      A <strong className="font-semibold">20-minute intro call</strong> — no pitch, no pressure. We'll figure out if there's a fit and what working together would actually look like.
                    </p>
                    <ul className="flex flex-col gap-3 mb-8">
                      {[
                        "20 min · Google Meet or phone",
                        "Mon–Fri, 9 AM–5 PM PT (Las Vegas)",
                        "Confirmation sent within an hour",
                      ].map(item => (
                        <li key={item} className="flex items-start gap-3 font-sans font-light text-sm text-[#999]">
                          <span className="text-[#FF4D00] mt-0.5 flex-shrink-0">▸</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                    <a
                      href={BOOKING_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 bg-[#F5F0E8] text-[#0D0D0D] font-serif font-semibold uppercase tracking-wide px-10 py-4 text-sm hover:opacity-90 transition-opacity"
                      style={{ cursor: "none" }}
                    >
                      Open scheduling page →
                    </a>
                    <p className="font-sans font-light text-[10px] uppercase tracking-widest text-[#444] mt-4">Powered by Calendly</p>
                  </div>

                  {/* avatar card */}
                  <div className="flex-shrink-0 w-36 h-36 md:w-44 md:h-44 bg-[#FF4D00] flex flex-col items-center justify-center self-start">
                    <div className="w-14 h-14 bg-[#0D0D0D] mb-3" style={{ borderRadius: "50%" }} />
                    <span className="font-sans font-light text-[10px] uppercase tracking-widest text-[#0D0D0D]">Isaac Figueroa</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ResumeModal({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const timer = setTimeout(() => dialogRef.current?.focus(), 50);
    return () => { clearTimeout(timer); prev?.focus(); };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'
      ));
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-modal-title"
      ref={dialogRef}
      tabIndex={-1}
      className="fixed inset-0 z-[9999] bg-black/90 flex flex-col focus:outline-none"
      onClick={onClose}
      data-testid="resume-modal"
    >
      <div className="flex items-center justify-between px-8 py-4 border-b border-[#1a1a1a]">
        <span id="resume-modal-title" className="font-serif font-semibold text-sm text-[#F5F0E8] uppercase tracking-[0.15em]">
          Isaac Figueroa — Resume
        </span>
        <button
          onClick={onClose}
          aria-label="Close resume"
          className="font-sans font-light text-xs text-muted-foreground hover:text-[#F5F0E8] uppercase tracking-widest transition-colors"
          data-testid="resume-modal-close"
        >
          <span aria-hidden="true">CLOSE ✕</span>
        </button>
      </div>
      <div className="flex-1 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <iframe
          src="/resume.pdf"
          className="w-full h-full border-0"
          title="Isaac Figueroa Resume"
        />
      </div>
    </div>
  );
}

const HERO_STAGGER = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const HERO_ITEM = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const [activeService, setActiveService] = useState<string | null>(null);

  const serviceInfo: Record<string, { tagline: string; desc: string; includes: string[]; delivers: string }> = {
    "Brand Identity": {
      tagline: "Your brand's visual foundation — built to last.",
      desc: "Brand identity is the complete visual system that represents who you are. From logo to color palette to typography, every element works together to create instant recognition and trust across every touchpoint.",
      includes: ["Primary + alternate logo variations", "Color palette with HEX/RGB/CMYK values", "Typography system (heading + body fonts)", "Brand usage guidelines (PDF)"],
      delivers: "AI, SVG, PNG (transparent), PDF brand guide",
    },
    "Campaign Design": {
      tagline: "Visuals built to move people — and drive results.",
      desc: "Campaign design brings a single concept to life across multiple formats. Whether it's a product launch, seasonal push, or awareness campaign, every asset is crafted to work together and hit hard.",
      includes: ["Campaign concept & mood direction", "Social media graphics (multiple sizes)", "Digital ads or promotional banners", "Print-ready materials if needed"],
      delivers: "PNG, JPG, PDF — print & web-ready files",
    },
    "Social Media Graphics": {
      tagline: "Scroll-stopping content, designed for the platform.",
      desc: "Custom graphics sized and optimized for Instagram, Facebook, TikTok, and more. Consistent with your brand, designed to perform — not just look pretty.",
      includes: ["Feed posts (1:1 and 4:5)", "Story & Reel cover graphics (9:16)", "Highlight covers", "Optional: caption copy suggestions"],
      delivers: "PNG/JPG at export-ready dimensions per platform",
    },
    "Web Design": {
      tagline: "Clean, intentional design that converts.",
      desc: "UI mockups and full website designs that balance aesthetics with function. Every screen is designed with user flow in mind — not just how it looks, but how it works.",
      includes: ["Wireframes or layout exploration", "Full desktop + mobile mockups", "Style guide (colors, type, components)", "Handoff-ready Figma file"],
      delivers: "Figma source file + exported PNG previews",
    },
    "Print & Marketing": {
      tagline: "Physical materials that represent you professionally.",
      desc: "Flyers, brochures, menus, business cards — designed to print beautifully and communicate clearly. All files are delivered print-ready with bleed and crop marks.",
      includes: ["Layout design with your content", "Print-ready PDF with bleed/crop marks", "Digital version (web-optimized)", "Up to 2 rounds of revisions"],
      delivers: "Print-ready PDF + digital JPG/PNG",
    },
    "Typography": {
      tagline: "Type as a design element — not an afterthought.",
      desc: "Custom typographic layouts, lettering treatments, and type-driven graphics. Whether it's a bold headline poster or a refined editorial layout, type is used as the primary visual tool.",
      includes: ["Custom type layout or lettering treatment", "Multiple compositional variations", "Application mockups if needed", "Vector source file"],
      delivers: "AI, SVG, PNG — vector and raster formats",
    },
    "Layout & Composition": {
      tagline: "Structure that guides the eye and tells the story.",
      desc: "Editorial layouts, presentation decks, documents, and multi-page designs. Everything is structured for clarity, visual flow, and professional impact.",
      includes: ["Multi-page layout design", "Grid system & spacing standards", "Image + text hierarchy", "Print or screen-optimized output"],
      delivers: "PDF + editable source (Figma or InDesign)",
    },
    "Merch Design": {
      tagline: "Wearable and sellable designs people actually want.",
      desc: "Graphic tees, hoodies, hats, tote bags — designed for screen printing, embroidery, or DTG printing. Artwork is delivered print-ready and spec'd for your manufacturer.",
      includes: ["Garment graphic design (front, back, sleeve)", "Color-separated artwork for printing", "Mockup previews on garment photos", "Print-ready files spec'd to your printer"],
      delivers: "AI/SVG (vector) + PNG (300dpi) + mockup JPGs",
    },
    "YouTube Thumbnails": {
      tagline: "The first frame that wins the click.",
      desc: "High-contrast, bold thumbnails designed to stand out in a crowded feed. Optimized at 1280×720 with clear hierarchy between image, text, and background.",
      includes: ["Custom thumbnail per video or batch", "Bold typography + composition", "Consistent style system for your channel", "A/B variation if requested"],
      delivers: "JPG/PNG at 1280×720 (YouTube spec)",
    },
    "Event Promotion": {
      tagline: "Build the hype before the doors open.",
      desc: "Event flyers, digital banners, countdown graphics, and social posts — everything needed to build awareness and drive attendance, in print and digital formats.",
      includes: ["Event flyer (print + digital versions)", "Social media graphics (feed + story)", "Email header or digital banner", "Save-the-date or countdown graphic"],
      delivers: "PDF (print) + PNG/JPG (digital, all sizes)",
    },
  };

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const videoBgOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 80);
          ticking = false;
        });
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const heroStagger = HERO_STAGGER;
  const heroItem = HERO_ITEM;

  const projects: Project[] = [
    {
      name: "Spark Pro Services",
      client: "Spark Pro Services",
      category: "Brand Identity / Web",
      bg: "#e34d37",
      labelColor: "#fff",
      nameColor: "#fff",
      clientColor: "rgba(255,255,255,0.7)",
      desc: "Construction company full rebrand — logo, web, apparel, signage",
      images: ["/spark-1.png", "/spark-2.png", "/spark-3.png", "/spark-4.png", "/spark-5.png", "/spark-6.png"],
      caseStudy: {
        stats: [
          { value: "6+", label: "Brand Deliverables" },
          { value: "100%", label: "Identity from Scratch" },
          { value: "4", label: "Touchpoints Covered" },
        ],
        challenge: "Spark Pro Services had been operating for years under a forgettable name with no real visual identity. They were losing bids to competitors who simply looked more established and professional — not because of the quality of their work, but because their brand didn't reflect it. They needed a full rebrand that communicated trust, strength, and capability across every touchpoint: proposals, job site apparel, signage, and digital.",
        approach: "I built the identity around tension: raw industrial energy meets precision craft. The name 'Spark' gave me an immediate visual direction — fire, ignition, momentum. I chose a high-contrast palette anchored in bold orange-red paired with heavy condensed type that commands authority whether it's on a work truck or a contract PDF. Every asset — logo, web layout, work shirts, signage — was designed to make them look like the most established contractor in the room before they say a word.",
      },
    },
    {
      name: "Billy Brunch NYC",
      client: "Billy Brunch NYC",
      category: "Brand Identity / Merch",
      bg: "#7ba9ae",
      labelColor: "#e34d37",
      nameColor: "#fff",
      clientColor: "rgba(255,255,255,0.6)",
      desc: "Full brand suite — social graphics, hoodie, tote bag, signage",
      images: [
        "/billy-new-1.png", "/billy-new-2.png", "/billy-new-3.png", "/billy-new-4.png",
        "/billy-new-5.png", "/billy-new-6.png", "/billy-new-7.png", "/billy-new-8.png", "/billy-new-9.png"
      ],
      caseStudy: {
        stats: [
          { value: "9", label: "Assets Delivered" },
          { value: "3", label: "Merch Formats" },
          { value: "1", label: "Cohesive Brand System" },
        ],
        challenge: "Billy Brunch NYC needed a brand identity that could live in two very different places at once — on a New York City Instagram feed competing against hundreds of brunch spots, and on a hoodie someone actually wants to wear outside the restaurant. The challenge was finding a visual voice distinct enough to own a lane in an oversaturated market, while staying warm and unpretentious enough to match the vibe of the space itself.",
        approach: "I anchored the brand in a soft muted teal — warm enough for a Sunday morning, refined enough to not look like every other food brand on the explore page. The logomark uses loose, confident letterforms with just enough structure to feel intentional rather than amateur. For merch — hoodie, tote, and cap — I prioritized wearability over branding volume. Every piece was designed to feel like something you'd find at a boutique, not just a freebie from a restaurant.",
      },
    },
    {
      name: "Chino Club",
      client: "Chino Club",
      category: "Brand Identity / Events",
      bg: "#f5f508",
      labelColor: "#0015ff",
      nameColor: "#000",
      clientColor: "#333",
      desc: "Full visual identity — signage, merch, posters, tote bags",
      images: [
        "/chino-new-1.png", "/chino-new-2.png", "/chino-new-3.png", "/chino-new-4.png",
        "/chino-new-5.png", "/chino-new-6.png", "/chino-new-7.png", "/chino-new-8.png", "/chino-new-9.png",
        "/chino-new-10.png", "/chino-new-11.png", "/chino-new-12.png"
      ],
      caseStudy: {
        stats: [
          { value: "12", label: "Deliverables" },
          { value: "3", label: "Merch Types" },
          { value: "2", label: "Event Series" },
        ],
        challenge: "Chino Club needed an identity that could do serious heavy lifting — work on a 10-foot banner outside a venue, read instantly in a 1-second scroll on Instagram, and look sharp on a tote bag someone carries around the city for months. The brand had to be loud enough to own a room but deliberate enough to build real recognition and feel collectible over time.",
        approach: "High-voltage yellow and electric blue was the call the moment I understood their energy — that combination is impossible to ignore and creates instant, sticky recall. I leaned hard into rave-era graphic language: bold condensed type, blocky grid layouts, and graphic shapes that print cleanly at any scale. Every deliverable — posters, tote bags, signage, social graphics — was designed to feel like a limited-run piece someone keeps, not just another branded handout.",
      },
    },
    {
      name: "Cold Little Heart",
      client: "Cold Little Heart",
      category: "Merch / Apparel",
      bg: "#2a2a2a",
      labelColor: "#e34d37",
      nameColor: "#fff",
      clientColor: "rgba(255,255,255,0.5)",
      desc: "Vintage-style graphic tee with flaming heart illustration",
      images: [
        "/clh-1.png", "/clh-2.png", "/clh-3.png", "/clh-4.png", "/clh-5.png",
        "/clh-6.png", "/clh-7.png", "/clh-8.png", "/clh-9.png"
      ],
      caseStudy: {
        stats: [
          { value: "1", label: "Hero Illustration" },
          { value: "3", label: "Colorways" },
          { value: "100%", label: "Hand-drawn Feel" },
        ],
        challenge: "Cold Little Heart wanted a graphic tee that felt genuinely worn-in and emotionally authentic — not a slogan shirt, not a logo drop. The kind of piece that looks like it surfaced from a vintage store, carries real weight, and sells itself without needing a caption. The name set a very specific emotional tone — melancholy, raw, a little romantic — and the visual had to earn that without being on the nose.",
        approach: "I went straight to illustration — a flaming heart rendered with intentional hand-drawn imperfection that reads vintage without trying too hard. Distressed textures, a tight 3-color palette, and aged typography gave the shirt that lived-in quality from day one. The graphic sits center-chest: confident, self-contained, and meaningful without competing for attention. Three colorway options were presented so the client could choose what felt right for their audience.",
      },
    },
    {
      name: "Aware Coffee",
      client: "Aware Coffee",
      category: "Brand Identity / Packaging",
      bg: "#f5f5f0",
      labelColor: "#e34d37",
      nameColor: "#111",
      clientColor: "#555",
      desc: "Product launch campaign, cup mockups, social media graphics",
      images: ["/aware-coffee-1.png", "/aware-coffee-2.png", "/aware-coffee-3.png", "/aware-coffee-4.png", "/aware-coffee-5.png"],
      caseStudy: {
        stats: [
          { value: "5", label: "Campaign Visuals" },
          { value: "0→1", label: "Brand Built from Scratch" },
          { value: "3", label: "Platform Formats" },
        ],
        challenge: "Aware Coffee was launching from zero — no existing brand equity, no visual language, just a name, a product, and the ambition to compete in a specialty coffee market full of established, well-funded brands. They needed to look premium and intentional on Instagram from day one, build enough credibility to justify their price point, and do it all without an agency budget.",
        approach: "I made restraint the strategy. Clean off-white backgrounds, minimal type, and a single warm accent used sparingly — nothing that would date the brand or distract from the product. 'Aware' pushed me toward clarity and mindfulness, so I stripped anything decorative. The cup mockups were styled to feel editorial rather than promotional — the kind of content that performs whether someone's scrolling at 7am or seeing it on a shelf. Every asset was built to work across feed posts, stories, and print without modification.",
      },
    },
    {
      name: "Non-Profits",
      client: "Churches & Non-Profits",
      category: "Event Design / Sermon Series",
      bg: "#0f1f3d",
      labelColor: "#FF4D00",
      nameColor: "#fff",
      clientColor: "rgba(255,255,255,0.5)",
      desc: "Sermon series, event graphics, and campaign visuals for churches and non-profit organizations.",
      caseStudy: {
        stats: [
          { value: "14+", label: "Graphics Delivered" },
          { value: "10+", label: "Orgs Served" },
          { value: "4 yrs", label: "Ongoing Work" },
        ],
        challenge: "Churches and non-profits operate on some of the tightest budgets in any sector, yet they have among the most ambitious communication goals — inspire, inform, and mobilize communities, often on a weekly cadence with zero room for missed deadlines. Each sermon series or fundraising campaign requires its own distinct visual world that feels fresh and purposeful, while remaining cohesive with the organization's existing identity.",
        approach: "I treated every series like a short-run editorial campaign rather than a templated graphic job. Each project got its own unique typographic system, color palette, and graphic language built around the theme — so every launch felt like a real event worth attending, not recycled artwork with swapped text. Over 4 years and 10+ organizations, I've developed a process that delivers fast without cutting corners on craft — because communities deserve design that takes them seriously.",
      },
      images: [
        "/np-1.png", "/np-2.png", "/np-3.png", "/np-4.png",
        "/np-5.png", "/np-6.png", "/np-7.png", "/np-8.png",
        "/np-9.png", "/np-10.png", "/np-11.png", "/np-12.png",
        "/np-13.png", "/np-14.png"
      ],
    },
  ];

  const testimonials = [
    {
      quote: "Our entire church loved the shirt Isaac designed for us! Isaac was so easy to work with. We had thought we wanted to go one direction and then after seeing the concepts he put together for us, we liked the other option he threw out even more.",
      name: "Shera Errico",
      org: "",
    },
    {
      quote: "Isaac Figueroa is the real deal. He helped me build out my company's website, business cards, and branded hats, and everything came out better than I imagined. He just gets it! I didn't have to micromanage anything. He took the vision and ran with it, and the whole brand feels cohesive and legit now. If you need someone creative, reliable, and easy to work with, Isaac is your guy. Highly recommend, no hesitation.",
      name: "Jesus Rojas",
      org: "Ranch Valley Contracting",
    },
    {
      quote: "Isaac made me excited for the event and I'm the one planning the dang thing LOL!",
      name: "Djuna S.",
      org: "CC Network",
    },
    {
      quote: "Isaac did fantastic on these and worked diligently from before Christmas break until now to help me get them just right!",
      name: "Christianna Barbosa",
      org: "COTR",
    },
    {
      quote: "Isaac did a great job on this! He worked with us until we got a design that fits our needs perfectly. Thanks Isaac!",
      name: "Janna Bartosh",
      org: "",
    },
    {
      quote: "Simple, fun, got it done. As the Creative Director it's great to see good design that I was 0% a part of implementing. Isaac is a big favorite around here.",
      name: "Jacob Whipple",
      org: "Mosaic",
    },
    {
      quote: "Isaac crushed this project. It looks even better than I imagined. Loved that he gave me a few different options and then made all the collateral so it will be easy to update the pictures and post to socials. Great job!",
      name: "Lacey Quebe",
      org: "",
    },
  ];

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground overflow-x-hidden selection:bg-[#FF4D00] selection:text-black font-sans rounded-none" style={{ cursor: "none" }}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[999999] focus:bg-[#FF4D00] focus:text-black focus:px-4 focus:py-2 focus:font-sans focus:font-semibold focus:text-sm focus:uppercase focus:tracking-wide"
      >
        Skip to main content
      </a>
      <CustomCursor />
      {/* 1. STICKY NAV */}
      <nav
        aria-label="Main navigation"
        className={`fixed top-0 left-0 w-full px-8 md:px-16 py-4 md:py-6 flex justify-between items-center z-50 transition-all duration-300 rounded-none ${scrolled ? 'backdrop-blur-sm border-b border-[#1a1a1a] bg-background/80' : 'bg-transparent border-b border-transparent'}`}
      >
        <a href="#main-content" className="font-serif font-bold text-2xl text-[#F5F0E8] uppercase" data-testid="nav-logo" aria-label="Isaac Figueroa — home">
          IF.
        </a>
        <div className="flex gap-6 md:gap-8 font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <a href="#work" className="hover:text-[#F5F0E8] transition-colors" data-testid="link-nav-work">WORK</a>
          <a href="#about" className="hover:text-[#F5F0E8] transition-colors" data-testid="link-nav-about">ABOUT</a>
          <a href="#contact" className="hover:text-[#F5F0E8] transition-colors" data-testid="link-nav-contact">CONTACT</a>
        </div>
      </nav>
      {/* 2. HERO */}
      <main id="main-content">
      <section ref={heroRef} className="relative h-[100dvh] w-full flex flex-col md:flex-row rounded-none overflow-hidden">
        {/* VIDEO BACKGROUND */}
        <motion.div
          style={{ opacity: videoBgOpacity }}
          className="absolute inset-0 z-0 pointer-events-none"
          aria-hidden="true"
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            style={{ filter: "grayscale(100%)", opacity: 0.18 }}
          >
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
        </motion.div>
        {/* LEFT COLUMN */}
        <div className="w-full md:w-[55%] h-full flex flex-col justify-center px-8 md:px-16 pt-24 md:pt-0 rounded-none">
          <motion.div 
            variants={heroStagger}
            initial="hidden"
            animate="show"
            className="flex flex-col"
          >
            <motion.div variants={heroItem} className="font-sans font-light text-xs tracking-[0.25em] text-muted-foreground uppercase mb-6 md:mb-8">
              CREATIVE DESIGNER / LAS VEGAS
            </motion.div>
            
            <motion.div variants={heroItem} className="flex flex-col">
              <h1 className="flex flex-col m-0 p-0">
                <span className="font-serif font-extrabold text-[clamp(5rem,14vw,13rem)] leading-[0.85] tracking-[-0.03em] text-[#F5F0E8] uppercase">
                  ISAAC
                </span>
                <span className="font-serif font-extrabold text-[clamp(5rem,14vw,13rem)] leading-[0.85] tracking-[-0.03em] text-[#FF4D00] uppercase">
                  FIGUEROA
                </span>
              </h1>
            </motion.div>

            <motion.div variants={heroItem} className="mt-8 mb-12">
              <p className="font-sans font-light text-sm text-muted-foreground max-w-xs leading-relaxed">
                Building brands and visuals that stop the scroll — from print to digital.
              </p>
            </motion.div>

            <motion.div variants={heroItem} className="flex gap-4">
              <div className="font-serif font-medium text-xs text-[#F5F0E8] border border-[#2a2a2a] px-4 py-2 uppercase rounded-none">
                5+ YRS
              </div>
              <div className="font-serif font-medium text-xs text-[#F5F0E8] border border-[#2a2a2a] px-4 py-2 uppercase rounded-none">
                500+ PROJECTS
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* BOTTOM MARQUEE */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden border-t border-[#1a1a1a] bg-background flex rounded-none whitespace-nowrap py-3" aria-hidden="true">
          <div className="animate-marquee flex gap-8 items-center min-w-max">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-8 font-serif font-medium text-sm uppercase tracking-[0.15em] text-[#F5F0E8]">
                <span>BRAND IDENTITY</span> <span className="text-[#2a2a2a] text-[8px]">●</span>
                <span>CAMPAIGN DESIGN</span> <span className="text-[#2a2a2a] text-[8px]">●</span>
                <span>SOCIAL CONTENT</span> <span className="text-[#2a2a2a] text-[8px]">●</span>
                <span>WEB DESIGN</span> <span className="text-[#2a2a2a] text-[8px]">●</span>
                <span>MERCH</span> <span className="text-[#2a2a2a] text-[8px]">●</span>
                <span>PRINT</span> <span className="text-[#2a2a2a] text-[8px]">●</span>
                <span>EVENT DESIGN</span> <span className="text-[#2a2a2a] text-[8px]">●</span>
                <span>TYPOGRAPHY</span> <span className="text-[#2a2a2a] text-[8px]">●</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* 2. WORK */}
      <section id="work" className="w-full border-t border-[#1a1a1a]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between px-8 md:px-16 pt-24 pb-16 gap-6"
        >
          <div className="flex items-end gap-5">
            <h2 className="font-serif font-bold text-5xl md:text-7xl text-[#F5F0E8] uppercase m-0 leading-none">
              RECENT PROJECTS
            </h2>
            <div className="hidden md:block mb-2" style={{ transform: "skewX(-10deg)" }}>
              <div className="bg-[#FF4D00] px-3 py-1">
                <span className="font-sans font-bold text-[10px] text-black uppercase tracking-widest" style={{ display: "block", transform: "skewX(10deg)" }}>2021–NOW</span>
              </div>
            </div>
          </div>
          <div className="font-sans font-light text-sm text-muted-foreground tracking-widest">(06)</div>
        </motion.div>

        {/* Editorial list */}
        <div className="border-t border-[#1a1a1a] relative">

          {/* Floating image preview — fixed to right side while hovering */}
          <AnimatePresence>
            {hoveredProject?.images?.[0] && (
              <motion.div
                key={hoveredProject.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="fixed pointer-events-none z-40 hidden lg:block"
                style={{ right: "6vw", top: "50vh", transform: "translateY(-50%)" }}
                aria-hidden="true"
              >
                <div style={{ width: 340, height: 240 }} className="overflow-hidden">
                  <img
                    src={hoveredProject.images[0]}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {projects.map((project, i) => (
            <motion.div
              key={i}
              role="button"
              tabIndex={0}
              aria-label={`View ${project.name} — ${project.category}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.04 }}
              className="group border-b border-[#1a1a1a] cursor-pointer"
              onClick={() => setSelectedIndex(i)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedIndex(i); } }}
              onMouseEnter={() => setHoveredProject(project)}
              onMouseLeave={() => setHoveredProject(null)}
              data-testid={`card-project-${i}`}
            >
              <div className="project-card-row flex items-center px-8 md:px-16 py-7 md:py-9 gap-6 md:gap-10 group-hover:bg-[#111] border-l-2 border-transparent group-hover:border-[#FF4D00] transition-all duration-200">
                {/* Number */}
                <span className="font-sans font-light text-[11px] text-[#F5F0E8]/20 w-7 flex-shrink-0 tabular-nums select-none" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Name */}
                <h3 className="font-serif font-bold uppercase text-[clamp(1.6rem,4vw,3.5rem)] text-[#F5F0E8] leading-none flex-1 group-hover:text-[#FF4D00] transition-colors duration-300 tracking-tight">
                  {project.name}
                </h3>

                {/* Category + Client — hidden on mobile */}
                <div className="hidden md:flex flex-col items-end gap-[5px] flex-shrink-0 min-w-[160px]" aria-hidden="true">
                  <span className="font-sans font-light text-[10px] uppercase tracking-[0.22em] text-[#F5F0E8]/40 text-right">
                    {project.category}
                  </span>
                  <span className="font-sans font-light text-[10px] text-[#F5F0E8]/25 text-right">
                    {project.client}
                  </span>
                </div>

                {/* Color swatch for projects without images (visible only on hover) */}
                {!project.images?.length && (
                  <div
                    className="hidden md:block w-6 h-6 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ backgroundColor: project.bg }}
                    aria-hidden="true"
                  />
                )}

                {/* Arrow */}
                <span className="project-card-arrow font-sans text-base text-[#F5F0E8]/20 group-hover:text-[#FF4D00] group-hover:translate-x-2 transition-all duration-300 flex-shrink-0 select-none" aria-hidden="true">
                  →
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. ABOUT */}
      <section id="about" className="w-full border-t border-[#1a1a1a] rounded-none">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-12 rounded-none"
        >
          {/* LEFT — photo flush */}
          <div className="md:col-span-5 overflow-hidden" style={{ background: "#0D0D0D", minHeight: "420px" }}>
            <img
              src="/profile-photo.png"
              alt="Isaac Figueroa"
              style={{
                width: "100%",
                height: "100%",
                display: "block",
                objectFit: "cover",
                objectPosition: "center top",
                filter: "grayscale(100%)",
              }}
              loading="lazy"
            />
          </div>

          {/* RIGHT */}
          <div className="md:col-span-7 flex flex-col justify-start rounded-none px-8 md:px-16 pt-10 pb-10 md:pt-12 md:pb-12">
            <div className="font-sans font-light text-xs text-muted-foreground uppercase tracking-[0.2em] mb-2" aria-hidden="true">
              03
            </div>
            <div className="font-sans font-light text-xs text-muted-foreground uppercase tracking-[0.2em] mb-6">
              ABOUT ISAAC
            </div>
            <p className="font-sans font-light text-lg md:text-xl text-[#F5F0E8] leading-loose max-w-xl mb-8">
              Creative designer with 5+ years building high-impact visuals for non-profits, brands, and digital communities. I specialize in brand identity, campaign design, and social content that drives real engagement — and I bring the same level of craft whether the work lives on a screen, in print, or on a stage.
            </p>
            <p className="font-sans font-light italic text-sm md:text-base text-muted-foreground max-w-xl mb-12">Currently freelancing and designing at The Squad.</p>

            <div className="flex flex-wrap gap-3 rounded-none">
              {[
                "Brand Identity", "Campaign Design", "Social Media Graphics",
                "Web Design", "Print & Marketing", "Typography",
                "Layout & Composition", "Merch Design", "YouTube Thumbnails", "Event Promotion"
              ].map((tag, i) => (
                <button
                  key={i}
                  onClick={() => setActiveService(activeService === tag ? null : tag)}
                  aria-expanded={activeService === tag}
                  aria-label={`Learn about ${tag}`}
                  className={`font-sans font-light text-xs uppercase tracking-[0.15em] px-4 py-2 border transition-colors duration-200 rounded-none focus:outline-none focus:ring-1 focus:ring-[#FF4D00] ${
                    activeService === tag
                      ? "border-[#FF4D00] text-[#FF4D00] bg-[#FF4D00]/5"
                      : "border-[#2a2a2a] text-[#F5F0E8] hover:border-[#FF4D00] hover:text-[#FF4D00]"
                  }`}
                >
                  {tag}
                  <span className="ml-2 opacity-50 text-[10px]" aria-hidden="true">
                    {activeService === tag ? "−" : "+"}
                  </span>
                </button>
              ))}
            </div>

            {/* Service info panel */}
            <AnimatePresence>
              {activeService && serviceInfo[activeService] && (
                <motion.div
                  key={activeService}
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 border border-[#FF4D00]/30 bg-[#FF4D00]/4 p-6 max-w-xl">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="font-sans font-light text-[10px] uppercase tracking-[0.25em] text-[#FF4D00] mb-1">
                          {activeService}
                        </div>
                        <p className="font-serif font-medium text-base text-[#F5F0E8] leading-snug">
                          {serviceInfo[activeService].tagline}
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveService(null)}
                        aria-label="Close service details"
                        className="text-muted-foreground hover:text-[#F5F0E8] transition-colors flex-shrink-0 mt-1"
                      >
                        <span className="text-sm" aria-hidden="true">✕</span>
                      </button>
                    </div>

                    {/* Description */}
                    <p className="font-sans font-light text-sm text-muted-foreground leading-relaxed mb-4">
                      {serviceInfo[activeService].desc}
                    </p>

                    {/* Includes */}
                    <div className="mb-4">
                      <div className="font-sans font-light text-[10px] uppercase tracking-[0.2em] text-[#F5F0E8]/40 mb-2">
                        What's Included
                      </div>
                      <ul className="space-y-1">
                        {serviceInfo[activeService].includes.map((item, i) => (
                          <li key={i} className="font-sans font-light text-sm text-[#F5F0E8]/80 flex items-start gap-2">
                            <span className="text-[#FF4D00] mt-[2px] flex-shrink-0" aria-hidden="true">→</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Deliverables */}
                    <div className="pt-3 border-t border-[#2a2a2a]">
                      <span className="font-sans font-light text-[10px] uppercase tracking-[0.2em] text-[#F5F0E8]/40">
                        Final Deliverables&nbsp;&nbsp;
                      </span>
                      <span className="font-sans font-light text-xs text-[#FF4D00]">
                        {serviceInfo[activeService].delivers}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* 5. EXPERIENCE */}
      <section id="experience" className="w-full py-32 px-8 md:px-16 border-t border-[#1a1a1a] rounded-none">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-start gap-6 md:gap-16 mb-20 rounded-none"
        >
          <div className="font-serif font-medium text-xs text-muted-foreground tracking-widest uppercase md:mt-4" aria-hidden="true">
            04
          </div>
          <h2 className="font-serif font-bold text-5xl md:text-7xl text-[#F5F0E8] uppercase m-0 leading-none">
            EXPERIENCE
          </h2>
        </motion.div>

        <div className="flex flex-col rounded-none">
          {[
            {
              year: "2021–PRESENT",
              role: "CREATIVE DESIGNER",
              company: "THE SQUAD — NON-PROFIT & COMMUNITY ORGS",
              bullets: [
                "Designed social media graphics, posters, thumbnails, and print materials for non-profit and community organizations across the U.S.",
                "Built cohesive visual systems for fundraising campaigns, youth events, and seasonal sermon series — translating mission-driven messaging into compelling storytelling.",
                "Partnered directly with leadership and marketing teams to develop brand voices and campaign strategies from concept to delivery."
              ]
            },
            {
              year: "2021",
              role: "GRAPHIC DESIGNER",
              company: "VIVE MEDIA",
              bullets: [
                "Created social graphics, thumbnails, and marketing assets for digital campaigns and live events.",
                "Produced on-brand visuals with fast turnaround across multiple concurrent campaigns."
              ]
            },
            {
              year: "2020–2021",
              role: "JUNIOR GRAPHIC DESIGNER",
              company: "VIBRANT MEDIA",
              bullets: [
                "Designed social media and digital graphics for multiple client brands simultaneously.",
                "Produced promotional visuals for campaigns, events, and digital ad placements."
              ]
            }
          ].map((job, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`py-10 md:py-14 flex flex-col md:grid md:grid-cols-12 gap-8 md:gap-16 border-[#1a1a1a] rounded-none ${i !== 0 ? 'border-t' : ''}`}
            >
              <div className="md:col-span-3 font-sans font-light text-xs text-muted-foreground tracking-wide">
                {job.year}
              </div>
              <div className="md:col-span-4 flex flex-col rounded-none">
                <h3 className="font-serif font-semibold text-xl md:text-2xl text-[#F5F0E8] uppercase mb-2">{job.role}</h3>
                <div className="font-serif font-normal text-base text-[#FF4D00]">{job.company}</div>
              </div>
              <div className="md:col-span-5 rounded-none">
                <ul className="flex flex-col gap-3 font-sans font-light text-sm text-muted-foreground leading-loose list-none p-0 m-0">
                  {job.bullets.map((bullet, j) => (
                    <li key={j} className="relative pl-4 before:content-[''] before:absolute before:left-0 before:top-2 before:w-1 before:h-1 before:bg-[#2a2a2a] before:rounded-none">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Training + Languages */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-px bg-[#1a1a1a] border-t border-[#1a1a1a]">
          <div className="bg-[#0D0D0D] py-10 pr-10">
            <div className="font-sans font-light text-[10px] uppercase tracking-[0.25em] text-[#FF4D00] mb-6">Training</div>
            <ul className="flex flex-col gap-4 list-none p-0 m-0">
              {[
                { course: "Google UX/UI Design", source: "Coursera / Google" },
                { course: "Typography & Design", source: "The Futur — Chris Do" },
                { course: "Figma for Designers", source: "Max Brinckmann" },
              ].map((t, i) => (
                <li key={i} className="flex flex-col gap-0.5">
                  <span className="font-sans font-light text-sm text-[#F5F0E8]">{t.course}</span>
                  <span className="font-sans font-light text-xs text-muted-foreground">{t.source}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#0D0D0D] py-10 pl-10">
            <div className="font-sans font-light text-[10px] uppercase tracking-[0.25em] text-[#FF4D00] mb-6">Languages</div>
            <ul className="flex flex-col gap-4 list-none p-0 m-0">
              {[
                { lang: "English", level: "Fluent" },
                { lang: "Spanish", level: "Fluent" },
              ].map((l, i) => (
                <li key={i} className="flex items-center justify-between max-w-xs">
                  <span className="font-sans font-light text-sm text-[#F5F0E8]">{l.lang}</span>
                  <span className="font-sans font-light text-xs text-muted-foreground uppercase tracking-widest">{l.level}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      {/* 5.5 TESTIMONIALS */}
      <section id="testimonials" className="w-full border-t border-[#1a1a1a] py-24 overflow-hidden" aria-label="Client testimonials">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between px-8 md:px-16 mb-14 gap-4"
        >
          <div className="flex items-end gap-5">
            <h2 className="font-serif font-bold text-5xl md:text-7xl text-[#F5F0E8] uppercase m-0 leading-none">
              CLIENT LOVE
            </h2>
          </div>
          <p className="font-sans font-light text-sm text-muted-foreground max-w-xs">
            Real words from real clients — unedited.
          </p>
        </motion.div>

        {/* Row 1 — scrolls left */}
        <div
          className="testimonials-track-wrapper"
          onMouseEnter={e => (e.currentTarget.querySelector('.testimonials-track-left') as HTMLElement | null)?.style.setProperty('animation-play-state', 'paused')}
          onMouseLeave={e => (e.currentTarget.querySelector('.testimonials-track-left') as HTMLElement | null)?.style.setProperty('animation-play-state', 'running')}
        >
          <div className="testimonials-track-left flex gap-5" aria-hidden="false">
            {[...testimonials, ...testimonials].map((t, i) => (
              <div
                key={i}
                className="testimonial-card flex-shrink-0 w-[340px] md:w-[420px] bg-[#111] border border-[#1e1e1e] p-7 flex flex-col justify-between gap-6"
                aria-label={i < testimonials.length ? `Testimonial from ${t.name}${t.org ? `, ${t.org}` : ""}` : undefined}
                aria-hidden={i >= testimonials.length ? "true" : undefined}
              >
                <p className="font-sans font-light text-sm text-[#F5F0E8]/80 leading-loose">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <div className="w-6 h-[1px] bg-[#FF4D00] mb-3" aria-hidden="true" />
                  <div className="font-sans font-semibold text-xs text-[#FF4D00] uppercase tracking-[0.18em]">
                    {t.name}
                  </div>
                  {t.org && (
                    <div className="font-sans font-light text-[10px] text-muted-foreground uppercase tracking-[0.15em] mt-1">
                      {t.org}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 — scrolls right */}
        <div
          className="testimonials-track-wrapper mt-5"
          onMouseEnter={e => (e.currentTarget.querySelector('.testimonials-track-right') as HTMLElement | null)?.style.setProperty('animation-play-state', 'paused')}
          onMouseLeave={e => (e.currentTarget.querySelector('.testimonials-track-right') as HTMLElement | null)?.style.setProperty('animation-play-state', 'running')}
        >
          <div className="testimonials-track-right flex gap-5" aria-hidden="true">
            {[...testimonials, ...testimonials].map((t, i) => (
              <div
                key={i}
                className="testimonial-card flex-shrink-0 w-[340px] md:w-[420px] bg-[#0f0f0f] border border-[#1a1a1a] p-7 flex flex-col justify-between gap-6"
              >
                <p className="font-sans font-light text-sm text-[#F5F0E8]/60 leading-loose">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div>
                  <div className="w-6 h-[1px] bg-[#2a2a2a] mb-3" aria-hidden="true" />
                  <div className="font-sans font-semibold text-xs text-[#F5F0E8]/40 uppercase tracking-[0.18em]">
                    {t.name}
                  </div>
                  {t.org && (
                    <div className="font-sans font-light text-[10px] text-muted-foreground uppercase tracking-[0.15em] mt-1">
                      {t.org}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* 6. CONTACT + FOOTER */}
      <section id="contact" className="w-full pt-40 pb-10 px-8 md:px-16 border-t border-[#1a1a1a] rounded-none flex flex-col justify-between min-h-screen">
        <div className="flex-1 flex flex-col justify-center rounded-none">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col rounded-none"
          >
            <div className="font-serif font-medium text-xs text-muted-foreground tracking-widest uppercase mb-12" aria-hidden="true">
              05
            </div>
            <h2 className="font-serif font-bold text-[clamp(3.5rem,10vw,9rem)] leading-[0.9] text-[#F5F0E8] uppercase m-0">
              LET'S WORK<br />TOGETHER<span className="text-[#FF4D00]">.</span>
            </h2>
            
            <p className="font-sans font-light text-sm text-muted-foreground mt-12 mb-16 max-w-md">
              Open for freelance projects, brand collaborations, and full-time opportunities.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-24 rounded-none">
              <button
                className="bg-[#FF4D00] text-black font-serif font-semibold uppercase tracking-wide px-8 py-4 text-sm hover:opacity-90 transition-opacity rounded-none"
                data-testid="button-start-project"
                onClick={() => setContactFormOpen(true)}
              >
                START A PROJECT
              </button>
              <button 
                className="border border-[#F5F0E8] text-[#F5F0E8] font-serif font-semibold uppercase tracking-wide px-8 py-4 text-sm hover:bg-[#1a1a1a] transition-colors rounded-none"
                data-testid="button-resume"
                onClick={() => setResumeOpen(true)}
              >
                VIEW RESUME
              </button>
            </div>

            <div className="flex flex-wrap gap-8 font-sans font-light text-xs text-muted-foreground tracking-wide rounded-none">
              <a href="mailto:isaacfigueroa561@gmail.com" className="hover:text-[#F5F0E8] transition-colors" data-testid="link-email">isaacfigueroa561@gmail.com</a>
              <a href="tel:+17027880115" className="hover:text-[#F5F0E8] transition-colors" data-testid="link-phone">+1 (702) 788-0115</a>
              <span>English / Spanish</span>
            </div>
          </motion.div>
        </div>

        {/* FOOTER */}
        <footer className="mt-40 pt-10 border-t border-[#1a1a1a] flex flex-col md:flex-row justify-between items-start md:items-center gap-8 rounded-none">
          <div className="flex flex-col gap-2 rounded-none">
            <div className="font-serif font-semibold text-sm text-[#F5F0E8] uppercase tracking-[0.15em]">
              ISAAC FIGUEROA
            </div>
            <div className="font-sans font-light text-xs text-muted-foreground">
              © 2025 ISAAC FIGUEROA. ALL RIGHTS RESERVED.
            </div>
          </div>

          <div className="flex gap-8 font-sans font-light text-xs text-muted-foreground uppercase tracking-wide rounded-none">
            <a href="https://www.instagram.com/ifig12/" target="_blank" rel="noopener noreferrer" className="hover:text-[#F5F0E8] transition-colors" data-testid="link-instagram">INSTAGRAM</a>
            <a href="https://www.linkedin.com/in/isaac-figueroa-498358150/" target="_blank" rel="noopener noreferrer" className="hover:text-[#F5F0E8] transition-colors" data-testid="link-linkedin">LINKEDIN</a>
          </div>
        </footer>
      </section>
      {resumeOpen && <ResumeModal onClose={() => setResumeOpen(false)} />}
      <AnimatePresence>
        {contactFormOpen && <ContactFormModal key="contact-form" onClose={() => setContactFormOpen(false)} />}
        {selectedIndex !== null && <CarouselModal key="carousel" projects={projects} initialIndex={selectedIndex} onClose={() => setSelectedIndex(null)} />}
      </AnimatePresence>
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;