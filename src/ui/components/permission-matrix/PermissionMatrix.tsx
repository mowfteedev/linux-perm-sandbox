import React, { useState } from 'react';
import { 
  Flame, 
  Copy, 
  Check, 
  User as UserIcon, 
  Users, 
  SlidersHorizontal,
  Code
} from 'lucide-react';
import { useSandbox } from '@/store';
import { PosixMode } from '@/types';
import { modeToOctal, modeToSymbolic } from '@/core/posix/mode';
import { DEFAULT_GROUPS, DEFAULT_USERS } from '@/core/vfs/default-fs';

export function PermissionMatrix() {
  const { 
    currentNode, 
    currentPath, 
    updateNodeMode, 
    updateNodeOctal, 
    updateNodeOwnership 
  } = useSandbox();

  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!currentNode) {
    return (
      <div className="bg-[#0c1222] border border-slate-800 rounded-xl p-8 text-center text-slate-500 font-mono text-xs">
        Chọn một file hoặc thư mục từ VFS Explorer để xem và điều chỉnh phân quyền.
      </div>
    );
  }

  const mode = currentNode.mode;
  const octal = modeToOctal(mode);
  const symbolic = modeToSymbolic(mode, currentNode.type);

  // Toggle individual bits
  const toggleBit = (category: 'user' | 'group' | 'other', bit: 'read' | 'write' | 'execute') => {
    const updated: PosixMode = {
      ...mode,
      [category]: {
        ...mode[category],
        [bit]: !mode[category][bit],
      },
    };
    updateNodeMode(currentPath, updated);
  };

  // Toggle special bits
  const toggleSpecial = (type: 'suid' | 'sgid' | 'sticky') => {
    const updated: PosixMode = {
      ...mode,
      special: {
        ...mode.special,
        [type]: !mode.special[type],
      },
    };
    updateNodeMode(currentPath, updated);
  };

  // Direct octal input change
  const handleOctalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    if (/^[0-7]{3,4}$/.test(val)) {
      updateNodeOctal(currentPath, val);
    }
  };

  const chmodCommand = `chmod ${octal} ${currentPath}`;
  const chownCommand = `chown ${currentNode.ownerUser}:${currentNode.groupName} ${currentPath}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="bg-[#0c1222] border border-slate-800 rounded-xl p-5 space-y-5 shadow-lg">
      {/* 1. Matrix Header: Symbolic & Octal representation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-sky-400" />
            <h2 className="font-mono font-bold text-sm text-slate-100 uppercase tracking-wider">
              Interactive Permission Matrix
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-400 font-mono truncate max-w-xs md:max-w-md">
              {currentPath}
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
              {currentNode.type}
            </span>
          </div>
        </div>

        {/* Live Octal & Symbolic Pills */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Symbolic</span>
            <span className="font-mono font-bold text-sm text-sky-300 tracking-wider bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              {symbolic}
            </span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono text-slate-500 uppercase">Octal</span>
            <div className="relative">
              <input
                type="text"
                maxLength={4}
                defaultValue={octal}
                key={octal}
                onChange={handleOctalChange}
                className="w-20 font-mono font-bold text-sm text-emerald-400 text-center bg-slate-950 px-2 py-1 rounded border border-slate-800 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-400/30"
                title="Nhập mã bát phân 3 hoặc 4 chữ số (vd: 0755, 4755, 0644)"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive 3x3 UGO Grid */}
      <div className="space-y-3">
        <div className="grid grid-cols-4 gap-2 text-xs font-mono text-slate-400 text-center px-1">
          <div className="text-left text-slate-500 uppercase text-[10px]">Target</div>
          <div className="text-emerald-400 font-bold">r (Read - 4)</div>
          <div className="text-amber-400 font-bold">w (Write - 2)</div>
          <div className="text-blue-400 font-bold">x (Exec - 1)</div>
        </div>

        {/* Row 1: Owner / User (u) */}
        <div className="grid grid-cols-4 gap-2 items-center bg-slate-900/40 p-2 rounded-lg border border-slate-800/60">
          <div className="flex items-center gap-2 font-mono text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
            <span className="font-bold text-sky-300">User (u)</span>
          </div>

          <button
            onClick={() => toggleBit('user', 'read')}
            className={`py-2 rounded-lg font-mono font-bold text-xs transition-all duration-150 active:scale-95 cursor-pointer ${
              mode.user.read
                ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                : 'bg-slate-900 border border-slate-800 text-slate-600 hover:border-slate-700'
            }`}
          >
            {mode.user.read ? 'r' : '-'}
          </button>

          <button
            onClick={() => toggleBit('user', 'write')}
            className={`py-2 rounded-lg font-mono font-bold text-xs transition-all duration-150 active:scale-95 cursor-pointer ${
              mode.user.write
                ? 'bg-amber-500/20 border-2 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                : 'bg-slate-900 border border-slate-800 text-slate-600 hover:border-slate-700'
            }`}
          >
            {mode.user.write ? 'w' : '-'}
          </button>

          <button
            onClick={() => toggleBit('user', 'execute')}
            className={`py-2 rounded-lg font-mono font-bold text-xs transition-all duration-150 active:scale-95 cursor-pointer ${
              mode.user.execute
                ? 'bg-blue-500/20 border-2 border-blue-400 text-blue-300 shadow-[0_0_10px_rgba(96,165,250,0.3)]'
                : 'bg-slate-900 border border-slate-800 text-slate-600 hover:border-slate-700'
            }`}
          >
            {mode.user.execute ? 'x' : '-'}
          </button>
        </div>

        {/* Row 2: Group (g) */}
        <div className="grid grid-cols-4 gap-2 items-center bg-slate-900/40 p-2 rounded-lg border border-slate-800/60">
          <div className="flex items-center gap-2 font-mono text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
            <span className="font-bold text-indigo-300">Group (g)</span>
          </div>

          <button
            onClick={() => toggleBit('group', 'read')}
            className={`py-2 rounded-lg font-mono font-bold text-xs transition-all duration-150 active:scale-95 cursor-pointer ${
              mode.group.read
                ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                : 'bg-slate-900 border border-slate-800 text-slate-600 hover:border-slate-700'
            }`}
          >
            {mode.group.read ? 'r' : '-'}
          </button>

          <button
            onClick={() => toggleBit('group', 'write')}
            className={`py-2 rounded-lg font-mono font-bold text-xs transition-all duration-150 active:scale-95 cursor-pointer ${
              mode.group.write
                ? 'bg-amber-500/20 border-2 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                : 'bg-slate-900 border border-slate-800 text-slate-600 hover:border-slate-700'
            }`}
          >
            {mode.group.write ? 'w' : '-'}
          </button>

          <button
            onClick={() => toggleBit('group', 'execute')}
            className={`py-2 rounded-lg font-mono font-bold text-xs transition-all duration-150 active:scale-95 cursor-pointer ${
              mode.group.execute
                ? 'bg-blue-500/20 border-2 border-blue-400 text-blue-300 shadow-[0_0_10px_rgba(96,165,250,0.3)]'
                : 'bg-slate-900 border border-slate-800 text-slate-600 hover:border-slate-700'
            }`}
          >
            {mode.group.execute ? 'x' : '-'}
          </button>
        </div>

        {/* Row 3: Others (o) */}
        <div className="grid grid-cols-4 gap-2 items-center bg-slate-900/40 p-2 rounded-lg border border-slate-800/60">
          <div className="flex items-center gap-2 font-mono text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.5)]" />
            <span className="font-bold text-violet-300">Others (o)</span>
          </div>

          <button
            onClick={() => toggleBit('other', 'read')}
            className={`py-2 rounded-lg font-mono font-bold text-xs transition-all duration-150 active:scale-95 cursor-pointer ${
              mode.other.read
                ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                : 'bg-slate-900 border border-slate-800 text-slate-600 hover:border-slate-700'
            }`}
          >
            {mode.other.read ? 'r' : '-'}
          </button>

          <button
            onClick={() => toggleBit('other', 'write')}
            className={`py-2 rounded-lg font-mono font-bold text-xs transition-all duration-150 active:scale-95 cursor-pointer ${
              mode.other.write
                ? 'bg-amber-500/20 border-2 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                : 'bg-slate-900 border border-slate-800 text-slate-600 hover:border-slate-700'
            }`}
          >
            {mode.other.write ? 'w' : '-'}
          </button>

          <button
            onClick={() => toggleBit('other', 'execute')}
            className={`py-2 rounded-lg font-mono font-bold text-xs transition-all duration-150 active:scale-95 cursor-pointer ${
              mode.other.execute
                ? 'bg-blue-500/20 border-2 border-blue-400 text-blue-300 shadow-[0_0_10px_rgba(96,165,250,0.3)]'
                : 'bg-slate-900 border border-slate-800 text-slate-600 hover:border-slate-700'
            }`}
          >
            {mode.other.execute ? 'x' : '-'}
          </button>
        </div>
      </div>

      {/* 3. Special Bits Toolbar */}
      <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <Flame className="w-4 h-4 text-rose-400" />
            <span>Special Permission Bits (4000 / 2000 / 1000)</span>
          </div>
          <span className="text-[10px] text-slate-500">Click to toggle</span>
        </div>

        <div className="grid grid-cols-3 gap-2 font-mono text-xs">
          {/* SUID */}
          <button
            onClick={() => toggleSpecial('suid')}
            className={`p-2 rounded-lg border text-left transition-all cursor-pointer active:scale-95 ${
              mode.special.suid
                ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">SUID</span>
              <span className="text-[10px] opacity-80">4000</span>
            </div>
            <div className="text-[10px] mt-0.5 opacity-70">
              {mode.special.suid ? 'Active (s)' : 'Disabled'}
            </div>
          </button>

          {/* SGID */}
          <button
            onClick={() => toggleSpecial('sgid')}
            className={`p-2 rounded-lg border text-left transition-all cursor-pointer active:scale-95 ${
              mode.special.sgid
                ? 'bg-orange-500/20 border-orange-400 text-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.3)]'
                : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">SGID</span>
              <span className="text-[10px] opacity-80">2000</span>
            </div>
            <div className="text-[10px] mt-0.5 opacity-70">
              {mode.special.sgid ? 'Active (s)' : 'Disabled'}
            </div>
          </button>

          {/* Sticky */}
          <button
            onClick={() => toggleSpecial('sticky')}
            className={`p-2 rounded-lg border text-left transition-all cursor-pointer active:scale-95 ${
              mode.special.sticky
                ? 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-300 shadow-[0_0_12px_rgba(217,70,239,0.3)]'
                : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold">Sticky</span>
              <span className="text-[10px] opacity-80">1000</span>
            </div>
            <div className="text-[10px] mt-0.5 opacity-70">
              {mode.special.sticky ? 'Active (t)' : 'Disabled'}
            </div>
          </button>
        </div>
      </div>

      {/* 4. Ownership Switcher (chown) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
          <UserIcon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="text-slate-500 shrink-0">Owner:</span>
          <select
            value={currentNode.ownerUid}
            onChange={(e) => updateNodeOwnership(currentPath, Number(e.target.value), currentNode.groupGid)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-sky-500"
          >
            {DEFAULT_USERS.map((u) => (
              <option key={u.uid} value={u.uid}>
                {u.username} (UID {u.uid})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
          <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="text-slate-500 shrink-0">Group:</span>
          <select
            value={currentNode.groupGid}
            onChange={(e) => updateNodeOwnership(currentPath, currentNode.ownerUid, Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {DEFAULT_GROUPS.map((g) => (
              <option key={g.gid} value={g.gid}>
                {g.groupname} (GID {g.gid})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 5. Live Generated Terminal Command */}
      <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-300 min-w-0">
          <Code className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-slate-500">$</span>
          <span className="text-emerald-300 font-semibold truncate">{chmodCommand}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => copyToClipboard(chmodCommand)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-slate-100 transition-colors cursor-pointer"
          >
            {copiedCmd === chmodCommand ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span className="text-[10px]">Copy chmod</span>
              </>
            )}
          </button>

          <button
            onClick={() => copyToClipboard(chownCommand)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-slate-100 transition-colors cursor-pointer"
          >
            {copiedCmd === chownCommand ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-slate-400" />
                <span className="text-[10px]">Copy chown</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
