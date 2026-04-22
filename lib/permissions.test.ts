import { describe, expect, it } from "vitest";
import {
  hasSetorAccess,
  getSetorFilter,
} from "./permissions";

describe("regras de setor para atendente", () => {
  it("permite acesso quando setor do atendente e do serviço são iguais", () => {
    expect(hasSetorAccess(3, 3)).toBe(true);
  });

  it("bloqueia acesso quando setor do atendente e do serviço são diferentes", () => {
    expect(hasSetorAccess(3, 5)).toBe(false);
  });

  it("bloqueia acesso quando atendente não tem setor", () => {
    expect(hasSetorAccess(null, 5)).toBe(false);
    expect(hasSetorAccess(undefined, 5)).toBe(false);
  });

  it("resolve filtro inválido quando atendente não tem setor", () => {
    expect(getSetorFilter(null)).toBe(-1);
    expect(getSetorFilter(undefined)).toBe(-1);
  });

  it("resolve filtro com o próprio setor quando atendente tem setor", () => {
    expect(getSetorFilter(8)).toBe(8);
  });
});
