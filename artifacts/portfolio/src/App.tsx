import React, { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { motion } from "framer-motion";
import { Mail, Phone, Globe, Twitter, Instagram, Linkedin } from "lucide-react";
import { SiFigma } from "react-icons/si";

const queryClient = new QueryClient();

function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-primary-foreground">
      
      {/* NAVBAR */}
      <nav 
        className={`fixed top-0 left-0 w-full px-6 py-4 md:px-12 flex justify-between items-center z-50 border-b border-border transition-colors duration-300 ${scrolled ? 'bg-[#0a0a0a]' : 'bg-transparent'}`}
      >
        <div className="font-serif font-bold text-xl md:text-2xl uppercase tracking-widest" data-testid="text-logo">
          ISAAC FIGUEROA
        </div>
        <div className="hidden md:flex gap-8 font-sans text-xs uppercase tracking-widest">
          <a href="#work" className="hover:text-primary transition-colors" data-testid="link-nav-work">Work</a>
          <a href="#about" className="hover:text-primary transition-colors" data-testid="link-nav-about">About</a>
          <a href="#experience" className="hover:text-primary transition-colors" data-testid="link-nav-experience">Experience</a>
          <a href="#contact" className="hover:text-primary transition-colors" data-testid="link-nav-contact">Contact</a>
        </div>
        <button className="md:hidden text-xs uppercase tracking-widest text-primary font-bold" data-testid="button-mobile-menu">
          MENU
        </button>
      </nav>

      {/* HERO */}
      <section className="relative min-h-[100dvh] w-full flex flex-col justify-end px-6 md:px-12 pb-12 md:pb-24 pt-32">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="w-full flex flex-col"
        >
          <motion.h1 
            variants={staggerItem} 
            className="text-[15vw] leading-[0.85] font-serif font-extrabold uppercase tracking-widest text-white mb-8" 
            data-testid="text-hero-title"
          >
            ISAAC<br/>FIGUEROA
          </motion.h1>
          
          <motion.div variants={staggerItem} className="w-full h-[2px] bg-primary mb-8" />
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 w-full">
            <motion.p 
              variants={staggerItem} 
              className="font-sans font-light text-sm md:text-base text-muted-foreground uppercase tracking-widest max-w-lg" 
              data-testid="text-hero-subtitle"
            >
              CREATIVE DESIGNER / BRAND, SOCIAL & DIGITAL CONTENT
            </motion.p>
            
            <motion.div variants={staggerItem} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <a 
                href="#work" 
                className="bg-primary text-black px-10 py-5 font-serif text-lg font-bold uppercase tracking-widest hover:bg-white transition-colors text-center" 
                data-testid="link-hero-work"
              >
                VIEW WORK
              </a>
              <a 
                href="#contact" 
                className="border border-white text-white px-10 py-5 font-serif text-lg font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors text-center" 
                data-testid="link-hero-contact"
              >
                GET IN TOUCH
              </a>
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-12 right-12 hidden md:block text-xs font-sans text-muted-foreground uppercase tracking-widest"
        >
          WAVE CREATIVE HOUSE
        </motion.div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 md:py-32 px-6 md:px-12 border-t border-border">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-4"
          >
            <h2 className="text-[12vw] lg:text-[8vw] leading-none font-serif font-extrabold uppercase tracking-widest lg:rotate-90 lg:origin-top-left lg:absolute" data-testid="text-about-heading">
              ABOUT
            </h2>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-8 lg:ml-auto lg:pl-32 flex flex-col gap-12"
          >
            <p className="text-lg md:text-xl lg:text-2xl font-sans font-light text-foreground leading-loose" data-testid="text-about-bio">
              Creative designer with 5+ years building high-impact visuals for non-profits, brands, and digital communities. I specialize in brand identity, campaign design, and social content that drives real engagement — and I bring the same level of craft whether the work lives on a screen, in print, or on a stage. Currently running Wave Creative House, my independent creative studio.
            </p>
            
            <div className="flex flex-wrap gap-3">
              {[
                "Brand Identity", "Campaign Design", "Social Media Graphics", 
                "Web Design", "Print & Marketing", "Typography", 
                "Layout & Composition", "Merch Design", "YouTube Thumbnails", "Event Promotion"
              ].map((skill, i) => (
                <span 
                  key={i} 
                  className="border border-border px-4 py-2 font-sans font-normal text-xs uppercase tracking-widest hover:border-primary hover:text-primary transition-colors cursor-default" 
                  data-testid={`tag-skill-${i}`}
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-muted-foreground font-serif text-xl tracking-widest">
              <span>ILLUSTRATOR</span> <span className="text-primary font-sans font-light">/</span>
              <span>PHOTOSHOP</span> <span className="text-primary font-sans font-light">/</span>
              <span>INDESIGN</span> <span className="text-primary font-sans font-light">/</span>
              <span>AFTER EFFECTS</span> <span className="text-primary font-sans font-light">/</span>
              <span>FIGMA</span> <span className="text-primary font-sans font-light">/</span>
              <span>LIGHTROOM</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section id="experience" className="py-24 md:py-32 px-6 md:px-12 border-t border-border bg-card">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl md:text-7xl font-serif font-extrabold tracking-widest uppercase mb-20"
        >
          EXPERIENCE
        </motion.h2>

        <div className="relative border-l-2 border-primary pl-8 md:pl-12 flex flex-col gap-20 ml-2 md:ml-4">
          {[
            {
              role: "CREATIVE DESIGNER",
              company: "THE SQUAD",
              year: "2021 – PRESENT",
              bullets: [
                "Designed social media graphics, posters, thumbnails, and print materials for non-profit and community organizations across the U.S.",
                "Built cohesive visual systems for fundraising campaigns, youth events, and seasonal sermon series.",
                "Partnered with leadership and marketing teams on brand voice and campaign strategy from concept to delivery."
              ]
            },
            {
              role: "GRAPHIC DESIGNER",
              company: "VIVE MEDIA",
              year: "2021",
              bullets: [
                "Created social graphics, thumbnails, and marketing assets for digital campaigns and live events.",
                "Produced on-brand visuals with fast turnaround across multiple concurrent campaigns."
              ]
            },
            {
              role: "JUNIOR GRAPHIC DESIGNER",
              company: "VIBRANT MEDIA",
              year: "2020 – 2021",
              bullets: [
                "Designed social media and digital graphics for multiple client brands simultaneously.",
                "Produced promotional visuals for campaigns, events, and digital ad placements."
              ]
            }
          ].map((job, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="relative max-w-4xl"
              data-testid={`item-experience-${i}`}
            >
              <div className="absolute -left-[41px] md:-left-[57px] top-3 w-4 h-4 bg-background border-2 border-primary rounded-none" />
              <h3 className="text-3xl md:text-5xl font-serif font-bold tracking-widest uppercase text-white mb-2">{job.role}</h3>
              <div className="font-serif text-xl tracking-widest uppercase text-primary mb-6">
                {job.company} <span className="font-sans font-light text-sm text-muted-foreground tracking-widest ml-4">{job.year}</span>
              </div>
              <ul className="flex flex-col gap-3 font-sans font-light text-base md:text-lg text-foreground leading-relaxed">
                {job.bullets.map((bullet, j) => (
                  <li key={j} className="flex gap-4">
                    <span className="text-muted-foreground">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SELECTED WORKS */}
      <section id="work" className="py-24 md:py-32 px-6 md:px-12 border-t border-border">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-5xl md:text-7xl font-serif font-extrabold tracking-widest uppercase" data-testid="text-work-heading">
            SELECTED WORKS
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            {
              name: "Aware Coffee",
              client: "Aware Coffee",
              category: "Brand Identity / Packaging",
              bg: "#f5f5f0",
              accent: "#000000",
              labelColor: "#e34d37",
              nameColor: "#000000",
              clientColor: "#555555",
              desc: "Product launch campaign, branded cup mockups, social media graphics",
            },
            {
              name: "Billy Brunch NYC",
              client: "Billy Brunch NYC",
              category: "Brand Identity / Merch",
              bg: "#7ba9ae",
              accent: "#e34d37",
              labelColor: "#e34d37",
              nameColor: "#ffffff",
              clientColor: "rgba(255,255,255,0.7)",
              desc: "Full brand suite — social graphics, hoodie, tote bag, signage, A-frame poster",
            },
            {
              name: "Change The World",
              client: "Self-Initiated",
              category: "Print / Poster",
              bg: "#1a3aff",
              accent: "#FFE500",
              labelColor: "#FFE500",
              nameColor: "#ffffff",
              clientColor: "rgba(255,255,255,0.7)",
              desc: "Bold typographic print poster series in primary colors",
            },
            {
              name: "Chino Club",
              client: "Chino Club",
              category: "Brand Identity / Events",
              bg: "#f5f508",
              accent: "#0015ff",
              labelColor: "#0015ff",
              nameColor: "#000000",
              clientColor: "#333333",
              desc: "Full visual identity — signage, merch, posters, tote bags, apparel",
            },
            {
              name: "Cold Little Heart",
              client: "Cold Little Heart",
              category: "Merch Design / Apparel",
              bg: "#2a2a2a",
              accent: "#e34d37",
              labelColor: "#e34d37",
              nameColor: "#ffffff",
              clientColor: "rgba(255,255,255,0.6)",
              desc: "Vintage-style graphic tee with flaming heart illustration",
            },
            {
              name: "Wallet App UI",
              client: "Concept Project",
              category: "UX/UI Design",
              bg: "#e8d5c4",
              accent: "#5c3fff",
              labelColor: "#5c3fff",
              nameColor: "#111111",
              clientColor: "#555555",
              desc: "Mobile wallet app — earnings tracking, portfolio view, NFT/stocks UI",
            },
            {
              name: "Mango",
              client: "Mango",
              category: "Merch Design",
              bg: "#2d4a1e",
              accent: "#FF5C00",
              labelColor: "#FF5C00",
              nameColor: "#ffffff",
              clientColor: "rgba(255,255,255,0.6)",
              desc: "Camo cap with arched orange MANGO wordmark",
            },
            {
              name: "Spark Pro Services",
              client: "Spark Pro Services",
              category: "Brand Identity / Web",
              bg: "#e34d37",
              accent: "#1a2c5b",
              labelColor: "#ffffff",
              nameColor: "#ffffff",
              clientColor: "rgba(255,255,255,0.75)",
              desc: "Construction company full rebrand — logo, web, apparel, signage, ad campaigns",
            },
            {
              name: "The Squad",
              client: "The Squad",
              category: "Campaign Design / Print",
              bg: "#0f1923",
              accent: "#FF5C00",
              labelColor: "#FF5C00",
              nameColor: "#ffffff",
              clientColor: "rgba(255,255,255,0.6)",
              desc: "Sermon series posters, fundraising campaigns, and youth event graphics",
            },
            {
              name: "Vive Media",
              client: "Vive Media",
              category: "Social Media / Events",
              bg: "#180030",
              accent: "#c840ff",
              labelColor: "#c840ff",
              nameColor: "#ffffff",
              clientColor: "rgba(255,255,255,0.6)",
              desc: "Concert and live event flyer design — neon, urban aesthetic",
            },
          ].map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
              className="group relative cursor-pointer overflow-hidden"
              style={{ aspectRatio: "4/5", background: project.bg }}
              data-testid={`card-work-${i}`}
            >
              {/* Category label */}
              <div
                className="absolute top-5 left-5 font-sans font-medium text-[10px] uppercase tracking-widest"
                style={{ color: project.labelColor }}
              >
                {project.category}
              </div>

              {/* Project name — centered */}
              <div className="absolute inset-0 flex items-center justify-center px-6">
                <h3
                  className="font-serif font-bold text-3xl md:text-2xl xl:text-3xl uppercase tracking-widest text-center leading-tight"
                  style={{ color: project.nameColor }}
                >
                  {project.name}
                </h3>
              </div>

              {/* Client + year */}
              <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end">
                <span
                  className="font-sans font-light text-xs uppercase tracking-widest"
                  style={{ color: project.clientColor }}
                >
                  {project.client}
                </span>
                <span
                  className="font-sans font-light text-xs tracking-widest"
                  style={{ color: project.clientColor }}
                >
                  2024
                </span>
              </div>

              {/* Hover overlay with description */}
              <div className="absolute inset-0 flex items-center justify-center px-6 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="font-sans font-light text-sm text-white text-center leading-relaxed tracking-wide">
                  {project.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* TRAINING */}
      <section className="py-24 px-6 md:px-12 border-t border-border bg-card">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl md:text-7xl font-serif font-extrabold tracking-widest uppercase mb-16"
        >
          TRAINING
        </motion.h2>

        <div className="flex flex-col border-t border-border">
          {[
            { title: "GOOGLE UX/UI DESIGN", source: "COURSERA / GOOGLE" },
            { title: "TYPOGRAPHY & DESIGN", source: "THE FUTUR / CHRIS DO" },
            { title: "FIGMA FOR DESIGNERS", source: "MAX BRINCKMANN" }
          ].map((course, i) => (
            <div key={i} className="py-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 group" data-testid={`card-training-${i}`}>
              <h4 className="font-serif font-bold text-3xl md:text-4xl tracking-widest uppercase text-white transition-colors">{course.title}</h4>
              <p className="font-serif font-normal text-xl tracking-widest uppercase text-primary">{course.source}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 md:py-32 px-6 md:px-12 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[12vw] md:text-[9vw] leading-[0.85] font-serif font-extrabold uppercase tracking-widest text-white mb-16"
          >
            LET'S CREATE<br/>SOMETHING BOLD.
          </motion.h2>

          <div className="flex flex-col gap-6 font-sans font-light text-lg md:text-xl items-center mb-16">
            <a href="mailto:isaacfigueroa561@gmail.com" className="flex items-center gap-4 hover:text-primary transition-colors" data-testid="link-email">
              isaacfigueroa561@gmail.com
            </a>
            <a href="tel:+17027880115" className="flex items-center gap-4 hover:text-primary transition-colors" data-testid="link-phone">
              +1 (702) 788-0115
            </a>
            <a href="https://wavecreativehouse.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 hover:text-primary transition-colors" data-testid="link-website">
              wavecreativehouse.com
            </a>
            <div className="font-sans font-light text-sm uppercase tracking-widest text-muted-foreground mt-4">
              LANGUAGES: ENGLISH / SPANISH
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
            <a 
              href="mailto:isaacfigueroa561@gmail.com" 
              className="bg-primary text-black px-12 py-5 font-serif text-xl font-bold uppercase tracking-widest hover:bg-white transition-colors" 
              data-testid="button-email"
            >
              SEND AN EMAIL
            </a>
            <button 
              className="border border-white text-white px-12 py-5 font-serif text-xl font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors" 
              data-testid="button-resume"
            >
              VIEW MY RESUME
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 md:px-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8 bg-background">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="font-serif font-extrabold text-2xl md:text-3xl tracking-widest uppercase text-white">
            WAVE CREATIVE HOUSE
          </div>
          <div className="font-sans font-light text-xs uppercase tracking-widest text-muted-foreground">
            © 2025 ISAAC FIGUEROA
          </div>
        </div>
        <div className="flex gap-8 font-sans font-light text-xs uppercase tracking-widest">
          <a href="#" className="hover:text-primary transition-colors" data-testid="link-twitter">TWITTER</a>
          <a href="#" className="hover:text-primary transition-colors" data-testid="link-instagram">INSTAGRAM</a>
          <a href="#" className="hover:text-primary transition-colors" data-testid="link-linkedin">LINKEDIN</a>
        </div>
      </footer>

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
