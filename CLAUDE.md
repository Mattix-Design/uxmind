# UXMind — Project Instructions

## Design System

All UI changes MUST use the centralized design system at `apps/web/lib/design-system.ts`.

### How to use it

```ts
import { ds, scorePill } from "@/lib/design-system";

// Typography
<h1 className={ds.text.pageTitle}>Page Title</h1>
<p className={ds.text.supporting}>Description text</p>

// Layout
<div className={ds.layout.page}>...</div>
<div className={ds.layout.gridCards}>...</div>

// Components
<div className={ds.components.cardList}>...</div>
<Link className={ds.components.cardLink}>...</Link>
<button className={ds.components.btnPrimary}>Click</button>
<button className={ds.components.chip}>Suggestion</button>
<span className={ds.components.typePill}>User Testing</span>

// Score badges — always use scorePill() for consistency
const s = scorePill(82);
<span className={s.pillList}>
  <span className={s.dot} />
  <span className={s.labelText}>Evidence</span> 82
</span>

// Accessibility
<Link className={`... ${ds.a11y.focusRing}`}>...</Link>
<button className={`... ${ds.a11y.touchTarget}`}>...</button>
```

### Rules

1. **Never hardcode score colors** — always use `scorePill()` or `getScoreTheme()` from the design system
2. **Never use `text-coral-600` for text on light backgrounds** — it fails WCAG AA. Use `text-coral-700` via the design system
3. **All interactive elements** must have `ds.a11y.focusRing` and meet 44px touch targets
4. **All `<select>` elements** must have `ariaLabel` via the FilterSelect component
5. **No duplicate `<main>` tags** — layout.tsx provides the `<main>`, pages use `<div>`
6. **Page titles** use `ds.text.pageTitle`, section titles use `ds.text.sectionTitle`

### Color Palette (WCAG AA compliant)

| Token | Hex | Usage |
|-------|-----|-------|
| `coral-500` | #E8513D | Buttons, CTAs, active states |
| `coral-600` | #D4412E | Hover states only |
| `coral-700` | #B33525 | Text on light backgrounds |
| `text-primary` | #1A0A22 | Headings, body text |
| `text-secondary` | #4A3D52 | Supporting text |
| `text-muted` | #665A6E | Metadata, captions |
| `surface-900` | #FAFAF8 | Page background |
| `surface-800` | #F3F1EE | Raised sections |
| `card` | #FFFFFF | Card backgrounds |

### Score Traffic-Light System

Both Evidence and Impact scores use the same color scheme:

| Range | Color | Evidence Label | Impact Label |
|-------|-------|---------------|-------------|
| 85+ | Green | Strong | Highly Actionable |
| 70-84 | Amber | Good | Actionable |
| 65-69 | Coral | Moderate | Moderate |
| <65 | Red | Limited | Low Impact |

## Tech Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4 (using `@theme` in globals.css)
- Supabase (PostgreSQL + auth)
- Claude API for chat and scoring
- Monorepo: `apps/web`, `packages/scoring`, `packages/types`, `packages/db`

## Key Conventions

- Font: Inter
- Border radius: `rounded-xl` for cards, `rounded-2xl` for hero cards, `rounded-full` for pills
- Shadows: `shadow-sm` default, `shadow-md` on hover
- Transitions: `transition-all duration-200` or `transition-colors`
- Icons: Inline SVGs (Lucide-style), 20x20 default, `text-coral-500` for accent
