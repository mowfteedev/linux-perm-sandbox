import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryVFS } from '../vfs/vfs';
import { DEFAULT_USERS } from '../vfs/default-fs';
import { evaluateAccess } from './evaluator';

describe('POSIX Permission Evaluator & Kernel Tracer', () => {
  let vfs: InMemoryVFS;

  const root = DEFAULT_USERS.find((u) => u.username === 'root')!;
  const mowftee = DEFAULT_USERS.find((u) => u.username === 'mowftee')!;
  const developer = DEFAULT_USERS.find((u) => u.username === 'developer')!;
  const guest = DEFAULT_USERS.find((u) => u.username === 'guest')!;

  beforeEach(() => {
    vfs = new InMemoryVFS();
  });

  describe('Path Traversal Checks', () => {
    it('blocks access if any ancestor directory lacks search (execute) bit', () => {
      // /home/mowftee has mode 0700 (rwx------)
      // developer attempts to access /home/mowftee/secret.txt
      const result = evaluateAccess(vfs, '/home/mowftee/secret.txt', 'read', developer);

      expect(result.allowed).toBe(false);
      expect(result.denialReason).toContain('Path traversal');
      // Traces must capture that /home/mowftee denied traversal
      const blockedTrace = result.traces.find(
        (t) => t.pathChecked === '/home/mowftee' && t.status === 'DENIED',
      );
      expect(blockedTrace).toBeDefined();
    });

    it('allows root to traverse directories even if execute bit is missing', () => {
      // Set /home to 0000
      vfs.chmod('/home', '0000');

      const result = evaluateAccess(vfs, '/home/mowftee/secret.txt', 'read', root);
      expect(result.allowed).toBe(true);
      const rootTrace = result.traces.find(
        (t) => t.pathChecked === '/home' && t.status === 'GRANTED',
      );
      expect(rootTrace?.detail).toContain('Root user');
    });

    it('enforces non-cumulative traversal when owner of directory has no x bit', () => {
      // If owner of /home/mowftee is mowftee, and mode is 0677 (rw-rwxrwx)
      // mowftee is owner: user has 'rw-', lacking 'x'!
      // Even though group and other have 'x', mowftee CANNOT traverse!
      vfs.chmod('/home/mowftee', '0677');

      const result = evaluateAccess(vfs, '/home/mowftee/secret.txt', 'read', mowftee);
      expect(result.allowed).toBe(false);
      const trace = result.traces.find((t) => t.pathChecked === '/home/mowftee');
      expect(trace?.status).toBe('DENIED');
      expect(trace?.detail).toContain('Non-cumulative');
    });
  });

  describe('Root Superuser (UID 0) Privileges', () => {
    it('allows root to read and write any file regardless of mode', () => {
      // /etc/shadow is 0640 (root:shadow)
      const readShadow = evaluateAccess(vfs, '/etc/shadow', 'read', root);
      expect(readShadow.allowed).toBe(true);

      // Create a 0000 file
      vfs.createNode('/tmp/zero.txt', 'file', root, { octalMode: '0000' });
      const writeZero = evaluateAccess(vfs, '/tmp/zero.txt', 'write', root);
      expect(writeZero.allowed).toBe(true);
    });

    it('restricts root from executing regular files if NO execute bit is set anywhere', () => {
      // File has mode 0644 (rw-r--r--) -> no 'x' anywhere
      const execPasswd = evaluateAccess(vfs, '/etc/passwd', 'execute', root);
      expect(execPasswd.allowed).toBe(false);
      expect(execPasswd.denialReason).toContain('File has no execute bits set anywhere');

      const trace = execPasswd.traces.find((t) => t.stepId === 'root-exec-fail');
      expect(trace).toBeDefined();
    });

    it('allows root to execute if at least one execute bit is set', () => {
      // /usr/bin/passwd has 4755
      const exec = evaluateAccess(vfs, '/usr/bin/passwd', 'execute', root);
      expect(exec.allowed).toBe(true);
    });
  });

  describe('Non-cumulative POSIX UGO Matching', () => {
    it('stops at owner match and does NOT fall back to group or other permissions', () => {
      // Mode 0077 (---rwxrwx): owner has 000, group and other have rwx
      vfs.createNode('/tmp/no_owner.txt', 'file', mowftee, { octalMode: '0077' });

      // mowftee is owner -> user bits are 000 -> DENIED
      const ownerAccess = evaluateAccess(vfs, '/tmp/no_owner.txt', 'read', mowftee);
      expect(ownerAccess.allowed).toBe(false);
      expect(ownerAccess.denialReason).toContain('Owner');

      // developer is NOT owner and NOT in mowftee group -> other bits are 777 -> GRANTED
      const otherAccess = evaluateAccess(vfs, '/tmp/no_owner.txt', 'read', developer);
      expect(otherAccess.allowed).toBe(true);
    });

    it('stops at group match and does NOT fall back to other permissions', () => {
      // Mode 0707 (rwx---rwx): owner rwx, group ---, other rwx
      // Group is 'devteam' (GID 1005). Developer belongs to 'devteam'.
      vfs.createNode('/tmp/no_group.txt', 'file', root, {
        octalMode: '0707',
        groupGid: 1005,
        groupName: 'devteam',
      });

      // developer is in devteam group -> group bits are 000 -> DENIED
      const devAccess = evaluateAccess(vfs, '/tmp/no_group.txt', 'read', developer);
      expect(devAccess.allowed).toBe(false);
      expect(devAccess.denialReason).toContain('Group');

      // guest is neither owner nor in devteam -> other bits are rwx -> GRANTED
      const guestAccess = evaluateAccess(vfs, '/tmp/no_group.txt', 'read', guest);
      expect(guestAccess.allowed).toBe(true);
    });
  });

  describe('Delete Operation & Sticky Bit (/tmp) Rules', () => {
    it('allows file owner to delete their file in sticky bit directory /tmp', () => {
      // /tmp/user_notes.txt is owned by mowftee
      const result = evaluateAccess(vfs, '/tmp/user_notes.txt', 'delete', mowftee);
      expect(result.allowed).toBe(true);
      const stickyTrace = result.traces.find((t) => t.stepId === 'sticky-bit-check');
      expect(stickyTrace?.status).toBe('GRANTED');
    });

    it('prevents another user from deleting a file in /tmp even if /tmp is 1777 (Sticky Bit protection)', () => {
      // /tmp/user_notes.txt is owned by mowftee
      // developer attempts to delete it
      const result = evaluateAccess(vfs, '/tmp/user_notes.txt', 'delete', developer);
      expect(result.allowed).toBe(false);
      expect(result.denialReason).toContain('Sticky bit protected');

      const stickyTrace = result.traces.find((t) => t.stepId === 'sticky-bit-check');
      expect(stickyTrace?.status).toBe('DENIED');
    });

    it('allows directory owner (root) to delete any file in /tmp', () => {
      // /tmp is owned by root
      const result = evaluateAccess(vfs, '/tmp/user_notes.txt', 'delete', root);
      expect(result.allowed).toBe(true);
    });
  });

  describe('SUID and SGID Process Elevation', () => {
    it('elevates Effective UID (EUID) to file owner on SUID execution', () => {
      // /usr/bin/passwd is owned by root (UID 0) with mode 4755 (SUID)
      // mowftee (UID 1000) executes it
      const result = evaluateAccess(vfs, '/usr/bin/passwd', 'execute', mowftee);

      expect(result.allowed).toBe(true);
      expect(result.effectiveUid).toBe(0); // Root!
      expect(result.effectiveGid).toBe(1000); // Keeps mowftee GID

      const suidTrace = result.traces.find((t) => t.stepId === 'suid-elevation');
      expect(suidTrace).toBeDefined();
      expect(suidTrace?.detail).toContain('elevates from 1000 (mowftee) to 0 (root)');
    });

    it('elevates Effective GID (EGID) to file group on SGID execution', () => {
      // /usr/bin/wall is owned by root:adm (GID 4) with mode 2755 (SGID)
      // guest (UID 1002, GID 1002) executes it
      const result = evaluateAccess(vfs, '/usr/bin/wall', 'execute', guest);

      expect(result.allowed).toBe(true);
      expect(result.effectiveUid).toBe(1002);
      expect(result.effectiveGid).toBe(4); // adm group!

      const sgidTrace = result.traces.find((t) => t.stepId === 'sgid-elevation');
      expect(sgidTrace).toBeDefined();
      expect(sgidTrace?.detail).toContain('elevates from 1002 (guest) to 4 (adm)');
    });

    it('retains caller UID/GID for normal non-special binaries', () => {
      // Create normal 0755 script
      vfs.createNode('/tmp/script.sh', 'file', root, { octalMode: '0755' });
      const result = evaluateAccess(vfs, '/tmp/script.sh', 'execute', guest);

      expect(result.allowed).toBe(true);
      expect(result.effectiveUid).toBe(guest.uid);
      expect(result.effectiveGid).toBe(guest.gid);
    });
  });
});
