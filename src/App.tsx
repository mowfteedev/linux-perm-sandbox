import { Shield, Terminal, Cpu, CheckCircle2 } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 text-emerald-400 mb-4">
          <Shield className="w-8 h-8" />
          <h1 className="text-2xl font-bold tracking-tight">Linux Permissions & Sudoers Sandbox</h1>
        </div>

        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Môi trường mô phỏng phân quyền Linux POSIX và thẩm định quy tắc /etc/sudoers 100% Client-side.
        </p>

        <div className="space-y-3 font-mono text-xs">
          <div className="flex items-center gap-2 p-3 bg-slate-950/80 rounded-lg border border-slate-800/80 text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Core Foundation: React 19 + Vite + TypeScript (Strict)</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-slate-950/80 rounded-lg border border-slate-800/80 text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Styling: Tailwind CSS v4 + Terminal Dark Theme</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-slate-950/80 rounded-lg border border-slate-800/80 text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Testing: Vitest Ready for Pure TS Core Engine</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" /> status: ready for core engine
          </span>
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" /> bundle: zero-bloat
          </span>
        </div>
      </div>
    </div>
  );
}
