/**
 * Builds taxonomy seed JSON with stable IDs.
 * Run: node scripts/build-taxonomy-seed.mjs
 */
import { createHash } from "crypto";
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "../src/modules/taxonomy/seed/data");

function stableUuid(namespace, key) {
  const h = createHash("sha256").update(`${namespace}:${key}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(12, 15)}-8${h.slice(15, 18)}-${h.slice(18, 30)}`;
}

const CATEGORIES = [
  { slug: "software-development", nameFa: "توسعه نرم‌افزار", nameEn: "Software Development" },
  { slug: "devops-infrastructure", nameFa: "DevOps و زیرساخت", nameEn: "DevOps & Infrastructure" },
  { slug: "data-ai", nameFa: "داده و هوش مصنوعی", nameEn: "Data & AI" },
  { slug: "cybersecurity", nameFa: "امنیت سایبری", nameEn: "Cybersecurity" },
  { slug: "product-design", nameFa: "محصول و طراحی", nameEn: "Product & Design" },
  { slug: "qa-testing", nameFa: "تست و QA", nameEn: "QA & Testing" },
  { slug: "mobile-development", nameFa: "توسعه موبایل", nameEn: "Mobile Development" },
  { slug: "game-development", nameFa: "بازی‌سازی", nameEn: "Game Development" },
  { slug: "embedded-iot", nameFa: "Embedded و IoT", nameEn: "Embedded & IoT" },
  { slug: "blockchain", nameFa: "بلاکچین", nameEn: "Blockchain" },
  { slug: "it-support", nameFa: "پشتیبانی IT", nameEn: "IT Support" },
  { slug: "erp-enterprise", nameFa: "ERP و سازمانی", nameEn: "ERP & Enterprise" },
  { slug: "cloud-architecture", nameFa: "معماری Cloud", nameEn: "Cloud Architecture" },
  { slug: "database-admin", nameFa: "DBA", nameEn: "Database Administration" },
  { slug: "technical-management", nameFa: "مدیریت فنی", nameEn: "Technical Management" },
];

const SUBS = {
  "software-development": [
    { slug: "backend", nameFa: "Backend", nameEn: "Backend" },
    { slug: "frontend", nameFa: "Frontend", nameEn: "Frontend" },
  ],
  "devops-infrastructure": [
    { slug: "devops", nameFa: "DevOps", nameEn: "DevOps" },
    { slug: "sre", nameFa: "SRE", nameEn: "Site Reliability" },
  ],
  "data-ai": [
    { slug: "data-engineering", nameFa: "Data Engineering", nameEn: "Data Engineering" },
    { slug: "machine-learning", nameFa: "Machine Learning", nameEn: "Machine Learning" },
  ],
  "mobile-development": [
    { slug: "android", nameFa: "Android", nameEn: "Android" },
    { slug: "ios", nameFa: "iOS", nameEn: "iOS" },
  ],
};

const SKILLS = {
  backend: [
    {
      slug: "nodejs",
      nameFa: "Node.js",
      nameEn: "Node.js",
      aliases: ["Node", "NodeJS", "Node JS"],
      isOfficial: true,
      popularityScore: 90,
    },
    {
      slug: "typescript",
      nameFa: "TypeScript",
      nameEn: "TypeScript",
      aliases: ["TS"],
      isOfficial: true,
      popularityScore: 88,
    },
  ],
  frontend: [
    {
      slug: "react",
      nameFa: "React",
      nameEn: "React",
      aliases: ["ReactJS", "React.js"],
      isOfficial: true,
      popularityScore: 92,
    },
  ],
};

const TECHS = {
  nodejs: [
    {
      slug: "express",
      nameFa: "Express",
      nameEn: "Express",
      aliases: ["ExpressJS"],
      officialUrl: "https://expressjs.com",
      popularityScore: 70,
    },
  ],
  react: [
    {
      slug: "nextjs",
      nameFa: "Next.js",
      nameEn: "Next.js",
      aliases: ["NextJS", "Next JS"],
      officialUrl: "https://nextjs.org",
      popularityScore: 85,
    },
  ],
  typescript: [
    {
      slug: "nestjs",
      nameFa: "NestJS",
      nameEn: "NestJS",
      aliases: ["Nest"],
      officialUrl: "https://nestjs.com",
      popularityScore: 65,
    },
  ],
};

const categories = CATEGORIES.map((c, i) => ({
  id: stableUuid("category", c.slug),
  slug: c.slug,
  nameFa: c.nameFa,
  nameEn: c.nameEn,
  isOfficial: true,
  isActive: true,
  sortOrder: i + 1,
  aliases: [],
  popularityScore: 50,
}));

const categoryIdBySlug = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

const subcategories = [];
for (const [catSlug, subs] of Object.entries(SUBS)) {
  subs.forEach((s, i) => {
    subcategories.push({
      id: stableUuid("subcategory", `${catSlug}:${s.slug}`),
      categoryId: categoryIdBySlug[catSlug],
      slug: s.slug,
      nameFa: s.nameFa,
      nameEn: s.nameEn,
      isActive: true,
      sortOrder: i + 1,
      aliases: [],
      popularityScore: 40,
    });
  });
}

const subIdBySlug = Object.fromEntries(subcategories.map((s) => [s.slug, s.id]));

const skills = [];
for (const [subSlug, list] of Object.entries(SKILLS)) {
  list.forEach((s, i) => {
    skills.push({
      id: stableUuid("skill", s.slug),
      subCategoryId: subIdBySlug[subSlug],
      slug: s.slug,
      nameFa: s.nameFa,
      nameEn: s.nameEn,
      isOfficial: s.isOfficial ?? false,
      isActive: true,
      sortOrder: i + 1,
      aliases: s.aliases ?? [],
      popularityScore: s.popularityScore ?? 0,
    });
  });
}

const skillIdBySlug = Object.fromEntries(skills.map((s) => [s.slug, s.id]));

const technologies = [];
for (const [skillSlug, list] of Object.entries(TECHS)) {
  list.forEach((t, i) => {
    technologies.push({
      id: stableUuid("technology", t.slug),
      skillId: skillIdBySlug[skillSlug],
      slug: t.slug,
      nameFa: t.nameFa,
      nameEn: t.nameEn,
      isActive: true,
      sortOrder: i + 1,
      aliases: t.aliases ?? [],
      popularityScore: t.popularityScore ?? 0,
      officialUrl: t.officialUrl ?? null,
    });
  });
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "categories.json"), JSON.stringify(categories, null, 2));
writeFileSync(join(outDir, "subcategories.json"), JSON.stringify(subcategories, null, 2));
writeFileSync(join(outDir, "skills.json"), JSON.stringify(skills, null, 2));
writeFileSync(join(outDir, "technologies.json"), JSON.stringify(technologies, null, 2));
console.log(
  `Wrote taxonomy seed: ${categories.length} categories, ${subcategories.length} subcategories, ${skills.length} skills, ${technologies.length} technologies`,
);
