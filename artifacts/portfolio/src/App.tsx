import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, MoveRight, ArrowDownRight, Mail, Instagram, Twitter, Linkedin, Github } from "lucide-react";

const queryClient = new QueryClient();

const projects = [
  {
    id: 1,
    title: "Aura Systems",
    category: "Branding & Identity",
    client: "Aura Tech",
    year: "2024",
    image: "/project-1.png",
  },
  {
    id: 2,
    title: "Lumine Mobile",
    category: "Product Design",
    client: "Lumine",
    year: "2023",
    image: "/project-2.png",
  },
  {
    id: 3,
    title: "Avant Garde",
    category: "Editorial Design",
    client: "Self-Initiated",
    year: "2023",
    image: "/project-3.png",
  },
  {
    id: 4,
    title: "Vesper Skincare",
    category: "Packaging Design",
    client: "Vesper London",
    year: "2022",
    image: "/project-4.png",
  }
];

function Home() {
  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full p-6 md:p-10 flex justify-between items-center z-50 mix-blend-difference text-white">
        <div className="font-serif font-bold text-xl uppercase tracking-tighter">ISAAC<br/>FIGUEROA</div>
        <div className="hidden md:flex gap-8 font-mono text-xs uppercase tracking-widest">
          <a href="#work" className="hover:text-primary transition-colors">Work</a>
          <a href="#about" className="hover:text-primary transition-colors">About</a>
          <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
        </div>
        <button className="md:hidden">Menu</button>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center px-6 md:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
        <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-10 pt-20">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1"
          >
            <h1 className="text-6xl md:text-[9vw] leading-[0.9] font-serif font-bold tracking-tighter uppercase">
              Shaping<br/>
              <span className="text-primary italic">Digital</span><br/>
              Futures.
            </h1>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="w-full md:w-[300px] font-mono text-sm leading-relaxed text-muted-foreground"
          >
            <p>Independent Creative Director focused on crafting purposeful digital experiences and compelling brand identities for ambitious, forward-thinking companies.</p>
            <div className="mt-8 flex items-center gap-4 text-foreground uppercase tracking-widest text-xs">
              Scroll to explore <ArrowDownRight size={16} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="py-32 px-6 md:px-10 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-5xl font-serif leading-tight"
          >
            Great design is not decoration — it is decision-making made visible. Every choice carries weight, every detail earns its place, and the result should feel inevitable.
          </motion.h2>
        </div>
      </section>

      {/* Selected Work */}
      <section id="work" className="py-32 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-20">
            <h2 className="text-5xl md:text-7xl font-serif font-bold uppercase tracking-tighter">Selected<br/>Works</h2>
            <p className="font-mono text-sm text-muted-foreground hidden md:block">(01 — 04)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-x-10 md:gap-y-32">
            {projects.map((project, i) => (
              <motion.div 
                key={project.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: i % 2 === 0 ? 0 : 0.2 }}
                className={`group cursor-pointer ${i % 2 !== 0 ? 'md:mt-32' : ''}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted mb-6">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full h-full"
                  >
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay" />
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-serif font-bold uppercase tracking-tight mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                    <p className="font-mono text-xs text-muted-foreground">{project.category}</p>
                  </div>
                  <div className="font-mono text-xs text-muted-foreground text-right">
                    <p>{project.client}</p>
                    <p>{project.year}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Expertise */}
      <section className="py-32 px-6 md:px-10 border-y border-border bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-4">
              <h2 className="text-3xl font-serif uppercase tracking-tight">Expertise</h2>
            </div>
            <div className="md:col-span-8 flex flex-col gap-8">
              {[
                { title: "Digital Product Design", desc: "Creating intuitive, systematic, and beautiful interfaces for web and mobile platforms." },
                { title: "Brand Identity", desc: "Forging cohesive visual languages that communicate core values and command attention." },
                { title: "Creative Direction", desc: "Guiding the holistic visual and interactive experience from concept to launch." },
                { title: "Motion & Interaction", desc: "Breathing life into digital products with purposeful animation and tactile interactions." }
              ].map((item, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-4 md:gap-10 border-b border-border pb-8 last:border-0 last:pb-0">
                  <div className="font-mono text-primary text-sm">0{i+1}</div>
                  <div>
                    <h3 className="text-xl font-serif uppercase tracking-tight mb-3">{item.title}</h3>
                    <p className="text-muted-foreground max-w-lg leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-32 px-6 md:px-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="aspect-[3/4] relative bg-muted"
          >
            <img src="/headshot.png" alt="Isaac Figueroa" className="w-full h-full object-cover grayscale contrast-125 brightness-90 hover:grayscale-0 transition-all duration-700" />
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary flex items-center justify-center text-background font-serif font-bold text-xl uppercase -rotate-12">
              Hello.
            </div>
          </motion.div>
          
          <div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold uppercase tracking-tight mb-10">
              Operating at the intersection of logic and emotion.
            </h2>
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                I am Isaac Figueroa, a creative director with over a decade of experience building digital products and brand identities for ambitious companies across multiple industries.
              </p>
              <p>
                My process begins with deep listening — understanding the real problem before touching a single pixel. From there, I work toward clarity: stripping away noise until only the essential remains, then executing it with precision and care.
              </p>
            </div>
            <button className="mt-12 flex items-center gap-4 text-foreground uppercase tracking-widest text-sm hover:text-primary transition-colors group">
              Full Resume <MoveRight className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* CTA / Contact */}
      <section id="contact" className="py-40 px-6 md:px-10 bg-primary text-background">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl md:text-[8vw] leading-[0.9] font-serif font-bold uppercase tracking-tighter mb-10">
            Let's build<br/>something <span className="italic font-light">iconic.</span>
          </h2>
          <a href="mailto:hello@example.com" className="inline-flex items-center gap-4 border border-background rounded-full px-8 py-4 text-lg font-mono uppercase tracking-widest hover:bg-background hover:text-primary transition-colors">
            Get in touch <ArrowRight size={20} />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 md:px-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        <div>&copy; {new Date().getFullYear()} Isaac Figueroa. All rights reserved.</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-primary transition-colors">Twitter</a>
          <a href="#" className="hover:text-primary transition-colors">Instagram</a>
          <a href="#" className="hover:text-primary transition-colors">LinkedIn</a>
        </div>
        <div>Designed & Built in London</div>
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
