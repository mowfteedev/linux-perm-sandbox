import { FileType, LinuxUser, PosixMode, VFSNode } from '@/types';
import { createInitialFileSystem, DEFAULT_GROUPS, DEFAULT_USERS } from './default-fs';
import { createDefaultMode, octalToMode } from '../posix/mode';

/**
 * Cleanly normalizes Linux absolute paths
 * Example: "//home/mowftee/./dir/../file.txt" -> "/home/mowftee/file.txt"
 */
export function normalizePath(rawPath: string): string {
  if (!rawPath || rawPath === '/') return '/';

  const parts = rawPath.split('/').filter(Boolean);
  const stack: string[] = [];

  for (const part of parts) {
    if (part === '.') continue;
    if (part === '..') {
      if (stack.length > 0) stack.pop();
    } else {
      stack.push(part);
    }
  }

  return '/' + stack.join('/');
}

/**
 * Returns parent directory path
 */
export function getParentPath(path: string): string {
  const normalized = normalizePath(path);
  if (normalized === '/') return '/';
  const lastSlash = normalized.lastIndexOf('/');
  return lastSlash === 0 ? '/' : normalized.substring(0, lastSlash);
}

/**
 * In-Memory Virtual File System
 * Models Linux inodes, directory hierarchies, permissions, and special bit behaviors
 */
export class InMemoryVFS {
  private nodes: Map<string, VFSNode>;
  public users: LinuxUser[];

  constructor(initialNodes?: Map<string, VFSNode>, users?: LinuxUser[]) {
    this.nodes = initialNodes ? new Map(initialNodes) : createInitialFileSystem();
    this.users = users ?? [...DEFAULT_USERS];
  }

  public reset(): void {
    this.nodes = createInitialFileSystem();
    this.users = [...DEFAULT_USERS];
  }

  public getNode(path: string): VFSNode | null {
    const normalized = normalizePath(path);
    return this.nodes.get(normalized) ?? null;
  }

  public getAllNodes(): VFSNode[] {
    return Array.from(this.nodes.values());
  }

  public getChildren(path: string): VFSNode[] {
    const node = this.getNode(path);
    if (!node || node.type !== 'directory' || !node.children) {
      return [];
    }
    return node.children.map((childPath) => this.nodes.get(childPath)).filter((n): n is VFSNode => Boolean(n));
  }

  /**
   * Returns all ancestor directory nodes from '/' up to immediate parent
   */
  public getAncestors(path: string): VFSNode[] {
    const normalized = normalizePath(path);
    if (normalized === '/') return [];

    const ancestors: VFSNode[] = [];
    const parts = normalized.split('/').filter(Boolean);

    let current = '';
    // Process root
    const rootNode = this.nodes.get('/');
    if (rootNode) ancestors.push(rootNode);

    // Stop before the leaf node
    for (let i = 0; i < parts.length - 1; i++) {
      current += '/' + parts[i];
      const node = this.nodes.get(current);
      if (node) {
        ancestors.push(node);
      }
    }

    return ancestors;
  }

  /**
   * Creates a new file or directory respecting SGID inheritance rules
   */
  public createNode(
    path: string,
    type: FileType,
    user: LinuxUser,
    options: {
      octalMode?: string;
      content?: string;
      groupGid?: number;
      groupName?: string;
    } = {},
  ): VFSNode {
    const normalized = normalizePath(path);
    if (this.nodes.has(normalized)) {
      throw new Error(`EEXIST: File or directory already exists at ${normalized}`);
    }

    const parentPath = getParentPath(normalized);
    const parentNode = this.nodes.get(parentPath);
    if (!parentNode || parentNode.type !== 'directory') {
      throw new Error(`ENOENT: Parent directory ${parentPath} does not exist`);
    }

    const name = normalized.substring(normalized.lastIndexOf('/') + 1);

    // Determine group ownership based on Linux SGID inheritance rules
    let nodeGid = options.groupGid ?? user.gid;
    let nodeGroupName = options.groupName ?? user.username;

    let initialMode: PosixMode = options.octalMode
      ? octalToMode(options.octalMode)
      : createDefaultMode(type);

    if (parentNode.mode.special.sgid) {
      // In Linux, SGID on parent directory causes new files/folders to inherit parent GID
      nodeGid = parentNode.groupGid;
      nodeGroupName = parentNode.groupName;

      // If creating a directory inside an SGID directory, the new directory also inherits SGID!
      if (type === 'directory') {
        initialMode = {
          ...initialMode,
          special: {
            ...initialMode.special,
            sgid: true,
          },
        };
      }
    }

    const newNode: VFSNode = {
      id: normalized,
      name,
      path: normalized,
      type,
      ownerUid: user.uid,
      ownerUser: user.username,
      groupGid: nodeGid,
      groupName: nodeGroupName,
      mode: initialMode,
      content: options.content ?? (type === 'file' ? '' : undefined),
      children: type === 'directory' ? [] : undefined,
    };

    this.nodes.set(normalized, newNode);

    if (parentNode.children && !parentNode.children.includes(normalized)) {
      parentNode.children.push(normalized);
    }

    return newNode;
  }

  /**
   * Modifies permissions of a node
   */
  public chmod(path: string, mode: PosixMode | number | string): VFSNode {
    const node = this.getNode(path);
    if (!node) {
      throw new Error(`ENOENT: No such file or directory: ${path}`);
    }

    const newMode = typeof mode === 'object' ? mode : octalToMode(mode);
    node.mode = newMode;
    return node;
  }

  /**
   * Modifies ownership (chown)
   */
  public chown(
    path: string,
    uid: number,
    gid?: number,
    username?: string,
    groupname?: string,
  ): VFSNode {
    const node = this.getNode(path);
    if (!node) {
      throw new Error(`ENOENT: No such file or directory: ${path}`);
    }

    const targetUser = this.users.find((u) => u.uid === uid);
    node.ownerUid = uid;
    node.ownerUser = username ?? targetUser?.username ?? `uid-${uid}`;

    if (gid !== undefined) {
      const targetGroup = DEFAULT_GROUPS.find((g) => g.gid === gid);
      node.groupGid = gid;
      node.groupName = groupname ?? targetGroup?.groupname ?? `gid-${gid}`;
    }

    return node;
  }

  /**
   * Deletes a node from the virtual file system
   */
  public deleteNode(path: string): boolean {
    const normalized = normalizePath(path);
    if (normalized === '/') {
      throw new Error('EPERM: Cannot delete root directory /');
    }

    const node = this.nodes.get(normalized);
    if (!node) return false;

    // Recursively delete children if directory
    if (node.children && node.children.length > 0) {
      for (const childPath of [...node.children]) {
        this.deleteNode(childPath);
      }
    }

    // Remove from parent's children list
    const parentPath = getParentPath(normalized);
    const parentNode = this.nodes.get(parentPath);
    if (parentNode && parentNode.children) {
      parentNode.children = parentNode.children.filter((c) => c !== normalized);
    }

    return this.nodes.delete(normalized);
  }
}
