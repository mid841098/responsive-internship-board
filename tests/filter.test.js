/**
 * Unit Test Suite for Filter & Data Services
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Mock window and browser globals
global.window = {};
global.document = {
  getElementById: () => null,
  body: { appendChild: () => {} }
};

// Load scripts
const dataCode = fs.readFileSync(path.join(__dirname, '../js/data.js'), 'utf8');
const filterCode = fs.readFileSync(path.join(__dirname, '../js/filter.js'), 'utf8');

eval(dataCode);
eval(filterCode);

const dataService = window.internshipDataService;
const filterService = window.internshipFilterService;

async function runTests() {
  console.log("Starting test suite...\n");
  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(err);
    }
  }

  // 1. Data Service Fetch
  const items = await dataService.fetchInternships(0);
  test("DataService loads seed internships (minimum 5 required records)", () => {
    assert(items.length >= 5, "Expected at least 5 internships");
    const requiredIds = ["INT-101", "INT-102", "INT-103", "INT-104", "INT-105"];
    for (const id of requiredIds) {
      assert(items.some(item => item.id === id), `Missing required record ${id}`);
    }
  });

  test("DataService getById returns correct internship record", () => {
    const item = dataService.getById("INT-101");
    assert(item !== null, "INT-101 should exist");
    assert.strictEqual(item.title, "Frontend Intern");
    assert.strictEqual(item.mode, "Remote");
  });

  test("DataService extracts unique domains and modes", () => {
    const domains = dataService.getUniqueDomains();
    assert(domains.includes("Full Stack Development"));
    assert(domains.includes("UI/UX"));
    assert(domains.includes("Cyber Security"));
    assert(domains.includes("Data Analytics"));

    const modes = dataService.getUniqueModes();
    assert(modes.includes("Remote"));
    assert(modes.includes("Hybrid"));
    assert(modes.includes("On-site"));
  });

  // 2. Filter by Domain
  test("FilterService filters by domain correctly", () => {
    filterService.reset();
    filterService.setState({ domain: "Full Stack Development" });
    const res = filterService.apply(items);
    assert(res.length > 0, "Should have results for Full Stack Development");
    assert(res.every(i => i.domain === "Full Stack Development"), "All results must match domain");
  });

  // 3. Filter by Work Mode
  test("FilterService filters by work mode (Remote)", () => {
    filterService.reset();
    filterService.setState({ mode: "remote" });
    const res = filterService.apply(items);
    assert(res.length > 0, "Should have results for remote");
    assert(res.every(i => i.mode.toLowerCase() === "remote"), "All results must be Remote");
  });

  // 4. Keyword Search
  test("FilterService searches by keyword in skills (e.g. 'Node.js')", () => {
    filterService.reset();
    filterService.setState({ searchQuery: "Node.js" });
    const res = filterService.apply(items);
    assert(res.length > 0, "Should find matches for Node.js");
    assert(res.some(i => i.id === "INT-102"), "INT-102 has Node.js");
  });

  test("FilterService searches by keyword in role title (e.g. 'Frontend')", () => {
    filterService.reset();
    filterService.setState({ searchQuery: "Frontend" });
    const res = filterService.apply(items);
    assert.strictEqual(res.length, 1);
    assert.strictEqual(res[0].id, "INT-101");
  });

  // 5. Combined Search + Filters
  test("FilterService handles combined domain + mode + query", () => {
    filterService.reset();
    filterService.setState({
      domain: "Full Stack Development",
      mode: "remote",
      searchQuery: "JavaScript"
    });
    const res = filterService.apply(items);
    assert.strictEqual(res.length, 1);
    assert.strictEqual(res[0].id, "INT-101");
  });

  // 6. Empty State Condition
  test("FilterService produces empty array when search doesn't match anything", () => {
    filterService.reset();
    filterService.setState({ searchQuery: "non_existent_xyz_123" });
    const res = filterService.apply(items);
    assert.strictEqual(res.length, 0, "Should return 0 matches");
  });

  // 7. Sorting
  test("FilterService sorts by openings descending", () => {
    filterService.reset();
    filterService.setState({ sortBy: "openings-desc" });
    const res = filterService.apply(items);
    for (let i = 0; i < res.length - 1; i++) {
      assert(res[i].openings >= res[i + 1].openings, "Must be sorted descending by openings");
    }
  });

  test("FilterService sorts by title alphabetically A-Z", () => {
    filterService.reset();
    filterService.setState({ sortBy: "title-asc" });
    const res = filterService.apply(items);
    for (let i = 0; i < res.length - 1; i++) {
      assert(res[i].title.localeCompare(res[i + 1].title) <= 0, "Must be sorted alphabetically");
    }
  });

  // 8. Error Simulation
  test("DataService throws error when simulateError is enabled", async () => {
    dataService.setSimulateError(true);
    let thrown = false;
    try {
      await dataService.fetchInternships(0);
    } catch (e) {
      thrown = true;
      assert(e.message.includes("Simulated network outage"));
    }
    assert(thrown, "Expected simulateError to throw an exception");
    dataService.setSimulateError(false);
  });

  console.log(`\nResults: ${passed} of ${total} tests passed.`);
  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
