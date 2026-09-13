/**
 * SysAdmin Terminal Design Tokens
 * Single Source of Truth for Visual Design, Typography, Spacing & Color Semantics.
 * Compliant with 8pt Grid & WCAG 2.1 AA contrast standards.
 */

export const DESIGN_TOKENS = {
  // 1. Spacing Scale (Strict 8pt Grid)
  spacing: {
    xs: '4px',   // 0.5 * 8pt
    sm: '8px',   // 1.0 * 8pt
    md: '12px',  // 1.5 * 8pt
    lg: '16px',  // 2.0 * 8pt
    xl: '24px',  // 3.0 * 8pt
    '2xl': '32px', // 4.0 * 8pt
    '3xl': '48px', // 6.0 * 8pt
    '4xl': '64px', // 8.0 * 8pt
  },

  // 2. Radii (Terminal Tech Aesthetic: Sharp to Moderately Rounded)
  radius: {
    none: '0px',
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },

  // 3. Typography
  typography: {
    fontFamily: {
      sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'ui-monospace, "JetBrains Mono", "Fira Code", SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
    },
    fontSize: {
      xs: '0.75rem',    // 12px - Line height: 1.25rem (20px)
      sm: '0.875rem',   // 14px - Line height: 1.25rem (20px)
      base: '1rem',      // 16px - Line height: 1.5rem (24px)
      lg: '1.125rem',   // 18px - Line height: 1.75rem (28px)
      xl: '1.25rem',    // 20px - Line height: 1.75rem (28px)
      '2xl': '1.5rem',  // 24px - Line height: 2rem (32px)
    },
  },

  // 4. Color Palette & Semantics
  colors: {
    // Neutral & Surfaces (Deep Dark Terminal Space)
    surface: {
      canvas: '#050811',      // Deepest background
      card: '#0c1222',        // Panels, cards, inspector boards
      elevated: '#141d33',    // Popovers, modals, elevated widgets
      hover: '#1a2540',       // Interactive hover surface
      borderSubtle: '#1e293b',// Slate 800
      borderFocus: '#38bdf8', // Sky 400 focus ring
    },

    // High-Contrast Text (WCAG AA/AAA)
    text: {
      primary: '#f1f5f9',     // Slate 100 (>17:1 contrast on canvas)
      secondary: '#94a3b8',   // Slate 400 (>7:1 contrast on card)
      muted: '#64748b',       // Slate 500 (4.6:1 contrast on card)
      disabled: '#475569',    // Slate 600
    },

    // POSIX UGO Target Semantics
    ugo: {
      user: {
        label: 'Owner / User (u)',
        color: '#38bdf8',       // Sky 400
        bg: 'rgba(56, 189, 248, 0.12)',
        border: 'rgba(56, 189, 248, 0.35)',
        glow: '0 0 10px rgba(56, 189, 248, 0.25)',
      },
      group: {
        label: 'Group (g)',
        color: '#818cf8',       // Indigo 400
        bg: 'rgba(129, 140, 248, 0.12)',
        border: 'rgba(129, 140, 248, 0.35)',
        glow: '0 0 10px rgba(129, 140, 248, 0.25)',
      },
      others: {
        label: 'Others (o)',
        color: '#a78bfa',       // Violet 400
        bg: 'rgba(167, 139, 250, 0.12)',
        border: 'rgba(167, 139, 250, 0.35)',
        glow: '0 0 10px rgba(167, 139, 250, 0.25)',
      },
    },

    // Permission Bits Semantics (r, w, x, -)
    bits: {
      read: {
        symbol: 'r',
        octal: 4,
        color: '#34d399',       // Emerald 400
        bg: 'rgba(52, 211, 153, 0.15)',
        border: 'rgba(52, 211, 153, 0.35)',
        glow: '0 0 12px rgba(52, 211, 153, 0.25)',
      },
      write: {
        symbol: 'w',
        octal: 2,
        color: '#fbbf24',       // Amber 400
        bg: 'rgba(251, 191, 36, 0.15)',
        border: 'rgba(251, 191, 36, 0.35)',
        glow: '0 0 12px rgba(251, 191, 36, 0.25)',
      },
      execute: {
        symbol: 'x',
        octal: 1,
        color: '#60a5fa',       // Blue 400
        bg: 'rgba(96, 165, 250, 0.15)',
        border: 'rgba(96, 165, 250, 0.35)',
        glow: '0 0 12px rgba(96, 165, 250, 0.25)',
      },
      inactive: {
        symbol: '-',
        octal: 0,
        color: '#475569',       // Slate 600
        bg: 'rgba(30, 41, 59, 0.3)',
        border: 'rgba(51, 65, 85, 0.3)',
        glow: 'none',
      },
    },

    // Special Bits (SUID, SGID, Sticky)
    specialBits: {
      suid: {
        name: 'SUID (Set User ID)',
        symbolActive: 's',
        symbolInactive: 'S',
        octal: 4000,
        color: '#fb7185',       // Rose 400 (High-risk escalation signal)
        bg: 'rgba(251, 113, 133, 0.16)',
        border: 'rgba(251, 113, 133, 0.45)',
        glow: '0 0 14px rgba(244, 63, 94, 0.35)',
      },
      sgid: {
        name: 'SGID (Set Group ID)',
        symbolActive: 's',
        symbolInactive: 'S',
        octal: 2000,
        color: '#fb923c',       // Orange 400
        bg: 'rgba(251, 146, 60, 0.16)',
        border: 'rgba(251, 146, 60, 0.45)',
        glow: '0 0 14px rgba(249, 115, 22, 0.35)',
      },
      sticky: {
        name: 'Sticky Bit (Restricted Deletion)',
        symbolActive: 't',
        symbolInactive: 'T',
        octal: 1000,
        color: '#e879f9',       // Fuchsia 400
        bg: 'rgba(232, 121, 249, 0.16)',
        border: 'rgba(232, 121, 249, 0.45)',
        glow: '0 0 14px rgba(217, 70, 239, 0.35)',
      },
    },

    // Evaluation & Feedback States
    status: {
      allowed: {
        label: 'PERMITTED / ALLOWED',
        color: '#34d399',       // Emerald 400
        bg: 'rgba(16, 185, 129, 0.15)',
        border: 'rgba(16, 185, 129, 0.4)',
      },
      denied: {
        label: 'DENIED / FORBIDDEN',
        color: '#fb7185',       // Rose 400
        bg: 'rgba(244, 63, 94, 0.15)',
        border: 'rgba(244, 63, 94, 0.4)',
      },
      traversal: {
        label: 'TRAVERSAL CHECK',
        color: '#38bdf8',       // Sky 400
        bg: 'rgba(56, 189, 248, 0.15)',
        border: 'rgba(56, 189, 248, 0.4)',
      },
      warning: {
        label: 'RULE CLASH / WARNING',
        color: '#fbbf24',       // Amber 400
        bg: 'rgba(245, 158, 11, 0.15)',
        border: 'rgba(245, 158, 11, 0.4)',
      },
      gtfobins: {
        label: 'GTFOBINS EXPLOITABLE',
        color: '#f43f5e',       // Rose 500
        bg: 'rgba(244, 63, 94, 0.2)',
        border: 'rgba(244, 63, 94, 0.6)',
      },
    },
  },
} as const;

export type UgoTarget = 'user' | 'group' | 'others';
export type BitType = 'read' | 'write' | 'execute';
export type SpecialBitType = 'suid' | 'sgid' | 'sticky';
export type StatusType = 'allowed' | 'denied' | 'traversal' | 'warning' | 'gtfobins';

/**
 * Design Token Helper Utilities for Frontend Engineers
 */

export function getBitToken(bit: BitType, active: boolean) {
  if (!active) {
    return DESIGN_TOKENS.colors.bits.inactive;
  }
  return DESIGN_TOKENS.colors.bits[bit];
}

export function getSpecialBitToken(type: SpecialBitType) {
  return DESIGN_TOKENS.colors.specialBits[type];
}

export function getUgoToken(target: UgoTarget) {
  return DESIGN_TOKENS.colors.ugo[target];
}

export function getStatusToken(status: StatusType) {
  return DESIGN_TOKENS.colors.status[status];
}
