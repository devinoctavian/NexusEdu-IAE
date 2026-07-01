---
version: alpha
name: NexusEdu Warm Academic
description: Warm-neutral academic dashboard system for a university SOA/ESB platform. Notion's warmth, Cal.com's restraint.
colors:
  primary: "#2A2420"
  secondary: "#6B6258"
  tertiary: "#B5651D"
  neutral: "#F7F3EC"
  surface: "#FDFBF7"
  border: "#E8E1D4"
  success: "#4D7C5F"
  error: "#A33B2E"
  warning: "#C2941A"
  info: "#4C6B8A"
typography:
  display:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.01em
  h1:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.25
  h2:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: 600
    lineHeight: 1.3
  h3:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.35
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 500
    letterSpacing: 0.02em
  mono:
    fontFamily: "JetBrains Mono"
    fontSize: 14px
    fontWeight: 400
rounded:
  sm: 6px
  md: 10px
  lg: 16px
  pill: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
components:
  button-primary:
    background: tertiary
    text: neutral
    rounded: sm
  button-secondary:
    background: surface
    border: border
    text: primary
    rounded: sm
  card:
    background: surface
    border: border
    rounded: md
  input:
    background: surface
    border: border
    rounded: sm
  badge:
    rounded: pill
---

## Overview

NexusEdu is a daily-use academic dashboard, not a marketing site. Students and staff open it
between classes, on phones in hallways, at 2am checking grades. The visual job is to feel calm,
legible, and a little personal — like a well-organized notebook, not a SaaS pitch deck.

The reference feel is **Notion's warmth crossed with Cal.com's restraint**: warm paper tones and
generous whitespace from Notion, but Cal.com's discipline — no decorative flourishes, no busywork,
every element earns its place. The product should feel like it was made by people who use it
themselves, not licensed from a template marketplace.

**Explicitly rejected:** the cream-background-plus-serif-plus-terracotta look that most AI design
tools default to. That combination is a *cliché*, not a choice — DESIGN.md uses warm tones and an
orange-adjacent accent too, but pairs them with a single disciplined sans-serif (no serif display
face anywhere) and a much more restrained, denser layout than that genre implies. If output starts
looking like a coffee-brand landing page, that's the wrong direction — pull back toward Cal.com's
density and quiet.

## Colors

The palette is warm-neutral with exactly one accent. Four roles, no more:

- **primary** (`#2A2420`, warm near-black) — all body text, headings, primary icons. Never pure
  black (`#000`) — warm ink only.
- **secondary** (`#6B6258`, warm gray) — secondary text, placeholder text, disabled states, inactive
  icons. This is the workhorse neutral; most of the UI's "quiet" content uses this, not primary.
- **tertiary** (`#B5651D`, burnt orange) — the *only* accent color in the entire system. Reserved
  exclusively for: primary CTAs, active nav state, focus rings, and data-positive highlights (e.g.
  "3 new grades posted"). If you find yourself reaching for tertiary on more than one element per
  screen, that's a signal to step back — the accent works because it's rare.
- **neutral** (`#F7F3EC`, warm paper) — page background. Never pure white.
- **surface** (`#FDFBF7`) — cards, modals, table rows, anything that sits "on top of" the page
  background. Slightly warmer/lighter than neutral so elevation reads through color, not just shadow.
- **border** (`#E8E1D4`) — all dividers and component borders. Always this warm tone, never gray-200
  or a default Tailwind gray.

Semantic colors are deliberately desaturated and distinct from tertiary so status signals never get
confused with the brand accent: **success** (`#4D7C5F`, muted sage — payment confirmed, enrollment
successful), **error** (`#A33B2E`, muted brick — distinct hue from tertiary's orange, not just a
darker version of it), **warning** (`#C2941A`, muted gold — attendance below threshold, due date
approaching), **info** (`#4C6B8A`, muted slate blue — neutral system messages).

**Anti-pattern check:** no purple, no indigo, no Tailwind default `blue-600`/`indigo-600` anywhere —
those read as "untouched framework defaults," the single fastest tell of an undesigned product.

## Typography

One typeface family, **Inter**, used at every text role. This is a deliberate restraint, not a
shortcut: Cal.com's simplicity comes partly from refusing to mix display and body faces when the
content doesn't call for that drama — an academic dashboard is read constantly, not browsed once,
so typographic consistency matters more than personality-through-pairing.

Weight and size carry the hierarchy instead of font-mixing: `display` (700, 40px) is reserved for
the dashboard's single hero number or greeting ("Selamat pagi, Devin") — used once per page, max.
`h1`–`h3` step down through section and card titles. `body-md` is the default reading size; `body-sm`
is for metadata (timestamps, captions, table secondary lines). `label` (uppercase, tracked) is for
form labels and table column headers only — never body copy.

`mono` (**JetBrains Mono**) is the one deliberate exception, reserved for NIM, course codes, invoice
numbers, and transaction IDs — anything the user might copy-paste or visually scan character-by-character.
Using mono here is functional, not decorative: it disambiguates `0` from `O` and `1` from `l` in IDs
students actually need to read correctly.

## Spacing & Layout

4px base unit, scaling `4 / 8 / 16 / 24 / 32 / 48 / 64`. Default component padding is `md` (16px);
section gaps are `lg` or `xl`. Favor generous whitespace over dense grids — this is the Notion half
of the brief — but keep data tables tight (`sm`/`md` row padding only) since tabular data is where
Cal.com's density-over-decoration instinct should win instead.

Corner radius scale is restrained: `sm` (6px) for buttons/inputs, `md` (10px) for cards, `lg` (16px)
for modals/large containers, `pill` only for status badges and avatars. Never use radius above 16px
on anything — large "bubble" radii are an AI-slop tell.

## Components

Buttons: primary action uses `tertiary` background with `neutral` text, `sm` radius — flat, no
gradient, no glow. Secondary buttons are `surface` background with a `border` outline and `primary`
text — never a ghost/transparent button with only colored text, which reads as unfinished. One
primary button per view, maximum.

Cards: `surface` background, `border` outline, `md` radius. Shadow is optional and must be subtle —
if used, tint it warm (a low-opacity version of `primary`, not pure black) so elevation feels
consistent with the palette rather than generic.

Inputs: `surface` background, `border` outline at rest, `tertiary` border + ring on focus. Labels
always visible above the field — no placeholder-as-label pattern, which fails accessibility and
reads as a shortcut.

Tables: used heavily (grades, invoices, loans, attendance). Header row uses `label` typography on
`neutral` background; rows alternate `surface`/`neutral` only if the table exceeds ~8 rows, otherwise
flat `surface` is cleaner.

## Iconography

Icon library: a single consistent set (e.g. Lucide) at one stroke weight throughout — never mix icon
sets. Icons are functional, not decorative: every icon must sit next to a text label except in
universally-understood cases (close ✕, search, chevrons for collapse/expand). No icon-only buttons
for primary actions like "Submit" or "Pay" — students should never have to guess what a glyph means
in a context like tuition payment.

**Explicitly forbidden:** emoji in the UI (no 🎓 next to "Academic," no 💰 next to "Tagihan"). This
is academic software handling grades and money, not a consumer social app — emoji here reads as
unserious and is one of the clearest AI-slop signals named in current design guidance.

## Motion

Minimal and functional only: 150–200ms ease-out for hover/focus state changes, a single subtle
fade/slide (150ms) for modal/drawer entry, skeleton loaders (not spinners) for data fetching given
how data-heavy this dashboard is. No page-load animation sequences, no scroll-triggered reveals, no
parallax — those serve marketing sites, not a tool students open dozens of times a week. Respect
`prefers-reduced-motion` everywhere.

## Accessibility

WCAG AA minimum on all text/background pairs — `primary` on `neutral`/`surface` passes comfortably;
verify `tertiary` (`#B5651D`) against `neutral` text usage stays at large-text/UI-component sizes
where the lower contrast ratio is acceptable, and never use tertiary as a small-text color on its
own background. Visible keyboard focus ring (`tertiary`-colored, 2px) on every interactive element,
no exceptions. Every form input has a real `<label>`, not just a placeholder.

## Agent Prompt Guide

When generating UI for this project:
1. Pull every color and type value from the YAML front matter above — never invent a hex value or
   reach for a Tailwind default color name.
2. `tertiary` (burnt orange) is the only accent — if a screen needs a second "pop" color, that's a
   sign to reconsider the layout, not to add a new color.
3. No emoji, no gradients, no serif display face, no decorative blobs/shapes, no glassmorphism.
4. Default to Inter everywhere except `mono` contexts (IDs, codes).
5. One primary button per screen. State that constraint back if a design seems to need two.
6. If unsure whether something feels "on-brand," check it against the anti-pattern list in Overview
   before shipping it.