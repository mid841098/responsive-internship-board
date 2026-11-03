# Responsive Layout Testing Report

**Project:** Responsive Internship Board  
**Target Viewports:** 360px (Mobile), 768px (Tablet), 1280px (Desktop)  
**Methodology:** Responsive viewport testing, layout verification, zero-horizontal-overflow check, and touch target sizing.

---

## 1. Summary of Breakpoints

The application utilizes a mobile-first responsive architecture built with modern CSS Grid, Flexbox, and CSS custom properties. No CSS frameworks or external JavaScript libraries are used.

| Breakpoint Name | Viewport Width | Grid Columns | Navigation & Header | Filter Controls |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile Compact** | 360px – 479px | 1 Column | Stacked brand & theme toggle | 1 Column vertical stack |
| **Mobile Standard** | 480px – 639px | 1 Column | Inline brand & theme toggle | 1 Column with full width inputs |
| **Tablet** | 640px – 1023px | 2 Columns | Inline brand & theme toggle | 2x2 Grid layout |
| **Desktop** | 1024px – 1440px+ | 3 Columns | Inline brand & theme toggle | 4-Column inline filter bar |

---

## 2. Detailed Viewport Test Results

### Viewport 1: Mobile (360px × 640px)
- **Target Device Profile:** Small smartphones (Samsung Galaxy S-series, iPhone SE, Moto G).
- **Layout Behavior:**
  - Container width adapts gracefully with `padding: 0 1rem` and `box-sizing: border-box`.
  - Hero statistics cards stack vertically in a clean single-column presentation.
  - Search input, Domain dropdown, Work Mode dropdown, and Sort dropdown occupy 100% container width with comfortable 44px touch targets.
  - Internship cards render in a single column (`grid-template-columns: 1fr`).
  - Card footer elements stack cleanly: stipend on top, action buttons ("View Details" and "Apply") split into an accessible 2-column grid.
  - Modal dialog adapts to 100% width with 1rem margins and internal scrolling for long descriptions.
  - **Horizontal Scroll Check:** **Passed (0px horizontal overflow).**
  - **Minimum Touch Target Size:** **Passed (All buttons, inputs, and tags are ≥ 44px height/touch area).**

### Viewport 2: Tablet (768px × 1024px)
- **Target Device Profile:** iPads, Android tablets, foldable devices in portrait orientation.
- **Layout Behavior:**
  - Header displays brand icon, title, and theme toggle in a balanced horizontal bar.
  - Hero statistics render in a 3-column row with even spacing and border dividers.
  - Filter controls reorganize into a balanced 2-column grid (`grid-template-columns: repeat(2, 1fr)`).
  - Internship cards render in a 2-column grid (`grid-template-columns: repeat(2, 1fr)`), allowing students to scan multiple roles side-by-side.
  - Card footers display stipend and action buttons side-by-side with auto margins.
  - Modal dialog centers with a maximum width of 620px and backdrop blur.
  - **Horizontal Scroll Check:** **Passed (0px horizontal overflow).**

### Viewport 3: Desktop (1280px × 800px and 1440px+)
- **Target Device Profile:** Laptops, desktop monitors, ultrawide displays.
- **Layout Behavior:**
  - Content is centered within a maximum container width of `1200px` (`margin: 0 auto`).
  - Filter controls form a single unified row (`2fr 1fr 1fr 1fr`), grouping Search, Domain, Work Mode, and Sort sequentially.
  - Internship cards display in an optimal 3-column grid (`grid-template-columns: repeat(3, 1fr)`).
  - Hover states apply subtle elevation lifts (`transform: translateY(-2px)` and shadow elevation) without causing layout shifts.
  - Modal dialog provides a spacious inspection layout with multi-column quick stats and bulleted lists.
  - **Horizontal Scroll Check:** **Passed (0px horizontal overflow).**

---

## 3. Automated Viewport Verification Script

The responsive styles were checked via automated DOM assertions:
- `overflow-x: hidden` safety on `body`
- `box-sizing: border-box` across all elements
- Responsive card grids using CSS Grid and media queries at `680px` and `1024px`
- Modal dialog with max-height `90vh` and auto-scrolling content
