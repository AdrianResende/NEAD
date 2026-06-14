import { describe, expect, it } from "vitest";
import { ROUTES } from "./constants";
import { getPostLoginRoute } from "./navigation";

describe("getPostLoginRoute", () => {
  it("manda para trocar senha quando a conta exige atualização", () => {
    expect(getPostLoginRoute({ role: "admin", mustChangePassword: true })).toBe(ROUTES.ALTERAR_SENHA);
  });

  it("manda para o menu inicial quando a senha já foi alterada", () => {
    expect(getPostLoginRoute({ role: "atendente", mustChangePassword: false })).toBe(ROUTES.CHAMADOS);
  });
});