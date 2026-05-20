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
    africaKicker: "Africa Tender Board",
    regionKicker: "Regional Signals",
    regionTitle: "Browse demand by region",
    tenderKicker: "Tender Flow",
    tenderListTitle: "Active African tender opportunities",
    detailKicker: "Tender Detail",
    viewCandidates: "See matched China suppliers",
    filterRegion: "All regions",
    filterCountry: "All countries",
    filterSector: "All sectors",
    chinaKicker: "China Supplier Network",
    supplierKicker: "Supplier Directory",
    supplierListTitle: "Verified industrial suppliers in China",
    supplierDetailKicker: "Supplier Detail",
    supplierMatchTitle: "Matched African opportunities",
    chinaShortlistTitle: "Save this supplier for the current tender",
    chinaShortlistBtn: "Save shortlist intent",
    chinaShortlistPlaceholder: "Write a brief note for this supplier and tender.",
    matchKicker: "Matching Simulator",
    matchListTitle: "Ranked supplier matches for the active tender",
    matchDetailKicker: "Active Tender",
    matchDetailTitle: "Tender requirement summary",
    methodKicker: "Scoring Model",
    methodTitle: "Five weighted rules power the ranking",
    shortlistTitle: "Saved shortlist intents",
    shortlistSaved: "Shortlist saved successfully.",
    reasonLabel: "Why it scores",
    sectorScore: "Sector",
    certScore: "Cert",
    capacityScore: "Capacity",
    marketScore: "Africa",
    opsScore: "Ops",
    stepsAfrica: ["1. Scan region", "2. Open tender", "3. Read requirements", "4. Move to match"],
    stepsChina: ["1. Browse suppliers", "2. Inspect capability", "3. Check matched tenders", "4. Save intent"],
    stepsMatch: ["1. Load tender", "2. Rank suppliers", "3. Inspect score", "4. Save shortlist"]
  },
  zh: {
    navAfrica: "非洲站",
    navChina: "中国站",
    navMatch: "匹配页",
    langZh: "中文",
    langEn: "English",
    africaKicker: "非洲招标站",
    regionKicker: "区域机会",
    regionTitle: "先看地区，再看项目需求",
    tenderKicker: "招标流程",
    tenderListTitle: "活跃非洲招标项目",
    detailKicker: "招标详情",
    viewCandidates: "查看候选中国供应商",
    filterRegion: "全部区域",
    filterCountry: "全部国家",
    filterSector: "全部行业",
    chinaKicker: "中国供应站",
    supplierKicker: "供应商目录",
    supplierListTitle: "中国认证工业供应商",
    supplierDetailKicker: "供应商详情",
    supplierMatchTitle: "适配的非洲项目",
    chinaShortlistTitle: "把当前供应商加入本次招标意向池",
    chinaShortlistBtn: "保存意向",
    chinaShortlistPlaceholder: "填写这家供应商为何适合当前招标。",
    matchKicker: "匹配模拟",
    matchListTitle: "当前招标的供应商排序结果",
    matchDetailKicker: "当前招标",
    matchDetailTitle: "招标要求摘要",
    methodKicker: "评分规则",
    methodTitle: "五组加权规则驱动匹配排序",
    shortlistTitle: "已保存意向",
    shortlistSaved: "已成功保存意向。",
    reasonLabel: "得分原因",
    sectorScore: "行业",
    certScore: "认证",
    capacityScore: "产能交付",
    marketScore: "非洲经验",
    opsScore: "响应能力",
    stepsAfrica: ["1. 浏览区域", "2. 打开招标", "3. 看认证与 lot", "4. 进入匹配页"],
    stepsChina: ["1. 浏览供应商", "2. 看能力细节", "3. 看适配项目", "4. 保存意向"],
    stepsMatch: ["1. 载入招标", "2. 查看排序", "3. 看分项得分", "4. 保存 shortlist"]
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
  if (node) node.textContent = text;
}

function label(key) {
  return I18N[currentLang][key];
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
        <a class="brand" href="${buildUrl("/africa")}">ATB x CSN</a>
        <nav class="nav-links">
          <a class="${active === "africa" ? "active" : ""}" href="${buildUrl("/africa", page === "match" && state.match ? { tenderId: state.match.activeTender.id } : {})}">${label("navAfrica")}</a>
          <a class="${active === "china" ? "active" : ""}" href="${buildUrl("/china", page === "match" && state.match ? { tenderId: state.match.activeTender.id } : {})}">${label("navChina")}</a>
          <a class="${active === "match" ? "active" : ""}" href="${buildUrl("/match", page === "africa" && state.africa ? { tenderId: state.africa.activeTender.id } : {})}">${label("navMatch")}</a>
        </nav>
        <div class="lang-switch">
          <a class="${currentLang === "zh" ? "active" : ""}" href="${buildUrl(window.location.pathname, { lang: "zh" })}">${label("langZh")}</a>
          <a class="${currentLang === "en" ? "active" : ""}" href="${buildUrl(window.location.pathname, { lang: "en" })}">${label("langEn")}</a>
        </div>
      </div>
    `
  );
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
  setHtml(
    "#flow-steps",
    I18N[currentLang][stepKey].map(step => `<span class="flow-step">${step}</span>`).join("")
  );
}

function breakdownLabel(key) {
  return label(key);
}

async function fetchJson(url) {
  const response = await fetch(url);
  return response.json();
}

async function loadAfrica() {
  const query = new URLSearchParams(window.location.search);
  const url = `/api/africa?${query.toString()}`;
  state.africa = await fetchJson(url);
  renderHeader("africa");
  setText("#hero-kicker", label("africaKicker"));
  setText("#hero-title", state.africa.overview.title);
  setText("#hero-text", state.africa.overview.text);
  setText("#region-kicker", label("regionKicker"));
  setText("#region-title", label("regionTitle"));
  setText("#tender-kicker", label("tenderKicker"));
  setText("#tender-list-title", label("tenderListTitle"));
  setText("#detail-kicker", label("detailKicker"));
  renderStats(state.africa.stats);
  renderFlow("stepsAfrica");

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

  const regionOptions = [`<option value="">${label("filterRegion")}</option>`]
    .concat(state.africa.filters.regions.map(item => `<option value="${item.key}" ${item.key === state.africa.filters.region ? "selected" : ""}>${item.label}</option>`))
    .join("");
  const countryOptions = [`<option value="">${label("filterCountry")}</option>`]
    .concat(state.africa.filters.countries.map(item => `<option value="${item.key}" ${item.key === state.africa.filters.country ? "selected" : ""}>${item.label}</option>`))
    .join("");
  const sectorOptions = [`<option value="">${label("filterSector")}</option>`]
    .concat(state.africa.filters.sectors.map(item => `<option value="${item.key}" ${item.key === state.africa.filters.sector ? "selected" : ""}>${item.label}</option>`))
    .join("");
  setHtml("#filter-region", regionOptions);
  setHtml("#filter-country", countryOptions);
  setHtml("#filter-sector", sectorOptions);

  setHtml(
    "#tender-list",
    state.africa.tenders
      .map(
        tender => `
          <article class="tender-card ${tender.id === state.africa.activeTender.id ? "active" : ""}" data-id="${tender.id}">
            <div class="card-head">
              <h3>${tender.title}</h3>
              <span class="pill">${tender.country}</span>
            </div>
            <p>${tender.buyerName} · ${tender.buyerType}</p>
            <div class="meta-row">
              <span>${tender.sector}</span>
              <span>${tender.deadline}</span>
              <span>${tender.tenderValue}</span>
            </div>
            <div class="tag-row">${tender.certificationsRequired.map(item => `<span class="tag">${item}</span>`).join("")}</div>
          </article>
        `
      )
      .join("")
  );

  const active = state.africa.activeTender;
  setText("#detail-title", active.title);
  setHtml(
    "#tender-detail",
    `
      <div class="detail-headline">
        <span class="pill">${active.country}</span>
        <span class="pill subtle">${active.region}</span>
      </div>
      <p class="detail-body">${active.description}</p>
      <div class="meta-grid">
        <span>${active.buyerName}</span>
        <span>${active.buyerType}</span>
        <span>${active.deadline}</span>
        <span>${active.tenderValue}</span>
        <span>${active.targetLeadDays} days</span>
      </div>
      <h4>Highlights</h4>
      <div class="tag-row">${active.highlights.map(item => `<span class="tag">${item}</span>`).join("")}</div>
      <h4>Lots</h4>
      <div class="tag-row">${active.lots.map(item => `<span class="tag">${item}</span>`).join("")}</div>
      <div class="cta-row">
        <a class="primary-button" href="${buildUrl("/match", { tenderId: active.id })}">${label("viewCandidates")}</a>
      </div>
    `
  );

  qs("#africa-filters").addEventListener("change", () => {
    const next = {
      region: qs("#filter-region").value,
      country: qs("#filter-country").value,
      sector: qs("#filter-sector").value
    };
    window.location.href = buildUrl("/africa", next);
  });

  document.querySelectorAll(".tender-card").forEach(card => {
    card.addEventListener("click", async () => {
      const tenderId = card.dataset.id;
      await fetch("/api/state/tender", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenderId })
      });
      window.location.href = buildUrl("/africa", { tenderId });
    });
  });
}

async function loadChina() {
  const query = new URLSearchParams(window.location.search);
  const url = `/api/china?${query.toString()}`;
  state.china = await fetchJson(url);
  renderHeader("china");
  setText("#hero-kicker", label("chinaKicker"));
  setText("#hero-title", state.china.overview.title);
  setText("#hero-text", state.china.overview.text);
  setText("#supplier-kicker", label("supplierKicker"));
  setText("#supplier-list-title", label("supplierListTitle"));
  setText("#supplier-detail-kicker", label("supplierDetailKicker"));
  setText("#supplier-match-title", label("supplierMatchTitle"));
  setText("#china-shortlist-title", label("chinaShortlistTitle"));
  setText("#china-shortlist-button", label("chinaShortlistBtn"));
  qs("#china-shortlist-note").placeholder = label("chinaShortlistPlaceholder");
  renderStats(state.china.stats);
  renderFlow("stepsChina");

  setHtml(
    "#china-sector",
    [`<option value="">${label("filterSector")}</option>`]
      .concat(state.china.filters.sectors.map(item => `<option value="${item.key}" ${item.key === state.china.filters.sector ? "selected" : ""}>${item.label}</option>`))
      .join("")
  );
  setHtml(
    "#china-cert",
    [`<option value="">All certifications</option>`]
      .concat(state.china.filters.certifications.map(item => `<option value="${item}" ${item === state.china.filters.cert ? "selected" : ""}>${item}</option>`))
      .join("")
  );
  setHtml(
    "#china-market",
    [`<option value="">Africa market / region</option>`]
      .concat(state.china.filters.markets.map(item => `<option value="${item.key}" ${item.key === state.china.filters.market ? "selected" : ""}>${item.label}</option>`))
      .join("")
  );

  setHtml(
    "#supplier-list",
    state.china.suppliers
      .map(
        supplier => `
          <article class="supplier-card ${supplier.id === state.china.activeSupplier.id ? "active" : ""}" data-id="${supplier.id}">
            <div class="card-head">
              <h3>${supplier.company}</h3>
              <span class="pill">${supplier.exportYears} yrs</span>
            </div>
            <p>${supplier.productFocus}</p>
            <div class="meta-row">
              <span>${supplier.city}, ${supplier.province}</span>
              <span>${supplier.leadDays} days</span>
              <span>${supplier.monthlyCapacity}/mo</span>
            </div>
            <div class="tag-row">${supplier.certifications.map(item => `<span class="tag">${item}</span>`).join("")}</div>
          </article>
        `
      )
      .join("")
  );

  const supplier = state.china.activeSupplier;
  setText("#supplier-detail-title", supplier.company);
  setHtml(
    "#supplier-detail",
    `
      <p class="detail-body">${supplier.productFocus}</p>
      <div class="meta-grid">
        <span>${supplier.city}, ${supplier.province}</span>
        <span>${supplier.leadDays} days</span>
        <span>${supplier.monthlyCapacity}/month</span>
        <span>${supplier.responseHours}h response</span>
      </div>
      <h4>Verified</h4>
      <div class="tag-row">${supplier.verifiedTags.map(item => `<span class="tag">${item}</span>`).join("")}</div>
      <h4>Africa coverage</h4>
      <div class="tag-row">${supplier.africaMarkets.map(item => `<span class="tag">${item}</span>`).join("")}</div>
      <p class="note-text">${supplier.scoreHint}</p>
    `
  );

  setHtml(
    "#supplier-match-list",
    state.china.supplierTenderMatches
      .map(
        item => `
          <article class="mini-card">
            <div class="card-head">
              <h4>${item.tender.title}</h4>
              <span class="score-pill">${item.score.totalScore}</span>
            </div>
            <p>${item.tender.country} · ${item.tender.sector}</p>
            <a class="mini-link" href="${buildUrl("/match", { tenderId: item.tender.id })}">Open match</a>
          </article>
        `
      )
      .join("")
  );

  qs("#china-shortlist-form").addEventListener("submit", async event => {
    event.preventDefault();
    const tenderId = state.china.activeTender.id;
    const supplierId = state.china.activeSupplier.id;
    const note = qs("#china-shortlist-note").value;
    const response = await fetch("/api/intent/shortlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenderId, supplierId, note })
    });
    const result = await response.json();
    qs("#china-shortlist-feedback").textContent = response.ok ? label("shortlistSaved") : result.error;
  });

  qs("#china-filters").addEventListener("change", () => {
    const next = {
      sector: qs("#china-sector").value,
      cert: qs("#china-cert").value,
      market: qs("#china-market").value,
      tenderId: state.china.activeTender.id
    };
    window.location.href = buildUrl("/china", next);
  });

  document.querySelectorAll(".supplier-card").forEach(card => {
    card.addEventListener("click", async () => {
      const supplierId = card.dataset.id;
      await fetch("/api/state/supplier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplierId })
      });
      window.location.href = buildUrl("/china", {
        supplierId,
        tenderId: state.china.activeTender.id,
        sector: state.china.filters.sector,
        cert: state.china.filters.cert,
        market: state.china.filters.market
      });
    });
  });
}

async function loadMatch() {
  const query = new URLSearchParams(window.location.search);
  const url = `/api/match?${query.toString()}`;
  state.match = await fetchJson(url);
  renderHeader("match");
  setText("#hero-kicker", label("matchKicker"));
  setText("#hero-title", state.match.overview.title);
  setText("#hero-text", state.match.overview.text);
  setText("#method-kicker", label("methodKicker"));
  setText("#method-title", label("methodTitle"));
  setText("#match-kicker", label("matchKicker"));
  setText("#match-list-title", label("matchListTitle"));
  setText("#match-detail-kicker", label("matchDetailKicker"));
  setText("#match-detail-title", label("matchDetailTitle"));
  setText("#shortlist-title", label("shortlistTitle"));
  renderStats(state.match.stats);
  renderFlow("stepsMatch");

  setHtml(
    "#method-grid",
    state.match.matchingMethod
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

  const tender = state.match.activeTender;
  setHtml(
    "#match-tender-detail",
    `
      <h3>${tender.title}</h3>
      <div class="meta-grid">
        <span>${tender.country}</span>
        <span>${tender.region}</span>
        <span>${tender.deadline}</span>
        <span>${tender.tenderValue}</span>
      </div>
      <p class="detail-body">${tender.description}</p>
      <h4>Highlights</h4>
      <div class="tag-row">${tender.highlights.map(item => `<span class="tag">${item}</span>`).join("")}</div>
      <h4>Lots</h4>
      <div class="tag-row">${tender.lots.map(item => `<span class="tag">${item}</span>`).join("")}</div>
    `
  );

  setHtml(
    "#shortlist-list",
    state.match.shortlists
      .map(
        item => `
          <article class="mini-card">
            <div class="card-head">
              <h4>${item.supplierName}</h4>
              <span class="score-pill">${item.score}</span>
            </div>
            <p>${item.tenderTitle}</p>
            <p class="note-text">${item.note || "-"}</p>
          </article>
        `
      )
      .join("")
  );

  setHtml(
    "#match-list",
    state.match.matches
      .map(
        item => `
          <article class="match-card">
            <div class="card-head">
              <div>
                <h3>${item.supplier.company}</h3>
                <p>${item.supplier.city}, ${item.supplier.province}</p>
              </div>
              <span class="score-badge">${item.score.totalScore}</span>
            </div>
            <p>${item.supplier.productFocus}</p>
            <div class="meta-row">
              <span>${item.supplier.sectors.map(s => s.label).join(" / ")}</span>
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
                      <div class="bar-track"><div class="bar-fill" style="width:${Math.min(100, value * 3)}%"></div></div>
                      <strong>${value}</strong>
                    </div>
                  `
                )
                .join("")}
            </div>
            <div class="tag-row">${item.score.reasons.map(reason => `<span class="tag">${reason}</span>`).join("")}</div>
            <div class="cta-row">
              <a class="ghost-button" href="${buildUrl("/china", { supplierId: item.supplier.id, tenderId: tender.id })}">${label("navChina")}</a>
              <button class="primary-button shortlist-action" data-supplier="${item.supplier.id}">${label("shortlistTitle")}</button>
            </div>
          </article>
        `
      )
      .join("")
  );

  document.querySelectorAll(".shortlist-action").forEach(button => {
    button.addEventListener("click", async () => {
      const supplierId = button.dataset.supplier;
      const response = await fetch("/api/intent/shortlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenderId: state.match.activeTender.id,
          supplierId,
          note: currentLang === "zh" ? "来自匹配页保存的候选。" : "Saved from matching simulator."
        })
      });
      const result = await response.json();
      if (response.ok) {
        await loadMatch();
      } else {
        alert(result.error);
      }
    });
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  if (page === "africa") await loadAfrica();
  if (page === "china") await loadChina();
  if (page === "match") await loadMatch();
});
