export function hasServicoAccess(
  servicosPermitidos: number[] | null | undefined,
  servicoId: number,
): boolean {
  if (!servicosPermitidos || servicosPermitidos.length === 0) return false;
  return servicosPermitidos.includes(servicoId);
}
