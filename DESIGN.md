---
name: wutil
description: Fast, private browser-only web utilities with a warm, typography-led interface.
colors:
  accent: "#9a3412"
  accent-hover: "#7c2d12"
  accent-subtle: "#ffedd5"
  accent-fg: "#ffffff"
  canvas: "#fafaf9"
  surface: "#ffffff"
  muted: "#f5f5f4"
  ink: "#1c1917"
  ink-2: "#44403c"
  ink-3: "#57534e"
  dark-accent: "#fdba74"
  dark-canvas: "#11100f"
  dark-surface: "#1c1917"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
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

wutil is a warm, quiet working interface. It is not a marketing shell or a developer dashboard. Each page has a clear name, a compact explanation, and the controls needed to finish the job.

Typography, spacing, and alignment establish hierarchy before borders or color. A single interface family connects headings with controls; technical content stays monospaced. Warm neutrals support long working sessions, and terracotta marks the primary action.

**Key Characteristics:**
- Direct tool names with restrained, readable headings.
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
- **Quiet Ink** (`#44403c`): Supporting copy.
- **Muted Ink** (`#57534e`): Labels, hints, secondary navigation, and metadata.

### Dark Theme

- **Dark Canvas** (`#11100f`): Warm near-black page background.
- **Dark Surface** (`#1c1917`): Raised surfaces.
- **Amber Action** (`#fdba74`): Primary action color in dark mode.

### Named Rules

**The Rare Accent Rule.** Terracotta should be memorable because it is scarce. Use it for actions, selected states, and key values, not as a page-wide wash.

**The Warm Neutral Rule.** New neutrals should stay slightly warm. Avoid cold blue-gray defaults.

## 3. Typography

**Interface Font:** Inter variable, using its text optical size and system sans fallback, serves headings, descriptions, labels, and controls. Only the weight axis is shipped. `next/font` self-hosts the font; visitors do not request fonts from Google.
**Technical Font:** Geist Mono serves technical values, hashes, timestamps, encoded text, and code-like output. System fonts provide missing scripts, including Chinese.

### Hierarchy

- **Homepage title** (600, 2.5rem to 3.25rem, line-height 1.1): Compact identity above the tool directory.
- **Page title** (`.page-title`, 600, 1.875rem to 2.5rem, line-height 1.15): Tool names and public page headings.
- **Section title** (`.section-title`, 600, 1.25rem, line-height 1.4): Directory sections.
- **Title** (600, 1rem, line-height 1.4): Tool links and prominent grouped content.
- **Body** (400, 0.875rem to 1rem, line-height 1.6): Descriptions and help copy.
- **Control** (500, 0.875rem): Buttons and field labels in sentence case.
- **Metadata** (400 to 500, 0.75rem to 0.8125rem): Counts, categories, and secondary status.
- **Mono** (400 to 700, 0.875rem to 1.125rem): Inputs and outputs where character fidelity matters; touch inputs remain at least 1rem.

### Named Rules

**The Reading Order Rule.** Headings identify the task without overpowering its controls. Use sentence case for labels and metadata; do not use small uppercase text with expanded tracking as a default hierarchy device. Tight tracking belongs only on large Latin headings, not technical input.

**The Fidelity Rule.** Mixed-script typography must not change user content. Never insert spaces, replace punctuation, or normalize characters in tool input merely to improve appearance.

**The Content Rule.** Keep one useful explanation per task. Do not repeat categories, privacy promises, or idle-state narration around the workspace. Show feedback when the state changes, and reserve popularity claims for measured usage.

**The Proximity Rule.** Keep examples beside their actions and errors beside their inputs. Group personal shortcuts more tightly than the full directory. Progress belongs inside the action area, not in another card.

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
- **Primary:** Terracotta background, light foreground, medium 14px label, 36px to 44px height.
- **Hover / Focus:** Darker terracotta on hover, visible focus ring using `--w-ring`, no layout movement.
- **Secondary / Ghost:** Border or transparent backgrounds with warm ink text and muted hover backgrounds.

### Interface Icons

Use the selected Ionicons SVGs bundled locally under their MIT license. Use outline symbols for actions and distinct filled artwork for selected favorites and notification states. Match optical weight to adjacent text; most actions use 16–18px symbols and directory entries use 20px. Keep labels for actions that a symbol alone cannot explain. Decorative SVGs are hidden from assistive technology. Icon-only buttons have accessible names and 44px targets. Success symbols describe completed work, not a selected file or an outdated result.

### Chips

- **Style:** Border plus warm surface or muted background.
- **State:** Category filters use neutral ink for selection. Task-specific segmented controls may use terracotta; unselected states remain quiet.

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

The top nav is sticky, compact, and quiet. The wordmark uses bold Inter with modest tight tracking. Secondary navigation uses readable sentence-case text and does not compete with the tool.

## 6. Do's and Don'ts

Do:

- Keep the first viewport focused on the working tool.
- Build hierarchy with readable type, spacing, and deliberate weight changes.
- Keep action color scarce and meaningful.
- Preserve keyboard flow, focus visibility, and mobile no-overflow behavior.
- Prefer precise labels over explanatory paragraphs.

Don't:

- Do not use generic SaaS blue-gray styling.
- Do not add gradient text, glassmorphism, glow effects, or side-stripe card accents.
- Do not nest cards inside cards.
- Do not turn tool pages into landing pages before the user can work.
- Do not use decorative shadows as a substitute for hierarchy.
