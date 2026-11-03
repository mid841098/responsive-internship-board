/**
 * Internship Board - Main Application Controller
 * Handles UI interactions, state synchronization, DOM rendering, bookmarks, and accessibility.
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const searchInput = document.getElementById("search-input");
  const clearSearchBtn = document.getElementById("clear-search-btn");
  const domainFilter = document.getElementById("domain-filter");
  const modeFilter = document.getElementById("mode-filter");
  const sortFilter = document.getElementById("sort-filter");
  const resetFiltersBtn = document.getElementById("reset-filters-btn");
  const toggleErrorBtn = document.getElementById("toggle-error-btn");
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  
  const resultsCountEl = document.getElementById("results-count");
  const activeChipsContainer = document.getElementById("active-filter-chips");
  const cardGridContainer = document.getElementById("internships-grid");
  const statusContainer = document.getElementById("status-container");

  // Quick stats elements
  const statTotalRoles = document.getElementById("stat-total-roles");
  const statOpenings = document.getElementById("stat-total-openings");
  const statDomains = document.getElementById("stat-total-domains");

  // State
  let allInternships = [];
  let savedBookmarks = new Set(JSON.parse(localStorage.getItem("bookmarked_internships") || "[]"));
  let isLoading = false;
  let searchDebounceTimer = null;

  // Initialize Theme
  initTheme();

  // Load initial data
  loadData();

  // Attach Event Listeners
  attachEventListeners();

  /**
   * Initializes light/dark theme preference
   */
  function initTheme() {
    const savedTheme = localStorage.getItem("app_theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");

    document.documentElement.setAttribute("data-theme", initialTheme);
    updateThemeToggleLabel(initialTheme);
  }

  function updateThemeToggleLabel(theme) {
    if (!themeToggleBtn) return;
    const isDark = theme === "dark";
    themeToggleBtn.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} theme`);
    themeToggleBtn.innerHTML = isDark
      ? `<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg><span class="theme-label">Light Mode</span>`
      : `<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg><span class="theme-label">Dark Mode</span>`;
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("app_theme", newTheme);
    updateThemeToggleLabel(newTheme);
    window.toastService.show(`Switched to ${newTheme} theme`, "info", 1800);
  }

  /**
   * Fetches data and populates initial view
   */
  async function loadData() {
    isLoading = true;
    renderLoadingState();
    clearStatusMessage();

    try {
      allInternships = await window.internshipDataService.fetchInternships(500);
      populateFilterOptions();
      updateHeroStats();
      renderFilteredView();
    } catch (err) {
      console.error("Failed to load internships:", err);
      renderErrorState(err.message || "Failed to load internship opportunities.");
    } finally {
      isLoading = false;
    }
  }

  /**
   * Updates hero section statistics
   */
  function updateHeroStats() {
    if (statTotalRoles) statTotalRoles.textContent = allInternships.length;
    if (statOpenings) {
      const sumOpenings = allInternships.reduce((acc, curr) => acc + (curr.openings || 0), 0);
      statOpenings.textContent = sumOpenings;
    }
    if (statDomains) {
      const uniqueDomains = new Set(allInternships.map(i => i.domain));
      statDomains.textContent = uniqueDomains.size;
    }
  }

  /**
   * Populates domain dropdown dynamically from loaded data
   */
  function populateFilterOptions() {
    if (!domainFilter) return;
    const currentVal = domainFilter.value;
    const domains = window.internshipDataService.getUniqueDomains();

    domainFilter.innerHTML = `<option value="all">All Domains</option>`;
    domains.forEach(domain => {
      const option = document.createElement("option");
      option.value = domain;
      option.textContent = domain;
      domainFilter.appendChild(option);
    });

    if (domains.includes(currentVal)) {
      domainFilter.value = currentVal;
    }
  }

  /**
   * Renders the filtered and sorted list of internships
   */
  function renderFilteredView() {
    if (isLoading) return;

    const filtered = window.internshipFilterService.apply(allInternships);
    updateResultsMeta(filtered.length, allInternships.length);
    renderActiveChips();

    if (filtered.length === 0) {
      renderEmptyState();
    } else {
      renderCardGrid(filtered);
    }
  }

  /**
   * Updates the aria-live announcement count
   */
  function updateResultsMeta(filteredCount, totalCount) {
    if (!resultsCountEl) return;
    const hasFilter = window.internshipFilterService.hasActiveFilters();

    if (filteredCount === 0) {
      resultsCountEl.textContent = `No internships found matching your filters.`;
    } else if (hasFilter) {
      resultsCountEl.textContent = `Showing ${filteredCount} of ${totalCount} internships`;
    } else {
      resultsCountEl.textContent = `Showing all ${totalCount} available internships`;
    }
  }

  /**
   * Renders chips representing currently active filters
   */
  function renderActiveChips() {
    if (!activeChipsContainer) return;
    const state = window.internshipFilterService.state;
    const chips = [];

    if (state.searchQuery.trim()) {
      chips.push({
        label: `Search: "${state.searchQuery}"`,
        onRemove: () => {
          searchInput.value = "";
          clearSearchBtn.style.display = "none";
          window.internshipFilterService.setState({ searchQuery: "" });
          renderFilteredView();
          searchInput.focus();
        }
      });
    }

    if (state.domain !== "all") {
      chips.push({
        label: `Domain: ${state.domain}`,
        onRemove: () => {
          domainFilter.value = "all";
          window.internshipFilterService.setState({ domain: "all" });
          renderFilteredView();
          domainFilter.focus();
        }
      });
    }

    if (state.mode !== "all") {
      chips.push({
        label: `Mode: ${state.mode}`,
        onRemove: () => {
          modeFilter.value = "all";
          window.internshipFilterService.setState({ mode: "all" });
          renderFilteredView();
          modeFilter.focus();
        }
      });
    }

    if (state.sortBy !== "recommended") {
      chips.push({
        label: `Sorted: ${sortFilter.options[sortFilter.selectedIndex]?.text || state.sortBy}`,
        onRemove: () => {
          sortFilter.value = "recommended";
          window.internshipFilterService.setState({ sortBy: "recommended" });
          renderFilteredView();
          sortFilter.focus();
        }
      });
    }

    if (chips.length === 0) {
      activeChipsContainer.innerHTML = "";
      activeChipsContainer.style.display = "none";
      return;
    }

    activeChipsContainer.style.display = "flex";
    activeChipsContainer.innerHTML = "";

    chips.forEach(chip => {
      const chipEl = document.createElement("div");
      chipEl.className = "filter-chip";
      chipEl.innerHTML = `
        <span class="chip-text">${chip.label}</span>
        <button type="button" class="chip-remove-btn" aria-label="Remove filter ${chip.label}">
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;

      chipEl.querySelector(".chip-remove-btn").addEventListener("click", chip.onRemove);
      activeChipsContainer.appendChild(chipEl);
    });

    // "Clear all" button
    const clearAllBtn = document.createElement("button");
    clearAllBtn.type = "button";
    clearAllBtn.className = "chip-clear-all";
    clearAllBtn.textContent = "Clear all filters";
    clearAllBtn.addEventListener("click", resetAllFilters);
    activeChipsContainer.appendChild(clearAllBtn);
  }

  /**
   * Renders the cards grid
   */
  function renderCardGrid(items) {
    clearStatusMessage();
    cardGridContainer.style.display = "grid";
    cardGridContainer.innerHTML = "";

    items.forEach(item => {
      const isBookmarked = savedBookmarks.has(item.id);
      const card = document.createElement("article");
      card.className = "internship-card";
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "region");
      card.setAttribute("aria-labelledby", `title-${item.id}`);

      // Mode icon
      const modeIcon = item.mode.toLowerCase() === "remote" 
        ? `<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`
        : item.mode.toLowerCase() === "hybrid"
        ? `<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`
        : `<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

      // Skills HTML
      const skillsHtml = (item.skills || []).map(skill => 
        `<button type="button" class="skill-tag" data-skill="${skill}" aria-label="Filter by skill ${skill}">${skill}</button>`
      ).join("");

      card.innerHTML = `
        <div class="card-header">
          <span class="badge badge-domain">${item.domain}</span>
          <button 
            type="button" 
            class="bookmark-btn ${isBookmarked ? 'is-active' : ''}" 
            data-id="${item.id}" 
            aria-label="${isBookmarked ? 'Remove ' + item.title + ' from saved' : 'Save ' + item.title + ' to bookmarks'}"
            aria-pressed="${isBookmarked}"
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
        </div>

        <h3 id="title-${item.id}" class="card-title">${item.title}</h3>

        <div class="card-badges-row">
          <span class="badge badge-mode badge-mode-${item.mode.toLowerCase()}">
            ${modeIcon}
            <span>${item.mode}</span>
          </span>
          <span class="badge badge-location">
            <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${item.location}</span>
          </span>
          <span class="badge badge-openings">
            <strong>${item.openings}</strong> ${item.openings === 1 ? 'opening' : 'openings'}
          </span>
        </div>

        <p class="card-desc">${item.description || "Exciting internship opportunity with hands-on learning and real project impact."}</p>

        <div class="card-skills" aria-label="Required skills">
          ${skillsHtml}
        </div>

        <div class="card-footer">
          <div class="card-compensation">
            <span class="comp-label">Stipend</span>
            <span class="comp-val">${item.stipend || "Competitive"}</span>
          </div>
          <div class="card-actions">
            <button 
              type="button" 
              class="btn btn-outline btn-details" 
              data-id="${item.id}" 
              aria-haspopup="dialog"
            >
              View Details
            </button>
            <button 
              type="button" 
              class="btn btn-primary btn-apply" 
              data-id="${item.id}" 
              aria-haspopup="dialog"
            >
              Apply
            </button>
          </div>
        </div>
      `;

      // Attach card button handlers
      attachCardListeners(card, item);
      cardGridContainer.appendChild(card);
    });
  }

  /**
   * Attaches event listeners to card actions
   */
  function attachCardListeners(card, item) {
    // Bookmark button
    const bookmarkBtn = card.querySelector(".bookmark-btn");
    if (bookmarkBtn) {
      bookmarkBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleBookmark(item.id, item.title, bookmarkBtn);
      });
    }

    // View Details
    const detailsBtn = card.querySelector(".btn-details");
    if (detailsBtn) {
      detailsBtn.addEventListener("click", () => {
        window.accessibleModalService.showDetails(item, detailsBtn);
      });
    }

    // Apply button
    const applyBtn = card.querySelector(".btn-apply");
    if (applyBtn) {
      applyBtn.addEventListener("click", () => {
        window.accessibleModalService.showApplicationForm(item, applyBtn);
      });
    }

    // Skill pills filter trigger
    card.querySelectorAll(".skill-tag").forEach(tag => {
      tag.addEventListener("click", (e) => {
        e.stopPropagation();
        const skill = tag.dataset.skill;
        if (skill) {
          searchInput.value = skill;
          clearSearchBtn.style.display = "block";
          window.internshipFilterService.setState({ searchQuery: skill });
          renderFilteredView();
          searchInput.focus();
          window.toastService.show(`Filtered by skill: "${skill}"`, "info", 1800);
        }
      });
    });
  }

  /**
   * Toggles bookmark state for an internship
   */
  function toggleBookmark(id, title, buttonEl) {
    if (savedBookmarks.has(id)) {
      savedBookmarks.delete(id);
      buttonEl.classList.remove("is-active");
      buttonEl.setAttribute("aria-pressed", "false");
      buttonEl.setAttribute("aria-label", `Save ${title} to bookmarks`);
      buttonEl.querySelector("svg").setAttribute("fill", "none");
      window.toastService.show(`Removed ${title} from saved bookmarks.`, "info", 2000);
    } else {
      savedBookmarks.add(id);
      buttonEl.classList.add("is-active");
      buttonEl.setAttribute("aria-pressed", "true");
      buttonEl.setAttribute("aria-label", `Remove ${title} from saved`);
      buttonEl.querySelector("svg").setAttribute("fill", "currentColor");
      window.toastService.show(`Saved ${title} to your bookmarks!`, "success", 2000);
    }
    localStorage.setItem("bookmarked_internships", JSON.stringify(Array.from(savedBookmarks)));
  }

  /**
   * Renders the loading skeleton cards
   */
  function renderLoadingState() {
    clearStatusMessage();
    cardGridContainer.style.display = "grid";
    cardGridContainer.setAttribute("aria-busy", "true");
    cardGridContainer.innerHTML = Array.from({ length: 6 }).map(() => `
      <div class="skeleton-card" aria-hidden="true">
        <div class="skeleton-line skeleton-tag"></div>
        <div class="skeleton-line skeleton-title"></div>
        <div class="skeleton-line skeleton-meta"></div>
        <div class="skeleton-line skeleton-desc"></div>
        <div class="skeleton-line skeleton-desc" style="width: 75%"></div>
        <div class="skeleton-line skeleton-btn"></div>
      </div>
    `).join("");

    if (resultsCountEl) {
      resultsCountEl.textContent = "Loading available internships...";
    }
  }

  /**
   * Renders Empty State when no results match
   */
  function renderEmptyState() {
    cardGridContainer.style.display = "none";
    cardGridContainer.removeAttribute("aria-busy");
    
    statusContainer.innerHTML = `
      <div class="empty-state" role="status">
        <div class="empty-icon-wrap" aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </div>
        <h3 class="empty-title">No matching internships found</h3>
        <p class="empty-desc">
          We couldn't find any opportunities matching your current filters. Try searching for different keywords or clear your active filters.
        </p>
        <button type="button" class="btn btn-primary" id="empty-reset-btn">
          Reset all filters
        </button>
      </div>
    `;

    const resetBtn = document.getElementById("empty-reset-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", resetAllFilters);
    }
  }

  /**
   * Renders Error State with a retry button
   */
  function renderErrorState(errorMessage) {
    cardGridContainer.style.display = "none";
    cardGridContainer.removeAttribute("aria-busy");

    if (resultsCountEl) {
      resultsCountEl.textContent = "Error loading internships.";
    }

    statusContainer.innerHTML = `
      <div class="error-state" role="alert">
        <div class="error-icon-wrap" aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 class="error-title">Unable to load opportunities</h3>
        <p class="error-desc">${errorMessage}</p>
        <div class="error-actions">
          <button type="button" class="btn btn-primary" id="retry-fetch-btn">
            Retry Loading
          </button>
          <button type="button" class="btn btn-secondary" id="disable-error-simulation-btn">
            Disable Error Simulation
          </button>
        </div>
      </div>
    `;

    const retryBtn = document.getElementById("retry-fetch-btn");
    if (retryBtn) {
      retryBtn.addEventListener("click", () => {
        loadData();
      });
    }

    const disableSimBtn = document.getElementById("disable-error-simulation-btn");
    if (disableSimBtn) {
      disableSimBtn.addEventListener("click", () => {
        window.internshipDataService.setSimulateError(false);
        if (toggleErrorBtn) {
          toggleErrorBtn.classList.remove("is-simulating");
          toggleErrorBtn.innerHTML = `<span>Simulate Error</span>`;
        }
        loadData();
      });
    }
  }

  function clearStatusMessage() {
    if (statusContainer) {
      statusContainer.innerHTML = "";
    }
    cardGridContainer.removeAttribute("aria-busy");
  }

  /**
   * Resets all search and filter controls
   */
  function resetAllFilters() {
    window.internshipFilterService.reset();
    if (searchInput) {
      searchInput.value = "";
      clearSearchBtn.style.display = "none";
    }
    if (domainFilter) domainFilter.value = "all";
    if (modeFilter) modeFilter.value = "all";
    if (sortFilter) sortFilter.value = "recommended";

    renderFilteredView();
    window.toastService.show("All search and filter criteria have been reset.", "info", 1800);
    if (searchInput) searchInput.focus();
  }

  /**
   * Attach global event listeners
   */
  function attachEventListeners() {
    // Theme toggle
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", toggleTheme);
    }

    // Search input with debounce
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const value = e.target.value;
        if (clearSearchBtn) {
          clearSearchBtn.style.display = value ? "block" : "none";
        }

        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
          window.internshipFilterService.setState({ searchQuery: value });
          renderFilteredView();
        }, 250);
      });

      // Clear search button
      if (clearSearchBtn) {
        clearSearchBtn.addEventListener("click", () => {
          searchInput.value = "";
          clearSearchBtn.style.display = "none";
          window.internshipFilterService.setState({ searchQuery: "" });
          renderFilteredView();
          searchInput.focus();
        });
      }
    }

    // Domain filter change
    if (domainFilter) {
      domainFilter.addEventListener("change", (e) => {
        window.internshipFilterService.setState({ domain: e.target.value });
        renderFilteredView();
      });
    }

    // Mode filter change
    if (modeFilter) {
      modeFilter.addEventListener("change", (e) => {
        window.internshipFilterService.setState({ mode: e.target.value });
        renderFilteredView();
      });
    }

    // Sort filter change
    if (sortFilter) {
      sortFilter.addEventListener("change", (e) => {
        window.internshipFilterService.setState({ sortBy: e.target.value });
        renderFilteredView();
      });
    }

    // Reset filters button
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener("click", resetAllFilters);
    }

    // Error simulation toggle button for reviewer demonstration
    if (toggleErrorBtn) {
      toggleErrorBtn.addEventListener("click", () => {
        const currentSim = window.internshipDataService.simulateError;
        const newSim = !currentSim;
        window.internshipDataService.setSimulateError(newSim);

        if (newSim) {
          toggleErrorBtn.classList.add("is-simulating");
          toggleErrorBtn.innerHTML = `<span>Simulation Active: Error Mode</span>`;
          window.toastService.show("Error mode activated. Reloading data to showcase error UI...", "error", 2500);
        } else {
          toggleErrorBtn.classList.remove("is-simulating");
          toggleErrorBtn.innerHTML = `<span>Simulate Error</span>`;
          window.toastService.show("Error mode disabled. Restoring normal state...", "success", 2000);
        }
        loadData();
      });
    }
  }
});
