#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const SOURCES = [
  { id: 'bbc', name: 'BBC World', url: 'http://feeds.bbci.co.uk/news/world/rss.xml', region: 'Global' },
  { id: 'nyt', name: 'NYT World', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', region: 'Global' },
  { id: 'un', name: 'UN News', url: 'https://news.un.org/feed/subscribe/en/news/all/rss.xml', region: 'Global' },
  { id: 'aljazeera', name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', region: 'Global' }
];

const REGION_KEYWORDS = [
  { region: 'Europe', keywords: ['europe', 'eu', 'uk', 'france', 'germany', 'italy', 'spain', 'ukraine', 'russia'] },
  { region: 'Asia', keywords: ['asia', 'china', 'japan', 'korea', 'india', 'taiwan', 'southeast asia', 'philippines'] },
  { region: 'Africa', keywords: ['africa', 'sudan', 'ethiopia', 'niger', 'congo', 'sahel', 'kenya', 'somalia'] },
  { region: 'Americas', keywords: ['americas', 'latin america', 'canada', 'united states', 'us ', 'mexico', 'brazil', 'argentina'] },
  { region: 'Oceania', keywords: ['oceania', 'pacific', 'australia', 'new zealand'] },
  { region: 'Middle East', keywords: ['middle east', 'gaza', 'israel', 'iran', 'iraq', 'syria', 'lebanon', 'yemen'] }
];

const ISO_ALIASES = {
  usa: 'USA',
  us: 'USA',
  unitedstates: 'USA',
  uk: 'GBR',
  unitedkingdom: 'GBR',
  russia: 'RUS',
  southkorea: 'KOR',
  northkorea: 'PRK',
  uae: 'ARE',
  congodrc: 'COD',
  drcongo: 'COD',
  ivorycoast: 'CIV',
  czechrepublic: 'CZE',
  turkey: 'TUR',
  vatican: 'VAT',
  laos: 'LAO',
  bolivia: 'BOL',
  venezuela: 'VEN',
  moldova: 'MDA',
  tanzania: 'TZA',
  palestine: 'PSE'
};

const SEVERITY_PATTERNS = [
  { score: 95, words: ['war', 'invasion', 'genocide', 'massacre'] },
  { score: 85, words: ['airstrike', 'missile', 'attack', 'bombing', 'offensive', 'military'] },
  { score: 75, words: ['sanction', 'coup', 'crisis', 'conflict', 'riot', 'hostage'] },
  { score: 60, words: ['protest', 'threat', 'cyberattack', 'clash'] },
  { score: 40, words: ['talks', 'summit', 'election', 'policy', 'agreement'] }
];

function stripCdata(text = '') {
  return text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

function decodeXml(text = '') {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractTagValue(block, tag) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return match ? decodeXml(stripCdata(match[1])) : '';
}

function parseRss(xml, source) {
  const entries = [];
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];

  for (const item of itemBlocks) {
    const title = extractTagValue(item, 'title');
    const link = extractTagValue(item, 'link');
    const pubDate = extractTagValue(item, 'pubDate') || extractTagValue(item, 'dc:date');
    const description = extractTagValue(item, 'description');

    if (!title || !link) {
      continue;
    }

    entries.push({
      title,
      url: link.trim(),
      description,
      timestamp: parseTimestamp(pubDate),
      source: source.id,
      source_name: source.name,
      source_url: source.url,
      default_region: source.region
    });
  }

  return entries;
}

function parseTimestamp(value) {
  const ms = Date.parse(value || '');
  if (!Number.isNaN(ms)) {
    return new Date(ms).toISOString();
  }
  return new Date().toISOString();
}

function normalizeText(value = '') {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleFingerprint(title) {
  return normalizeText(title)
    .split(' ')
    .filter((token) => token.length > 2)
    .slice(0, 18);
}

function jaccard(tokensA, tokensB) {
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const intersection = [...setA].filter((token) => setB.has(token)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

function detectSeveritySignal(text) {
  const normalized = normalizeText(text);

  for (const rule of SEVERITY_PATTERNS) {
    if (rule.words.some((word) => normalized.includes(word))) {
      return rule.score;
    }
  }

  return 25;
}

function detectRegion(text) {
  const normalized = normalizeText(text);
  for (const entry of REGION_KEYWORDS) {
    if (entry.keywords.some((word) => normalized.includes(normalizeText(word)))) {
      return entry.region;
    }
  }
  return 'Global';
}

function aliasKey(name) {
  return normalizeText(name).replace(/\s+/g, '');
}

async function buildCountryLookup() {
  const geoPath = path.join(ROOT_DIR, 'public', 'admin0-countries-iso-a3.geojson');
  const geoRaw = await readFile(geoPath, 'utf8');
  const geo = JSON.parse(geoRaw);

  const lookup = new Map();

  for (const feature of geo.features ?? []) {
    const props = feature.properties ?? {};
    const iso3 = String(props.iso_a3 || props.ISO_A3 || props.adm0_a3 || '').toUpperCase();

    if (!/^[A-Z]{3}$/.test(iso3)) {
      continue;
    }

    const candidateNames = [
      props.name,
      props.name_en,
      props.admin,
      props.brk_name,
      props.formal_en,
      props.name_long,
      props.sovereignt,
      props.geounit
    ].filter(Boolean);

    for (const name of candidateNames) {
      lookup.set(aliasKey(name), iso3);
    }
  }

  for (const [alias, iso] of Object.entries(ISO_ALIASES)) {
    lookup.set(alias, iso);
  }

  return lookup;
}

function resolveIso3(record, countryLookup) {
  const text = `${record.title} ${record.description}`;
  const normalized = normalizeText(text);

  for (const [key, iso3] of countryLookup.entries()) {
    if (!key || key.length < 3) {
      continue;
    }

    const phrase = key.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
    if (normalized.includes(phrase) || normalized.includes(key)) {
      return iso3;
    }
  }

  return 'UNK';
}

function fallbackIsoByRegion(region) {
  const map = {
    Europe: 'EUR',
    Asia: 'ASI',
    Africa: 'AFR',
    Americas: 'AME',
    Oceania: 'OCE',
    'Middle East': 'MEA',
    Global: 'GLB'
  };
  return map[region] ?? 'GLB';
}

function deduplicate(records) {
  const deduped = [];
  const seenUrls = new Set();

  for (const record of records) {
    if (seenUrls.has(record.url)) {
      continue;
    }

    const candidateTokens = titleFingerprint(record.title);
    const isNearDuplicate = deduped.some((existing) => {
      const similarity = jaccard(candidateTokens, existing.__titleTokens);
      return similarity >= 0.82;
    });

    if (isNearDuplicate) {
      continue;
    }

    seenUrls.add(record.url);
    deduped.push({ ...record, __titleTokens: candidateTokens });
  }

  return deduped.map(({ __titleTokens, ...rest }) => rest);
}

async function fetchSource(source) {
  const response = await fetch(source.url, {
    headers: {
      'User-Agent': 'worlddashboard-world-trends-bot/1.0'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${source.id}: HTTP ${response.status}`);
  }

  const xml = await response.text();
  return parseRss(xml, source);
}

function makeIndex(events, generatedAt) {
  const byRegion = {};
  const byIso = {};

  for (const event of events) {
    byRegion[event.region] = (byRegion[event.region] ?? 0) + 1;
    byIso[event.iso3] = (byIso[event.iso3] ?? 0) + 1;
  }

  return {
    generated_at: generatedAt,
    total_events: events.length,
    sources: SOURCES.map(({ id, name, url }) => ({ id, name, url })),
    stats: {
      by_region: byRegion,
      by_iso: byIso
    },
    event_ids: events.map((event) => event.id)
  };
}

async function main() {
  const generatedAt = new Date().toISOString();
  const countryLookup = await buildCountryLookup();

  const settled = await Promise.allSettled(SOURCES.map((source) => fetchSource(source)));
  const fetchedRecords = [];

  settled.forEach((result, index) => {
    const source = SOURCES[index];
    if (result.status === 'fulfilled') {
      fetchedRecords.push(...result.value);
      return;
    }

    console.warn(`[warn] skipped source=${source.id}: ${result.reason?.message ?? result.reason}`);
  });

  const normalizedRecords = fetchedRecords.map((record) => {
    const text = `${record.title} ${record.description}`;
    const regionDetected = detectRegion(text);
    const iso3Resolved = resolveIso3(record, countryLookup);
    const region = regionDetected || record.default_region || 'Global';
    const iso3 = iso3Resolved === 'UNK' ? fallbackIsoByRegion(region) : iso3Resolved;

    return {
      id: `${record.source}-${Buffer.from(record.url).toString('base64url').slice(0, 16)}`,
      title: record.title,
      url: record.url,
      timestamp: record.timestamp,
      source: record.source,
      source_name: record.source_name,
      iso3,
      region,
      severity_signal: detectSeveritySignal(text)
    };
  });

  const dedupedEvents = deduplicate(normalizedRecords).sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  const index = makeIndex(dedupedEvents, generatedAt);

  await writeFile(
    path.join(ROOT_DIR, 'public', 'world_trends_events.json'),
    `${JSON.stringify(dedupedEvents, null, 2)}\n`,
    'utf8'
  );

  await writeFile(
    path.join(ROOT_DIR, 'public', 'world_trends_index.json'),
    `${JSON.stringify(index, null, 2)}\n`,
    'utf8'
  );

  console.log(`[done] generated ${dedupedEvents.length} events at ${generatedAt}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
