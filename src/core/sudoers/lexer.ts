import { Token, TokenType } from './types';

const KEYWORD_MAP: Record<string, TokenType> = {
  user_alias: 'USER_ALIAS_KW',
  runas_alias: 'RUNAS_ALIAS_KW',
  host_alias: 'HOST_ALIAS_KW',
  cmnd_alias: 'CMND_ALIAS_KW',
  defaults: 'DEFAULTS_KW',
  '#include': 'INCLUDE_KW',
  '@include': 'INCLUDE_KW',
  '#includedir': 'INCLUDEDIR_KW',
  '@includedir': 'INCLUDEDIR_KW',
};

const TAG_LIST = ['NOPASSWD', 'PASSWD', 'NOEXEC', 'EXEC', 'SETENV', 'NOSETENV'];

/**
 * Tokenizes raw /etc/sudoers text into a stream of structured Tokens.
 */
export function tokenizeSudoers(rawInput: string): Token[] {
  const tokens: Token[] = [];
  const lines = rawInput.split(/\r?\n/);

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const rawLine = lines[lineIndex];
    if (rawLine === undefined) continue;

    const lineNumber = lineIndex + 1;
    let col = 0;

    // Skip leading whitespace
    while (col < rawLine.length && /\s/.test(rawLine.charAt(col))) {
      col++;
    }

    if (col >= rawLine.length) {
      // Empty line
      continue;
    }

    // Check for comment (unless it's #include or #includedir)
    if (rawLine.charAt(col) === '#') {
      const restOfLine = rawLine.slice(col);
      const lower = restOfLine.toLowerCase();
      if (lower.startsWith('#include ') || lower.startsWith('#include\t')) {
        tokens.push({
          type: 'INCLUDE_KW',
          value: '#include',
          line: lineNumber,
          column: col + 1,
        });
        col += 8;
      } else if (lower.startsWith('#includedir ') || lower.startsWith('#includedir\t')) {
        tokens.push({
          type: 'INCLUDEDIR_KW',
          value: '#includedir',
          line: lineNumber,
          column: col + 1,
        });
        col += 11;
      } else {
        // Normal comment line
        tokens.push({
          type: 'COMMENT',
          value: rawLine.slice(col),
          line: lineNumber,
          column: col + 1,
        });
        tokens.push({
          type: 'NEWLINE',
          value: '\n',
          line: lineNumber,
          column: rawLine.length + 1,
        });
        continue;
      }
    }

    // Process line tokens
    while (col < rawLine.length) {
      const char = rawLine.charAt(col);

      // Whitespace
      if (/\s/.test(char)) {
        col++;
        continue;
      }

      // Inline comment (e.g. at end of a rule)
      if (char === '#' && col > 0 && /\s/.test(rawLine.charAt(col - 1))) {
        tokens.push({
          type: 'COMMENT',
          value: rawLine.slice(col),
          line: lineNumber,
          column: col + 1,
        });
        break;
      }

      // Line continuation
      if (char === '\\' && col === rawLine.length - 1) {
        col++;
        break;
      }

      // Punctuation
      if (char === '=') {
        tokens.push({ type: 'EQUALS', value: '=', line: lineNumber, column: col + 1 });
        col++;
        continue;
      }
      if (char === ',') {
        tokens.push({ type: 'COMMA', value: ',', line: lineNumber, column: col + 1 });
        col++;
        continue;
      }
      if (char === ':') {
        tokens.push({ type: 'COLON', value: ':', line: lineNumber, column: col + 1 });
        col++;
        continue;
      }
      if (char === '(') {
        tokens.push({ type: 'LPAREN', value: '(', line: lineNumber, column: col + 1 });
        col++;
        continue;
      }
      if (char === ')') {
        tokens.push({ type: 'RPAREN', value: ')', line: lineNumber, column: col + 1 });
        col++;
        continue;
      }
      if (char === '!') {
        tokens.push({ type: 'EXCLAMATION', value: '!', line: lineNumber, column: col + 1 });
        col++;
        continue;
      }

      // Quoted string
      if (char === '"' || char === "'") {
        const quoteChar = char;
        const startCol = col;
        col++;
        let strVal = '';
        while (col < rawLine.length && rawLine.charAt(col) !== quoteChar) {
          if (rawLine.charAt(col) === '\\' && col + 1 < rawLine.length) {
            col++;
            strVal += rawLine.charAt(col);
          } else {
            strVal += rawLine.charAt(col);
          }
          col++;
        }
        if (col < rawLine.length && rawLine.charAt(col) === quoteChar) {
          col++; // skip closing quote
        }
        tokens.push({
          type: 'STRING',
          value: strVal,
          line: lineNumber,
          column: startCol + 1,
        });
        continue;
      }

      // Check for Tags: NOPASSWD:, PASSWD:, NOEXEC:, EXEC:, SETENV:, NOSETENV:
      let isTag = false;
      for (const tag of TAG_LIST) {
        const candidate = tag + ':';
        if (rawLine.slice(col, col + candidate.length) === candidate) {
          tokens.push({
            type: 'TAG',
            value: tag,
            line: lineNumber,
            column: col + 1,
          });
          col += candidate.length;
          isTag = true;
          break;
        }
      }
      if (isTag) continue;

      // Word / Path / Identifier
      const startCol = col;
      let word = '';
      while (
        col < rawLine.length &&
        !/[\s=,:()!'"\\]/.test(rawLine.charAt(col))
      ) {
        word += rawLine.charAt(col);
        col++;
      }

      const lowerWord = word.toLowerCase();
      const mappedKw = KEYWORD_MAP[lowerWord];
      if (mappedKw) {
        tokens.push({
          type: mappedKw,
          value: word,
          line: lineNumber,
          column: startCol + 1,
        });
      } else if (word.startsWith('/') || word.includes('*')) {
        tokens.push({
          type: 'PATH',
          value: word,
          line: lineNumber,
          column: startCol + 1,
        });
      } else {
        tokens.push({
          type: 'IDENTIFIER',
          value: word,
          line: lineNumber,
          column: startCol + 1,
        });
      }
    }

    tokens.push({
      type: 'NEWLINE',
      value: '\n',
      line: lineNumber,
      column: rawLine.length + 1,
    });
  }

  tokens.push({
    type: 'EOF',
    value: '',
    line: lines.length + 1,
    column: 1,
  });

  return tokens;
}
