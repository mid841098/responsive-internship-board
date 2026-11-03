/**
 * Internship Board - Filter & Search Service
 * Manages search querying, multi-criteria filtering, sorting, and filter state.
 */

class InternshipFilterService {
  constructor() {
    this.state = {
      searchQuery: "",
      domain: "all",
      mode: "all",
      sortBy: "recommended"
    };
  }

  /**
   * Resets all filter criteria to their defaults.
   */
  reset() {
    this.state = {
      searchQuery: "",
      domain: "all",
      mode: "all",
      sortBy: "recommended"
    };
  }

  /**
   * Updates one or more filter fields.
   * @param {Object} partialState 
   */
  setState(partialState) {
    this.state = { ...this.state, ...partialState };
  }

  /**
   * Checks if any active filter is applied.
   * @returns {boolean}
   */
  hasActiveFilters() {
    return (
      this.state.searchQuery.trim().length > 0 ||
      this.state.domain !== "all" ||
      this.state.mode !== "all" ||
      this.state.sortBy !== "recommended"
    );
  }

  /**
   * Applies the current filter and sort state to a list of internships.
   * @param {Array} items 
   * @returns {Array}
   */
  apply(items) {
    if (!Array.isArray(items)) return [];

    const query = this.state.searchQuery.trim().toLowerCase();
    const domainFilter = this.state.domain;
    const modeFilter = this.state.mode;

    // Filter stage
    let filtered = items.filter(item => {
      // Domain filter
      if (domainFilter !== "all" && item.domain !== domainFilter) {
        return false;
      }

      // Work Mode filter
      if (modeFilter !== "all" && item.mode.toLowerCase() !== modeFilter.toLowerCase()) {
        return false;
      }

      // Keyword Search filter
      if (query) {
        const titleMatch = item.title?.toLowerCase().includes(query);
        const domainMatch = item.domain?.toLowerCase().includes(query);
        const locationMatch = item.location?.toLowerCase().includes(query);
        const descMatch = item.description?.toLowerCase().includes(query);
        const skillsMatch = Array.isArray(item.skills) && item.skills.some(skill =>
          skill.toLowerCase().includes(query)
        );

        if (!titleMatch && !domainMatch && !locationMatch && !descMatch && !skillsMatch) {
          return false;
        }
      }

      return true;
    });

    // Sort stage
    return this.sortItems(filtered);
  }

  /**
   * Sorts the filtered array according to current sort criteria.
   * @param {Array} list 
   * @returns {Array}
   */
  sortItems(list) {
    const sorted = [...list];
    switch (this.state.sortBy) {
      case "openings-desc":
        return sorted.sort((a, b) => (b.openings || 0) - (a.openings || 0));
      case "openings-asc":
        return sorted.sort((a, b) => (a.openings || 0) - (b.openings || 0));
      case "title-asc":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "recent":
        return sorted.sort((a, b) => new Date(b.postedDate || 0) - new Date(a.postedDate || 0));
      case "recommended":
      default:
        // Prioritize openings and then recency
        return sorted.sort((a, b) => (b.openings || 0) - (a.openings || 0));
    }
  }
}

// Export singleton
window.internshipFilterService = new InternshipFilterService();
