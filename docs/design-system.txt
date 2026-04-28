# b. Design System

A single reference for Claude Code sessions working on the `justbe` app. Pulls together the core philosophy, shadcn tokens, custom b. palette, typography, layout primitives, and component conventions currently in use.

---

## 1. Core Philosophy — "Slow Down Intentionally"

Every pixel should reduce cognitive load. The interface should feel like a deep breath.

- Avoid pure black/white — use warm "off" colors that mimic natural materials.
- Generous whitespace; ~50% of the screen should often be negative space.
- Wide margins, never edge-to-edge text.
- Soft, diffused shadows only. No sharp drop shadows.
- Slow, fluid micro-interactions (~500ms).
- No infinite scroll — paginated or finite lists only.
- Imagery favors abstract nature and textures (stone, water, leaf, fabric). Avoid faces and busy cityscapes.

---

## 2. Technology Stack

- **Framework**: Next.js 15 (App Router, RSC)
- **Styling**: Tailwind CSS v4 (via `@import "tailwindcss"` in `src/app/globals.css`)
- **Component library**: shadcn/ui — style `new-york`, base color `neutral`, CSS variables enabled
- **Icons**: `lucide-react`
- **Fonts**: Geist Sans, Geist Mono, DynaPuff (all via `next/font/google`), plus Georgia (serif) for headings
- **Theming**: `class`-based dark mode, managed by `components/theme-provider.tsx` and `ThemeToggle.tsx`
- **Plugins**: `tailwindcss-animate`, `@tailwindcss/typography`

Aliases (`components.json`):
- `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`, `@/hooks`

---

## 3. Color System

### 3.1 b. Brand Palette (always available as Tailwind utilities)

| Token | Hex | Role |
|---|---|---|
| `b-sand` | `#F5F2EB` | Warm paper-like background |
| `b-charcoal` | `#2D2D2D` | Softer-than-black text |
| `b-sage` | `#8DA399` | Primary calming green action |
| `b-clay` | `#D4A59A` | Warmth / comfort accent |
| `b-mist` | `#E0E6E6` | Secondary backgrounds |
| `b-night` | `#1A1A1A` | Dark-mode background (deep, not void) |

Exposed as:
- Tailwind classes: `bg-b-sand`, `text-b-charcoal`, `bg-b-sage`, `text-b-clay`, `bg-b-mist`, `bg-b-night`
- CSS variables: `--color-b-sand`, `--color-b-charcoal`, `--color-b-sage`, `--color-b-clay`, `--color-b-mist`, `--color-b-night`

### 3.2 shadcn Semantic Tokens

Defined in `src/app/globals.css` as OKLCH variables, mapped into Tailwind via `@theme inline`. Prefer these for component work so dark mode flips cleanly.

| Token | Light | Dark | Purpose |
|---|---|---|---|
| `--background` / `--foreground` | near-white / near-black | near-black / near-white | Page surface + body text |
| `--card` / `--card-foreground` | white | `oklch(0.205 0 0)` | Card surface |
| `--popover` / `--popover-foreground` | white | `oklch(0.205 0 0)` | Menus, tooltips |
| `--primary` / `--primary-foreground` | near-black / near-white | near-white / near-black | Primary CTAs |
| `--secondary` / `--secondary-foreground` | soft gray / near-black | dark gray / near-white | Secondary surfaces |
| `--muted` / `--muted-foreground` | soft gray / mid-gray | dark gray / lighter gray | De-emphasized text |
| `--accent` / `--accent-foreground` | soft gray / near-black | dark gray / near-white | Hover surfaces |
| `--destructive` / `--destructive-foreground` | red / white | red / white | Dangerous actions |
| `--border` / `--input` | light gray | translucent white | Borders, inputs |
| `--ring` | mid-gray | mid-gray | Focus rings |
| `--chart-1..5` | — | — | Data viz palette |
| `--sidebar-*` | — | — | Sidebar surface + its own primary/accent/border/ring |

Tailwind utility form: `bg-background`, `text-foreground`, `bg-card`, `border-border`, `ring-ring`, `bg-primary`, `text-primary-foreground`, etc.

### 3.3 Color Usage Rules

- Body + main surfaces → `bg-background text-foreground`.
- Cards → `bg-card text-card-foreground`.
- Primary CTA → `bg-primary text-primary-foreground`.
- Secondary / ghost surfaces → `bg-secondary` or `hover:bg-accent`.
- Borders → `border-border` (soft; already set globally via `@layer base`).
- The b. brand palette is used for hero / marketing / editorial contexts where the sanctuary aesthetic should dominate. Semantic tokens are used for interactive components.

---

## 4. Typography

### 4.1 Font Families

Configured in `src/app/layout.tsx` and exposed via CSS vars:

| Variable | Font | Use |
|---|---|---|
| `--font-geist-sans` (Tailwind `font-sans`) | Geist Sans | Default body text |
| `--font-geist-mono` (Tailwind `font-mono`) | Geist Mono | Code, technical |
| `--font-dynapuff` (Tailwind `font-dynapuff`) | DynaPuff | Playful accents |
| `font-georgia` utility | Georgia, serif | Headings and brand `b.` marks |

Global rule in `globals.css`: **all `h1`–`h6` use Georgia by default**, and any element with the `font-georgia` class also gets Georgia. Navigation uses `font-georgia` for the editorial tone.

Note: `tailwind.config.ts` declares `sans: Inter` and `serif: Lora`, but the live CSS variables wire Geist + Georgia. **Geist + Georgia is what actually renders** — treat the Tailwind config values as legacy until reconciled.

### 4.2 Typesetting Rules

- Line height: **1.6–1.8** for body copy.
- Whitespace: extreme — aim for ~50% negative space on marketing/editorial pages.
- Hierarchy via size and weight sparingly. No all-caps "shouting."
- Long-form prose uses the `@tailwindcss/typography` plugin (`prose` classes).

---

## 5. Layout & Spacing

### 5.1 Container

Use `.b-nav-content` (defined in `globals.css`) for the standard centered container:
- `max-width: 1536px`
- Horizontal padding: `1rem` (mobile) → `2rem` (≥768px)
- Margin auto

Example (from `Header.tsx`):
```tsx
<div className="b-nav-content flex h-14 items-center justify-between">
```

### 5.2 Radii

`--radius: 0.625rem` (10px) is the base. Tailwind exposes:
- `rounded-sm` → `calc(var(--radius) - 4px)`
- `rounded-md` → `calc(var(--radius) - 2px)`
- `rounded-lg` → `var(--radius)` (10px)
- `rounded-xl` → `calc(var(--radius) + 4px)` (14px — Cards)
- `rounded-2xl` → `calc(var(--radius) + 8px)` (18px)
- `rounded-3xl` → `calc(var(--radius) + 12px)` (22px)
- `rounded-4xl` → `calc(var(--radius) + 16px)` (26px — large editorial cards per the "b." directive's 24px guidance)

Pills (nav CTAs): `rounded-full`.

### 5.3 Borders & Shadows

- Borders default to `border-border` (light `oklch(0.922 0 0)` / translucent white in dark).
- Shadows: use Tailwind's soft `shadow`, `shadow-sm`. Do **not** introduce hard `shadow-lg`+ unless for a specific elevated surface. Prefer ambient feel.

### 5.4 Header Pattern

- Sticky, `z-50`, `h-14`, `border-b border-border/40`
- Translucent background with backdrop blur: `bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60`

---

## 6. Motion

- Default transition: `transition-colors` for hovers; extend to `transition-all` for multi-property.
- Editorial durations lean slow (~300–500ms) per the "deep breath" philosophy.
- `tailwindcss-animate` plugin is available for keyframe utilities used by Radix primitives.
- 3D utilities (from `globals.css`): `perspective-1000`, `perspective-2000`, `preserve-3d`, `backface-hidden`, `rotate-y-180` — used by `ThreeDBook.tsx` and card flips.

---

## 7. Dark Mode

- Class-based (`class="dark"` on a parent). Toggle lives in `ThemeToggle.tsx`, wrapped by `ThemeProvider` in the root layout.
- `@custom-variant dark (&:where(.dark, .dark *))` in `globals.css` enables `dark:` variants.
- All semantic tokens auto-swap; brand `b-*` colors do **not** auto-swap — use dark-mode alternatives explicitly if needed (e.g. swap `b-sand` → `b-night`).

---

## 8. Component Conventions

### 8.1 File Layout

- shadcn primitives → `src/components/ui/` (`button.tsx`, `card.tsx`, `scroll-area.tsx`, `slider.tsx`)
- App components → `src/components/` (PascalCase filenames; kebab-case also present for newer work)
- Feature clusters → `src/components/admin/`, `blog/`, `news/`, `visual-profiler/`

### 8.2 Patterns to Follow

- Use `cn()` from `@/lib/utils` for every conditional class merge.
- Variants via `class-variance-authority` (`cva`) — see `button.tsx`.
- `asChild` support via `@radix-ui/react-slot` for composable primitives.
- Forwarded refs + `displayName` on every primitive component.
- Focus rings: `focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring`.
- Disabled state: `disabled:pointer-events-none disabled:opacity-50`.
- Inline SVGs get `[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0` on buttons.

### 8.3 Button Variants (from `src/components/ui/button.tsx`)

- `default` — `bg-primary text-primary-foreground shadow hover:bg-primary/90`
- `destructive` — `bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90`
- `outline` — `border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground`
- `secondary` — `bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80`
- `ghost` — `hover:bg-accent hover:text-accent-foreground`
- `link` — `text-primary underline-offset-4 hover:underline`

Sizes: `default` (h-9 px-4), `sm` (h-8 px-3 text-xs), `lg` (h-10 px-8), `icon` (h-9 w-9).

### 8.4 Card (from `src/components/ui/card.tsx`)

- `Card` — `rounded-xl border bg-card text-card-foreground shadow`
- `CardHeader` — `flex flex-col space-y-1.5 p-6`
- `CardTitle` — `font-semibold leading-none tracking-tight`
- `CardDescription` — `text-sm text-muted-foreground`
- `CardContent` — `p-6 pt-0`
- `CardFooter` — `flex items-center p-6 pt-0`

### 8.5 Navigation Link Pattern

```tsx
<Link href="/blog" className="transition-colors hover:text-foreground font-georgia">
  b.blog
</Link>
```

Newsletter CTA pill:
```tsx
<Link
  href="/subscribe"
  className="ml-2 px-6 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-full transition-all text-sm font-medium shadow-sm"
>
  Newsletter Signup.
</Link>
```

---

## 9. UX Rules of the Road

- **No dialog boxes** — they misbehave in Next.js. Use drawers, sheets, or inline patterns.
- **No alert()** — use toast (sonner-style) for feedback.
- **Server functions over API routes** for database work (Next.js 15 / App Router).
- **No face-forward stock photography** in imagery choices (social-comparison trigger). Favor texture and abstract nature.
- **Haptic feedback** (mobile) for grounding interactions like pulse selection — see `PulseSlider.tsx`.
- **Paginated over infinite** — content is finite and respects attention.

---

## 10. Authoritative Source Files

If any of the above seems stale, these files are the ground truth:

- `src/app/globals.css` — shadcn CSS variables, `@theme inline` mappings, b. palette, custom utilities
- `src/app/layout.tsx` — font wiring, providers, metadata shell
- `tailwind.config.ts` — legacy brand colors + font family declarations (note divergence from live CSS vars)
- `components.json` — shadcn CLI config
- `docs/ui_ux_directive.md` — original "b." aesthetic directive
- `src/components/ui/*` — canonical primitive implementations
- `src/components/Header.tsx` / `Footer.tsx` / `MobileNav.tsx` — live layout patterns

---

## 11. Known Inconsistencies

- `tailwind.config.ts` declares Inter/Lora but layout wires Geist + Georgia. Georgia is the rendered serif (via the `h1–h6, .font-georgia` rule).
- The b. directive calls for a `#F5F2EB` sand background, but the default `--background` is pure white (`oklch(1 0 0)`). Sand is applied opt-in via `bg-b-sand` on marketing/editorial surfaces rather than globally.
- `docs/ui_ux_directive.md` references `radius: 24px` cards — the closest token is `rounded-3xl` (22px) or `rounded-4xl` (26px).
