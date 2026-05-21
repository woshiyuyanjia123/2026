const page = document.body.dataset.page;
const defaultLang = document.body.dataset.defaultLang || "en";
const currentUrl = new URL(window.location.href);
const currentParams = currentUrl.searchParams;
let currentLang = currentParams.get("lang") || defaultLang;

const state = {
  site: null,
  navOpen: false
};

const UI = {
  zh: {
    brand: "跨境能源项目情报平台",
    brandHint: "项目机会、参与方匹配与 CRM 转化门户",
    navHome: "首页",
    navOpps: "项目机会",
    navParts: "中国参与方",
    navMatch: "匹配中心",
    navSolutions: "平台能力",
    navHow: "业务流程",
    navContact: "合作联系",
    langZh: "中文",
    langEn: "English",
    featuredCases: "主项目案例",
    keyParticipants: "重点参与方",
    processTitle: "合作流程",
    unlockTitle: "资料解锁",
    faqTitle: "常见问题",
    platformMethod: "平台方法论",
    searchPlaceholder: "搜索项目、国家、公司或关键词",
    allModes: "全部模式",
    allRegions: "全部区域",
    allRoles: "全部角色",
    allSectors: "全部赛道",
    filter: "筛选",
    projectOverview: "项目概览",
    companyProfile: "项目公司画像",
    lots: "标段 / 赛道",
    qualifications: "资质要求",
    commercialTerms: "商务条款",
    investmentHighlights: "投资亮点",
    riskNotes: "风险提示",
    participantPreview: "适配参与方预览",
    relatedOpportunities: "适配项目",
    cooperationSignals: "合作信号",
    visitBrief: "拜访简报",
    visitGoals: "拜访目标",
    decisionChain: "决策链",
    capabilityHighlights: "能力亮点",
    experienceCases: "过往经验",
    recommendationReasons: "推荐原因",
    requestCooperation: "申请合作对接",
    requestMaterials: "获取完整资料",
    viewMatches: "查看适配参与方",
    viewProjects: "查看适配项目",
    submitIntent: "提交合作意向",
    unlockPack: "申请解锁资料",
    matchCenter: "匹配中心",
    shortlist: "Shortlist",
    addShortlist: "加入 shortlist",
    shortlistSaved: "已加入 shortlist。",
    leadSubmitted: "合作意向已提交，顾问将在后续对接。",
    unlockSubmitted: "资料申请已提交，顾问将在后续联系。",
    modeTender: "招标参与匹配",
    modeInvestment: "投资合作匹配",
    currentOpportunity: "当前机会",
    currentParticipant: "当前参与方",
    rankingResults: "匹配排序",
    scoringLogic: "评分逻辑",
    nextAction: "后续动作",
    contactTitle: "合作联系",
    unlockPageTitle: "资料解锁",
    contactIntro: "围绕当前项目、参与方和合作模式，留下信息以便后续对接。",
    unlockIntro: "通过公开概览 + 表单解锁的方式承接完整资料申请。",
    formName: "姓名",
    formCompany: "公司",
    formTitle: "职务",
    formContact: "联系方式",
    formProject: "关注项目",
    formCooperation: "合作类型",
    formNote: "备注",
    formSubmit: "提交",
    contextTitle: "当前上下文",
    assetIncludes: "解锁内容",
    openProject: "查看项目详情",
    openParticipant: "查看参与方详情",
    openMatch: "进入匹配中心",
    empty: "暂无内容",
    footerQuick: "快速入口",
    footerDisclaimer: "免责声明",
    ctaPrimary: "查看项目机会",
    ctaSecondary: "查看中国参与方",
    ctaTertiary: "申请合作对接",
    readMore: "查看详情",
    whyThisSite: "站点价值",
    publicSummary: "公开概览",
    crmMethod: "CRM 协同",
    complianceGate: "合规拦截",
    modeSwitch: "模式切换",
    unlockHint: "完整底稿、深度联系人和详细方案通过表单提交后再进入顾问对接。",
    noVisitBrief: "当前没有可公开展示的拜访简报。",
    noResults: "当前筛选下暂无结果。"
  },
  en: {
    brand: "Cross-border Energy Project Intelligence Platform",
    brandHint: "Opportunity discovery, participant matching, and CRM conversion",
    navHome: "Home",
    navOpps: "Opportunities",
    navParts: "Participants",
    navMatch: "Match",
    navSolutions: "Solutions",
    navHow: "How it works",
    navContact: "Contact",
    langZh: "中文",
    langEn: "English",
    featuredCases: "Featured Cases",
    keyParticipants: "Key Participants",
    processTitle: "Cooperation Flow",
    unlockTitle: "Unlock Packs",
    faqTitle: "FAQ",
    platformMethod: "Platform Method",
    searchPlaceholder: "Search projects, countries, companies, or keywords",
    allModes: "All modes",
    allRegions: "All regions",
    allRoles: "All roles",
    allSectors: "All sectors",
    filter: "Filter",
    projectOverview: "Project Overview",
    companyProfile: "Company Profile",
    lots: "Lots / Tracks",
    qualifications: "Qualification Requirements",
    commercialTerms: "Commercial Terms",
    investmentHighlights: "Investment Highlights",
    riskNotes: "Risk Notes",
    participantPreview: "Participant Preview",
    relatedOpportunities: "Related Opportunities",
    cooperationSignals: "Cooperation Signals",
    visitBrief: "Visit Brief",
    visitGoals: "Visit Goals",
    decisionChain: "Decision Chain",
    capabilityHighlights: "Capability Highlights",
    experienceCases: "Experience Cases",
    recommendationReasons: "Recommendation Reasons",
    requestCooperation: "Request Cooperation",
    requestMaterials: "Request Full Materials",
    viewMatches: "View Matching Participants",
    viewProjects: "View Matching Projects",
    submitIntent: "Submit Intent",
    unlockPack: "Request Unlock",
    matchCenter: "Matching Center",
    shortlist: "Shortlist",
    addShortlist: "Add to shortlist",
    shortlistSaved: "Added to shortlist.",
    leadSubmitted: "Lead submitted. A consultant will follow up.",
    unlockSubmitted: "Unlock request submitted. A consultant will follow up.",
    modeTender: "Tender participation",
    modeInvestment: "Investment collaboration",
    currentOpportunity: "Current Opportunity",
    currentParticipant: "Current Participant",
    rankingResults: "Ranking Results",
    scoringLogic: "Scoring Logic",
    nextAction: "Next Actions",
    contactTitle: "Contact",
    unlockPageTitle: "Unlock Materials",
    contactIntro: "Leave your information against the current project, participant, and cooperation context.",
    unlockIntro: "Use a public-summary plus form-unlock flow to request deeper materials.",
    formName: "Name",
    formCompany: "Company",
    formTitle: "Title",
    formContact: "Contact",
    formProject: "Project Focus",
    formCooperation: "Cooperation Type",
    formNote: "Notes",
    formSubmit: "Submit",
    contextTitle: "Current Context",
    assetIncludes: "Included in this pack",
    openProject: "View project details",
    openParticipant: "View participant details",
    openMatch: "Open match center",
    empty: "No content available.",
    footerQuick: "Quick Links",
    footerDisclaimer: "Disclaimer",
    ctaPrimary: "Explore opportunities",
    ctaSecondary: "Explore participants",
    ctaTertiary: "Request cooperation",
    readMore: "View details",
    whyThisSite: "Why this site",
    publicSummary: "Public Summary",
    crmMethod: "CRM Collaboration",
    complianceGate: "Compliance Gate",
    modeSwitch: "Mode Switch",
    unlockHint: "Full source files, deeper contacts, and detailed solution packs are handled through form submission and consultant follow-up.",
    noVisitBrief: "No public visit brief is available for this participant yet.",
    noResults: "No results match the current filter."
  }
};

Object.assign(UI.zh, {
  compare: "加入对比",
  compareTitle: "参与方对比",
  compareAdded: "已加入对比。",
  verifiedLabel: "已验证",
  inquiryNow: "立即询盘",
  unlockNow: "获取完整资料",
  nextStepLabel: "后续处理",
  certifications: "资质筛选",
  readiness: "就绪度筛选",
  countryFilter: "国家筛选",
  trustSignals: "信任与验证",
  resourcePacks: "推荐资料包",
  shortlistHint: "可保留候选，再继续提交合作意向或资料申请。"
});

Object.assign(UI.en, {
  compare: "Add to compare",
  compareTitle: "Compare participants",
  compareAdded: "Added to compare.",
  verifiedLabel: "Verified",
  inquiryNow: "Send inquiry",
  unlockNow: "Unlock full pack",
  nextStepLabel: "Next step",
  certifications: "Certification filter",
  readiness: "Readiness filter",
  countryFilter: "Country filter",
  trustSignals: "Trust and verification",
  resourcePacks: "Recommended packs",
  shortlistHint: "Save candidates, then continue to inquiry or unlock."
});

function ui(key) {
  return UI[currentLang][key] || key;
}

function getParams(extra = {}) {
  const params = new URLSearchParams();
  params.set("lang", currentLang);
  Object.entries(extra).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  });
  return params;
}

function href(path, extra = {}) {
  const qs = getParams(extra).toString();
  return qs ? `${path}?${qs}` : path;
}

function slugFromPath(index) {
  const parts = window.location.pathname.split("/").filter(Boolean);
  return parts[index] || "";
}

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function mount(html) {
  const root = document.getElementById("page-root");
  if (root) root.innerHTML = html;
}

function setHeader(active) {
  const header = document.getElementById("site-header");
  if (!header) return;
  header.innerHTML = `
    <div class="sitebar ${state.navOpen ? "is-open" : ""}">
      <a class="brand-lockup" href="${href("/")}">
        <span class="brand-mark">CE</span>
        <span class="brand-copy">
          <strong>${esc(ui("brand"))}</strong>
          <span>${esc(ui("brandHint"))}</span>
        </span>
      </a>
      <button class="menu-toggle" type="button" aria-expanded="${state.navOpen ? "true" : "false"}" aria-label="Toggle navigation">
        <span></span><span></span><span></span>
      </button>
      <nav class="main-nav">
        <a class="${active === "home" ? "active" : ""}" href="${href("/")}">${esc(ui("navHome"))}</a>
        <a class="${active === "opportunities" ? "active" : ""}" href="${href("/opportunities")}">${esc(ui("navOpps"))}</a>
        <a class="${active === "participants" ? "active" : ""}" href="${href("/participants")}">${esc(ui("navParts"))}</a>
        <a class="${active === "match" ? "active" : ""}" href="${href("/match")}">${esc(ui("navMatch"))}</a>
        <a class="${active === "solutions" ? "active" : ""}" href="${href("/solutions")}">${esc(ui("navSolutions"))}</a>
        <a class="${active === "how" ? "active" : ""}" href="${href("/how-it-works")}">${esc(ui("navHow"))}</a>
        <a class="${active === "contact" ? "active" : ""}" href="${href("/contact")}">${esc(ui("navContact"))}</a>
      </nav>
      <div class="lang-switch">
        <a class="${currentLang === "zh" ? "active" : ""}" href="${href(window.location.pathname, Object.fromEntries(currentParams.entries()))}">${esc(ui("langZh"))}</a>
        <a class="${currentLang === "en" ? "active" : ""}" href="${(() => {
          const params = Object.fromEntries(currentParams.entries());
          params.lang = "en";
          return href(window.location.pathname, params);
        })()}">${esc(ui("langEn"))}</a>
      </div>
    </div>
  `;
  const toggle = header.querySelector(".menu-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      state.navOpen = !state.navOpen;
      setHeader(active);
    });
  }
  const langLinks = header.querySelectorAll(".lang-switch a");
  if (langLinks[0]) {
    const params = Object.fromEntries(currentParams.entries());
    params.lang = "zh";
    langLinks[0].href = href(window.location.pathname, params);
  }
}

function setFooter() {
  const footer = document.getElementById("site-footer");
  if (!footer || !state.site?.footer) return;
  const data = state.site.footer;
  footer.innerHTML = `
    <div class="footer-shell">
      <div class="footer-intro">
        <h3>${esc(ui("brand"))}</h3>
        <p>${esc(data.intro)}</p>
      </div>
      <div class="footer-links">
        <h4>${esc(ui("footerQuick"))}</h4>
        <div class="footer-link-grid">
          ${data.quickLinks.map(item => `<a href="${href(item.href)}">${esc(item.label)}</a>`).join("")}
        </div>
      </div>
      <div class="footer-note">
        <h4>${esc(ui("footerDisclaimer"))}</h4>
        <p>${esc(data.disclaimer)}</p>
      </div>
    </div>
  `;
}

function heroBlock(hero, stats = []) {
  return `
    <section class="hero hero-grid">
      <div class="hero-card hero-main">
        <p class="eyebrow">${esc(hero.eyebrow || state.site?.meta?.subtitle || "")}</p>
        <h1>${esc(hero.title)}</h1>
        <p class="lead">${esc(hero.text)}</p>
        <div class="cta-row">
          ${hero.primary ? `<a class="button primary" href="${href(hero.primary.href)}">${esc(hero.primary.label)}</a>` : ""}
          ${hero.secondary ? `<a class="button ghost" href="${href(hero.secondary.href)}">${esc(hero.secondary.label)}</a>` : ""}
          ${hero.tertiary ? `<a class="button soft" href="${href(hero.tertiary.href)}">${esc(hero.tertiary.label)}</a>` : ""}
        </div>
      </div>
      <div class="hero-card hero-side">
        <div class="stats-grid">
          ${stats.map(item => `
            <article class="stat-card">
              <strong>${esc(item.value)}</strong>
              <span>${esc(item.label)}</span>
            </article>
          `).join("")}
        </div>
      </div>
    </section>
  `;
}

function sectionTitle(kicker, title, text = "") {
  return `
    <div class="section-title">
      ${kicker ? `<p class="eyebrow">${esc(kicker)}</p>` : ""}
      <h2>${esc(title)}</h2>
      ${text ? `<p>${esc(text)}</p>` : ""}
    </div>
  `;
}

function pill(text, variant = "") {
  return `<span class="pill ${variant}">${esc(text)}</span>`;
}

function tag(text) {
  return `<span class="tag">${esc(text)}</span>`;
}

function breadcrumb(items) {
  return `
    <nav class="breadcrumb">
      ${items.map((item, index) => `
        <a href="${href(item.href)}">${esc(item.label)}</a>${index < items.length - 1 ? "<span>/</span>" : ""}
      `).join("")}
    </nav>
  `;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${url}`);
  return res.json();
}

async function postJson(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

function primaryActionLinks(ctas = {}, labels = {}) {
  return `
    <div class="cta-row">
      ${ctas.matchHref ? `<a class="button primary" href="${href(ctas.matchHref)}">${esc(labels.match || ui("openMatch"))}</a>` : ""}
      ${ctas.inquiryHref || ctas.contactHref ? `<a class="button ghost" href="${href(ctas.inquiryHref || ctas.contactHref)}">${esc(labels.inquiry || ui("inquiryNow"))}</a>` : ""}
      ${ctas.unlockHref ? `<a class="button soft" href="${href(ctas.unlockHref)}">${esc(labels.unlock || ui("unlockNow"))}</a>` : ""}
    </div>
  `;
}

async function submitCompare(payload) {
  const result = await postJson("/api/intent/compare", payload);
  if (!result.ok) {
    alert(result.data.error || "Request failed");
    return null;
  }
  alert(ui("compareAdded"));
  return result.data;
}

async function loadCompare() {
  return fetchJson(`/api/compare?${getParams().toString()}`);
}

async function ensureSite() {
  if (!state.site) {
    state.site = await fetchJson(`/api/site?${getParams().toString()}`);
    document.title = state.site.meta?.title || ui("brand");
  }
}

function renderFaq(items) {
  return `
    <section class="panel">
      ${sectionTitle(ui("faqTitle"), ui("faqTitle"))}
      <div class="faq-grid">
        ${items.map(item => `
          <article class="faq-card">
            <h3>${esc(item.q)}</h3>
            <p>${esc(item.a)}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderHome() {
  const { hero, featuredProjects, featuredParticipants, processSteps, faq } = state.site;
  const stats = [
    { value: "2", label: currentLang === "zh" ? "主项目案例" : "Flagship opportunities" },
    { value: "4", label: currentLang === "zh" ? "重点中国参与方" : "Priority China participants" },
    { value: "3", label: currentLang === "zh" ? "资料解锁路径" : "Unlock paths" },
    { value: "1", label: currentLang === "zh" ? "统一 CRM 转化链路" : "CRM conversion chain" }
  ];

  mount(`
    ${heroBlock(hero, stats)}
    <section class="panel">
      ${sectionTitle(ui("featuredCases"), ui("featuredCases"), currentLang === "zh" ? "从主项目案例进入，再进入详情、匹配和联系动作。" : "Enter through the lead cases, then move into detail, matching, and conversion actions.")}
      <div class="card-grid card-grid-2">
        ${featuredProjects.map(item => `
          <article class="portal-card">
            <div class="card-top">
              ${pill(item.modeLabel)}
              ${pill(item.country, "subtle")}
            </div>
            <h3>${esc(item.title)}</h3>
            <p>${esc(item.highlight)}</p>
            <div class="link-row">
              <a href="${href(item.href)}">${esc(ui("readMore"))}</a>
              <a href="${href("/match", { tenderId: item.id, mode: item.mode })}">${esc(ui("openMatch"))}</a>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
    <section class="panel">
      ${sectionTitle(ui("keyParticipants"), ui("keyParticipants"), currentLang === "zh" ? "把 EPC、变电站、算力基础设施与生态合作方组织成正式入口。" : "Organize EPC, substation, compute infrastructure, and ecosystem partners into formal public entry points.")}
      <div class="card-grid card-grid-2">
        ${featuredParticipants.slice(0, 4).map(item => `
          <article class="portal-card">
            <div class="card-top">${pill(item.roleLabel, "subtle")}</div>
            <h3>${esc(item.name)}</h3>
            <p>${esc(item.teaser)}</p>
            <div class="link-row">
              <a href="${href(item.href)}">${esc(ui("openParticipant"))}</a>
              <a href="${href("/contact", { participantId: item.id })}">${esc(ui("requestCooperation"))}</a>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
    <section class="panel">
      ${sectionTitle(ui("processTitle"), ui("processTitle"), currentLang === "zh" ? "从公开内容、详情解释、匹配排序到表单承接，形成完整闭环。" : "Move from public summaries to detail pages, explainable ranking, and form-based conversion.")}
      <div class="step-grid">
        ${processSteps.map(step => `
          <article class="step-card">
            <span class="step-index">${esc(step.id.toUpperCase())}</span>
            <h3>${esc(step.title)}</h3>
            <p>${esc(step.text)}</p>
            <a href="${href(step.href)}">${esc(ui("readMore"))}</a>
          </article>
        `).join("")}
      </div>
    </section>
    <section class="dual-grid">
      <section class="panel">
        ${sectionTitle(ui("unlockTitle"), ui("unlockTitle"), ui("unlockHint"))}
        <div class="mini-cta-grid">
          <a class="mini-cta" href="${href("/unlock", { asset: "banten-tender-pack" })}">
            <strong>Banten</strong>
            <span>${esc(ui("requestMaterials"))}</span>
          </a>
          <a class="mini-cta" href="${href("/unlock", { asset: "dartz-investment-pack" })}">
            <strong>DARTZ</strong>
            <span>${esc(ui("requestMaterials"))}</span>
          </a>
          <a class="mini-cta" href="${href("/unlock", { asset: "zhida-visit-brief" })}">
            <strong>Zhida</strong>
            <span>${esc(ui("unlockPack"))}</span>
          </a>
        </div>
      </section>
      ${renderFaq(faq)}
    </section>
  `);
}

function filterBar(config) {
  return `
    <form class="filter-panel" id="${config.id}">
      <input name="search" type="search" placeholder="${esc(ui("searchPlaceholder"))}" value="${esc(config.search || "")}" />
      ${config.selects.map(select => `
        <select name="${esc(select.name)}">
          ${select.options.map(option => `
            <option value="${esc(option.key)}" ${String(option.key) === String(select.value || "") ? "selected" : ""}>${esc(option.label)}</option>
          `).join("")}
        </select>
      `).join("")}
      <button class="button primary" type="submit">${esc(ui("filter"))}</button>
    </form>
  `;
}

function bindFilterForm(id, targetPath) {
  const form = document.getElementById(id);
  if (!form) return;
  form.addEventListener("submit", event => {
    event.preventDefault();
    const formData = new FormData(form);
    const next = {};
    for (const [key, value] of formData.entries()) {
      next[key] = String(value || "");
    }
    window.location.href = href(targetPath, next);
  });
}

async function renderOpportunities() {
  const data = await fetchJson(`/api/opportunities?${getParams(Object.fromEntries(currentParams.entries())).toString()}`);
  mount(`
    ${sectionTitle("Portal", data.hero.title, data.hero.text)}
    ${filterBar({
      id: "opportunity-filters",
      search: data.filters.search,
      selects: [
        { name: "mode", value: data.filters.mode, options: data.filters.modes },
        { name: "region", value: data.filters.region, options: data.filters.regions }
      ]
    })}
    <section class="card-grid card-grid-2">
      ${data.items.length ? data.items.map(item => `
        <article class="portal-card tall-card">
          <div class="card-top">
            ${pill(item.modeLabel)}
            ${pill(item.region, "subtle")}
          </div>
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.description)}</p>
          <div class="meta-stack">
            <span>${esc(item.project?.name || "")}</span>
            <span>${esc(item.tenderValue)}</span>
            <span>${esc(item.deadline)}</span>
          </div>
          <div class="tag-cloud">${item.highlights.map(tag).join("")}</div>
          <div class="link-row">
            <a href="${href(item.href)}">${esc(ui("readMore"))}</a>
            <a href="${href("/match", { tenderId: item.id, mode: item.mode })}">${esc(ui("openMatch"))}</a>
          </div>
        </article>
      `).join("") : `<div class="empty-card">${esc(ui("noResults"))}</div>`}
    </section>
  `);
  bindFilterForm("opportunity-filters", "/opportunities");
}

async function renderOpportunity() {
  const slug = slugFromPath(1);
  const data = await fetchJson(`/api/opportunity?${getParams({ slug }).toString()}`);
  const item = data.item;
  mount(`
    ${breadcrumb(data.breadcrumb)}
    <section class="detail-hero">
      <div class="detail-main panel">
        <div class="card-top">
          ${pill(item.modeLabel)}
          ${pill(item.country, "subtle")}
          ${pill(item.region, "subtle")}
        </div>
        <h1>${esc(item.title)}</h1>
        <p class="lead">${esc(item.description)}</p>
        <div class="summary-grid">
          <article class="summary-box"><span>${esc(ui("projectOverview"))}</span><strong>${esc(item.project?.name || "-")}</strong></article>
          <article class="summary-box"><span>${esc(ui("companyProfile"))}</span><strong>${esc(item.ownerCompany?.name || item.buyerName)}</strong></article>
          <article class="summary-box"><span>Value</span><strong>${esc(item.tenderValue)}</strong></article>
          <article class="summary-box"><span>Deadline</span><strong>${esc(item.deadline)}</strong></article>
        </div>
        <div class="cta-row">
          <a class="button primary" href="${href(data.ctas.matchHref)}">${esc(ui("viewMatches"))}</a>
          <a class="button ghost" href="${href(data.ctas.unlockHref)}">${esc(ui("requestMaterials"))}</a>
          <a class="button soft" href="${href(data.ctas.contactHref)}">${esc(ui("requestCooperation"))}</a>
        </div>
      </div>
      <aside class="detail-side panel sticky-card">
        <h3>${esc(ui("publicSummary"))}</h3>
        <p>${esc(item.project?.capacityText || "")}</p>
        <div class="tag-cloud">${(item.project?.advantages || []).slice(0, 3).map(tag).join("")}</div>
        <hr />
        <h3>${esc(ui("companyProfile"))}</h3>
        <p>${esc(item.ownerCompany?.summary || "")}</p>
        <div class="tag-cloud">${(item.ownerCompany?.signals || []).slice(0, 3).map(tag).join("")}</div>
      </aside>
    </section>
    <section class="detail-grid">
      <section class="panel">
        ${sectionTitle(ui("lots"), ui("lots"))}
        <ul class="bullet-list">${item.lots.map(line => `<li>${esc(line)}</li>`).join("")}</ul>
      </section>
      <section class="panel">
        ${sectionTitle(ui("qualifications"), ui("qualifications"))}
        <ul class="bullet-list">${item.qualificationRequirements.map(line => `<li>${esc(line)}</li>`).join("")}</ul>
      </section>
      <section class="panel">
        ${sectionTitle(ui("commercialTerms"), ui("commercialTerms"))}
        <ul class="bullet-list">${item.commercialTerms.map(line => `<li>${esc(line)}</li>`).join("")}</ul>
      </section>
      <section class="panel">
        ${sectionTitle(ui("investmentHighlights"), ui("investmentHighlights"))}
        <ul class="bullet-list">
          ${(item.highlights || []).map(line => `<li>${esc(line)}</li>`).join("")}
          ${(item.project?.revenueModel || []).map(line => `<li>${esc(line)}</li>`).join("")}
        </ul>
      </section>
      <section class="panel">
        ${sectionTitle(ui("riskNotes"), ui("riskNotes"))}
        <ul class="bullet-list">${(item.project?.risks || []).map(line => `<li>${esc(line)}</li>`).join("")}</ul>
      </section>
      <section class="panel">
        ${sectionTitle(ui("unlockTitle"), ui("unlockTitle"))}
        <h3>${esc(data.asset?.title || "")}</h3>
        <p>${esc(data.asset?.description || "")}</p>
        <ul class="bullet-list">${(data.asset?.includes || []).map(line => `<li>${esc(line)}</li>`).join("")}</ul>
        <div class="cta-row"><a class="button primary" href="${href(data.ctas.unlockHref)}">${esc(ui("unlockPack"))}</a></div>
      </section>
    </section>
    <section class="panel">
      ${sectionTitle(ui("participantPreview"), ui("participantPreview"))}
      <div class="card-grid card-grid-3">
        ${data.participantPreview.map(item => `
          <article class="portal-card compact-card">
            <div class="card-top">
              ${pill(item.roleLabel)}
              ${pill(String(item.score), "score")}
            </div>
            <h3>${esc(item.name)}</h3>
            <ul class="bullet-list">${item.teaser.map(line => `<li>${esc(line)}</li>`).join("")}</ul>
            <div class="link-row">
              <a href="${href(item.href)}">${esc(ui("openParticipant"))}</a>
              <a href="${href("/contact", { participantId: item.id, tenderId: data.item.id, projectId: data.item.projectId, mode: data.item.mode })}">${esc(ui("requestCooperation"))}</a>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `);
}

async function renderParticipants() {
  const data = await fetchJson(`/api/participants?${getParams(Object.fromEntries(currentParams.entries())).toString()}`);
  mount(`
    ${sectionTitle("Portal", data.hero.title, data.hero.text)}
    ${filterBar({
      id: "participant-filters",
      search: data.filters.search,
      selects: [
        { name: "role", value: data.filters.role, options: data.filters.roles },
        { name: "sector", value: data.filters.sector, options: data.filters.sectors }
      ]
    })}
    <section class="card-grid card-grid-2">
      ${data.items.length ? data.items.map(item => `
        <article class="portal-card tall-card">
          <div class="card-top">
            ${pill(item.roleLabel)}
            ${pill(`${item.exportYears}y`, "subtle")}
          </div>
          <h3>${esc(item.company)}</h3>
          <p>${esc(item.productFocus)}</p>
          <div class="tag-cloud">${(item.verifiedTags || []).map(tag).join("")}</div>
          <ul class="mini-list">
            <li>${esc(item.city)}, ${esc(item.province)}</li>
            <li>${esc(String(item.monthlyCapacity))}/month</li>
            <li>${esc(String(item.leadDays))} days</li>
          </ul>
          <div class="link-row">
            <a href="${href(item.href)}">${esc(ui("readMore"))}</a>
            <a href="${href("/match", { participantId: item.id })}">${esc(ui("viewProjects"))}</a>
          </div>
        </article>
      `).join("") : `<div class="empty-card">${esc(ui("noResults"))}</div>`}
    </section>
  `);
  bindFilterForm("participant-filters", "/participants");
}

async function renderParticipant() {
  const slug = slugFromPath(1);
  const data = await fetchJson(`/api/participant?${getParams({ slug }).toString()}`);
  const item = data.item;
  mount(`
    ${breadcrumb(data.breadcrumb)}
    <section class="detail-hero">
      <div class="detail-main panel">
        <div class="card-top">
          ${pill(item.roleLabel)}
          ${pill(`${item.exportYears}y`, "subtle")}
        </div>
        <h1>${esc(item.company)}</h1>
        <p class="lead">${esc(item.productFocus)}</p>
        <div class="summary-grid">
          <article class="summary-box"><span>${esc(ui("companyProfile"))}</span><strong>${esc(item.companyProfile?.name || item.company)}</strong></article>
          <article class="summary-box"><span>${esc(ui("capabilityHighlights"))}</span><strong>${esc(item.sectors.map(s => s.label).join(" / "))}</strong></article>
          <article class="summary-box"><span>Lead Time</span><strong>${esc(String(item.leadDays))} days</strong></article>
          <article class="summary-box"><span>Capacity</span><strong>${esc(String(item.monthlyCapacity))}/month</strong></article>
        </div>
        <div class="tag-cloud">${item.verifiedTags.map(tag).join("")}</div>
        <div class="cta-row">
          <a class="button primary" href="${href(data.ctas.matchHref)}">${esc(ui("viewProjects"))}</a>
          <a class="button ghost" href="${href(data.ctas.contactHref)}">${esc(ui("requestCooperation"))}</a>
          <a class="button soft" href="${href(data.ctas.unlockHref)}">${esc(ui("unlockPack"))}</a>
        </div>
      </div>
      <aside class="detail-side panel sticky-card">
        <h3>${esc(ui("companyProfile"))}</h3>
        <p>${esc(item.companyProfile?.summary || "")}</p>
        <div class="tag-cloud">${(item.companyProfile?.highlights || []).slice(0, 4).map(tag).join("")}</div>
      </aside>
    </section>
    <section class="detail-grid">
      <section class="panel">
        ${sectionTitle(ui("capabilityHighlights"), ui("capabilityHighlights"))}
        <ul class="bullet-list">${(item.companyProfile?.capabilities || []).map(line => `<li>${esc(line)}</li>`).join("")}</ul>
      </section>
      <section class="panel">
        ${sectionTitle(ui("experienceCases"), ui("experienceCases"))}
        <ul class="bullet-list">${(item.experienceCases || []).map(line => `<li>${esc(line)}</li>`).join("")}</ul>
      </section>
      <section class="panel">
        ${sectionTitle(ui("visitBrief"), ui("visitBrief"))}
        ${item.visitBrief ? `
          <h3>${esc(ui("visitGoals"))}</h3>
          <ul class="bullet-list">${(item.visitBrief.visitGoals || []).map(line => `<li>${esc(line)}</li>`).join("")}</ul>
          <h3>${esc(ui("decisionChain"))}</h3>
          <div class="tag-cloud">${(item.visitBrief.decisionMakers || []).map(tag).join("")}</div>
          <p>${esc(item.visitBrief.productFocus || "")}</p>
          <h3>${esc(ui("cooperationSignals"))}</h3>
          <ul class="bullet-list">${(item.visitBrief.coopSignals || []).map(line => `<li>${esc(line)}</li>`).join("")}</ul>
        ` : `<p>${esc(ui("noVisitBrief"))}</p>`}
      </section>
      <section class="panel">
        ${sectionTitle(ui("unlockTitle"), ui("unlockTitle"))}
        <h3>${esc(data.asset?.title || "")}</h3>
        <p>${esc(data.asset?.description || "")}</p>
        <ul class="bullet-list">${(data.asset?.includes || []).map(line => `<li>${esc(line)}</li>`).join("")}</ul>
      </section>
    </section>
    <section class="panel">
      ${sectionTitle(ui("relatedOpportunities"), ui("relatedOpportunities"))}
      <div class="card-grid card-grid-2">
        ${data.opportunities.map(item => `
          <article class="portal-card compact-card">
            <div class="card-top">
              ${pill(item.modeLabel)}
              ${pill(String(item.score), "score")}
            </div>
            <h3>${esc(item.title)}</h3>
            <p>${esc(item.projectName)}</p>
            <ul class="bullet-list">${item.reasons.map(line => `<li>${esc(line)}</li>`).join("")}</ul>
            <div class="link-row">
              <a href="${href(item.href)}">${esc(ui("openProject"))}</a>
              <a href="${href("/match", { tenderId: item.id, participantId: data.item.id, mode: item.mode })}">${esc(ui("openMatch"))}</a>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `);
}

function matchReasonCards(items) {
  return items.map(item => `
    <article class="match-card panel">
      <div class="card-top">
        ${pill(item.supplier.roleLabel)}
        ${pill(String(item.score.totalScore), "score")}
      </div>
      <h3><a href="${href(item.ctas.participantHref)}">${esc(item.supplier.company)}</a></h3>
      <p>${esc(item.supplier.productFocus)}</p>
      <div class="meter-group">
        ${Object.entries(item.score.breakdown).map(([key, value]) => `
          <div class="meter-row">
            <span>${esc(key.replace("Score", ""))}</span>
            <div class="meter"><i style="width:${Math.min(100, value * 3.125)}%"></i></div>
            <strong>${esc(String(value))}</strong>
          </div>
        `).join("")}
      </div>
      <ul class="bullet-list">${item.score.reasons.map(line => `<li>${esc(line)}</li>`).join("")}</ul>
      <div class="cta-row">
        <a class="button ghost" href="${href(item.ctas.participantHref)}">${esc(ui("openParticipant"))}</a>
        <a class="button soft" href="${href(item.ctas.unlockHref)}">${esc(ui("unlockPack"))}</a>
        <button class="button primary shortlist-action" data-supplier="${esc(item.supplier.id)}">${esc(ui("addShortlist"))}</button>
      </div>
    </article>
  `).join("");
}

async function renderMatch() {
  const params = Object.fromEntries(currentParams.entries());
  const data = await fetchJson(`/api/match?${getParams(params).toString()}`);
  mount(`
    <section class="match-layout">
      <aside class="panel sticky-card">
        ${sectionTitle(ui("modeSwitch"), data.activeTender.mode === "investment" ? ui("modeInvestment") : ui("modeTender"))}
        <div class="mode-stack">
          ${data.opportunities.map(item => `
            <a class="mode-link ${item.id === data.activeTender.id ? "active" : ""}" href="${href("/match", { tenderId: item.id, mode: item.mode, participantId: data.selectedParticipant?.id || "" })}">
              <strong>${esc(item.title)}</strong>
              <span>${esc(item.modeLabel)}</span>
            </a>
          `).join("")}
        </div>
        <div class="context-block">
          <h3>${esc(ui("currentOpportunity"))}</h3>
          <p><a href="${href(`/opportunities/${data.activeTender.slug}`)}">${esc(data.activeTender.title)}</a></p>
          <div class="tag-cloud">${(data.activeTender.highlights || []).slice(0, 3).map(tag).join("")}</div>
        </div>
        ${data.selectedParticipant ? `
          <div class="context-block">
            <h3>${esc(ui("currentParticipant"))}</h3>
            <p><a href="${href(`/participants/${data.selectedParticipant.slug}`)}">${esc(data.selectedParticipant.company)}</a></p>
            <div class="tag-cloud">${(data.selectedParticipant.verifiedTags || []).slice(0, 3).map(tag).join("")}</div>
          </div>
        ` : ""}
      </aside>
      <section class="match-main">
        <section class="panel">
          ${sectionTitle(ui("rankingResults"), ui("rankingResults"), data.hero.text)}
          <div class="match-cards">${matchReasonCards(data.matches)}</div>
        </section>
      </section>
      <aside class="panel sticky-card">
        ${sectionTitle(ui("nextAction"), ui("nextAction"))}
        <div class="context-block">
          <a class="button primary full" href="${href("/contact", { tenderId: data.activeTender.id, participantId: data.selectedParticipant?.id || "", projectId: data.activeTender.projectId, mode: data.activeTender.mode })}">${esc(ui("requestCooperation"))}</a>
          <a class="button ghost full" href="${href("/unlock", { asset: data.activeTender.asset, tenderId: data.activeTender.id, participantId: data.selectedParticipant?.id || "", projectId: data.activeTender.projectId, mode: data.activeTender.mode })}">${esc(ui("requestMaterials"))}</a>
        </div>
        <div class="context-block">
          <h3>${esc(ui("scoringLogic"))}</h3>
          <ul class="bullet-list">${data.matchingMethod.map(item => `<li><strong>${esc(item.name)}:</strong> ${esc(item.description)}</li>`).join("")}</ul>
        </div>
        <div class="context-block">
          <h3>${esc(ui("shortlist"))}</h3>
          <div id="shortlist-list">
            ${data.shortlists.map(item => `
              <article class="mini-record">
                <strong>${esc(item.supplierName)}</strong>
                <span>${esc(item.tenderTitle)}</span>
                <p>${esc(item.note || "")}</p>
              </article>
            `).join("") || `<p>${esc(ui("empty"))}</p>`}
          </div>
        </div>
        <div class="context-block">
          <h3>${esc(ui("crmMethod"))}</h3>
          <ul class="bullet-list">${data.langyanMethod.items.map(item => `<li><strong>${esc(item.title)}:</strong> ${esc(item.text)}</li>`).join("")}</ul>
        </div>
      </aside>
    </section>
  `);

  document.querySelectorAll(".shortlist-action").forEach(button => {
    button.addEventListener("click", async () => {
      const supplierId = button.dataset.supplier;
      const result = await postJson("/api/intent/shortlist", {
        tenderId: data.activeTender.id,
        participantId: supplierId,
        projectId: data.activeTender.projectId,
        mode: data.activeTender.mode,
        note: currentLang === "zh" ? "从匹配中心加入 shortlist" : "Saved from the matching center"
      });
      if (!result.ok) {
        alert(result.data.error || "Request failed");
        return;
      }
      alert(ui("shortlistSaved"));
      renderMatch();
    });
  });
}

async function renderSolutions() {
  const data = await fetchJson(`/api/solutions?${getParams().toString()}`);
  mount(`
    ${sectionTitle(ui("platformMethod"), data.title, data.intro)}
    <section class="card-grid card-grid-2">
      ${data.sections.map(item => `
        <article class="portal-card tall-card">
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.text)}</p>
        </article>
      `).join("")}
    </section>
  `);
}

async function renderHowItWorks() {
  const data = await fetchJson(`/api/site?${getParams().toString()}`);
  mount(`
    ${sectionTitle("Flow", currentLang === "zh" ? "从公开门户到 CRM 转化的业务链路" : "From public portal to CRM conversion", currentLang === "zh" ? "把站内跳转、表单承接和后续协同逻辑讲清楚。" : "Explain the internal link structure, form capture, and downstream collaboration logic.")}
    <section class="step-grid">
      ${data.processSteps.map(item => `
        <article class="step-card">
          <span class="step-index">${esc(item.id.toUpperCase())}</span>
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.text)}</p>
          <a href="${href(item.href)}">${esc(ui("readMore"))}</a>
        </article>
      `).join("")}
    </section>
    ${renderFaq(data.faq)}
  `);
}

function contextPanel(context, asset) {
  return `
    <aside class="panel sticky-card">
      ${sectionTitle(ui("contextTitle"), ui("contextTitle"))}
      <ul class="bullet-list">
        ${context.projectName ? `<li><strong>Project:</strong> ${esc(context.projectName)}</li>` : ""}
        ${context.opportunityTitle ? `<li><strong>Opportunity:</strong> ${esc(context.opportunityTitle)}</li>` : ""}
        ${context.participantName ? `<li><strong>Participant:</strong> ${esc(context.participantName)}</li>` : ""}
        ${context.mode ? `<li><strong>Mode:</strong> ${esc(context.mode)}</li>` : ""}
      </ul>
      ${asset ? `
        <div class="context-block">
          <h3>${esc(asset.title)}</h3>
          <p>${esc(asset.description)}</p>
          <h4>${esc(ui("assetIncludes"))}</h4>
          <ul class="bullet-list">${(asset.includes || []).map(line => `<li>${esc(line)}</li>`).join("")}</ul>
        </div>
      ` : ""}
    </aside>
  `;
}

function leadForm(id, mode, context, asset) {
  const intro = id === "unlock-form" ? ui("unlockIntro") : ui("contactIntro");
  return `
    <section class="form-layout">
      <section class="panel">
        ${sectionTitle(id === "unlock-form" ? ui("unlockPageTitle") : ui("contactTitle"), id === "unlock-form" ? ui("unlockPageTitle") : ui("contactTitle"), intro)}
        <form id="${id}" class="lead-form">
          <div class="field-grid">
            <label><span>${esc(ui("formName"))}</span><input name="name" required /></label>
            <label><span>${esc(ui("formCompany"))}</span><input name="company" required /></label>
            <label><span>${esc(ui("formTitle"))}</span><input name="title" /></label>
            <label><span>${esc(ui("formContact"))}</span><input name="contact" required /></label>
          </div>
          <div class="field-grid">
            <label><span>${esc(ui("formProject"))}</span><input name="projectFocus" value="${esc(context.projectName || context.opportunityTitle || "")}" /></label>
            <label><span>${esc(ui("formCooperation"))}</span><input name="cooperationType" value="${esc(mode)}" /></label>
          </div>
          <label><span>${esc(ui("formNote"))}</span><textarea name="note" rows="6"></textarea></label>
          <button class="button primary" type="submit">${esc(ui("formSubmit"))}</button>
          <p id="${id}-feedback" class="form-feedback"></p>
        </form>
      </section>
      ${contextPanel(context, asset)}
    </section>
  `;
}

async function renderContact() {
  const context = await fetchJson(`/api/contact-context?${getParams(Object.fromEntries(currentParams.entries())).toString()}`);
  mount(leadForm("contact-form", context.mode || "", context, null));
  const form = document.getElementById("contact-form");
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const data = new FormData(form);
    const payload = {
      name: data.get("name"),
      company: data.get("company"),
      title: data.get("title"),
      contact: data.get("contact"),
      cooperationType: data.get("cooperationType"),
      note: data.get("note"),
      projectId: context.projectId,
      tenderId: context.tenderId,
      participantId: context.participantId,
      mode: context.mode
    };
    const result = await postJson("/api/leads/contact", payload);
    document.getElementById("contact-form-feedback").textContent = result.ok ? ui("leadSubmitted") : (result.data.error || "Request failed");
    if (result.ok) form.reset();
  });
}

async function renderUnlock() {
  const assetKey = currentParams.get("asset") || "";
  const context = await fetchJson(`/api/contact-context?${getParams(Object.fromEntries(currentParams.entries())).toString()}`);
  const data = await fetchJson(`/api/site?${getParams().toString()}`);
  const asset = data.assets?.[assetKey] || null;
  mount(leadForm("unlock-form", context.mode || "", context, asset));
  const form = document.getElementById("unlock-form");
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = {
      asset: assetKey,
      name: formData.get("name"),
      company: formData.get("company"),
      title: formData.get("title"),
      contact: formData.get("contact"),
      note: formData.get("note"),
      projectId: context.projectId,
      tenderId: context.tenderId,
      participantId: context.participantId,
      mode: context.mode
    };
    const result = await postJson("/api/leads/unlock", payload);
    document.getElementById("unlock-form-feedback").textContent = result.ok ? ui("unlockSubmitted") : (result.data.error || "Request failed");
    if (result.ok) form.reset();
  });
}

function renderTrustAndPacks(trustSignals = [], resourcePacks = []) {
  return `
    <section class="dual-grid">
      <section class="panel">
        ${sectionTitle(ui("trustSignals"), ui("trustSignals"), currentLang === "zh" ? "加入验证标签、公开概览与线索分发，让网站更像真正的国际外贸平台。" : "Add verification, public summaries, and lead distribution so the site behaves like a real international trade portal.")}
        <div class="card-grid card-grid-1">
          ${trustSignals.map(item => `
            <article class="portal-card compact-card">
              <h3>${esc(item.title)}</h3>
              <p>${esc(item.text)}</p>
            </article>
          `).join("")}
        </div>
      </section>
      <section class="panel">
        ${sectionTitle(ui("resourcePacks"), ui("resourcePacks"), ui("unlockHint"))}
        <div class="mini-cta-grid">
          ${resourcePacks.map(item => `
            <a class="mini-cta" href="${href(item.href)}">
              <strong>${esc(item.title)}</strong>
              <span>${esc(item.description)}</span>
            </a>
          `).join("")}
        </div>
      </section>
    </section>
  `;
}

function comparePanel(compare = { items: [], dimensions: [] }) {
  return `
    <section class="panel">
      ${sectionTitle(ui("compareTitle"), ui("compareTitle"), compare.items?.length ? "" : (currentLang === "zh" ? "先在参与方或匹配页加入 2-3 家候选，再做横向比较。" : "Add 2-3 candidates from participant or matching pages to compare them here."))}
      <div class="compare-grid">
        ${(compare.items || []).map(item => `
          <article class="portal-card compact-card">
            <div class="card-top">
              ${pill(item.roleLabel)}
              ${pill(String(item.score), "score")}
            </div>
            <h3>${esc(item.company || item.name)}</h3>
            <p>${esc(item.verification || "")}</p>
            <ul class="bullet-list">
              ${(item.certifications || []).slice(0, 2).map(line => `<li>${esc(line)}</li>`).join("")}
              ${(item.readiness || []).slice(0, 2).map(line => `<li>${esc(line)}</li>`).join("")}
            </ul>
            ${item.ctas ? primaryActionLinks({
              contactHref: item.ctas.contactHref,
              unlockHref: item.ctas.unlockHref
            }, {
              inquiry: ui("requestCooperation"),
              unlock: ui("unlockPack")
            }) : ""}
          </article>
        `).join("") || `<div class="empty-card">${esc(ui("empty"))}</div>`}
      </div>
      ${compare.dimensions?.length ? `<div class="tag-cloud">${compare.dimensions.map(tag).join("")}</div>` : ""}
    </section>
  `;
}

async function renderHomeV2() {
  const { hero, featuredProjects, featuredParticipants, processSteps, faq, kpis = [], trustSignals = [], resourcePacks = [] } = state.site;
  mount(`
    ${heroBlock(hero, kpis)}
    <section class="panel">
      ${sectionTitle(ui("featuredCases"), ui("featuredCases"), currentLang === "zh" ? "从项目机会页进入详情、匹配、询盘与资料解锁。" : "Move from opportunity discovery into detail, matching, inquiry, and unlock actions.")}
      <div class="card-grid card-grid-2">
        ${featuredProjects.map(item => `
          <article class="portal-card">
            <div class="card-top">
              ${pill(item.modeLabel)}
              ${pill(item.country, "subtle")}
            </div>
            <h3>${esc(item.title)}</h3>
            <p>${esc(item.highlight)}</p>
            <div class="link-row">
              <a href="${href(item.href)}">${esc(ui("readMore"))}</a>
              <a href="${href("/match", { tenderId: item.id, mode: item.mode })}">${esc(ui("openMatch"))}</a>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
    <section class="panel">
      ${sectionTitle(ui("keyParticipants"), ui("keyParticipants"), currentLang === "zh" ? "把 EPC、电力、算力基础设施与生态合作方组织成正式参与方中心。" : "Turn EPC, power, compute infrastructure, and ecosystem firms into a formal participant center.")}
      <div class="card-grid card-grid-2">
        ${featuredParticipants.slice(0, 4).map(item => `
          <article class="portal-card">
            <div class="card-top">${pill(item.roleLabel, "subtle")}</div>
            <h3>${esc(item.name)}</h3>
            <p>${esc(item.teaser)}</p>
            <div class="link-row">
              <a href="${href(item.href)}">${esc(ui("openParticipant"))}</a>
              <a href="${href("/contact", { participantId: item.id })}">${esc(ui("requestCooperation"))}</a>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
    ${renderTrustAndPacks(trustSignals, resourcePacks)}
    <section class="panel">
      ${sectionTitle(ui("processTitle"), ui("processTitle"), currentLang === "zh" ? "用正式门户结构形成浏览、筛选、对比、询盘与解锁的完整闭环。" : "Use a formal portal structure to connect browsing, filtering, comparison, inquiry, and unlock actions.")}
      <div class="step-grid">
        ${processSteps.map(step => `
          <article class="step-card">
            <span class="step-index">${esc(step.id.toUpperCase())}</span>
            <h3>${esc(step.title)}</h3>
            <p>${esc(step.text)}</p>
            <a href="${href(step.href)}">${esc(ui("readMore"))}</a>
          </article>
        `).join("")}
      </div>
    </section>
    ${renderFaq(faq)}
  `);
}

async function renderOpportunitiesV2() {
  const data = await fetchJson(`/api/opportunities?${getParams(Object.fromEntries(currentParams.entries())).toString()}`);
  mount(`
    ${sectionTitle("Portal", data.hero.title, data.hero.text)}
    ${filterBar({
      id: "opportunity-filters",
      search: data.filters.search,
      selects: [
        { name: "mode", value: data.filters.mode, options: data.filters.modes },
        { name: "region", value: data.filters.region, options: data.filters.regions },
        { name: "country", value: data.filters.country, options: data.filters.countries }
      ]
    })}
    <section class="card-grid card-grid-2">
      ${data.items.length ? data.items.map(item => `
        <article class="portal-card tall-card">
          <div class="card-top">
            ${pill(item.verification || ui("verifiedLabel"))}
            ${pill(item.region, "subtle")}
          </div>
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.description)}</p>
          <div class="tag-cloud">${(item.tags || []).map(tag).join("")}</div>
          <div class="meta-stack">
            <span>${esc(item.project?.name || "")}</span>
            <span>${esc(item.tenderValue)}</span>
            <span>${esc(item.deadline)}</span>
          </div>
          ${primaryActionLinks(item.primaryCtas, {
            match: ui("openMatch"),
            inquiry: ui("inquiryNow"),
            unlock: ui("unlockNow")
          })}
          <div class="link-row"><a href="${href(item.href)}">${esc(ui("readMore"))}</a></div>
        </article>
      `).join("") : `<div class="empty-card">${esc(ui("noResults"))}</div>`}
    </section>
  `);
  bindFilterForm("opportunity-filters", "/opportunities");
}

async function renderOpportunityV2() {
  const slug = slugFromPath(1);
  const data = await fetchJson(`/api/opportunity?${getParams({ slug }).toString()}`);
  const item = data.item;
  mount(`
    ${breadcrumb(data.breadcrumb)}
    <section class="detail-hero">
      <div class="detail-main panel">
        <div class="card-top">
          ${pill(data.verification)}
          ${pill(item.country, "subtle")}
          ${pill(item.region, "subtle")}
        </div>
        <h1>${esc(item.title)}</h1>
        <p class="lead">${esc(item.description)}</p>
        <div class="summary-grid">
          <article class="summary-box"><span>${esc(ui("projectOverview"))}</span><strong>${esc(item.project?.name || "-")}</strong></article>
          <article class="summary-box"><span>${esc(ui("companyProfile"))}</span><strong>${esc(item.ownerCompany?.name || item.buyerName)}</strong></article>
          <article class="summary-box"><span>Value</span><strong>${esc(item.tenderValue)}</strong></article>
          <article class="summary-box"><span>Deadline</span><strong>${esc(item.deadline)}</strong></article>
        </div>
        ${primaryActionLinks(data.primaryCtas, {
          match: ui("viewMatches"),
          inquiry: ui("requestCooperation"),
          unlock: ui("requestMaterials")
        })}
      </div>
      <aside class="detail-side panel sticky-card">
        <h3>${esc(ui("publicSummary"))}</h3>
        <ul class="bullet-list">${data.timeline.map(line => `<li><strong>${esc(line.label)}:</strong> ${esc(line.value)}</li>`).join("")}</ul>
        <hr />
        <h3>${esc(ui("companyProfile"))}</h3>
        <p>${esc(item.ownerCompany?.summary || "")}</p>
      </aside>
    </section>
    <section class="detail-grid">
      <section class="panel">${sectionTitle(ui("lots"), ui("lots"))}<ul class="bullet-list">${item.lots.map(line => `<li>${esc(line)}</li>`).join("")}</ul></section>
      <section class="panel">${sectionTitle(ui("qualifications"), ui("qualifications"))}<ul class="bullet-list">${item.qualificationRequirements.map(line => `<li>${esc(line)}</li>`).join("")}</ul></section>
      <section class="panel">${sectionTitle(ui("commercialTerms"), ui("commercialTerms"))}<ul class="bullet-list">${item.commercialTerms.map(line => `<li>${esc(line)}</li>`).join("")}</ul></section>
      <section class="panel">${sectionTitle(ui("investmentHighlights"), ui("investmentHighlights"))}<ul class="bullet-list">${(item.highlights || []).map(line => `<li>${esc(line)}</li>`).join("")}${(item.project?.revenueModel || []).map(line => `<li>${esc(line)}</li>`).join("")}</ul></section>
      <section class="panel">${sectionTitle(ui("riskNotes"), ui("riskNotes"))}<ul class="bullet-list">${(item.project?.risks || []).map(line => `<li>${esc(line)}</li>`).join("")}</ul></section>
      <section class="panel">
        ${sectionTitle(ui("unlockTitle"), ui("unlockTitle"))}
        ${data.relatedAssets.map(asset => `<article class="summary-box"><strong>${esc(asset.title)}</strong><p>${esc(asset.description)}</p><a class="button primary" href="${href(asset.href)}">${esc(ui("unlockPack"))}</a></article>`).join("")}
      </section>
    </section>
    <section class="panel">
      ${sectionTitle(ui("participantPreview"), ui("participantPreview"))}
      <div class="card-grid card-grid-3">
        ${data.participantPreview.map(entry => `
          <article class="portal-card compact-card">
            <div class="card-top">${pill(entry.roleLabel)}${pill(String(entry.score), "score")}</div>
            <h3>${esc(entry.name)}</h3>
            <ul class="bullet-list">${entry.teaser.map(line => `<li>${esc(line)}</li>`).join("")}</ul>
            <div class="link-row">
              <a href="${href(entry.href)}">${esc(ui("openParticipant"))}</a>
              <a href="${href("/contact", { participantId: entry.id, tenderId: item.id, projectId: item.projectId, mode: item.mode })}">${esc(ui("requestCooperation"))}</a>
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `);
}

async function renderParticipantsV2() {
  const data = await fetchJson(`/api/participants?${getParams(Object.fromEntries(currentParams.entries())).toString()}`);
  const compare = await loadCompare();
  mount(`
    ${sectionTitle("Portal", data.hero.title, data.hero.text)}
    ${filterBar({
      id: "participant-filters",
      search: data.filters.search,
      selects: [
        { name: "role", value: data.filters.role, options: data.filters.roles },
        { name: "sector", value: data.filters.sector, options: data.filters.sectors },
        { name: "certification", value: data.filters.certification, options: data.filters.certifications },
        { name: "readiness", value: data.filters.readiness, options: data.filters.readinessOptions }
      ]
    })}
    <section class="card-grid card-grid-2">
      ${data.items.length ? data.items.map(item => `
        <article class="portal-card tall-card">
          <div class="card-top">
            ${pill(item.verification || ui("verifiedLabel"))}
            ${pill(`${item.exportYears}y`, "subtle")}
          </div>
          <h3>${esc(item.company)}</h3>
          <p>${esc(item.productFocus)}</p>
          <div class="tag-cloud">${(item.roleTags || []).map(tag).join("")}</div>
          <ul class="mini-list">
            <li>${esc(item.city)}, ${esc(item.province)}</li>
            <li>${esc(String(item.monthlyCapacity))}/month</li>
            <li>${esc(String(item.leadDays))} days</li>
          </ul>
          ${primaryActionLinks(item.primaryCtas, {
            match: ui("viewProjects"),
            inquiry: ui("requestCooperation"),
            unlock: ui("unlockPack")
          })}
          <div class="link-row">
            <a href="${href(item.href)}">${esc(ui("readMore"))}</a>
            <button class="compare-trigger" data-participant="${esc(item.id)}">${esc(ui("compare"))}</button>
          </div>
        </article>
      `).join("") : `<div class="empty-card">${esc(ui("noResults"))}</div>`}
    </section>
    ${comparePanel(compare)}
  `);
  bindFilterForm("participant-filters", "/participants");
  document.querySelectorAll(".compare-trigger").forEach(button => {
    button.addEventListener("click", async () => {
      await submitCompare({ participantId: button.dataset.participant });
      renderParticipantsV2();
    });
  });
}

async function renderParticipantV2() {
  const slug = slugFromPath(1);
  const data = await fetchJson(`/api/participant?${getParams({ slug }).toString()}`);
  const item = data.item;
  const compare = await loadCompare();
  mount(`
    ${breadcrumb(data.breadcrumb)}
    <section class="detail-hero">
      <div class="detail-main panel">
        <div class="card-top">${pill(data.verification)}${pill(`${item.exportYears}y`, "subtle")}</div>
        <h1>${esc(item.company)}</h1>
        <p class="lead">${esc(item.productFocus)}</p>
        <div class="summary-grid">
          <article class="summary-box"><span>${esc(ui("companyProfile"))}</span><strong>${esc(item.companyProfile?.name || item.company)}</strong></article>
          <article class="summary-box"><span>${esc(ui("capabilityHighlights"))}</span><strong>${esc(item.sectors.map(s => s.label).join(" / "))}</strong></article>
          <article class="summary-box"><span>Lead Time</span><strong>${esc(String(item.leadDays))} days</strong></article>
          <article class="summary-box"><span>Capacity</span><strong>${esc(String(item.monthlyCapacity))}/month</strong></article>
        </div>
        <div class="tag-cloud">${item.verifiedTags.map(tag).join("")}</div>
        ${primaryActionLinks(data.primaryCtas, {
          match: ui("viewProjects"),
          inquiry: ui("requestCooperation"),
          unlock: ui("unlockPack")
        })}
        <div class="link-row"><button class="compare-trigger" data-participant="${esc(item.id)}">${esc(ui("compare"))}</button></div>
      </div>
      <aside class="detail-side panel sticky-card">
        <h3>${esc(ui("companyProfile"))}</h3>
        <p>${esc(item.companyProfile?.summary || "")}</p>
        <div class="tag-cloud">${(item.companyProfile?.highlights || []).slice(0, 4).map(tag).join("")}</div>
      </aside>
    </section>
    <section class="detail-grid">
      ${data.capabilityBlocks.map(block => `<section class="panel">${sectionTitle(block.title, block.title)}<div class="tag-cloud">${(block.items || []).map(tag).join("")}</div></section>`).join("")}
      <section class="panel">${sectionTitle(ui("experienceCases"), ui("experienceCases"))}<ul class="bullet-list">${(item.experienceCases || []).map(line => `<li>${esc(line)}</li>`).join("")}</ul></section>
      <section class="panel">${sectionTitle(ui("visitBrief"), ui("visitBrief"))}${item.visitBrief ? `<h3>${esc(ui("visitGoals"))}</h3><ul class="bullet-list">${(item.visitBrief.visitGoals || []).map(line => `<li>${esc(line)}</li>`).join("")}</ul><h3>${esc(ui("decisionChain"))}</h3><div class="tag-cloud">${(item.visitBrief.decisionMakers || []).map(tag).join("")}</div><p>${esc(item.visitBrief.productFocus || "")}</p><h3>${esc(ui("cooperationSignals"))}</h3><ul class="bullet-list">${(item.visitBrief.coopSignals || []).map(line => `<li>${esc(line)}</li>`).join("")}</ul>` : `<p>${esc(ui("noVisitBrief"))}</p>`}</section>
      <section class="panel">${sectionTitle(ui("unlockTitle"), ui("unlockTitle"))}<h3>${esc(data.asset?.title || "")}</h3><p>${esc(data.asset?.description || "")}</p><ul class="bullet-list">${(data.asset?.includes || []).map(line => `<li>${esc(line)}</li>`).join("")}</ul></section>
    </section>
    <section class="panel">
      ${sectionTitle(ui("relatedOpportunities"), ui("relatedOpportunities"))}
      <div class="card-grid card-grid-2">
        ${data.opportunities.map(entry => `
          <article class="portal-card compact-card">
            <div class="card-top">${pill(entry.modeLabel)}${pill(String(entry.score), "score")}</div>
            <h3>${esc(entry.title)}</h3>
            <p>${esc(entry.projectName)}</p>
            <ul class="bullet-list">${entry.reasons.map(line => `<li>${esc(line)}</li>`).join("")}</ul>
            <div class="link-row"><a href="${href(entry.href)}">${esc(ui("openProject"))}</a><a href="${href("/match", { tenderId: entry.id, participantId: data.item.id, mode: entry.mode })}">${esc(ui("openMatch"))}</a></div>
          </article>
        `).join("")}
      </div>
    </section>
    ${comparePanel(compare)}
  `);
  const compareButton = document.querySelector(".compare-trigger");
  if (compareButton) {
    compareButton.addEventListener("click", async () => {
      await submitCompare({ participantId: compareButton.dataset.participant });
      renderParticipantV2();
    });
  }
}

async function renderMatchV2() {
  const params = Object.fromEntries(currentParams.entries());
  const data = await fetchJson(`/api/match?${getParams(params).toString()}`);
  const compare = await loadCompare();
  mount(`
    <section class="match-layout">
      <aside class="panel sticky-card">
        ${sectionTitle(ui("modeSwitch"), data.activeTender.mode === "investment" ? ui("modeInvestment") : ui("modeTender"))}
        <div class="mode-stack">
          ${data.opportunities.map(item => `<a class="mode-link ${item.id === data.activeTender.id ? "active" : ""}" href="${href("/match", { tenderId: item.id, mode: item.mode, participantId: data.selectedParticipant?.id || "" })}"><strong>${esc(item.title)}</strong><span>${esc(item.modeLabel)}</span></a>`).join("")}
        </div>
        <div class="context-block"><h3>${esc(ui("currentOpportunity"))}</h3><p><a href="${href(`/opportunities/${data.activeTender.slug}`)}">${esc(data.activeTender.title)}</a></p><div class="tag-cloud">${(data.activeTender.highlights || []).slice(0, 3).map(tag).join("")}</div></div>
        ${data.selectedParticipant ? `<div class="context-block"><h3>${esc(ui("currentParticipant"))}</h3><p><a href="${href(`/participants/${data.selectedParticipant.slug}`)}">${esc(data.selectedParticipant.company)}</a></p><div class="tag-cloud">${(data.selectedParticipant.verifiedTags || []).slice(0, 3).map(tag).join("")}</div></div>` : ""}
      </aside>
      <section class="match-main">
        <section class="panel">
          ${sectionTitle(ui("rankingResults"), ui("rankingResults"), data.hero.text)}
          <div class="match-cards">
            ${data.matches.map(item => `
              <article class="match-card panel">
                <div class="card-top">${pill(item.supplier.roleLabel)}${pill(String(item.score.totalScore), "score")}</div>
                <h3><a href="${href(item.ctas.participantHref)}">${esc(item.supplier.company)}</a></h3>
                <p>${esc(item.supplier.productFocus)}</p>
                <div class="meter-group">${Object.entries(item.score.breakdown).map(([key, value]) => `<div class="meter-row"><span>${esc(key.replace("Score", ""))}</span><div class="meter"><i style="width:${Math.min(100, value * 3.125)}%"></i></div><strong>${esc(String(value))}</strong></div>`).join("")}</div>
                <ul class="bullet-list">${item.score.reasons.map(line => `<li>${esc(line)}</li>`).join("")}</ul>
                <div class="cta-row">
                  <a class="button ghost" href="${href(item.ctas.participantHref)}">${esc(ui("openParticipant"))}</a>
                  <a class="button soft" href="${href(item.ctas.unlockHref)}">${esc(ui("unlockPack"))}</a>
                  <button class="button primary shortlist-action" data-supplier="${esc(item.supplier.id)}">${esc(ui("addShortlist"))}</button>
                  <button class="button ghost compare-trigger" data-supplier="${esc(item.supplier.id)}">${esc(ui("compare"))}</button>
                </div>
              </article>
            `).join("")}
          </div>
        </section>
      </section>
      <aside class="panel sticky-card">
        ${sectionTitle(ui("nextAction"), ui("nextAction"), ui("shortlistHint"))}
        <div class="context-block">${data.nextActions.map(action => `<a class="button primary full" href="${href(action.href)}">${esc(action.label)}</a>`).join("")}</div>
        <div class="context-block"><h3>${esc(ui("scoringLogic"))}</h3><ul class="bullet-list">${data.matchingMethod.map(item => `<li><strong>${esc(item.name)}:</strong> ${esc(item.description)}</li>`).join("")}</ul></div>
        <div class="context-block"><h3>${esc(ui("shortlist"))}</h3><div id="shortlist-list">${data.shortlists.map(item => `<article class="mini-record"><strong>${esc(item.supplierName)}</strong><span>${esc(item.tenderTitle)}</span><p>${esc(item.note || "")}</p></article>`).join("") || `<p>${esc(ui("empty"))}</p>`}</div></div>
        <div class="context-block"><h3>${esc(ui("compareTitle"))}</h3><div class="mini-record-list">${(compare.items || []).map(item => `<article class="mini-record"><strong>${esc(item.company)}</strong><span>${esc(item.compareFor || item.verification || "")}</span></article>`).join("") || `<p>${esc(ui("empty"))}</p>`}</div></div>
        <div class="context-block"><h3>${esc(ui("crmMethod"))}</h3><ul class="bullet-list">${data.langyanMethod.items.map(item => `<li><strong>${esc(item.title)}:</strong> ${esc(item.text)}</li>`).join("")}</ul></div>
      </aside>
    </section>
  `);
  document.querySelectorAll(".shortlist-action").forEach(button => {
    button.addEventListener("click", async () => {
      const supplierId = button.dataset.supplier;
      const result = await postJson("/api/intent/shortlist", {
        tenderId: data.activeTender.id,
        participantId: supplierId,
        projectId: data.activeTender.projectId,
        mode: data.activeTender.mode,
        note: currentLang === "zh" ? "从匹配中心加入 shortlist" : "Saved from the matching center"
      });
      if (!result.ok) {
        alert(result.data.error || "Request failed");
        return;
      }
      alert(ui("shortlistSaved"));
      renderMatchV2();
    });
  });
  document.querySelectorAll(".compare-trigger").forEach(button => {
    button.addEventListener("click", async () => {
      await submitCompare({
        supplierId: button.dataset.supplier,
        tenderId: data.activeTender.id,
        projectId: data.activeTender.projectId,
        mode: data.activeTender.mode
      });
      renderMatchV2();
    });
  });
}

function leadFormV2(id, mode, context, asset) {
  const intro = id === "unlock-form" ? ui("unlockIntro") : ui("contactIntro");
  return `
    <section class="form-layout">
      <section class="panel">
        ${sectionTitle(id === "unlock-form" ? ui("unlockPageTitle") : ui("contactTitle"), id === "unlock-form" ? ui("unlockPageTitle") : ui("contactTitle"), intro)}
        <form id="${id}" class="lead-form">
          <div class="field-grid">
            <label><span>${esc(ui("formName"))}</span><input name="name" required /></label>
            <label><span>${esc(ui("formCompany"))}</span><input name="company" required /></label>
            <label><span>${esc(ui("formTitle"))}</span><input name="title" /></label>
            <label><span>${esc(ui("formContact"))}</span><input name="contact" required /></label>
          </div>
          <div class="field-grid">
            <label><span>${esc(ui("formProject"))}</span><input name="projectFocus" value="${esc(context.projectName || context.opportunityTitle || "")}" /></label>
            <label><span>${esc(ui("formCooperation"))}</span><input name="cooperationType" value="${esc(mode)}" /></label>
          </div>
          <label><span>${esc(ui("formNote"))}</span><textarea name="note" rows="6"></textarea></label>
          <button class="button primary" type="submit">${esc(ui("formSubmit"))}</button>
          <p id="${id}-feedback" class="form-feedback"></p>
        </form>
      </section>
      <aside class="panel sticky-card">
        ${sectionTitle(ui("contextTitle"), ui("contextTitle"))}
        <ul class="bullet-list">
          ${context.projectName ? `<li><strong>Project:</strong> ${esc(context.projectName)}</li>` : ""}
          ${context.opportunityTitle ? `<li><strong>Opportunity:</strong> ${esc(context.opportunityTitle)}</li>` : ""}
          ${context.participantName ? `<li><strong>Participant:</strong> ${esc(context.participantName)}</li>` : ""}
          ${context.mode ? `<li><strong>Mode:</strong> ${esc(context.mode)}</li>` : ""}
        </ul>
        ${asset ? `<div class="context-block"><h3>${esc(asset.title)}</h3><p>${esc(asset.description)}</p><h4>${esc(ui("assetIncludes"))}</h4><ul class="bullet-list">${(asset.includes || []).map(line => `<li>${esc(line)}</li>`).join("")}</ul></div>` : ""}
        ${context.compare?.length ? `<div class="context-block"><h3>${esc(ui("compareTitle"))}</h3>${context.compare.map(item => `<article class="mini-record"><strong>${esc(item.company)}</strong><span>${esc(item.compareFor || item.verification || "")}</span></article>`).join("")}</div>` : ""}
      </aside>
    </section>
  `;
}

async function renderContactV2() {
  const context = await fetchJson(`/api/lead-context?${getParams(Object.fromEntries(currentParams.entries())).toString()}`);
  mount(leadFormV2("contact-form", context.mode || "", context, null));
  const form = document.getElementById("contact-form");
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const data = new FormData(form);
    const payload = {
      name: data.get("name"),
      company: data.get("company"),
      title: data.get("title"),
      contact: data.get("contact"),
      cooperationType: data.get("cooperationType"),
      note: data.get("note"),
      projectId: context.projectId,
      tenderId: context.tenderId,
      participantId: context.participantId,
      mode: context.mode,
      lang: currentLang
    };
    const result = await postJson("/api/leads/contact", payload);
    document.getElementById("contact-form-feedback").textContent = result.ok
      ? `${ui("leadSubmitted")} ${result.data.nextStep || ""}`
      : (result.data.error || "Request failed");
    if (result.ok) form.reset();
  });
}

async function renderUnlockV2() {
  const assetKey = currentParams.get("asset") || "";
  const context = await fetchJson(`/api/lead-context?${getParams(Object.fromEntries(currentParams.entries())).toString()}`);
  const data = await fetchJson(`/api/site?${getParams().toString()}`);
  const asset = data.assets?.[assetKey] || null;
  mount(leadFormV2("unlock-form", context.mode || "", context, asset));
  const form = document.getElementById("unlock-form");
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = {
      asset: assetKey,
      name: formData.get("name"),
      company: formData.get("company"),
      title: formData.get("title"),
      contact: formData.get("contact"),
      note: formData.get("note"),
      projectId: context.projectId,
      tenderId: context.tenderId,
      participantId: context.participantId,
      mode: context.mode,
      lang: currentLang
    };
    const result = await postJson("/api/leads/unlock", payload);
    document.getElementById("unlock-form-feedback").textContent = result.ok
      ? `${ui("unlockSubmitted")} ${result.data.nextStep || ""}`
      : (result.data.error || "Request failed");
    if (result.ok) form.reset();
  });
}

async function boot() {
  await ensureSite();
  const activeMap = {
    home: "home",
    opportunities: "opportunities",
    opportunity: "opportunities",
    participants: "participants",
    participant: "participants",
    match: "match",
    solutions: "solutions",
    "how-it-works": "how",
    contact: "contact",
    unlock: "contact"
  };
  setHeader(activeMap[page] || "home");
  setFooter();

  if (page === "home") await renderHomeV2();
  if (page === "opportunities") await renderOpportunitiesV2();
  if (page === "opportunity") await renderOpportunityV2();
  if (page === "participants") await renderParticipantsV2();
  if (page === "participant") await renderParticipantV2();
  if (page === "match") await renderMatchV2();
  if (page === "solutions") await renderSolutions();
  if (page === "how-it-works") await renderHowItWorks();
  if (page === "contact") await renderContactV2();
  if (page === "unlock") await renderUnlockV2();
}

window.addEventListener("DOMContentLoaded", () => {
  boot().catch(error => {
    mount(`<section class="panel"><h2>Error</h2><p>${esc(error.message)}</p></section>`);
  });
});
