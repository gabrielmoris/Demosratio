/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { Method } from "axios";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Button from "@/src/components/Button";
import { useUiContext } from "@/src/context/uiContext";
import { usePartiesContext } from "../../Parties/PartyStateManager";

const KNOWN_ERROR_CODES = ["DUPLICATE_NAME", "SUBJECT_IN_USE"];

type SubjectDraft = { id?: number; name: string; description: string };

const inputClass = "w-full px-2.5 py-2 text-drgray rounded-md border border-drPurple focus:outline-none";

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

  return (
    <section className="flex flex-1 flex-col bg-white border border-drlight gap-6 rounded-md p-10">
      <label className="font-bold text-xl">{t("subjects-label")}</label>
      <p className="text-sm text-drgray">{t("subjects-hint")}</p>

      {drafts.map((draft, idx) => (
        <div key={draft.id} className="flex flex-col md:flex-row gap-2 items-start">
          <input value={draft.name} onChange={(e) => editDraft(idx, "name", e.target.value)} className={`${inputClass} md:w-1/4`} aria-label={t("subjects-name")} />
          <textarea
            value={draft.description}
            onChange={(e) => editDraft(idx, "description", e.target.value)}
            className={`${inputClass} md:flex-1 min-h-16`}
            aria-label={t("subjects-description")}
          />
          <div className="flex flex-row gap-2 w-full md:w-auto">
            <Button
              label={t("subjects-save-btn")}
              isLoading={!isChanged(draft)}
              className={!isChanged(draft) ? "opacity-40" : ""}
              onClick={() => send("patch", { subject_id: draft.id, name: draft.name, description: draft.description }, t("subjects-saved"))}
            />
            <Button label={t("subjects-delete-btn")} isSecondary onClick={() => remove(draft)} />
          </div>
        </div>
      ))}

      <div className="flex flex-col md:flex-row gap-2 items-start border-t border-drlight pt-6">
        <input
          value={newSubject.name}
          placeholder={t("subjects-name")}
          onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
          className={`${inputClass} md:w-1/4`}
        />
        <textarea
          value={newSubject.description}
          placeholder={t("subjects-description")}
          onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
          className={`${inputClass} md:flex-1 min-h-16`}
        />
        <div className="w-full md:w-auto">
          <Button label={t("subjects-add-btn")} onClick={add} isLoading={!newSubject.name.trim() || !newSubject.description.trim()} />
        </div>
      </div>
    </section>
  );
}
