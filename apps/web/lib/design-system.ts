/**
 * UXMind Design System
 * =====================
 * Centralized design tokens and utility functions.
 * All UI components should pull from here to ensure consistency.
 *
 * Usage:
 *   import { ds } from "@/lib/design-system";
 *   <h1 className={ds.text.pageTitle}>...</h1>
 *   <span className={ds.scoreClasses(score, "evidence").pill}>...</span>
 */

/* ------------------------------------------------------------------ */
/*  Color Tokens                                                       */
/*  Defined in globals.css @theme — these are semantic references.      */
/* ------------------------------------------------------------------ */

export const colors = {
  /** Brand coral — primary accent */
  brand: {
    DEFAULT: "coral-500",       // #E8513D — buttons, CTAs, active nav
    hover: "coral-600",         // #D4412E — hover states
    dark: "coral-700",          // #B33525 — WCAG AA text on light bg
    light: "coral-400",         // #F06B50 — decorative only
    bg: "coral-500/10",         // tinted background
    border: "coral-500/20",     // tinted border
  },

  /** Surfaces — page backgrounds */
  surface: {
    page: "surface-900",        // #FAFAF8 — main page bg
    raised: "surface-800",      // #F3F1EE — sections, stat bars
    border: "surface-700",      // #E8E5E0 — borders, dividers
    muted: "surface-600",       // #D9D5CF — subtle borders
  },

  /** Cards */
  card: {
    bg: "card",                 // #FFFFFF
    hover: "card-hover",        // #F8F6F3
    border: "card-border",      // #E8E5E0
  },

  /** Text hierarchy */
  text: {
    primary: "text-primary",    // #1A0A22 — headings, body
    secondary: "text-secondary",// #4A3D52 — supporting text
    muted: "text-muted",        // #665A6E — metadata, captions (WCAG AA)
  },

  /** Traffic-light scores — used for BOTH evidence and impact */
  score: {
    strong:   { text: "text-green-700",  bg: "bg-green-50",      border: "border-green-200",     dot: "bg-green-700" },
    good:     { text: "text-amber-700",  bg: "bg-amber-50",      border: "border-amber-200",     dot: "bg-amber-700" },
    moderate: { text: "text-coral-700",  bg: "bg-coral-500/10",  border: "border-coral-500/20",  dot: "bg-coral-700" },
    limited:  { text: "text-red-700",    bg: "bg-red-50",        border: "border-red-200",       dot: "bg-red-700" },
  },
} as const;

/* ------------------------------------------------------------------ */
/*  Typography Scale                                                   */
/*  Semantic class strings for consistent text styling.                */
/* ------------------------------------------------------------------ */

export const text = {
  /** Page titles — h1 on main pages */
  pageTitle: "text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-text-primary",

  /** Hero title — homepage only */
  heroTitle: "text-center text-4xl font-extrabold tracking-tight text-text-primary sm:text-5xl lg:text-6xl max-w-3xl leading-tight",

  /** Section headings — h2 */
  sectionTitle: "text-2xl sm:text-3xl font-bold tracking-tight text-text-primary",

  /** Card titles — h3 */
  cardTitle: "text-xl font-semibold text-text-primary",

  /** List item titles */
  itemTitle: "text-sm font-semibold text-text-primary",

  /** Body text */
  body: "text-sm text-text-primary leading-relaxed",

  /** Supporting / descriptive text */
  supporting: "text-sm text-text-secondary leading-relaxed",

  /** Metadata — dates, sources, counts */
  meta: "text-xs text-text-muted",

  /** Eyebrow / kicker — small uppercase label */
  eyebrow: "text-xs font-semibold tracking-widest uppercase text-coral-500",

  /** Section label — uppercase within sections */
  sectionLabel: "text-xs font-semibold uppercase tracking-wide text-text-muted",
} as const;

/* ------------------------------------------------------------------ */
/*  Spacing & Layout                                                   */
/* ------------------------------------------------------------------ */

export const layout = {
  /** Page container — max width + padding */
  page: "mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8",

  /** Narrow page container (detail pages) */
  pageNarrow: "mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8",

  /** Section vertical spacing */
  section: "py-16",

  /** Card grid — 1/2/3 col responsive */
  gridCards: "grid gap-5 sm:grid-cols-2 lg:grid-cols-3",

  /** 4-col grid (homepage features) */
  gridFeatures: "grid gap-6 sm:grid-cols-2 lg:grid-cols-4",

  /** List stack */
  listStack: "flex flex-col gap-3",

  /** Filter bar layout */
  filterBar: "mb-8 flex flex-col gap-4",

  /** Filter row — wraps on mobile */
  filterRow: "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between",
} as const;

/* ------------------------------------------------------------------ */
/*  Component Tokens                                                   */
/* ------------------------------------------------------------------ */

export const components = {
  /** Card — list item style */
  cardList: "group relative flex items-start gap-4 rounded-xl border border-card-border/50 bg-card p-4 shadow-sm transition hover:shadow-md hover:bg-card-hover",

  /** Card — grid style */
  cardGrid: "group relative flex flex-col rounded-xl border border-card-border/50 bg-card shadow-sm transition hover:shadow-md hover:bg-card-hover",

  /** Card inner padding (grid) */
  cardGridInner: "flex flex-1 flex-col p-5",

  /** Card link overlay — covers full card for click area */
  cardLink: "absolute inset-0 z-0 rounded-xl focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2 focus-visible:outline-none",

  /** Feature card (homepage) */
  featureCard: "rounded-2xl border border-card-border/50 bg-card p-6 shadow-sm hover:shadow-md hover:bg-card-hover transition-all",

  /** Browse card link */
  browseCard: "group rounded-2xl border border-card-border/50 bg-card p-6 shadow-sm hover:shadow-md hover:bg-card-hover transition-all focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2 focus-visible:outline-none",

  /** Icon container — square rounded bg */
  iconBox: "mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-coral-500/10",

  /** Research type pill */
  typePill: "rounded-full bg-coral-500/10 px-2.5 py-0.5 text-[11px] font-medium text-coral-700",

  /** Primary button */
  btnPrimary: "rounded-lg bg-coral-500 px-4 py-2 text-sm font-medium text-white hover:bg-coral-600 transition-colors focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2 focus-visible:outline-none",

  /** Primary button — rounded (chat) */
  btnPrimaryRound: "rounded-xl bg-coral-500 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-coral-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-coral-500 cursor-pointer focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2 focus-visible:outline-none",

  /** Ghost / outline button */
  btnGhost: "inline-flex items-center gap-1.5 rounded-lg border border-card-border bg-card px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:shadow-sm transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:outline-none",

  /** Suggestion / chip button */
  chip: "rounded-full border border-card-border bg-card px-3.5 py-2.5 min-h-[44px] text-xs text-text-secondary hover:text-text-primary hover:shadow-sm transition-all duration-200 text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:outline-none",

  /** Input field */
  input: "w-full rounded-lg border border-card-border bg-card py-2 pl-3 pr-10 text-sm text-text-primary shadow-sm transition placeholder:text-text-muted focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-500/20",

  /** View toggle button (active) */
  viewToggleActive: "flex items-center justify-center min-h-[44px] min-w-[44px] px-3 py-3 transition bg-coral-500 text-white focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:outline-none",

  /** View toggle button (inactive) */
  viewToggleInactive: "flex items-center justify-center min-h-[44px] min-w-[44px] px-3 py-3 transition text-text-muted hover:text-text-secondary focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:outline-none",

  /** Breadcrumb nav */
  breadcrumb: "mb-8 flex items-center gap-1.5 text-sm text-text-muted",
} as const;

/* ------------------------------------------------------------------ */
/*  Score Utilities                                                    */
/*  Returns consistent class strings for any score value.              */
/* ------------------------------------------------------------------ */

export type ScoreTheme = {
  text: string;
  bg: string;
  border: string;
  dot: string;
  label: string;
};

/** Get the traffic-light theme for a numeric score (0-100). */
export function getScoreTheme(score: number): ScoreTheme {
  if (score >= 85) return { ...colors.score.strong, label: "Strong" };
  if (score >= 70) return { ...colors.score.good, label: "Good" };
  if (score >= 65) return { ...colors.score.moderate, label: "Moderate" };
  return { ...colors.score.limited, label: "Limited" };
}

/** Get the impact-specific label for a score. */
export function getImpactLabel(score: number): string {
  if (score >= 85) return "Highly Actionable";
  if (score >= 70) return "Actionable";
  if (score >= 65) return "Moderate";
  return "Low Impact";
}

/** Get the evidence-specific label for a score. */
export function getEvidenceLabel(score: number): string {
  if (score >= 85) return "Strong";
  if (score >= 70) return "Good";
  if (score >= 65) return "Moderate";
  return "Limited";
}

/**
 * Returns full class strings for a score pill badge.
 * Use for both Evidence and Impact score displays.
 *
 * @example
 * const s = scorePill(82);
 * <span className={s.pillList}>
 *   <span className={s.dot} />
 *   <span className={s.label}>Evidence</span> 82
 * </span>
 */
export function scorePill(score: number) {
  const theme = getScoreTheme(score);
  return {
    /** Inline pill for list views */
    pillList: `inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${theme.border} ${theme.bg} ${theme.text}`,
    /** Stacked pill for grid views */
    pillGrid: `inline-flex flex-col items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold leading-tight ${theme.border} ${theme.bg} ${theme.text}`,
    /** Large pill for detail pages */
    pillLarge: `inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${theme.border} ${theme.bg} ${theme.text}`,
    /** The colored dot */
    dot: `h-1.5 w-1.5 rounded-full ${theme.dot}`,
    /** Large dot (detail pages) */
    dotLarge: `h-2 w-2 rounded-full ${theme.dot}`,
    /** Label text ("Evidence" / "Impact") */
    labelText: "text-[10px] font-medium",
    /** Grid label text */
    gridLabelText: "text-[9px] font-medium uppercase tracking-wide",
    /** The theme itself for custom use */
    theme,
  };
}

/* ------------------------------------------------------------------ */
/*  Accessibility Tokens                                               */
/* ------------------------------------------------------------------ */

export const a11y = {
  /** Focus ring for interactive elements */
  focusRing: "focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-2 focus-visible:outline-none",

  /** Focus ring without offset (for elements inside containers) */
  focusRingInset: "focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:outline-none",

  /** Minimum touch target */
  touchTarget: "min-h-[44px] min-w-[44px]",

  /** Screen reader only */
  srOnly: "sr-only",
} as const;

/* ------------------------------------------------------------------ */
/*  Namespace export for clean imports                                  */
/* ------------------------------------------------------------------ */

export const ds = {
  colors,
  text,
  layout,
  components,
  a11y,
  getScoreTheme,
  getImpactLabel,
  getEvidenceLabel,
  scorePill,
} as const;
