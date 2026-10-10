/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/src/components/Button";
import { useRequest } from "@/hooks/use-request";
import { useUiContext } from "@/src/context/uiContext";
import { usePartiesContext } from "../../Parties/PartyStateManager";
import { ExtractedSubjectPromises } from "@/types/politicalParties";

const KNOWN_ERROR_CODES = ["INVALID_URL", "NOT_PDF", "TOO_LARGE", "DOWNLOAD_FAILED", "AI_FAILED"];

export function AiPromisesExtractor() {
  const { partyChoice, campaignChoice, promises, getPartyPromises } = usePartiesContext();
  const [drafts, setDrafts] = useState<ExtractedSubjectPromises[]>([]);
  const [extracting, setExtracting] = useState(false);

  const t = useTranslations("manage-parties");
  const { showToast } = useUiContext();

  const { doRequest: saveAll } = useRequest({
    url: "/api/parties/promises/bulk",
    method: "post",
    onSuccess(data: { count: number }) {
      showToast({ message: t("ai-saved", { count: data.count }), variant: "success", duration: 3000 });
      setDrafts([]);
      getPartyPromises();
    },
  });

  const extract = async () => {
    if (!campaignChoice) return;
    setExtracting(true);
    setDrafts([]);
    try {
      const { data } = await axios.post<ExtractedSubjectPromises[]>(
        "/api/parties/campaigns/extract-promises",
        { campaign_id: campaignChoice.id },
        { withCredentials: true }
      );
      setDrafts(data);
      if (data.every((s) => s.promises.length === 0)) {
        showToast({ message: t("ai-empty"), variant: "error", duration: 4000 });
      }
    } catch (err: any) {
      const code = err?.response?.data?.code;
      showToast({
        message: KNOWN_ERROR_CODES.includes(code) ? t(`ai-errors.${code}`) : err?.response?.data?.error || err?.message || "Error.",
        variant: "error",
        duration: 6000,
      });
    } finally {
      setExtracting(false);
    }
  };

  const editPromise = (subjectIdx: number, promiseIdx: number, value: string) =>
    setDrafts((prev) =>
      prev.map((s, i) => (i === subjectIdx ? { ...s, promises: s.promises.map((p, j) => (j === promiseIdx ? value : p)) } : s))
    );

  const removePromise = (subjectIdx: number, promiseIdx: number) =>
    setDrafts((prev) => prev.map((s, i) => (i === subjectIdx ? { ...s, promises: s.promises.filter((_, j) => j !== promiseIdx) } : s)));

  const toSave = drafts.flatMap((s) => s.promises.filter((p) => p.trim()).map((promise) => ({ subject_id: s.subject_id, promise })));

  const handleSaveAll = () => {
    if (!partyChoice || !campaignChoice || toSave.length === 0) return;
    saveAll({ party_id: partyChoice.id, campaign_id: campaignChoice.id, promises: toSave });
  };

  if (!campaignChoice) return null;

  return (
    <section className="flex flex-1 flex-col bg-white border border-drlight gap-6 rounded-md p-10">
      <label className="font-bold text-xl">{t("ai-label")}</label>
      <p className="text-drgray break-all">
        {t("ai-pdf")}:{" "}
        <a href={campaignChoice.campaign_pdf_url} target="_blank" rel="noopener noreferrer" className="underline">
          {campaignChoice.campaign_pdf_url}
        </a>
      </p>
      <p className="text-sm text-drgray">{t("ai-hint")}</p>
      {promises.length > 0 && <p className="text-sm font-semibold text-red-600">{t("ai-existing-warning", { count: promises.length })}</p>}

      <Button label={extracting ? t("ai-extracting") : t("ai-extract-btn")} isLoading={extracting} onClick={extract} />

      {drafts.length > 0 && (
        <div className="flex flex-col gap-6">
          {drafts.map((subject, sIdx) => (
            <div key={subject.subject_id} className="flex flex-col gap-2">
              <h3 className="font-bold">
                {subject.subject_name} ({subject.promises.length})
              </h3>
              {subject.promises.length === 0 && <p className="text-sm text-drgray">{t("ai-no-promises")}</p>}
              {subject.promises.map((promise, pIdx) => (
                <div key={pIdx} className="flex flex-row gap-2 items-start">
                  <textarea
                    value={promise}
                    onChange={(e) => editPromise(sIdx, pIdx, e.target.value)}
                    className="flex-1 min-h-16 px-2.5 py-2 text-drgray rounded-md border border-drPurple focus:outline-none"
                  />
                  <button type="button" onClick={() => removePromise(sIdx, pIdx)} className="px-3 py-2 text-red-600 hover:opacity-70" aria-label={t("ai-remove")}>
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ))}
          <Button label={t("ai-save-btn", { count: toSave.length })} onClick={handleSaveAll} isLoading={toSave.length === 0} />
        </div>
      )}
    </section>
  );
}
