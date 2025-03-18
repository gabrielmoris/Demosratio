"use client";
import { useRequest } from "@/hooks/use-request";
import Button from "@/src/components/Button";
import { useAuth } from "@/src/context/authContext";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function Promises() {
  const t = useTranslations("profile");

  const router = useRouter();
  const { updateCurrentUser } = useAuth();
  const locale = useLocale();

  const { doRequest } = useRequest({
    url: "http://localhost:3002/api/users/delete",
    method: "get",
    onSuccess: () => {
      updateCurrentUser();
      router.push(`/${locale}`);
    },
  });

  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center justify-center">
        <div className="flex flex-col bg-white border border-drlight gap-8 rounded-md p-10 row-start-2 items-center justify-center w-full md:w-1/2 md:min-w-96">
          <label className="font-drserif font-bold w-full text-center text-lg">{t("form-title")}</label>
          <p className="font-drnote text-sm">{t("delete-advice")}</p>
          <Button label={t("btn-del")} type="button" icn="/del-usr-icn.svg" onClick={doRequest} />
        </div>
      </main>
    </div>
  );
}
