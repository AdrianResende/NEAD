export function canAtendenteAccessServicoSetor(
  atendenteSetorId: number | null | undefined,
  servicoSetorId: number,
): boolean {
  return atendenteSetorId === servicoSetorId;
}

export function resolveAtendenteSetorFilterId(
  atendenteSetorId: number | null | undefined,
): number {
  return atendenteSetorId ?? -1;
}
