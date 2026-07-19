import { NextRequest } from "next/server";
import { addExperience } from "@/modules/resumes/services/resume.service";
import { withResumeMutation } from "@/modules/resumes/utils/route.util";
import { experienceSchema } from "@/modules/resumes/validators/resume.schema";

type Ctx = { params: Promise<Record<string, string>> };

export async function POST(request: NextRequest, context: Ctx) {
  return withResumeMutation(request, context, "resume:update:own", async (ctx) => {
    const body = experienceSchema.parse(await request.json());
    return addExperience(ctx.userId, body, {
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
  });
}
