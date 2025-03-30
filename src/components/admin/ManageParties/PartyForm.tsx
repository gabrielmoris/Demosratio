import Input from "@/src/components/Input";
import { FormWrapper } from "@/src/components/FormWrapper";
import { useTranslations } from "next-intl";
import Button from "@/src/components/Button";
import { ChangeEvent, FormEvent, useCallback, useState } from "react";
import { useRequest } from "@/hooks/use-request";
import { usePartiesContext } from "./StateManager";

export function PartyForm() {
  const [partyToSave, setPartyToSave] = useState({ name: "", logo_url: "" });
  const { getAllParties } = usePartiesContext();

  const t = useTranslations("manage-parties");

  const onInputPartyChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, inputKey: string | undefined) => {
      e.preventDefault();
      if (inputKey) {
        setPartyToSave({ ...partyToSave, [inputKey]: e.target.value });
      }
    },
    [partyToSave, setPartyToSave]
  );

  const { doRequest: saveParty } = useRequest({
    url: "/api/parties",
    method: "post",
    body: partyToSave,
    onSuccess() {
      getAllParties();
    },
  });

  const handleSubmit = (e: FormEvent<Element>): void => {
    e.preventDefault();
    saveParty();
  };

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <label className="font-bold text-xl">{t("save-party-label")}</label>
      <Input
        inputLabel={t("input-label-name")}
        inputObj={partyToSave}
        type="text"
        inputKey="name"
        placeholder={partyToSave.name}
        setInput={onInputPartyChange}
        placeholderClass="h-12"
        required
      />
      <Input
        inputLabel={t("input-label-logo_url")}
        inputObj={partyToSave}
        type="text"
        inputKey="logo_url"
        placeholder={partyToSave.logo_url}
        setInput={onInputPartyChange}
        placeholderClass="h-12"
        required
      />
      <Button label={t("save-party-btn")} type="submit" />
    </FormWrapper>
  );
}
