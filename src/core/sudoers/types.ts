import { LinuxGroup, LinuxUser } from '@/types';

export type AliasType = 'User_Alias' | 'Runas_Alias' | 'Host_Alias' | 'Cmnd_Alias';

export type SudoTagType = 'NOPASSWD' | 'PASSWD' | 'NOEXEC' | 'EXEC' | 'SETENV' | 'NOSETENV';

export interface SudoTags {
  nopasswd?: boolean;
  noexec?: boolean;
  setenv?: boolean;
}

export type TokenType =
  | 'COMMENT'
  | 'IDENTIFIER'
  | 'PATH'
  | 'STRING'
  | 'USER_ALIAS_KW'
  | 'RUNAS_ALIAS_KW'
  | 'HOST_ALIAS_KW'
  | 'CMND_ALIAS_KW'
  | 'DEFAULTS_KW'
  | 'INCLUDE_KW'
  | 'INCLUDEDIR_KW'
  | 'TAG'
  | 'COMMA'
  | 'COLON'
  | 'EQUALS'
  | 'LPAREN'
  | 'RPAREN'
  | 'EXCLAMATION'
  | 'NEWLINE'
  | 'EOF';

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

export interface SudoersUserItem {
  name: string; // e.g. "alice", "%sudo", "ADMINS", "ALL"
  isGroup: boolean; // starts with %
  isAlias: boolean; // uppercase alias identifier
  negated: boolean; // preceded by !
  raw: string;
}

export interface SudoersHostItem {
  host: string; // "ALL", "localhost", "SERVERS"
  isAlias: boolean;
  negated: boolean;
  raw: string;
}

export interface SudoersRunasSpec {
  users: string[]; // ["root", "ALL"]
  groups?: string[]; // ["ALL", "shadow"]
  raw: string;
}

export interface SudoersCommandItem {
  command: string; // "/usr/bin/vim", "ALL", "DOCKER"
  args?: string; // command arguments or wildcards, e.g. "/var/log/*"
  negated: boolean; // preceded by !
  isAlias: boolean;
  tags: SudoTags;
  raw: string;
}

export interface SudoersRuleStatement {
  type: 'RULE';
  id: string;
  line: number;
  rawText: string;
  users: SudoersUserItem[];
  hosts: SudoersHostItem[];
  runas: SudoersRunasSpec;
  commands: SudoersCommandItem[];
}

export interface SudoersAliasStatement {
  type: 'ALIAS';
  aliasType: AliasType;
  name: string;
  line: number;
  rawText: string;
  values: string[];
}

export interface SudoersDefaultsStatement {
  type: 'DEFAULTS';
  line: number;
  rawText: string;
  target?: string;
  parameters: string[];
}

export interface SudoersCommentStatement {
  type: 'COMMENT';
  line: number;
  text: string;
}

export interface SudoersIncludeStatement {
  type: 'INCLUDE';
  line: number;
  path: string;
  isDir: boolean;
}

export type SudoersStatement =
  | SudoersRuleStatement
  | SudoersAliasStatement
  | SudoersDefaultsStatement
  | SudoersCommentStatement
  | SudoersIncludeStatement;

export interface SudoersSyntaxError {
  line: number;
  column: number;
  message: string;
  rawLine: string;
}

export interface SudoersAST {
  statements: SudoersStatement[];
  rules: SudoersRuleStatement[];
  aliases: {
    user: Map<string, string[]>;
    runas: Map<string, string[]>;
    host: Map<string, string[]>;
    cmnd: Map<string, string[]>;
  };
  defaults: SudoersDefaultsStatement[];
  errors: SudoersSyntaxError[];
  rawText: string;
}

export interface SudoEvaluationQuery {
  user: LinuxUser;
  command: string;
  args?: string[] | string;
  runasUser?: string; // default "root"
  runasGroup?: string;
  host?: string; // default "localhost"
  availableGroups?: LinuxGroup[];
}

export interface SudoTraceStep {
  stepId: string;
  line: number;
  ruleText: string;
  userMatched: boolean;
  userMatchDetail: string;
  hostMatched: boolean;
  hostMatchDetail: string;
  runasMatched: boolean;
  runasMatchDetail: string;
  commandMatched: boolean;
  commandMatchDetail: string;
  matchedCommandItem?: SudoersCommandItem;
  decision: 'ALLOW' | 'DENY' | 'SKIPPED';
  tags: SudoTags;
  reason: string;
}

export interface SudoEvaluationResult {
  allowed: boolean;
  requiresPassword: boolean;
  winningRule?: SudoersRuleStatement;
  winningCommand?: SudoersCommandItem;
  overriddenRules: SudoersRuleStatement[];
  traces: SudoTraceStep[];
  denialReason?: string;
  runasUser: string;
  runasGroup?: string;
}

export interface RuleClash {
  shadowedRuleLine: number;
  shadowedRuleText: string;
  winningRuleLine: number;
  winningRuleText: string;
  reason: string;
  affectedUserOrGroup: string;
  affectedCommand: string;
}

export interface GTFOBinInfo {
  binary: string;
  functions: string[];
  description: string;
  url: string;
}

export interface SudoSecurityWarning {
  line: number;
  ruleText: string;
  command: string;
  user: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  gtfobins?: GTFOBinInfo;
}

export interface SudoersAnalysisResult {
  ast: SudoersAST;
  clashes: RuleClash[];
  warnings: SudoSecurityWarning[];
  valid: boolean;
}
