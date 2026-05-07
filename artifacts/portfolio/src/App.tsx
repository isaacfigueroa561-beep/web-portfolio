import React, { useState, useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { motion, AnimatePresence } from "framer-motion";

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
      className="fixed pointer-events-none z-[99999] select-none"
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

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const images = project.images ?? [];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const gridContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.15 },
    },
  };

  const gridItem = {
    hidden: { opacity: 0, scale: 0.88, y: 24 },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.25 } }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      onClick={onClose}
      data-testid="project-modal"
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

      <motion.div
        className="relative w-full bg-[#0D0D0D] flex flex-col"
        style={{ height: "92vh" }}
        initial={{ y: "100%" }}
        animate={{ y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } }}
        exit={{ y: "100%", transition: { duration: 0.35, ease: [0.4, 0, 1, 1] } }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-4 pb-2 flex-shrink-0" onClick={onClose} style={{ cursor: "none" }}>
          <div className="w-10 h-[3px] bg-[#2a2a2a]" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-8 md:px-16 pt-3 pb-5 border-b border-[#1a1a1a] flex-shrink-0">
          <div className="flex flex-col gap-1">
            <div className="font-sans font-light text-[10px] uppercase tracking-[0.25em] text-[#FF4D00]">
              {project.category}
            </div>
            <h2 className="font-serif font-bold text-2xl md:text-4xl text-[#F5F0E8] uppercase leading-none">
              {project.name}
            </h2>
            <p className="font-sans font-light text-xs text-muted-foreground max-w-sm mt-1 leading-relaxed hidden md:block">
              {project.desc}
            </p>
          </div>
          <button
            onClick={onClose}
            className="font-sans font-light text-[10px] text-muted-foreground hover:text-[#F5F0E8] uppercase tracking-[0.2em] transition-colors flex items-center gap-2 mt-1 flex-shrink-0"
            data-testid="project-modal-close"
          >
            <span>CLOSE</span>
            <span className="text-base leading-none">✕</span>
          </button>
        </div>

        {/* All images — pop in together, staggered */}
        <div className="flex-1 overflow-y-auto">
          {images.length > 0 ? (
            <motion.div
              variants={gridContainer}
              initial="hidden"
              animate="show"
              className="columns-2 md:columns-3 gap-3 p-6 md:p-10 md:gap-4"
              style={{ columnGap: "12px" }}
            >
              {images.map((src, i) => (
                <motion.div
                  key={i}
                  variants={gridItem}
                  className="break-inside-avoid mb-3"
                  style={{ marginBottom: "12px" }}
                >
                  <img
                    src={src}
                    alt={`${project.name} ${i + 1}`}
                    className="w-full h-auto block"
                    draggable={false}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center px-8">
              <p className="font-sans font-light text-sm text-muted-foreground text-center max-w-md leading-relaxed">
                {project.desc}
              </p>
            </div>
          )}
        </div>

        {/* Footer count */}
        {images.length > 0 && (
          <div className="flex-shrink-0 px-8 md:px-16 py-4 border-t border-[#1a1a1a]">
            <span className="font-sans font-light text-xs text-muted-foreground tabular-nums">
              {String(images.length).padStart(2, "0")} IMAGES
            </span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function ResumeModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/90 flex flex-col"
      onClick={onClose}
      data-testid="resume-modal"
    >
      <div className="flex items-center justify-between px-8 py-4 border-b border-[#1a1a1a]">
        <span className="font-serif font-semibold text-sm text-[#F5F0E8] uppercase tracking-[0.15em]">
          Isaac Figueroa — Resume
        </span>
        <button
          onClick={onClose}
          className="font-sans font-light text-xs text-muted-foreground hover:text-[#F5F0E8] uppercase tracking-widest transition-colors"
          data-testid="resume-modal-close"
        >
          CLOSE ✕
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
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);

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
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
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
      images: ["/billy-a.jpg", "/billy-b.jpg", "/billy-c.jpg", "/billy-1.png", "/billy-2.png", "/billy-3.png", "/billy-4.png", "/billy-5.png", "/billy-6.png"],
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
        "/chino-1.jpg", "/chino-2.jpg", "/chino-3.jpg", "/chino-4.jpg",
        "/chino-5.jpg", "/chino-6.jpg", "/chino-7.jpg", "/chino-8.jpg",
        "/chino-9.jpg", "/chino-10.jpg", "/chino-11.jpg", "/chino-12.png",
        "/chino-13.png", "/chino-14.png", "/chino-15.png"
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
      images: ["/clh-1.png"],
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

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground overflow-x-hidden selection:bg-[#FF4D00] selection:text-black font-sans rounded-none" style={{ cursor: "none" }}>
      <CustomCursor />
      {/* 1. STICKY NAV */}
      <nav 
        className={`fixed top-0 left-0 w-full px-8 md:px-16 py-4 md:py-6 flex justify-between items-center z-50 transition-all duration-300 rounded-none ${scrolled ? 'backdrop-blur-sm border-b border-[#1a1a1a] bg-background/80' : 'bg-transparent border-b border-transparent'}`}
      >
        <div className="font-serif font-bold text-2xl text-[#F5F0E8] uppercase" data-testid="nav-logo">
          IF.
        </div>
        <div className="flex gap-6 md:gap-8 font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <a href="#work" className="hover:text-[#F5F0E8] transition-colors" data-testid="link-nav-work">WORK</a>
          <a href="#about" className="hover:text-[#F5F0E8] transition-colors" data-testid="link-nav-about">ABOUT</a>
          <a href="#contact" className="hover:text-[#F5F0E8] transition-colors" data-testid="link-nav-contact">CONTACT</a>
        </div>
      </nav>
      {/* 2. HERO */}
      <section className="relative h-[100dvh] w-full flex flex-col md:flex-row rounded-none">
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
              <h1 className="font-serif font-extrabold text-[clamp(5rem,14vw,13rem)] leading-[0.85] tracking-[-0.03em] text-[#F5F0E8] m-0 p-0 uppercase">
                ISAAC
              </h1>
              <h1 className="font-serif font-extrabold text-[clamp(5rem,14vw,13rem)] leading-[0.85] tracking-[-0.03em] text-[#FF4D00] m-0 p-0 uppercase">
                FIGUEROA
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
        <div className="absolute bottom-0 left-0 w-full overflow-hidden border-t border-[#1a1a1a] bg-background flex rounded-none whitespace-nowrap py-3">
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
      {/* 3. ABOUT */}
      <section id="about" className="w-full py-32 md:py-48 px-8 md:px-16 rounded-none">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8 rounded-none"
        >
          {/* LEFT */}
          <div className="md:col-span-5 flex flex-col rounded-none">
            <div className="font-serif font-medium text-xs text-muted-foreground tracking-widest uppercase mb-16">
              02
            </div>
            <div className="font-serif font-extrabold text-[clamp(4rem,10vw,7.5rem)] leading-[0.88] text-[#F5F0E8] uppercase tracking-tight">
              ABOUT<br />ME
            </div>
          </div>

          {/* RIGHT */}
          <div className="md:col-span-7 flex flex-col rounded-none">
            <div className="font-sans font-light text-xs text-muted-foreground uppercase tracking-[0.2em] mb-6">
              ABOUT ISAAC
            </div>
            <p className="font-sans font-light text-lg md:text-xl text-[#F5F0E8] leading-loose max-w-xl mb-8">
              Creative designer with 5+ years building high-impact visuals for non-profits, brands, and digital communities. I specialize in brand identity, campaign design, and social content that drives real engagement — and I bring the same level of craft whether the work lives on a screen, in print, or on a stage.
            </p>
            <p className="font-sans font-light italic text-sm md:text-base text-muted-foreground max-w-xl mb-12">Currently running Wave Creative House, my independent creative studio.
            As well as working as a Graphic Designer for The Squad.
</p>

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
      {/* 4. SELECTED WORK */}
      <section id="work" className="w-full border-t border-[#1a1a1a]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between px-8 md:px-16 pt-24 pb-16 gap-6"
        >
          <h2 className="font-serif font-bold text-5xl md:text-7xl text-[#F5F0E8] uppercase m-0 leading-none">
            SELECTED WORKS
          </h2>
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
              >
                <div style={{ width: 340, height: 240 }} className="overflow-hidden">
                  <img
                    src={hoveredProject.images[0]}
                    alt={hoveredProject.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {projects.map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.04 }}
              className="group border-b border-[#1a1a1a] cursor-pointer"
              onClick={() => setSelectedProject(project)}
              onMouseEnter={() => setHoveredProject(project)}
              onMouseLeave={() => setHoveredProject(null)}
              data-testid={`card-project-${i}`}
            >
              <div className="flex items-center px-8 md:px-16 py-7 md:py-9 gap-6 md:gap-10 group-hover:bg-[#111] transition-colors duration-200">
                {/* Number */}
                <span className="font-sans font-light text-[11px] text-[#F5F0E8]/20 w-7 flex-shrink-0 tabular-nums select-none">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Name */}
                <h3 className="font-serif font-bold uppercase text-[clamp(1.6rem,4vw,3.5rem)] text-[#F5F0E8] leading-none flex-1 group-hover:text-[#FF4D00] transition-colors duration-300 tracking-tight">
                  {project.name}
                </h3>

                {/* Category + Client — hidden on mobile */}
                <div className="hidden md:flex flex-col items-end gap-[5px] flex-shrink-0 min-w-[160px]">
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
                  />
                )}

                {/* Arrow */}
                <span className="font-sans text-base text-[#F5F0E8]/20 group-hover:text-[#FF4D00] group-hover:translate-x-1.5 transition-all duration-300 flex-shrink-0 select-none">
                  →
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      {/* 5. EXPERIENCE */}
      <section id="experience" className="w-full py-32 px-8 md:px-16 border-t border-[#1a1a1a] rounded-none">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-start gap-6 md:gap-16 mb-20 rounded-none"
        >
          <div className="font-serif font-medium text-xs text-muted-foreground tracking-widest uppercase md:mt-4">
            03
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
      {/* 6. CONTACT + FOOTER */}
      <section id="contact" className="w-full pt-40 pb-10 px-8 md:px-16 border-t border-[#1a1a1a] rounded-none flex flex-col justify-between min-h-screen">
        <div className="flex-1 flex flex-col justify-center rounded-none">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col rounded-none"
          >
            <div className="font-serif font-medium text-xs text-muted-foreground tracking-widest uppercase mb-12">
              04
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
              <a href="https://wavecreativehouse.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#F5F0E8] transition-colors" data-testid="link-website">wavecreativehouse.com</a>
              <span>English / Spanish</span>
            </div>
          </motion.div>
        </div>

        {/* FOOTER */}
        <footer className="mt-40 pt-10 border-t border-[#1a1a1a] flex flex-col md:flex-row justify-between items-start md:items-center gap-8 rounded-none">
          <div className="flex flex-col gap-2 rounded-none">
            <div className="font-serif font-semibold text-sm text-[#F5F0E8] uppercase tracking-[0.15em]">
              WAVE CREATIVE HOUSE
            </div>
            <div className="font-sans font-light text-xs text-muted-foreground">
              © 2025 ISAAC FIGUEROA. ALL RIGHTS RESERVED.
            </div>
          </div>

          <div className="flex gap-8 font-sans font-light text-xs text-muted-foreground uppercase tracking-wide rounded-none">
            <a href="#" className="hover:text-[#F5F0E8] transition-colors" data-testid="link-instagram">INSTAGRAM</a>
            <a href="#" className="hover:text-[#F5F0E8] transition-colors" data-testid="link-linkedin">LINKEDIN</a>
            <a href="#" className="hover:text-[#F5F0E8] transition-colors" data-testid="link-twitter">TWITTER</a>
          </div>
        </footer>
      </section>
      {resumeOpen && <ResumeModal onClose={() => setResumeOpen(false)} />}
      <AnimatePresence>
        {selectedProject && <ProjectModal key={selectedProject.name} project={selectedProject} onClose={() => setSelectedProject(null)} />}
      </AnimatePresence>
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