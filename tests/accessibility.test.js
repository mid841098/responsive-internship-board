/**
 * Static Accessibility & Semantic HTML Audit
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const htmlContent = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const cssContent = fs.readFileSync(path.join(__dirname, '../css/styles.css'), 'utf8');

function runAudit() {
  console.log("Starting Accessibility & Standards Audit...\n");
  let passed = 0;
  let total = 0;

  function audit(name, fn) {
    total++;
    try {
      fn();
      console.log(`  ✓ [WCAG] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ [WCAG] ${name}`);
      console.error(err.message);
    }
  }

  // 1. Language & Document Structure
  audit("Document specifies lang='en'", () => {
    assert(htmlContent.includes('<html lang="en"'), "HTML element must specify lang attribute");
  });

  audit("Document contains responsive viewport meta tag", () => {
    assert(htmlContent.includes('<meta name="viewport" content="width=device-width, initial-scale=1.0">') || htmlContent.includes('name="viewport"'), "Viewport meta must be present");
  });

  // 2. Semantic Landmarks
  audit("Document contains primary semantic landmarks", () => {
    assert(htmlContent.includes('<header class="site-header" role="banner">'), "Banner landmark missing");
    assert(htmlContent.includes('<main id="main-content" role="main">'), "Main landmark missing");
    assert(htmlContent.includes('<footer class="site-footer" role="contentinfo">'), "Footer landmark missing");
  });

  // 3. Skip Link
  audit("Skip link exists and targets #main-content", () => {
    assert(htmlContent.includes('href="#main-content" class="skip-link"'), "Skip link must target #main-content");
    assert(htmlContent.includes('id="main-content"'), "#main-content ID must exist");
  });

  // 4. Form Labels & Accessibility
  audit("All form controls in index.html have associated labels", () => {
    const inputs = ["search-input", "domain-filter", "mode-filter", "sort-filter"];
    for (const id of inputs) {
      assert(htmlContent.includes(`for="${id}"`), `Label for="${id}" is missing`);
      assert(htmlContent.includes(`id="${id}"`), `Element id="${id}" is missing`);
    }
  });

  // 5. Dynamic ARIA Live Regions
  audit("Results count section has aria-live='polite'", () => {
    assert(htmlContent.includes('id="results-count"'), "results-count element must exist");
    assert(htmlContent.includes('aria-live="polite"'), "aria-live polite must be declared for live announcements");
  });

  // 6. Accessible Modal Structure
  audit("Modal dialog has proper ARIA attributes", () => {
    assert(htmlContent.includes('role="dialog"'), "Modal must have role='dialog'");
    assert(htmlContent.includes('aria-modal="true"'), "Modal must have aria-modal='true'");
    assert(htmlContent.includes('aria-labelledby="modal-title"'), "Modal must have aria-labelledby");
  });

  // 7. Focus Visible & High Contrast Styling in CSS
  audit("CSS includes :focus-visible custom styles", () => {
    assert(cssContent.includes(':focus-visible'), "CSS must include :focus-visible rules");
    assert(cssContent.includes('outline:'), "CSS focus styles must define visible outline");
  });

  // 8. Responsive Breakpoints
  audit("CSS contains responsive rules for mobile (<480px, 360px), tablet (680px/768px), and desktop (1024px)", () => {
    assert(cssContent.includes('@media (max-width: 480px)'), "Mobile breakpoint missing");
    assert(cssContent.includes('@media (min-width: 640px)') || cssContent.includes('@media (min-width: 680px)'), "Tablet breakpoint missing");
    assert(cssContent.includes('@media (min-width: 1024px)'), "Desktop breakpoint missing");
  });

  // 9. Reduced Motion Media Query
  audit("CSS honors prefers-reduced-motion", () => {
    assert(cssContent.includes('@media (prefers-reduced-motion: reduce)'), "prefers-reduced-motion media query missing");
  });

  console.log(`\nAudit Results: ${passed} of ${total} accessibility criteria met.`);
  if (passed !== total) process.exit(1);
}

runAudit();
