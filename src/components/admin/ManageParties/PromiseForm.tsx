import Input from "@/src/components/Input";
import { FormWrapper } from "@/src/components/FormWrapper";
import { useTranslations } from "next-intl";
import Button from "@/src/components/Button";
import { ChangeEvent, FormEvent, useCallback, useState } from "react";
import { usePartiesContext } from "./StateManager";
import Dropdown from "../../Dropdown";
import { Subject } from "@/types/politicalParties";

export function PromiseForm() {
  const [promiseToSave, setPromiseToSave] = useState("");
  const { partyChoice, campaignChoice, subjects, subjectChoice, setSubjectChoice } = usePartiesContext();

  const t = useTranslations("manage-parties");

  const onInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setPromiseToSave(newValue);
  }, []);

  const handleSubmit = (e: FormEvent<Element>): void => {
    e.preventDefault();
    const promise = {
      promise: promiseToSave,
      subject_id: subjectChoice?.id,
      campaign_id: campaignChoice?.id,
      party_id: partyChoice?.id,
    };
    console.log(promise);
  };

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <label className="font-bold text-xl">{t("save-promise-label")}</label>
      <Dropdown items={subjects} choose={(item) => setSubjectChoice(item as Subject)} choice={subjectChoice || subjects[0]} />
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
