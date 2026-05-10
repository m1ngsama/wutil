---
name: wutil
description: Fast, private browser-only web utilities with a warm editorial interface.
colors:
  accent: "#9a3412"
  accent-hover: "#7c2d12"
  accent-subtle: "#ffedd5"
  accent-fg: "#ffffff"
  canvas: "#fafaf9"
  surface: "#ffffff"
  muted: "#f5f5f4"
  ink: "#1c1917"
  ink-2: "#374151"
  ink-3: "#4b5563"
  dark-accent: "#fdba74"
  dark-canvas: "#11100f"
  dark-surface: "#1c1917"
typography:
  display:
    fontFamily: "Abril Fatface, Georgia, serif"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "normal"
  body:
    fontFamily: "Mulish, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 400
    lineHeight: 1.6
  mono:
    fontFamily: "Geist Mono, ui-monospace, Cascadia Code, monospace"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-fg}"
    rounded: "{rounded.xl}"
    height: "44px"
    padding: "0 16px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "36px"
    padding: "0 16px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "20px"
---

# Design System: wutil

## 1. Overview

**Creative North Star: "The Useful Reference Desk"**

wutil should feel like a warm editorial reference surface wrapped around practical tools. The design is not a marketing shell and not a developer dashboard. It is a working page with a clear name, a compact explanation, and the controls needed to finish the job.

The system uses strong display typography for page identity, warm tinted neutrals for calm focus, and a terracotta accent for important actions. Decorative effects are restrained. The experience should read as confident and human, not templated or trendy.

**Key Characteristics:**
- Editorial mastheads with direct tool names.
- Warm light theme as the default daytime utility setting.
- Compact controls and generous working areas.
- Clear local-first privacy signals where trust matters.
- Dark theme support that preserves warmth rather than shifting to blue-black.

## 2. Colors

The palette is warm, restrained, and utility-first: terracotta carries action, while tinted neutrals carry most of the interface.

### Primary

- **Terracotta Action** (`#9a3412`): Primary calls to action, selected segmented controls, action links, and important numeric values.
- **Deep Terracotta Hover** (`#7c2d12`): Hover state for primary actions.
- **Soft Amber Wash** (`#ffedd5`): Subtle accent backgrounds and low-pressure emphasis.

### Neutral

- **Warm Canvas** (`#fafaf9`): Page background in light mode.
- **Paper Surface** (`#ffffff`): Tool panels, inputs, and bounded surfaces.
- **Stone Muted** (`#f5f5f4`): Secondary panels, read-only outputs, list headers, and soft hover states.
- **Warm Ink** (`#1c1917`): Primary text.
- **Quiet Ink** (`#374151`): Supporting copy.
- **Muted Ink** (`#4b5563`): Labels, hints, secondary navigation, and metadata.

### Dark Theme

- **Dark Canvas** (`#11100f`): Warm near-black page background.
- **Dark Surface** (`#1c1917`): Raised surfaces.
- **Amber Action** (`#fdba74`): Primary action color in dark mode.

### Named Rules

**The Rare Accent Rule.** Terracotta should be memorable because it is scarce. Use it for actions, selected states, and key values, not as a page-wide wash.

**The Warm Neutral Rule.** New neutrals should stay slightly warm. Avoid cold blue-gray defaults.

## 3. Typography

**Display Font:** Abril Fatface with Georgia fallback.
**Body Font:** Mulish with system sans fallback.
**Label/Mono Font:** Geist Mono for technical values, hashes, timestamps, encoded text, and code-like output.

**Character:** The pairing gives each tool a named editorial presence while keeping controls and descriptions approachable.

### Hierarchy

- **Display** (400, 2.25rem to 3rem, line-height 1): Tool names, homepage identity, and major page titles.
- **Headline** (600, 1.25rem to 1.5rem, tight line-height): Section titles and prominent results.
- **Title** (600, 1rem, tight line-height): Card titles, grouped controls, and panel headings.
- **Body** (400, 0.875rem to 1rem, line-height 1.6): Descriptions, help copy, privacy text, and changelog content.
- **Label** (600, 0.625rem to 0.75rem, uppercase, expanded tracking): Categories, field labels, metadata, and small navigation.
- **Mono** (400 to 700, 0.875rem to 1.125rem): Inputs and outputs where character fidelity matters.

### Named Rules

**The Masthead Rule.** Every public tool page should lead with a short uppercase category, an Abril Fatface tool name, and one useful sentence.

## 4. Elevation

wutil is mostly flat. Depth is conveyed through warm surfaces, borders, state changes, and spacing rather than heavy shadows. Shadows are allowed for tiny tactile controls such as toggles, but broad panels should stay quiet.

### Shadow Vocabulary

- **Toggle Thumb Shadow** (`shadow` utility): Small control affordance only.

### Named Rules

**The Flat Panel Rule.** Cards and tool panels use borders and tonal backgrounds at rest. Do not add decorative shadows to repeated surfaces.

## 5. Components

Components should feel practical, compact, and readable. They should make the next action obvious without instructional filler.

### Buttons

- **Shape:** Mostly rounded medium to extra-large (`6px` to `12px`), depending on control size.
- **Primary:** Terracotta background, light foreground, semibold label, 36px to 44px height.
- **Hover / Focus:** Darker terracotta on hover, visible focus ring using `--w-ring`, no layout movement.
- **Secondary / Ghost:** Border or transparent backgrounds with warm ink text and muted hover backgrounds.

### Chips

- **Style:** Border plus warm surface or muted background.
- **State:** Selected states use terracotta fill with accent foreground. Unselected states remain calm and bordered.

### Cards / Containers

- **Corner Style:** `12px` for tool panels, upload zones, result cards, and major bounded surfaces.
- **Background:** Paper surface for editable controls, muted surface for read-only outputs or headers.
- **Shadow Strategy:** No broad shadows at rest.
- **Border:** `border-edge` by default, `border-edge-strong` for hover or active emphasis.
- **Internal Padding:** 16px to 24px for tool panels, larger padding for upload zones.

### Inputs / Fields

- **Style:** Warm surface or canvas background, thin border, mono font for technical text.
- **Focus:** 2px focus ring using `--w-ring`, with ring offset when needed.
- **Error / Disabled:** Error states use red border plus explicit text. Disabled states reduce opacity and block pointer interaction.

### Navigation

The top nav is sticky, compact, and quiet. The logo uses display typography; secondary labels are small uppercase text. Navigation should not compete with the tool.

## 6. Do's and Don'ts

Do:

- Keep the first viewport focused on the working tool.
- Use Abril Fatface for page identity, not for dense controls.
- Keep action color scarce and meaningful.
- Preserve keyboard flow, focus visibility, and mobile no-overflow behavior.
- Prefer precise labels over explanatory paragraphs.

Don't:

- Do not use generic SaaS blue-gray styling.
- Do not add gradient text, glassmorphism, glow effects, or side-stripe card accents.
- Do not nest cards inside cards.
- Do not turn tool pages into landing pages before the user can work.
- Do not use decorative shadows as a substitute for hierarchy.
