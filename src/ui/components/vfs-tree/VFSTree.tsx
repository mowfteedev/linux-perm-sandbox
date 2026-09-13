import { useState, useMemo } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  ShieldAlert, 
  Search,
  HardDrive
} from 'lucide-react';
import { useSandbox } from '@/store';
import { VFSNode } from '@/types';
import { modeToOctal } from '@/core/posix/mode';

interface TreeNodeProps {
  path: string;
  depth: number;
  expandedMap: Record<string, boolean>;
  toggleExpand: (path: string) => void;
  onSelect: (path: string) => void;
  selectedPath: string;
  getNode: (path: string) => VFSNode | null;
  getChildren: (path: string) => VFSNode[];
}

function TreeNode({
  path,
  depth,
  expandedMap,
  toggleExpand,
  onSelect,
  selectedPath,
  getNode,
  getChildren,
}: TreeNodeProps) {
  const node = getNode(path);
  if (!node) return null;

  const isDirectory = node.type === 'directory';
  const isExpanded = isDirectory ? (expandedMap[path] ?? true) : false;
  const isSelected = selectedPath === path;
  const children = isDirectory ? getChildren(path) : [];

  const octal = modeToOctal(node.mode);
  const isSuid = node.mode.special.suid;
  const isSgid = node.mode.special.sgid;
  const isSticky = node.mode.special.sticky;

  return (
    <div>
      <div
        onClick={() => onSelect(path)}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        className={`group flex items-center justify-between py-1.5 pr-2 rounded-lg cursor-pointer transition-all duration-150 font-mono text-xs select-none ${
          isSelected
            ? 'bg-sky-500/15 border border-sky-400/40 text-sky-200 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
            : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100 border border-transparent'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {/* Directory Expander */}
          {isDirectory ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(path);
              }}
              className="p-0.5 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-700/50"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          ) : (
            <span className="w-4" />
          )}

          {/* Node Icon */}
          <div className="shrink-0">
            {isDirectory ? (
              isExpanded ? (
                <FolderOpen className="w-3.5 h-3.5 text-sky-400" />
              ) : (
                <Folder className="w-3.5 h-3.5 text-sky-400" />
              )
            ) : isSuid ? (
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            ) : (
              <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200" />
            )}
          </div>

          {/* Node Name */}
          <span className="truncate font-medium">{node.name === '/' ? '/' : node.name}</span>

          {/* Special Bit Badges */}
          {isSuid && (
            <span className="text-[9px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold shrink-0">
              SUID
            </span>
          )}
          {isSgid && (
            <span className="text-[9px] px-1 py-0.2 rounded bg-orange-500/20 text-orange-300 border border-orange-500/40 font-bold shrink-0">
              SGID
            </span>
          )}
          {isSticky && (
            <span className="text-[9px] px-1 py-0.2 rounded bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 font-bold shrink-0">
              STICKY
            </span>
          )}
        </div>

        {/* Mode & Ownership pill */}
        <div className="flex items-center gap-1.5 shrink-0 text-[10px] text-slate-400">
          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400/90 font-semibold">
            {octal}
          </span>
        </div>
      </div>

      {/* Children list */}
      {isDirectory && isExpanded && children.length > 0 && (
        <div className="relative">
          {/* Hierarchy Guide Line */}
          <div 
            className="absolute top-0 bottom-0 border-l border-slate-800" 
            style={{ left: `${depth * 14 + 14}px` }} 
          />
          {children.map((child) => (
            <TreeNode
              key={child.path}
              path={child.path}
              depth={depth + 1}
              expandedMap={expandedMap}
              toggleExpand={toggleExpand}
              onSelect={onSelect}
              selectedPath={selectedPath}
              getNode={getNode}
              getChildren={getChildren}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function VFSTree() {
  const { vfs, currentPath, selectPath } = useSandbox();
  const [search, setSearch] = useState('');
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({
    '/': true,
    '/etc': true,
    '/home': true,
    '/home/mowftee': true,
    '/home/developer': true,
    '/tmp': true,
    '/usr': true,
    '/usr/bin': true,
    '/var': true,
    '/var/log': true,
  });

  const toggleExpand = (path: string) => {
    setExpandedMap((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  // Filtered search results if search string exists
  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase().trim();
    return vfs.getAllNodes().filter((n) => n.path.toLowerCase().includes(q));
  }, [vfs, search]);

  return (
    <div className="h-full flex flex-col bg-[#0c1222] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Explorer Header */}
      <div className="p-3 border-b border-slate-800/90 bg-[#0c1222] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-sky-400" />
          <h2 className="font-mono font-bold text-xs text-slate-200 uppercase tracking-wider">
            VFS Explorer
          </h2>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
          In-Memory Inodes
        </span>
      </div>

      {/* Search Input */}
      <div className="p-2 border-b border-slate-800/60 bg-slate-950/40 shrink-0">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm đường dẫn (vd: /etc/shadow, /tmp)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs font-mono bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-400/30"
          />
        </div>
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {searchResults ? (
          <div className="space-y-1">
            <div className="text-[10px] font-mono text-slate-500 px-2 py-1">
              Kết quả tìm kiếm ({searchResults.length} file/thư mục):
            </div>
            {searchResults.map((node) => (
              <div
                key={node.path}
                onClick={() => selectPath(node.path)}
                className={`p-2 rounded-lg cursor-pointer font-mono text-xs flex items-center justify-between transition-colors ${
                  currentPath === node.path
                    ? 'bg-sky-500/20 border border-sky-400/40 text-sky-200'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="truncate">{node.path}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-emerald-400 shrink-0">
                  {modeToOctal(node.mode)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <TreeNode
            path="/"
            depth={0}
            expandedMap={expandedMap}
            toggleExpand={toggleExpand}
            onSelect={selectPath}
            selectedPath={currentPath}
            getNode={(p) => vfs.getNode(p)}
            getChildren={(p) => vfs.getChildren(p)}
          />
        )}
      </div>

      {/* Quick Stats Footer */}
      <div className="p-2.5 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0">
        <span className="truncate">Total nodes: {vfs.getAllNodes().length}</span>
        <button
          onClick={() => setExpandedMap((prev) => {
            const allExpanded = Object.values(prev).every(Boolean);
            const next: Record<string, boolean> = {};
            vfs.getAllNodes().filter((n) => n.type === 'directory').forEach((n) => {
              next[n.path] = !allExpanded;
            });
            return next;
          })}
          className="text-sky-400 hover:text-sky-300 text-[10px] underline cursor-pointer"
        >
          Toggle All
        </button>
      </div>
    </div>
  );
}
