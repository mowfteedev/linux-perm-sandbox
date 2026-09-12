/**
 * Domain Types for Linux Permissions, VFS, POSIX Kernel Evaluator, and Tracing
 */

export type FileType = 'file' | 'directory' | 'symlink';

export interface PermissionBits {
  read: boolean;
  write: boolean;
  execute: boolean;
}

export interface SpecialBits {
  suid: boolean;
  sgid: boolean;
  sticky: boolean;
}

export interface PosixMode {
  special: SpecialBits;
  user: PermissionBits;
  group: PermissionBits;
  other: PermissionBits;
}

export interface LinuxUser {
  uid: number;
  username: string;
  gid: number; // Primary group ID
  groups: number[]; // Supplementary group IDs
}

export interface LinuxGroup {
  gid: number;
  groupname: string;
}

export interface VFSNode {
  id: string;
  name: string;
  path: string;
  type: FileType;
  ownerUid: number;
  ownerUser: string;
  groupGid: number;
  groupName: string;
  mode: PosixMode;
  sizeBytes?: number;
  content?: string;
  target?: string; // For symlinks
  children?: string[]; // IDs of child nodes for directories
}

export type FileAccessOperation = 'read' | 'write' | 'execute' | 'delete' | 'traverse';

export type TraceStepStatus = 'GRANTED' | 'DENIED' | 'MATCHED' | 'SKIPPED' | 'INFO';

export interface TraceStep {
  stepId: string;
  stage: 'PATH_TRAVERSAL' | 'ROOT_BYPASS' | 'OWNER_MATCH' | 'GROUP_MATCH' | 'OTHER_MATCH' | 'STICKY_BIT' | 'SPECIAL_BITS';
  title: string;
  status: TraceStepStatus;
  detail: string;
  pathChecked?: string;
  testedBit?: string;
  codeSnippet?: string;
}

export interface PosixEvaluationResult {
  allowed: boolean;
  operation: FileAccessOperation;
  user: LinuxUser;
  targetNode: VFSNode;
  effectiveUid: number;
  effectiveGid: number;
  traces: TraceStep[];
  denialReason?: string;
}
