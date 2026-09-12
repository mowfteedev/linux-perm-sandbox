import { FileType, PermissionBits, PosixMode, SpecialBits } from '@/types';

/**
 * Creates a blank PermissionBits object
 */
export function createPermissionBits(read = false, write = false, execute = false): PermissionBits {
  return { read, write, execute };
}

/**
 * Creates a blank SpecialBits object
 */
export function createSpecialBits(suid = false, sgid = false, sticky = false): SpecialBits {
  return { suid, sgid, sticky };
}

/**
 * Creates default permissions for files or directories
 * Standard Linux umask 0022 creates 0644 for files, 0755 for directories
 */
export function createDefaultMode(type: FileType = 'file'): PosixMode {
  if (type === 'directory') {
    return {
      special: createSpecialBits(false, false, false),
      user: createPermissionBits(true, true, true),
      group: createPermissionBits(true, false, true),
      other: createPermissionBits(true, false, true),
    };
  }

  return {
    special: createSpecialBits(false, false, false),
    user: createPermissionBits(true, true, false),
    group: createPermissionBits(true, false, false),
    other: createPermissionBits(true, false, false),
  };
}

/**
 * Converts standard Linux octal (e.g. 0o755 or "0755" or "755" or 4755) to a PosixMode object
 */
export function octalToMode(input: number | string): PosixMode {
  let octalStr: string;

  if (typeof input === 'number') {
    octalStr = input.toString(8);
  } else {
    octalStr = input.trim();
  }

  // Pad to 4 digits if needed (e.g., "755" -> "0755")
  if (octalStr.length === 3) {
    octalStr = '0' + octalStr;
  } else if (octalStr.length > 4) {
    octalStr = octalStr.slice(-4);
  } else if (octalStr.length < 3) {
    octalStr = octalStr.padStart(4, '0');
  }

  const specialNum = parseInt(octalStr[0] ?? '0', 8) || 0;
  const userNum = parseInt(octalStr[1] ?? '0', 8) || 0;
  const groupNum = parseInt(octalStr[2] ?? '0', 8) || 0;
  const otherNum = parseInt(octalStr[3] ?? '0', 8) || 0;

  return {
    special: {
      suid: Boolean(specialNum & 4),
      sgid: Boolean(specialNum & 2),
      sticky: Boolean(specialNum & 1),
    },
    user: {
      read: Boolean(userNum & 4),
      write: Boolean(userNum & 2),
      execute: Boolean(userNum & 1),
    },
    group: {
      read: Boolean(groupNum & 4),
      write: Boolean(groupNum & 2),
      execute: Boolean(groupNum & 1),
    },
    other: {
      read: Boolean(otherNum & 4),
      write: Boolean(otherNum & 2),
      execute: Boolean(otherNum & 1),
    },
  };
}

/**
 * Converts a PosixMode object to a 4-digit octal string (e.g., "0755", "4755", "1777")
 */
export function modeToOctal(mode: PosixMode): string {
  const special = (mode.special.suid ? 4 : 0) | (mode.special.sgid ? 2 : 0) | (mode.special.sticky ? 1 : 0);
  const user = (mode.user.read ? 4 : 0) | (mode.user.write ? 2 : 0) | (mode.user.execute ? 1 : 0);
  const group = (mode.group.read ? 4 : 0) | (mode.group.write ? 2 : 0) | (mode.group.execute ? 1 : 0);
  const other = (mode.other.read ? 4 : 0) | (mode.other.write ? 2 : 0) | (mode.other.execute ? 1 : 0);

  return `${special}${user}${group}${other}`;
}

/**
 * Converts a PosixMode object to a numeric octal value (e.g., 0o755)
 */
export function modeToOctalNumber(mode: PosixMode): number {
  return parseInt(modeToOctal(mode), 8);
}

/**
 * Converts PosixMode to standard Linux 10-char symbolic format (e.g., "-rwxr-xr-x", "drwxrwxrwt", "-rwsr-xr-x")
 */
export function modeToSymbolic(mode: PosixMode, fileType: FileType = 'file'): string {
  const typeChar = fileType === 'directory' ? 'd' : fileType === 'symlink' ? 'l' : '-';

  // User
  const uR = mode.user.read ? 'r' : '-';
  const uW = mode.user.write ? 'w' : '-';
  let uX = mode.user.execute ? 'x' : '-';
  if (mode.special.suid) {
    uX = mode.user.execute ? 's' : 'S';
  }

  // Group
  const gR = mode.group.read ? 'r' : '-';
  const gW = mode.group.write ? 'w' : '-';
  let gX = mode.group.execute ? 'x' : '-';
  if (mode.special.sgid) {
    gX = mode.group.execute ? 's' : 'S';
  }

  // Other
  const oR = mode.other.read ? 'r' : '-';
  const oW = mode.other.write ? 'w' : '-';
  let oX = mode.other.execute ? 'x' : '-';
  if (mode.special.sticky) {
    oX = mode.other.execute ? 't' : 'T';
  }

  return `${typeChar}${uR}${uW}${uX}${gR}${gW}${gX}${oR}${oW}${oX}`;
}

/**
 * Converts a standard 9- or 10-character symbolic string back to PosixMode
 * Example: "-rwxr-xr-x", "drwsr-xr-x", "rwxr-xr-t"
 */
export function symbolicToMode(symbolic: string): PosixMode {
  const clean = symbolic.trim();
  // Strip filetype char if length is 10
  const perms = clean.length === 10 ? clean.slice(1) : clean.length === 9 ? clean : clean.padEnd(9, '-');

  const uR = perms[0] === 'r';
  const uW = perms[1] === 'w';
  const uChar = perms[2] ?? '-';
  const suid = uChar === 's' || uChar === 'S';
  const uX = uChar === 'x' || uChar === 's';

  const gR = perms[3] === 'r';
  const gW = perms[4] === 'w';
  const gChar = perms[5] ?? '-';
  const sgid = gChar === 's' || gChar === 'S';
  const gX = gChar === 'x' || gChar === 's';

  const oR = perms[6] === 'r';
  const oW = perms[7] === 'w';
  const oChar = perms[8] ?? '-';
  const sticky = oChar === 't' || oChar === 'T';
  const oX = oChar === 'x' || oChar === 't';

  return {
    special: { suid, sgid, sticky },
    user: { read: uR, write: uW, execute: uX },
    group: { read: gR, write: gW, execute: gX },
    other: { read: oR, write: oW, execute: oX },
  };
}

/**
 * Generates standard copyable Linux command for chmod
 */
export function formatChmodCommand(mode: PosixMode, path: string): string {
  const octal = modeToOctal(mode);
  return `chmod ${octal} ${path}`;
}

/**
 * Generates standard copyable Linux command for chown
 */
export function formatChownCommand(user: string, group: string, path: string): string {
  return `chown ${user}:${group} ${path}`;
}
