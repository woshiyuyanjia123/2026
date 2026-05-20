const page = document.body.dataset.page;
const defaultLang = document.body.dataset.defaultLang || "en";
const params = new URLSearchParams(window.location.search);
let currentLang = params.get("lang") || defaultLang;

const state = {
  africa: null,
  china: null,
  match: null
};

const I18N = {
  en: {
    navAfrica: "Africa",
    navChina: "China",
    navMatch: "Match",
    langZh: "中文",
    langEn: "English",
    heroAfrica: "Opportunity Board",
    heroChina: "Participant Network",
    heroMatch: "Matching Center",
    regionKicker: "Regional Signals",
    regionTitle: "Where current project demand is building",
    featuredProjects: "Featured Projects",
    featuredProjectsTitle: "Primary cases reshaping the demo",
    featuredCompanies: "Project Companies",
    featuredCompaniesTitle: "Key owners and developers behind the opportunities",
    opportunityList: "Opportunity Flow",
    opportunityListTitle: "Tender and investment entries",
    opportunityDetail: "Opportunity Detail",
    projectOverview: "Project Overview",
    investmentHighlights: "Investment Highlights",
    lots: "Packages / Tracks",
    qualifications: "Qualification Requirements",
    commercialTerms: "Commercial Terms",
    goMatch: "Open Matching Center",
    filterAllRegion: "All regions",
    filterAllCountry: "All countries",
    filterAllSector: "All sectors",
    filterAllMode: "All modes",
    filterAllRole: "All roles",
    filterAllMarket: "All markets",
    chinaList: "China-side Participants",
    chinaListTitle: "Participants, ecosystem partners, and target accounts",
    chinaDetail: "Participant Detail",
    companyProfiles: "Company Profiles",
    companyProfilesTitle: "Priority company cards for follow-up",
    visitBrief: "Visit Brief",
    visitGoals: "Visit Goals",
    decisionChain: "Decision Chain",
    cooperationSignals: "Cooperation Signals",
    roleFit: "Role Fit Summary",
    roleFitTitle: "Which opportunities fit this participant best",
    shortlistTitle: "Save Intent",
    shortlistButton: "Save shortlist",
    shortlistPlaceholder: "Write why this participant is worth tracking.",
    shortlistSaved: "Shortlist saved.",
    matchMethod: "Scoring Logic",
    matchMethodTitle: "One explanation model, two matching modes",
    matchMode: "Matching Mode",
    tenderMode: "Tender participation",
    investmentMode: "Investment collaboration",
    activeOpportunity: "Active Opportunity",
    activeOpportunityTitle: "Project, company, and commercial context",
    relatedCompanies: "Related Companies",
    whyRecommended: "Why Recommended",
    rankedMatches: "Ranked Matches",
    rankedMatchesTitle: "China-side participants sorted by fit",
    openChina: "View participant",
    saveFromMatch: "Save to shortlist",
    roleProjectFit: "Role fit",
    credentialsTrack: "Credentials",
    executionCapacity: "Execution",
    regionalFit: "Regional",
    collaborationFit: "Readiness",
    langyanTitle: "Langyan Collaboration Layer",
    exploreModeHint: "From project discovery to CRM-enabled follow-up",
    summaryProject: "Project",
    summaryCompany: "Company",
    summaryOpportunity: "Opportunity",
    summaryMode: "Mode",
    savedIntents: "Saved Intents",
    currentProjectFit: "Current Fit Score",
    openMatch: "Open match",
    modeLabelTender: "Tender",
    modeLabelInvestment: "Investment",
    stepsAfrica: ["1. Review corridor", "2. Open opportunity", "3. Read terms", "4. Move into match"],
    stepsChina: ["1. Review participant", "2. Inspect profile", "3. Check opportunity fit", "4. Save intent"],
    stepsMatch: ["1. Choose mode", "2. Compare candidates", "3. Inspect reasons", "4. Push to shortlist"]
  },
  zh: {
    navAfrica: "海外项目",
    navChina: "中国参与方",
    navMatch: "匹配中心",
    langZh: "中文",
    langEn: "English",
    heroAfrica: "项目机会站",
    heroChina: "能力网络",
    heroMatch: "机会匹配中心",
    regionKicker: "区域信号",
    regionTitle: "当前重点机会在哪些区域形成",
    featuredProjects: "主案例项目",
    featuredProjectsTitle: "本轮 Demo 的新能源主线案例",
    featuredCompanies: "项目公司",
    featuredCompaniesTitle: "围绕机会方的业主、开发商与关键公司画像",
    opportunityList: "机会入口",
    opportunityListTitle: "招标与投资合作入口",
    opportunityDetail: "机会详情",
    projectOverview: "项目概览",
    investmentHighlights: "投资亮点",
    lots: "标段 / 赛道",
    qualifications: "资质要求",
    commercialTerms: "商务条款",
    goMatch: "进入匹配中心",
    filterAllRegion: "全部区域",
    filterAllCountry: "全部国家",
    filterAllSector: "全部赛道",
    filterAllMode: "全部模式",
    filterAllRole: "全部角色",
    filterAllMarket: "全部市场",
    chinaList: "中国参与方",
    chinaListTitle: "参与方、生态合作方与目标客户画像",
    chinaDetail: "参与方详情",
    companyProfiles: "重点公司画像",
    companyProfilesTitle: "适合跟进的公司卡片",
    visitBrief: "拜访简报",
    visitGoals: "拜访目标",
    decisionChain: "关键决策链",
    cooperationSignals: "合作信号",
    roleFit: "角色适配摘要",
    roleFitTitle: "这家参与方最适合切入哪些机会",
    shortlistTitle: "保存意向",
    shortlistButton: "保存 shortlist",
    shortlistPlaceholder: "写下这家参与方值得跟进的原因。",
    shortlistSaved: "已成功保存意向。",
    matchMethod: "评分逻辑",
    matchMethodTitle: "一套解释框架，同时支持招标匹配和投资合作匹配",
    matchMode: "匹配模式",
    tenderMode: "招标参与匹配",
    investmentMode: "投资合作匹配",
    activeOpportunity: "当前机会",
    activeOpportunityTitle: "项目、公司与商业条件上下文",
    relatedCompanies: "相关公司",
    whyRecommended: "为什么推荐",
    rankedMatches: "排序结果",
    rankedMatchesTitle: "按匹配度排序的中国参与方",
    openChina: "查看参与方",
    saveFromMatch: "加入 shortlist",
    roleProjectFit: "角色适配",
    credentialsTrack: "资质履历",
    executionCapacity: "实施交付",
    regionalFit: "区域经验",
    collaborationFit: "协同准备度",
    langyanTitle: "朗言协同方式",
    exploreModeHint: "从项目发现到 CRM 协同跟进",
    summaryProject: "项目",
    summaryCompany: "公司",
    summaryOpportunity: "机会",
    summaryMode: "模式",
    savedIntents: "已保存意向",
    currentProjectFit: "当前机会匹配分",
    openMatch: "进入匹配",
    modeLabelTender: "招标",
    modeLabelInvestment: "投资",
    stepsAfrica: ["1. 看区域与项目", "2. 打开机会", "3. 看条款与亮点", "4. 进入匹配中心"],
    stepsChina: ["1. 看参与方", "2. 看公司画像", "3. 看机会适配", "4. 保存意向"],
    stepsMatch: ["1. 选择模式", "2. 对比候选", "3. 看推荐原因", "4. 保存 shortlist"]
  }
};

function qs(selector) {
  return document.querySelector(selector);
}

function setHtml(selector, html) {
  const node = qs(selector);
  if (node) node.innerHTML = html;
}

function setText(selector, text) {
  const node = qs(selector);
  if (node) node.textContent = text || "";
}

function label(key) {
  return I18N[currentLang][key];
}

function modeLabel(mode) {
  return mode === "investment" ? label("modeLabelInvestment") : label("modeLabelTender");
}

function buildUrl(path, extra = {}) {
  const next = new URLSearchParams(window.location.search);
  next.set("lang", currentLang);
  Object.entries(extra).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") next.delete(key);
    else next.set(key, value);
  });
  return `${path}?${next.toString()}`;
}

function renderHeader(active) {
  setHtml(
    "#site-header",
    `
      <div class="topbar">
        <a class="brand" href="${buildUrl("/africa")}">CEPI</a>
        <div class="brand-copy">
          <strong>${state[page]?.meta?.title || "CEPI"}</strong>
          <span>${label("exploreModeHint")}</span>
        </div>
        <nav class="nav-links">
          <a class="${active === "africa" ? "active" : ""}" href="${buildUrl("/africa")}">${label("navAfrica")}</a>
          <a class="${active === "china" ? "active" : ""}" href="${buildUrl("/china")}">${label("navChina")}</a>
          <a class="${active === "match" ? "active" : ""}" href="${buildUrl("/match")}">${label("navMatch")}</a>
        </nav>
        <div class="lang-switch">
          <a class="${currentLang === "zh" ? "active" : ""}" href="${buildUrl(window.location.pathname, { lang: "zh" })}">${label("langZh")}</a>
          <a class="${currentLang === "en" ? "active" : ""}" href="${buildUrl(window.location.pathname, { lang: "en" })}">${label("langEn")}</a>
        </div>
      </div>
    `
  );
}

function renderHero(kicker, overview) {
  setText("#hero-kicker", kicker);
  setText("#hero-title", overview.title);
  setText("#hero-text", overview.text);
}

function renderStats(items) {
  setHtml(
    "#stats-grid",
    items
      .map(
        item => `
          <article class="stat-card">
            <span class="stat-value">${item.value}</span>
            <span class="stat-label">${item.label}</span>
          </article>
        `
      )
      .join("")
  );
}

function renderFlow(stepKey) {
  setHtml("#flow-steps", I18N[currentLang][stepKey].map(step => `<span class="flow-step">${step}</span>`).join(""));
}

function renderLangyan(selector, payload) {
  if (!payload) return;
  setHtml(
    selector,
    `
      <article class="method-surface">
        <div class="panel-head compact">
          <div>
            <p class="kicker">${label("langyanTitle")}</p>
            <h3>${payload.title}</h3>
          </div>
        </div>
        <div class="signal-grid">
          ${payload.items
            .map(
              item => `
                <article class="signal-card">
                  <h4>${item.title}</h4>
                  <p>${item.text}</p>
                </article>
              `
            )
            .join("")}
        </div>
      </article>
    `
  );
}

function renderFeaturedProjects(items) {
  setText("#featured-projects-kicker", label("featuredProjects"));
  setText("#featured-projects-title", label("featuredProjectsTitle"));
  setHtml(
    "#featured-project-grid",
    items
      .map(
        item => `
          <article class="project-card">
            <div class="card-head">
              <h3>${item.name}</h3>
              <span class="pill">${item.projectTypeLabel}</span>
            </div>
            <p class="note-text">${item.location}</p>
            <p>${item.capacityText}</p>
            <div class="summary-stack">
              <span><strong>${label("summaryOpportunity")}:</strong> ${item.investmentAmount}</span>
              <span><strong>${label("summaryProject")}:</strong> ${item.timeline}</span>
            </div>
          </article>
        `
      )
      .join("")
  );
}

function renderFeaturedCompanies(items) {
  setText("#featured-companies-kicker", label("featuredCompanies"));
  setText("#featured-companies-title", label("featuredCompaniesTitle"));
  setHtml(
    "#featured-company-grid",
    items
      .map(
        item => `
          <article class="company-card">
            <div class="card-head">
              <h3>${item.name}</h3>
              <span class="pill subtle">${item.companyTypeLabel}</span>
            </div>
            <p>${item.summary}</p>
            <div class="tag-row">${item.signals.slice(0, 2).map(signal => `<span class="tag">${signal}</span>`).join("")}</div>
          </article>
        `
      )
      .join("")
  );
}

function renderOpportunityDetail(opportunity) {
  setText("#detail-title", opportunity.title);
  setHtml(
    "#opportunity-detail",
    `
      <div class="detail-headline">
        <span class="pill">${modeLabel(opportunity.mode)}</span>
        <span class="pill subtle">${opportunity.country}</span>
        <span class="pill subtle">${opportunity.region}</span>
      </div>
      <p class="detail-body">${opportunity.description}</p>
      <div class="summary-grid">
        <article class="summary-card">
          <span class="summary-label">${label("summaryProject")}</span>
          <strong>${opportunity.project?.name || "-"}</strong>
        </article>
        <article class="summary-card">
          <span class="summary-label">${label("summaryCompany")}</span>
          <strong>${opportunity.ownerCompany?.name || opportunity.buyerName}</strong>
        </article>
        <article class="summary-card">
          <span class="summary-label">${label("summaryMode")}</span>
          <strong>${modeLabel(opportunity.mode)}</strong>
        </article>
        <article class="summary-card">
          <span class="summary-label">${label("summaryOpportunity")}</span>
          <strong>${opportunity.tenderValue}</strong>
        </article>
      </div>
      <div class="signal-grid">
        <article class="signal-card">
          <h4>${label("projectOverview")}</h4>
          <p>${opportunity.project?.capacityText || "-"}</p>
          <div class="tag-row">${(opportunity.project?.advantages || []).slice(0, 3).map(item => `<span class="tag">${item}</span>`).join("")}</div>
        </article>
        <article class="signal-card">
          <h4>${label("investmentHighlights")}</h4>
          <div class="tag-row">${opportunity.highlights.map(item => `<span class="tag">${item}</span>`).join("")}</div>
        </article>
      </div>
      <div class="detail-columns">
        <article class="detail-column">
          <h4>${label("lots")}</h4>
          <ul class="bullet-list">${opportunity.lots.map(item => `<li>${item}</li>`).join("")}</ul>
        </article>
        <article class="detail-column">
          <h4>${label("qualifications")}</h4>
          <ul class="bullet-list">${opportunity.qualificationRequirements.map(item => `<li>${item}</li>`).join("")}</ul>
        </article>
      </div>
      <article class="signal-card">
        <h4>${label("commercialTerms")}</h4>
        <ul class="bullet-list">${opportunity.commercialTerms.map(item => `<li>${item}</li>`).join("")}</ul>
      </article>
      <div class="cta-row">
        <a class="primary-button" href="${buildUrl("/match", { tenderId: opportunity.id, projectId: opportunity.projectId, mode: opportunity.mode })}">${label("goMatch")}</a>
      </div>
    `
  );
}

function breakdownLabel(key) {
  const mapping = {
    sectorScore: label("roleProjectFit"),
    certScore: label("credentialsTrack"),
    capacityScore: label("executionCapacity"),
    marketScore: label("regionalFit"),
    opsScore: label("collaborationFit")
  };
  return mapping[key] || key;
}

async function fetchJson(url) {
  const response = await fetch(url);
  return response.json();
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  return { response, result };
}

function bindAfricaFilters(data) {
  const regionOptions = [`<option value="">${label("filterAllRegion")}</option>`]
    .concat(data.filters.regions.map(item => `<option value="${item.key}" ${item.key === data.filters.region ? "selected" : ""}>${item.label}</option>`))
    .join("");
  const countryOptions = [`<option value="">${label("filterAllCountry")}</option>`]
    .concat(data.filters.countries.map(item => `<option value="${item.key}" ${item.key === data.filters.country ? "selected" : ""}>${item.label}</option>`))
    .join("");
  const sectorOptions = [`<option value="">${label("filterAllSector")}</option>`]
    .concat(data.filters.sectors.map(item => `<option value="${item.key}" ${item.key === data.filters.sector ? "selected" : ""}>${item.label}</option>`))
    .join("");
  const modeOptions = [`<option value="">${label("filterAllMode")}</option>`]
    .concat(data.filters.modes.map(item => `<option value="${item.key}" ${item.key === data.filters.mode ? "selected" : ""}>${item.label}</option>`))
    .join("");
  setHtml("#filter-region", regionOptions);
  setHtml("#filter-country", countryOptions);
  setHtml("#filter-sector", sectorOptions);
  setHtml("#filter-mode", modeOptions);

  qs("#africa-filters").addEventListener("change", () => {
    window.location.href = buildUrl("/africa", {
      region: qs("#filter-region").value,
      country: qs("#filter-country").value,
      sector: qs("#filter-sector").value,
      mode: qs("#filter-mode").value
    });
  });
}

async function loadAfrica() {
  state.africa = await fetchJson(`/api/africa?${new URLSearchParams(window.location.search).toString()}`);
  renderHeader("africa");
  renderHero(label("heroAfrica"), state.africa.overview);
  renderStats(state.africa.stats);
  renderFlow("stepsAfrica");
  setText("#region-kicker", label("regionKicker"));
  setText("#region-title", label("regionTitle"));
  setText("#opportunity-kicker", label("opportunityList"));
  setText("#opportunity-list-title", label("opportunityListTitle"));
  setText("#detail-kicker", label("opportunityDetail"));

  setHtml(
    "#region-grid",
    state.africa.regions
      .map(
        region => `
          <article class="region-card">
            <h3>${region.name}</h3>
            <p>${region.signal}</p>
            <div class="tag-row">${region.countries.map(item => `<span class="tag">${item.label}</span>`).join("")}</div>
          </article>
        `
      )
      .join("")
  );

  renderFeaturedProjects(state.africa.featuredProjects);
  renderFeaturedCompanies(state.africa.featuredCompanies);
  bindAfricaFilters(state.africa);

  setHtml(
    "#opportunity-list",
    state.africa.tenders
      .map(
        item => `
          <article class="tender-card ${item.id === state.africa.activeTender.id ? "active" : ""}" data-id="${item.id}">
            <div class="card-head">
              <h3>${item.title}</h3>
              <span class="pill">${modeLabel(item.mode)}</span>
            </div>
            <p>${item.project?.name || item.buyerName}</p>
            <div class="meta-row">
              <span>${item.country}</span>
              <span>${item.deadline}</span>
              <span>${item.tenderValue}</span>
            </div>
            <div class="tag-row">${item.highlights.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join("")}</div>
          </article>
        `
      )
      .join("")
  );

  renderOpportunityDetail(state.africa.activeTender);

  document.querySelectorAll(".tender-card").forEach(card => {
    card.addEventListener("click", async () => {
      const tenderId = card.dataset.id;
      await postJson("/api/state/tender", { tenderId });
      window.location.href = buildUrl("/africa", {
        tenderId,
        region: state.africa.filters.region,
        country: state.africa.filters.country,
        sector: state.africa.filters.sector,
        mode: state.africa.filters.mode
      });
    });
  });
}

function bindChinaFilters(data) {
  setHtml(
    "#china-sector",
    [`<option value="">${label("filterAllSector")}</option>`]
      .concat(data.filters.sectors.map(item => `<option value="${item.key}" ${item.key === data.filters.sector ? "selected" : ""}>${item.label}</option>`))
      .join("")
  );
  setHtml(
    "#china-role",
    [`<option value="">${label("filterAllRole")}</option>`]
      .concat(data.filters.roles.map(item => `<option value="${item.key}" ${item.key === data.filters.role ? "selected" : ""}>${item.label}</option>`))
      .join("")
  );
  setHtml(
    "#china-market",
    [`<option value="">${label("filterAllMarket")}</option>`]
      .concat(data.filters.markets.map(item => `<option value="${item.key}" ${item.key === data.filters.market ? "selected" : ""}>${item.label}</option>`))
      .join("")
  );

  qs("#china-filters").addEventListener("change", () => {
    window.location.href = buildUrl("/china", {
      sector: qs("#china-sector").value,
      role: qs("#china-role").value,
      market: qs("#china-market").value,
      tenderId: state.china.activeTender.id
    });
  });
}

function renderChinaDetail(data) {
  const supplier = data.activeSupplier;
  setText("#participant-detail-title", supplier.company);
  setHtml(
    "#participant-detail",
    `
      <div class="detail-headline">
        <span class="pill">${supplier.roleLabel}</span>
        <span class="pill subtle">${supplier.exportYears}y</span>
      </div>
      <p class="detail-body">${supplier.productFocus}</p>
      <div class="summary-grid">
        <article class="summary-card">
          <span class="summary-label">${label("summaryCompany")}</span>
          <strong>${supplier.companyProfile?.name || supplier.company}</strong>
        </article>
        <article class="summary-card">
          <span class="summary-label">${label("currentProjectFit")}</span>
          <strong>${data.currentTenderScore.totalScore}</strong>
        </article>
        <article class="summary-card">
          <span class="summary-label">${label("summaryMode")}</span>
          <strong>${modeLabel(data.activeTender.mode)}</strong>
        </article>
        <article class="summary-card">
          <span class="summary-label">${label("summaryProject")}</span>
          <strong>${data.activeTender.project?.name || "-"}</strong>
        </article>
      </div>
      <div class="tag-row">${supplier.verifiedTags.map(tag => `<span class="tag">${tag}</span>`).join("")}</div>
      <div class="meta-grid">
        <span>${supplier.city}, ${supplier.province}</span>
        <span>${supplier.monthlyCapacity}/month</span>
        <span>${supplier.leadDays} days</span>
        <span>${supplier.responseHours}h response</span>
      </div>
      <article class="signal-card">
        <h4>${label("whyRecommended")}</h4>
        <ul class="bullet-list">${data.currentTenderScore.reasons.map(item => `<li>${item}</li>`).join("")}</ul>
      </article>
    `
  );
}

function renderCompanyProfiles(items) {
  setText("#company-profiles-kicker", label("companyProfiles"));
  setText("#company-profiles-title", label("companyProfilesTitle"));
  setHtml(
    "#company-profile-grid",
    items
      .map(
        item => `
          <article class="company-card compact-card">
            <div class="card-head">
              <h3>${item.name}</h3>
              <span class="pill subtle">${item.companyTypeLabel}</span>
            </div>
            <p>${item.summary}</p>
            <div class="tag-row">${item.highlights.slice(0, 2).map(line => `<span class="tag">${line}</span>`).join("")}</div>
          </article>
        `
      )
      .join("")
  );
}

function renderVisitBrief(brief) {
  setText("#visit-brief-kicker", label("visitBrief"));
  setText("#visit-brief-title", label("visitBrief"));
  if (!brief) {
    setHtml("#visit-brief-surface", `<article class="signal-card"><p>-</p></article>`);
    return;
  }
  setHtml(
    "#visit-brief-surface",
    `
      <article class="signal-card">
        <h4>${label("visitGoals")}</h4>
        <ul class="bullet-list">${brief.visitGoals.map(item => `<li>${item}</li>`).join("")}</ul>
      </article>
      <article class="signal-card">
        <h4>${label("decisionChain")}</h4>
        <div class="tag-row">${brief.decisionMakers.map(item => `<span class="tag">${item}</span>`).join("")}</div>
        <p class="note-text">${brief.productFocus}</p>
      </article>
      <article class="signal-card">
        <h4>${label("cooperationSignals")}</h4>
        <ul class="bullet-list">${brief.coopSignals.map(item => `<li>${item}</li>`).join("")}</ul>
      </article>
    `
  );
}

function renderRoleFitSummary(summary) {
  setText("#role-fit-kicker", label("roleFit"));
  setText("#role-fit-title", label("roleFitTitle"));
  setHtml(
    "#role-fit-list",
    summary.items
      .map(
        item => `
          <article class="mini-card">
            <div class="card-head">
              <h4>${item.title}</h4>
              <span class="score-pill">${item.score}</span>
            </div>
            <p>${item.projectName}</p>
            <div class="tag-row">${item.explanation.map(line => `<span class="tag">${line}</span>`).join("")}</div>
            <a class="mini-link" href="${buildUrl("/match", { tenderId: item.tenderId, mode: item.mode })}">${label("openMatch")}</a>
          </article>
        `
      )
      .join("")
  );
}

async function loadChina() {
  state.china = await fetchJson(`/api/china?${new URLSearchParams(window.location.search).toString()}`);
  renderHeader("china");
  renderHero(label("heroChina"), state.china.overview);
  renderStats(state.china.stats);
  renderFlow("stepsChina");
  setText("#participant-list-kicker", label("chinaList"));
  setText("#participant-list-title", label("chinaListTitle"));
  setText("#participant-detail-kicker", label("chinaDetail"));
  setText("#shortlist-panel-title", label("shortlistTitle"));
  setText("#shortlist-submit", label("shortlistButton"));
  qs("#shortlist-note").placeholder = label("shortlistPlaceholder");

  bindChinaFilters(state.china);
  setHtml(
    "#participant-list",
    state.china.suppliers
      .map(
        item => `
          <article class="supplier-card ${item.id === state.china.activeSupplier.id ? "active" : ""}" data-id="${item.id}">
            <div class="card-head">
              <h3>${item.company}</h3>
              <span class="pill">${item.roleLabel}</span>
            </div>
            <p>${item.productFocus}</p>
            <div class="meta-row">
              <span>${item.city}, ${item.province}</span>
              <span>${item.leadDays} days</span>
              <span>${item.monthlyCapacity}/month</span>
            </div>
            <div class="tag-row">${item.verifiedTags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join("")}</div>
          </article>
        `
      )
      .join("")
  );

  renderChinaDetail(state.china);
  renderCompanyProfiles(state.china.companyProfiles);
  renderVisitBrief(state.china.visitBrief);
  renderRoleFitSummary(state.china.roleFitSummary);
  renderLangyan("#langyan-surface", state.china.langyanMethod);

  qs("#shortlist-form").addEventListener("submit", async event => {
    event.preventDefault();
    const { response, result } = await postJson("/api/intent/shortlist", {
      tenderId: state.china.activeTender.id,
      supplierId: state.china.activeSupplier.id,
      projectId: state.china.activeTender.projectId,
      mode: state.china.activeTender.mode,
      note: qs("#shortlist-note").value
    });
    qs("#shortlist-feedback").textContent = response.ok ? label("shortlistSaved") : result.error;
  });

  document.querySelectorAll(".supplier-card").forEach(card => {
    card.addEventListener("click", async () => {
      const supplierId = card.dataset.id;
      await postJson("/api/state/supplier", { supplierId });
      window.location.href = buildUrl("/china", {
        supplierId,
        tenderId: state.china.activeTender.id,
        sector: state.china.filters.sector,
        role: state.china.filters.role,
        market: state.china.filters.market
      });
    });
  });
}

function renderMatchOpportunity(data) {
  const item = data.activeTender;
  setText("#match-opportunity-kicker", label("activeOpportunity"));
  setText("#match-opportunity-title", label("activeOpportunityTitle"));
  setHtml(
    "#match-opportunity-detail",
    `
      <div class="detail-headline">
        <span class="pill">${modeLabel(item.mode)}</span>
        <span class="pill subtle">${item.country}</span>
      </div>
      <h3>${item.title}</h3>
      <p class="detail-body">${item.description}</p>
      <div class="summary-grid">
        <article class="summary-card">
          <span class="summary-label">${label("summaryProject")}</span>
          <strong>${data.relatedProject?.name || "-"}</strong>
        </article>
        <article class="summary-card">
          <span class="summary-label">${label("summaryCompany")}</span>
          <strong>${item.ownerCompany?.name || item.buyerName}</strong>
        </article>
        <article class="summary-card">
          <span class="summary-label">${label("summaryMode")}</span>
          <strong>${modeLabel(item.mode)}</strong>
        </article>
        <article class="summary-card">
          <span class="summary-label">${label("summaryOpportunity")}</span>
          <strong>${item.tenderValue}</strong>
        </article>
      </div>
      <article class="signal-card">
        <h4>${label("projectOverview")}</h4>
        <p>${data.relatedProject?.capacityText || "-"}</p>
        <ul class="bullet-list">${(data.relatedProject?.advantages || []).slice(0, 3).map(line => `<li>${line}</li>`).join("")}</ul>
      </article>
    `
  );

  setText("#related-companies-title", label("relatedCompanies"));
  setHtml(
    "#related-company-list",
    data.relatedCompanies
      .map(
        item => `
          <article class="mini-card">
            <div class="card-head">
              <h4>${item.name}</h4>
              <span class="pill subtle">${item.companyTypeLabel}</span>
            </div>
            <p>${item.summary}</p>
          </article>
        `
      )
      .join("")
  );
}

function renderMatchMethods(items) {
  setText("#method-kicker", label("matchMethod"));
  setText("#method-title", label("matchMethodTitle"));
  setHtml(
    "#method-grid",
    items
      .map(
        item => `
          <article class="method-card">
            <div class="card-head">
              <h3>${item.name}</h3>
              <span class="score-pill">${item.weight}</span>
            </div>
            <p>${item.description}</p>
          </article>
        `
      )
      .join("")
  );
}

function renderModeSwitch(data) {
  setText("#mode-kicker", label("matchMode"));
  setText("#mode-title", data.activeTender.mode === "investment" ? label("investmentMode") : label("tenderMode"));
  setHtml(
    "#mode-switch",
    data.opportunities
      .map(
        item => `
          <a class="mode-chip ${item.id === data.activeTender.id ? "active" : ""}" href="${buildUrl("/match", { tenderId: item.id, mode: item.mode, projectId: item.projectId })}">
            <span>${modeLabel(item.mode)}</span>
            <strong>${item.title}</strong>
          </a>
        `
      )
      .join("")
  );
}

function renderRecommendationReasons(items) {
  setText("#why-kicker", label("whyRecommended"));
  setText("#why-title", label("whyRecommended"));
  setHtml(
    "#why-list",
    items
      .map(
        item => `
          <article class="mini-card">
            <div class="card-head">
              <h4>${item.supplierName}</h4>
            </div>
            <ul class="bullet-list">${item.reasons.map(reason => `<li>${reason}</li>`).join("")}</ul>
          </article>
        `
      )
      .join("")
  );
}

function renderShortlists(items) {
  setText("#shortlist-title", label("savedIntents"));
  setHtml(
    "#shortlist-list",
    items
      .map(
        item => `
          <article class="mini-card">
            <div class="card-head">
              <h4>${item.supplierName}</h4>
              <span class="score-pill">${item.score}</span>
            </div>
            <p>${item.projectName || item.tenderTitle}</p>
            <p class="note-text">${item.note || "-"}</p>
          </article>
        `
      )
      .join("")
  );
}

function renderMatches(data) {
  setText("#match-list-kicker", label("rankedMatches"));
  setText("#match-list-title", label("rankedMatchesTitle"));
  setHtml(
    "#match-list",
    data.matches
      .map(
        item => `
          <article class="match-card">
            <div class="card-head">
              <div>
                <h3>${item.supplier.company}</h3>
                <p>${item.supplier.roleLabel}</p>
              </div>
              <span class="score-badge">${item.score.totalScore}</span>
            </div>
            <p>${item.supplier.productFocus}</p>
            <div class="meta-row">
              <span>${item.supplier.city}, ${item.supplier.province}</span>
              <span>${item.supplier.leadDays} days</span>
              <span>${item.supplier.monthlyCapacity}/month</span>
              <span>${item.supplier.responseHours}h</span>
            </div>
            <div class="bar-list">
              ${Object.entries(item.score.breakdown)
                .map(
                  ([key, value]) => `
                    <div class="bar-row">
                      <span>${breakdownLabel(key)}</span>
                      <div class="bar-track"><div class="bar-fill" style="width:${Math.min(100, value * 3.2)}%"></div></div>
                      <strong>${value}</strong>
                    </div>
                  `
                )
                .join("")}
            </div>
            <div class="tag-row">${item.score.reasons.map(reason => `<span class="tag">${reason}</span>`).join("")}</div>
            <div class="cta-row">
              <a class="ghost-button" href="${buildUrl("/china", { supplierId: item.supplier.id, tenderId: data.activeTender.id })}">${label("openChina")}</a>
              <button class="primary-button shortlist-action" data-supplier="${item.supplier.id}">${label("saveFromMatch")}</button>
            </div>
          </article>
        `
      )
      .join("")
  );

  document.querySelectorAll(".shortlist-action").forEach(button => {
    button.addEventListener("click", async () => {
      const supplierId = button.dataset.supplier;
      const { response, result } = await postJson("/api/intent/shortlist", {
        tenderId: data.activeTender.id,
        supplierId,
        projectId: data.activeTender.projectId,
        mode: data.activeTender.mode,
        note: currentLang === "zh" ? "从匹配中心加入 shortlist。" : "Saved from the matching center."
      });
      if (!response.ok) {
        alert(result.error);
        return;
      }
      await loadMatch();
    });
  });
}

async function loadMatch() {
  state.match = await fetchJson(`/api/match?${new URLSearchParams(window.location.search).toString()}`);
  renderHeader("match");
  renderHero(label("heroMatch"), state.match.overview);
  renderStats(state.match.stats);
  renderFlow("stepsMatch");
  renderModeSwitch(state.match);
  renderMatchMethods(state.match.matchingMethod);
  renderMatchOpportunity(state.match);
  renderRecommendationReasons(state.match.recommendationReasons);
  renderShortlists(state.match.shortlists);
  renderMatches(state.match);
  renderLangyan("#match-langyan-surface", state.match.langyanMethod);
}

window.addEventListener("DOMContentLoaded", async () => {
  if (page === "africa") await loadAfrica();
  if (page === "china") await loadChina();
  if (page === "match") await loadMatch();
});
