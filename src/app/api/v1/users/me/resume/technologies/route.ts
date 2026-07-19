import { NextRequest } from "next/server";
import { replaceTechnologies } from "@/modules/resumes/services/resume.service";
import { withResumeMutation } from "@/modules/resumes/utils/route.util";
import { replaceTechnologiesSchema } from "@/modules/resumes/validators/resume.schema";

type Ctx = { params: Promise<Record<string, string>> };

export async function PUT(request: NextRequest, context: Ctx) {
  return withResumeMutation(request, context, "resume:update:own", async (ctx) => {
    const body = replaceTechnologiesSchema.parse(await request.json());
    return replaceTechnologies(ctx.userId, body.technologies, {
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
  });
}
