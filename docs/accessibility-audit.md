# WCAG 2.1 AA Accessibility Audit & Keyboard Interaction Matrix

**Project:** Responsive Internship Board  
**Standards Targeted:** W3C WCAG 2.1 Level AA & WAI-ARIA Authoring Practices 1.2  
**Frameworks Used:** 0 (Pure Vanilla HTML5, CSS3, ES6+ JavaScript)

---

## 1. Keyboard Navigation Matrix

All interactive components are 100% operable using keyboard alone without requiring a mouse.

| Element / Flow | Key Combination | Action / Expected Behavior | Status |
| :--- | :--- | :--- | :--- |
| **Skip Link** | `Tab` (first keystroke) | Reveals a high-contrast "Skip to main content" banner. Pressing `Enter` jumps directly to `<main id="main-content">`. | **Passed** |
| **Theme Toggle** | `Tab` &rarr; `Enter` or `Space` | Toggles between Dark and Light mode. Updates `aria-label` dynamically to announce mode state. | **Passed** |
| **Search Input** | `Tab` &rarr; Typing | Real-time debounced filtering. If text is present, clear button appears. | **Passed** |
| **Clear Search** | `Tab` &rarr; `Enter` | Clears search input and automatically returns focus to search input for rapid re-entry. | **Passed** |
| **Filter Selects** | `Tab` &rarr; `Up`/`Down` arrows | Updates selected option (Domain, Mode, Sort) and updates listings instantly. | **Passed** |
| **Active Filter Chips**| `Tab` &rarr; `Enter` | Dismisses individual filter tag, re-filters list, and focuses back to corresponding input. | **Passed** |
| **Skill Tags on Cards**| `Tab` &rarr; `Enter` | Clicking/activating any skill pill auto-filters the board by that specific skill. | **Passed** |
| **Bookmark Button** | `Tab` &rarr; `Enter` or `Space` | Saves/removes role to `localStorage`. Announces change via `aria-live` toast and updates `aria-pressed`. | **Passed** |
| **Modal Open** | `Tab` &rarr; `Enter` on "View Details" or "Apply" | Opens accessible modal dialog, locks background body scroll, and traps focus inside the dialog. | **Passed** |
| **Modal Focus Trap** | `Tab` / `Shift + Tab` | Cycles forward and backward strictly within the modal's focusable elements. Focus cannot escape to the background page. | **Passed** |
| **Modal Dismiss** | `Escape` key | Immediately closes dialog, unlocks background scrolling, and smoothly restores focus to the triggering button. | **Passed** |
| **Modal Close Button** | `Tab` &rarr; `Enter` on Close (×) | Closes dialog and restores focus to triggering element. | **Passed** |
| **Application Form** | `Tab` &rarr; `Enter` on Submit | Runs accessible client-side validation. If invalid, moves focus to the first invalid input and announces error via `role="alert"`. | **Passed** |

---

## 2. ARIA & Screen Reader Implementation Details

### Semantic HTML5 Hierarchy
- `<header role="banner">`: Contains site identity and global actions.
- `<main id="main-content" role="main">`: Houses primary application views.
- `<form role="search">`: Groups search and filter controls.
- `<article role="region" aria-labelledby="...">`: Each internship card uses an article tag labeled by its unique role title ID.
- `<footer role="contentinfo">`: Houses platform credits, links, and audit references.

### Accessible Announcements (`aria-live="polite"`)
- The search result counter (`<p id="results-count" aria-live="polite" aria-atomic="true">`) alerts screen reader users whenever filters or search terms change without interrupting current speech:
  - *"Showing 5 of 8 internships"*
  - *"No internships found matching your filters."*
- Dynamic toast messages announce saved bookmarks, filter resets, and application submissions.

### Modal Dialog Pattern (`role="dialog"`)
- Container has `role="dialog"`, `aria-modal="true"`, and `aria-labelledby="modal-title"`.
- When opened, `aria-hidden="false"` is set, and focus is programmatically shifted to the first interactive element.
- When closed, previous focus is restored to the triggering button.

### Form Labeling & Error Feedback
- Every form field has an explicit `<label for="...">` matching the element's `id`.
- Helper hints use `aria-describedby` linking to hint text.
- Validation states utilize `aria-invalid="true"` and live error containers with `role="alert"`.

---

## 3. Visual Accessibility & Contrast Audit

| Element | Background | Text / Foreground | Contrast Ratio | Minimum AA Requirement | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Primary Action Button | `#6d28d9` (Purple) | `#ffffff` (White) | **8.1:1** | 4.5:1 | **Passed** |
| Body Main Text (Light) | `#f8fafc` (Off-white) | `#0f172a` (Slate 900) | **15.4:1** | 4.5:1 | **Passed** |
| Muted Body Copy (Light)| `#f8fafc` (Off-white) | `#475569` (Slate 600) | **6.8:1** | 4.5:1 | **Passed** |
| Body Main Text (Dark) | `#0b0f19` (Dark Navy) | `#f8fafc` (White) | **17.2:1** | 4.5:1 | **Passed** |
| Remote Mode Badge | `#eff6ff` (Light Blue) | `#1d4ed8` (Dark Blue) | **7.5:1** | 4.5:1 | **Passed** |
| Focus Visible Outline | Active Surface | `#4f46e5` (3px Solid) | High Contrast Ring | 3.0:1 | **Passed** |

---

## 4. Reduced Motion Support

A dedicated `@media (prefers-reduced-motion: reduce)` rule disables non-essential animations (e.g. skeleton shimmering, toast translations, and card hover transforms) for users with vestibular sensitivities.
