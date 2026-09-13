import { 
  ShieldCheck, 
  ShieldAlert, 
  CornerDownRight, 
  CheckCircle2, 
  XCircle, 
  Info, 
  AlertTriangle,
  Flame,
  Terminal
} from 'lucide-react';
import { useSandbox } from '@/store';
import { TraceStep } from '@/types';

export function KernelTracer() {
  const { evaluation, currentUser, currentOp, currentPath } = useSandbox();

  const isAllowed = evaluation.allowed;

  const renderStageIcon = (step: TraceStep) => {
    if (step.status === 'GRANTED') {
      return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    if (step.status === 'DENIED') {
      return <XCircle className="w-4 h-4 text-rose-400 shrink-0" />;
    }
    if (step.status === 'INFO') {
      return <Info className="w-4 h-4 text-sky-400 shrink-0" />;
    }
    return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
  };

  return (
    <div className="bg-[#0c1222] border border-slate-800 rounded-xl p-5 space-y-5 shadow-lg">
      {/* 1. Tracer Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-sky-400" />
          <h2 className="font-mono font-bold text-sm text-slate-100 uppercase tracking-wider">
            Kernel Permission Tracer
          </h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
          POSIX Spec Resolution
        </span>
      </div>

      {/* 2. Verdict Banner */}
      <div
        className={`p-4 rounded-xl border transition-all duration-200 ${
          isAllowed
            ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_16px_rgba(16,185,129,0.15)]'
            : 'bg-rose-500/10 border-rose-500/40 shadow-[0_0_16px_rgba(244,63,94,0.15)]'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              {isAllowed ? (
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-rose-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`font-mono font-bold text-sm ${
                    isAllowed ? 'text-emerald-300' : 'text-rose-300'
                  }`}
                >
                  {isAllowed ? 'ACCESS GRANTED (0)' : 'ACCESS DENIED (-EACCES)'}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-slate-300">
                  op: {currentOp.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
                Người dùng <strong className="text-slate-200">{currentUser.username}</strong> (UID: {currentUser.uid}){' '}
                {isAllowed ? 'được phép' : 'bị từ chối'} thực hiện thao tác{' '}
                <strong className="text-slate-200">{currentOp}</strong> trên{' '}
                <code className="text-sky-300 font-mono">{currentPath}</code>.
              </p>
              {evaluation.denialReason && (
                <div className="mt-2 text-xs font-mono text-rose-400 bg-rose-950/40 p-2 rounded border border-rose-900/50">
                  {evaluation.denialReason}
                </div>
              )}
            </div>
          </div>

          <div className="text-right font-mono text-[11px] text-slate-500 shrink-0 hidden sm:block">
            <div>EUID: {evaluation.effectiveUid}</div>
            <div>EGID: {evaluation.effectiveGid}</div>
          </div>
        </div>
      </div>

      {/* 3. Step-by-Step Resolution Trace */}
      <div className="space-y-3">
        <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <CornerDownRight className="w-3.5 h-3.5 text-sky-400" />
          <span>Detailed Resolution Steps ({evaluation.traces.length})</span>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {evaluation.traces.map((trace, index) => {
            const isDenied = trace.status === 'DENIED';
            const isGranted = trace.status === 'GRANTED';

            return (
              <div
                key={trace.stepId || index}
                className={`p-3 rounded-lg border transition-all ${
                  isDenied
                    ? 'bg-rose-950/20 border-rose-500/30'
                    : isGranted
                    ? 'bg-slate-900/70 border-slate-800'
                    : 'bg-sky-950/20 border-sky-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <div className="mt-0.5">{renderStageIcon(trace)}</div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200 truncate">
                          {trace.title}
                        </span>
                        <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800">
                          {trace.stage}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mt-1 leading-relaxed font-sans">
                        {trace.detail}
                      </p>
                      {trace.codeSnippet && (
                        <div className="mt-2 flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded border border-slate-800 text-emerald-400 text-[11px] font-mono">
                          <span className="text-slate-600">Gợi ý sửa:</span>
                          <code>{trace.codeSnippet}</code>
                        </div>
                      )}
                    </div>
                  </div>

                  {trace.testedBit && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 shrink-0">
                      {trace.testedBit}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Special Bit Elevation Callout (SUID/SGID) */}
      {(evaluation.targetNode.mode.special.suid || evaluation.targetNode.mode.special.sgid) && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-2 text-xs font-mono">
          <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-300">Special Bit Execution Notice:</span>
            <p className="text-slate-400 font-sans">
              {evaluation.targetNode.mode.special.suid && (
                <span>File này có cờ <strong>SUID</strong>: Khi chạy, tiến trình sẽ nâng quyền EUID lên {evaluation.targetNode.ownerUid} ({evaluation.targetNode.ownerUser}). </span>
              )}
              {evaluation.targetNode.mode.special.sgid && (
                <span>File này có cờ <strong>SGID</strong>: Tiến trình sẽ nâng quyền EGID lên {evaluation.targetNode.groupGid} ({evaluation.targetNode.groupName}).</span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
