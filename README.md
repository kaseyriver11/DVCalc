# DVC Companion App — Core Architecture & Design Rules

## 🛑 MANDATORY DESIGN GUARDRAILS (NON-NEGOTIABLE)

1. **Mobile-First App Experience (Zero "Web-First" Defaults):**
   - This is a **mobile-first PWA / web app**, NOT a desktop website. 
   - Never use wide desktop data tables (`<table>`) on mobile viewports. Always switch to responsive card stacks, vertical feeds, or touch-friendly grid modules below 768px.
   - Every layout must be fully responsive and optimized for thumb-driven mobile interaction out of the box.

2. **Custom UI Components Only (NO Native Selects):**
   - **NEVER** use plain native `<select>` dropdowns for user-facing controls. 
   - Always use our custom dropdown component architecture (`.custom-select`, custom triggers, and styled dropdown wrappers) to ensure a unified, premium look across mobile and desktop.

3. **Touch-First Interactions (No Hover-Only Reveals):**
   - Mobile touch screens do not have cursors, so **no tooltip, status explanation, or color-code definition may depend on `:hover` alone** to be reachable.
   - Hover is fine to keep for desktop mouse users -- the requirement is that a tap on a touch device must reveal the same content, not that hover be removed. Concretely: every hover-revealed element also gets a `.tap-open` class toggled by a page-level `click` delegate (`e.target.closest(...)`, add `tap-open` to the tapped anchor, remove it from every other open one, clear all on `Escape`). This is already implemented for `.tooltip-anchor`/`.tooltip-card` (`tokens.css` + the delegate in `app.js`, `compare.html`) and for `contractvalue.html`'s own `[data-tip]` mechanism. New tooltip-style UI must follow the same pattern rather than inventing another one.
   - Never make the tap handler *toggle* the same anchor closed on a second tap on it directly -- always-add-on-tap, clear-others-on-tap-elsewhere is the documented fix for a real past bug ("click-stuck hovers") where toggle logic could re-close a tooltip a synthetic mobile hover had just opened.

4. **Design System & Styling Consistency:**
   - Adhere strictly to the project's CSS variables and design tokens (`tokens.css`).
   - Maintain our glassmorphic card styling (`border-radius`, soft elevation shadows, and primary/secondary gradient headers). Never revert to generic gray form styling or unstyled browser defaults.
