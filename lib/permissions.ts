export function hasSetorAccess(
  atendenteSetorId: number | null | undefined,
  servicoSetorId: number,
): boolean {
  return atendenteSetorId === servicoSetorId;
}

export function getSetorFilter(
  atendenteSetorId: number | null | undefined,
): number {
  return atendenteSetorId ?? -1;
}
