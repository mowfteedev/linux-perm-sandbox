import { useSandbox } from '@/store';
import { modeToOctal, modeToSymbolic } from '@/core/posix/mode';
import { ShieldCheck, ShieldAlert, Cpu, HardDrive } from 'lucide-react';

export function StatusBar() {
  const { currentNode, currentPath, currentOp, evaluation } = useSandbox();

  const octal = currentNode ? modeToOctal(currentNode.mode) : '----';
  const symbolic = currentNode ? modeToSymbolic(currentNode.mode, currentNode.type) : '----------';

  return (
    <footer className="h-9 border-t border-slate-800 bg-[#070b14] px-4 md:px-6 flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0 gap-4 overflow-x-auto">
      <div className="flex items-center gap-4 shrink-0">
        {/* Current Path */}
        <div className="flex items-center gap-1.5 text-slate-300">
          <HardDrive className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="text-slate-500">path:</span>
          <span className="text-sky-300 font-semibold">{currentPath}</span>
        </div>

        {/* Mode */}
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="text-slate-500">mode:</span>
          <span className="text-emerald-400 font-bold">{octal}</span>
          <span className="text-slate-400">({symbolic})</span>
        </div>

        {/* Ownership */}
        {currentNode && (
          <div className="hidden md:flex items-center gap-1.5">
            <span className="text-slate-500">owner:</span>
            <span className="text-slate-300">{currentNode.ownerUser}:{currentNode.groupName}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 shrink-0">
        {/* Verdict Badge */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">verdict ({currentOp}):</span>
          {evaluation.allowed ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 font-bold text-[10px]">
              <ShieldCheck className="w-3 h-3" /> ALLOWED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500/15 border border-rose-500/35 text-rose-400 font-bold text-[10px]">
              <ShieldAlert className="w-3 h-3" /> DENIED
            </span>
          )}
        </div>

        {/* Engine Latency Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 text-slate-500">
          <Cpu className="w-3 h-3 text-sky-400" />
          <span>latency: <span className="text-emerald-400 font-semibold">0ms</span></span>
          <span className="text-slate-600">|</span>
          <span>client-side kernel</span>
        </div>
      </div>
    </footer>
  );
}
