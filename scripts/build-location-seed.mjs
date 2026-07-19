/**
 * Builds location seed JSON from tmp-citylist.json (Iran city gist).
 * Run: node scripts/build-location-seed.mjs
 */
import { createHash } from "crypto";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "src/modules/location/seed/data");

function stableUuid(namespace, key) {
  const h = createHash("sha256").update(`${namespace}:${key}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(12, 15)}-8${h.slice(15, 18)}-${h.slice(18, 30)}`;
}

function slugify(en) {
  return String(en || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "city";
}

const PROVINCES = [
  { code: "1", slug: "east-azerbaijan", nameFa: "آذربایجان شرقی", nameEn: "East Azerbaijan" },
  { code: "2", slug: "west-azerbaijan", nameFa: "آذربایجان غربی", nameEn: "West Azerbaijan" },
  { code: "3", slug: "ardabil", nameFa: "اردبیل", nameEn: "Ardabil" },
  { code: "4", slug: "isfahan", nameFa: "اصفهان", nameEn: "Isfahan" },
  { code: "5", slug: "alborz", nameFa: "البرز", nameEn: "Alborz" },
  { code: "6", slug: "ilam", nameFa: "ایلام", nameEn: "Ilam" },
  { code: "7", slug: "bushehr", nameFa: "بوشهر", nameEn: "Bushehr" },
  { code: "8", slug: "tehran", nameFa: "تهران", nameEn: "Tehran" },
  { code: "9", slug: "chaharmahal-bakhtiari", nameFa: "چهارمحال و بختیاری", nameEn: "Chaharmahal and Bakhtiari" },
  { code: "10", slug: "south-khorasan", nameFa: "خراسان جنوبی", nameEn: "South Khorasan" },
  { code: "11", slug: "razavi-khorasan", nameFa: "خراسان رضوی", nameEn: "Razavi Khorasan" },
  { code: "12", slug: "north-khorasan", nameFa: "خراسان شمالی", nameEn: "North Khorasan" },
  { code: "13", slug: "khuzestan", nameFa: "خوزستان", nameEn: "Khuzestan" },
  { code: "14", slug: "zanjan", nameFa: "زنجان", nameEn: "Zanjan" },
  { code: "15", slug: "semnan", nameFa: "سمنان", nameEn: "Semnan" },
  { code: "16", slug: "sistan-baluchestan", nameFa: "سیستان و بلوچستان", nameEn: "Sistan and Baluchestan" },
  { code: "17", slug: "fars", nameFa: "فارس", nameEn: "Fars" },
  { code: "18", slug: "qazvin", nameFa: "قزوین", nameEn: "Qazvin" },
  { code: "19", slug: "qom", nameFa: "قم", nameEn: "Qom" },
  { code: "20", slug: "kurdistan", nameFa: "کردستان", nameEn: "Kurdistan" },
  { code: "21", slug: "kerman", nameFa: "کرمان", nameEn: "Kerman" },
  { code: "22", slug: "kermanshah", nameFa: "کرمانشاه", nameEn: "Kermanshah" },
  { code: "23", slug: "kohgiluyeh-boyer-ahmad", nameFa: "کهگیلویه و بویراحمد", nameEn: "Kohgiluyeh and Boyer-Ahmad" },
  { code: "24", slug: "golestan", nameFa: "گلستان", nameEn: "Golestan" },
  { code: "25", slug: "gilan", nameFa: "گیلان", nameEn: "Gilan" },
  { code: "26", slug: "lorestan", nameFa: "لرستان", nameEn: "Lorestan" },
  { code: "27", slug: "mazandaran", nameFa: "مازندران", nameEn: "Mazandaran" },
  { code: "28", slug: "markazi", nameFa: "مرکزی", nameEn: "Markazi" },
  { code: "29", slug: "hormozgan", nameFa: "هرمزگان", nameEn: "Hormozgan" },
  { code: "30", slug: "hamadan", nameFa: "همدان", nameEn: "Hamadan" },
  { code: "31", slug: "yazd", nameFa: "یزد", nameEn: "Yazd" },
];

const raw = JSON.parse(readFileSync(join(root, "tmp-citylist.json"), "utf8"));
const provinceByCode = Object.fromEntries(PROVINCES.map((p) => [p.code, p]));

const provinces = PROVINCES.map((p, i) => ({
  id: stableUuid("province", p.code),
  slug: p.slug,
  nameFa: p.nameFa,
  nameEn: p.nameEn,
  sortOrder: i + 1,
  isActive: true,
}));

const provinceIdByCode = Object.fromEntries(
  provinces.map((p, i) => [PROVINCES[i].code, p.id]),
);

const slugCounts = {};
const cities = raw.city.map((c, index) => {
  const prov = provinceByCode[c.province_id];
  const base = slugify(c.ens || c.en);
  const key = `${c.province_id}:${base}`;
  slugCounts[key] = (slugCounts[key] ?? 0) + 1;
  const slug = slugCounts[key] > 1 ? `${base}-${c.id}` : base;
  return {
    id: stableUuid("city", c.id),
    provinceId: provinceIdByCode[c.province_id],
    slug,
    nameFa: c.fa.trim(),
    nameEn: (c.en || c.ens || "").trim(),
    sortOrder: index + 1,
    isActive: true,
  };
});

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "provinces.json"), JSON.stringify(provinces, null, 2));
writeFileSync(join(outDir, "cities.json"), JSON.stringify(cities, null, 2));
console.log(`Wrote ${provinces.length} provinces, ${cities.length} cities to ${outDir}`);
