"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Loading from "@/src/components/Loading";
import { Link } from "@/src/i18n/routing";
import Image from "next/image";

type CellData = { pct: number | null; coVotes: number };
type AlignmentData = {
  parties: string[];
  matrix: Record<string, Record<string, CellData>>;
  totalProposals: number;
};

function getCellStyle(pct: number | null): { backgroundColor: string; color: string } {
  if (pct === null) return { backgroundColor: "#f9fafb", color: "#9ca3af" };
  if (pct === 100) return { backgroundColor: "#15803d", color: "#ffffff" };

  if (pct <= 50) {
    const t = pct / 50;
    const r = Math.round(239 + (255 - 239) * t);
    const g = Math.round(68 + (255 - 68) * t);
    const b = Math.round(68 + (255 - 68) * t);
    return { backgroundColor: `rgb(${r},${g},${b})`, color: pct < 25 ? "#ffffff" : "#374151" };
  } else {
    const t = (pct - 50) / 50;
    const r = Math.round(255 + (34 - 255) * t);
    const g = Math.round(255 + (152 - 255) * t);
    const b = Math.round(255 + (29 - 255) * t);
    return { backgroundColor: `rgb(${r},${g},${b})`, color: pct > 70 ? "#ffffff" : "#374151" };
  }
}

function LegendGradient() {
  return (
    <div className="flex h-3 rounded overflow-hidden" style={{ width: "160px" }}>
      {Array.from({ length: 21 }, (_, i) => {
        const { backgroundColor } = getCellStyle(i * 5);
        return <div key={i} style={{ flex: 1, backgroundColor }} />;
      })}
    </div>
  );
}

export default function AlignmentPage() {
  const t = useTranslations("alignment");
  const [data, setData] = useState<AlignmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    fetch("/api/spanish-proposals/alignment")
      .then((res) => res.json())
      .then((d: AlignmentData) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setFetchError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loading />
        <p className="text-drgray text-sm">{t("loading")}</p>
      </div>
    );
  }

  if (fetchError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-drerror text-sm">{t("error")}</p>
        <Link href="/parliament" className="text-drPurple text-sm hover:opacity-60 duration-300">
          ← {t("back")}
        </Link>
      </div>
    );
  }

  const { parties, matrix, totalProposals } = data;

  return (
    <main className="flex flex-col items-start justify-start min-h-screen pb-20 gap-8 font-drsans w-full max-w-6xl mx-auto">
      <div className="w-full pt-4">
        <Link href="/parliament" className="text-drPurple text-sm hover:opacity-60 duration-300">
          ← {t("back")}
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold font-drserif">{t("title")}</h1>
        <p className="text-drgray text-sm max-w-2xl">{t("description")}</p>
        <span className="text-xs text-drPurple bg-drlight px-3 py-1 rounded-full self-start mt-1">
          {t("total-proposals", { count: totalProposals })}
        </span>
      </div>

      {parties.length === 0 ? (
        <p className="text-drgray text-sm">{t("no-data")}</p>
      ) : (
        <div className="w-full overflow-x-auto rounded-lg border border-drlight shadow-sm">
          <table className="border-collapse text-xs min-w-[100%]" >
            <thead>
              <tr>
                <th className="sticky left-0 bg-white z-10 p-3 border border-drlight/60 text-left font-medium text-drgray md:min-w-[120px]">
                  {t("party")}
                </th>
                {parties.map((p) => (
                  <th
                    key={p}
                    className="p-2 border border-drlight/60 font-medium text-center bg-drlight/40"
                    style={{ minWidth: "68px" }}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Image
                        src={`/parties/${p}.svg`}
                        alt={p}
                        width={30}
                        height={30}
                        className="w-5 h-5 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <span className="truncate max-w-[56px] text-[10px]" title={p}>
                        {p.length > 9 ? p.slice(0, 8) + "…" : p}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parties.map((rowParty) => (
                <tr key={rowParty}>
                  <td className="sticky left-0 bg-white z-10 p-3 border border-drlight/60 font-medium">
                    <div className="flex items-center gap-2">
                      <Image
                        width={30}
                        height={30}
                        src={`/parties/${rowParty}.svg`}
                        alt={rowParty}
                        className="w-5 h-5 object-contain flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <span className="hidden md:flex truncate max-w-[80px]" title={rowParty}>
                        {rowParty}
                      </span>
                    </div>
                  </td>
                  {parties.map((colParty) => {
                    const cell = matrix[rowParty]?.[colParty];
                    const pct = cell?.pct ?? null;
                    const style = getCellStyle(pct);
                    const isDiagonal = rowParty === colParty;
                    const tooltipText =
                      isDiagonal
                        ? rowParty
                        : pct !== null
                        ? `${rowParty} ↔ ${colParty}: ${pct}% (${cell?.coVotes} ${t("shared-votes-short")})`
                        : `${rowParty} ↔ ${colParty}: ${t("no-data")}`;
                    return (
                      <td
                        key={colParty}
                        className="border border-drlight/60 text-center font-medium cursor-default transition-opacity hover:opacity-80"
                        style={{ ...style, minWidth: "68px", padding: "10px 4px" }}
                        title={tooltipText}
                      >
                        {isDiagonal ? "•" : pct !== null ? `${pct}%` : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold text-contrast">{t("legend-title")}</p>
        <div className="flex items-center gap-3">
          <span className="text-xs text-drgray">{t("legend-low")}</span>
          <LegendGradient />
          <span className="text-xs text-drgray">{t("legend-high")}</span>
        </div>
        <p className="text-xs text-drgray max-w-xl">{t("explanation")}</p>
      </div>
    </main>
  );
}
