const STORAGE_KEY = "bdr-signal-dashboard-v4";
const STAGES = [
  "New Lead",
  "Contacted",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
];

const state = loadState();
const elements = {
  todayLabel: document.querySelector("#todayLabel"),
  coverageLabel: document.querySelector("#coverageLabel"),
  leadCount: document.querySelector("#leadCount"),
  activeAccounts: document.querySelector("#activeAccounts"),
  openMrr: document.querySelector("#openMrr"),
  openArr: document.querySelector("#openArr"),
  wonAccounts: document.querySelector("#wonAccounts"),
  lostAccounts: document.querySelector("#lostAccounts"),
  searchInput: document.querySelector("#searchInput"),
  ownerFilter: document.querySelector("#ownerFilter"),
  sourceFilter: document.querySelector("#sourceFilter"),
  stageFilter: document.querySelector("#stageFilter"),
  hotAccounts: document.querySelector("#hotAccounts"),
  leaderboard: document.querySelector("#leaderboard"),
  stageBoard: document.querySelector("#stageBoard"),
  accountsTableBody: document.querySelector("#accountsTableBody"),
};

init();

function init() {
  if (elements.todayLabel) {
    renderDate();
  }

  renderFilters();
  bindEvents();
  render();
}

function loadState() {
  const fallback = createDefaultState();
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      ...fallback,
      ...parsed,
      filters: {
        ...fallback.filters,
        ...(parsed.filters || {}),
      },
      accounts: Array.isArray(parsed.accounts) && parsed.accounts.length > 0
        ? parsed.accounts.map(normalizeAccount)
        : fallback.accounts,
      leads: Array.isArray(parsed.leads) && parsed.leads.length > 0
        ? parsed.leads.map(normalizeLead)
        : fallback.leads,
    };
  } catch (error) {
    console.warn("Unable to parse saved state. Resetting.", error);
    return fallback;
  }
}

function createDefaultState() {
  return {
    filters: {
      search: "",
      owner: "All",
      source: "All",
      stage: "All",
    },
    accounts: [
      { company: "Asterlane Systems", owner: "BDR 01", source: "Outbound", stage: "Negotiation", mrr: 15000, arr: 180000, health: "Hot", status: "At Risk" },
      { company: "Brightforge Labs", owner: "BDR 02", source: "Inbound", stage: "Qualified", mrr: 8000, arr: 96000, health: "Warm", status: "Active" },
      { company: "CobaltNest", owner: "BDR 01", source: "Partner", stage: "Closed Won", mrr: 11000, arr: 132000, health: "Hot", status: "Won" },
      { company: "DriftScale", owner: "BDR 03", source: "Outbound", stage: "Proposal", mrr: 6000, arr: 72000, health: "Warm", status: "Active" },
      { company: "FluxHarbor", owner: "BDR 02", source: "Event", stage: "Closed Lost", mrr: 7333, arr: 88000, health: "Warm", status: "Lost" },
      { company: "GraniteFlow", owner: "BDR 03", source: "Outbound", stage: "Negotiation", mrr: 13000, arr: 156000, health: "Hot", status: "At Risk" },
      { company: "HaloBridge", owner: "BDR 04", source: "Partner", stage: "Qualified", mrr: 5333, arr: 64000, health: "Warm", status: "Active" },
      { company: "IonPeak", owner: "BDR 02", source: "Outbound", stage: "Closed Won", mrr: 17500, arr: 210000, health: "Hot", status: "Won" },
      { company: "KeystoneIQ", owner: "BDR 03", source: "Event", stage: "Proposal", mrr: 9833, arr: 118000, health: "Hot", status: "Active" },
      { company: "LumaStack", owner: "BDR 04", source: "Outbound", stage: "Closed Lost", mrr: 4500, arr: 54000, health: "Warm", status: "Lost" },
    ].map(normalizeAccount),
    leads: [
      { company: "EmberGrid", owner: "BDR 04", source: "Inbound", stage: "New Lead", potentialArr: 36000, status: "Early", health: "Cold" },
      { company: "JuniperCloud", owner: "BDR 01", source: "Inbound", stage: "Contacted", potentialArr: 42000, status: "Working", health: "Cold" },
      { company: "Northlane AI", owner: "BDR 02", source: "Outbound", stage: "Contacted", potentialArr: 76000, status: "Follow-up", health: "Warm" },
      { company: "OrbitWorks", owner: "BDR 03", source: "Partner", stage: "Qualified", potentialArr: 91000, status: "Review", health: "Warm" },
    ].map(normalizeLead),
  };
}

function normalizeAccount(account) {
  return {
    id: account.id || crypto.randomUUID(),
    company: String(account.company || "").trim() || "Unnamed account",
    owner: String(account.owner || "Unassigned").trim(),
    source: String(account.source || "Inbound").trim(),
    stage: STAGES.includes(account.stage) ? account.stage : "New Lead",
    mrr: Number(account.mrr) || 0,
    arr: Number(account.arr) || 0,
    health: ["Hot", "Warm", "Cold"].includes(account.health) ? account.health : "Warm",
    status: String(account.status || "Active").trim(),
  };
}

function normalizeLead(lead) {
  return {
    id: lead.id || crypto.randomUUID(),
    company: String(lead.company || "").trim() || "Unnamed lead",
    owner: String(lead.owner || "Unassigned").trim(),
    source: String(lead.source || "Inbound").trim(),
    stage: STAGES.includes(lead.stage) ? lead.stage : "New Lead",
    potentialArr: Number(lead.potentialArr) || 0,
    status: String(lead.status || "Early").trim(),
    health: ["Hot", "Warm", "Cold"].includes(lead.health) ? lead.health : "Warm",
  };
}

function bindEvents() {
  if (elements.searchInput) {
    elements.searchInput.addEventListener("input", (event) => {
      state.filters.search = event.target.value.trim();
      saveState();
      render();
    });
  }

  if (elements.ownerFilter) {
    elements.ownerFilter.addEventListener("change", (event) => {
      state.filters.owner = event.target.value;
      saveState();
      render();
    });
  }

  if (elements.sourceFilter) {
    elements.sourceFilter.addEventListener("change", (event) => {
      state.filters.source = event.target.value;
      saveState();
      render();
    });
  }

  if (elements.stageFilter) {
    elements.stageFilter.addEventListener("change", (event) => {
      state.filters.stage = event.target.value;
      saveState();
      render();
    });
  }
}

function render() {
  renderFilters();

  if (elements.leadCount) {
    renderSummary();
  }

  if (elements.hotAccounts) {
    renderHotAccounts();
  }

  if (elements.leaderboard) {
    renderLeaderboard();
  }

  if (elements.stageBoard) {
    renderStageBoard();
  }

  if (elements.accountsTableBody) {
    renderAccountsTable();
  }

  if (elements.coverageLabel && !elements.leadCount) {
    elements.coverageLabel.textContent = `${getVisibleAccounts().length} accounts in view`;
  }
}

function renderDate() {
  elements.todayLabel.textContent = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date());
}

function renderFilters() {
  const owners = [...new Set([...state.accounts, ...state.leads].map((record) => record.owner))];

  if (elements.ownerFilter) {
    populateSelect(elements.ownerFilter, owners, state.filters.owner, "BDR name");
  }

  if (elements.stageFilter) {
    populateSelect(elements.stageFilter, STAGES, state.filters.stage, "Opportunity stage");
  }

  if (elements.sourceFilter) {
    populateSelect(
      elements.sourceFilter,
      ["Inbound", "Outbound", "Partner", "Event"],
      state.filters.source,
      "Sources",
    );
  }

  if (elements.searchInput) {
    elements.searchInput.value = state.filters.search;
  }
}

function populateSelect(select, values, selectedValue, placeholder) {
  select.innerHTML = [
    `<option value="All">${escapeHtml(placeholder)}</option>`,
    ...values.map(
      (value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`,
    ),
  ].join("");

  select.value = values.includes(selectedValue) ? selectedValue : "All";
}

function renderSummary() {
  const allAccounts = state.accounts;
  const allLeads = state.leads;
  const activeAccounts = allAccounts.filter((account) => account.stage !== "Closed Lost");
  const wonAccounts = allAccounts.filter((account) => account.stage === "Closed Won");
  const lostAccounts = allAccounts.filter((account) => account.stage === "Closed Lost");
  const openMrr = allAccounts
    .filter((account) => !["Closed Won", "Closed Lost"].includes(account.stage))
    .reduce((sum, account) => sum + account.mrr, 0);
  const openArr = allAccounts
    .filter((account) => !["Closed Won", "Closed Lost"].includes(account.stage))
    .reduce((sum, account) => sum + account.arr, 0);

  elements.coverageLabel.textContent = `${allAccounts.length + allLeads.length} records in view`;
  elements.leadCount.textContent = String(allLeads.length);
  elements.activeAccounts.textContent = String(activeAccounts.length);
  elements.openMrr.textContent = formatCurrency(openMrr);
  elements.openArr.textContent = formatCurrency(openArr);
  elements.wonAccounts.textContent = String(wonAccounts.length);
  elements.lostAccounts.textContent = String(lostAccounts.length);
}

function renderHotAccounts() {
  const hotAccounts = state.accounts
    .filter((account) => account.health === "Hot" && account.stage !== "Closed Lost")
    .sort((left, right) => right.arr - left.arr)
    .slice(0, 4);

  elements.hotAccounts.innerHTML = hotAccounts.length
    ? hotAccounts.map((account) => `
      <article class="priority-card">
        <div class="priority-top">
          <div>
            <h3>${escapeHtml(account.company)}</h3>
            <p>${escapeHtml(account.owner)} • ${escapeHtml(account.stage)}</p>
          </div>
          <span class="tag is-danger">Hot</span>
        </div>
        <div class="priority-bottom">
          <span class="detail-label">MRR / ARR</span>
          <strong>${formatCurrency(account.mrr)} / ${formatCurrency(account.arr)}</strong>
        </div>
      </article>
    `).join("")
    : `<p class="detail-empty">No hot accounts in the current view.</p>`;
}

function renderLeaderboard() {
  const owners = [...new Set(getVisibleAccounts().map((record) => record.owner))];

  const summaries = owners
    .map((owner) => {
      const ownerAccounts = getVisibleAccounts().filter((account) => account.owner === owner);

      return {
        owner,
        totalAccounts: ownerAccounts.length,
        wonAccounts: ownerAccounts.filter((account) => account.stage === "Closed Won").length,
        lostAccounts: ownerAccounts.filter((account) => account.stage === "Closed Lost").length,
        openArr: ownerAccounts
          .filter((account) => !["Closed Won", "Closed Lost"].includes(account.stage))
          .reduce((sum, account) => sum + account.arr, 0),
      };
    })
    .sort((left, right) => right.openArr - left.openArr);

  elements.leaderboard.innerHTML = summaries
    .map((summary) => `
      <article class="leader-card">
        <div class="leader-row">
          <span class="leader-name">${escapeHtml(summary.owner)}</span>
        </div>
        <div class="leader-metrics">
          <div>
            <span class="detail-label">Accounts</span>
            <strong>${summary.totalAccounts}</strong>
          </div>
          <div>
            <span class="detail-label">Open ARR</span>
            <strong>${formatCurrency(summary.openArr)}</strong>
          </div>
          <div>
            <span class="detail-label">Won / Lost</span>
            <strong>${summary.wonAccounts} / ${summary.lostAccounts}</strong>
          </div>
        </div>
      </article>
    `)
    .join("");
}

function renderStageBoard() {
  elements.stageBoard.innerHTML = STAGES.map((stage) => {
    const stageAccounts = state.accounts.filter((account) => account.stage === stage);
    const totalArr = stageAccounts.reduce((sum, account) => sum + account.arr, 0);

    return `
      <article class="stage-card ${getStageToneClass(stage)}">
        <div class="stage-card-top">
          <p class="stage-label">${escapeHtml(stage)}</p>
          <span class="stage-dot"></span>
        </div>
        <div class="stage-card-main">
          <strong class="stage-count">${stageAccounts.length}</strong>
          <span class="stage-amount">${formatCurrency(totalArr)}</span>
        </div>
      </article>
    `;
  }).join("");
}

function renderAccountsTable() {
  const visibleAccounts = getVisibleAccounts().sort((left, right) => right.arr - left.arr);
  elements.accountsTableBody.innerHTML = visibleAccounts
    .map((account) => `
      <tr>
        <td>${escapeHtml(account.company)}</td>
        <td>${escapeHtml(account.owner)}</td>
        <td>${escapeHtml(account.source)}</td>
        <td><span class="tag ${getStageClass(account.stage)}">${escapeHtml(account.stage)}</span></td>
        <td>${formatCurrency(account.arr)}</td>
        <td><span class="tag ${getHealthClass(account.health)}">${escapeHtml(account.status)}</span></td>
      </tr>
    `)
    .join("");
}

function getVisibleAccounts() {
  return state.accounts.filter((account) => matchesCommonFilters(account));
}

function getVisibleLeads() {
  return state.leads.filter((lead) => matchesCommonFilters(lead));
}

function matchesCommonFilters(record) {
  const ownerMatch = state.filters.owner === "All" || record.owner === state.filters.owner;
  const sourceMatch = state.filters.source === "All" || record.source === state.filters.source;
  const stageMatch = state.filters.stage === "All" || record.stage === state.filters.stage;
  const searchMatch = matchesSearch(record);
  return ownerMatch && sourceMatch && stageMatch && searchMatch;
}

function matchesSearch(record) {
  const term = state.filters.search.trim().toLowerCase();

  if (!term) {
    return true;
  }

  const haystack = [
    record.company,
    record.owner,
    record.source,
    record.stage,
    record.status,
  ].join(" ").toLowerCase();

  return haystack.includes(term);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getHealthClass(health) {
  if (health === "Hot") {
    return "is-danger";
  }
  if (health === "Cold") {
    return "is-warning";
  }
  return "is-warm";
}

function getStageClass(stage) {
  if (stage === "Closed Won") {
    return "is-positive";
  }
  if (stage === "Closed Lost") {
    return "is-muted";
  }
  return "";
}

function getStageToneClass(stage) {
  if (stage === "Closed Won") {
    return "is-positive";
  }

  if (stage === "Closed Lost") {
    return "is-muted";
  }

  if (stage === "Negotiation" || stage === "Proposal") {
    return "is-focus";
  }

  return "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
