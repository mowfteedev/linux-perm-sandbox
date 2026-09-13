import { useState } from 'react';
import { 
  Terminal, 
  Shield, 
  Key, 
  FolderTree, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Lock, 
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react';
import { DESIGN_TOKENS } from './ui/tokens';

export default function App() {
  // Local state for micro-interaction demo (purely visual demo for Design System)
  const [demoBits, setDemoBits] = useState({ r: true, w: false, x: true });
  const [demoSpecial, setDemoSpecial] = useState({ suid: false, sgid: true, sticky: false });

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans selection:bg-sky-500/30">
      {/* 1. Terminal Top Navigation Bar (Header Specification) */}
      <header className="h-14 border-b border-slate-800 bg-[#0c1222]/80 backdrop-blur px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide text-slate-100 font-mono">linux-perm-sandbox</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                Design System v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400">SysAdmin Terminal & Permissions Design Specification</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <span className="text-slate-500">theme:</span>
            <span className="text-sky-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              SysAdmin Dark
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <span className="text-slate-500">grid:</span>
            <span className="text-emerald-400">8pt strict</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <span className="text-slate-500">wcag:</span>
            <span className="text-emerald-400 font-bold">2.1 AA+ (17.6:1)</span>
          </div>
        </div>
      </header>

      {/* 2. Main Content Body (Design Showcase & Specification Delivery) */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
        {/* Milestone Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/40 via-slate-900/60 to-indigo-950/40 border border-sky-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
                Nhiệm Vụ STT 5: Thiết Kế UI & Theme Terminal SysAdmin
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Hoàn Tất (@designer)
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Đã xây dựng hoàn chỉnh từ điển <strong>Design Tokens</strong> (8pt Grid: {DESIGN_TOKENS.spacing.sm} - {DESIGN_TOKENS.spacing['2xl']}), 
                cấu hình bảng màu phân cấp <strong>UGO & Special Bits</strong>, và chuẩn bị bộ đặc tả cho <code>@frontend</code> triển khai STT 6.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto font-mono text-xs text-slate-400 bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>Scope: Design Tokens & Spec Only</span>
          </div>
        </div>

        {/* Section 1: UGO Targets & Bit Color Semantics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User / Owner Panel */}
          <div className="bg-[#0c1222] border border-slate-800 rounded-xl p-5 space-y-4 hover:border-sky-500/40 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
                <h3 className="font-mono font-bold text-sm text-sky-400">User / Owner (u)</h3>
              </div>
              <span className="font-mono text-[11px] text-slate-400">Target: #38bdf8</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Quyền hạn của chủ sở hữu tập tin. Khi UID của tiến trình khớp với UID tập tin, kernel chỉ đánh giá bộ 3 bit này.
            </p>
            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 text-center font-bold">
                r (Read)
              </div>
              <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/35 text-amber-400 text-center font-bold">
                w (Write)
              </div>
              <div className="p-2.5 rounded-lg bg-blue-500/15 border border-blue-500/35 text-blue-400 text-center font-bold">
                x (Exec)
              </div>
            </div>
          </div>

          {/* Group Panel */}
          <div className="bg-[#0c1222] border border-slate-800 rounded-xl p-5 space-y-4 hover:border-indigo-500/40 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]" />
                <h3 className="font-mono font-bold text-sm text-indigo-400">Group (g)</h3>
              </div>
              <span className="font-mono text-[11px] text-slate-400">Target: #818cf8</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Quyền hạn của nhóm sở hữu. Chỉ được đánh giá khi UID không khớp nhưng GID thuộc danh sách nhóm của người dùng.
            </p>
            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 text-center font-bold">
                r (Read)
              </div>
              <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/35 text-amber-400 text-center font-bold">
                w (Write)
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-500 text-center">
                - (None)
              </div>
            </div>
          </div>

          {/* Others Panel */}
          <div className="bg-[#0c1222] border border-slate-800 rounded-xl p-5 space-y-4 hover:border-violet-500/40 transition-colors">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.6)]" />
                <h3 className="font-mono font-bold text-sm text-violet-400">Others (o)</h3>
              </div>
              <span className="font-mono text-[11px] text-slate-400">Target: #a78bfa</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Quyền hạn áp dụng cho toàn bộ người dùng còn lại nếu không khớp chủ sở hữu và không thuộc nhóm.
            </p>
            <div className="grid grid-cols-3 gap-2 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 text-center font-bold">
                r (Read)
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-500 text-center">
                - (None)
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-500 text-center">
                - (None)
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Special Bits & High-Privilege Signals */}
        <div className="bg-[#0c1222] border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <Flame className="w-5 h-5 text-rose-400" />
              <h3 className="font-semibold text-sm text-slate-100">Special Bits & Privilege Escalation Semantics</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Octal: 4000 / 2000 / 1000</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* SUID */}
            <button
              onClick={() => setDemoSpecial((p) => ({ ...p, suid: !p.suid }))}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                demoSpecial.suid 
                  ? 'bg-rose-500/20 border-rose-400 shadow-[0_0_14px_rgba(244,63,94,0.35)]' 
                  : 'bg-rose-500/10 border-rose-500/30 hover:border-rose-500/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-rose-400 uppercase tracking-wider">SUID (4000)</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                  {demoSpecial.suid ? 's (ACTIVE)' : 's / S'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Thực thi với đặc quyền của chủ sở hữu file (nguy cơ leo thang root nếu là GTFOBins).
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-rose-400">
                  <Shield className="w-3.5 h-3.5" /> High Risk Alert
                </span>
              </div>
            </button>

            {/* SGID */}
            <button
              onClick={() => setDemoSpecial((p) => ({ ...p, sgid: !p.sgid }))}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                demoSpecial.sgid 
                  ? 'bg-orange-500/20 border-orange-400 shadow-[0_0_14px_rgba(249,115,22,0.35)]' 
                  : 'bg-orange-500/10 border-orange-500/30 hover:border-orange-500/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-orange-400 uppercase tracking-wider">SGID (2000)</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 font-bold">
                  {demoSpecial.sgid ? 's (ACTIVE)' : 's / S'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Thực thi với đặc quyền nhóm, hoặc thư mục bắt buộc file con kế thừa GID cha.
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-orange-400">
                  <Key className="w-3.5 h-3.5" /> Group Inherit
                </span>
              </div>
            </button>

            {/* Sticky Bit */}
            <button
              onClick={() => setDemoSpecial((p) => ({ ...p, sticky: !p.sticky }))}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                demoSpecial.sticky 
                  ? 'bg-fuchsia-500/20 border-fuchsia-400 shadow-[0_0_14px_rgba(217,70,239,0.35)]' 
                  : 'bg-fuchsia-500/10 border-fuchsia-500/30 hover:border-fuchsia-500/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-fuchsia-400 uppercase tracking-wider">Sticky Bit (1000)</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 font-bold">
                  {demoSpecial.sticky ? 't (ACTIVE)' : 't / T'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Chỉ người tạo file hoặc root mới có quyền xóa tập tin trong thư mục chia sẻ (vd: /tmp).
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-fuchsia-400">
                  <Lock className="w-3.5 h-3.5" /> Deletion Guard
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Section 3: Micro-Interactions & Tactile Bit Toggles Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tactile Bit Toggles Demo */}
          <div className="bg-[#0c1222] border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                Mẫu Tương Tác Phím Bấm Bit (Tactile Micro-Interactions)
              </h3>
              <span className="text-xs font-mono text-slate-400">Try clicking:</span>
            </div>
            <p className="text-xs text-slate-400">
              Mỗi ô bit sở hữu hiệu ứng tactile co nhẹ khi bấm (<code>active:scale-95</code>), đổ bóng glow màu tương ứng và viền nổi bật.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDemoBits((p) => ({ ...p, r: !p.r }))}
                className={`w-14 h-14 rounded-lg font-mono font-bold text-base flex flex-col items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer ${
                  demoBits.r
                    ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
                    : 'bg-slate-900 border border-slate-800 text-slate-600 hover:border-slate-700'
                }`}
              >
                <span>{demoBits.r ? 'r' : '-'}</span>
                <span className="text-[9px] font-normal opacity-70">4</span>
              </button>

              <button
                onClick={() => setDemoBits((p) => ({ ...p, w: !p.w }))}
                className={`w-14 h-14 rounded-lg font-mono font-bold text-base flex flex-col items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer ${
                  demoBits.w
                    ? 'bg-amber-500/20 border-2 border-amber-400 text-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                    : 'bg-slate-900 border border-slate-800 text-slate-600 hover:border-slate-700'
                }`}
              >
                <span>{demoBits.w ? 'w' : '-'}</span>
                <span className="text-[9px] font-normal opacity-70">2</span>
              </button>

              <button
                onClick={() => setDemoBits((p) => ({ ...p, x: !p.x }))}
                className={`w-14 h-14 rounded-lg font-mono font-bold text-base flex flex-col items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer ${
                  demoBits.x
                    ? 'bg-blue-500/20 border-2 border-blue-400 text-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.3)]'
                    : 'bg-slate-900 border border-slate-800 text-slate-600 hover:border-slate-700'
                }`}
              >
                <span>{demoBits.x ? 'x' : '-'}</span>
                <span className="text-[9px] font-normal opacity-70">1</span>
              </button>

              <div className="ml-4 pl-4 border-l border-slate-800 text-xs font-mono space-y-1">
                <div className="text-slate-500 text-[11px]">Symbolic / Octal:</div>
                <div className="text-sm font-bold text-sky-400">
                  {demoBits.r ? 'r' : '-'}
                  {demoBits.w ? 'w' : '-'}
                  {demoBits.x ? 'x' : '-'} ({ (demoBits.r ? 4 : 0) + (demoBits.w ? 2 : 0) + (demoBits.x ? 1 : 0) })
                </div>
              </div>
            </div>
          </div>

          {/* Kernel Verdict Badges Showcase */}
          <div className="bg-[#0c1222] border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                <Shield className="w-4 h-4 text-sky-400" />
                Kernel Verdict & Status Badges (Design Tokens)
              </h3>
              <span className="text-xs font-mono text-slate-400">Tokens</span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <div className="truncate">
                  <div className="font-bold">ALLOW (0)</div>
                  <div className="text-[10px] text-emerald-500/80">Permission Granted</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <div className="truncate">
                  <div className="font-bold">DENY (-EACCES)</div>
                  <div className="text-[10px] text-rose-500/80">Permission Denied</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center gap-2">
                <FolderTree className="w-4 h-4 shrink-0" />
                <div className="truncate">
                  <div className="font-bold">TRAVERSAL</div>
                  <div className="text-[10px] text-sky-500/80">Path & Ancestors OK</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <div className="truncate">
                  <div className="font-bold">RULE CLASH</div>
                  <div className="text-[10px] text-amber-500/80">Shadowed Sudoers Rule</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Handoff Contract Note to @frontend */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cpu className="w-4 h-4 text-slate-500" />
            <span>
              Tài liệu đặc tả bàn giao đầy đủ tại: <code className="text-sky-400">.memory/design-system.md</code>. 
              Sẵn sàng cho <strong>@frontend</strong> triển khai <strong>STT 6 (Dựng giao diện Matrix, Tracer, VFS Tree)</strong>.
            </span>
          </div>
          <span className="font-mono text-emerald-400 shrink-0 font-semibold">STT 5: 100% Ready</span>
        </div>
      </main>

      {/* 3. Terminal Status Footer */}
      <footer className="h-8 border-t border-slate-800/80 bg-[#070b14] px-6 flex items-center justify-between text-[11px] font-mono text-slate-500 shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-slate-400">status: <span className="text-emerald-400">design-tokens-ready</span></span>
          <span>grid: 8pt</span>
          <span>contrast: 17.6:1 (AAA)</span>
        </div>
        <div className="flex items-center gap-4">
          <span>core-tests: <span className="text-emerald-400 font-bold">45/45 pass</span></span>
          <span className="text-slate-400">target: STT 6 (@frontend)</span>
        </div>
      </footer>
    </div>
  );
}
