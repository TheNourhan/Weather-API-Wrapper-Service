export function normalizeParam(param: string | string[] | undefined) {
  return typeof param === "string" ? param : undefined;
}
