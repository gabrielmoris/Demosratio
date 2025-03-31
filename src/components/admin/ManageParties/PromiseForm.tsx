import Input from "@/src/components/Input";
import { FormWrapper } from "@/src/components/FormWrapper";
import { useTranslations } from "next-intl";
import Button from "@/src/components/Button";
import { ChangeEvent, FormEvent, useCallback, useState } from "react";
import { usePartiesContext } from "./StateManager";
import Dropdown from "../../Dropdown";
import { Subject } from "@/types/politicalParties";
import { useRequest } from "@/hooks/use-request";
import { useUiContext } from "@/src/context/uiContext";

export function PromiseForm() {
  const [promiseToSave, setPromiseToSave] = useState("");
  const {
    partyChoice,
    campaignChoice,
    subjects,
    subjectChoice,
    setSubjectChoice,
  } = usePartiesContext();

  const t = useTranslations("manage-parties");
  const { showToast } = useUiContext();

  const onInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setPromiseToSave(newValue);
    },
    []
  );

  const { doRequest: savePromise } = useRequest({
    url: "/api/parties/promises",
    method: "post",
    onSuccess() {
      showToast({
        message: t("saved-promise"),
        variant: "success",
        duration: 3000,
      });
    },
  });

  const handleSubmit = (e: FormEvent<Element>): void => {
    e.preventDefault();
    const promise = {
      promise: promiseToSave,
      subject_id: subjectChoice?.id,
      campaign_id: campaignChoice?.id,
      party_id: partyChoice?.id,
    };
    savePromise(promise);
    setPromiseToSave("");
  };

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <label className="font-bold text-xl">{t("save-promise-label")}</label>
      {subjects[0] && (
        <Dropdown
          items={subjects}
          choose={(item) => setSubjectChoice(item as Subject)}
          choice={subjectChoice || subjects[0]}
        />
      )}
      <Input
        inputLabel={t("input-label-promise")}
        type="textarea"
        inputString={promiseToSave}
        placeholder=""
        setInput={onInputChange}
        placeholderClass="h-12"
        required
      />

      <Button label={t("save-promise-btn")} type="submit" />
    </FormWrapper>
  );
}
