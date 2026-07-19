import {
  FeaturePeriod,
  PlanAudience,
  type Prisma,
  type PrismaClient,
} from "@prisma/client";

type PlanSeed = {
  slug: string;
  audience: PlanAudience;
  nameFa: string;
  features: { key: string; limit: number | null; period: FeaturePeriod }[];
};

const PLANS: PlanSeed[] = [
  {
    slug: "seeker_free",
    audience: PlanAudience.SEEKER,
    nameFa: "کارجو رایگان",
    features: [
      { key: "application.per_month", limit: 30, period: FeaturePeriod.MONTH },
      { key: "saved_search.max", limit: 3, period: FeaturePeriod.NONE },
      { key: "job_alert.max", limit: 3, period: FeaturePeriod.NONE },
      { key: "match_score.per_day", limit: 50, period: FeaturePeriod.DAY },
      { key: "ai_credit.included_period", limit: 0, period: FeaturePeriod.MONTH },
    ],
  },
  {
    slug: "seeker_pro",
    audience: PlanAudience.SEEKER,
    nameFa: "کارجو حرفه‌ای",
    features: [
      { key: "application.per_month", limit: 100, period: FeaturePeriod.MONTH },
      { key: "saved_search.max", limit: 20, period: FeaturePeriod.NONE },
      { key: "job_alert.max", limit: 20, period: FeaturePeriod.NONE },
      { key: "match_score.per_day", limit: 200, period: FeaturePeriod.DAY },
      { key: "ai_credit.included_period", limit: 50, period: FeaturePeriod.MONTH },
    ],
  },
  {
    slug: "employer_free",
    audience: PlanAudience.EMPLOYER,
    nameFa: "کارفرما رایگان",
    features: [
      { key: "job.concurrent_published", limit: 1, period: FeaturePeriod.NONE },
      { key: "job_post.per_month", limit: 1, period: FeaturePeriod.MONTH },
      { key: "resume_search.per_day", limit: 20, period: FeaturePeriod.DAY },
      { key: "resume_view.per_month", limit: 20, period: FeaturePeriod.MONTH },
      { key: "contact_unlock.per_month", limit: 0, period: FeaturePeriod.MONTH },
      { key: "job.featured_slots", limit: 0, period: FeaturePeriod.NONE },
      { key: "job.urgent_slots", limit: 0, period: FeaturePeriod.NONE },
      { key: "company.seats", limit: 2, period: FeaturePeriod.NONE },
      { key: "match_score.employer.per_day", limit: 50, period: FeaturePeriod.DAY },
    ],
  },
  {
    slug: "employer_starter",
    audience: PlanAudience.EMPLOYER,
    nameFa: "کارفرما استارتر",
    features: [
      { key: "job.concurrent_published", limit: 5, period: FeaturePeriod.NONE },
      { key: "job_post.per_month", limit: 10, period: FeaturePeriod.MONTH },
      { key: "resume_search.per_day", limit: 100, period: FeaturePeriod.DAY },
      { key: "resume_view.per_month", limit: 150, period: FeaturePeriod.MONTH },
      { key: "contact_unlock.per_month", limit: 30, period: FeaturePeriod.MONTH },
      { key: "job.featured_slots", limit: 1, period: FeaturePeriod.NONE },
      { key: "job.urgent_slots", limit: 3, period: FeaturePeriod.NONE },
      { key: "company.seats", limit: 5, period: FeaturePeriod.NONE },
      { key: "match_score.employer.per_day", limit: 200, period: FeaturePeriod.DAY },
    ],
  },
];

export async function seedBilling(prisma: PrismaClient) {
  const now = new Date();

  for (const p of PLANS) {
    const plan = await prisma.planDefinition.upsert({
      where: { slug: p.slug },
      create: {
        slug: p.slug,
        audience: p.audience,
        nameFa: p.nameFa,
        isActive: true,
      },
      update: { nameFa: p.nameFa, isActive: true },
    });

    for (const f of p.features) {
      const existing = await prisma.planFeature.findFirst({
        where: { planId: plan.id, featureKey: f.key, version: 1 },
      });
      if (!existing) {
        await prisma.planFeature.create({
          data: {
            planId: plan.id,
            featureKey: f.key,
            limitValue: f.limit,
            period: f.period,
            version: 1,
            effectiveFrom: now,
          },
        });
      }
    }
  }

  const settings: { key: string; value: unknown }[] = [
    { key: "billing.timezone", value: "Asia/Tehran" },
    { key: "billing.quota_job_cron", value: "0 * * * *" },
    { key: "billing.resume_view_window_days", value: 30 },
    { key: "billing.job_republish_window_days", value: 7 },
  ];

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      create: { key: s.key, valueJson: s.value as Prisma.InputJsonValue },
      update: { valueJson: s.value as Prisma.InputJsonValue },
    });
  }

  // Seed price metadata (amount + currency) — not used until 7B checkout
  const free = await prisma.planDefinition.findUnique({ where: { slug: "seeker_pro" } });
  if (free) {
    await prisma.planPrice.upsert({
      where: { sku: "seeker_pro_m" },
      create: {
        sku: "seeker_pro_m",
        planId: free.id,
        amount: 490000,
        currency: "IRR",
        periodMonths: 1,
        isActive: true,
      },
      update: { amount: 490000, currency: "IRR" },
    });
  }
}
