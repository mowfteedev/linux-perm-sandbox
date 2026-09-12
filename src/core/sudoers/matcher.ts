import { LinuxGroup, LinuxUser } from '@/types';
import { DEFAULT_GROUPS } from '../vfs/default-fs';
import {
  SudoersAST,
  SudoersCommandItem,
  SudoersHostItem,
  SudoersRuleStatement,
  SudoersRunasSpec,
  SudoersUserItem,
  SudoEvaluationQuery,
  SudoEvaluationResult,
  SudoTraceStep,
} from './types';

/**
 * Checks if a wildcard/glob pattern matches a string
 */
function matchGlob(pattern: string, text: string): boolean {
  if (pattern === '*' || pattern === 'ALL') return true;
  if (pattern === text) return true;

  // Escape regex special chars except * and ?
  const regexStr = '^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$';
  return new RegExp(regexStr).test(text);
}

/**
 * Checks if a query user matches a Sudoers user item
 */
function matchUserItem(
  item: SudoersUserItem,
  user: LinuxUser,
  userAliases: Map<string, string[]>,
  groups: LinuxGroup[],
  visitedAliases: Set<string> = new Set(),
): { matched: boolean; reason: string } {
  // 1. ALL keyword
  if (item.name === 'ALL') {
    return {
      matched: !item.negated,
      reason: item.negated ? `Negated ALL matches user '${user.username}' (DENY)` : `ALL matches user '${user.username}'`,
    };
  }

  // 2. Group (%groupname or %#gid)
  if (item.isGroup) {
    const groupIdentifier = item.name.slice(1);
    let matchedGroup = false;
    let grpNameResolved = groupIdentifier;

    if (groupIdentifier.startsWith('#')) {
      const targetGid = parseInt(groupIdentifier.slice(1), 10);
      matchedGroup = user.gid === targetGid || user.groups.includes(targetGid);
    } else {
      const foundGroup = groups.find((g) => g.groupname === groupIdentifier);
      if (foundGroup) {
        matchedGroup = user.gid === foundGroup.gid || user.groups.includes(foundGroup.gid);
      } else {
        // Fallback: match by known group ID conventions or username
        if (groupIdentifier === 'sudo' && user.groups.includes(27)) matchedGroup = true;
        else if (groupIdentifier === 'adm' && user.groups.includes(4)) matchedGroup = true;
        else if (groupIdentifier === 'root' && (user.uid === 0 || user.groups.includes(0))) matchedGroup = true;
        else if (groupIdentifier === user.username) matchedGroup = true;
      }
    }

    const finalMatch = item.negated ? !matchedGroup : matchedGroup;
    return {
      matched: finalMatch,
      reason: matchedGroup
        ? `User '${user.username}' belongs to group '%${grpNameResolved}'`
        : `User '${user.username}' does NOT belong to group '%${grpNameResolved}'`,
    };
  }

  // 3. User Alias
  if (item.isAlias || userAliases.has(item.name)) {
    if (visitedAliases.has(item.name)) {
      return { matched: false, reason: `Circular alias reference detected for '${item.name}'` };
    }
    visitedAliases.add(item.name);

    const aliasMembers = userAliases.get(item.name) || [];
    for (const member of aliasMembers) {
      let isNegated = false;
      let cleanMember = member;
      if (cleanMember.startsWith('!')) {
        isNegated = true;
        cleanMember = cleanMember.slice(1).trim();
      }
      const isGrp = cleanMember.startsWith('%');
      const isSubAlias = userAliases.has(cleanMember);

      const subItem: SudoersUserItem = {
        name: cleanMember,
        isGroup: isGrp,
        isAlias: isSubAlias,
        negated: isNegated,
        raw: member,
      };

      const res = matchUserItem(subItem, user, userAliases, groups, visitedAliases);
      if (res.matched) {
        return {
          matched: !item.negated,
          reason: `User '${user.username}' matched member '${member}' of User_Alias '${item.name}'`,
        };
      }
    }

    return {
      matched: item.negated,
      reason: `User '${user.username}' does not match any member of User_Alias '${item.name}'`,
    };
  }

  // 4. Plain username
  const exact = user.username === item.name;
  const finalMatch = item.negated ? !exact : exact;
  return {
    matched: finalMatch,
    reason: exact
      ? `Exact username match '${user.username}'`
      : `Username '${user.username}' does not match '${item.name}'`,
  };
}

/**
 * Checks if a target host matches a Sudoers host item
 */
function matchHostItem(
  item: SudoersHostItem,
  targetHost: string,
  hostAliases: Map<string, string[]>,
  visitedAliases: Set<string> = new Set(),
): { matched: boolean; reason: string } {
  if (item.host === 'ALL' || targetHost === 'ALL') {
    return { matched: !item.negated, reason: `Matched host 'ALL'` };
  }

  if (item.isAlias || hostAliases.has(item.host)) {
    if (visitedAliases.has(item.host)) return { matched: false, reason: `Circular host alias` };
    visitedAliases.add(item.host);

    const members = hostAliases.get(item.host) || [];
    for (const member of members) {
      if (member === 'ALL' || member === targetHost || (targetHost === 'localhost' && member === '127.0.0.1')) {
        return { matched: !item.negated, reason: `Host '${targetHost}' matched Host_Alias '${item.host}'` };
      }
    }
    return { matched: item.negated, reason: `Host '${targetHost}' not in Host_Alias '${item.host}'` };
  }

  const direct =
    item.host === targetHost ||
    (targetHost === 'localhost' && (item.host === '127.0.0.1' || item.host === 'localhost')) ||
    (targetHost === '127.0.0.1' && item.host === 'localhost');

  return {
    matched: item.negated ? !direct : direct,
    reason: direct ? `Host matched '${targetHost}'` : `Host '${targetHost}' does not match '${item.host}'`,
  };
}

/**
 * Checks if target Runas matches specification
 */
function matchRunasSpec(
  runas: SudoersRunasSpec,
  targetUser: string,
  targetGroup?: string,
): { matched: boolean; reason: string } {
  // Check Runas User
  const userMatches =
    runas.users.includes('ALL') ||
    runas.users.includes(targetUser) ||
    (targetUser === 'root' && runas.users.length === 0);

  if (!userMatches) {
    return {
      matched: false,
      reason: `Target runas user '${targetUser}' not in permitted runas list [${runas.users.join(', ')}]`,
    };
  }

  // Check Runas Group (if specified)
  if (targetGroup && runas.groups && runas.groups.length > 0) {
    const groupMatches = runas.groups.includes('ALL') || runas.groups.includes(targetGroup);
    if (!groupMatches) {
      return {
        matched: false,
        reason: `Target runas group '${targetGroup}' not in permitted runas groups [${runas.groups.join(', ')}]`,
      };
    }
  }

  return {
    matched: true,
    reason: `Runas user '${targetUser}' matched spec ${runas.raw}`,
  };
}

/**
 * Checks if command item matches query command and args
 */
function matchCommandItem(
  item: SudoersCommandItem,
  queryCmd: string,
  queryArgsStr: string,
  cmndAliases: Map<string, string[]>,
  visitedAliases: Set<string> = new Set(),
): { matched: boolean; reason: string } {
  // 1. ALL command
  if (item.command === 'ALL') {
    return {
      matched: true,
      reason: `Matched ALL commands`,
    };
  }

  // 2. Command Alias
  if (item.isAlias || cmndAliases.has(item.command)) {
    if (visitedAliases.has(item.command)) return { matched: false, reason: 'Circular cmnd alias' };
    visitedAliases.add(item.command);

    const members = cmndAliases.get(item.command) || [];
    for (const member of members) {
      // Parse member
      let memberCmd = member;
      let memberArgs: string | undefined = undefined;
      const spaceIdx = member.indexOf(' ');
      if (spaceIdx !== -1) {
        memberCmd = member.slice(0, spaceIdx).trim();
        memberArgs = member.slice(spaceIdx + 1).trim();
      }

      const subItem: SudoersCommandItem = {
        command: memberCmd,
        args: memberArgs,
        negated: false,
        isAlias: cmndAliases.has(memberCmd),
        tags: item.tags,
        raw: member,
      };

      const res = matchCommandItem(subItem, queryCmd, queryArgsStr, cmndAliases, visitedAliases);
      if (res.matched) {
        return {
          matched: true,
          reason: `Matched member '${member}' of Cmnd_Alias '${item.command}'`,
        };
      }
    }
    return {
      matched: false,
      reason: `Command '${queryCmd}' did not match any member of Cmnd_Alias '${item.command}'`,
    };
  }

  // 3. Binary path check
  let binaryMatches = false;
  const normQuery = queryCmd.trim();
  const normItem = item.command.trim();

  if (normItem.includes('*')) {
    binaryMatches = matchGlob(normItem, normQuery);
  } else if (normItem === normQuery) {
    binaryMatches = true;
  } else {
    // Basename fallback (e.g. query is "systemctl" and rule is "/usr/bin/systemctl")
    const queryBase = normQuery.includes('/') ? normQuery.slice(normQuery.lastIndexOf('/') + 1) : normQuery;
    const itemBase = normItem.includes('/') ? normItem.slice(normItem.lastIndexOf('/') + 1) : normItem;
    if (queryBase === itemBase && !normQuery.includes('/')) {
      binaryMatches = true;
    }
  }

  if (!binaryMatches) {
    return {
      matched: false,
      reason: `Command binary '${queryCmd}' does not match '${item.command}'`,
    };
  }

  // 4. Arguments check
  // In Linux sudo: if item.args is undefined, ANY arguments are permitted!
  if (item.args === undefined) {
    return {
      matched: true,
      reason: `Command '${queryCmd}' matched binary '${item.command}' with wildcard argument acceptance`,
    };
  }

  // If item.args is '""', only empty arguments are permitted
  if (item.args === '""' || item.args === "''") {
    if (!queryArgsStr) {
      return { matched: true, reason: `Command '${queryCmd}' matched with empty arguments required` };
    }
    return { matched: false, reason: `Command '${queryCmd}' required empty arguments, but received '${queryArgsStr}'` };
  }

  // If item.args is specified, match args
  const argsMatched = matchGlob(item.args, queryArgsStr);
  return {
    matched: argsMatched,
    reason: argsMatched
      ? `Command '${queryCmd} ${queryArgsStr}' matched arguments '${item.args}'`
      : `Arguments '${queryArgsStr}' do not match required pattern '${item.args}'`,
  };
}

/**
 * Evaluates a command request against a parsed Sudoers AST following standard POSIX sudo semantics:
 * - Top-to-bottom sequential evaluation
 * - Last-match-wins
 * - Tag inheritance and overrides (NOPASSWD vs PASSWD)
 * - Micro-step traces recording every rule considered
 */
export function evaluateSudoers(
  ast: SudoersAST,
  query: SudoEvaluationQuery,
): SudoEvaluationResult {
  const targetHost = query.host || 'localhost';
  const targetRunasUser = query.runasUser || 'root';
  const targetRunasGroup = query.runasGroup;
  const groups = query.availableGroups || DEFAULT_GROUPS;

  const queryArgsStr = Array.isArray(query.args)
    ? query.args.join(' ').trim()
    : (query.args || '').trim();

  const traces: SudoTraceStep[] = [];
  const overriddenRules: SudoersRuleStatement[] = [];

  let winningRule: SudoersRuleStatement | undefined = undefined;
  let winningCommand: SudoersCommandItem | undefined = undefined;
  let currentDecision: 'ALLOW' | 'DENY' | undefined = undefined;
  let currentRequiresPassword = true;
  let denialReason: string | undefined = undefined;

  let stepCounter = 1;

  for (const rule of ast.rules) {
    const stepId = `sudo_step_${stepCounter++}`;

    // 1. Check User Match
    let userMatched = false;
    let userMatchDetail = '';
    for (const uItem of rule.users) {
      const uRes = matchUserItem(uItem, query.user, ast.aliases.user, groups);
      if (uRes.matched) {
        userMatched = true;
        userMatchDetail = uRes.reason;
        break;
      } else {
        userMatchDetail = uRes.reason;
      }
    }

    if (!userMatched) {
      traces.push({
        stepId,
        line: rule.line,
        ruleText: rule.rawText,
        userMatched: false,
        userMatchDetail,
        hostMatched: false,
        hostMatchDetail: 'Skipped',
        runasMatched: false,
        runasMatchDetail: 'Skipped',
        commandMatched: false,
        commandMatchDetail: 'Skipped',
        decision: 'SKIPPED',
        tags: {},
        reason: `User '${query.user.username}' did not match rule user criteria.`,
      });
      continue;
    }

    // 2. Check Host Match
    let hostMatched = false;
    let hostMatchDetail = '';
    for (const hItem of rule.hosts) {
      const hRes = matchHostItem(hItem, targetHost, ast.aliases.host);
      if (hRes.matched) {
        hostMatched = true;
        hostMatchDetail = hRes.reason;
        break;
      } else {
        hostMatchDetail = hRes.reason;
      }
    }

    if (!hostMatched) {
      traces.push({
        stepId,
        line: rule.line,
        ruleText: rule.rawText,
        userMatched: true,
        userMatchDetail,
        hostMatched: false,
        hostMatchDetail,
        runasMatched: false,
        runasMatchDetail: 'Skipped',
        commandMatched: false,
        commandMatchDetail: 'Skipped',
        decision: 'SKIPPED',
        tags: {},
        reason: `Host '${targetHost}' did not match rule host criteria.`,
      });
      continue;
    }

    // 3. Check Runas Match
    const runasRes = matchRunasSpec(rule.runas, targetRunasUser, targetRunasGroup);
    if (!runasRes.matched) {
      traces.push({
        stepId,
        line: rule.line,
        ruleText: rule.rawText,
        userMatched: true,
        userMatchDetail,
        hostMatched: true,
        hostMatchDetail,
        runasMatched: false,
        runasMatchDetail: runasRes.reason,
        commandMatched: false,
        commandMatchDetail: 'Skipped',
        decision: 'SKIPPED',
        tags: {},
        reason: runasRes.reason,
      });
      continue;
    }

    // 4. Check Command Match
    let ruleCommandMatched = false;
    let matchedCmdItem: SudoersCommandItem | undefined = undefined;
    let commandMatchDetail = '';

    for (const cmdItem of rule.commands) {
      const cmdRes = matchCommandItem(cmdItem, query.command, queryArgsStr, ast.aliases.cmnd);
      if (cmdRes.matched) {
        ruleCommandMatched = true;
        matchedCmdItem = cmdItem;
        commandMatchDetail = cmdRes.reason;
        // Last matching command specification in the rule takes precedence (e.g. ALL, !/bin/su)
      } else if (!ruleCommandMatched) {
        commandMatchDetail = cmdRes.reason;
      }
    }


    if (!ruleCommandMatched || !matchedCmdItem) {
      traces.push({
        stepId,
        line: rule.line,
        ruleText: rule.rawText,
        userMatched: true,
        userMatchDetail,
        hostMatched: true,
        hostMatchDetail,
        runasMatched: true,
        runasMatchDetail: runasRes.reason,
        commandMatched: false,
        commandMatchDetail,
        decision: 'SKIPPED',
        tags: {},
        reason: `Command '${query.command}' did not match rule commands.`,
      });
      continue;
    }

    // Rule fully matched! Apply Last-Match-Wins logic
    if (matchedCmdItem.negated) {
      // Explicit Denial
      currentDecision = 'DENY';
      currentRequiresPassword = true;
      denialReason = `Command explicitly forbidden by negation '!${matchedCmdItem.raw}' at line ${rule.line}`;

      if (winningRule) {
        overriddenRules.push(winningRule);
      }
      winningRule = rule;
      winningCommand = matchedCmdItem;

      traces.push({
        stepId,
        line: rule.line,
        ruleText: rule.rawText,
        userMatched: true,
        userMatchDetail,
        hostMatched: true,
        hostMatchDetail,
        runasMatched: true,
        runasMatchDetail: runasRes.reason,
        commandMatched: true,
        commandMatchDetail,
        matchedCommandItem: matchedCmdItem,
        decision: 'DENY',
        tags: matchedCmdItem.tags,
        reason: denialReason,
      });
    } else {
      // Positive Grant
      currentDecision = 'ALLOW';
      currentRequiresPassword = !matchedCmdItem.tags.nopasswd;
      denialReason = undefined;

      if (winningRule) {
        overriddenRules.push(winningRule);
      }
      winningRule = rule;
      winningCommand = matchedCmdItem;

      traces.push({
        stepId,
        line: rule.line,
        ruleText: rule.rawText,
        userMatched: true,
        userMatchDetail,
        hostMatched: true,
        hostMatchDetail,
        runasMatched: true,
        runasMatchDetail: runasRes.reason,
        commandMatched: true,
        commandMatchDetail,
        matchedCommandItem: matchedCmdItem,
        decision: 'ALLOW',
        tags: matchedCmdItem.tags,
        reason: `Rule line ${rule.line} granted execution (password required: ${currentRequiresPassword}).`,
      });
    }
  }

  // Final Decision Compilation
  if (currentDecision === 'ALLOW' && winningRule) {
    return {
      allowed: true,
      requiresPassword: currentRequiresPassword,
      winningRule,
      winningCommand,
      overriddenRules,
      traces,
      runasUser: targetRunasUser,
      runasGroup: targetRunasGroup,
    };
  }

  if (currentDecision === 'DENY' && winningRule) {
    return {
      allowed: false,
      requiresPassword: true,
      winningRule,
      winningCommand,
      overriddenRules,
      traces,
      denialReason: denialReason || `Command denied by rule on line ${winningRule.line}`,
      runasUser: targetRunasUser,
      runasGroup: targetRunasGroup,
    };
  }

  // No matching rule found
  return {
    allowed: false,
    requiresPassword: true,
    overriddenRules: [],
    traces,
    denialReason: `User '${query.user.username}' is not in the sudoers file. This incident will be reported.`,
    runasUser: targetRunasUser,
    runasGroup: targetRunasGroup,
  };
}
