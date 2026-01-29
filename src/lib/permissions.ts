export type ProgramRole = "VIEWER" | "EDITOR" | "ADMIN";

const ROLE_ORDER: Record<ProgramRole, number> = {
  VIEWER: 1,
  EDITOR: 2,
  ADMIN: 3
};

export function hasAtLeastRole(actual: ProgramRole, required: ProgramRole): boolean {
  return ROLE_ORDER[actual] >= ROLE_ORDER[required];
}
