import { describe, it, expect } from 'vitest';
import { parseSudoers } from './parser';
import { analyzeSudoers, GTFOBINS_DATABASE } from './analyzer';
import { InMemoryVFS } from '../vfs/vfs';
import { evaluateAccess } from '../posix/evaluator';
import { LinuxUser } from '@/types';

describe('Security Audit & Privilege Escalation Tests (@security)', () => {
  describe('1. GTFOBins Privilege Escalation Detection', () => {
    it('detects multiple GTFOBins binaries in sudoers rules', () => {
      const sudoers = `
root ALL=(ALL:ALL) ALL
dev ALL=(ALL) /usr/bin/vim, /usr/bin/find, /usr/bin/python3, /usr/bin/git, /usr/bin/nmap
`;
      const ast = parseSudoers(sudoers);
      const analysis = analyzeSudoers(ast);

      // 1 root ALL warning + 5 GTFOBin warnings = 6 total warnings
      expect(analysis.warnings.length).toBe(6);
      const binaries = analysis.warnings.map((w) => w.command);
      expect(binaries).toContain('ALL');
      expect(binaries).toContain('/usr/bin/vim');
      expect(binaries).toContain('/usr/bin/find');
      expect(binaries).toContain('/usr/bin/python3');
      expect(binaries).toContain('/usr/bin/git');
      expect(binaries).toContain('/usr/bin/nmap');
    });

    it('marks NOPASSWD GTFOBin as CRITICAL risk', () => {
      const sudoers = `
alice ALL=(ALL) NOPASSWD: /usr/bin/vim
bob ALL=(ALL) /usr/bin/vim
`;
      const ast = parseSudoers(sudoers);
      const analysis = analyzeSudoers(ast);

      const aliceWarn = analysis.warnings.find((w) => w.user.includes('alice'));
      const bobWarn = analysis.warnings.find((w) => w.user.includes('bob'));

      expect(aliceWarn?.severity).toBe('CRITICAL');
      expect(bobWarn?.severity).toBe('HIGH');
    });

    it('flags NOPASSWD: ALL as CRITICAL root privilege', () => {
      const sudoers = `
mowftee ALL=(ALL) NOPASSWD: ALL
`;
      const ast = parseSudoers(sudoers);
      const analysis = analyzeSudoers(ast);

      const critical = analysis.warnings.find((w) => w.command === 'ALL');
      expect(critical).toBeDefined();
      expect(critical?.severity).toBe('CRITICAL');
    });

    it('contains comprehensive GTFOBin metadata with documentation URLs', () => {
      for (const [name, info] of Object.entries(GTFOBINS_DATABASE)) {
        expect(info.binary).toBe(name);
        expect(info.url).toContain('https://gtfobins.github.io/gtfobins/');
        expect(info.description.length).toBeGreaterThan(10);
        expect(info.functions.length).toBeGreaterThan(0);
      }
    });
  });

  describe('2. Sudoers Rule Clash & Accidental Bypass Detection', () => {
    it('detects when an accidental bypass overrides a security restriction', () => {
      const sudoers = `
# Line 2 intends to forbid /bin/su
operator ALL=(ALL) ALL, !/bin/su
# Line 4 accidentally re-enables /bin/su (Last-match-wins)
operator ALL=(ALL) /bin/su
`;
      const ast = parseSudoers(sudoers);
      const analysis = analyzeSudoers(ast);

      expect(analysis.clashes.length).toBeGreaterThan(0);
      const bypassClash = analysis.clashes.find((c) =>
        c.reason.includes('completely overridden and bypassed')
      );
      expect(bypassClash).toBeDefined();
      expect(bypassClash?.shadowedRuleLine).toBe(3);
      expect(bypassClash?.winningRuleLine).toBe(5);
    });

    it('detects when a late negation overrides an earlier permission', () => {
      const sudoers = `
mowftee ALL=(ALL) /bin/su
mowftee ALL=(ALL) !/bin/su
`;
      const ast = parseSudoers(sudoers);
      const analysis = analyzeSudoers(ast);

      expect(analysis.clashes.length).toBe(1);
      expect(analysis.clashes[0]?.reason).toContain('explicitly revokes permissions');
    });
  });

  describe('3. POSIX Path Traversal Security Verification', () => {
    it('blocks access to a 0777 file if an ancestor directory lacks execute search permission', () => {
      const vfs = new InMemoryVFS();
      const owner: LinuxUser = { uid: 1000, username: 'mowftee', gid: 1000, groups: [1000] };
      const attacker: LinuxUser = { uid: 1002, username: 'guest', gid: 1002, groups: [1002] };

      // Ensure /home/mowftee has 0755 so guest can traverse /home/mowftee
      vfs.chmod('/home/mowftee', '0755');

      // Create /home/mowftee/private (mode 0700) and /home/mowftee/private/secret.txt (mode 0777)
      vfs.createNode('/home/mowftee/private', 'directory', owner, { octalMode: '0700' });
      vfs.createNode('/home/mowftee/private/secret.txt', 'file', owner, {
        octalMode: '0777',
        content: 'TOP_SECRET_DATA',
      });

      // Attacker tries to read secret.txt
      const result = evaluateAccess(vfs, '/home/mowftee/private/secret.txt', 'read', attacker);
      expect(result.allowed).toBe(false);
      expect(result.denialReason).toContain('Path traversal search bit missing');

      // Traversal traces indicate /home/mowftee/private blocked access
      const blockedTrace = result.traces.find((t) => t.status === 'DENIED');
      expect(blockedTrace?.pathChecked).toBe('/home/mowftee/private');
    });
  });

  describe('4. Sticky Bit Deletion Protection Verification', () => {
    it('prevents non-owner users from deleting files in a Sticky Bit directory (/tmp)', () => {
      const vfs = new InMemoryVFS();
      const alice: LinuxUser = { uid: 1000, username: 'alice', gid: 1000, groups: [1000] };
      const bob: LinuxUser = { uid: 1002, username: 'bob', gid: 1002, groups: [1002] };

      // In /tmp (mode 1777), create alice_file.txt owned by alice
      vfs.createNode('/tmp/alice_file.txt', 'file', alice, { octalMode: '0666' });

      // Bob tries to delete alice's file in /tmp
      const bobDelete = evaluateAccess(vfs, '/tmp/alice_file.txt', 'delete', bob);
      expect(bobDelete.allowed).toBe(false);
      expect(bobDelete.denialReason).toContain('Sticky bit protected');

      // Alice tries to delete her own file in /tmp
      const aliceDelete = evaluateAccess(vfs, '/tmp/alice_file.txt', 'delete', alice);
      expect(aliceDelete.allowed).toBe(true);

      // Root (UID 0) can delete any file in /tmp
      const root: LinuxUser = { uid: 0, username: 'root', gid: 0, groups: [0] };
      const rootDelete = evaluateAccess(vfs, '/tmp/alice_file.txt', 'delete', root);
      expect(rootDelete.allowed).toBe(true);
    });
  });

  describe('5. SUID / SGID Security Verification', () => {
    it('elevates effective UID to file owner upon execution', () => {
      const vfs = new InMemoryVFS();
      const guest: LinuxUser = { uid: 1002, username: 'guest', gid: 1002, groups: [1002] };

      // /usr/bin/passwd is owned by root (UID 0) with mode 4755 (SUID)
      const res = evaluateAccess(vfs, '/usr/bin/passwd', 'execute', guest);
      expect(res.allowed).toBe(true);
      expect(res.effectiveUid).toBe(0); // Elevated to root
      expect(res.user.uid).toBe(1002); // Real UID remains guest

      const suidTrace = res.traces.find((t) => t.stepId === 'suid-elevation');
      expect(suidTrace).toBeDefined();
      expect(suidTrace?.detail).toContain('Process Effective UID (EUID) elevates');
    });

    it('denies root execution on a file with no execute bits set anywhere', () => {
      const vfs = new InMemoryVFS();
      const root: LinuxUser = { uid: 0, username: 'root', gid: 0, groups: [0] };

      // /etc/shadow has mode 0640 (no 'x' bit anywhere)
      const res = evaluateAccess(vfs, '/etc/shadow', 'execute', root);
      expect(res.allowed).toBe(false);
      expect(res.denialReason).toContain('has no execute bits set anywhere');
    });
  });
});
