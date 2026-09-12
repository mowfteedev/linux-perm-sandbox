import { describe, it, expect } from 'vitest';
import {
  formatChmodCommand,
  formatChownCommand,
  modeToOctal,
  modeToOctalNumber,
  modeToSymbolic,
  octalToMode,
  symbolicToMode,
} from './mode';

describe('POSIX Mode & Octal/Symbolic Conversions', () => {
  it('converts standard octal strings and numbers to PosixMode', () => {
    const mode755 = octalToMode('0755');
    expect(mode755.user).toEqual({ read: true, write: true, execute: true });
    expect(mode755.group).toEqual({ read: true, write: false, execute: true });
    expect(mode755.other).toEqual({ read: true, write: false, execute: true });
    expect(mode755.special).toEqual({ suid: false, sgid: false, sticky: false });

    // 3-digit shorthand
    const mode644 = octalToMode('644');
    expect(mode644.user).toEqual({ read: true, write: true, execute: false });
    expect(mode644.group).toEqual({ read: true, write: false, execute: false });
    expect(mode644.other).toEqual({ read: true, write: false, execute: false });

    // Numeric input
    const modeNumeric = octalToMode(0o644);
    expect(modeToOctal(modeNumeric)).toBe('0644');
  });

  it('handles special bits (SUID, SGID, Sticky Bit) accurately', () => {
    // SUID 4755
    const suid = octalToMode('4755');
    expect(suid.special.suid).toBe(true);
    expect(suid.special.sgid).toBe(false);
    expect(suid.special.sticky).toBe(false);

    // SGID 2755
    const sgid = octalToMode('2755');
    expect(sgid.special.sgid).toBe(true);

    // Sticky Bit 1777
    const sticky = octalToMode('1777');
    expect(sticky.special.sticky).toBe(true);
    expect(sticky.other.execute).toBe(true);

    // All special bits 7777
    const all = octalToMode('7777');
    expect(all.special).toEqual({ suid: true, sgid: true, sticky: true });
  });

  it('converts PosixMode to octal string and number', () => {
    const mode = octalToMode('4755');
    expect(modeToOctal(mode)).toBe('4755');
    expect(modeToOctalNumber(mode)).toBe(0o4755);

    const stickyMode = octalToMode('1777');
    expect(modeToOctal(stickyMode)).toBe('1777');
    expect(modeToOctalNumber(stickyMode)).toBe(0o1777);
  });

  it('formats symbolic strings correctly according to Linux ls -l rules', () => {
    // Normal file 0755
    expect(modeToSymbolic(octalToMode('0755'), 'file')).toBe('-rwxr-xr-x');

    // Directory 0755
    expect(modeToSymbolic(octalToMode('0755'), 'directory')).toBe('drwxr-xr-x');

    // SUID with execute: 's'
    expect(modeToSymbolic(octalToMode('4755'), 'file')).toBe('-rwsr-xr-x');

    // SUID without execute: 'S'
    expect(modeToSymbolic(octalToMode('4644'), 'file')).toBe('-rwSr--r--');

    // SGID with execute: 's'
    expect(modeToSymbolic(octalToMode('2755'), 'file')).toBe('-rwxr-sr-x');

    // SGID without execute: 'S'
    expect(modeToSymbolic(octalToMode('2644'), 'file')).toBe('-rw-r-Sr--');

    // Sticky bit with execute: 't' (e.g. /tmp 1777)
    expect(modeToSymbolic(octalToMode('1777'), 'directory')).toBe('drwxrwxrwt');

    // Sticky bit without execute: 'T'
    expect(modeToSymbolic(octalToMode('1776'), 'directory')).toBe('drwxrwxrwT');
  });

  it('parses symbolic strings back to PosixMode accurately', () => {
    const sym1 = '-rwsr-xr-x';
    const mode1 = symbolicToMode(sym1);
    expect(mode1.special.suid).toBe(true);
    expect(mode1.user.execute).toBe(true);
    expect(modeToOctal(mode1)).toBe('4755');

    const sym2 = 'drwxrwxrwt';
    const mode2 = symbolicToMode(sym2);
    expect(mode2.special.sticky).toBe(true);
    expect(mode2.other.execute).toBe(true);
    expect(modeToOctal(mode2)).toBe('1777');

    const sym3 = '-rwSr--r--';
    const mode3 = symbolicToMode(sym3);
    expect(mode3.special.suid).toBe(true);
    expect(mode3.user.execute).toBe(false);
    expect(modeToOctal(mode3)).toBe('4644');
  });

  it('generates CLI command strings for chmod and chown', () => {
    const mode = octalToMode('0755');
    expect(formatChmodCommand(mode, '/var/www')).toBe('chmod 0755 /var/www');
    expect(formatChownCommand('www-data', 'www-data', '/var/www')).toBe('chown www-data:www-data /var/www');
  });
});
