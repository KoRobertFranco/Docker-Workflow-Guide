import { useEffect, useRef, useState, useCallback } from 'react';
import { Menu, ChevronRight, ArrowUp } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ContentRenderer from '@/components/ContentRenderer';
import { sections } from '@/data/sections';

export default function App() {
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const contentRef = useRef<HTMLElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const handleNavigate = useCallback((id: string) => {
    const el = sectionRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileNavOpen(false);
  }, []);

  // Scroll spy
  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 400);
      const scrollPos = window.scrollY + 120;
      let current = sections[0].id;
      for (const section of sections) {
        const el = sectionRefs.current[section.id];
        if (el && el.offsetTop <= scrollPos) {
          current = section.id;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const activeIndex = sections.findIndex((s) => s.id === activeSection);
  const nextSection = activeIndex >= 0 && activeIndex < sections.length - 1 ? sections[activeIndex + 1] : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Sidebar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      {/* Mobile top bar */}
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-700/60 bg-slate-900/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <button
          onClick={() => setMobileNavOpen(true)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold text-slate-200">Docker Workflow Guide</span>
      </div>

      {/* Main content */}
      <main ref={contentRef} className="lg:pl-72">
        <div className="mx-auto max-w-4xl px-5 py-8 lg:px-12 lg:py-12">
          {/* Hero header */}
          <div className="mb-10 border-b border-slate-800 pb-8">
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-400">
                DevOps
              </span>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-400">
                .NET / Docker
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-50 lg:text-4xl">
              Complete Docker Workflow
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-400">
              A step-by-step reference guide covering Dockerfile creation, image building,
              Docker Hub deployment, Compose configuration, data persistence, and server deployment.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-16">
            {sections.map((section) => (
              <section
                key={section.id}
                ref={(el) => {
                  sectionRefs.current[section.id] = el;
                }}
                id={section.id}
                className="scroll-mt-20"
              >
                {/* Section header */}
                <div className="mb-5 flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-600/20 ring-1 ring-sky-500/20">
                    <span className="font-mono text-sm font-bold text-sky-400">
                      {section.number}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-50 lg:text-2xl">
                      {section.title}
                    </h2>
                    <div className="mt-1.5 h-0.5 w-12 rounded-full bg-sky-500/40" />
                  </div>
                </div>

                {/* Content */}
                <div className="pl-0 lg:pl-15">
                  {section.blocks.map((block, i) => (
                    <ContentRenderer key={i} block={block} />
                  ))}
                </div>

                {/* Next section link */}
                {nextSection && section.id === activeSection && (
                  <button
                    onClick={() => handleNavigate(nextSection.id)}
                    className="mt-8 flex items-center gap-2 rounded-lg border border-slate-700/60 bg-slate-800/40 px-4 py-3 text-sm text-slate-300 transition-colors hover:border-sky-500/40 hover:bg-slate-800/80 hover:text-sky-300"
                  >
                    <span className="text-slate-500">Next:</span>
                    <span className="font-medium">{nextSection.title}</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </section>
            ))}
          </div>

          {/* Footer */}
          <footer className="mt-16 border-t border-slate-800 pt-6">
            <p className="text-center text-xs text-slate-600">
              Docker Workflow Reference Guide · Built for development teams
            </p>
          </footer>
        </div>
      </main>

      {/* Scroll to top */}
      {showTopBtn && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg shadow-sky-500/30 transition-all hover:bg-sky-400 hover:shadow-sky-500/50"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
