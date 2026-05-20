const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const { URL } = require("url");

const PORT = Number(process.env.PORT || 8787);
const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_DIR = path.join(ROOT, "data");
const SEED_FILE = path.join(DATA_DIR, "demo-seed.json");
const RUNTIME_FILE = path.join(DATA_DIR, "demo-runtime.json");
const SCHEMA_VERSION = 5;
const COMPRESSIBLE_EXTENSIONS = new Set([".html", ".css", ".js", ".json", ".txt", ".svg"]);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadSeed() {
  return readJson(SEED_FILE);
}

function loadRuntimeTemplate(seed) {
  if (!fs.existsSync(RUNTIME_FILE)) {
    return clone(seed.runtime);
  }
  const runtime = readJson(RUNTIME_FILE);
  if (runtime.schemaVersion !== SCHEMA_VERSION) {
    return clone(seed.runtime);
  }
  return runtime;
}

const seedData = loadSeed();
const runtimeTemplate = loadRuntimeTemplate(seedData);
let runtimeState = clone(runtimeTemplate);

function readRuntime() {
  return runtimeState;
}

function writeRuntime(runtime) {
  runtimeState = runtime;
}

function isCompressible(contentType, filePath) {
  if (!contentType) return false;
  if (contentType.startsWith("text/")) return true;
  if (contentType.includes("json") || contentType.includes("javascript") || contentType.includes("svg+xml")) return true;
  if (!filePath) return false;
  return COMPRESSIBLE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function getCacheControl(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".html") return "no-cache";
  if (ext === ".css" || ext === ".js") return "public, max-age=86400, stale-while-revalidate=604800";
  if (ext === ".json") return "public, max-age=3600, stale-while-revalidate=86400";
  return "public, max-age=3600";
}

function maybeCompress(req, body, contentType, filePath) {
  const buffer = Buffer.isBuffer(body) ? body : Buffer.from(body);
  if (!isCompressible(contentType, filePath) || buffer.length < 256) {
    return { body: buffer, encoding: null };
  }
  const acceptEncoding = String(req.headers["accept-encoding"] || "");
  if (acceptEncoding.includes("br")) {
    return { body: zlib.brotliCompressSync(buffer), encoding: "br" };
  }
  if (acceptEncoding.includes("gzip")) {
    return { body: zlib.gzipSync(buffer), encoding: "gzip" };
  }
  return { body: buffer, encoding: null };
}

function sendBody(req, res, statusCode, body, contentType, headers = {}, filePath = "") {
  const compressed = maybeCompress(req, body, contentType, filePath);
  const finalHeaders = {
    "Content-Type": contentType,
    "Content-Length": String(compressed.body.length),
    Vary: "Accept-Encoding",
    ...headers
  };
  if (compressed.encoding) {
    finalHeaders["Content-Encoding"] = compressed.encoding;
  }
  res.writeHead(statusCode, finalHeaders);
  res.end(compressed.body);
}

function sendJson(req, res, statusCode, payload, headers = {}) {
  sendBody(req, res, statusCode, JSON.stringify(payload), "application/json; charset=utf-8", { "Cache-Control": "no-store", ...headers });
}

function sendText(req, res, statusCode, text, headers = {}) {
  sendBody(req, res, statusCode, text, "text/plain; charset=utf-8", { "Cache-Control": "no-store", ...headers });
}

function redirect(res, location) {
  res.writeHead(302, { Location: location, "Cache-Control": "no-store" });
  res.end();
}

function serveStatic(req, res, filePath) {
  try {
    const content = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME_TYPES[ext] || "application/octet-stream";
    sendBody(req, res, 200, content, type, { "Cache-Control": getCacheControl(filePath) }, filePath);
  } catch (error) {
    if (error.code === "ENOENT") {
      sendText(req, res, 404, "Not Found");
      return;
    }
    console.error("[static] failed to serve asset", { filePath, message: error.message });
    sendText(req, res, 500, "Internal Server Error");
  }
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", chunk => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function pickLang(requestedLang, fallback) {
  return requestedLang === "zh" || requestedLang === "en" ? requestedLang : fallback;
}

function t(value, lang) {
  if (value && typeof value === "object" && !Array.isArray(value) && ("zh" in value || "en" in value)) {
    return value[lang] || value.en || value.zh || "";
  }
  return value ?? "";
}

function localizeLookup(seed, group, key, lang) {
  if (!key) return "";
  return t(seed.lookups[group][key], lang);
}

function overlapCount(a, b) {
  const setB = new Set((b || []).map(item => String(item).toLowerCase()));
  return (a || []).filter(item => setB.has(String(item).toLowerCase())).length;
}

function uniqueById(items) {
  const seen = new Set();
  return items.filter(item => {
    if (!item || !item.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function buildCountryToRegion(seed) {
  const mapping = {};
  seed.africaRegions.forEach(region => {
    region.countryKeys.forEach(countryKey => {
      mapping[countryKey] = region.key;
    });
  });
  return mapping;
}

const countryToRegion = buildCountryToRegion(seedData);

function indexById(collection) {
  return Object.fromEntries(collection.map(item => [item.id, item]));
}

const projectMap = indexById(seedData.projects);
const companyMap = indexById(seedData.companies);
const visitBriefMap = indexById(seedData.visitBriefs);
const tenderMap = indexById(seedData.tenders);
const supplierMap = indexById(seedData.suppliers);

function buildLangyanMethod(lang) {
  return {
    title: lang === "zh" ? "朗言协同方式" : "Langyan Collaboration Layer",
    items: [
      {
        title: lang === "zh" ? "知识库层" : "Knowledge Layer",
        text: lang === "zh"
          ? "按公共通用库、业务专属库、涉密资源库分层，案例内容脱敏后沉淀到知识侧。"
          : "Organized into public, business, and sensitive layers, with only sanitized content entering the knowledge side."
      },
      {
        title: lang === "zh" ? "CRM 协同层" : "CRM Layer",
        text: lang === "zh"
          ? "在销售线索、项目跟进和带团场景中主动推送案例、模板和检查清单。"
          : "Pushes cases, templates, and checklists directly into sales follow-up, project tracking, and delegation workflows."
      },
      {
        title: lang === "zh" ? "合规与审批" : "Compliance & Approval",
        text: lang === "zh"
          ? "客户敏感信息留在 CRM，知识库只保留脱敏经验，报价和合同前触发合规拦截。"
          : "Sensitive client data stays inside CRM; the knowledge layer stays sanitized while compliance gates trigger before quote or contract."
      }
    ]
  };
}

function localizeProject(seed, project, lang) {
  if (!project) return null;
  return {
    id: project.id,
    name: t(project.name, lang),
    location: t(project.location, lang),
    projectType: project.projectType,
    projectTypeLabel: localizeLookup(seed, "sectors", project.projectType, lang),
    capacityText: t(project.capacityText, lang),
    investmentAmount: t(project.investmentAmount, lang),
    timeline: t(project.timeline, lang),
    advantages: (project.advantages || []).map(item => t(item, lang)),
    revenueModel: (project.revenueModel || []).map(item => t(item, lang)),
    risks: (project.risks || []).map(item => t(item, lang)),
    relatedCompanyIds: project.relatedCompanyIds || []
  };
}

function localizeCompany(seed, company, lang) {
  if (!company) return null;
  return {
    id: company.id,
    name: t(company.name, lang),
    companyType: company.companyType,
    companyTypeLabel: localizeLookup(seed, "companyTypes", company.companyType, lang),
    country: company.country,
    summary: t(company.summary, lang),
    highlights: (company.highlights || []).map(item => t(item, lang)),
    capabilities: (company.capabilities || []).map(item => t(item, lang)),
    signals: (company.signals || []).map(item => t(item, lang))
  };
}

function localizeVisitBrief(visitBrief, lang) {
  if (!visitBrief) return null;
  return {
    id: visitBrief.id,
    companyId: visitBrief.companyId,
    visitGoals: (visitBrief.visitGoals || []).map(item => t(item, lang)),
    decisionMakers: visitBrief.decisionMakers || [],
    productFocus: t(visitBrief.productFocus, lang),
    coopSignals: (visitBrief.coopSignals || []).map(item => t(item, lang))
  };
}

function localizeTender(seed, tender, lang) {
  const project = projectMap[tender.projectId];
  const ownerCompany = companyMap[tender.ownerCompanyId];
  return {
    id: tender.id,
    projectId: tender.projectId,
    ownerCompanyId: tender.ownerCompanyId,
    mode: tender.mode,
    countryKey: tender.countryKey,
    regionKey: tender.regionKey,
    sectorKey: tender.sectorKey,
    country: localizeLookup(seed, "countries", tender.countryKey, lang),
    region: localizeLookup(seed, "regions", tender.regionKey, lang),
    sector: localizeLookup(seed, "sectors", tender.sectorKey, lang),
    title: t(tender.title, lang),
    description: t(tender.description, lang),
    buyerName: tender.buyerName,
    buyerType: localizeLookup(seed, "buyerTypes", tender.buyerTypeKey, lang),
    deadline: tender.deadline,
    tenderValue: tender.tenderValue,
    language: tender.language,
    targetLeadDays: tender.targetLeadDays,
    requiredMonthlyCapacity: tender.requiredMonthlyCapacity,
    certificationsRequired: tender.certificationsRequired || [],
    keywords: (tender.keywords || []).map(item => t(item, lang)),
    keywordKeys: tender.keywordKeys || [],
    highlights: (tender.highlights || []).map(item => t(item, lang)),
    lots: (tender.lots || []).map(item => t(item, lang)),
    qualificationRequirements: (tender.qualificationRequirements || []).map(item => t(item, lang)),
    commercialTerms: (tender.commercialTerms || []).map(item => t(item, lang)),
    project: localizeProject(seed, project, lang),
    ownerCompany: localizeCompany(seed, ownerCompany, lang)
  };
}

function localizeSupplier(seed, supplier, lang) {
  const company = companyMap[supplier.companyId];
  const visitBrief = supplier.visitBriefId ? visitBriefMap[supplier.visitBriefId] : null;
  return {
    id: supplier.id,
    companyId: supplier.companyId,
    roleType: supplier.roleType,
    roleLabel: localizeLookup(seed, "roleTypes", supplier.roleType, lang),
    company: t(supplier.company, lang),
    companyShort: t(supplier.companyShort, lang),
    city: t(supplier.city, lang),
    province: t(supplier.province, lang),
    sectors: (supplier.sectorKeys || []).map(key => ({
      key,
      label: localizeLookup(seed, "sectors", key, lang)
    })),
    sectorKeys: supplier.sectorKeys || [],
    certifications: supplier.certifications || [],
    monthlyCapacity: supplier.monthlyCapacity,
    leadDays: supplier.leadDays,
    responseHours: supplier.responseHours,
    languages: supplier.languages || [],
    africaMarkets: (supplier.africaMarketKeys || []).map(key => localizeLookup(seed, "countries", key, lang)),
    africaRegions: (supplier.africaRegionKeys || []).map(key => localizeLookup(seed, "regions", key, lang)),
    africaMarketKeys: supplier.africaMarketKeys || [],
    africaRegionKeys: supplier.africaRegionKeys || [],
    productFocus: t(supplier.productFocus, lang),
    verifiedTags: (supplier.verifiedTagKeys || []).map(key => localizeLookup(seed, "verifiedTags", key, lang)),
    verifiedTagKeys: supplier.verifiedTagKeys || [],
    exportYears: supplier.exportYears,
    keywords: supplier.keywords || [],
    keywordKeys: supplier.keywordKeys || [],
    scoreHint: t(supplier.scoreHint, lang),
    experienceCases: (supplier.experienceCases || []).map(item => t(item, lang)),
    companyProfile: localizeCompany(seed, company, lang),
    visitBrief: localizeVisitBrief(visitBrief, lang)
  };
}

function normalizeRatio(score, max) {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(1, score / max));
}

function computeTenderScores(tender, supplier, lang) {
  const roleBoost = {
    epc: 22,
    grid: 20,
    compute: 18,
    ecosystem: 10
  }[supplier.roleType] || 8;
  let sectorRaw = roleBoost;
  if ((supplier.sectorKeys || []).includes(tender.sectorKey)) sectorRaw += 8;
  sectorRaw += Math.min(6, overlapCount(tender.keywordKeys, supplier.keywordKeys) * 2);
  const sectorScore = Math.min(32, sectorRaw);

  const certMatches = overlapCount(tender.certificationsRequired, supplier.certifications);
  const certBase = tender.certificationsRequired.length
    ? (certMatches / tender.certificationsRequired.length) * 18
    : 10;
  let certRaw = certBase;
  if ((supplier.verifiedTagKeys || []).includes("epc_track")) certRaw += 4;
  if ((supplier.verifiedTagKeys || []).includes("solution_depth")) certRaw += 2;
  const certScore = Math.min(24, Math.round(certRaw));

  let capacityRaw = normalizeRatio(supplier.monthlyCapacity, tender.requiredMonthlyCapacity) * 12;
  const leadGap = tender.targetLeadDays - supplier.leadDays;
  if (leadGap >= 0) capacityRaw += 6;
  else if (leadGap >= -15) capacityRaw += 4;
  else if (leadGap >= -30) capacityRaw += 2;
  if (supplier.roleType === "epc" || supplier.roleType === "grid") capacityRaw += 2;
  const capacityScore = Math.min(20, Math.round(capacityRaw));

  let marketRaw = 0;
  if ((supplier.africaMarketKeys || []).includes(tender.countryKey)) marketRaw += 9;
  else if ((supplier.africaRegionKeys || []).includes(countryToRegion[tender.countryKey])) marketRaw += 7;
  else if ((supplier.africaRegionKeys || []).includes(tender.regionKey)) marketRaw += 6;
  if ((supplier.verifiedTagKeys || []).includes("epc_track")) marketRaw += 2;
  const marketScore = Math.min(14, Math.round(marketRaw));

  let opsRaw = 0;
  if ((supplier.languages || []).includes(tender.language)) opsRaw += 3;
  if (supplier.responseHours <= 8) opsRaw += 3;
  else if (supplier.responseHours <= 24) opsRaw += 2;
  if ((supplier.verifiedTagKeys || []).includes("crm_ready")) opsRaw += 2;
  if ((supplier.verifiedTagKeys || []).includes("solution_depth")) opsRaw += 2;
  const opsScore = Math.min(10, opsRaw);

  const reasons = [];
  reasons.push(lang === "zh" ? `角色适配：${supplier.roleType === "epc" ? "EPC 总包" : supplier.roleType === "grid" ? "变电站/电力" : supplier.roleType === "compute" ? "算力基础设施" : "生态合作"}` : `Role fit: ${supplier.roleType}`);
  if (certMatches > 0) {
    reasons.push(lang === "zh" ? `资质命中 ${certMatches}/${tender.certificationsRequired.length}` : `Credentials hit ${certMatches}/${tender.certificationsRequired.length}`);
  }
  if (supplier.monthlyCapacity >= tender.requiredMonthlyCapacity) {
    reasons.push(lang === "zh" ? "产能覆盖当前项目规模" : "Delivery capacity covers the active project scope");
  }
  if (supplier.leadDays <= tender.targetLeadDays) {
    reasons.push(lang === "zh" ? "交付节奏可落入招标窗口" : "Lead time stays inside the tender execution window");
  }
  if ((supplier.africaMarketKeys || []).includes(tender.countryKey) || (supplier.africaRegionKeys || []).includes(tender.regionKey)) {
    reasons.push(lang === "zh" ? "已有目标区域项目经验" : "Relevant regional execution track record");
  }
  if ((supplier.verifiedTagKeys || []).includes("crm_ready")) {
    reasons.push(lang === "zh" ? "可直接进入 CRM 协同跟进" : "Ready for CRM-led follow-up");
  }

  return {
    totalScore: sectorScore + certScore + capacityScore + marketScore + opsScore,
    breakdown: { sectorScore, certScore, capacityScore, marketScore, opsScore },
    reasons
  };
}

function computeInvestmentScores(tender, supplier, lang) {
  let sectorRaw = 8;
  if ((supplier.sectorKeys || []).includes("solar_storage")) sectorRaw += 12;
  if (supplier.roleType === "ecosystem") sectorRaw += 10;
  if (supplier.roleType === "epc") sectorRaw += 7;
  sectorRaw += Math.min(4, overlapCount(tender.keywordKeys, supplier.keywordKeys) * 2);
  const sectorScore = Math.min(32, Math.round(sectorRaw));

  let certRaw = 8 + overlapCount(tender.certificationsRequired, supplier.certifications) * 4;
  if ((supplier.verifiedTagKeys || []).includes("investment_ready")) certRaw += 8;
  if ((supplier.verifiedTagKeys || []).includes("solution_depth")) certRaw += 4;
  const certScore = Math.min(24, Math.round(certRaw));

  let capacityRaw = normalizeRatio(supplier.monthlyCapacity, tender.requiredMonthlyCapacity) * 8;
  if (supplier.exportYears >= 10) capacityRaw += 4;
  if (supplier.roleType === "ecosystem") capacityRaw += 5;
  if (supplier.roleType === "epc") capacityRaw += 3;
  const capacityScore = Math.min(20, Math.round(capacityRaw));

  let marketRaw = 0;
  if ((supplier.africaMarketKeys || []).includes(tender.countryKey)) marketRaw += 9;
  else if ((supplier.africaRegionKeys || []).includes(tender.regionKey)) marketRaw += 6;
  if ((supplier.verifiedTagKeys || []).includes("investment_ready")) marketRaw += 3;
  const marketScore = Math.min(14, Math.round(marketRaw));

  let opsRaw = 0;
  if ((supplier.languages || []).includes(tender.language)) opsRaw += 2;
  if (supplier.responseHours <= 12) opsRaw += 3;
  if ((supplier.verifiedTagKeys || []).includes("crm_ready")) opsRaw += 2;
  if (supplier.visitBriefId) opsRaw += 3;
  const opsScore = Math.min(10, Math.round(opsRaw));

  const reasons = [];
  reasons.push(lang === "zh" ? "合作逻辑：更看重投资就绪度与生态协同" : "Investment mode prioritizes readiness and collaboration logic");
  if ((supplier.verifiedTagKeys || []).includes("investment_ready")) {
    reasons.push(lang === "zh" ? "具备投资合作就绪标签" : "Carries an investment-ready signal");
  }
  if (supplier.visitBriefId) {
    reasons.push(lang === "zh" ? "可衔接拜访与联合推进场景" : "Can connect into visit-based co-development workflows");
  }
  if ((supplier.africaMarketKeys || []).includes(tender.countryKey) || (supplier.africaRegionKeys || []).includes(tender.regionKey)) {
    reasons.push(lang === "zh" ? "具备西非或目标市场协同经验" : "Shows regional collaboration readiness");
  }
  if ((supplier.verifiedTagKeys || []).includes("crm_ready")) {
    reasons.push(lang === "zh" ? "适合沉淀为 CRM 协同线索" : "Easy to operationalize through CRM follow-up");
  }

  return {
    totalScore: sectorScore + certScore + capacityScore + marketScore + opsScore,
    breakdown: { sectorScore, certScore, capacityScore, marketScore, opsScore },
    reasons
  };
}

function computeMatch(seed, tender, supplier, lang) {
  return tender.mode === "investment"
    ? computeInvestmentScores(tender, supplier, lang)
    : computeTenderScores(tender, supplier, lang);
}

function buildMatches(seed, tenderId, lang) {
  const tender = tenderMap[tenderId] || seed.tenders[0];
  return seed.suppliers
    .map(supplier => ({
      supplier: localizeSupplier(seed, supplier, lang),
      score: computeMatch(seed, tender, supplier, lang)
    }))
    .sort((a, b) => b.score.totalScore - a.score.totalScore);
}

function buildSupplierTenderMatches(seed, supplierId, lang) {
  const supplier = supplierMap[supplierId] || seed.suppliers[0];
  return seed.tenders
    .map(tender => ({
      tender: localizeTender(seed, tender, lang),
      score: computeMatch(seed, tender, supplier, lang)
    }))
    .sort((a, b) => b.score.totalScore - a.score.totalScore);
}

function localizedStats(seed, runtime, lang) {
  return [
    {
      label: lang === "zh" ? "机会项目" : "Live Opportunities",
      value: seed.tenders.length
    },
    {
      label: lang === "zh" ? "中国参与方" : "China Participants",
      value: seed.suppliers.length
    },
    {
      label: lang === "zh" ? "重点公司画像" : "Company Profiles",
      value: seed.companies.length
    },
    {
      label: lang === "zh" ? "已保存意向" : "Saved Shortlists",
      value: runtime.shortlists.length
    }
  ];
}

function localizedRegions(seed, lang) {
  return seed.africaRegions.map(region => ({
    key: region.key,
    name: t(region.name, lang),
    signal: t(region.signal, lang),
    countries: region.countryKeys.map(key => ({
      key,
      label: localizeLookup(seed, "countries", key, lang)
    }))
  }));
}

function localizedMatchingMethod(seed, lang) {
  return seed.matchingMethod.map(item => ({
    key: item.key,
    name: t(item.name, lang),
    description: t(item.description, lang),
    weight: item.weight
  }));
}

function buildAfricaPayload(seed, runtime, params) {
  const lang = pickLang(params.lang, "en");
  const region = params.region || "";
  const country = params.country || "";
  const sector = params.sector || "";
  const mode = params.mode || "";

  const filtered = seed.tenders.filter(tender => {
    if (region && tender.regionKey !== region) return false;
    if (country && tender.countryKey !== country) return false;
    if (sector && tender.sectorKey !== sector) return false;
    if (mode && tender.mode !== mode) return false;
    return true;
  });

  const activeTenderId = params.tenderId || runtime.lastTenderId || filtered[0]?.id || seed.tenders[0].id;
  const activeTender = tenderMap[activeTenderId] || filtered[0] || seed.tenders[0];
  const featuredProjects = uniqueById(seed.projects.map(project => localizeProject(seed, project, lang)));
  const featuredCompanies = uniqueById([
    localizeCompany(seed, companyMap[activeTender.ownerCompanyId], lang),
    ...seed.projects
      .flatMap(project => project.relatedCompanyIds || [])
      .map(id => localizeCompany(seed, companyMap[id], lang))
  ]).slice(0, 6);

  return {
    lang,
    page: "africa",
    meta: {
      title: t(seed.meta.platformTitle, lang),
      subtitle: t(seed.meta.platformSubtitle, lang)
    },
    overview: {
      title: t(seed.overview.africa.title, lang),
      text: t(seed.overview.africa.text, lang)
    },
    stats: localizedStats(seed, runtime, lang),
    regions: localizedRegions(seed, lang),
    filters: {
      region,
      country,
      sector,
      mode,
      regions: seed.africaRegions.map(item => ({ key: item.key, label: t(item.name, lang) })),
      countries: Object.entries(seed.lookups.countries)
        .filter(([key]) => key !== "china")
        .map(([key, value]) => ({ key, label: t(value, lang) })),
      sectors: Object.entries(seed.lookups.sectors)
        .filter(([key]) => key !== "charging_robotics")
        .map(([key, value]) => ({ key, label: t(value, lang) })),
      modes: [
        { key: "tender", label: lang === "zh" ? "招标参与" : "Tender" },
        { key: "investment", label: lang === "zh" ? "投资合作" : "Investment" }
      ]
    },
    tenders: filtered.map(tender => localizeTender(seed, tender, lang)),
    activeTender: localizeTender(seed, activeTender, lang),
    featuredProjects,
    featuredCompanies,
    tenderSections: {
      lots: localizeTender(seed, activeTender, lang).lots,
      qualificationRequirements: localizeTender(seed, activeTender, lang).qualificationRequirements,
      commercialTerms: localizeTender(seed, activeTender, lang).commercialTerms
    }
  };
}

function buildChinaPayload(seed, runtime, params) {
  const lang = pickLang(params.lang, "zh");
  const sector = params.sector || "";
  const role = params.role || "";
  const market = params.market || "";
  const tenderId = params.tenderId || runtime.lastTenderId || seed.tenders[0].id;

  const filtered = seed.suppliers.filter(supplier => {
    if (sector && !(supplier.sectorKeys || []).includes(sector)) return false;
    if (role && supplier.roleType !== role) return false;
    if (market && !(supplier.africaMarketKeys || []).includes(market) && !(supplier.africaRegionKeys || []).includes(market)) return false;
    return true;
  });

  const supplierId = params.supplierId || runtime.lastSupplierId || filtered[0]?.id || seed.suppliers[0].id;
  const activeSupplier = supplierMap[supplierId] || filtered[0] || seed.suppliers[0];
  const activeTender = tenderMap[tenderId] || seed.tenders[0];
  const localizedActiveSupplier = localizeSupplier(seed, activeSupplier, lang);
  const matches = buildSupplierTenderMatches(seed, activeSupplier.id, lang);
  const topRoleFits = matches.slice(0, 3).map(item => ({
    tenderId: item.tender.id,
    title: item.tender.title,
    score: item.score.totalScore,
    mode: item.tender.mode,
    projectName: item.tender.project ? item.tender.project.name : "",
    explanation: item.score.reasons.slice(0, 2)
  }));

  return {
    lang,
    page: "china",
    meta: {
      title: t(seed.meta.platformTitle, lang),
      subtitle: t(seed.meta.platformSubtitle, lang)
    },
    overview: {
      title: t(seed.overview.china.title, lang),
      text: t(seed.overview.china.text, lang)
    },
    stats: localizedStats(seed, runtime, lang),
    filters: {
      sector,
      role,
      market,
      sectors: Object.entries(seed.lookups.sectors).map(([key, value]) => ({ key, label: t(value, lang) })),
      roles: Object.entries(seed.lookups.roleTypes).map(([key, value]) => ({ key, label: t(value, lang) })),
      markets: [
        ...seed.africaRegions.map(item => ({ key: item.key, label: t(item.name, lang) })),
        ...Object.entries(seed.lookups.countries)
          .filter(([key]) => key !== "china")
          .map(([key, value]) => ({ key, label: t(value, lang) }))
      ]
    },
    suppliers: filtered.map(supplier => localizeSupplier(seed, supplier, lang)),
    activeSupplier: localizedActiveSupplier,
    activeTender: localizeTender(seed, activeTender, lang),
    companyProfiles: uniqueById([
      localizedActiveSupplier.companyProfile,
      ...seed.companies
        .filter(company => company.companyType === "target_client" || company.companyType === "supplier")
        .map(company => localizeCompany(seed, company, lang))
    ]).slice(0, 4),
    visitBrief: localizedActiveSupplier.visitBrief,
    supplierTenderMatches: matches,
    roleFitSummary: {
      title: lang === "zh" ? "项目角色适配摘要" : "Role Fit Summary",
      items: topRoleFits
    },
    currentTenderScore: computeMatch(seed, activeTender, activeSupplier, lang),
    langyanMethod: buildLangyanMethod(lang)
  };
}

function buildMatchPayload(seed, runtime, params) {
  const lang = pickLang(params.lang, "en");
  const requestedMode = params.mode || "";
  const seedTender = requestedMode
    ? seed.tenders.find(item => item.mode === requestedMode) || seed.tenders[0]
    : seed.tenders[0];
  const tenderId = params.tenderId || runtime.lastTenderId || seedTender.id;
  const activeTender = tenderMap[tenderId] || seedTender;
  const localizedTender = localizeTender(seed, activeTender, lang);
  const relatedProject = localizedTender.project;
  const relatedCompanies = uniqueById([
    localizedTender.ownerCompany,
    ...(relatedProject?.relatedCompanyIds || []).map(id => localizeCompany(seed, companyMap[id], lang))
  ]);
  const matches = buildMatches(seed, activeTender.id, lang);
  const recommendationReasons = matches.slice(0, 3).map(item => ({
    supplierId: item.supplier.id,
    supplierName: item.supplier.company,
    reasons: item.score.reasons
  }));

  return {
    lang,
    page: "match",
    meta: {
      title: t(seed.meta.platformTitle, lang),
      subtitle: t(seed.meta.platformSubtitle, lang)
    },
    overview: {
      title: t(seed.overview.match.title, lang),
      text: t(seed.overview.match.text, lang)
    },
    stats: localizedStats(seed, runtime, lang),
    activeTender: localizedTender,
    mode: activeTender.mode,
    opportunities: seed.tenders.map(tender => ({
      id: tender.id,
      projectId: tender.projectId,
      mode: tender.mode,
      title: t(tender.title, lang)
    })),
    matchingMethod: localizedMatchingMethod(seed, lang),
    matches,
    relatedProject,
    relatedCompanies,
    recommendationReasons,
    shortlists: runtime.shortlists.map(item => {
      const tender = tenderMap[item.tenderId];
      const supplier = supplierMap[item.supplierId];
      const project = item.projectId ? projectMap[item.projectId] : tender ? projectMap[tender.projectId] : null;
      return {
        id: item.id,
        tenderId: item.tenderId,
        supplierId: item.supplierId,
        projectId: item.projectId || tender?.projectId || null,
        mode: item.mode || tender?.mode || "tender",
        tenderTitle: tender ? t(tender.title, lang) : item.tenderTitle,
        supplierName: supplier ? t(supplier.company, lang) : item.supplierName,
        projectName: project ? t(project.name, lang) : "",
        score: item.score,
        note: item.note,
        createdAt: item.createdAt
      };
    }),
    langyanMethod: buildLangyanMethod(lang)
  };
}

function appendShortlist(seed, runtime, body) {
  const tender = tenderMap[body.tenderId];
  const supplier = supplierMap[body.supplierId];
  if (!tender || !supplier) {
    throw new Error("Tender or supplier not found");
  }
  const record = {
    id: `sl-${Date.now()}`,
    tenderId: tender.id,
    supplierId: supplier.id,
    projectId: body.projectId || tender.projectId,
    mode: body.mode || tender.mode,
    note: body.note || "",
    score: computeMatch(seed, tender, supplier, "en").totalScore,
    createdAt: new Date().toISOString()
  };
  runtime.shortlists.unshift(record);
  runtime.shortlists = runtime.shortlists.slice(0, 20);
  runtime.lastTenderId = tender.id;
  runtime.lastSupplierId = supplier.id;
  writeRuntime(runtime);
  return record;
}

function updateState(runtime, body) {
  if (body.tenderId) runtime.lastTenderId = body.tenderId;
  if (body.supplierId) runtime.lastSupplierId = body.supplierId;
  writeRuntime(runtime);
}

function serveNamedPage(req, res, fileName) {
  serveStatic(req, res, path.join(PUBLIC_DIR, fileName));
}

function resolvePublicFile(pathname) {
  const relativePath = path.normalize(pathname.replace(/^\/+/, ""));
  const filePath = path.join(PUBLIC_DIR, relativePath);
  if (!filePath.startsWith(PUBLIC_DIR)) return null;
  return filePath;
}

function requestHandler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const runtime = readRuntime();

  if (pathname === "/healthz" && req.method === "GET") {
    sendJson(req, res, 200, {
      ok: true,
      service: "industrial-park-demo",
      uptimeSec: Math.round(process.uptime()),
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (pathname === "/") {
    redirect(res, "/africa");
    return;
  }

  if (pathname === "/africa") {
    serveNamedPage(req, res, "africa.html");
    return;
  }

  if (pathname === "/china") {
    serveNamedPage(req, res, "china.html");
    return;
  }

  if (pathname === "/match") {
    serveNamedPage(req, res, "match.html");
    return;
  }

  if (pathname === "/api/africa" && req.method === "GET") {
    sendJson(req, res, 200, buildAfricaPayload(seedData, runtime, Object.fromEntries(url.searchParams.entries())));
    return;
  }

  if (pathname === "/api/china" && req.method === "GET") {
    sendJson(req, res, 200, buildChinaPayload(seedData, runtime, Object.fromEntries(url.searchParams.entries())));
    return;
  }

  if (pathname === "/api/match" && req.method === "GET") {
    sendJson(req, res, 200, buildMatchPayload(seedData, runtime, Object.fromEntries(url.searchParams.entries())));
    return;
  }

  if (pathname === "/api/intent/shortlist" && req.method === "POST") {
    parseBody(req)
      .then(body => {
        if (!body.tenderId || !body.supplierId) {
          sendJson(req, res, 400, { error: "Missing tenderId or supplierId" });
          return;
        }
        const record = appendShortlist(seedData, runtime, body);
        sendJson(req, res, 201, { ok: true, record });
      })
      .catch(error => {
        console.error("[api] shortlist failed", error);
        sendJson(req, res, 400, { error: error.message });
      });
    return;
  }

  if ((pathname === "/api/state/tender" || pathname === "/api/state/supplier") && req.method === "POST") {
    parseBody(req)
      .then(body => {
        updateState(runtime, body);
        sendJson(req, res, 200, { ok: true });
      })
      .catch(error => {
        console.error("[api] state update failed", error);
        sendJson(req, res, 400, { error: error.message });
      });
    return;
  }

  const filePath = resolvePublicFile(pathname);
  if (!filePath) {
    sendText(req, res, 403, "Forbidden");
    return;
  }
  serveStatic(req, res, filePath);
}

const server = http.createServer(requestHandler);

server.listen(PORT, () => {
  console.log(`[startup] cross-border energy project demo listening on port ${PORT}`);
});

process.on("SIGTERM", () => {
  console.log("[shutdown] received SIGTERM");
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 10_000).unref();
});

process.on("SIGINT", () => {
  console.log("[shutdown] received SIGINT");
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 10_000).unref();
});

process.on("unhandledRejection", error => {
  console.error("[process] unhandledRejection", error);
});

process.on("uncaughtException", error => {
  console.error("[process] uncaughtException", error);
});
