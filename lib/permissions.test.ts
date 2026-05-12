import { describe, expect, it } from "vitest";
import {
  hasServicoAccess,
} from "./permissions";

describe("regras de serviço para atendente", () => {
  it("permite acesso quando o serviço está vinculado ao atendente", () => {
    expect(hasServicoAccess([3, 8, 12], 8)).toBe(true);
  });

  it("bloqueia acesso quando o serviço não está vinculado ao atendente", () => {
    expect(hasServicoAccess([3, 8, 12], 5)).toBe(false);
  });

  it("bloqueia acesso quando atendente não possui vínculos", () => {
    expect(hasServicoAccess([], 5)).toBe(false);
    expect(hasServicoAccess(null, 5)).toBe(false);
    expect(hasServicoAccess(undefined, 5)).toBe(false);
  });
});
