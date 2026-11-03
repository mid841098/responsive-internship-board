/**
 * Accessible Toast & Screen-Reader Announcer
 */
class ToastService {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    if (typeof document === "undefined") return;
    let existing = document.getElementById("toast-container");
    if (!existing) {
      existing = document.createElement("div");
      existing.id = "toast-container";
      existing.className = "toast-container";
      existing.setAttribute("aria-live", "polite");
      existing.setAttribute("aria-atomic", "true");
      document.body.appendChild(existing);
    }
    this.container = existing;
  }

  /**
   * Shows a transient toast notification and announces it to assistive tech.
   * @param {string} message 
   * @param {"info"|"success"|"error"} type 
   * @param {number} durationMs 
   */
  show(message, type = "info", durationMs = 3200) {
    if (!this.container) this.init();

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.setAttribute("role", type === "error" ? "alert" : "status");

    const iconSvg = type === "success" 
      ? '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>'
      : type === "error"
      ? '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
      : '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';

    toast.innerHTML = `
      <span class="toast-icon">${iconSvg}</span>
      <span class="toast-message">${message}</span>
      <button type="button" class="toast-close" aria-label="Dismiss notification">&times;</button>
    `;

    const closeBtn = toast.querySelector(".toast-close");
    const removeToast = () => {
      toast.classList.add("toast-hiding");
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 250);
    };

    closeBtn.addEventListener("click", removeToast);
    this.container.appendChild(toast);

    setTimeout(removeToast, durationMs);
  }
}

window.toastService = new ToastService();
