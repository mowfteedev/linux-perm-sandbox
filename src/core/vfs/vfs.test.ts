import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryVFS, normalizePath, getParentPath } from './vfs';
import { DEFAULT_USERS } from './default-fs';

describe('In-Memory Virtual File System (VFS)', () => {
  let vfs: InMemoryVFS;
  const userMowftee = DEFAULT_USERS.find((u) => u.username === 'mowftee')!;
  const userDev = DEFAULT_USERS.find((u) => u.username === 'developer')!;

  beforeEach(() => {
    vfs = new InMemoryVFS();
  });

  it('normalizes Linux paths correctly', () => {
    expect(normalizePath('//home//mowftee/')).toBe('/home/mowftee');
    expect(normalizePath('/home/mowftee/../developer')).toBe('/home/developer');
    expect(normalizePath('/home/./mowftee/./secret.txt')).toBe('/home/mowftee/secret.txt');
    expect(normalizePath('/')).toBe('/');
    expect(getParentPath('/home/mowftee/secret.txt')).toBe('/home/mowftee');
    expect(getParentPath('/home')).toBe('/');
    expect(getParentPath('/')).toBe('/');
  });

  it('loads default Linux files and directories properly', () => {
    const root = vfs.getNode('/');
    expect(root).not.toBeNull();
    expect(root?.type).toBe('directory');

    const passwd = vfs.getNode('/etc/passwd');
    expect(passwd).not.toBeNull();
    expect(passwd?.ownerUser).toBe('root');

    const tmp = vfs.getNode('/tmp');
    expect(tmp?.mode.special.sticky).toBe(true);

    const suidBinary = vfs.getNode('/usr/bin/passwd');
    expect(suidBinary?.mode.special.suid).toBe(true);
  });

  it('resolves ancestors from / to immediate parent', () => {
    const ancestors = vfs.getAncestors('/home/mowftee/secret.txt');
    const paths = ancestors.map((a) => a.path);
    expect(paths).toEqual(['/', '/home', '/home/mowftee']);
  });

  it('creates and deletes files/directories', () => {
    const newFile = vfs.createNode('/home/mowftee/newfile.txt', 'file', userMowftee, {
      content: 'hello world',
      octalMode: '0644',
    });

    expect(newFile.path).toBe('/home/mowftee/newfile.txt');
    expect(vfs.getNode('/home/mowftee/newfile.txt')).not.toBeNull();

    // Check parent's children
    const parentChildren = vfs.getChildren('/home/mowftee');
    expect(parentChildren.some((c) => c.path === '/home/mowftee/newfile.txt')).toBe(true);

    // Delete
    const deleted = vfs.deleteNode('/home/mowftee/newfile.txt');
    expect(deleted).toBe(true);
    expect(vfs.getNode('/home/mowftee/newfile.txt')).toBeNull();
  });

  it('inherits GID and SGID bit when created inside SGID directory', () => {
    // /tmp/shared_project has SGID set with group 'devteam' (GID 1005)
    const sharedDir = vfs.getNode('/tmp/shared_project');
    expect(sharedDir?.mode.special.sgid).toBe(true);
    expect(sharedDir?.groupGid).toBe(1005);

    // mowftee (primary GID 1000) creates a file in shared_project
    const fileInSgid = vfs.createNode('/tmp/shared_project/file.txt', 'file', userMowftee);
    // Should inherit devteam GID (1005) instead of mowftee GID (1000)
    expect(fileInSgid.groupGid).toBe(1005);
    expect(fileInSgid.groupName).toBe('devteam');

    // mowftee creates a directory in shared_project
    const subDirInSgid = vfs.createNode('/tmp/shared_project/subfolder', 'directory', userMowftee);
    // Should inherit devteam GID AND SGID bit!
    expect(subDirInSgid.groupGid).toBe(1005);
    expect(subDirInSgid.mode.special.sgid).toBe(true);
  });

  it('updates permissions via chmod and ownership via chown', () => {
    vfs.chmod('/home/mowftee/secret.txt', '0644');
    const updated = vfs.getNode('/home/mowftee/secret.txt');
    expect(updated?.mode.other.read).toBe(true);

    vfs.chown('/home/mowftee/secret.txt', userDev.uid, userDev.gid);
    const chowned = vfs.getNode('/home/mowftee/secret.txt');
    expect(chowned?.ownerUid).toBe(userDev.uid);
    expect(chowned?.groupGid).toBe(userDev.gid);
  });
});
