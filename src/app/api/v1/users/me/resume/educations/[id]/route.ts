import { NextRequest } from "next/server";
import {
  deleteEducation,
  updateEducation,
} from "@/modules/resumes/services/resume.service";
import { withResumeMutation } from "@/modules/resumes/utils/route.util";
import { educationSchema } from "@/modules/resumes/validators/resume.schema";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Ctx) {
  return withResumeMutation(request, context, "resume:update:own", async (ctx) => {
    const body = educationSchema.parse(await request.json());
    return updateEducation(ctx.userId, ctx.params.id, body, {
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
  });
}

export async function DELETE(request: NextRequest, context: Ctx) {
  return withResumeMutation(request, context, "resume:update:own", async (ctx) => {
    return deleteEducation(ctx.userId, ctx.params.id, {
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
  });
}
