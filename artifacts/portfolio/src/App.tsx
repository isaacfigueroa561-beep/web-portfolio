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
};

function CustomCursor() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
    };
    const onOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      setHovered(
        !!(el.closest("button") || el.closest("a") || el.closest("[data-cursor-hover]") || el.closest(".group"))
      );
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
    };
  }, [visible]);

  return (
    <motion.div
      aria-hidden="true"
      className="custom-cursor fixed pointer-events-none z-[99999] select-none"
      style={{ left: pos.x, top: pos.y, translateX: "-50%", translateY: "-50%" }}
      animate={{ opacity: visible ? 1 : 0, scale: hovered ? 1.6 : 1 }}
      transition={{ scale: { duration: 0.18, ease: "easeOut" }, opacity: { duration: 0.3 } }}
    >
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
        style={{
          display: "block",
          fontSize: 26,
          color: "#FF4D00",
          fontWeight: 900,
          lineHeight: 1,
          fontFamily: "sans-serif",
        }}
      >
        ✳
      </motion.span>
    </motion.div>
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const project = projects[currentIndex];

  const go = useCallback((dir: number) => {
    setDirection(dir);
    setCurrentIndex((i) => (i + dir + projects.length) % projects.length);
  }, [projects.length]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const prev = document.activeElement as HTMLElement | null;
    const timer = setTimeout(() => dialogRef.current?.focus(), 50);
    return () => { clearTimeout(timer); document.body.style.overflow = ""; prev?.focus(); };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
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
  }, [onClose, go]);

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

  /* ---------- RENDER ---------- */
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
        {/* Prev arrow */}
        <button
          onClick={() => go(-1)}
          aria-label={`Previous: ${projects[(currentIndex - 1 + projects.length) % projects.length].name}`}
          className="absolute left-3 md:left-8 z-20 w-10 h-10 md:w-14 md:h-14 flex items-center justify-center text-[#F5F0E8]/25 hover:text-[#FF4D00] hover:bg-white/5 transition-all duration-200"
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
            className="absolute inset-0 flex flex-col items-center justify-center px-16 md:px-28 py-6"
          >
            {project.images && project.images.length > 0 ? (
              <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
                {project.phoneFrame ? (
                  <div
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
                      src={project.images[0]}
                      alt={`${project.name} — ${project.category}`}
                      className="w-full h-auto block"
                      loading="eager"
                    />
                  </div>
                ) : (
                  <img
                    src={project.images[0]}
                    alt={`${project.name} — ${project.category}`}
                    className="max-w-full max-h-[55vh] object-contain"
                    loading="eager"
                  />
                )}
              </div>
            ) : (
              <div
                className="w-full max-w-2xl h-56 md:h-72 flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: project.bg }}
              >
                <span
                  className="font-serif font-bold text-3xl md:text-5xl uppercase tracking-tight"
                  style={{ color: project.nameColor }}
                >
                  {project.name}
                </span>
              </div>
            )}
            <div className="mt-4 md:mt-6 text-center max-w-lg px-4 flex-shrink-0">
              <p className="font-sans font-light text-sm text-muted-foreground leading-relaxed">
                {project.desc}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Next arrow */}
        <button
          onClick={() => go(1)}
          aria-label={`Next: ${projects[(currentIndex + 1) % projects.length].name}`}
          className="absolute right-3 md:right-8 z-20 w-10 h-10 md:w-14 md:h-14 flex items-center justify-center text-[#F5F0E8]/25 hover:text-[#FF4D00] hover:bg-white/5 transition-all duration-200"
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
            onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i); }}
            aria-label={`Go to ${p.name}`}
            aria-current={i === currentIndex ? "true" : undefined}
            className={`h-[3px] transition-all duration-300 ${i === currentIndex ? "w-6 bg-[#FF4D00]" : "w-[6px] bg-[#2a2a2a] hover:bg-[#555]"}`}
          />
        ))}
      </div>
    </div>
  );
}


function ContactFormModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", project: "", message: "" });
  const [sent, setSent] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Project Inquiry from ${form.name}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nProject Type: ${form.project}\n\n${form.message}`
    );
    window.open(`mailto:isaacfigueroa561@gmail.com?subject=${subject}&body=${body}`);
    setSent(true);
  };

  const inputClass = "w-full bg-transparent border-b border-[#2a2a2a] focus:border-[#FF4D00] outline-none font-sans font-light text-[#F5F0E8] text-sm py-3 placeholder:text-[#444] transition-colors";

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
        style={{ maxHeight: "90vh", overflowY: "auto" }}
        initial={{ y: "100%" }}
        animate={{ y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
        exit={{ y: "100%", transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-4 pb-2 flex-shrink-0" onClick={onClose} aria-hidden="true" style={{ cursor: "pointer" }}>
          <div className="w-10 h-[3px] bg-[#2a2a2a]" />
        </div>
        <div className="px-8 md:px-16 pt-4 pb-12">
          <div className="flex items-start justify-between mb-10">
            <div>
              <div className="font-sans font-light text-[10px] uppercase tracking-[0.25em] text-[#FF4D00] mb-1" aria-hidden="true">Get In Touch</div>
              <h3 id="contact-form-title" className="font-serif font-bold text-3xl md:text-4xl text-[#F5F0E8] uppercase m-0">Start A Project</h3>
            </div>
            <button onClick={onClose} aria-label="Close contact form" className="text-muted-foreground hover:text-[#F5F0E8] transition-colors text-2xl font-light leading-none mt-1" style={{ cursor: "none" }}>
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <div aria-live="polite" aria-atomic="true">
            {sent ? (
              <div className="py-16 text-center">
                <div className="text-[#FF4D00] font-serif font-bold text-4xl mb-4" aria-hidden="true">✓</div>
                <p className="font-sans font-light text-[#F5F0E8] text-lg mb-2">Email client opened!</p>
                <p className="font-sans font-light text-muted-foreground text-sm">Send the email and Isaac will get back to you soon.</p>
                <button onClick={onClose} className="mt-8 border border-[#2a2a2a] text-[#F5F0E8] font-sans font-light text-xs uppercase tracking-widest px-6 py-3 hover:border-[#F5F0E8] transition-colors" style={{ cursor: "none" }}>Close</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-xl" noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="cf-name" className="font-sans font-light text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Your Name *</label>
                    <input id="cf-name" required className={inputClass} placeholder="Jane Smith" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="cf-email" className="font-sans font-light text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Email *</label>
                    <input id="cf-email" required type="email" className={inputClass} placeholder="jane@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="cf-project" className="font-sans font-light text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Project Type</label>
                  <select id="cf-project" className={inputClass + " bg-[#0D0D0D]"} value={form.project} onChange={e => setForm(f => ({ ...f, project: e.target.value }))}>
                    <option value="">Select a service...</option>
                    <option value="Brand Identity">Brand Identity</option>
                    <option value="Social Content">Social Content</option>
                    <option value="Campaign Design">Campaign Design</option>
                    <option value="Merch / Apparel">Merch / Apparel</option>
                    <option value="Web Design">Web Design</option>
                    <option value="Print / Signage">Print / Signage</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="cf-message" className="font-sans font-light text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Tell Me About Your Project *</label>
                  <textarea id="cf-message" required rows={4} className={inputClass + " resize-none"} placeholder="Describe your project, timeline, and budget..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                </div>
                <button type="submit" className="self-start bg-[#FF4D00] text-black font-serif font-semibold uppercase tracking-wide px-10 py-4 text-sm hover:opacity-90 transition-opacity" style={{ cursor: "none" }}>
                  Send Message →
                </button>
              </form>
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

function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const videoBgOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const heroStagger = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const heroItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } }
  };

  const projects: Project[] = [
    {
      name: "Aware Coffee",
      client: "Aware Coffee",
      category: "Brand Identity / Packaging",
      bg: "#f5f5f0",
      labelColor: "#e34d37",
      nameColor: "#111",
      clientColor: "#555",
      desc: "Product launch campaign, cup mockups, social media graphics",
      images: ["/aware-coffee-1.png"],
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
    },
    {
      name: "Change The World",
      client: "Self-Initiated",
      category: "Print / Poster",
      bg: "#1a3aff",
      labelColor: "#FFE500",
      nameColor: "#fff",
      clientColor: "rgba(255,255,255,0.6)",
      desc: "Bold typographic print poster series in primary colors",
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
        "/chino-new-5.png", "/chino-new-6.png", "/chino-new-7.png", "/chino-new-8.png", "/chino-new-9.png"
      ],
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
    },
    {
      name: "Wallet App UI",
      client: "Concept Project",
      category: "UX/UI Design",
      bg: "#0D0D14",
      labelColor: "#5c3fff",
      nameColor: "#5c3fff",
      clientColor: "rgba(255,255,255,0.4)",
      desc: "Concept fintech app — crypto portfolio, NFT vault, send/receive flows. Designed in Figma.",
      images: ["/wallet-1.svg", "/wallet-2.svg", "/wallet-3.svg"],
      phoneFrame: true,
    },
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
      {/* 2. RECENT PROJECTS */}
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
          <div className="font-sans font-light text-sm text-muted-foreground tracking-widest">(08)</div>
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
          {/* LEFT — photo flush, transparent cutout on black */}
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
                <div
                  key={i}
                  className="font-sans font-light text-xs uppercase tracking-[0.15em] text-[#F5F0E8] border border-[#2a2a2a] px-4 py-2 hover:border-[#FF4D00] hover:text-[#FF4D00] transition-colors cursor-default rounded-none"
                >
                  {tag}
                </div>
              ))}
            </div>
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
              company: "THE SQUAD",
              bullets: [
                "Designed social media graphics, posters, and print materials for non-profits",
                "Built visual systems for fundraising campaigns and sermon series",
                "Partnered with leadership on brand strategy from concept to delivery"
              ]
            },
            {
              year: "2021",
              role: "GRAPHIC DESIGNER",
              company: "VIVE MEDIA",
              bullets: [
                "Created social graphics and marketing assets for digital campaigns and live events",
                "Delivered on-brand visuals with fast turnaround across concurrent campaigns"
              ]
            },
            {
              year: "2020–2021",
              role: "JUNIOR GRAPHIC DESIGNER",
              company: "VIBRANT MEDIA",
              bullets: [
                "Designed graphics for multiple client brands simultaneously",
                "Produced promotional visuals for campaigns, events, and digital ad placements"
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