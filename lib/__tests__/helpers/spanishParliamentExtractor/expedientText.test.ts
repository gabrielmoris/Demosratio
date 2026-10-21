import { describe, it, expect } from "vitest";
import { buildExpedientText, hasSubGroup } from "@/lib/helpers/spanishParliamentExtractor/expedientText";

const base = {
  sesion: "202",
  fecha: "30/9/2026",
  titulo: "Mociones consecuencia de interpelaciones urgentes.",
  textoExpediente: "Moción del Grupo Parlamentario Mixto sobre precios energéticos.",
};

describe("buildExpedientText", () => {
  it("keeps the original text untouched when there is no sub-group", () => {
    const info = { ...base, textoExpediente: "Proposición no de Ley.\n", tituloSubGrupo: "", textoSubGrupo: "" };
    expect(buildExpedientText(info)).toBe("Proposición no de Ley.\n");
    expect(hasSubGroup(info)).toBe(false);
  });

  it("keeps the original text when sub-group fields are missing", () => {
    expect(buildExpedientText(base)).toBe(base.textoExpediente);
    expect(hasSubGroup(base)).toBe(false);
  });

  it("gives each separately voted point its own text", () => {
    const point1 = { ...base, tituloSubGrupo: "Votación separada por puntos.", textoSubGrupo: "Punto 1." };
    const point2 = { ...base, tituloSubGrupo: "Votación separada por puntos.", textoSubGrupo: "Punto 2." };

    expect(buildExpedientText(point1)).toBe(`${base.textoExpediente} (Votación separada por puntos. Punto 1.)`);
    expect(buildExpedientText(point1)).not.toBe(buildExpedientText(point2));
    expect(hasSubGroup(point1)).toBe(true);
  });

  it("works when only textoSubGrupo is present", () => {
    const info = { ...base, tituloSubGrupo: "", textoSubGrupo: "Punto 3 del primer bloque." };
    expect(buildExpedientText(info)).toBe(`${base.textoExpediente} (Punto 3 del primer bloque.)`);
  });
});
