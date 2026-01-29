import type { ProgramRole } from "@/lib/permissions";
import { hasAtLeastRole } from "@/lib/permissions";
import { getUserRoleInProgram } from "@/lib/programs";

export class HttpError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message?: string) {
    super(message ?? code);
    this.status = status;
    this.code = code;
  }
}

export async function requireProgramRole(params: {
  userId: string;
  programId: string;
  minRole: ProgramRole;
}): Promise<ProgramRole> {
  const role = await getUserRoleInProgram(params.userId, params.programId);
  if (!role) throw new HttpError(403, "FORBIDDEN");
  if (!hasAtLeastRole(role, params.minRole)) throw new HttpError(403, "FORBIDDEN");
  return role;
}
