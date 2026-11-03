/**
 * Accessible Modal Service
 * Compliant with WAI-ARIA Dialog (Modal) pattern with focus trapping,
 * ESC key handling, background scroll-lock, and focus restoration.
 */

class AccessibleModalService {
  constructor() {
    this.overlay = null;
    this.contentContainer = null;
    this.previouslyFocusedElement = null;
    this.boundKeyHandler = this.handleKeyDown.bind(this);
    this.init();
  }

  init() {
    if (typeof document === "undefined") return;
    this.overlay = document.getElementById("modal-overlay");
    this.contentContainer = document.getElementById("modal-content");

    if (this.overlay) {
      this.overlay.addEventListener("click", (e) => {
        if (e.target === this.overlay) {
          this.close();
        }
      });
    }
  }

  /**
   * Opens the modal dialog with given markup and titles.
   * @param {string} title 
   * @param {string} htmlContent 
   * @param {HTMLElement} triggerElement 
   */
  open(title, htmlContent, triggerElement = null) {
    if (!this.overlay || !this.contentContainer) this.init();

    this.previouslyFocusedElement = triggerElement || document.activeElement;

    this.contentContainer.innerHTML = `
      <div class="modal-header">
        <h2 id="modal-title" class="modal-title">${title}</h2>
        <button type="button" class="modal-close-btn" id="modal-close-button" aria-label="Close dialog">
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="modal-body" id="modal-body-content">
        ${htmlContent}
      </div>
    `;

    const closeBtn = document.getElementById("modal-close-button");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.close());
    }

    // Display modal
    this.overlay.classList.add("modal-open");
    this.overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // Attach key listener for focus trap & ESC
    document.addEventListener("keydown", this.boundKeyHandler);

    // Focus the first actionable element or close button
    setTimeout(() => {
      const focusables = this.getFocusableElements();
      if (focusables.length > 0) {
        focusables[0].focus();
      } else if (closeBtn) {
        closeBtn.focus();
      }
    }, 50);
  }

  /**
   * Closes the dialog and restores previous focus.
   */
  close() {
    if (!this.overlay) return;

    this.overlay.classList.remove("modal-open");
    this.overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    document.removeEventListener("keydown", this.boundKeyHandler);

    // Restore focus
    if (this.previouslyFocusedElement && typeof this.previouslyFocusedElement.focus === "function") {
      this.previouslyFocusedElement.focus();
    }
  }

  /**
   * Gets all tabbable elements within the modal content.
   * @returns {Array<HTMLElement>}
   */
  getFocusableElements() {
    if (!this.overlay) return [];
    const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    return Array.from(this.overlay.querySelectorAll(selector)).filter(
      el => !el.hasAttribute("disabled") && el.offsetParent !== null
    );
  }

  /**
   * Keyboard event trap for TAB and ESCAPE.
   * @param {KeyboardEvent} e 
   */
  handleKeyDown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      this.close();
      return;
    }

    if (e.key === "Tab") {
      const focusables = this.getFocusableElements();
      if (focusables.length === 0) return;

      const firstElement = focusables[0];
      const lastElement = focusables[focusables.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  }

  /**
   * Renders the Detailed Inspection Modal for an internship.
   * @param {Object} internship 
   * @param {HTMLElement} triggerElement 
   */
  showDetails(internship, triggerElement) {
    const perksHtml = (internship.perks || []).map(p => `<li>${p}</li>`).join("");
    const respHtml = (internship.responsibilities || []).map(r => `<li>${r}</li>`).join("");
    const skillsHtml = (internship.skills || []).map(s => `<span class="skill-tag">${s}</span>`).join("");

    const bodyHtml = `
      <div class="modal-detail-grid">
        <div class="detail-meta-row">
          <span class="badge badge-domain">${internship.domain}</span>
          <span class="badge badge-mode badge-mode-${internship.mode.toLowerCase()}">${internship.mode}</span>
          <span class="badge badge-openings">${internship.openings} ${internship.openings === 1 ? 'Opening' : 'Openings'}</span>
        </div>

        <div class="detail-overview">
          <p class="detail-desc">${internship.description}</p>
          <div class="detail-quick-stats">
            <div class="quick-stat-item">
              <span class="stat-label">Location</span>
              <span class="stat-val">${internship.location}</span>
            </div>
            <div class="quick-stat-item">
              <span class="stat-label">Stipend</span>
              <span class="stat-val highlight">${internship.stipend || "Competitive"}</span>
            </div>
            <div class="quick-stat-item">
              <span class="stat-label">Duration</span>
              <span class="stat-val">${internship.duration || "Flexible"}</span>
            </div>
            <div class="quick-stat-item">
              <span class="stat-label">Record ID</span>
              <span class="stat-val"><code>${internship.id}</code></span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3 class="section-subtitle">Key Responsibilities</h3>
          <ul class="detail-list">${respHtml}</ul>
        </div>

        <div class="detail-section">
          <h3 class="section-subtitle">Required Technologies & Skills</h3>
          <div class="skills-wrap">${skillsHtml}</div>
        </div>

        <div class="detail-section">
          <h3 class="section-subtitle">Perks & Benefits</h3>
          <ul class="detail-list detail-list-perks">${perksHtml}</ul>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-primary btn-apply-modal" id="btn-modal-apply" data-id="${internship.id}">
            Apply for this Internship
          </button>
          <button type="button" class="btn btn-secondary" id="btn-modal-close-action">
            Close
          </button>
        </div>
      </div>
    `;

    this.open(`${internship.title}`, bodyHtml, triggerElement);

    const applyBtn = document.getElementById("btn-modal-apply");
    if (applyBtn) {
      applyBtn.addEventListener("click", () => {
        this.showApplicationForm(internship, triggerElement);
      });
    }

    const closeActionBtn = document.getElementById("btn-modal-close-action");
    if (closeActionBtn) {
      closeActionBtn.addEventListener("click", () => this.close());
    }
  }

  /**
   * Renders the Accessible Application Form for an internship.
   * @param {Object} internship 
   * @param {HTMLElement} triggerElement 
   */
  showApplicationForm(internship, triggerElement) {
    const formHtml = `
      <form id="internship-application-form" class="application-form" novalidate>
        <p class="form-intro">
          Applying for <strong>${internship.title}</strong> (<code>${internship.id}</code>) &bull; ${internship.mode} (${internship.location})
        </p>
        
        <div class="form-group">
          <label for="app-full-name" class="form-label">
            Full Name <span class="required" aria-hidden="true">*</span>
          </label>
          <input 
            type="text" 
            id="app-full-name" 
            name="fullName" 
            class="form-control" 
            required 
            aria-required="true"
            aria-describedby="name-desc"
            placeholder="e.g. Alex Morgan"
          />
          <div id="name-desc" class="field-hint">Enter your first and last name.</div>
          <div class="error-feedback" id="name-error" role="alert"></div>
        </div>

        <div class="form-group">
          <label for="app-email" class="form-label">
            Email Address <span class="required" aria-hidden="true">*</span>
          </label>
          <input 
            type="email" 
            id="app-email" 
            name="email" 
            class="form-control" 
            required 
            aria-required="true"
            aria-describedby="email-desc"
            placeholder="alex.morgan@example.com"
          />
          <div id="email-desc" class="field-hint">We'll send application updates to this address.</div>
          <div class="error-feedback" id="email-error" role="alert"></div>
        </div>

        <div class="form-group">
          <label for="app-portfolio" class="form-label">
            GitHub / Portfolio URL <span class="required" aria-hidden="true">*</span>
          </label>
          <input 
            type="url" 
            id="app-portfolio" 
            name="portfolio" 
            class="form-control" 
            required 
            aria-required="true"
            aria-describedby="portfolio-desc"
            placeholder="https://github.com/username or portfolio link"
          />
          <div id="portfolio-desc" class="field-hint">Must begin with https:// or http://</div>
          <div class="error-feedback" id="portfolio-error" role="alert"></div>
        </div>

        <div class="form-group">
          <label for="app-statement" class="form-label">
            Why are you interested in this role? <span class="required" aria-hidden="true">*</span>
          </label>
          <textarea 
            id="app-statement" 
            name="statement" 
            class="form-control" 
            rows="3" 
            required
            aria-required="true"
            placeholder="Briefly describe your interest and relevant experience..."
          ></textarea>
          <div class="error-feedback" id="statement-error" role="alert"></div>
        </div>

        <div class="modal-actions">
          <button type="submit" class="btn btn-primary" id="submit-app-btn">
            Submit Application
          </button>
          <button type="button" class="btn btn-secondary" id="cancel-app-btn">
            Cancel
          </button>
        </div>
      </form>
    `;

    this.open(`Apply: ${internship.title}`, formHtml, triggerElement);

    const cancelBtn = document.getElementById("cancel-app-btn");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.close());
    }

    const form = document.getElementById("internship-application-form");
    if (form) {
      form.addEventListener("submit", (e) => this.handleFormSubmit(e, internship));
    }
  }

  /**
   * Handles form validation and submission.
   * @param {Event} e 
   * @param {Object} internship 
   */
  handleFormSubmit(e, internship) {
    e.preventDefault();

    const nameInput = document.getElementById("app-full-name");
    const emailInput = document.getElementById("app-email");
    const portfolioInput = document.getElementById("app-portfolio");
    const statementInput = document.getElementById("app-statement");

    let isValid = true;

    // Reset error messages
    const clearError = (input, errorId) => {
      input.classList.remove("is-invalid");
      input.removeAttribute("aria-invalid");
      const errEl = document.getElementById(errorId);
      if (errEl) errEl.textContent = "";
    };

    const setError = (input, errorId, message) => {
      input.classList.add("is-invalid");
      input.setAttribute("aria-invalid", "true");
      const errEl = document.getElementById(errorId);
      if (errEl) errEl.textContent = message;
      isValid = false;
    };

    clearError(nameInput, "name-error");
    clearError(emailInput, "email-error");
    clearError(portfolioInput, "portfolio-error");
    clearError(statementInput, "statement-error");

    // Validate Name
    if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
      setError(nameInput, "name-error", "Please enter your full name (at least 2 characters).");
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
      setError(emailInput, "email-error", "Please provide a valid email address (e.g., student@domain.com).");
    }

    // Validate URL
    try {
      const url = new URL(portfolioInput.value.trim());
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error();
      }
    } catch (_) {
      setError(portfolioInput, "portfolio-error", "Please provide a valid web URL starting with https:// or http://");
    }

    // Validate Statement
    if (!statementInput.value.trim() || statementInput.value.trim().length < 10) {
      setError(statementInput, "statement-error", "Please provide at least 10 characters explaining your interest.");
    }

    if (!isValid) {
      // Focus first invalid input
      const firstInvalid = document.querySelector(".is-invalid");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Success flow
    this.close();
    if (window.toastService) {
      window.toastService.show(
        `Application submitted successfully for ${internship.title}! Check your email for confirmation.`,
        "success",
        4500
      );
    }
  }
}

window.accessibleModalService = new AccessibleModalService();
