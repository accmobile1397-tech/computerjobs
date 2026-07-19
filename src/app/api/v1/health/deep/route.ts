import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { errorResponse, successResponse } from "@/modules/shared/api/response";
import { checkDatabaseConnection } from "@/modules/shared/prisma/client";
import { checkRedisConnection } from "@/modules/shared/redis/client";

export async function GET() {
  const requestId = randomUUID();

  const [database, redis] = await Promise.all([
    checkDatabaseConnection(),
    checkRedisConnection(),
  ]);

  const allHealthy = database && redis;

  const data = {
    status: allHealthy ? "ok" : "degraded",
    checks: {
      database: database ? "ok" : "error",
      redis: redis ? "ok" : "error",
    },
  };

  if (!allHealthy) {
    return NextResponse.json(
      errorResponse(
        "SERVICE_UNAVAILABLE",
        "One or more services are unavailable",
        requestId,
        data.checks,
      ),
      { status: 503 },
    );
  }

  return NextResponse.json(successResponse(data, requestId));
}
