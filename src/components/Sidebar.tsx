import { useEffect, useState } from 'react';
import {
  Info, FileCode, Package, CloudUpload, Layers, HardDrive,
  FileText, Play, ScrollText, RefreshCw, Command, Database,
  Zap, AlertTriangle, CheckSquare, ArrowRight, X,
} from 'lucide-react';
import { sections } from '@/data/sections';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Info, FileCode, Package, CloudUpload, Layers, HardDrive,
  FileText, Play, ScrollText, RefreshCw, Command, Database,
  Zap, AlertTriangle, CheckSquare, ArrowRight,
};

interface SidebarProps {
  activeSection: string;
  onNavigate: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({
  activeSection,
  onNavigate,
  searchQuery,
  onSearchChange,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const [scrollSpy, setScrollSpy] = useState(false);

  useEffect(() => {
    setScrollSpy(true);
  }, []);

  const filtered = searchQuery
    ? sections.filter((s) => {
        const q = searchQuery.toLowerCase();
        return (
          s.title.toLowerCase().includes(q) ||
          s.blocks.some((b) => b.text?.toLowerCase().includes(q))
        );
      })
    : sections;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-72 flex-col border-r border-slate-700/60 bg-slate-900 transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/60 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-sky-500/20">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-100">Docker Workflow</h1>
              <p className="text-xs text-slate-500">Reference Guide</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search sections..."
              className="w-full rounded-lg border border-slate-700/60 bg-slate-800/60 px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-sky-500/60 focus:bg-slate-800"
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <div className="space-y-0.5">
            {filtered.map((section) => {
              const Icon = iconMap[section.icon] || Info;
              const isActive = scrollSpy && activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => onNavigate(section.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all ${
                    isActive
                      ? 'bg-sky-500/10 font-medium text-sky-300'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                  <span className="flex-1 truncate">{section.title}</span>
                  <span className={`font-mono text-xs ${isActive ? 'text-sky-500/70' : 'text-slate-600'}`}>
                    {section.number}
                  </span>
                </button>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <p className="px-3 py-4 text-center text-sm text-slate-500">No results found</p>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-700/60 px-5 py-3">
          <p className="text-xs text-slate-600">16 sections · Complete guide</p>
        </div>
      </aside>
    </>
  );
}
