import { NextRequest } from "next/server";
import {
  deleteExperience,
  updateExperience,
} from "@/modules/resumes/services/resume.service";
import { withResumeMutation } from "@/modules/resumes/utils/route.util";
import { experienceSchema } from "@/modules/resumes/validators/resume.schema";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Ctx) {
  return withResumeMutation(request, context, "resume:update:own", async (ctx) => {
    const body = experienceSchema.parse(await request.json());
    return updateExperience(ctx.userId, ctx.params.id, body, {
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
  });
}

export async function DELETE(request: NextRequest, context: Ctx) {
  return withResumeMutation(request, context, "resume:update:own", async (ctx) => {
    return deleteExperience(ctx.userId, ctx.params.id, {
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
  });
}
