import { prisma } from "@/modules/shared/prisma/client";
import { writeAuditLog } from "@/modules/auth/services/audit.service";

export class LocationError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

function toPublicProvince(p: {
  slug: string;
  nameFa: string;
  nameEn: string | null;
  sortOrder: number;
}) {
  return {
    slug: p.slug,
    nameFa: p.nameFa,
    nameEn: p.nameEn,
    sortOrder: p.sortOrder,
  };
}

function toPublicCity(c: {
  slug: string;
  nameFa: string;
  nameEn: string | null;
  sortOrder: number;
  province: { slug: string };
}) {
  return {
    slug: c.slug,
    nameFa: c.nameFa,
    nameEn: c.nameEn,
    sortOrder: c.sortOrder,
    provinceSlug: c.province.slug,
  };
}

export async function listProvinces(activeOnly = true) {
  const rows = await prisma.province.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: [{ sortOrder: "asc" }, { nameFa: "asc" }],
  });
  return rows.map(toPublicProvince);
}

export async function getProvinceBySlug(slug: string, activeOnly = true) {
  const row = await prisma.province.findFirst({
    where: { slug, ...(activeOnly ? { isActive: true } : {}) },
    include: { _count: { select: { cities: activeOnly ? { where: { isActive: true } } : true } } },
  });
  if (!row) throw new LocationError("LOCATION_NOT_FOUND");
  return {
    ...toPublicProvince(row),
    cityCount: row._count.cities,
  };
}

export async function listCitiesByProvinceSlug(provinceSlug: string, activeOnly = true) {
  const province = await prisma.province.findFirst({
    where: { slug: provinceSlug, ...(activeOnly ? { isActive: true } : {}) },
  });
  if (!province) throw new LocationError("LOCATION_NOT_FOUND");

  const rows = await prisma.city.findMany({
    where: {
      provinceId: province.id,
      ...(activeOnly ? { isActive: true } : {}),
    },
    include: { province: { select: { slug: true } } },
    orderBy: [{ sortOrder: "asc" }, { nameFa: "asc" }],
  });
  return rows.map(toPublicCity);
}

export async function updateProvince(params: {
  provinceId: string;
  isActive?: boolean;
  sortOrder?: number;
  adminUserId: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const existing = await prisma.province.findUnique({ where: { id: params.provinceId } });
  if (!existing) throw new LocationError("LOCATION_NOT_FOUND");

  const updated = await prisma.province.update({
    where: { id: params.provinceId },
    data: {
      ...(params.isActive !== undefined ? { isActive: params.isActive } : {}),
      ...(params.sortOrder !== undefined ? { sortOrder: params.sortOrder } : {}),
    },
  });

  await writeAuditLog({
    userId: params.adminUserId,
    action: "PROVINCE_UPDATED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { provinceId: params.provinceId },
  });

  return toPublicProvince(updated);
}

export async function updateCity(params: {
  cityId: string;
  isActive?: boolean;
  sortOrder?: number;
  adminUserId: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const existing = await prisma.city.findUnique({
    where: { id: params.cityId },
    include: { province: { select: { slug: true } } },
  });
  if (!existing) throw new LocationError("LOCATION_NOT_FOUND");

  const updated = await prisma.city.update({
    where: { id: params.cityId },
    data: {
      ...(params.isActive !== undefined ? { isActive: params.isActive } : {}),
      ...(params.sortOrder !== undefined ? { sortOrder: params.sortOrder } : {}),
    },
    include: { province: { select: { slug: true } } },
  });

  await writeAuditLog({
    userId: params.adminUserId,
    action: "CITY_UPDATED",
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    metadata: { cityId: params.cityId },
  });

  return toPublicCity(updated);
}

export async function assertActiveCity(cityId: string) {
  const city = await prisma.city.findFirst({
    where: { id: cityId, isActive: true },
  });
  if (!city) throw new LocationError("LOCATION_NOT_FOUND");
  return city;
}
