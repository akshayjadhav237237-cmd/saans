# ADR 0006: Accessible Design System and Dual-Signal Air Quality Components

## Status

Accepted

## Context

During severe winter smog pollution episodes in urban centers, critical air quality readings and personal exposure budgets must be universally intelligible and accessible across all user groups. Target users include distressed parents, seniors with age-related visual impairments, screen-reader users, and non-English speakers.

Traditional environmental applications suffer from critical accessibility defects: they communicate hazard levels solely through color (e.g. green-to-red gradients), locking out individuals with color vision deficiencies; they use canvas or heavy chart libraries that hide numerical data from screen readers; and they rely on massive third-party UI component packages that bloat bundle sizes and introduce keyboard focus traps.

## Decision

1. **Lightweight In-House Design System**: We created an accessible component library under `src/shared/` without external UI or chart dependencies: `Button`, `Field`, `Select`, `Toggle`, `Notice`, `Card`, `Section`, `VisuallyHidden`, `SkipLink`, `BandBadge`, `Spinner`, `Chart`, and semantic SVG icons (`src/shared/icons.tsx`).
2. **Dual-Signal Hazard Communication**: Air quality bands are never communicated solely through color. Every AQI indicator (`src/shared/BandBadge.tsx`) simultaneously combines:
   - WCAG-compliant color backgrounds and borders.
   - Distinct geometric SVG icon shapes (e.g. circles, alert triangles, octagons, and shields).
   - Explicit textual band labels (e.g. "Unhealthy for Sensitive Groups", "Hazardous").
3. **WCAG 2.1 AA Contrast Ratios**: Color palette tokens in `src/index.css` are mathematically tested using relative luminance calculations. All typography pairs exceed the 4.5:1 ratio for normal text, and all interactive controls and focus rings exceed 3.0:1 UI contrast (`tests/contrast.test.ts`).
4. **Accessible Charting with Semantic Table Alternative**: The 24-hour diurnal air trend chart (`src/shared/Chart.tsx`) uses semantic inline SVG with accessible `role="img"`, `<title>`, and `<desc>` elements. It provides an immediate interactive button toggle that swaps the visual graph with an accessible HTML `<table>` displaying exact hourly PM2.5 and AQI values.
5. **Keyboard Operability and Landmark Navigation**:
   - The shell (`src/app/App.tsx`) incorporates standard HTML5 landmarks (`banner`, `navigation`, `main`, `contentinfo`).
   - A skip-to-content link (`src/shared/SkipLink.tsx`) allows keyboard-only users to bypass navigation directly to `#main-content`.
   - All interactive controls feature visible 2px teal focus rings with 2px offsets and meet touch target minimums (>= 44x44px).
   - Reduced-motion media queries (`prefers-reduced-motion`) disable all continuous spinning animations and layout transitions.
6. **Native English and Hindi Localization**: Complete bilingual interface with 100% dictionary key parity between English and Hindi (`src/i18n/`), automatically synchronizing `document.documentElement.lang` on language toggle (`tests/i18n.test.ts`).

## Consequences

- **Complete Accessibility Inclusion**: Colorblind and low-vision individuals receive clear hazard signals via text, geometry, and contrast.
- **Screen Reader Parity**: Diurnal trends and exposure budgets are fully consumable through semantic data tables and ARIA live announcements.
- **Ultra-Small Asset Footprint**: Eliminating heavy charting and icon libraries preserves an initial JavaScript bundle size under 150 KB gzipped.
