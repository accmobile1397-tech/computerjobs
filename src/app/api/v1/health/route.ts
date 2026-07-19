import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { successResponse } from "@/modules/shared/api/response";

export async function GET() {
  const requestId = randomUUID();

  return NextResponse.json(
    successResponse(
      {
        status: "ok",
        service: "computerjobs",
        version: "0.1.0",
      },
      requestId,
    ),
  );
}
