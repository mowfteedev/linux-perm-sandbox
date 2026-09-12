/**
 * Core domain types for POSIX file permissions, VFS and Sudoers
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
  target?: string; // For symlinks
  children?: string[]; // IDs of child nodes for directories
}
