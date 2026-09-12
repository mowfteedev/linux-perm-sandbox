import {
  AliasType,
  SudoersAliasStatement,
  SudoersAST,
  SudoersCommandItem,
  SudoersDefaultsStatement,
  SudoersHostItem,
  SudoersRuleStatement,
  SudoersStatement,
  SudoersSyntaxError,
  SudoersUserItem,
  SudoTags,
} from './types';

interface LogicalLine {
  text: string;
  startLine: number;
  rawText: string;
}

/**
 * Combines physical lines ending with '\' into logical lines
 */
function buildLogicalLines(rawInput: string): LogicalLine[] {
  const physicalLines = rawInput.split(/\r?\n/);
  const result: LogicalLine[] = [];

  let currentText = '';
  let currentRaw = '';
  let startLine = 1;
  let inContinuation = false;

  for (let i = 0; i < physicalLines.length; i++) {
    const rawLine = physicalLines[i];
    if (rawLine === undefined) continue;
    const lineNum = i + 1;

    if (!inContinuation) {
      startLine = lineNum;
      currentText = '';
      currentRaw = '';
    }

    const trimmed = rawLine.trim();
    if (trimmed.endsWith('\\')) {
      inContinuation = true;
      currentText += trimmed.slice(0, -1).trim() + ' ';
      currentRaw += rawLine + '\n';
    } else {
      currentText += trimmed;
      currentRaw += rawLine;
      result.push({
        text: currentText.trim(),
        startLine,
        rawText: currentRaw,
      });
      inContinuation = false;
    }
  }

  // If file ends with a trailing continuation backslash
  if (inContinuation && currentText.trim()) {
    result.push({
      text: currentText.trim(),
      startLine,
      rawText: currentRaw,
    });
  }

  return result;
}

/**
 * Splits a string by delimiter outside quotes and parentheses
 */
function splitOutsideEnclosures(str: string, delimiter: string): string[] {
  const parts: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';
  let parenDepth = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str.charAt(i);

    if ((char === '"' || char === "'") && parenDepth === 0) {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuotes = false;
      }
      current += char;
    } else if (char === '(' && !inQuotes) {
      parenDepth++;
      current += char;
    } else if (char === ')' && !inQuotes) {
      if (parenDepth > 0) parenDepth--;
      current += char;
    } else if (char === delimiter && !inQuotes && parenDepth === 0) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim().length > 0) {
    parts.push(current.trim());
  }

  return parts;
}

/**
 * Parses raw /etc/sudoers content into a SudoersAST.
 */
export function parseSudoers(rawInput: string): SudoersAST {
  const logicalLines = buildLogicalLines(rawInput);
  const statements: SudoersStatement[] = [];
  const rules: SudoersRuleStatement[] = [];
  const defaults: SudoersDefaultsStatement[] = [];
  const errors: SudoersSyntaxError[] = [];

  const aliases = {
    user: new Map<string, string[]>(),
    runas: new Map<string, string[]>(),
    host: new Map<string, string[]>(),
    cmnd: new Map<string, string[]>(),
  };

  for (const item of logicalLines) {
    const lineText = item.text;
    const lineNumber = item.startLine;

    // 1. Empty lines
    if (!lineText) {
      continue;
    }

    // 2. Comments and Includes
    if (lineText.startsWith('#') || lineText.startsWith('@')) {
      const lower = lineText.toLowerCase();
      if (lower.startsWith('#include ') || lower.startsWith('@include ')) {
        const path = lineText.replace(/^([#@]include\s+)/i, '').trim();
        statements.push({
          type: 'INCLUDE',
          line: lineNumber,
          path,
          isDir: false,
        });
        continue;
      }
      if (lower.startsWith('#includedir ') || lower.startsWith('@includedir ')) {
        const path = lineText.replace(/^([#@]includedir\s+)/i, '').trim();
        statements.push({
          type: 'INCLUDE',
          line: lineNumber,
          path,
          isDir: true,
        });
        continue;
      }

      // Standard comment
      statements.push({
        type: 'COMMENT',
        line: lineNumber,
        text: lineText,
      });
      continue;
    }

    // 3. Defaults
    if (lineText.startsWith('Defaults')) {
      // e.g. Defaults env_reset, mail_badpass
      // Defaults:mowftee !lecture
      const rest = lineText.slice(8).trim();
      let target: string | undefined;
      let paramStr = rest;

      if (rest.startsWith(':') || rest.startsWith('>') || rest.startsWith('@')) {
        const match = rest.match(/^([:>@][^\s]+)\s+(.*)$/);
        if (match && match[1] && match[2]) {
          target = match[1];
          paramStr = match[2];
        }
      }

      const params = splitOutsideEnclosures(paramStr, ',').map((s) => s.trim());
      const defStmt: SudoersDefaultsStatement = {
        type: 'DEFAULTS',
        line: lineNumber,
        rawText: item.rawText,
        target,
        parameters: params,
      };
      defaults.push(defStmt);
      statements.push(defStmt);
      continue;
    }

    // 4. Aliases (User_Alias, Runas_Alias, Host_Alias, Cmnd_Alias)
    const aliasMatch = lineText.match(/^(User_Alias|Runas_Alias|Host_Alias|Cmnd_Alias)\s+([A-Z0-9_]+)\s*=\s*(.+)$/i);
    if (aliasMatch && aliasMatch[1] && aliasMatch[2] && aliasMatch[3]) {
      const aliasTypeStr = aliasMatch[1];
      const aliasName = aliasMatch[2].trim();
      const rawValues = aliasMatch[3].trim();

      const aliasTypeMap: Record<string, AliasType> = {
        user_alias: 'User_Alias',
        runas_alias: 'Runas_Alias',
        host_alias: 'Host_Alias',
        cmnd_alias: 'Cmnd_Alias',
      };
      const aliasType = aliasTypeMap[aliasTypeStr.toLowerCase()] || 'User_Alias';
      const values = splitOutsideEnclosures(rawValues, ',').map((v) => v.trim()).filter(Boolean);

      const aliasStmt: SudoersAliasStatement = {
        type: 'ALIAS',
        aliasType,
        name: aliasName,
        line: lineNumber,
        rawText: item.rawText,
        values,
      };

      if (aliasType === 'User_Alias') aliases.user.set(aliasName, values);
      else if (aliasType === 'Runas_Alias') aliases.runas.set(aliasName, values);
      else if (aliasType === 'Host_Alias') aliases.host.set(aliasName, values);
      else if (aliasType === 'Cmnd_Alias') aliases.cmnd.set(aliasName, values);

      statements.push(aliasStmt);
      continue;
    }

    // 5. User Specifications (Rules)
    // Format: User_List Host_List = (Runas_Spec) [Tag:] Command_List
    const equalIdx = lineText.indexOf('=');
    if (equalIdx === -1) {
      errors.push({
        line: lineNumber,
        column: 1,
        message: `Syntax error: expected '=' in rule specification or unknown directive`,
        rawLine: item.rawText,
      });
      continue;
    }

    const leftSide = lineText.slice(0, equalIdx).trim();
    const rightSide = lineText.slice(equalIdx + 1).trim();

    // Parse Left Side: User_List Host_List
    // Separator between user list and host list is whitespace outside commas
    const leftParts = splitOutsideEnclosures(leftSide, ' ').filter(Boolean);
    let userPartStr = '';
    let hostPartStr = 'ALL';

    if (leftParts.length === 1 && leftParts[0]) {
      // e.g. "root = ..." -> fallback host to ALL
      userPartStr = leftParts[0];
    } else if (leftParts.length > 1) {
      const lastPart = leftParts[leftParts.length - 1];
      if (lastPart) {
        hostPartStr = lastPart;
      }
      userPartStr = leftParts.slice(0, leftParts.length - 1).join(' ');
    }

    const rawUsers = splitOutsideEnclosures(userPartStr, ',').map((u) => u.trim()).filter(Boolean);
    const users: SudoersUserItem[] = rawUsers.map((u) => {
      let clean = u;
      let negated = false;
      if (clean.startsWith('!')) {
        negated = true;
        clean = clean.slice(1).trim();
      }
      const isGroup = clean.startsWith('%');
      const isAlias = !isGroup && (aliases.user.has(clean) || /^[A-Z0-9_]+$/.test(clean));

      return {
        name: clean,
        isGroup,
        isAlias,
        negated,
        raw: u,
      };
    });

    const rawHosts = splitOutsideEnclosures(hostPartStr, ',').map((h) => h.trim()).filter(Boolean);
    const hosts: SudoersHostItem[] = rawHosts.map((h) => {
      let clean = h;
      let negated = false;
      if (clean.startsWith('!')) {
        negated = true;
        clean = clean.slice(1).trim();
      }
      const isAlias = aliases.host.has(clean) || (clean !== 'ALL' && /^[A-Z0-9_]+$/.test(clean));

      return {
        host: clean,
        isAlias,
        negated,
        raw: h,
      };
    });

    // Parse Right Side: (Runas_Spec) Tag_Spec Command_List
    let runasUsers: string[] = ['root'];
    let runasGroups: string[] | undefined = undefined;
    let commandsStr = rightSide;

    if (rightSide.startsWith('(')) {
      const closeParenIdx = rightSide.indexOf(')');
      if (closeParenIdx !== -1) {
        const runasContent = rightSide.slice(1, closeParenIdx).trim();
        commandsStr = rightSide.slice(closeParenIdx + 1).trim();

        if (runasContent.includes(':')) {
          const colonIdx = runasContent.indexOf(':');
          const uPart = runasContent.slice(0, colonIdx).trim();
          const gPart = runasContent.slice(colonIdx + 1).trim();
          runasUsers = uPart ? splitOutsideEnclosures(uPart, ',') : ['ALL'];
          runasGroups = gPart ? splitOutsideEnclosures(gPart, ',') : ['ALL'];
        } else {
          runasUsers = runasContent ? splitOutsideEnclosures(runasContent, ',') : ['ALL'];
        }
      }
    }

    // Parse Command List
    const rawCommands = splitOutsideEnclosures(commandsStr, ',').map((c) => c.trim()).filter(Boolean);
    const activeTags: SudoTags = {};
    const commands: SudoersCommandItem[] = [];

    for (const rawCmd of rawCommands) {
      let cmdTokens = rawCmd;

      // Extract tags at the beginning of this command token: NOPASSWD:, PASSWD:, etc.
      let tagFound = true;
      while (tagFound) {
        tagFound = false;
        const tagMatch = cmdTokens.match(/^(NOPASSWD|PASSWD|NOEXEC|EXEC|SETENV|NOSETENV):\s*(.*)$/i);
        if (tagMatch && tagMatch[1] && tagMatch[2] !== undefined) {
          const tagKey = tagMatch[1].toUpperCase();
          cmdTokens = tagMatch[2].trim();
          tagFound = true;

          if (tagKey === 'NOPASSWD') activeTags.nopasswd = true;
          else if (tagKey === 'PASSWD') activeTags.nopasswd = false;
          else if (tagKey === 'NOEXEC') activeTags.noexec = true;
          else if (tagKey === 'EXEC') activeTags.noexec = false;
          else if (tagKey === 'SETENV') activeTags.setenv = true;
          else if (tagKey === 'NOSETENV') activeTags.setenv = false;
        }
      }

      let negated = false;
      if (cmdTokens.startsWith('!')) {
        negated = true;
        cmdTokens = cmdTokens.slice(1).trim();
      }

      // Split executable binary from arguments
      let binary = cmdTokens;
      let args: string | undefined = undefined;

      const spaceIdx = cmdTokens.indexOf(' ');
      if (spaceIdx !== -1) {
        binary = cmdTokens.slice(0, spaceIdx).trim();
        args = cmdTokens.slice(spaceIdx + 1).trim();
      }

      const isAlias = aliases.cmnd.has(binary) || (binary !== 'ALL' && /^[A-Z0-9_]+$/.test(binary));

      commands.push({
        command: binary,
        args,
        negated,
        isAlias,
        tags: { ...activeTags },
        raw: rawCmd,
      });
    }

    const ruleStmt: SudoersRuleStatement = {
      type: 'RULE',
      id: `rule_line_${lineNumber}`,
      line: lineNumber,
      rawText: item.rawText,
      users,
      hosts,
      runas: {
        users: runasUsers,
        groups: runasGroups,
        raw: rightSide.startsWith('(') ? rightSide.slice(0, rightSide.indexOf(')') + 1) : '(root)',
      },
      commands,
    };

    rules.push(ruleStmt);
    statements.push(ruleStmt);
  }

  return {
    statements,
    rules,
    aliases,
    defaults,
    errors,
    rawText: rawInput,
  };
}
