import { useState, useMemo } from 'react';
import { 
  FileCode, 
  Flame, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { useSandbox } from '@/store';
import { evaluateSudoers } from '@/core/sudoers/matcher';
import { 
  DEFAULT_SUDOERS_CONTENT, 
  SUDOERS_PRESET_MISCONFIGURED, 
  SUDOERS_PRESET_HARDENED 
} from '@/core/sudoers/default-sudoers';

const SUDOERS_PRESETS = [
  {
    id: 'default',
    title: 'Standard Ubuntu / Debian',
    content: DEFAULT_SUDOERS_CONTENT,
  },
  {
    id: 'gtfobins',
    title: 'High Risk (GTFOBins & Misconfigured)',
    content: SUDOERS_PRESET_MISCONFIGURED,
  },
  {
    id: 'hardened',
    title: 'Hardened Least Privilege Policy',
    content: SUDOERS_PRESET_HARDENED,
  },
];

export function SudoersStudio() {
  const { 
    sudoersContent, 
    setSudoersContent, 
    sudoersAnalysis, 
    currentUser 
  } = useSandbox();

  const [testCmd, setTestCmd] = useState<string>('vim /etc/shadow');
  const [activeTab, setActiveTab] = useState<'editor' | 'warnings' | 'simulator'>('editor');

  // Parse command & args for simulator
  const simResult = useMemo(() => {
    const trimmed = testCmd.trim();
    if (!trimmed) return null;

    const firstSpace = trimmed.indexOf(' ');
    let binary = trimmed;
    let args = '';
    if (firstSpace !== -1) {
      binary = trimmed.slice(0, firstSpace).trim();
      args = trimmed.slice(firstSpace + 1).trim();
    }

    return evaluateSudoers(sudoersAnalysis.ast, {
      user: currentUser,
      command: binary,
      args,
      host: 'localhost',
      runasUser: 'root',
    });
  }, [sudoersAnalysis.ast, currentUser, testCmd]);

  return (
    <div className="bg-[#0c1222] border border-slate-800 rounded-xl p-5 space-y-5 shadow-lg flex flex-col h-full">
      {/* 1. Studio Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-sky-400" />
          <h2 className="font-mono font-bold text-sm text-slate-100 uppercase tracking-wider">
            Sudoers Studio & GTFOBins Inspector
          </h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
          /etc/sudoers(5)
        </span>
      </div>

      {/* 2. Navigation Tabs & Preset Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sudoers Text
          </button>
          <button
            onClick={() => setActiveTab('warnings')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'warnings'
                ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Security Alerts</span>
            {sudoersAnalysis.warnings.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                {sudoersAnalysis.warnings.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Simulator
          </button>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-slate-500 hidden md:inline">Presets:</span>
          <select
            onChange={(e) => {
              const p = SUDOERS_PRESETS.find((x) => x.id === e.target.value);
              if (p) setSudoersContent(p.content);
            }}
            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 text-[11px] focus:outline-none focus:border-sky-500"
          >
            {SUDOERS_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Tab Content */}
      <div className="flex-1 min-h-[300px]">
        {activeTab === 'editor' && (
          <div className="space-y-3 h-full flex flex-col">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Chỉnh sửa quy tắc trực tiếp:</span>
              <span>{sudoersAnalysis.ast.rules.length} rules parsed</span>
            </div>
            <div className="relative flex-1">
              <textarea
                value={sudoersContent}
                onChange={(e) => setSudoersContent(e.target.value)}
                spellCheck={false}
                className="w-full h-full min-h-[260px] p-3.5 font-mono text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 leading-relaxed focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-400/30 resize-none selection:bg-sky-500/30"
              />
            </div>
          </div>
        )}

        {activeTab === 'warnings' && (
          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
            {/* Rule Clashes */}
            {sudoersAnalysis.clashes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Rule Clash Conflicts ({sudoersAnalysis.clashes.length})</span>
                </div>
                {sudoersAnalysis.clashes.map((c, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs font-mono space-y-1.5">
                    <div className="flex items-center justify-between text-amber-300 font-bold">
                      <span>Shadowed: Line {c.shadowedRuleLine} overridden by Line {c.winningRuleLine}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20">Last-Match-Wins</span>
                    </div>
                    <p className="text-slate-400 font-sans text-[11px] leading-relaxed">
                      {c.reason}
                    </p>
                    <div className="pt-1 text-[11px] text-slate-500">
                      User/Group: <code className="text-slate-300">{c.affectedUserOrGroup}</code>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* GTFOBins & Critical Warnings */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-rose-400 font-bold uppercase tracking-wide">
                <Flame className="w-4 h-4" />
                <span>Privilege Escalation Risks ({sudoersAnalysis.warnings.length})</span>
              </div>

              {sudoersAnalysis.warnings.length === 0 ? (
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Không phát hiện lỗ hổng leo thang GTFOBins nghiêm trọng trong file cấu hình này.</span>
                </div>
              ) : (
                sudoersAnalysis.warnings.map((w, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/35 text-xs font-mono space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-rose-300">{w.title}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                            w.severity === 'CRITICAL' ? 'bg-rose-500 text-slate-950' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}>
                            {w.severity}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Target: <span className="text-slate-200 font-bold">{w.user}</span> | Line {w.line}: <code className="text-sky-300">{w.command}</code>
                        </div>
                      </div>

                      {w.gtfobins && (
                        <a
                          href={w.gtfobins.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-sky-400 hover:text-sky-300 hover:border-sky-500 text-[11px] shrink-0"
                        >
                          <span>GTFOBins</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <p className="text-slate-300 font-sans text-xs leading-relaxed">
                      {w.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'simulator' && (
          <div className="space-y-4">
            <div className="space-y-1.5 font-mono text-xs">
              <label className="text-slate-400 text-xs">Thử nghiệm chạy lệnh bằng sudo:</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$ sudo</span>
                  <input
                    type="text"
                    value={testCmd}
                    onChange={(e) => setTestCmd(e.target.value)}
                    placeholder="vim /etc/shadow hoặc apt update..."
                    className="w-full pl-20 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Simulation Verdict */}
            {simResult && (
              <div
                className={`p-4 rounded-xl border ${
                  simResult.allowed
                    ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                    : 'bg-rose-500/10 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {simResult.allowed ? (
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 text-rose-400" />
                    )}
                  </div>
                  <div className="space-y-1 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${simResult.allowed ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {simResult.allowed ? 'SUDO EXECUTION PERMITTED' : 'SUDO EXECUTION FORBIDDEN'}
                      </span>
                      {simResult.allowed && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          simResult.requiresPassword
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {simResult.requiresPassword ? 'PASSWORD REQUIRED' : 'NOPASSWD (FREE PASS)'}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 font-sans text-xs">
                      User: <strong className="text-slate-200">{currentUser.username}</strong> | RunAs:{' '}
                      <strong className="text-slate-200">{simResult.runasUser}</strong>
                    </p>
                    {simResult.denialReason && (
                      <div className="text-rose-400 bg-rose-950/40 p-2 rounded border border-rose-900/50 mt-2">
                        {simResult.denialReason}
                      </div>
                    )}
                    {simResult.winningRule && (
                      <div className="text-slate-400 text-[11px] mt-1">
                        Matched Rule (Line {simResult.winningRule.line}): <code className="text-sky-300">{simResult.winningRule.rawText.trim()}</code>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
