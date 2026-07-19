import { NextRequest, NextResponse } from "next/server";
import {
  getRequestMeta,
  mapErrorToResponse,
  successResponse,
} from "@/modules/auth/utils/api.util";
import { BillingError } from "@/modules/billing/services/billing-core";
import { settlePaymentFromWebhook } from "@/modules/billing/services/payment.service";

/**
 * Only verified webhook settles payments.
 */
export async function POST(request: NextRequest) {
  const { requestId } = getRequestMeta(request);

  try {
    const body = await request.json();
    const headers: Record<string, string | string[] | undefined> = {};
    request.headers.forEach((v, k) => {
      headers[k] = v;
    });

    const result = await settlePaymentFromWebhook({ headers, body });
    return NextResponse.json(successResponse(result, requestId));
  } catch (error) {
    if (error instanceof BillingError) {
      const mapped = mapErrorToResponse(error.code, requestId, error.message);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
    throw error;
  }
}
