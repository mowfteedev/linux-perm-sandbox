import { describe, expect, it } from 'vitest';
import { LinuxGroup, LinuxUser } from '@/types';
import { analyzeSudoers } from './analyzer';
import { DEFAULT_SUDOERS_CONTENT, SUDOERS_PRESET_MISCONFIGURED } from './default-sudoers';
import { tokenizeSudoers } from './lexer';
import { evaluateSudoers } from './matcher';
import { parseSudoers } from './parser';

const TEST_USERS = {
  root: { uid: 0, username: 'root', gid: 0, groups: [0] },
  mowftee: { uid: 1000, username: 'mowftee', gid: 1000, groups: [1000, 4, 27] }, // in %sudo (27)
  developer: { uid: 1001, username: 'developer', gid: 1001, groups: [1001, 1005] }, // in %devteam (1005)
  guest: { uid: 1002, username: 'guest', gid: 1002, groups: [1002] },
} as const satisfies Record<string, LinuxUser>;

const TEST_GROUPS: LinuxGroup[] = [
  { gid: 0, groupname: 'root' },
  { gid: 4, groupname: 'adm' },
  { gid: 27, groupname: 'sudo' },
  { gid: 1000, groupname: 'mowftee' },
  { gid: 1001, groupname: 'developer' },
  { gid: 1005, groupname: 'devteam' },
  { gid: 1002, groupname: 'guest' },
];

describe('Sudoers Lexer', () => {
  it('tokenizes comments, keywords, tags, punctuation, and paths', () => {
    const input = `# Comment\nDefaults env_reset\nmowftee ALL=(ALL) NOPASSWD: /bin/cat\n`;
    const tokens = tokenizeSudoers(input);

    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens.some((t) => t.type === 'COMMENT')).toBe(true);
    expect(tokens.some((t) => t.type === 'DEFAULTS_KW')).toBe(true);
    expect(tokens.some((t) => t.type === 'IDENTIFIER' && t.value === 'mowftee')).toBe(true);
    expect(tokens.some((t) => t.type === 'TAG' && t.value === 'NOPASSWD')).toBe(true);
    expect(tokens.some((t) => t.type === 'PATH' && t.value === '/bin/cat')).toBe(true);
  });

  it('tokenizes includes and includedirs', () => {
    const input = `#include /etc/sudoers.d/custom\n#includedir /etc/sudoers.d\n`;
    const tokens = tokenizeSudoers(input);
    expect(tokens.some((t) => t.type === 'INCLUDE_KW')).toBe(true);
    expect(tokens.some((t) => t.type === 'INCLUDEDIR_KW')).toBe(true);
  });
});

describe('Sudoers Parser', () => {
  it('parses User_Alias, Cmnd_Alias, and Defaults', () => {
    const input = `
User_Alias ADMINS = alice, bob, %wheel
Cmnd_Alias WEB = /usr/bin/systemctl restart nginx, /usr/bin/nginx -t
Defaults env_reset
Defaults secure_path="/usr/local/sbin:/usr/bin"
`;
    const ast = parseSudoers(input);

    expect(ast.errors).toHaveLength(0);
    expect(ast.aliases.user.has('ADMINS')).toBe(true);
    expect(ast.aliases.user.get('ADMINS')).toEqual(['alice', 'bob', '%wheel']);
    expect(ast.aliases.cmnd.has('WEB')).toBe(true);
    expect(ast.aliases.cmnd.get('WEB')).toHaveLength(2);
    expect(ast.defaults).toHaveLength(2);
  });

  it('parses rules with multiple commands, negation, and tag inheritance', () => {
    const input = `
developer ALL=(ALL) NOPASSWD: /usr/bin/git pull, /usr/bin/apt update, PASSWD: /usr/bin/apt upgrade, !/bin/su
`;
    const ast = parseSudoers(input);
    expect(ast.errors).toHaveLength(0);
    expect(ast.rules).toHaveLength(1);

    const rule = ast.rules[0]!;
    expect(rule.users[0]?.name).toBe('developer');
    expect(rule.hosts[0]?.host).toBe('ALL');
    expect(rule.commands).toHaveLength(4);

    // Command 1: git pull (NOPASSWD)
    expect(rule.commands[0]?.command).toBe('/usr/bin/git');
    expect(rule.commands[0]?.args).toBe('pull');
    expect(rule.commands[0]?.tags.nopasswd).toBe(true);
    expect(rule.commands[0]?.negated).toBe(false);

    // Command 2: apt update (inherited NOPASSWD)
    expect(rule.commands[1]?.command).toBe('/usr/bin/apt');
    expect(rule.commands[1]?.args).toBe('update');
    expect(rule.commands[1]?.tags.nopasswd).toBe(true);

    // Command 3: apt upgrade (PASSWD overrides NOPASSWD)
    expect(rule.commands[2]?.command).toBe('/usr/bin/apt');
    expect(rule.commands[2]?.args).toBe('upgrade');
    expect(rule.commands[2]?.tags.nopasswd).toBe(false);

    // Command 4: /bin/su (negated)
    expect(rule.commands[3]?.command).toBe('/bin/su');
    expect(rule.commands[3]?.negated).toBe(true);
  });

  it('handles multiline continuation with backslash', () => {
    const input = `
User_Alias OPS = alice, \\
                 bob, \\
                 charlie
`;
    const ast = parseSudoers(input);
    expect(ast.aliases.user.get('OPS')).toEqual(['alice', 'bob', 'charlie']);
  });

  it('records syntax error on malformed line without throwing', () => {
    const input = `this is a completely invalid rule with no equals`;
    const ast = parseSudoers(input);
    expect(ast.errors.length).toBeGreaterThan(0);
    expect(ast.errors[0]?.message).toContain("expected '='");
  });
});

describe('Sudoers Matcher & Last-Match-Wins Engine', () => {
  it('denies execution when user is not present in sudoers file', () => {
    const ast = parseSudoers(`root ALL=(ALL) ALL`);
    const res = evaluateSudoers(ast, {
      user: TEST_USERS.guest,
      command: '/usr/bin/id',
      availableGroups: TEST_GROUPS,
    });

    expect(res.allowed).toBe(false);
    expect(res.denialReason).toContain('not in the sudoers file');
  });

  it('allows execution when matching group (%sudo)', () => {
    const ast = parseSudoers(`%sudo ALL=(ALL:ALL) ALL`);
    const res = evaluateSudoers(ast, {
      user: TEST_USERS.mowftee, // mowftee has group 27 (sudo)
      command: '/usr/bin/whoami',
      availableGroups: TEST_GROUPS,
    });

    expect(res.allowed).toBe(true);
    expect(res.requiresPassword).toBe(true);
  });

  it('respects NOPASSWD tag', () => {
    const ast = parseSudoers(`mowftee ALL=(ALL) NOPASSWD: ALL`);
    const res = evaluateSudoers(ast, {
      user: TEST_USERS.mowftee,
      command: '/usr/bin/systemctl restart nginx',
      availableGroups: TEST_GROUPS,
    });

    expect(res.allowed).toBe(true);
    expect(res.requiresPassword).toBe(false);
  });

  it('implements Last-Match-Wins override semantics', () => {
    // Earlier rule requires password, later rule grants NOPASSWD
    const ast1 = parseSudoers(`
mowftee ALL=(ALL) ALL
mowftee ALL=(ALL) NOPASSWD: /bin/cat
`);
    const res1 = evaluateSudoers(ast1, {
      user: TEST_USERS.mowftee,
      command: '/bin/cat',
      availableGroups: TEST_GROUPS,
    });
    expect(res1.allowed).toBe(true);
    expect(res1.requiresPassword).toBe(false);
    expect(res1.overriddenRules).toHaveLength(1);
    expect(res1.overriddenRules[0]?.line).toBe(2);

    // Reverse order: earlier rule is NOPASSWD, later rule overrides with ALL (requires password)
    const ast2 = parseSudoers(`
mowftee ALL=(ALL) NOPASSWD: /bin/cat
mowftee ALL=(ALL) ALL
`);
    const res2 = evaluateSudoers(ast2, {
      user: TEST_USERS.mowftee,
      command: '/bin/cat',
      availableGroups: TEST_GROUPS,
    });
    expect(res2.allowed).toBe(true);
    expect(res2.requiresPassword).toBe(true);
    expect(res2.overriddenRules).toHaveLength(1);
  });

  it('enforces command negation override (!/bin/su)', () => {
    const ast = parseSudoers(`
developer ALL=(ALL) ALL, !/bin/su
`);
    // Regular command is allowed
    const resGit = evaluateSudoers(ast, {
      user: TEST_USERS.developer,
      command: '/usr/bin/git',
      availableGroups: TEST_GROUPS,
    });
    expect(resGit.allowed).toBe(true);

    // Negated command is denied
    const resSu = evaluateSudoers(ast, {
      user: TEST_USERS.developer,
      command: '/bin/su',
      availableGroups: TEST_GROUPS,
    });
    expect(resSu.allowed).toBe(false);
    expect(resSu.denialReason).toContain('explicitly forbidden by negation');
  });

  it('resolves User_Alias and Cmnd_Alias correctly', () => {
    const ast = parseSudoers(`
User_Alias DEVS = developer, %devteam
Cmnd_Alias SAFE_CMDS = /usr/bin/apt update, /usr/bin/docker ps
DEVS ALL = (root) NOPASSWD: SAFE_CMDS
`);
    const resMatch = evaluateSudoers(ast, {
      user: TEST_USERS.developer,
      command: '/usr/bin/docker',
      args: ['ps'],
      availableGroups: TEST_GROUPS,
    });
    expect(resMatch.allowed).toBe(true);
    expect(resMatch.requiresPassword).toBe(false);

    // Non-aliased command denied
    const resDenied = evaluateSudoers(ast, {
      user: TEST_USERS.developer,
      command: '/usr/bin/docker',
      args: ['run', '-it', 'alpine'],
      availableGroups: TEST_GROUPS,
    });
    expect(resDenied.allowed).toBe(false);
  });

  it('evaluates wildcards in arguments properly', () => {
    const ast = parseSudoers(`
developer ALL=(root) /usr/bin/tail -f /var/log/*
`);
    const resOk = evaluateSudoers(ast, {
      user: TEST_USERS.developer,
      command: '/usr/bin/tail',
      args: ['-f', '/var/log/syslog'],
      availableGroups: TEST_GROUPS,
    });
    expect(resOk.allowed).toBe(true);

    const resForbidden = evaluateSudoers(ast, {
      user: TEST_USERS.developer,
      command: '/usr/bin/tail',
      args: ['-f', '/etc/shadow'],
      availableGroups: TEST_GROUPS,
    });
    expect(resForbidden.allowed).toBe(false);
  });

  it('evaluates DEFAULT_SUDOERS_CONTENT accurately with full micro-step trace', () => {
    const ast = parseSudoers(DEFAULT_SUDOERS_CONTENT);
    expect(ast.errors).toHaveLength(0);

    const res = evaluateSudoers(ast, {
      user: TEST_USERS.mowftee,
      command: '/usr/bin/systemctl',
      args: ['restart', 'nginx'],
      availableGroups: TEST_GROUPS,
    });

    expect(res.allowed).toBe(true);
    expect(res.requiresPassword).toBe(false);
    expect(res.traces.length).toBeGreaterThan(0);
    expect(res.traces.some((t) => t.decision === 'ALLOW')).toBe(true);
  });
});

describe('Sudoers Analyzer (Rule Clashes & GTFOBins Security Warnings)', () => {
  it('detects rule clash where a later rule bypasses earlier negation', () => {
    const ast = parseSudoers(SUDOERS_PRESET_MISCONFIGURED);
    const analysis = analyzeSudoers(ast);

    expect(analysis.clashes.length).toBeGreaterThan(0);
    const bypassClash = analysis.clashes.find((c) => c.affectedUserOrGroup === 'bob');
    expect(bypassClash).toBeDefined();
    expect(bypassClash?.reason).toContain('is completely overridden and bypassed');
  });

  it('detects GTFOBins vulnerabilities for vim and find', () => {
    const ast = parseSudoers(SUDOERS_PRESET_MISCONFIGURED);
    const analysis = analyzeSudoers(ast);

    expect(analysis.warnings.length).toBeGreaterThan(0);
    const vimWarning = analysis.warnings.find((w) => w.command.includes('vim'));
    expect(vimWarning).toBeDefined();
    expect(vimWarning?.severity).toBe('CRITICAL');
    expect(vimWarning?.gtfobins?.url).toContain('gtfobins.github.io/gtfobins/vim');

    const findWarning = analysis.warnings.find((w) => w.command.includes('find'));
    expect(findWarning).toBeDefined();
    expect(findWarning?.severity).toBe('CRITICAL');
  });

  it('classifies NOPASSWD ALL as CRITICAL security warning', () => {
    const ast = parseSudoers(`mowftee ALL=(ALL) NOPASSWD: ALL`);
    const analysis = analyzeSudoers(ast);

    const allWarning = analysis.warnings.find((w) => w.command === 'ALL');
    expect(allWarning).toBeDefined();
    expect(allWarning?.severity).toBe('CRITICAL');
    expect(allWarning?.title).toContain('NOPASSWD: ALL');
  });
});
