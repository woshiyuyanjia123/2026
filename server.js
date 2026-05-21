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
const SCHEMA_VERSION = 7;
const COMPRESSIBLE_EXTENSIONS = new Set([".html", ".css", ".js", ".json", ".txt", ".svg"]);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

const OPPORTUNITY_META = {
  "td-banten": {
    slug: "banten-ai-energy-park",
    asset: "banten-tender-pack",
    theme: "tender"
  },
  "td-dartz": {
    slug: "dartz-nigeria-portfolio",
    asset: "dartz-investment-pack",
    theme: "investment"
  }
};

const PARTICIPANT_META = {
  "sp-sunline": {
    slug: "sunline-global-energy",
    asset: "participant-case-pack"
  },
  "sp-gridforge": {
    slug: "gridforge-substation-systems",
    asset: "participant-case-pack"
  },
  "sp-nebula": {
    slug: "nebula-compute-integration",
    asset: "participant-case-pack"
  },
  "sp-zhida": {
    slug: "shanghai-zhida-technology",
    asset: "zhida-visit-brief"
  }
};

const SITE_CONTENT = {
  hero: {
    zh: {
      eyebrow: "跨境能源项目平台",
      title: "把项目机会、参与方筛选和合作转化连成一条正式业务链路",
      text: "面向新能源、储能、算力基础设施与跨境 EPC 协同，围绕真实项目机会、真实参与方画像和 CRM 协同流程，形成一个可对外发布的平台门户。",
      primary: { label: "查看项目机会", href: "/opportunities" },
      secondary: { label: "查看中国参与方", href: "/participants" },
      tertiary: { label: "申请合作对接", href: "/contact" }
    },
    en: {
      eyebrow: "Cross-border energy platform",
      title: "Turn project intelligence, participant screening, and partnership conversion into one published website",
      text: "A release-grade portal for energy projects, storage, AI infrastructure, and cross-border EPC cooperation, built around real opportunities, real participant profiles, and CRM-enabled follow-up.",
      primary: { label: "Explore opportunities", href: "/opportunities" },
      secondary: { label: "Explore participants", href: "/participants" },
      tertiary: { label: "Request cooperation", href: "/contact" }
    }
  },
  processSteps: {
    zh: [
      {
        id: "discover",
        title: "项目发现",
        text: "先公开展示招标与投资机会概览，降低初次接触门槛。",
        href: "/opportunities"
      },
      {
        id: "understand",
        title: "机会理解",
        text: "在独立详情页中解释资质门槛、商务结构和投资逻辑。",
        href: "/how-it-works"
      },
      {
        id: "match",
        title: "参与方匹配",
        text: "按角色、履历、区域经验和协同准备度生成可解释排序。",
        href: "/match"
      },
      {
        id: "convert",
        title: "CRM 转化",
        text: "通过表单解锁、shortlist 和记名线索推进合作对接。",
        href: "/contact"
      }
    ],
    en: [
      {
        id: "discover",
        title: "Project discovery",
        text: "Start with public tender and investment summaries to reduce the first-contact barrier.",
        href: "/opportunities"
      },
      {
        id: "understand",
        title: "Opportunity understanding",
        text: "Use standalone detail pages to explain qualifications, commercial structure, and investment logic.",
        href: "/how-it-works"
      },
      {
        id: "match",
        title: "Participant matching",
        text: "Rank candidates using role fit, credentials, regional experience, and collaboration readiness.",
        href: "/match"
      },
      {
        id: "convert",
        title: "CRM conversion",
        text: "Drive conversion with unlock forms, shortlist records, and named lead capture.",
        href: "/contact"
      }
    ]
  },
  faq: {
    zh: [
      {
        q: "为什么不直接公开全部资料？",
        a: "完整招标包、投资底稿和联系人涉及合规与商业边界，因此采用公开概览 + 表单解锁的方式。"
      },
      {
        q: "平台如何与 CRM 协同？",
        a: "平台展示公开与脱敏内容，真实客户敏感信息留在 CRM，后续通过模板、清单和线索推进承接。"
      },
      {
        q: "这是否只面向非洲？",
        a: "当前主案例覆盖印尼与尼日利亚，方法论适用于更广泛的海外园区与能源项目。"
      }
    ],
    en: [
      {
        q: "Why not publish every document openly?",
        a: "Full tender packs, investment files, and contacts sit behind compliance and commercial boundaries, so the site uses a public-summary plus form-unlock model."
      },
      {
        q: "How does the platform connect with CRM?",
        a: "The site publishes public and sanitized content while sensitive client information stays inside CRM for structured follow-up."
      },
      {
        q: "Is the platform only for Africa?",
        a: "The current primary cases span Indonesia and Nigeria, but the methodology is intended for broader overseas energy and industrial projects."
      }
    ]
  },
  solutions: {
    zh: {
      title: "平台能力与交付方法",
      intro: "围绕你前两份设计文件，这里把知识库分层、CRM 协同、合规拦截和服务推进机制整理成对外可讲清的正式能力页。",
      sections: [
        {
          title: "三层分离",
          text: "基础底座、内容层、应用层分开设计，既能快速演示，也方便后续扩展到更完整平台。"
        },
        {
          title: "三类库体",
          text: "公共通用库、业务专属库、涉密资源库分层沉淀，保证内容可以复用但敏感信息不外泄。"
        },
        {
          title: "CRM 协同",
          text: "在线索、拜访、项目推进和带团助手场景中，把案例、清单、模板和推荐项主动推送到动作节点。"
        },
        {
          title: "合规拦截",
          text: "报价、合同、深度资料解锁之前触发合规检查，避免把敏感联系人和底稿直接放到公开网站。"
        }
      ]
    },
    en: {
      title: "Platform capabilities and delivery method",
      intro: "This page translates the architecture and CRM documents into a release-grade capability page that explains the knowledge structure, CRM collaboration, compliance gating, and service workflow.",
      sections: [
        {
          title: "Three-layer separation",
          text: "Separate the infrastructure layer, content layer, and application layer so the product can launch fast and still expand later."
        },
        {
          title: "Three knowledge domains",
          text: "Separate public, business-specific, and sensitive libraries to maximize reuse without exposing confidential content."
        },
        {
          title: "CRM collaboration",
          text: "Push cases, templates, checklists, and recommendations into lead follow-up, visits, project progression, and delegation workflows."
        },
        {
          title: "Compliance gating",
          text: "Trigger checks before quotes, contracts, or deep-document unlocks to avoid exposing sensitive contacts or source files."
        }
      ]
    }
  },
  howItWorks: {
    zh: {
      title: "从公开网站到合作转化的操作逻辑",
      intro: "这个页面把站内链接和后续动作串起来，确保访客不是停在卡片浏览，而是被明确推进到下一步动作。",
      steps: [
        {
          title: "首页进入项目或参与方",
          text: "用户先通过首页进入项目详情或中国参与方详情。"
        },
        {
          title: "详情页理解机会与角色",
          text: "详情页解释项目结构、公司画像、资质要求、合作逻辑和推荐方向。"
        },
        {
          title: "匹配中心查看优先顺序",
          text: "把当前机会或当前参与方带入匹配中心，看到可解释排序、shortlist 和下一步动作。"
        },
        {
          title: "联系页 / 解锁页承接转化",
          text: "所有深度资料和合作沟通，最终都通过联系表单或资料解锁表单承接。"
        }
      ]
    },
    en: {
      title: "How the website moves users from discovery to cooperation",
      intro: "This page explains the site logic so visitors do not stop at browsing cards and are instead moved clearly into the next business action.",
      steps: [
        {
          title: "Enter via the home page",
          text: "Users begin with either project opportunities or China-side participant profiles."
        },
        {
          title: "Use detail pages to understand fit",
          text: "Detail pages explain project structure, company context, qualifications, commercial logic, and why certain partners fit."
        },
        {
          title: "Review the matching center",
          text: "The current opportunity or current participant is carried into the matching center to show explainable ranking and shortlist actions."
        },
        {
          title: "Convert through forms",
          text: "All deep-material requests and cooperation discussions are captured through contact and unlock forms."
        }
      ]
    }
  },
  footer: {
    zh: {
      intro: "跨境能源项目情报与撮合平台，围绕真实机会、真实参与方和 CRM 协同推进合作。",
      quickLinks: [
        { label: "首页", href: "/" },
        { label: "项目机会", href: "/opportunities" },
        { label: "中国参与方", href: "/participants" },
        { label: "匹配中心", href: "/match" },
        { label: "平台能力", href: "/solutions" },
        { label: "合作联系", href: "/contact" }
      ],
      disclaimer: "本站为演示与业务展示用途，深度资料与敏感信息需经合规审核后提供。"
    },
    en: {
      intro: "A cross-border energy project intelligence and matchmaking platform built around real opportunities, real participants, and CRM-driven cooperation.",
      quickLinks: [
        { label: "Home", href: "/" },
        { label: "Opportunities", href: "/opportunities" },
        { label: "Participants", href: "/participants" },
        { label: "Match", href: "/match" },
        { label: "Solutions", href: "/solutions" },
        { label: "Contact", href: "/contact" }
      ],
      disclaimer: "This site is a business demo. Deep materials and sensitive information are only released after compliance review."
    }
  },
  assets: {
    "banten-tender-pack": {
      zh: {
        title: "印尼万丹完整招标资料申请",
        description: "适用于需要完整招标说明、资质条款、标段逻辑和项目推进接口的合作方。",
        includes: ["完整招标结构说明", "标段与资质清单", "合作沟通入口"]
      },
      en: {
        title: "Request the full Banten tender pack",
        description: "For parties that need the detailed tender structure, qualification logic, package scope, and project-entry path.",
        includes: ["Full tender structure summary", "Qualification and package checklist", "Cooperation contact path"]
      }
    },
    "dartz-investment-pack": {
      zh: {
        title: "DARTZ 投资说明资料申请",
        description: "适用于关注项目成熟度、IRR 结构、合作模式和区域扩张逻辑的投资与合作方。",
        includes: ["投资框架摘要", "合作模式说明", "区域扩张与项目成熟度摘要"]
      },
      en: {
        title: "Request the DARTZ investment pack",
        description: "For investors and partners focused on project maturity, IRR logic, collaboration structure, and expansion potential.",
        includes: ["Investment structure summary", "Collaboration model overview", "Expansion and maturity highlights"]
      }
    },
    "participant-case-pack": {
      zh: {
        title: "中国参与方案例包申请",
        description: "适用于希望进一步了解参与方能力、合作方式和项目切入路径的项目方或合作方。",
        includes: ["参与方能力摘要", "案例与经验说明", "推荐合作路径"]
      },
      en: {
        title: "Request the participant case pack",
        description: "For project owners or partners who need a deeper view of China-side capabilities, cases, and entry models.",
        includes: ["Capability summary", "Case and experience overview", "Suggested cooperation paths"]
      }
    },
    "zhida-visit-brief": {
      zh: {
        title: "上海挚达拜访简报申请",
        description: "适用于围绕充电机器人、智能能源终端和场景合作推进的业务团队。",
        includes: ["拜访目标摘要", "合作信号与决策链", "后续推进建议"]
      },
      en: {
        title: "Request the Zhida visit brief",
        description: "For teams advancing charging robotics, smart-energy terminals, and scenario-led cooperation.",
        includes: ["Visit goals summary", "Signals and decision chain", "Suggested follow-up actions"]
      }
    }
  }
};

const PAGE_MAP = {
  "/": "index.html",
  "/opportunities": "opportunities.html",
  "/participants": "participants.html",
  "/match": "match.html",
  "/solutions": "solutions.html",
  "/how-it-works": "how-it-works.html",
  "/contact": "contact.html",
  "/unlock": "unlock.html"
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

function normalizeRuntime(runtime, fallback) {
  return {
    schemaVersion: SCHEMA_VERSION,
    lastTenderId: runtime.lastTenderId || fallback.lastTenderId,
    lastSupplierId: runtime.lastSupplierId || fallback.lastSupplierId,
    shortlists: Array.isArray(runtime.shortlists) ? runtime.shortlists : clone(fallback.shortlists || []),
    contactLeads: Array.isArray(runtime.contactLeads) ? runtime.contactLeads : [],
    unlockRequests: Array.isArray(runtime.unlockRequests) ? runtime.unlockRequests : [],
    leadRecords: Array.isArray(runtime.leadRecords) ? runtime.leadRecords : [],
    unlockRecords: Array.isArray(runtime.unlockRecords) ? runtime.unlockRecords : [],
    compareSelections: Array.isArray(runtime.compareSelections) ? runtime.compareSelections : []
  };
}

function loadRuntimeTemplate(seed) {
  const fallback = normalizeRuntime(seed.runtime || {}, seed.runtime || {});
  if (!fs.existsSync(RUNTIME_FILE)) {
    return fallback;
  }
  const runtime = readJson(RUNTIME_FILE);
  if (runtime.schemaVersion !== SCHEMA_VERSION) {
    return fallback;
  }
  return normalizeRuntime(runtime, fallback);
}

const seedData = loadSeed();
let runtimeState = clone(loadRuntimeTemplate(seedData));

const projectMap = Object.fromEntries(seedData.projects.map(item => [item.id, item]));
const companyMap = Object.fromEntries(seedData.companies.map(item => [item.id, item]));
const supplierMap = Object.fromEntries(seedData.suppliers.map(item => [item.id, item]));
const tenderMap = Object.fromEntries(seedData.tenders.map(item => [item.id, item]));
const visitBriefMap = Object.fromEntries(seedData.visitBriefs.map(item => [item.id, item]));
const opportunityBySlug = Object.fromEntries(Object.entries(OPPORTUNITY_META).map(([id, meta]) => [meta.slug, id]));
const participantBySlug = Object.fromEntries(Object.entries(PARTICIPANT_META).map(([id, meta]) => [meta.slug, id]));
const countryToRegion = buildCountryToRegion(seedData);

function readRuntime() {
  return runtimeState;
}

function writeRuntime(nextRuntime) {
  runtimeState = nextRuntime;
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

function sendJson(req, res, statusCode, payload) {
  sendBody(req, res, statusCode, JSON.stringify(payload), "application/json; charset=utf-8", { "Cache-Control": "no-store" });
}

function sendText(req, res, statusCode, text) {
  sendBody(req, res, statusCode, text, "text/plain; charset=utf-8", { "Cache-Control": "no-store" });
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

function servePage(req, res, fileName) {
  serveStatic(req, res, path.join(PUBLIC_DIR, fileName));
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

function pickLang(requestedLang, fallback = "en") {
  return requestedLang === "zh" || requestedLang === "en" ? requestedLang : fallback;
}

function t(value, lang) {
  if (value && typeof value === "object" && !Array.isArray(value) && ("zh" in value || "en" in value)) {
    return value[lang] || value.en || value.zh || "";
  }
  return value ?? "";
}

function localizeLookup(group, key, lang) {
  if (!key) return "";
  return t(seedData.lookups[group][key], lang);
}

function buildCountryToRegion(seed) {
  const mapping = {};
  (seed.africaRegions || []).forEach(region => {
    (region.countryKeys || []).forEach(countryKey => {
      mapping[countryKey] = region.key;
    });
  });
  return mapping;
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

function localizeProject(project, lang) {
  if (!project) return null;
  return {
    id: project.id,
    name: t(project.name, lang),
    location: t(project.location, lang),
    projectType: project.projectType,
    projectTypeLabel: localizeLookup("sectors", project.projectType, lang),
    capacityText: t(project.capacityText, lang),
    investmentAmount: t(project.investmentAmount, lang),
    timeline: t(project.timeline, lang),
    advantages: (project.advantages || []).map(item => t(item, lang)),
    revenueModel: (project.revenueModel || []).map(item => t(item, lang)),
    risks: (project.risks || []).map(item => t(item, lang)),
    relatedCompanyIds: project.relatedCompanyIds || []
  };
}

function localizeCompany(company, lang) {
  if (!company) return null;
  return {
    id: company.id,
    name: t(company.name, lang),
    companyType: company.companyType,
    companyTypeLabel: localizeLookup("companyTypes", company.companyType, lang),
    country: company.country,
    summary: t(company.summary, lang),
    highlights: (company.highlights || []).map(item => t(item, lang)),
    capabilities: (company.capabilities || []).map(item => t(item, lang)),
    signals: (company.signals || []).map(item => t(item, lang))
  };
}

function localizeVisitBrief(brief, lang) {
  if (!brief) return null;
  return {
    id: brief.id,
    companyId: brief.companyId,
    visitGoals: (brief.visitGoals || []).map(item => t(item, lang)),
    decisionMakers: brief.decisionMakers || [],
    productFocus: t(brief.productFocus, lang),
    coopSignals: (brief.coopSignals || []).map(item => t(item, lang))
  };
}

function localizeTender(tender, lang) {
  const project = projectMap[tender.projectId];
  const ownerCompany = companyMap[tender.ownerCompanyId];
  const meta = OPPORTUNITY_META[tender.id];
  return {
    id: tender.id,
    slug: meta?.slug || tender.id,
    asset: meta?.asset || "",
    projectId: tender.projectId,
    ownerCompanyId: tender.ownerCompanyId,
    mode: tender.mode,
    modeLabel: tender.mode === "investment"
      ? (lang === "zh" ? "投资合作" : "Investment collaboration")
      : (lang === "zh" ? "招标参与" : "Tender participation"),
    countryKey: tender.countryKey,
    regionKey: tender.regionKey,
    sectorKey: tender.sectorKey,
    country: localizeLookup("countries", tender.countryKey, lang),
    region: localizeLookup("regions", tender.regionKey, lang),
    sector: localizeLookup("sectors", tender.sectorKey, lang),
    title: t(tender.title, lang),
    description: t(tender.description, lang),
    buyerName: tender.buyerName,
    buyerType: localizeLookup("buyerTypes", tender.buyerTypeKey, lang),
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
    project: localizeProject(project, lang),
    ownerCompany: localizeCompany(ownerCompany, lang)
  };
}

function localizeSupplier(supplier, lang) {
  const company = companyMap[supplier.companyId];
  const visitBrief = supplier.visitBriefId ? visitBriefMap[supplier.visitBriefId] : null;
  const meta = PARTICIPANT_META[supplier.id];
  return {
    id: supplier.id,
    slug: meta?.slug || supplier.id,
    asset: meta?.asset || "participant-case-pack",
    companyId: supplier.companyId,
    roleType: supplier.roleType,
    roleLabel: localizeLookup("roleTypes", supplier.roleType, lang),
    company: t(supplier.company, lang),
    companyShort: t(supplier.companyShort, lang),
    city: t(supplier.city, lang),
    province: t(supplier.province, lang),
    sectors: (supplier.sectorKeys || []).map(key => ({ key, label: localizeLookup("sectors", key, lang) })),
    sectorKeys: supplier.sectorKeys || [],
    certifications: supplier.certifications || [],
    monthlyCapacity: supplier.monthlyCapacity,
    leadDays: supplier.leadDays,
    responseHours: supplier.responseHours,
    languages: supplier.languages || [],
    africaMarkets: (supplier.africaMarketKeys || []).map(key => localizeLookup("countries", key, lang)),
    africaRegions: (supplier.africaRegionKeys || []).map(key => localizeLookup("regions", key, lang)),
    africaMarketKeys: supplier.africaMarketKeys || [],
    africaRegionKeys: supplier.africaRegionKeys || [],
    productFocus: t(supplier.productFocus, lang),
    verifiedTags: (supplier.verifiedTagKeys || []).map(key => localizeLookup("verifiedTags", key, lang)),
    verifiedTagKeys: supplier.verifiedTagKeys || [],
    exportYears: supplier.exportYears,
    keywordKeys: supplier.keywordKeys || [],
    scoreHint: t(supplier.scoreHint, lang),
    experienceCases: (supplier.experienceCases || []).map(item => t(item, lang)),
    companyProfile: localizeCompany(company, lang),
    visitBrief: localizeVisitBrief(visitBrief, lang)
  };
}

function verificationLabel(lang, level = "standard") {
  const labels = {
    standard: lang === "zh" ? "已验证参与方" : "Verified participant",
    owner: lang === "zh" ? "已验证项目方" : "Verified project owner",
    investor: lang === "zh" ? "已验证投资机会" : "Verified investment opportunity"
  };
  return labels[level] || labels.standard;
}

function nextStepLabel(lang, type) {
  const map = {
    contact: lang === "zh" ? "顾问将在 1 个工作日内完成线索分发与初步联系。" : "A consultant will distribute and qualify this lead within one business day.",
    unlock: lang === "zh" ? "资料申请已进入合规审核，审核通过后将由顾问发送材料。" : "The material request is now under compliance review and a consultant will share the pack after approval."
  };
  return map[type];
}

function normalizeRatio(score, max) {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(1, score / max));
}

function computeTenderScores(tender, supplier, lang) {
  const roleBoost = { epc: 22, grid: 20, compute: 18, ecosystem: 10 }[supplier.roleType] || 8;
  let sectorRaw = roleBoost;
  if ((supplier.sectorKeys || []).includes(tender.sectorKey)) sectorRaw += 8;
  sectorRaw += Math.min(6, overlapCount(tender.keywordKeys, supplier.keywordKeys) * 2);
  const sectorScore = Math.min(32, Math.round(sectorRaw));

  const certMatches = overlapCount(tender.certificationsRequired, supplier.certifications);
  const certBase = tender.certificationsRequired.length ? (certMatches / tender.certificationsRequired.length) * 18 : 10;
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
  const opsScore = Math.min(10, Math.round(opsRaw));

  const reasons = [];
  reasons.push(lang === "zh" ? "角色适配度高" : "Strong role fit for the active opportunity");
  if (certMatches > 0) reasons.push(lang === "zh" ? `资质命中 ${certMatches}/${tender.certificationsRequired.length}` : `Credentials hit ${certMatches}/${tender.certificationsRequired.length}`);
  if (supplier.monthlyCapacity >= tender.requiredMonthlyCapacity) reasons.push(lang === "zh" ? "产能覆盖当前项目规模" : "Capacity covers the current project scope");
  if (supplier.leadDays <= tender.targetLeadDays) reasons.push(lang === "zh" ? "交付节奏落入执行窗口" : "Lead time fits the execution window");
  if ((supplier.africaMarketKeys || []).includes(tender.countryKey) || (supplier.africaRegionKeys || []).includes(tender.regionKey)) {
    reasons.push(lang === "zh" ? "已有目标区域协同经验" : "Relevant regional execution experience");
  }
  if ((supplier.verifiedTagKeys || []).includes("crm_ready")) reasons.push(lang === "zh" ? "适合直接纳入 CRM 跟进" : "Ready for CRM-enabled follow-up");

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
  reasons.push(lang === "zh" ? "合作逻辑更偏投资与生态协同" : "The fit is driven by investment and ecosystem collaboration logic");
  if ((supplier.verifiedTagKeys || []).includes("investment_ready")) reasons.push(lang === "zh" ? "具备投资合作就绪信号" : "Carries an investment-ready signal");
  if (supplier.visitBriefId) reasons.push(lang === "zh" ? "可衔接拜访与联合推进场景" : "Can connect into visit-led cooperation workflows");
  if ((supplier.africaMarketKeys || []).includes(tender.countryKey) || (supplier.africaRegionKeys || []).includes(tender.regionKey)) {
    reasons.push(lang === "zh" ? "具备区域协同经验" : "Shows relevant regional collaboration experience");
  }
  if ((supplier.verifiedTagKeys || []).includes("crm_ready")) reasons.push(lang === "zh" ? "适合形成 CRM 线索推进" : "Easy to operationalize through CRM follow-up");

  return {
    totalScore: sectorScore + certScore + capacityScore + marketScore + opsScore,
    breakdown: { sectorScore, certScore, capacityScore, marketScore, opsScore },
    reasons
  };
}

function computeMatch(tender, supplier, lang) {
  return tender.mode === "investment" ? computeInvestmentScores(tender, supplier, lang) : computeTenderScores(tender, supplier, lang);
}

function buildMatches(tenderId, lang) {
  const tender = tenderMap[tenderId] || seedData.tenders[0];
  return seedData.suppliers
    .map(supplier => ({
      supplier: localizeSupplier(supplier, lang),
      score: computeMatch(tender, supplier, lang)
    }))
    .sort((a, b) => b.score.totalScore - a.score.totalScore);
}

function buildSupplierOpportunityMatches(supplierId, lang) {
  const supplier = supplierMap[supplierId] || seedData.suppliers[0];
  return seedData.tenders
    .map(tender => ({
      opportunity: localizeTender(tender, lang),
      score: computeMatch(tender, supplier, lang)
    }))
    .sort((a, b) => b.score.totalScore - a.score.totalScore);
}

function buildSitePayload(lang) {
  const opportunities = seedData.tenders.map(tender => {
    const localized = localizeTender(tender, lang);
    return {
      id: localized.id,
      slug: localized.slug,
      title: localized.title,
      mode: localized.mode,
      modeLabel: localized.modeLabel,
      projectName: localized.project?.name || localized.title,
      country: localized.country,
      highlight: localized.highlights[0] || localized.description,
      href: `/opportunities/${localized.slug}`
    };
  });

  const participants = seedData.suppliers.map(supplier => {
    const localized = localizeSupplier(supplier, lang);
    return {
      id: localized.id,
      slug: localized.slug,
      name: localized.company,
      roleLabel: localized.roleLabel,
      teaser: localized.scoreHint || localized.productFocus,
      href: `/participants/${localized.slug}`
    };
  });

  return {
    lang,
    meta: {
      title: t(seedData.meta.platformTitle, lang),
      subtitle: t(seedData.meta.platformSubtitle, lang)
    },
    hero: SITE_CONTENT.hero[lang],
    kpis: [
      {
        value: "2",
        label: lang === "zh" ? "主项目机会" : "Flagship opportunities"
      },
      {
        value: "4",
        label: lang === "zh" ? "重点中国参与方" : "China-side participants"
      },
      {
        value: "3",
        label: lang === "zh" ? "可解锁资料包" : "Unlockable packs"
      },
      {
        value: "1",
        label: lang === "zh" ? "统一询盘闭环" : "Unified inquiry funnel"
      }
    ],
    featuredProjects: opportunities,
    featuredParticipants: participants,
    trustSignals: [
      {
        title: lang === "zh" ? "公开概览 + 深度解锁" : "Public summary plus gated unlock",
        text: lang === "zh" ? "先公开展示可判断机会的核心信息，再通过表单承接完整底稿与深度联系人申请。" : "Show enough public information to qualify interest, then gate full packs and deeper contacts through forms."
      },
      {
        title: lang === "zh" ? "验证标签" : "Verification signals",
        text: lang === "zh" ? "通过验证标签、能力履历和区域经验，帮助买方快速筛掉不适配对象。" : "Use verification tags, delivery track record, and regional experience to accelerate supplier screening."
      },
      {
        title: lang === "zh" ? "轻 CRM 分发" : "Light CRM distribution",
        text: lang === "zh" ? "询盘、资料申请和 shortlist 都会沉淀为可分发线索，而不是停留在展示页。" : "Inquiries, unlock requests, and shortlist actions are converted into distributable lead records."
      }
    ],
    resourcePacks: Object.entries(SITE_CONTENT.assets).map(([key, value]) => ({
      key,
      title: value[lang].title,
      description: value[lang].description,
      href: `/unlock?asset=${key}`
    })),
    processSteps: SITE_CONTENT.processSteps[lang],
    faq: SITE_CONTENT.faq[lang],
    assets: Object.fromEntries(
      Object.entries(SITE_CONTENT.assets).map(([key, value]) => [key, value[lang]])
    ),
    footer: SITE_CONTENT.footer[lang]
  };
}

function buildOpportunitiesPayload(params) {
  const lang = pickLang(params.lang, "en");
  const search = String(params.search || "").trim().toLowerCase();
  const mode = params.mode || "";
  const region = params.region || "";

  const items = seedData.tenders
    .map(tender => localizeTender(tender, lang))
    .filter(item => {
      if (mode && item.mode !== mode) return false;
      if (region && item.regionKey !== region) return false;
      if (!search) return true;
      return [item.title, item.description, item.project?.name, item.ownerCompany?.name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search);
    })
    .map(item => ({
      ...item,
      href: `/opportunities/${item.slug}`
    }));

  return {
    lang,
    hero: {
      title: lang === "zh" ? "项目机会中心" : "Opportunity Center",
      text: lang === "zh"
        ? "把招标机会和投资合作机会统一放在一个正式列表里，让访客先看项目，再做后续动作。"
        : "A release-grade listing for both tender and investment opportunities, designed to move visitors from project discovery into action."
    },
    filters: {
      search,
      mode,
      region,
      modes: [
        { key: "", label: lang === "zh" ? "全部模式" : "All modes" },
        { key: "tender", label: lang === "zh" ? "招标参与" : "Tender participation" },
        { key: "investment", label: lang === "zh" ? "投资合作" : "Investment collaboration" }
      ],
      regions: [
        { key: "", label: lang === "zh" ? "全部区域" : "All regions" },
        ...seedData.africaRegions.map(item => ({ key: item.key, label: t(item.name, lang) }))
      ]
    },
    items
  };
}

function buildOpportunityPayload(params) {
  const lang = pickLang(params.lang, "en");
  const tenderId = opportunityBySlug[params.slug] || seedData.tenders[0].id;
  const localized = localizeTender(tenderMap[tenderId], lang);
  const previewMatches = buildMatches(tenderId, lang).slice(0, 3);
  const asset = SITE_CONTENT.assets[localized.asset]?.[lang] || null;

  return {
    lang,
    breadcrumb: [
      { label: lang === "zh" ? "首页" : "Home", href: "/" },
      { label: lang === "zh" ? "项目机会" : "Opportunities", href: "/opportunities" },
      { label: localized.title, href: `/opportunities/${localized.slug}` }
    ],
    item: localized,
    asset,
    participantPreview: previewMatches.map(match => ({
      id: match.supplier.id,
      slug: match.supplier.slug,
      name: match.supplier.company,
      roleLabel: match.supplier.roleLabel,
      score: match.score.totalScore,
      teaser: match.score.reasons.slice(0, 2),
      href: `/participants/${match.supplier.slug}`
    })),
    ctas: {
      matchHref: `/match?tenderId=${localized.id}&mode=${localized.mode}`,
      unlockHref: `/unlock?asset=${localized.asset}&tenderId=${localized.id}&projectId=${localized.projectId}&mode=${localized.mode}`,
      contactHref: `/contact?tenderId=${localized.id}&projectId=${localized.projectId}&mode=${localized.mode}`
    }
  };
}

function buildParticipantsPayload(params) {
  const lang = pickLang(params.lang, "zh");
  const search = String(params.search || "").trim().toLowerCase();
  const role = params.role || "";
  const sector = params.sector || "";

  const items = seedData.suppliers
    .map(supplier => localizeSupplier(supplier, lang))
    .filter(item => {
      if (role && item.roleType !== role) return false;
      if (sector && !(item.sectorKeys || []).includes(sector)) return false;
      if (!search) return true;
      return [item.company, item.productFocus, item.companyProfile?.summary]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search);
    })
    .map(item => ({
      ...item,
      href: `/participants/${item.slug}`
    }));

  return {
    lang,
    hero: {
      title: lang === "zh" ? "中国参与方中心" : "China-side Participant Center",
      text: lang === "zh"
        ? "不只展示供应商，而是把 EPC、变电站、算力基础设施、生态合作方和目标客户画像一起组织成正式站点。"
        : "This is more than a supplier directory: it organizes EPC firms, substation players, compute infrastructure partners, ecosystem collaborators, and target accounts into a formal public-facing center."
    },
    filters: {
      search,
      role,
      sector,
      roles: [
        { key: "", label: lang === "zh" ? "全部角色" : "All roles" },
        ...Object.entries(seedData.lookups.roleTypes).map(([key, value]) => ({ key, label: t(value, lang) }))
      ],
      sectors: [
        { key: "", label: lang === "zh" ? "全部赛道" : "All sectors" },
        ...Object.entries(seedData.lookups.sectors).map(([key, value]) => ({ key, label: t(value, lang) }))
      ]
    },
    items
  };
}

function buildParticipantPayload(params) {
  const lang = pickLang(params.lang, "zh");
  const supplierId = participantBySlug[params.slug] || seedData.suppliers[0].id;
  const item = localizeSupplier(supplierMap[supplierId], lang);
  const opportunities = buildSupplierOpportunityMatches(supplierId, lang).slice(0, 4).map(entry => ({
    id: entry.opportunity.id,
    slug: entry.opportunity.slug,
    title: entry.opportunity.title,
    projectName: entry.opportunity.project?.name || entry.opportunity.title,
    mode: entry.opportunity.mode,
    modeLabel: entry.opportunity.modeLabel,
    score: entry.score.totalScore,
    reasons: entry.score.reasons.slice(0, 2),
    href: `/opportunities/${entry.opportunity.slug}`
  }));
  const asset = SITE_CONTENT.assets[item.asset]?.[lang] || SITE_CONTENT.assets["participant-case-pack"][lang];

  return {
    lang,
    breadcrumb: [
      { label: lang === "zh" ? "首页" : "Home", href: "/" },
      { label: lang === "zh" ? "中国参与方" : "Participants", href: "/participants" },
      { label: item.company, href: `/participants/${item.slug}` }
    ],
    item,
    asset,
    opportunities,
    ctas: {
      matchHref: `/match?participantId=${item.id}`,
      contactHref: `/contact?participantId=${item.id}`,
      unlockHref: `/unlock?asset=${item.asset}&participantId=${item.id}`
    }
  };
}

function buildMatchPayload(params, runtime) {
  const lang = pickLang(params.lang, "en");
  let tenderId = params.tenderId || runtime.lastTenderId || seedData.tenders[0].id;
  const participantId = params.participantId || "";
  const mode = params.mode || "";

  if (!params.tenderId && participantId && supplierMap[participantId]) {
    const suggested = buildSupplierOpportunityMatches(participantId, lang).find(entry => !mode || entry.opportunity.mode === mode);
    if (suggested) tenderId = suggested.opportunity.id;
  }
  if (!params.tenderId && mode) {
    const first = seedData.tenders.find(item => item.mode === mode);
    if (first) tenderId = first.id;
  }

  const activeTender = localizeTender(tenderMap[tenderId], lang);
  const selectedParticipant = participantId && supplierMap[participantId] ? localizeSupplier(supplierMap[participantId], lang) : null;
  const matches = buildMatches(activeTender.id, lang);
  const filteredMatches = selectedParticipant
    ? uniqueById([matches.find(item => item.supplier.id === selectedParticipant.id), ...matches].filter(Boolean))
    : matches;
  const relatedProject = activeTender.project;
  const relatedCompanies = uniqueById([
    activeTender.ownerCompany,
    ...(relatedProject?.relatedCompanyIds || []).map(id => localizeCompany(companyMap[id], lang))
  ]);

  return {
    lang,
    hero: {
      title: lang === "zh" ? "匹配中心" : "Matching Center",
      text: lang === "zh"
        ? "从项目页和参与方页双向进入，在一屏中完成模式切换、排序解释、shortlist 和记名转化动作。"
        : "Enter from either project or participant pages and complete mode switching, ranking, shortlist actions, and conversion triggers in one place."
    },
    mode: activeTender.mode,
    opportunities: seedData.tenders.map(tender => {
      const localized = localizeTender(tender, lang);
      return {
        id: localized.id,
        title: localized.title,
        slug: localized.slug,
        mode: localized.mode,
        modeLabel: localized.modeLabel,
        href: `/match?tenderId=${localized.id}&mode=${localized.mode}`
      };
    }),
    matchingMethod: seedData.matchingMethod.map(item => ({
      key: item.key,
      name: t(item.name, lang),
      description: t(item.description, lang),
      weight: item.weight
    })),
    activeTender,
    selectedParticipant,
    relatedProject,
    relatedCompanies,
    matches: filteredMatches.map(item => ({
      supplier: item.supplier,
      score: item.score,
      ctas: {
        participantHref: `/participants/${item.supplier.slug}`,
        contactHref: `/contact?tenderId=${activeTender.id}&participantId=${item.supplier.id}&projectId=${activeTender.projectId}&mode=${activeTender.mode}`,
        unlockHref: `/unlock?asset=${activeTender.asset}&tenderId=${activeTender.id}&participantId=${item.supplier.id}&projectId=${activeTender.projectId}&mode=${activeTender.mode}`
      }
    })),
    shortlists: (runtime.shortlists || []).map(item => {
      const tender = tenderMap[item.tenderId];
      const supplier = supplierMap[item.supplierId];
      return {
        id: item.id,
        tenderId: item.tenderId,
        supplierId: item.supplierId,
        projectId: item.projectId || tender?.projectId || null,
        mode: item.mode || tender?.mode || "tender",
        tenderTitle: tender ? t(tender.title, lang) : item.tenderId,
        supplierName: supplier ? t(supplier.company, lang) : item.supplierId,
        score: item.score,
        note: item.note,
        createdAt: item.createdAt
      };
    }),
    langyanMethod: {
      title: lang === "zh" ? "朗言协同方式" : "Langyan collaboration layer",
      items: [
        {
          title: lang === "zh" ? "知识库层" : "Knowledge layer",
          text: lang === "zh"
            ? "公共通用库、业务专属库、涉密资源库分层沉淀。"
            : "Public, business-specific, and sensitive libraries stay clearly separated."
        },
        {
          title: lang === "zh" ? "CRM 协同层" : "CRM collaboration layer",
          text: lang === "zh"
            ? "把推荐、模板、清单嵌入到项目推进和合作动作里。"
            : "Recommendations, templates, and checklists are injected into cooperation workflows."
        },
        {
          title: lang === "zh" ? "合规拦截" : "Compliance gating",
          text: lang === "zh"
            ? "深度资料和敏感联系人不直接公开，通过解锁与审批推进。"
            : "Deep materials and sensitive contacts stay gated behind unlock and review steps."
        }
      ]
    }
  };
}

function buildSolutionsPayload(params) {
  const lang = pickLang(params.lang, "zh");
  return {
    lang,
    ...SITE_CONTENT.solutions[lang],
    footer: SITE_CONTENT.footer[lang]
  };
}

function buildContactContext(params, lang) {
  const tender = params.tenderId ? tenderMap[params.tenderId] : null;
  const supplier = params.participantId ? supplierMap[params.participantId] : null;
  const project = params.projectId ? projectMap[params.projectId] : tender ? projectMap[tender.projectId] : null;
  return {
    tenderId: params.tenderId || "",
    participantId: params.participantId || "",
    projectId: params.projectId || "",
    mode: params.mode || tender?.mode || "",
    projectName: project ? t(project.name, lang) : "",
    opportunityTitle: tender ? t(tender.title, lang) : "",
    participantName: supplier ? t(supplier.company, lang) : ""
  };
}

function appendShortlist(runtime, body) {
  const tender = tenderMap[body.tenderId];
  const supplier = supplierMap[body.participantId || body.supplierId];
  if (!tender || !supplier) throw new Error("Tender or participant not found");
  const record = {
    id: `sl-${Date.now()}`,
    tenderId: tender.id,
    supplierId: supplier.id,
    projectId: body.projectId || tender.projectId,
    mode: body.mode || tender.mode,
    note: body.note || "",
    score: computeMatch(tender, supplier, "en").totalScore,
    createdAt: new Date().toISOString()
  };
  runtime.shortlists.unshift(record);
  runtime.shortlists = runtime.shortlists.slice(0, 20);
  runtime.lastTenderId = tender.id;
  runtime.lastSupplierId = supplier.id;
  writeRuntime(runtime);
  return record;
}

function appendContactLead(runtime, body) {
  const record = {
    id: `lead-${Date.now()}`,
    name: body.name || "",
    company: body.company || "",
    title: body.title || "",
    contact: body.contact || "",
    cooperationType: body.cooperationType || "",
    note: body.note || "",
    projectId: body.projectId || "",
    tenderId: body.tenderId || "",
    participantId: body.participantId || "",
    mode: body.mode || "",
    createdAt: new Date().toISOString()
  };
  runtime.contactLeads.unshift(record);
  runtime.contactLeads = runtime.contactLeads.slice(0, 100);
  writeRuntime(runtime);
  return record;
}

function appendUnlockRequest(runtime, body) {
  const record = {
    id: `unlock-${Date.now()}`,
    asset: body.asset || "",
    name: body.name || "",
    company: body.company || "",
    title: body.title || "",
    contact: body.contact || "",
    note: body.note || "",
    projectId: body.projectId || "",
    tenderId: body.tenderId || "",
    participantId: body.participantId || "",
    mode: body.mode || "",
    createdAt: new Date().toISOString()
  };
  runtime.unlockRequests.unshift(record);
  runtime.unlockRequests = runtime.unlockRequests.slice(0, 100);
  writeRuntime(runtime);
  return record;
}

function updateState(runtime, body) {
  if (body.tenderId) runtime.lastTenderId = body.tenderId;
  if (body.supplierId || body.participantId) runtime.lastSupplierId = body.supplierId || body.participantId;
  writeRuntime(runtime);
}

function uniqueStrings(items) {
  return [...new Set((items || []).filter(Boolean).map(item => String(item)))];
}

function buildOpportunitiesPayloadRich(params) {
  const lang = pickLang(params.lang, "en");
  const search = String(params.search || "").trim().toLowerCase();
  const mode = params.mode || "";
  const region = params.region || "";
  const country = params.country || "";

  const items = seedData.tenders
    .map(tender => localizeTender(tender, lang))
    .filter(item => {
      if (mode && item.mode !== mode) return false;
      if (region && item.regionKey !== region) return false;
      if (country && item.countryKey !== country) return false;
      if (!search) return true;
      return [item.title, item.description, item.project?.name, item.ownerCompany?.name, item.country, item.region]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search);
    })
    .map(item => ({
      ...item,
      verified: true,
      featured: ["td-banten", "td-dartz"].includes(item.id),
      verification: verificationLabel(lang, item.mode === "investment" ? "investor" : "owner"),
      tags: uniqueStrings([item.modeLabel, item.country, item.region, item.ownerCompany?.companyTypeLabel || item.buyerType]),
      primaryCtas: {
        inquiryHref: `/contact?tenderId=${item.id}&projectId=${item.projectId}&mode=${item.mode}`,
        unlockHref: `/unlock?asset=${item.asset}&tenderId=${item.id}&projectId=${item.projectId}&mode=${item.mode}`,
        matchHref: `/match?tenderId=${item.id}&mode=${item.mode}`
      },
      href: `/opportunities/${item.slug}`
    }));

  return {
    lang,
    hero: {
      title: lang === "zh" ? "项目机会中心" : "Opportunity Center",
      text: lang === "zh"
        ? "把招标机会和投资合作机会统一放在一个正式列表里，让访客先看项目，再进入询盘、解锁和匹配动作。"
        : "A release-grade listing for both tender and investment opportunities, designed to move visitors from project discovery into inquiry, unlock, and matching actions."
    },
    filters: {
      search,
      mode,
      region,
      country,
      modes: [
        { key: "", label: lang === "zh" ? "全部模式" : "All modes" },
        { key: "tender", label: lang === "zh" ? "招标参与" : "Tender participation" },
        { key: "investment", label: lang === "zh" ? "投资合作" : "Investment collaboration" }
      ],
      regions: [
        { key: "", label: lang === "zh" ? "全部区域" : "All regions" },
        ...seedData.africaRegions.map(item => ({ key: item.key, label: t(item.name, lang) }))
      ],
      countries: [
        { key: "", label: lang === "zh" ? "全部国家" : "All countries" },
        ...Object.entries(seedData.lookups.countries).map(([key, value]) => ({ key, label: t(value, lang) }))
      ]
    },
    items
  };
}

function buildOpportunityPayloadRich(params) {
  const lang = pickLang(params.lang, "en");
  const tenderId = opportunityBySlug[params.slug] || seedData.tenders[0].id;
  const localized = localizeTender(tenderMap[tenderId], lang);
  const previewMatches = buildMatches(tenderId, lang).slice(0, 3);
  const asset = SITE_CONTENT.assets[localized.asset]?.[lang] || null;

  return {
    lang,
    breadcrumb: [
      { label: lang === "zh" ? "首页" : "Home", href: "/" },
      { label: lang === "zh" ? "项目机会" : "Opportunities", href: "/opportunities" },
      { label: localized.title, href: `/opportunities/${localized.slug}` }
    ],
    item: localized,
    asset,
    verification: verificationLabel(lang, localized.mode === "investment" ? "investor" : "owner"),
    timeline: [
      { label: lang === "zh" ? "项目周期" : "Project timeline", value: localized.project?.timeline || localized.deadline },
      { label: lang === "zh" ? "截止时间" : "Deadline", value: localized.deadline },
      { label: lang === "zh" ? "交付窗口" : "Execution window", value: `${localized.targetLeadDays} ${lang === "zh" ? "天" : "days"}` }
    ],
    relatedAssets: [
      {
        key: localized.asset,
        title: asset?.title || localized.title,
        description: asset?.description || localized.description,
        href: `/unlock?asset=${localized.asset}&tenderId=${localized.id}&projectId=${localized.projectId}&mode=${localized.mode}`
      }
    ],
    primaryCtas: {
      inquiryHref: `/contact?tenderId=${localized.id}&projectId=${localized.projectId}&mode=${localized.mode}`,
      unlockHref: `/unlock?asset=${localized.asset}&tenderId=${localized.id}&projectId=${localized.projectId}&mode=${localized.mode}`,
      matchHref: `/match?tenderId=${localized.id}&mode=${localized.mode}`
    },
    participantPreview: previewMatches.map(match => ({
      id: match.supplier.id,
      slug: match.supplier.slug,
      name: match.supplier.company,
      roleLabel: match.supplier.roleLabel,
      score: match.score.totalScore,
      teaser: match.score.reasons.slice(0, 2),
      href: `/participants/${match.supplier.slug}`
    })),
    ctas: {
      matchHref: `/match?tenderId=${localized.id}&mode=${localized.mode}`,
      unlockHref: `/unlock?asset=${localized.asset}&tenderId=${localized.id}&projectId=${localized.projectId}&mode=${localized.mode}`,
      contactHref: `/contact?tenderId=${localized.id}&projectId=${localized.projectId}&mode=${localized.mode}`
    }
  };
}

function buildParticipantsPayloadRich(params) {
  const lang = pickLang(params.lang, "zh");
  const search = String(params.search || "").trim().toLowerCase();
  const role = params.role || "";
  const sector = params.sector || "";
  const certification = params.certification || "";
  const readiness = params.readiness || "";

  const items = seedData.suppliers
    .map(supplier => localizeSupplier(supplier, lang))
    .filter(item => {
      if (role && item.roleType !== role) return false;
      if (sector && !(item.sectorKeys || []).includes(sector)) return false;
      if (certification && !(item.certifications || []).includes(certification)) return false;
      if (readiness && !(item.verifiedTagKeys || []).includes(readiness)) return false;
      if (!search) return true;
      return [item.company, item.productFocus, item.companyProfile?.summary, ...(item.certifications || []), ...(item.verifiedTags || [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search);
    })
    .map(item => ({
      ...item,
      verification: verificationLabel(lang, "standard"),
      roleTags: uniqueStrings([item.roleLabel, ...(item.verifiedTags || [])]),
      compareReady: true,
      primaryCtas: {
        inquiryHref: `/contact?participantId=${item.id}`,
        unlockHref: `/unlock?asset=${item.asset}&participantId=${item.id}`,
        matchHref: `/match?participantId=${item.id}`
      },
      href: `/participants/${item.slug}`
    }));

  const allCertifications = uniqueStrings(seedData.suppliers.flatMap(item => item.certifications || []));

  return {
    lang,
    hero: {
      title: lang === "zh" ? "中国参与方中心" : "China-side Participant Center",
      text: lang === "zh"
        ? "把 EPC、电力、算力基础设施和生态合作方组织成正式的参与方发现中心，并配套筛选、对比和询盘动作。"
        : "Organize EPC, power, compute infrastructure, and ecosystem collaborators into a searchable participant discovery center."
    },
    filters: {
      search,
      role,
      sector,
      certification,
      readiness,
      roles: [
        { key: "", label: lang === "zh" ? "全部角色" : "All roles" },
        ...Object.entries(seedData.lookups.roleTypes).map(([key, value]) => ({ key, label: t(value, lang) }))
      ],
      sectors: [
        { key: "", label: lang === "zh" ? "全部赛道" : "All sectors" },
        ...Object.entries(seedData.lookups.sectors).map(([key, value]) => ({ key, label: t(value, lang) }))
      ],
      certifications: [
        { key: "", label: lang === "zh" ? "全部资质" : "All certifications" },
        ...allCertifications.map(value => ({ key: value, label: value }))
      ],
      readinessOptions: [
        { key: "", label: lang === "zh" ? "全部就绪度" : "All readiness" },
        ...Object.entries(seedData.lookups.verifiedTags).map(([key, value]) => ({ key, label: t(value, lang) }))
      ]
    },
    items
  };
}

function buildParticipantPayloadRich(params) {
  const lang = pickLang(params.lang, "zh");
  const supplierId = participantBySlug[params.slug] || seedData.suppliers[0].id;
  const item = localizeSupplier(supplierMap[supplierId], lang);
  const opportunities = buildSupplierOpportunityMatches(supplierId, lang).slice(0, 4).map(entry => ({
    id: entry.opportunity.id,
    slug: entry.opportunity.slug,
    title: entry.opportunity.title,
    projectName: entry.opportunity.project?.name || entry.opportunity.title,
    mode: entry.opportunity.mode,
    modeLabel: entry.opportunity.modeLabel,
    score: entry.score.totalScore,
    reasons: entry.score.reasons.slice(0, 2),
    href: `/opportunities/${entry.opportunity.slug}`
  }));
  const asset = SITE_CONTENT.assets[item.asset]?.[lang] || SITE_CONTENT.assets["participant-case-pack"][lang];

  return {
    lang,
    breadcrumb: [
      { label: lang === "zh" ? "首页" : "Home", href: "/" },
      { label: lang === "zh" ? "中国参与方" : "Participants", href: "/participants" },
      { label: item.company, href: `/participants/${item.slug}` }
    ],
    item,
    asset,
    verification: verificationLabel(lang, "standard"),
    capabilityBlocks: [
      {
        title: lang === "zh" ? "认证与验证" : "Certification and verification",
        items: uniqueStrings([...(item.certifications || []), ...(item.verifiedTags || [])])
      },
      {
        title: lang === "zh" ? "交付与区域能力" : "Delivery and regional reach",
        items: uniqueStrings([
          `${item.monthlyCapacity}/month`,
          `${item.leadDays} ${lang === "zh" ? "天交付" : "day lead time"}`,
          ...(item.africaMarkets || []),
          ...(item.africaRegions || [])
        ])
      }
    ],
    opportunities,
    primaryCtas: {
      inquiryHref: `/contact?participantId=${item.id}`,
      unlockHref: `/unlock?asset=${item.asset}&participantId=${item.id}`,
      matchHref: `/match?participantId=${item.id}`
    },
    ctas: {
      matchHref: `/match?participantId=${item.id}`,
      contactHref: `/contact?participantId=${item.id}`,
      unlockHref: `/unlock?asset=${item.asset}&participantId=${item.id}`
    }
  };
}

function buildComparePayload(params, runtime) {
  const lang = pickLang(params.lang, "en");
  const compareItems = (runtime.compareSelections || [])
    .map(item => {
      const supplier = supplierMap[item.supplierId];
      if (!supplier) return null;
      const localized = localizeSupplier(supplier, lang);
      const tender = item.tenderId ? tenderMap[item.tenderId] : null;
      const score = tender ? computeMatch(tender, supplier, lang) : null;
      return {
        id: localized.id,
        slug: localized.slug,
        company: localized.company,
        roleLabel: localized.roleLabel,
        verification: verificationLabel(lang, "standard"),
        certifications: localized.certifications,
        regions: localized.africaRegions,
        readiness: localized.verifiedTags,
        capacity: `${localized.monthlyCapacity}/month`,
        leadDays: localized.leadDays,
        responseHours: localized.responseHours,
        score: score?.totalScore || item.score || 0,
        compareFor: tender ? t(tender.title, lang) : "",
        ctas: {
          contactHref: `/contact?participantId=${localized.id}${item.projectId ? `&projectId=${item.projectId}` : ""}${item.tenderId ? `&tenderId=${item.tenderId}` : ""}${item.mode ? `&mode=${item.mode}` : ""}`,
          unlockHref: `/unlock?asset=${localized.asset}&participantId=${localized.id}${item.projectId ? `&projectId=${item.projectId}` : ""}${item.tenderId ? `&tenderId=${item.tenderId}` : ""}${item.mode ? `&mode=${item.mode}` : ""}`,
          participantHref: `/participants/${localized.slug}`
        }
      };
    })
    .filter(Boolean)
    .slice(0, 3);

  return {
    lang,
    items: compareItems,
    dimensions: [
      lang === "zh" ? "角色适配" : "Role fit",
      lang === "zh" ? "资质与验证" : "Credentials",
      lang === "zh" ? "交付能力" : "Delivery capacity",
      lang === "zh" ? "区域经验" : "Regional coverage",
      lang === "zh" ? "响应准备度" : "Response readiness"
    ]
  };
}

function buildMatchPayloadRich(params, runtime) {
  const base = buildMatchPayload(params, runtime);
  const compareItems = (runtime.compareSelections || [])
    .map(item => {
      const supplier = supplierMap[item.supplierId];
      if (!supplier) return null;
      const localized = localizeSupplier(supplier, base.lang);
      return {
        id: localized.id,
        slug: localized.slug,
        name: localized.company,
        roleLabel: localized.roleLabel,
        score: item.score || 0,
        href: `/participants/${localized.slug}`
      };
    })
    .filter(Boolean)
    .slice(0, 3);

  return {
    ...base,
    compareCandidates: compareItems,
    nextActions: [
      {
        label: base.lang === "zh" ? "提交合作意向" : "Submit cooperation inquiry",
        href: `/contact?tenderId=${base.activeTender.id}&projectId=${base.activeTender.projectId}&mode=${base.activeTender.mode}${base.selectedParticipant ? `&participantId=${base.selectedParticipant.id}` : ""}`
      },
      {
        label: base.lang === "zh" ? "申请完整资料" : "Unlock full pack",
        href: `/unlock?asset=${base.activeTender.asset}&tenderId=${base.activeTender.id}&projectId=${base.activeTender.projectId}&mode=${base.activeTender.mode}${base.selectedParticipant ? `&participantId=${base.selectedParticipant.id}` : ""}`
      }
    ]
  };
}

function buildLeadContextPayload(params, runtime) {
  const lang = pickLang(params.lang, "zh");
  const context = buildContactContext(params, lang);
  const comparePayload = buildComparePayload(params, runtime);
  return {
    ...context,
    compare: comparePayload.items,
    nextStep: context.participantId ? nextStepLabel(lang, "contact") : nextStepLabel(lang, "unlock")
  };
}

function appendCompareSelection(runtime, body) {
  const tender = body.tenderId ? tenderMap[body.tenderId] : null;
  const supplier = supplierMap[body.participantId || body.supplierId];
  if (!supplier) throw new Error("Participant not found");
  const score = tender ? computeMatch(tender, supplier, "en").totalScore : 0;
  const record = {
    id: `cmp-${Date.now()}`,
    tenderId: tender?.id || "",
    supplierId: supplier.id,
    projectId: body.projectId || tender?.projectId || "",
    mode: body.mode || tender?.mode || "",
    score,
    createdAt: new Date().toISOString()
  };
  runtime.compareSelections = [record, ...(runtime.compareSelections || []).filter(item => item.supplierId !== supplier.id)].slice(0, 3);
  writeRuntime(runtime);
  return record;
}

function appendContactLeadRich(runtime, body) {
  const record = appendContactLead(runtime, body);
  const leadRecord = {
    id: record.id,
    type: body.participantId ? "participant_inquiry" : "project_inquiry",
    status: "new",
    nextStep: nextStepLabel(pickLang(body.lang, "zh"), "contact"),
    projectId: record.projectId,
    tenderId: record.tenderId,
    participantId: record.participantId,
    createdAt: record.createdAt
  };
  runtime.leadRecords.unshift(leadRecord);
  runtime.leadRecords = runtime.leadRecords.slice(0, 100);
  writeRuntime(runtime);
  return { ...record, status: leadRecord.status, nextStep: leadRecord.nextStep };
}

function appendUnlockRequestRich(runtime, body) {
  const record = appendUnlockRequest(runtime, body);
  const unlockRecord = {
    id: record.id,
    type: "unlock_request",
    status: "qualified",
    nextStep: nextStepLabel(pickLang(body.lang, "zh"), "unlock"),
    asset: record.asset,
    projectId: record.projectId,
    tenderId: record.tenderId,
    participantId: record.participantId,
    createdAt: record.createdAt
  };
  runtime.unlockRecords.unshift(unlockRecord);
  runtime.unlockRecords = runtime.unlockRecords.slice(0, 100);
  writeRuntime(runtime);
  return { ...record, status: unlockRecord.status, nextStep: unlockRecord.nextStep };
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
  const params = Object.fromEntries(url.searchParams.entries());
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

  if (pathname === "/africa") {
    redirect(res, "/opportunities");
    return;
  }

  if (pathname === "/china") {
    redirect(res, "/participants");
    return;
  }

  if (pathname === "/api/site" && req.method === "GET") {
    sendJson(req, res, 200, buildSitePayload(pickLang(params.lang, "en")));
    return;
  }

  if (pathname === "/api/opportunities" && req.method === "GET") {
    sendJson(req, res, 200, buildOpportunitiesPayloadRich(params));
    return;
  }

  if (pathname === "/api/opportunity" && req.method === "GET") {
    sendJson(req, res, 200, buildOpportunityPayloadRich(params));
    return;
  }

  if (pathname === "/api/participants" && req.method === "GET") {
    sendJson(req, res, 200, buildParticipantsPayloadRich(params));
    return;
  }

  if (pathname === "/api/participant" && req.method === "GET") {
    sendJson(req, res, 200, buildParticipantPayloadRich(params));
    return;
  }

  if (pathname === "/api/match" && req.method === "GET") {
    sendJson(req, res, 200, buildMatchPayloadRich(params, runtime));
    return;
  }

  if (pathname === "/api/solutions" && req.method === "GET") {
    sendJson(req, res, 200, buildSolutionsPayload(params));
    return;
  }

  if ((pathname === "/api/contact-context" || pathname === "/api/lead-context") && req.method === "GET") {
    sendJson(req, res, 200, buildLeadContextPayload(params, runtime));
    return;
  }

  if (pathname === "/api/compare" && req.method === "GET") {
    sendJson(req, res, 200, buildComparePayload(params, runtime));
    return;
  }

  if (pathname === "/api/leads/contact" && req.method === "POST") {
    parseBody(req)
      .then(body => {
        if (!body.name || !body.company || !body.contact) {
          sendJson(req, res, 400, { error: "Missing contact lead fields" });
          return;
        }
        const record = appendContactLeadRich(runtime, body);
        sendJson(req, res, 201, {
          ok: true,
          record,
          leadId: record.id,
          status: record.status,
          nextStep: record.nextStep,
          message: pickLang(body.lang, "zh") === "zh"
            ? "合作意向已提交，顾问将在后续对接。"
            : "Your cooperation request has been submitted. A consultant will follow up."
        });
      })
      .catch(error => {
        console.error("[api] contact lead failed", error);
        sendJson(req, res, 400, { error: error.message });
      });
    return;
  }

  if (pathname === "/api/leads/unlock" && req.method === "POST") {
    parseBody(req)
      .then(body => {
        if (!body.asset || !body.name || !body.company || !body.contact) {
          sendJson(req, res, 400, { error: "Missing unlock request fields" });
          return;
        }
        const record = appendUnlockRequestRich(runtime, body);
        sendJson(req, res, 201, {
          ok: true,
          record,
          requestId: record.id,
          status: record.status,
          nextStep: record.nextStep,
          message: pickLang(body.lang, "zh") === "zh"
            ? "资料申请已提交，顾问将在后续对接。"
            : "Your material request has been submitted. A consultant will follow up."
        });
      })
      .catch(error => {
        console.error("[api] unlock request failed", error);
        sendJson(req, res, 400, { error: error.message });
      });
    return;
  }

  if (pathname === "/api/intent/shortlist" && req.method === "POST") {
    parseBody(req)
      .then(body => {
        if (!body.tenderId || !(body.participantId || body.supplierId)) {
          sendJson(req, res, 400, { error: "Missing tenderId or participantId" });
          return;
        }
        const record = appendShortlist(runtime, body);
        sendJson(req, res, 201, { ok: true, record });
      })
      .catch(error => {
        console.error("[api] shortlist failed", error);
        sendJson(req, res, 400, { error: error.message });
      });
    return;
  }

  if (pathname === "/api/intent/compare" && req.method === "POST") {
    parseBody(req)
      .then(body => {
        if (!(body.participantId || body.supplierId)) {
          sendJson(req, res, 400, { error: "Missing participantId" });
          return;
        }
        const record = appendCompareSelection(runtime, body);
        sendJson(req, res, 201, {
          ok: true,
          record,
          compare: buildComparePayload(params, runtime)
        });
      })
      .catch(error => {
        console.error("[api] compare failed", error);
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

  if (pathname in PAGE_MAP) {
    servePage(req, res, PAGE_MAP[pathname]);
    return;
  }

  if (pathname.startsWith("/opportunities/")) {
    servePage(req, res, "opportunity.html");
    return;
  }

  if (pathname.startsWith("/participants/")) {
    servePage(req, res, "participant.html");
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
  console.log(`[startup] energy portal listening on port ${PORT}`);
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
