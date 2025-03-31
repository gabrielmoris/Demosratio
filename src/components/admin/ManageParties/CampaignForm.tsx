import Input from "@/src/components/Input";
import { usePartiesContext } from "./StateManager";
import { FormWrapper } from "@/src/components/FormWrapper";
import { useTranslations } from "next-intl";
import Button from "@/src/components/Button";
import { ChangeEvent, FormEvent, useCallback, useState } from "react";
import { useRequest } from "@/hooks/use-request";

export function CampaignForm() {
  const { partyChoice, getAllParties, campaignChoice, campaigns } =
    usePartiesContext();

  const [campaignToSave, setCampaignToSave] = useState({
    year: campaignChoice?.year || campaigns[0]?.year,
    campaign_pdf_url: "",
    party_id: partyChoice?.id,
  });

  const t = useTranslations("manage-parties");

  const { doRequest: saveCampaign } = useRequest({
    url: "/api/parties/campaigns",
    method: "post",
    body: campaignToSave,
    onSuccess() {
      getAllParties();
    },
  });

  const onInputCampaignChange = useCallback(
    (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      inputKey: string | undefined
    ) => {
      e.preventDefault();
      if (inputKey) {
        setCampaignToSave({ ...campaignToSave, [inputKey]: e.target.value });
      }
    },
    [campaignToSave, setCampaignToSave]
  );

  const handleSubmit = (e: FormEvent<Element>): void => {
    e.preventDefault();
    saveCampaign();
  };

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <label className="font-bold text-xl">{t("save-campaign-label")}</label>
      <Input
        inputLabel={t("input-canpaign-year")}
        inputObj={campaignToSave}
        type="number"
        inputKey="year"
        placeholder={campaignToSave.year || 1975}
        setInput={onInputCampaignChange}
        placeholderClass="h-12"
        required
      />
      <Input
        inputLabel={t("input-campaign-pdf")}
        inputObj={campaignToSave}
        type="text"
        inputKey="campaign_pdf_url"
        placeholder={campaignToSave.campaign_pdf_url}
        setInput={onInputCampaignChange}
        placeholderClass="h-12"
        required
      />
      <Button label={t("save-campaign-btn")} type="submit" />
    </FormWrapper>
  );
}
