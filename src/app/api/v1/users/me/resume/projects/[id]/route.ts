import { NextRequest } from "next/server";
import {
  deleteProject,
  updateProject,
} from "@/modules/resumes/services/resume.service";
import { withResumeMutation } from "@/modules/resumes/utils/route.util";
import { projectSchema } from "@/modules/resumes/validators/resume.schema";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Ctx) {
  return withResumeMutation(request, context, "resume:update:own", async (ctx) => {
    const body = projectSchema.parse(await request.json());
    return updateProject(ctx.userId, ctx.params.id, body, {
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
  });
}

export async function DELETE(request: NextRequest, context: Ctx) {
  return withResumeMutation(request, context, "resume:update:own", async (ctx) => {
    return deleteProject(ctx.userId, ctx.params.id, {
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
  });
}
