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

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const [imgIndex, setImgIndex] = useState(0);
  const images = project.images ?? [];
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goTo(Math.min(imgIndex + 1, images.length - 1));
      if (e.key === "ArrowLeft") goTo(Math.max(imgIndex - 1, 0));
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, imgIndex, images.length]);

  const goTo = (idx: number) => {
    setImgIndex(idx);
    const el = scrollRef.current?.children[idx] as HTMLElement;
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.25 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const panelVariants = {
    hidden: { y: "100%" },
    show: { y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
    exit: { y: "100%", transition: { duration: 0.35, ease: [0.4, 0, 1, 1] } },
  };

  const imgVariants = {
    hidden: { opacity: 0, scale: 0.96 },
    show: (i: number) => ({
      opacity: 1, scale: 1,
      transition: { duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] },
    }),
  };

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-end"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      onClick={onClose}
      data-testid="project-modal"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Panel */}
      <motion.div
        className="relative w-full bg-[#0D0D0D] flex flex-col"
        style={{ height: "92vh" }}
        variants={panelVariants}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-4 pb-2 cursor-pointer" onClick={onClose}>
          <div className="w-10 h-[3px] bg-[#2a2a2a] rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-8 md:px-16 pt-4 pb-6 border-b border-[#1a1a1a] flex-shrink-0">
          <div className="flex flex-col gap-2">
            <div className="font-sans font-light text-[10px] uppercase tracking-[0.25em] text-[#FF4D00]">
              {project.category}
            </div>
            <h2 className="font-serif font-bold text-3xl md:text-5xl text-[#F5F0E8] uppercase leading-none">
              {project.name}
            </h2>
            <p className="font-sans font-light text-xs text-muted-foreground max-w-sm mt-1 leading-relaxed">
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

        {/* Gallery — horizontal scroll with snap */}
        {images.length > 0 ? (
          <div
            ref={scrollRef}
            className="flex-1 flex gap-4 md:gap-6 overflow-x-auto overflow-y-hidden px-8 md:px-16 py-8 snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onScroll={e => {
              const el = e.currentTarget;
              const idx = Math.round(el.scrollLeft / el.offsetWidth);
              setImgIndex(idx);
            }}
          >
            {images.map((src, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={imgVariants}
                initial="hidden"
                animate="show"
                className="snap-center flex-shrink-0 flex items-center justify-center cursor-pointer"
                style={{ width: images.length === 1 ? "100%" : "85vw", maxWidth: 960 }}
                onClick={() => goTo(i)}
              >
                <img
                  src={src}
                  alt={`${project.name} ${i + 1}`}
                  className="w-full h-full object-contain max-h-[calc(92vh-200px)] select-none"
                  draggable={false}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center px-8">
            <p className="font-sans font-light text-sm text-muted-foreground text-center max-w-md leading-relaxed">
              {project.desc}
            </p>
          </div>
        )}

        {/* Footer — dots + arrows */}
        {images.length > 1 && (
          <div className="flex-shrink-0 flex items-center justify-between px-8 md:px-16 py-5 border-t border-[#1a1a1a]">
            {/* Dots */}
            <div className="flex gap-2 items-center">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="transition-all duration-300"
                >
                  <div
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: i === imgIndex ? 24 : 6,
                      height: 6,
                      backgroundColor: i === imgIndex ? "#FF4D00" : "#2a2a2a",
                    }}
                  />
                </button>
              ))}
            </div>

            {/* Counter + Arrows */}
            <div className="flex items-center gap-6">
              <span className="font-sans font-light text-xs text-muted-foreground tabular-nums">
                {String(imgIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => goTo(Math.max(imgIndex - 1, 0))}
                  disabled={imgIndex === 0}
                  className="w-9 h-9 border border-[#2a2a2a] flex items-center justify-center text-muted-foreground hover:border-[#FF4D00] hover:text-[#FF4D00] transition-colors disabled:opacity-20 font-sans text-sm"
                >
                  ←
                </button>
                <button
                  onClick={() => goTo(Math.min(imgIndex + 1, images.length - 1))}
                  disabled={imgIndex === images.length - 1}
                  className="w-9 h-9 border border-[#2a2a2a] flex items-center justify-center text-muted-foreground hover:border-[#FF4D00] hover:text-[#FF4D00] transition-colors disabled:opacity-20 font-sans text-sm"
                >
                  →
                </button>
              </div>
            </div>
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
      images: ["/billy-1.png", "/billy-2.png", "/billy-3.png", "/billy-4.png", "/billy-5.png", "/billy-6.png"],
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
    },
    {
      name: "Wallet App UI",
      client: "Concept Project",
      category: "UX/UI Design",
      bg: "#e8d5c4",
      labelColor: "#5c3fff",
      nameColor: "#111",
      clientColor: "#555",
      desc: "Mobile wallet app — earnings tracking, portfolio, NFT/stocks",
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
    },
  ];

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground overflow-x-hidden selection:bg-[#FF4D00] selection:text-black font-sans rounded-none">
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
                10+ CLIENTS
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
            <div className="font-serif font-bold text-[8rem] leading-none text-[#F5F0E8]">
              05+
            </div>
            <div className="font-sans font-light text-xs text-muted-foreground uppercase tracking-[0.2em] mt-4">
              YEARS EXPERIENCE
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
      <section id="work" className="w-full py-32 px-8 md:px-16 rounded-none border-t border-[#1a1a1a]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-20 rounded-none gap-6"
        >
          <h2 className="font-serif font-bold text-5xl md:text-7xl text-[#F5F0E8] uppercase m-0 leading-none">
            SELECTED WORKS
          </h2>
          <div className="font-serif font-light text-xl text-muted-foreground">
            (7)
          </div>
        </motion.div>

        <div className="columns-1 md:columns-2 gap-8 space-y-8 rounded-none">
          {projects.map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: (i % 2) * 0.1 }}
              className="relative w-full overflow-hidden group cursor-pointer aspect-[3/2] inline-block mb-8 rounded-none"
              style={{ backgroundColor: project.bg }}
              data-testid={`card-project-${i}`}
              onClick={() => setSelectedProject(project)}
            >
              <div 
                className="absolute top-6 left-6 font-sans font-light text-[10px] uppercase tracking-[0.2em] z-10"
                style={{ color: project.labelColor }}
              >
                {project.category}
              </div>

              <div className="absolute inset-0 flex items-center justify-center p-8 z-10">
                <h3 
                  className="font-serif font-bold text-3xl md:text-4xl uppercase text-center leading-tight transition-transform duration-400 ease-out group-hover:scale-105"
                  style={{ color: project.nameColor }}
                >
                  {project.name}
                </h3>
              </div>

              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-10">
                <div 
                  className="font-sans font-light text-xs"
                  style={{ color: project.clientColor }}
                >
                  {project.client}
                </div>
                <div 
                  className="font-sans font-light text-xs"
                  style={{ color: project.clientColor }}
                >
                  2024
                </div>
              </div>

              <div className="absolute inset-0 bg-black/60 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-[0.22,1,0.36,1] z-20 flex items-center justify-center p-8 rounded-none">
                <p className="font-sans font-light text-sm text-white text-center max-w-sm">
                  {project.desc}
                </p>
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