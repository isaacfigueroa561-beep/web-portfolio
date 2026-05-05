import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Mail, Phone, Globe, Twitter, Instagram, Linkedin } from "lucide-react";
import { SiFigma } from "react-icons/si";

const queryClient = new QueryClient();

const projects = [
  {
    id: 1,
    title: "Arise Campaign",
    category: "Sermon Series Poster Design",
    year: "2024",
    image: "/project-1-new.png",
  },
  {
    id: 2,
    title: "Youth Summit 2024",
    category: "Event Poster",
    year: "2024",
    image: "/project-2-new.png",
  },
  {
    id: 3,
    title: "Brand Identity System",
    category: "Branding",
    year: "2023",
    image: "/project-3-new.png",
  },
  {
    id: 4,
    title: "Social Media Pack",
    category: "Social Content",
    year: "2023",
    image: "/project-4-new.png",
  },
  {
    id: 5,
    title: "Vive Media — Event Visuals",
    category: "Concert Flyer",
    year: "2022",
    image: "/project-5-new.png",
  }
];

function Home() {
  const { scrollYProgress } = useScroll();
  const navBg = useTransform(scrollYProgress, [0, 0.05], ["rgba(10, 10, 10, 0)", "rgba(10, 10, 10, 0.9)"]);
  const navBorder = useTransform(scrollYProgress, [0, 0.05], ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.1)"]);

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-primary-foreground">
      
      {/* 1. NAVBAR */}
      <motion.nav 
        style={{ backgroundColor: navBg, borderBottomColor: navBorder }}
        className="fixed top-0 left-0 w-full p-6 md:px-12 flex justify-between items-center z-50 border-b transition-colors duration-300 backdrop-blur-sm"
      >
        <div className="font-serif text-2xl tracking-wide" data-testid="text-logo">ISAAC FIGUEROA</div>
        <div className="hidden md:flex gap-10 font-sans text-sm uppercase tracking-widest text-muted-foreground">
          <a href="#work" className="hover:text-primary transition-colors" data-testid="link-nav-work">Work</a>
          <a href="#about" className="hover:text-primary transition-colors" data-testid="link-nav-about">About</a>
          <a href="#experience" className="hover:text-primary transition-colors" data-testid="link-nav-experience">Experience</a>
          <a href="#contact" className="hover:text-primary transition-colors" data-testid="link-nav-contact">Contact</a>
        </div>
        <button className="md:hidden text-sm uppercase tracking-widest text-primary" data-testid="button-mobile-menu">Menu</button>
      </motion.nav>

      {/* 2. HERO */}
      <section className="relative min-h-screen w-full flex flex-col justify-end px-6 md:px-12 pb-12 pt-32">
        <div className="absolute inset-0 bg-background -z-10" />
        
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="w-full flex flex-col"
        >
          <motion.h1 variants={staggerItem} className="text-[14vw] leading-[0.85] font-serif uppercase tracking-tight text-white mb-6" data-testid="text-hero-title">
            ISAAC<br/>FIGUEROA
          </motion.h1>
          
          <motion.div variants={staggerItem} className="w-full h-[2px] bg-primary my-6 md:my-10" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 w-full">
            <motion.p variants={staggerItem} className="font-sans text-sm md:text-base text-muted-foreground uppercase tracking-widest max-w-md" data-testid="text-hero-subtitle">
              Creative Designer / Brand, Social & Digital Content
            </motion.p>
            
            <motion.div variants={staggerItem} className="flex gap-4 w-full md:w-auto">
              <a href="#work" className="bg-primary text-primary-foreground px-8 py-4 font-sans text-sm uppercase tracking-widest font-bold hover:bg-white transition-colors text-center flex-1 md:flex-none" data-testid="link-hero-work">
                View Work
              </a>
              <a href="#contact" className="border border-white text-white px-8 py-4 font-sans text-sm uppercase tracking-widest font-bold hover:bg-white hover:text-background transition-colors text-center flex-1 md:flex-none" data-testid="link-hero-contact">
                Get in Touch
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
          Wave Creative House
        </motion.div>
      </section>

      {/* 3. ABOUT / BIO */}
      <section id="about" className="py-32 px-6 md:px-12 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-24 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="md:col-span-4"
          >
            <h2 className="text-6xl md:text-8xl font-serif" data-testid="text-about-heading">ABOUT</h2>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="md:col-span-8 flex flex-col gap-10"
          >
            <p className="text-xl md:text-3xl font-sans text-foreground leading-relaxed" data-testid="text-about-bio">
              Creative designer with 5+ years building high-impact visuals for non-profits, brands, and digital communities. I specialize in brand identity, campaign design, and social content that drives real engagement — and I bring the same level of craft whether the work lives on a screen, in print, or on a stage. Currently running Wave Creative House, my independent creative studio.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <span className="border border-primary text-primary px-4 py-2 font-sans text-xs uppercase tracking-widest" data-testid="tag-experience">
                5+ Years Experience
              </span>
              <span className="border border-primary text-primary px-4 py-2 font-sans text-xs uppercase tracking-widest" data-testid="tag-studio">
                Wave Creative House
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. SELECTED WORK */}
      <section id="work" className="py-32 px-6 md:px-12 border-t border-border bg-card">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-6xl md:text-8xl font-serif mb-20"
          data-testid="text-work-heading"
        >
          SELECTED WORKS
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
          {projects.map((project, i) => (
            <motion.div 
              key={project.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: i % 2 === 0 ? 0 : 0.2 }}
              className={`group cursor-pointer flex flex-col gap-4 ${i % 2 !== 0 ? 'md:mt-32' : ''}`}
              data-testid={`card-project-${project.id}`}
            >
              <div className="relative overflow-hidden bg-background aspect-[3/4] md:aspect-[4/5]">
                <motion.img 
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-full object-cover filter grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                  data-testid={`img-project-${project.id}`}
                />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-colors duration-500 mix-blend-overlay pointer-events-none" />
              </div>
              
              <div className="flex justify-between items-start border-t border-border pt-4">
                <div>
                  <h3 className="text-2xl font-serif tracking-wide" data-testid={`text-project-title-${project.id}`}>{project.title}</h3>
                  <p className="font-sans text-xs text-muted-foreground uppercase tracking-widest mt-1" data-testid={`text-project-category-${project.id}`}>{project.category}</p>
                </div>
                <div className="font-sans text-xs text-muted-foreground" data-testid={`text-project-year-${project.id}`}>
                  {project.year}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. SKILLS & TOOLS */}
      <section className="py-32 px-6 md:px-12 border-t border-border">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-6xl md:text-8xl font-serif mb-20"
        >
          SKILLS & TOOLS
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          <div>
            <h3 className="text-xl font-sans uppercase tracking-widest text-muted-foreground mb-8 border-b border-border pb-4">Skills</h3>
            <div className="flex flex-wrap gap-3">
              {[
                "Brand Identity", "Campaign Design", "Social Media Graphics", 
                "Web Design", "Print & Marketing", "Typography", 
                "Layout & Composition", "Merch Design", "YouTube Thumbnails", "Event Promotion"
              ].map((skill, i) => (
                <span key={i} className="border border-border px-4 py-2 font-sans text-sm hover:border-primary hover:text-primary transition-colors cursor-default" data-testid={`tag-skill-${i}`}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-sans uppercase tracking-widest text-muted-foreground mb-8 border-b border-border pb-4">Tools</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { name: "Illustrator", label: "Ai" },
                { name: "Photoshop", label: "Ps" },
                { name: "InDesign", label: "Id" },
                { name: "After Effects", label: "Ae" },
                { name: "Figma", label: null },
                { name: "Lightroom", label: "Lr" }
              ].map((tool, i) => (
                <div key={i} className="flex items-center gap-4 group" data-testid={`item-tool-${i}`}>
                  <div className="w-12 h-12 border border-border flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-colors text-sm font-bold font-sans">
                    {tool.label === null ? <SiFigma size={20} /> : <span>{tool.label}</span>}
                  </div>
                  <span className="font-sans text-sm uppercase tracking-wider">{tool.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. EXPERIENCE */}
      <section id="experience" className="py-32 px-6 md:px-12 border-t border-border bg-card">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-6xl md:text-8xl font-serif mb-20"
        >
          EXPERIENCE
        </motion.h2>

        <div className="relative max-w-4xl border-l-2 border-primary pl-8 md:pl-12 flex flex-col gap-16 ml-2 md:ml-4">
          {[
            {
              role: "Creative Designer",
              company: "The Squad",
              year: "2021–Present",
              desc: "Designed social media graphics, posters, thumbnails, and print materials for non-profit and community organizations across the U.S. Built cohesive visual systems for fundraising campaigns, youth events, and seasonal sermon series. Partnered with leadership and marketing teams on brand voice and campaign strategy."
            },
            {
              role: "Graphic Designer",
              company: "Vive Media",
              year: "2021",
              desc: "Created social graphics, thumbnails, and marketing assets for digital campaigns and live events. Produced on-brand visuals with fast turnaround across multiple concurrent campaigns."
            },
            {
              role: "Junior Graphic Designer",
              company: "Vibrant Media",
              year: "2020–2021",
              desc: "Designed social media and digital graphics for multiple client brands simultaneously. Produced promotional visuals for campaigns, events, and digital ad placements."
            }
          ].map((job, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="relative"
              data-testid={`item-experience-${i}`}
            >
              <div className="absolute -left-[41px] md:-left-[57px] top-2 w-4 h-4 bg-background border-2 border-primary" />
              <h3 className="text-4xl font-serif tracking-wide">{job.role}</h3>
              <div className="font-sans text-sm uppercase tracking-widest text-primary mb-4 mt-2">
                {job.company} <span className="text-muted-foreground">| {job.year}</span>
              </div>
              <p className="font-sans text-base text-muted-foreground leading-relaxed max-w-2xl">
                {job.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 7. TRAINING */}
      <section className="py-24 px-6 md:px-12 border-t border-border">
        <div className="flex flex-col md:flex-row gap-12 md:gap-24">
          <h2 className="text-4xl font-serif md:w-1/4">TRAINING</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
            {[
              { title: "Google UX/UI Design", source: "Coursera / Google" },
              { title: "Typography & Design", source: "The Futur (Chris Do)" },
              { title: "Figma for Designers", source: "Max Brinckmann" }
            ].map((course, i) => (
              <div key={i} className="border border-border p-6 hover:border-primary transition-colors" data-testid={`card-training-${i}`}>
                <h4 className="font-sans font-bold text-lg mb-2">{course.title}</h4>
                <p className="font-sans text-sm text-muted-foreground">{course.source}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CONTACT */}
      <section id="contact" className="py-32 px-6 md:px-12 border-t border-border bg-background">
        <div className="max-w-5xl">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[12vw] md:text-[8vw] leading-[0.85] font-serif uppercase tracking-tight text-primary mb-16"
          >
            LET'S CREATE<br/>SOMETHING BOLD.
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
            <div className="flex flex-col gap-6 font-sans text-lg md:text-xl">
              <a href="mailto:isaacfigueroa561@gmail.com" className="flex items-center gap-4 hover:text-primary transition-colors group w-fit" data-testid="link-contact-email">
                <Mail className="group-hover:scale-110 transition-transform" />
                isaacfigueroa561@gmail.com
              </a>
              <a href="tel:+17027880115" className="flex items-center gap-4 hover:text-primary transition-colors group w-fit" data-testid="link-contact-phone">
                <Phone className="group-hover:scale-110 transition-transform" />
                +1 (702) 788-0115
              </a>
              <a href="https://wavecreativehouse.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 hover:text-primary transition-colors group w-fit" data-testid="link-contact-website">
                <Globe className="group-hover:scale-110 transition-transform" />
                wavecreativehouse.com
              </a>
              <div className="font-sans text-sm uppercase tracking-widest text-muted-foreground mt-4">
                Languages: English / Spanish
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 md:justify-end">
              <a href="mailto:isaacfigueroa561@gmail.com" className="bg-primary text-primary-foreground px-8 py-4 font-sans text-sm uppercase tracking-widest font-bold hover:bg-white transition-colors text-center" data-testid="button-send-email">
                Send an Email
              </a>
              <button className="border border-white text-white px-8 py-4 font-sans text-sm uppercase tracking-widest font-bold hover:bg-white hover:text-background transition-colors text-center" data-testid="button-view-resume">
                View Resume
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="py-8 px-6 md:px-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6 font-sans text-xs uppercase tracking-widest text-muted-foreground bg-card">
        <div>© 2025 Isaac Figueroa — Wave Creative House</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-primary transition-colors" data-testid="link-social-twitter"><Twitter size={18} /></a>
          <a href="#" className="hover:text-primary transition-colors" data-testid="link-social-instagram"><Instagram size={18} /></a>
          <a href="#" className="hover:text-primary transition-colors" data-testid="link-social-linkedin"><Linkedin size={18} /></a>
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
