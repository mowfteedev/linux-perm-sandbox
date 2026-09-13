import { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';
import { 
  FileAccessOperation, 
  LinuxUser, 
  PosixEvaluationResult, 
  PosixMode, 
  SudoersAnalysisResult, 
  VFSNode 
} from '@/types';
import { InMemoryVFS } from '@/core/vfs/vfs';
import { DEFAULT_USERS } from '@/core/vfs/default-fs';
import { evaluateAccess } from '@/core/posix/evaluator';
import { parseSudoers } from '@/core/sudoers/parser';
import { analyzeSudoers } from '@/core/sudoers/analyzer';
import { DEFAULT_SUDOERS_CONTENT } from '@/core/sudoers/default-sudoers';
import { octalToMode } from '@/core/posix/mode';

export interface SandboxStore {
  // VFS & Current Selection State
  vfs: InMemoryVFS;
  currentPath: string;
  currentNode: VFSNode | null;
  selectPath: (path: string) => void;
  
  // User & Operation State
  currentUser: LinuxUser;
  setCurrentUserUid: (uid: number) => void;
  currentOp: FileAccessOperation;
  setCurrentOp: (op: FileAccessOperation) => void;

  // POSIX Mode Mutation
  updateNodeMode: (path: string, mode: PosixMode) => void;
  updateNodeOctal: (path: string, octal: string) => void;
  updateNodeOwnership: (path: string, uid: number, gid?: number) => void;

  // Evaluation Traces
  evaluation: PosixEvaluationResult;

  // Sudoers State
  sudoersContent: string;
  setSudoersContent: (text: string) => void;
  sudoersAnalysis: SudoersAnalysisResult;

  // Global Actions
  resetAll: () => void;
  cheatsheetOpen: boolean;
  setCheatsheetOpen: (open: boolean) => void;
}

const SandboxContext = createContext<SandboxStore | null>(null);

const FALLBACK_USER: LinuxUser = DEFAULT_USERS[1] ?? {
  uid: 1000,
  username: 'mowftee',
  gid: 1000,
  groups: [1000, 4, 27],
};

export function SandboxProvider({ children }: { children: ReactNode }) {
  // 1. Core VFS instance state
  const [vfs, setVfs] = useState(() => new InMemoryVFS());
  const [vfsVersion, setVfsVersion] = useState(0);

  // 2. Selection state
  const [currentPath, setCurrentPath] = useState<string>('/home/mowftee/secret.txt');

  // 3. Current active Linux test user (default: mowftee - UID 1000)
  const [currentUserUid, setCurrentUserUidState] = useState<number>(1000);

  // 4. Current tested operation (default: read)
  const [currentOp, setCurrentOp] = useState<FileAccessOperation>('read');

  // 5. Sudoers file text state
  const [sudoersContent, setSudoersContent] = useState<string>(DEFAULT_SUDOERS_CONTENT);

  // 6. Cheatsheet modal state
  const [cheatsheetOpen, setCheatsheetOpen] = useState<boolean>(false);

  // Derive active user
  const currentUser = useMemo<LinuxUser>(() => {
    return vfs.users.find((u) => u.uid === currentUserUid) ?? FALLBACK_USER;
  }, [vfs.users, currentUserUid]);

  // Derive current node
  const currentNode = useMemo(() => {
    void vfsVersion;
    return vfs.getNode(currentPath);
  }, [vfs, currentPath, vfsVersion]);

  // Derive POSIX Evaluation Result
  const evaluation = useMemo(() => {
    void vfsVersion;
    return evaluateAccess(vfs, currentPath, currentOp, currentUser);
  }, [vfs, currentPath, currentOp, currentUser, vfsVersion]);

  // Derive Sudoers AST and Analysis
  const sudoersAnalysis = useMemo(() => {
    const ast = parseSudoers(sudoersContent);
    return analyzeSudoers(ast);
  }, [sudoersContent]);

  // Handlers
  const selectPath = useCallback((path: string) => {
    setCurrentPath(path);
  }, []);

  const setCurrentUserUid = useCallback((uid: number) => {
    setCurrentUserUidState(uid);
  }, []);

  const updateNodeMode = useCallback((path: string, mode: PosixMode) => {
    vfs.chmod(path, mode);
    setVfsVersion((v) => v + 1);
  }, [vfs]);

  const updateNodeOctal = useCallback((path: string, octal: string) => {
    vfs.chmod(path, octalToMode(octal));
    setVfsVersion((v) => v + 1);
  }, [vfs]);

  const updateNodeOwnership = useCallback((path: string, uid: number, gid?: number) => {
    vfs.chown(path, uid, gid);
    setVfsVersion((v) => v + 1);
  }, [vfs]);

  const resetAll = useCallback(() => {
    const newVfs = new InMemoryVFS();
    setVfs(newVfs);
    setCurrentPath('/home/mowftee/secret.txt');
    setCurrentUserUidState(1000);
    setCurrentOp('read');
    setSudoersContent(DEFAULT_SUDOERS_CONTENT);
    setVfsVersion((v) => v + 1);
  }, []);

  const value = useMemo<SandboxStore>(() => ({
    vfs,
    currentPath,
    currentNode,
    selectPath,
    currentUser,
    setCurrentUserUid,
    currentOp,
    setCurrentOp,
    updateNodeMode,
    updateNodeOctal,
    updateNodeOwnership,
    evaluation,
    sudoersContent,
    setSudoersContent,
    sudoersAnalysis,
    resetAll,
    cheatsheetOpen,
    setCheatsheetOpen,
  }), [
    vfs,
    currentPath,
    currentNode,
    selectPath,
    currentUser,
    setCurrentUserUid,
    currentOp,
    updateNodeMode,
    updateNodeOctal,
    updateNodeOwnership,
    evaluation,
    sudoersContent,
    sudoersAnalysis,
    resetAll,
    cheatsheetOpen,
  ]);

  return (
    <SandboxContext.Provider value={value}>
      {children}
    </SandboxContext.Provider>
  );
}

export function useSandbox(): SandboxStore {
  const context = useContext(SandboxContext);
  if (!context) {
    throw new Error('useSandbox must be used within a SandboxProvider');
  }
  return context;
}
