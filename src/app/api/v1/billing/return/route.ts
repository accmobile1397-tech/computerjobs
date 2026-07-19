import { NextRequest, NextResponse } from "next/server";
import {
  getBearerUserId,
  getRequestMeta,
  mapErrorToResponse,
  successResponse,
} from "@/modules/auth/utils/api.util";
import { BillingError } from "@/modules/billing/services/billing-core";
import { getPaymentStatus } from "@/modules/billing/services/payment.service";

/**
 * Return URL — READ ONLY.
 * Never finalizes / settles payment (CTO security rule).
 */
export async function GET(request: NextRequest) {
  const { requestId } = getRequestMeta(request);
  const paymentId = request.nextUrl.searchParams.get("paymentId");
  if (!paymentId) {
    const mapped = mapErrorToResponse("VALIDATION_ERROR", requestId, "paymentId required");
    return NextResponse.json(mapped.body, { status: mapped.status });
  }

  try {
    const userId = await getBearerUserId(request);
    const status = await getPaymentStatus(paymentId, userId ?? undefined);
    return NextResponse.json(successResponse(status, requestId));
  } catch (error) {
    if (error instanceof BillingError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
