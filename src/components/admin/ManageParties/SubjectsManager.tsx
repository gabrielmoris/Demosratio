/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { Method } from "axios";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useUiContext } from "@/src/context/uiContext";
import { usePartiesContext } from "../../Parties/PartyStateManager";

const KNOWN_ERROR_CODES = ["DUPLICATE_NAME", "SUBJECT_IN_USE"];

type SubjectDraft = { id?: number; name: string; description: string };

const inputClass = "w-full px-3 py-2 text-drgray rounded-md border border-drPurple focus:outline-none";
const actionClass = "px-4 py-2 rounded-md text-sm whitespace-nowrap hover:opacity-80 duration-300";

export function SubjectsManager() {
  const { subjects, getAllSubjects } = usePartiesContext();
  const [drafts, setDrafts] = useState<SubjectDraft[]>([]);
  const [newSubject, setNewSubject] = useState<SubjectDraft>({ name: "", description: "" });

  const t = useTranslations("manage-parties");
  const { showToast } = useUiContext();

  useEffect(() => {
    setDrafts(subjects.map(({ id, name, description }) => ({ id, name, description })));
  }, [subjects]);

  const send = async (method: Method, data: object, successMessage: string) => {
    try {
      await axios.request({ url: "/api/parties/subjects", method, data, withCredentials: true });
      showToast({ message: successMessage, variant: "success", duration: 3000 });
      await getAllSubjects();
      return true;
    } catch (err: any) {
      const code = err?.response?.data?.code;
      showToast({
        message: KNOWN_ERROR_CODES.includes(code) ? t(`subjects-errors.${code}`) : err?.response?.data?.error || err?.message || "Error.",
        variant: "error",
        duration: 5000,
      });
      return false;
    }
  };

  const editDraft = (idx: number, key: "name" | "description", value: string) =>
    setDrafts((prev) => prev.map((d, i) => (i === idx ? { ...d, [key]: value } : d)));

  const isChanged = (draft: SubjectDraft) => {
    const original = subjects.find((s) => s.id === draft.id);
    return !!original && (original.name !== draft.name || original.description !== draft.description);
  };

  const remove = (draft: SubjectDraft) => {
    if (window.confirm(t("subjects-confirm-delete", { name: draft.name }))) {
      send("delete", { subject_id: draft.id }, t("subjects-deleted"));
    }
  };

  const add = async () => {
    if (!newSubject.name.trim() || !newSubject.description.trim()) return;
    if (await send("post", newSubject, t("subjects-saved"))) setNewSubject({ name: "", description: "" });
  };

  const isNewValid = !!newSubject.name.trim() && !!newSubject.description.trim();

  return (
    <section className="flex flex-1 flex-col bg-white border border-drlight gap-6 rounded-md p-6 md:p-10">
      <div className="flex flex-col gap-1">
        <label className="font-bold text-xl">{t("subjects-label")}</label>
        <p className="text-sm text-drgray">{t("subjects-hint")}</p>
      </div>

      <ul className="flex flex-col gap-4">
        {drafts.map((draft, idx) => {
          const changed = isChanged(draft);
          return (
            <li key={draft.id} className="flex flex-col gap-2 rounded-md border border-drlight p-4">
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <input
                  value={draft.name}
                  onChange={(e) => editDraft(idx, "name", e.target.value)}
                  className={`${inputClass} font-semibold sm:flex-1`}
                  aria-label={t("subjects-name")}
                />
                <div className="flex flex-row gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={!changed}
                    onClick={() => send("patch", { subject_id: draft.id, name: draft.name, description: draft.description }, t("subjects-saved"))}
                    className={`${actionClass} bg-contrast text-drlight disabled:opacity-30 disabled:cursor-not-allowed`}
                  >
                    {t("subjects-save-btn")}
                  </button>
                  <button type="button" onClick={() => remove(draft)} className={`${actionClass} bg-drlight text-contrast`}>
                    {t("subjects-delete-btn")}
                  </button>
                </div>
              </div>
              <textarea
                value={draft.description}
                onChange={(e) => editDraft(idx, "description", e.target.value)}
                rows={3}
                className={`${inputClass} text-sm resize-y`}
                aria-label={t("subjects-description")}
              />
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-2 rounded-md border border-dashed border-drPurple p-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <input
            value={newSubject.name}
            placeholder={t("subjects-name")}
            onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
            className={`${inputClass} sm:flex-1`}
          />
          <button
            type="button"
            disabled={!isNewValid}
            onClick={add}
            className={`${actionClass} shrink-0 bg-contrast text-drlight disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            {t("subjects-add-btn")}
          </button>
        </div>
        <textarea
          value={newSubject.description}
          placeholder={t("subjects-description")}
          onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
          rows={3}
          className={`${inputClass} text-sm resize-y`}
        />
      </div>
    </section>
  );
}
