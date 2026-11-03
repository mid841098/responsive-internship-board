/**
 * Internship Board - Data Service
 * Provides seed data, asynchronous loading simulation, caching, and error handling.
 */

// Fallback seed data matching edvyro.in/datasets/source-materials/internship-records-sample.json
const SEED_INTERNSHIPS = [
  {
    id: "INT-101",
    title: "Frontend Intern",
    domain: "Full Stack Development",
    mode: "Remote",
    location: "India",
    skills: ["HTML", "CSS", "JavaScript"],
    openings: 3,
    duration: "3 Months",
    stipend: "₹15,000 / month",
    postedDate: "2026-10-28",
    description: "Build accessible, responsive UI components and modern client-side web applications using semantic HTML5, modern CSS3, and vanilla JavaScript.",
    responsibilities: [
      "Develop responsive user interfaces compliant with WCAG 2.1 AA accessibility standards.",
      "Collaborate with backend teams to integrate RESTful API endpoints.",
      "Conduct cross-browser and mobile device viewport testing (360px to 1440px)."
    ],
    perks: ["Flexible hours", "Mentorship certificate", "Letter of recommendation", "Pre-placement offer potential"]
  },
  {
    id: "INT-102",
    title: "API Engineering Intern",
    domain: "Full Stack Development",
    mode: "Hybrid",
    location: "Pune",
    skills: ["Node.js", "SQL", "Testing"],
    openings: 2,
    duration: "6 Months",
    stipend: "₹20,000 / month",
    postedDate: "2026-10-25",
    description: "Design and build resilient, secure RESTful APIs with Node.js, Express, and SQL databases, complete with comprehensive integration test suites.",
    responsibilities: [
      "Implement REST endpoints with input validation, sanitization, and structured error envelopes.",
      "Write unit and integration tests using Jest and Supertest.",
      "Optimize relational database queries, pagination schemas, and indexing."
    ],
    perks: ["Hybrid commute allowance", "Industry standard mentorship", "Health insurance coverage"]
  },
  {
    id: "INT-103",
    title: "UI/UX Intern",
    domain: "UI/UX",
    mode: "Remote",
    location: "India",
    skills: ["Figma", "Research", "Accessibility"],
    openings: 1,
    duration: "3 Months",
    stipend: "₹18,000 / month",
    postedDate: "2026-10-20",
    description: "Champion user-centric design workflows, prototype high-fidelity components in Figma, and conduct usability and accessibility audits.",
    responsibilities: [
      "Create wireframes, user flow diagrams, and interactive prototypes in Figma.",
      "Audit interface color contrast, keyboard focus order, and screen reader announcements.",
      "Conduct user research interviews and synthesize feedback into design iterations."
    ],
    perks: ["Design tool subscriptions", "Weekly design critiques", "Certificate of completion"]
  },
  {
    id: "INT-104",
    title: "Data Analyst Intern",
    domain: "Data Analytics",
    mode: "On-site",
    location: "Bengaluru",
    skills: ["Excel", "SQL", "Data visualisation"],
    openings: 2,
    duration: "4 Months",
    stipend: "₹22,000 / month",
    postedDate: "2026-10-15",
    description: "Extract, clean, and visualize operational data to generate business insights and automated executive dashboards.",
    responsibilities: [
      "Query structured databases using SQL and perform exploratory data analysis.",
      "Build interactive dashboard reports with modern charting tools and Excel formulas.",
      "Present quantitative findings to product managers and stakeholders."
    ],
    perks: ["Free gourmet cafeteria meals", "Access to corporate gym", "Laptop provided"]
  },
  {
    id: "INT-105",
    title: "Security Operations Intern",
    domain: "Cyber Security",
    mode: "Remote",
    location: "India",
    skills: ["Linux", "Logs", "Networking"],
    openings: 1,
    duration: "6 Months",
    stipend: "₹25,000 / month",
    postedDate: "2026-10-10",
    description: "Analyze network traffic logs, assist with incident investigation, and verify baseline security hardening configurations across Linux systems.",
    responsibilities: [
      "Monitor security event logs and identify abnormal authentication spikes or port scans.",
      "Participate in vulnerability management assessments and security reviews.",
      "Document threat intelligence indicators and defensive remediation protocols."
    ],
    perks: ["Cybersecurity certification voucher", "Remote workspace stipend", "Direct CISO mentorship"]
  },
  {
    id: "INT-106",
    title: "Cloud DevOps Intern",
    domain: "Full Stack Development",
    mode: "Remote",
    location: "Hyderabad",
    skills: ["Docker", "CI/CD", "Linux", "AWS"],
    openings: 2,
    duration: "4 Months",
    stipend: "₹22,000 / month",
    postedDate: "2026-10-29",
    description: "Automate containerized deployment pipelines, maintain infrastructure-as-code, and improve system observability.",
    responsibilities: [
      "Build reproducible multi-stage Dockerfiles for web applications.",
      "Configure GitHub Actions CI/CD workflows for linting, testing, and deployment.",
      "Implement uptime health checks and centralized monitoring alerts."
    ],
    perks: ["AWS cloud credits", "Flexible working schedule", "Pre-placement offer"]
  },
  {
    id: "INT-107",
    title: "Product Research Intern",
    domain: "UI/UX",
    mode: "Hybrid",
    location: "Bengaluru",
    skills: ["User Interviews", "Usability Testing", "Wireframing"],
    openings: 1,
    duration: "3 Months",
    stipend: "₹16,000 / month",
    postedDate: "2026-10-22",
    description: "Lead student usability sessions, uncover workflow pain points, and define functional requirements for learning portals.",
    responsibilities: [
      "Design usability testing protocols and recruit target student cohorts.",
      "Synthesize qualitative feedback into actionable user journey maps.",
      "Partner with product managers to prioritize backlog feature requests."
    ],
    perks: ["Hybrid commute stipend", "Mentorship from Senior UX leads", "Certificate"]
  },
  {
    id: "INT-108",
    title: "Machine Learning Intern",
    domain: "Data Analytics",
    mode: "Remote",
    location: "India",
    skills: ["Python", "Pandas", "Scikit-Learn", "Data Visualisation"],
    openings: 2,
    duration: "6 Months",
    stipend: "₹24,000 / month",
    postedDate: "2026-10-18",
    description: "Develop supervised predictive models, perform feature engineering, and evaluate model performance on real-world datasets.",
    responsibilities: [
      "Preprocess tabular datasets and engineer robust numerical and categorical features.",
      "Train, benchmark, and validate classification and regression algorithms.",
      "Deploy simple inference endpoints and visualize model evaluation metrics."
    ],
    perks: ["High-performance GPU access", "Publication opportunity", "Full remote setup"]
  }
];

class InternshipDataService {
  constructor() {
    this.internships = [];
    this.simulateError = false;
  }

  /**
   * Sets whether the service should simulate a network failure.
   * Useful for testing error and retry UI states.
   * @param {boolean} value 
   */
  setSimulateError(value) {
    this.simulateError = Boolean(value);
  }

  /**
   * Fetches the internship records with a realistic latency simulation.
   * Tries to fetch data/internships.json first, falls back gracefully to embedded seed.
   * @returns {Promise<Array>}
   */
  async fetchInternships(delayMs = 400) {
    // Artificial latency for smooth skeleton loading demonstration
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    if (this.simulateError) {
      throw new Error("Simulated network outage (HTTP 503). Service temporarily unavailable.");
    }

    try {
      // Attempt HTTP fetch if in browser server environment
      if (typeof window !== "undefined" && window.location && window.location.protocol && window.location.protocol.startsWith("http")) {
        const response = await fetch("./data/internships.json");
        if (response.ok) {
          const data = await response.json();
          this.internships = Array.isArray(data) ? data : (data.internships || SEED_INTERNSHIPS);
          return this.internships;
        }
      }
    } catch (err) {
      console.warn("Falling back to embedded seed data:", err);
    }

    // Default seed fallback
    this.internships = [...SEED_INTERNSHIPS];
    return this.internships;
  }

  /**
   * Returns a single internship record by its ID.
   * @param {string} id 
   * @returns {Object|null}
   */
  getById(id) {
    return this.internships.find(item => item.id === id) || null;
  }

  /**
   * Returns unique domain categories.
   * @returns {Array<string>}
   */
  getUniqueDomains() {
    const domains = new Set(this.internships.map(item => item.domain));
    return Array.from(domains).sort();
  }

  /**
   * Returns unique work modes.
   * @returns {Array<string>}
   */
  getUniqueModes() {
    const modes = new Set(this.internships.map(item => item.mode));
    return Array.from(modes).sort();
  }
}

// Export singleton instance for usage
window.internshipDataService = new InternshipDataService();
