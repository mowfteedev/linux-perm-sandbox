import { useState } from 'react';
import { SandboxProvider } from './store';
import { Header, StatusBar } from './ui/layout';
import { VFSTree } from './ui/components/vfs-tree';
import { PermissionMatrix } from './ui/components/permission-matrix';
import { KernelTracer } from './ui/components/kernel-tracer';
import { SudoersStudio } from './ui/components/sudoers-studio';
import { CheatsheetModal } from './ui/components/cheatsheet';
import { HardDrive, SlidersHorizontal, FileCode } from 'lucide-react';

function DashboardShell() {
  const [mobileTab, setMobileTab] = useState<'files' | 'matrix' | 'sudoers'>('matrix');

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 overflow-x-hidden">
      {/* 1. Header Bar */}
      <Header />

      {/* Mobile Tab Switcher (Visible on small screens < lg) */}
      <div className="lg:hidden p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-around gap-2 text-xs font-mono">
        <button
          onClick={() => setMobileTab('files')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            mobileTab === 'files'
              ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-400/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>VFS Files</span>
        </button>

        <button
          onClick={() => setMobileTab('matrix')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            mobileTab === 'matrix'
              ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>POSIX Matrix</span>
        </button>

        <button
          onClick={() => setMobileTab('sudoers')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            mobileTab === 'sudoers'
              ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-400/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Sudoers</span>
        </button>
      </div>

      {/* 2. Main Multi-Panel Workspace */}
      <main className="flex-1 p-4 md:p-6 w-full max-w-[1720px] mx-auto overflow-y-auto">
        {/* Desktop 3-Column Layout */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: VFS Explorer (Col 1-3) */}
          <section className="lg:col-span-3 h-[calc(100vh-8.5rem)] sticky top-4">
            <VFSTree />
          </section>

          {/* Center Column: Permission Matrix & Kernel Tracer (Col 4-8) */}
          <section className="lg:col-span-5 space-y-6">
            <PermissionMatrix />
            <KernelTracer />
          </section>

          {/* Right Column: Sudoers Studio & GTFOBins (Col 9-12) */}
          <section className="lg:col-span-4 h-[calc(100vh-8.5rem)] sticky top-4">
            <SudoersStudio />
          </section>
        </div>

        {/* Mobile Single-Column Responsive View */}
        <div className="lg:hidden space-y-6">
          {mobileTab === 'files' && (
            <div className="h-[650px]">
              <VFSTree />
            </div>
          )}

          {mobileTab === 'matrix' && (
            <div className="space-y-6">
              <PermissionMatrix />
              <KernelTracer />
            </div>
          )}

          {mobileTab === 'sudoers' && (
            <div className="min-h-[600px]">
              <SudoersStudio />
            </div>
          )}
        </div>
      </main>

      {/* 3. Global Status Bar */}
      <StatusBar />

      {/* 4. Cheatsheet Modal */}
      <CheatsheetModal />
    </div>
  );
}

export default function App() {
  return (
    <SandboxProvider>
      <DashboardShell />
    </SandboxProvider>
  );
}
