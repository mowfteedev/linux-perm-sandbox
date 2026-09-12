import {
  GTFOBinInfo,
  RuleClash,
  SudoersAnalysisResult,
  SudoersAST,
  SudoSecurityWarning,
} from './types';

export const GTFOBINS_DATABASE: Record<string, GTFOBinInfo> = {
  vim: {
    binary: 'vim',
    functions: ['Shell', 'Sudo', 'File write', 'File read'],
    description: 'Vim can spawn an interactive root shell via :!/bin/sh or py/lua execution.',
    url: 'https://gtfobins.github.io/gtfobins/vim/#sudo',
  },
  vi: {
    binary: 'vi',
    functions: ['Shell', 'Sudo', 'File read'],
    description: 'Vi can spawn an interactive shell using :!/bin/sh.',
    url: 'https://gtfobins.github.io/gtfobins/vi/#sudo',
  },
  nano: {
    binary: 'nano',
    functions: ['Shell', 'Sudo', 'File write', 'File read'],
    description: 'Nano can execute shell commands via ^R^X (Execute Command).',
    url: 'https://gtfobins.github.io/gtfobins/nano/#sudo',
  },
  less: {
    binary: 'less',
    functions: ['Shell', 'Sudo', 'File read'],
    description: 'Less pager can spawn an interactive root shell via !/bin/sh.',
    url: 'https://gtfobins.github.io/gtfobins/less/#sudo',
  },
  more: {
    binary: 'more',
    functions: ['Shell', 'Sudo', 'File read'],
    description: 'More pager can execute shell commands when terminal output is paged.',
    url: 'https://gtfobins.github.io/gtfobins/more/#sudo',
  },
  find: {
    binary: 'find',
    functions: ['Shell', 'Sudo'],
    description: 'Find can execute arbitrary root commands via -exec /bin/sh \\; -quit.',
    url: 'https://gtfobins.github.io/gtfobins/find/#sudo',
  },
  awk: {
    binary: 'awk',
    functions: ['Shell', 'Sudo', 'File read'],
    description: 'Awk can execute shell commands via BEGIN {system("/bin/sh")}.',
    url: 'https://gtfobins.github.io/gtfobins/awk/#sudo',
  },
  python: {
    binary: 'python',
    functions: ['Shell', 'Sudo', 'File write', 'File read'],
    description: 'Python interpreter can spawn a root shell via import pty; pty.spawn("/bin/sh").',
    url: 'https://gtfobins.github.io/gtfobins/python/#sudo',
  },
  python3: {
    binary: 'python3',
    functions: ['Shell', 'Sudo', 'File write', 'File read'],
    description: 'Python 3 interpreter can spawn a root shell via import os; os.system("/bin/sh").',
    url: 'https://gtfobins.github.io/gtfobins/python/#sudo',
  },
  perl: {
    binary: 'perl',
    functions: ['Shell', 'Sudo'],
    description: 'Perl can execute arbitrary commands via exec "/bin/sh".',
    url: 'https://gtfobins.github.io/gtfobins/perl/#sudo',
  },
  bash: {
    binary: 'bash',
    functions: ['Shell', 'Sudo'],
    description: 'Bash runs directly as an interactive root shell.',
    url: 'https://gtfobins.github.io/gtfobins/bash/#sudo',
  },
  sh: {
    binary: 'sh',
    functions: ['Shell', 'Sudo'],
    description: 'POSIX sh runs directly as an interactive root shell.',
    url: 'https://gtfobins.github.io/gtfobins/sh/#sudo',
  },
  tar: {
    binary: 'tar',
    functions: ['Shell', 'Sudo', 'File read', 'File write'],
    description: 'Tar can run arbitrary commands via --checkpoint=1 --checkpoint-action=exec=/bin/sh.',
    url: 'https://gtfobins.github.io/gtfobins/tar/#sudo',
  },
  zip: {
    binary: 'zip',
    functions: ['Shell', 'Sudo'],
    description: 'Zip can execute arbitrary shell commands via -T --unzip-command="sh -c /bin/sh".',
    url: 'https://gtfobins.github.io/gtfobins/zip/#sudo',
  },
  env: {
    binary: 'env',
    functions: ['Shell', 'Sudo'],
    description: 'Env can run arbitrary programs or spawn an interactive shell: env /bin/sh.',
    url: 'https://gtfobins.github.io/gtfobins/env/#sudo',
  },
  cp: {
    binary: 'cp',
    functions: ['Sudo', 'File write', 'File read'],
    description: 'Cp can overwrite /etc/passwd or /etc/sudoers to grant instant root privileges.',
    url: 'https://gtfobins.github.io/gtfobins/cp/#sudo',
  },
  chmod: {
    binary: 'chmod',
    functions: ['Sudo'],
    description: 'Chmod can set SUID bit on /bin/bash or modify permissions of /etc/shadow.',
    url: 'https://gtfobins.github.io/gtfobins/chmod/#sudo',
  },
  chown: {
    binary: 'chown',
    functions: ['Sudo'],
    description: 'Chown can transfer ownership of /etc/shadow or /etc/sudoers to unprivileged users.',
    url: 'https://gtfobins.github.io/gtfobins/chown/#sudo',
  },
  tee: {
    binary: 'tee',
    functions: ['Sudo', 'File write'],
    description: 'Tee can append new root user lines directly to /etc/passwd or /etc/sudoers.',
    url: 'https://gtfobins.github.io/gtfobins/tee/#sudo',
  },
};

/**
 * Extracts the base executable name from a command string or path
 */
function extractBinaryBase(cmd: string): string {
  const norm = cmd.trim();
  const lastSlash = norm.lastIndexOf('/');
  return lastSlash !== -1 ? norm.slice(lastSlash + 1) : norm;
}

/**
 * Analyzes Sudoers AST for:
 * 1. Rule clashes / overrides (Last-match-wins conflicts)
 * 2. GTFOBins privilege escalation security vulnerabilities
 */
export function analyzeSudoers(ast: SudoersAST): SudoersAnalysisResult {
  const clashes: RuleClash[] = [];
  const warnings: SudoSecurityWarning[] = [];

  // 1. Detect Rule Clashes between statements
  for (let i = 0; i < ast.rules.length; i++) {
    const earlyRule = ast.rules[i];
    if (!earlyRule) continue;

    for (let j = i + 1; j < ast.rules.length; j++) {
      const lateRule = ast.rules[j];
      if (!lateRule) continue;

      // Check if rules target the same user or group
      const sharedUser = earlyRule.users.find((u1) =>
        lateRule.users.some((u2) => u1.name === u2.name && u1.isGroup === u2.isGroup),
      );

      if (!sharedUser) continue;

      // Check command relationships
      for (const earlyCmd of earlyRule.commands) {
        for (const lateCmd of lateRule.commands) {
          const userStr = sharedUser.raw;

          // Case A: Early rule allows, late rule negates
          if (!earlyCmd.negated && lateCmd.negated) {
            const sameCmd =
              earlyCmd.command === 'ALL' ||
              lateCmd.command === 'ALL' ||
              earlyCmd.command === lateCmd.command ||
              extractBinaryBase(earlyCmd.command) === extractBinaryBase(lateCmd.command);

            if (sameCmd) {
              clashes.push({
                shadowedRuleLine: earlyRule.line,
                shadowedRuleText: earlyRule.rawText.trim(),
                winningRuleLine: lateRule.line,
                winningRuleText: lateRule.rawText.trim(),
                reason: `Line ${lateRule.line} explicitly revokes permissions granted at line ${earlyRule.line} using negation '!${lateCmd.raw}'.`,
                affectedUserOrGroup: userStr,
                affectedCommand: earlyCmd.raw,
              });
            }
          }

          // Case B: Early rule negates, late rule permits (Accidental bypass)
          if (earlyCmd.negated && !lateCmd.negated) {
            const sameCmd =
              lateCmd.command === 'ALL' ||
              earlyCmd.command === lateCmd.command ||
              extractBinaryBase(earlyCmd.command) === extractBinaryBase(lateCmd.command);

            if (sameCmd) {
              clashes.push({
                shadowedRuleLine: earlyRule.line,
                shadowedRuleText: earlyRule.rawText.trim(),
                winningRuleLine: lateRule.line,
                winningRuleText: lateRule.rawText.trim(),
                reason: `Security restriction '!${earlyCmd.raw}' at line ${earlyRule.line} is completely overridden and bypassed by line ${lateRule.line} (Last-match-wins).`,
                affectedUserOrGroup: userStr,
                affectedCommand: earlyCmd.raw,
              });
            }
          }

          // Case C: NOPASSWD override conflict
          if (earlyCmd.tags.nopasswd && !lateCmd.tags.nopasswd) {
            const sameCmd = earlyCmd.command === lateCmd.command || lateCmd.command === 'ALL';
            if (sameCmd) {
              clashes.push({
                shadowedRuleLine: earlyRule.line,
                shadowedRuleText: earlyRule.rawText.trim(),
                winningRuleLine: lateRule.line,
                winningRuleText: lateRule.rawText.trim(),
                reason: `NOPASSWD permission at line ${earlyRule.line} is shadowed by line ${lateRule.line}; user will unexpectedly be prompted for password.`,
                affectedUserOrGroup: userStr,
                affectedCommand: earlyCmd.raw,
              });
            }
          }
        }
      }
    }
  }

  // 2. GTFOBins & Security Vulnerability Scanning
  for (const rule of ast.rules) {
    const userNames = rule.users.map((u) => u.raw).join(', ');

    for (const cmdItem of rule.commands) {
      if (cmdItem.negated) continue;

      const baseName = extractBinaryBase(cmdItem.command).toLowerCase();

      // Check ALL command
      if (cmdItem.command === 'ALL') {
        if (cmdItem.tags.nopasswd) {
          warnings.push({
            line: rule.line,
            ruleText: rule.rawText.trim(),
            command: 'ALL',
            user: userNames,
            severity: 'CRITICAL',
            title: 'Unrestricted Passwordless Root Access (NOPASSWD: ALL)',
            description: `User '${userNames}' can execute any command as root without password authentication, presenting maximum system risk.`,
          });
        } else {
          warnings.push({
            line: rule.line,
            ruleText: rule.rawText.trim(),
            command: 'ALL',
            user: userNames,
            severity: 'MEDIUM',
            title: 'Full Sudo Administration Privileges',
            description: `User '${userNames}' has full sudo privileges (requires password). Ensure this user account is protected with multi-factor authentication.`,
          });
        }
        continue;
      }

      // Check GTFOBins database
      const gtfobin = GTFOBINS_DATABASE[baseName];
      if (gtfobin) {
        const isNoPasswd = cmdItem.tags.nopasswd;
        warnings.push({
          line: rule.line,
          ruleText: rule.rawText.trim(),
          command: cmdItem.command,
          user: userNames,
          severity: isNoPasswd ? 'CRITICAL' : 'HIGH',
          title: `Privilege Escalation via GTFOBins: ${baseName}`,
          description: `${gtfobin.description} Granting sudo on '${cmdItem.command}' ${
            isNoPasswd ? 'without password ' : ''
          }enables instant escape to an interactive root shell.`,
          gtfobins: gtfobin,
        });
      }
    }
  }

  return {
    ast,
    clashes,
    warnings,
    valid: ast.errors.length === 0,
  };
}
