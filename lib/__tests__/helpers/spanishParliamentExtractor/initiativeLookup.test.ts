import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  buildInitiativeDetailUrl,
  buildSearchQuery,
  cleanExpedientText,
  expectedInitiativePrefixes,
  extractFirstBocgUrl,
  legislaturaFromVoteUrl,
  lookupInitiative,
  parseSearchResponse,
  pickInitiative,
} from "@/lib/helpers/spanishParliamentExtractor/initiativeLookup";

vi.mock("tslog", () => ({
  Logger: class {
    error = vi.fn();
    info = vi.fn();
    warn = vi.fn();
  },
}));

// Real texts from the Congreso votes of 30/9/2026 (session 202)
const PNL =
  "Proposición no de Ley del Grupo Parlamentario Socialista, para la puesta en marcha de un instrumento europeo excepcional de contribución sobre los beneficios extraordinarios de las empresas energéticas.\n";
const MOTION_POINT =
  "Moción consecuencia de interpelación urgente del Grupo Parlamentario Mixto (Sra. Belarra Urteaga), relativa a las medidas que va a adoptar el Gobierno para evitar las subidas desorbitadas de los precios de los productos energéticos y su impacto directo sobre el coste de la vida de las familias. (Votación separada por puntos. Punto 2.)";
const TOTALITY =
  "Votación de la enmienda a la totalidad de devolución al Proyecto de Ley Orgánica de medidas en materia de violencia vicaria, presentada por el Grupo Parlamentario VOX.";
const TREATY =
  "Convenio por el que se establece una Comisión Internacional de Reclamaciones para Ucrania, hecho en La Haya el 16 de diciembre de 2025.";
const EXTENSION =
  "Solicitud de prórroga por seis meses del plazo para la realización del Dictamen de la Comisión de Investigación de la interrupción del suministro eléctrico el 28 de abril de 2025.";

const VOTE_URL =
  "https://www.congreso.es/es/opendata/votaciones?p_p_id=votaciones&targetLegislatura=XV&targetDate=30092026";

describe("expectedInitiativePrefixes", () => {
  it("maps each kind of vote to its initiative numbers", () => {
    expect(expectedInitiativePrefixes(PNL)).toEqual(["161", "162"]);
    expect(expectedInitiativePrefixes(MOTION_POINT)).toEqual(["173"]);
    expect(expectedInitiativePrefixes(TOTALITY)).toEqual(["121"]);
    expect(expectedInitiativePrefixes(TREATY)).toEqual(["110"]);
    expect(expectedInitiativePrefixes("Convalidación o derogación de Reales Decretos-leyes. Real Decreto-ley 5/2026")).toEqual(["130"]);
    expect(expectedInitiativePrefixes("Toma en consideración de la Proposición de Ley de ...")).toEqual(["122", "123", "124", "125"]);
  });

  it("returns null for procedural votes", () => {
    expect(expectedInitiativePrefixes(EXTENSION)).toBeNull();
    expect(expectedInitiativePrefixes("Dictamen de la Comisión del Estatuto acerca del suplicatorio.")).toBeNull();
  });
});

describe("cleanExpedientText", () => {
  it("drops type, author and point label", () => {
    expect(cleanExpedientText(PNL)).toBe(
      "para la puesta en marcha de un instrumento europeo excepcional de contribución sobre los beneficios extraordinarios de las empresas energéticas."
    );
    expect(cleanExpedientText(MOTION_POINT)).toMatch(/^relativa a las medidas .* familias\.$/);
  });

  it("keeps only the bill title in totality votes", () => {
    expect(cleanExpedientText(TOTALITY)).toBe("Proyecto de Ley Orgánica de medidas en materia de violencia vicaria");
  });

  it("drops where and when a treaty was signed", () => {
    expect(cleanExpedientText(TREATY)).toBe("Convenio por el que se establece una Comisión Internacional de Reclamaciones para Ucrania");
  });
});

describe("buildSearchQuery", () => {
  it("keeps up to 8 meaningful words with their accents", () => {
    expect(buildSearchQuery(PNL)).toBe("puesta marcha instrumento europeo excepcional contribución beneficios extraordinarios");
  });

  it("never sends the search operators y / o / no", () => {
    const query = buildSearchQuery("Proposición no de Ley del Grupo Parlamentario Popular en el Congreso, sobre Migración y Asilo o refugio.");
    expect(query.split(" ")).not.toContain("y");
    expect(query.split(" ")).not.toContain("o");
    expect(query).toBe("Migración Asilo refugio");
  });
});

describe("pickInitiative", () => {
  const interpellation = { id: "172/000225", title: "Interpelación urgente relativa a las medidas que va a adoptar el Gobierno para evitar las subidas desorbitadas de los precios de los productos energéticos y su impacto directo sobre el coste de la vida de las familias." };
  const motion = { id: "173/000194", title: "Moción consecuencia de interpelación urgente relativa a las medidas que va a adoptar el Gobierno para evitar las subidas desorbitadas de los precios de los productos energéticos y su impacto directo sobre el coste de la vida de las familias." };

  it("picks the motion, not the interpellation with the same title", () => {
    expect(pickInitiative(MOTION_POINT, [interpellation, motion], ["173"])).toEqual(motion);
  });

  it("returns null when nothing is similar enough", () => {
    const unrelated = { id: "173/000001", title: "Moción sobre la política de vivienda del Gobierno." };
    expect(pickInitiative(MOTION_POINT, [unrelated], ["173"])).toBeNull();
  });

  it("returns null when two candidates are equally good", () => {
    const twin = { ...motion, id: "173/000999" };
    expect(pickInitiative(MOTION_POINT, [motion, twin], ["173"])).toBeNull();
  });
});

describe("legislaturaFromVoteUrl", () => {
  it("reads Roman or numeric legislatures", () => {
    expect(legislaturaFromVoteUrl(VOTE_URL)).toBe("15");
    expect(legislaturaFromVoteUrl("https://x?targetLegislatura=16&targetDate=1")).toBe("16");
    expect(legislaturaFromVoteUrl("https://x")).toBeNull();
  });
});

describe("parseSearchResponse", () => {
  it("handles missing fields and empty lists", () => {
    expect(parseSearchResponse({ lista_iniciativas: null })).toEqual([]);
    expect(
      parseSearchResponse({
        lista_iniciativas: {
          iniciativa1: { id_iniciativa: "162/000769", titulo: "PNL", tipo: "Proposición no de Ley ante el Pleno." },
          iniciativa2: { titulo: "sin id" },
        },
      })
    ).toEqual([{ id: "162/000769", title: "PNL", type: "Proposición no de Ley ante el Pleno." }]);
  });
});

describe("extractFirstBocgUrl", () => {
  it("takes the first Congreso bulletin link and skips debate transcripts", () => {
    const html =
      '<a href="/public_oficiales/L15/CONG/DS/PL/DSCD-15-PL-208.PDF#page=50">DS</a>' +
      '<a href="/public_oficiales/L15/CONG/BOCG/D/BOCG-15-D-518-C1.PDF#page=28">BOCG</a>' +
      '<a href="/public_oficiales/L15/CONG/BOCG/D/BOCG-15-D-599.PDF#page=8">BOCG</a>';
    expect(extractFirstBocgUrl(html)).toBe("https://www.congreso.es/public_oficiales/L15/CONG/BOCG/D/BOCG-15-D-518-C1.PDF#page=28");
  });

  it("returns null when the initiative has no publication", () => {
    expect(extractFirstBocgUrl("<p>nada</p>")).toBeNull();
  });
});

describe("buildInitiativeDetailUrl", () => {
  it("uses Roman numerals, which the detail page requires", () => {
    const url = new URL(buildInitiativeDetailUrl("162/000769", "15"));
    expect(url.searchParams.get("_iniciativas_legislatura")).toBe("XV");
    expect(url.searchParams.get("_iniciativas_id")).toBe("162/000769");
  });
});

describe("lookupInitiative", () => {
  const fetchMock = vi.fn();
  const searchResponse = (items: { id: string; title: string }[]) =>
    new Response(
      JSON.stringify({
        lista_iniciativas: Object.fromEntries(items.map((i, n) => [`iniciativa${n + 1}`, { id_iniciativa: i.id, titulo: i.title }])),
      })
    );
  const pnl = { id: "162/000769", title: "Proposición no de Ley para la puesta en marcha de un instrumento europeo excepcional de contribución sobre los beneficios extraordinarios de las empresas energéticas." };

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    fetchMock.mockReset();
  });

  it("skips procedural votes without calling Congreso", async () => {
    expect(await lookupInitiative(EXTENSION, VOTE_URL)).toEqual({ status: "not_applicable" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("finds the initiative and its PDF", async () => {
    fetchMock
      .mockResolvedValueOnce(searchResponse([pnl]))
      .mockResolvedValueOnce(new Response('<a href="/public_oficiales/L15/CONG/BOCG/D/BOCG-15-D-518-C1.PDF#page=28">x</a>'));

    expect(await lookupInitiative(PNL, VOTE_URL)).toEqual({
      status: "found",
      initiative: pnl,
      pdfUrl: "https://www.congreso.es/public_oficiales/L15/CONG/BOCG/D/BOCG-15-D-518-C1.PDF#page=28",
    });
  });

  it("reports no_pdf when the initiative isn't published yet", async () => {
    fetchMock.mockResolvedValueOnce(searchResponse([pnl])).mockResolvedValueOnce(new Response("<p></p>"));
    expect(await lookupInitiative(PNL, VOTE_URL)).toEqual({ status: "no_pdf", initiative: pnl });
  });

  it("retries once when the search comes back empty", async () => {
    fetchMock
      .mockResolvedValueOnce(searchResponse([]))
      .mockResolvedValueOnce(searchResponse([pnl]))
      .mockResolvedValueOnce(new Response('<a href="/public_oficiales/L15/CONG/BOCG/D/BOCG-15-D-1.PDF">x</a>'));

    const pending = lookupInitiative(PNL, VOTE_URL);
    await vi.runAllTimersAsync();
    expect((await pending).status).toBe("found");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("reports no_match when the search keeps coming back empty", async () => {
    fetchMock.mockImplementation(async () => searchResponse([]));
    const pending = lookupInitiative(PNL, VOTE_URL);
    await vi.runAllTimersAsync();
    expect(await pending).toEqual({ status: "no_match" });
  });

  it("throws when Congreso is down, so the vote is retried later", async () => {
    fetchMock.mockResolvedValueOnce(new Response("down", { status: 500 }));
    await expect(lookupInitiative(PNL, VOTE_URL)).rejects.toThrow("Congreso search failed: 500");
  });
});
