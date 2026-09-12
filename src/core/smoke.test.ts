import { describe, it, expect } from 'vitest';

describe('Project Foundation & Vitest Setup', () => {
  it('should pass basic math test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should correctly evaluate standard linux octal permissions mask', () => {
    // 0755 = rwxr-xr-x
    const octal = 0o755;
    const userRead = (octal >> 6) & 4;
    const userWrite = (octal >> 6) & 2;
    const userExec = (octal >> 6) & 1;

    expect(userRead).toBe(4);
    expect(userWrite).toBe(2);
    expect(userExec).toBe(1);
  });
});
