import { NextRequest } from "next/server";
import { replaceSkills } from "@/modules/resumes/services/resume.service";
import { withResumeMutation } from "@/modules/resumes/utils/route.util";
import { replaceSkillsSchema } from "@/modules/resumes/validators/resume.schema";

type Ctx = { params: Promise<Record<string, string>> };

export async function PUT(request: NextRequest, context: Ctx) {
  return withResumeMutation(request, context, "resume:update:own", async (ctx) => {
    const body = replaceSkillsSchema.parse(await request.json());
    return replaceSkills(ctx.userId, body.skills, {
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
  });
}
