import React from 'react';
import { 
  Terminal, 
  RotateCcw, 
  BookOpen, 
  User as UserIcon, 
  Eye, 
  Edit3, 
  Play, 
  Trash2 
} from 'lucide-react';
import { useSandbox } from '@/store';
import { FileAccessOperation } from '@/types';
import { DEFAULT_USERS } from '@/core/vfs/default-fs';

export function Header() {
  const { 
    currentUser, 
    setCurrentUserUid, 
    currentOp, 
    setCurrentOp, 
    resetAll, 
    setCheatsheetOpen 
  } = useSandbox();

  const operations: { id: FileAccessOperation; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'read', label: 'Read (r)', icon: <Eye className="w-3.5 h-3.5" />, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
    { id: 'write', label: 'Write (w)', icon: <Edit3 className="w-3.5 h-3.5" />, color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
    { id: 'execute', label: 'Exec (x)', icon: <Play className="w-3.5 h-3.5" />, color: 'text-sky-400 border-sky-500/40 bg-sky-500/10' },
    { id: 'delete', label: 'Delete (rm)', icon: <Trash2 className="w-3.5 h-3.5" />, color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' },
  ];

  return (
    <header className="h-16 border-b border-slate-800 bg-[#0c1222]/95 backdrop-blur px-4 md:px-6 flex items-center justify-between shrink-0 gap-4">
      {/* 1. Brand Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-sky-500/15 border border-sky-500/35 flex items-center justify-center text-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.25)]">
          <Terminal className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm md:text-base tracking-wide text-slate-100 font-mono">
              linux-perm-sandbox
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
              Live POSIX
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden md:block">
            Mô phỏng phân quyền Linux POSIX & Thẩm định Sudoers Client-side
          </p>
        </div>
      </div>

      {/* 2. Center: Active Identity & Operation Switcher */}
      <div className="flex items-center gap-3 overflow-x-auto py-1">
        {/* User Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1 shrink-0">
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 px-2">
            <UserIcon className="w-3 h-3 text-sky-400" />
            <span className="hidden lg:inline">User:</span>
          </div>
          {DEFAULT_USERS.map((user) => {
            const isActive = currentUser.uid === user.uid;
            return (
              <button
                key={user.uid}
                onClick={() => setCurrentUserUid(user.uid)}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-all duration-150 active:scale-95 cursor-pointer ${
                  isActive
                    ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-400/50 shadow-[0_0_8px_rgba(56,189,248,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {user.username}
                <span className="text-[10px] opacity-60 ml-1">({user.uid})</span>
              </button>
            );
          })}
        </div>

        {/* Operation Switcher */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 shrink-0">
          <span className="text-[11px] font-mono text-slate-400 px-2 hidden lg:inline">Op:</span>
          {operations.map((op) => {
            const isActive = currentOp === op.id;
            return (
              <button
                key={op.id}
                onClick={() => setCurrentOp(op.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all duration-150 active:scale-95 cursor-pointer ${
                  isActive
                    ? `${op.color} border font-bold shadow-sm`
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {op.icon}
                <span>{op.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Action Utilities: Cheatsheet & Reset */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setCheatsheetOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono hover:bg-slate-800/80 hover:text-sky-300 hover:border-sky-500/40 transition-all cursor-pointer"
          title="Xem tài liệu tra cứu phân quyền Linux"
        >
          <BookOpen className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Cheatsheet</span>
        </button>

        <button
          onClick={resetAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono hover:bg-rose-500/15 hover:text-rose-300 hover:border-rose-500/40 transition-all cursor-pointer"
          title="Khôi phục trạng thái File System ban đầu"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
    </header>
  );
}
