import { describe, expect, it } from "vitest";
import {
  canAtendenteAccessServicoSetor,
  resolveAtendenteSetorFilterId,
} from "./permissions";

describe("regras de setor para atendente", () => {
  it("permite acesso quando setor do atendente e do serviço são iguais", () => {
    expect(canAtendenteAccessServicoSetor(3, 3)).toBe(true);
  });

  it("bloqueia acesso quando setor do atendente e do serviço são diferentes", () => {
    expect(canAtendenteAccessServicoSetor(3, 5)).toBe(false);
  });

  it("bloqueia acesso quando atendente não tem setor", () => {
    expect(canAtendenteAccessServicoSetor(null, 5)).toBe(false);
    expect(canAtendenteAccessServicoSetor(undefined, 5)).toBe(false);
  });

  it("resolve filtro inválido quando atendente não tem setor", () => {
    expect(resolveAtendenteSetorFilterId(null)).toBe(-1);
    expect(resolveAtendenteSetorFilterId(undefined)).toBe(-1);
  });

  it("resolve filtro com o próprio setor quando atendente tem setor", () => {
    expect(resolveAtendenteSetorFilterId(8)).toBe(8);
  });
});
