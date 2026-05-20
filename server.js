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
const SCHEMA_VERSION = 4;
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
  sendBody(
    req,
    res,
    statusCode,
    JSON.stringify(payload),
    "application/json; charset=utf-8",
    { "Cache-Control": "no-store", ...headers }
  );
}

function sendText(req, res, statusCode, text, headers = {}) {
  sendBody(
    req,
    res,
    statusCode,
    text,
    "text/plain; charset=utf-8",
    { "Cache-Control": "no-store", ...headers }
  );
}

function redirect(res, location) {
  res.writeHead(302, {
    Location: location,
    "Cache-Control": "no-store"
  });
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
  return value;
}

function localizeLookup(seed, group, key, lang) {
  return t(seed.lookups[group][key], lang);
}

function overlapCount(a, b) {
  const setB = new Set((b || []).map(item => String(item).toLowerCase()));
  return (a || []).filter(item => setB.has(String(item).toLowerCase())).length;
}

function localizeTender(seed, tender, lang) {
  return {
    id: tender.id,
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
    certificationsRequired: tender.certificationsRequired,
    keywords: tender.keywords.map(item => t(item, lang)),
    highlights: tender.highlights.map(item => t(item, lang)),
    lots: tender.lots.map(item => t(item, lang))
  };
}

function localizeSupplier(seed, supplier, lang) {
  return {
    id: supplier.id,
    company: t(supplier.company, lang),
    companyShort: t(supplier.companyShort, lang),
    city: t(supplier.city, lang),
    province: t(supplier.province, lang),
    sectors: supplier.sectorKeys.map(key => ({
      key,
      label: localizeLookup(seed, "sectors", key, lang)
    })),
    certifications: supplier.certifications,
    monthlyCapacity: supplier.monthlyCapacity,
    leadDays: supplier.leadDays,
    responseHours: supplier.responseHours,
    languages: supplier.languages,
    africaMarkets: supplier.africaMarketKeys.map(key => localizeLookup(seed, "countries", key, lang)),
    africaRegions: supplier.africaRegionKeys.map(key => localizeLookup(seed, "regions", key, lang)),
    productFocus: t(supplier.productFocus, lang),
    verifiedTags: supplier.verifiedTagKeys.map(key => localizeLookup(seed, "verifiedTags", key, lang)),
    exportYears: supplier.exportYears,
    keywords: supplier.keywords,
    scoreHint: t(supplier.scoreHint, lang)
  };
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

function computeMatch(seed, tender, supplier, lang) {
  const exactSector = supplier.sectorKeys.includes(tender.sectorKey);
  const keywordOverlap = overlapCount(tender.keywordKeys, supplier.keywordKeys);
  const sectorScore = exactSector ? 35 : Math.min(22, keywordOverlap * 7);

  const certMatches = overlapCount(tender.certificationsRequired, supplier.certifications);
  const certScore = tender.certificationsRequired.length
    ? Math.round((certMatches / tender.certificationsRequired.length) * 25)
    : 25;

  let capacityScore = 0;
  capacityScore += Math.round(Math.min(1, supplier.monthlyCapacity / tender.requiredMonthlyCapacity) * 12);
  const leadGap = tender.targetLeadDays - supplier.leadDays;
  if (leadGap >= 0) capacityScore += 8;
  else if (leadGap >= -10) capacityScore += 5;
  else if (leadGap >= -20) capacityScore += 2;

  const regionMap = buildCountryToRegion(seed);
  const targetRegionKey = regionMap[tender.countryKey];
  let marketScore = 0;
  if (supplier.africaMarketKeys.includes(tender.countryKey)) marketScore = 10;
  else if (supplier.africaRegionKeys.includes(targetRegionKey)) marketScore = 7;
  else if (supplier.africaMarketKeys.length >= 3) marketScore = 4;

  let opsScore = 0;
  if (supplier.languages.includes(tender.language)) opsScore += 4;
  if (supplier.responseHours <= 8) opsScore += 3;
  else if (supplier.responseHours <= 24) opsScore += 2;
  if (supplier.verifiedTagKeys.includes("factory_audit")) opsScore += 2;
  if (supplier.verifiedTagKeys.includes("oem_odm")) opsScore += 1;

  const totalScore = Math.min(100, sectorScore + certScore + capacityScore + marketScore + opsScore);
  const reasons = [];
  if (exactSector) reasons.push(lang === "zh" ? "行业完全匹配" : "Exact sector fit");
  if (certMatches) reasons.push(lang === "zh" ? `认证命中 ${certMatches}/${tender.certificationsRequired.length}` : `Certification hit ${certMatches}/${tender.certificationsRequired.length}`);
  if (supplier.monthlyCapacity >= tender.requiredMonthlyCapacity) reasons.push(lang === "zh" ? "产能满足项目规模" : "Capacity meets tender volume");
  if (supplier.leadDays <= tender.targetLeadDays) reasons.push(lang === "zh" ? "交付周期可控" : "Lead time within target");
  if (supplier.africaMarketKeys.includes(tender.countryKey)) reasons.push(lang === "zh" ? "有该国履约经验" : "Delivery track record in target country");
  else if (supplier.africaRegionKeys.includes(targetRegionKey)) reasons.push(lang === "zh" ? "有该区域履约经验" : "Delivery track record in target region");
  if (supplier.languages.includes(tender.language)) reasons.push(lang === "zh" ? `支持 ${tender.language} 商务材料` : `${tender.language} documentation support`);

  return {
    totalScore,
    breakdown: {
      sectorScore,
      certScore,
      capacityScore,
      marketScore,
      opsScore
    },
    reasons
  };
}

function buildMatches(seed, tenderId, lang) {
  const tender = seed.tenders.find(item => item.id === tenderId) || seed.tenders[0];
  return seed.suppliers
    .map(supplier => ({
      supplier: localizeSupplier(seed, supplier, lang),
      score: computeMatch(seed, tender, supplier, lang)
    }))
    .sort((a, b) => b.score.totalScore - a.score.totalScore);
}

function buildSupplierTenderMatches(seed, supplierId, lang) {
  const supplier = seed.suppliers.find(item => item.id === supplierId) || seed.suppliers[0];
  return seed.tenders
    .map(tender => ({
      tender: localizeTender(seed, tender, lang),
      score: computeMatch(seed, tender, supplier, lang)
    }))
    .sort((a, b) => b.score.totalScore - a.score.totalScore)
    .slice(0, 4);
}

function localizedStats(seed, runtime, lang) {
  return [
    { label: lang === "zh" ? "活跃非洲招标" : "Active African Tenders", value: seed.tenders.length },
    { label: lang === "zh" ? "中国认证供应商" : "Verified China Suppliers", value: seed.suppliers.length },
    { label: lang === "zh" ? "自动匹配规则" : "Matching Rules", value: seed.matchingMethod.length },
    { label: lang === "zh" ? "已保存意向" : "Saved Shortlists", value: runtime.shortlists.length }
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
  const filtered = seed.tenders.filter(tender => {
    if (region && tender.regionKey !== region) return false;
    if (country && tender.countryKey !== country) return false;
    if (sector && tender.sectorKey !== sector) return false;
    return true;
  });
  const activeTenderId = params.tenderId || runtime.lastTenderId || filtered[0]?.id || seed.tenders[0].id;
  const activeTender = seed.tenders.find(item => item.id === activeTenderId) || filtered[0] || seed.tenders[0];

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
      regions: seed.africaRegions.map(item => ({ key: item.key, label: t(item.name, lang) })),
      countries: Object.entries(seed.lookups.countries).map(([key, value]) => ({ key, label: t(value, lang) })),
      sectors: Object.entries(seed.lookups.sectors).map(([key, value]) => ({ key, label: t(value, lang) }))
    },
    tenders: filtered.map(tender => localizeTender(seed, tender, lang)),
    activeTender: localizeTender(seed, activeTender, lang)
  };
}

function buildChinaPayload(seed, runtime, params) {
  const lang = pickLang(params.lang, "zh");
  const sector = params.sector || "";
  const cert = params.cert || "";
  const market = params.market || "";
  const tenderId = params.tenderId || runtime.lastTenderId || seed.tenders[0].id;

  const filtered = seed.suppliers.filter(supplier => {
    if (sector && !supplier.sectorKeys.includes(sector)) return false;
    if (cert && !supplier.certifications.includes(cert)) return false;
    if (market && !supplier.africaMarketKeys.includes(market) && !supplier.africaRegionKeys.includes(market)) return false;
    return true;
  });

  const supplierId = params.supplierId || runtime.lastSupplierId || filtered[0]?.id || seed.suppliers[0].id;
  const activeSupplier = seed.suppliers.find(item => item.id === supplierId) || filtered[0] || seed.suppliers[0];
  const activeTender = seed.tenders.find(item => item.id === tenderId) || seed.tenders[0];

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
      cert,
      market,
      sectors: Object.entries(seed.lookups.sectors).map(([key, value]) => ({ key, label: t(value, lang) })),
      certifications: seed.lookups.certifications,
      markets: [
        ...seed.africaRegions.map(region => ({ key: region.key, label: t(region.name, lang) })),
        ...Object.entries(seed.lookups.countries).map(([key, value]) => ({ key, label: t(value, lang) }))
      ]
    },
    suppliers: filtered.map(supplier => localizeSupplier(seed, supplier, lang)),
    activeSupplier: localizeSupplier(seed, activeSupplier, lang),
    supplierTenderMatches: buildSupplierTenderMatches(seed, activeSupplier.id, lang),
    activeTender: localizeTender(seed, activeTender, lang),
    currentTenderScore: computeMatch(seed, activeTender, activeSupplier, lang)
  };
}

function buildMatchPayload(seed, runtime, params) {
  const lang = pickLang(params.lang, "en");
  const tenderId = params.tenderId || runtime.lastTenderId || seed.tenders[0].id;
  const activeTender = seed.tenders.find(item => item.id === tenderId) || seed.tenders[0];

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
    activeTender: localizeTender(seed, activeTender, lang),
    matchingMethod: localizedMatchingMethod(seed, lang),
    matches: buildMatches(seed, activeTender.id, lang),
    shortlists: runtime.shortlists.map(item => {
      const tender = seed.tenders.find(entry => entry.id === item.tenderId);
      const supplier = seed.suppliers.find(entry => entry.id === item.supplierId);
      return {
        id: item.id,
        tenderId: item.tenderId,
        supplierId: item.supplierId,
        tenderTitle: tender ? t(tender.title, lang) : item.tenderTitle,
        supplierName: supplier ? t(supplier.company, lang) : item.supplierName,
        score: item.score,
        note: item.note,
        createdAt: item.createdAt
      };
    })
  };
}

function appendShortlist(seed, runtime, body) {
  const tender = seed.tenders.find(item => item.id === body.tenderId);
  const supplier = seed.suppliers.find(item => item.id === body.supplierId);
  if (!tender || !supplier) {
    throw new Error("Tender or supplier not found");
  }

  const record = {
    id: `sl-${Date.now()}`,
    tenderId: tender.id,
    supplierId: supplier.id,
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
  if (!filePath.startsWith(PUBLIC_DIR)) {
    return null;
  }
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
  console.log(`[startup] dual-site sourcing demo listening on port ${PORT}`);
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
