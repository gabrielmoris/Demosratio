"use client";
import { useRequest } from "@/hooks/use-request";
import Button from "@/src/components/Button";
import { Popup } from "@/src/components/Overlay";
import { useAuth } from "@/src/context/authContext";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Promises() {
  const [openDelete, setOpenDelete] = useState(false);
  const t = useTranslations("profile");

  const router = useRouter();
  const { updateCurrentUser, currentUser } = useAuth();
  const locale = useLocale();

  const { doRequest } = useRequest({
    url: "/api/users/delete-user",
    method: "get",
    onSuccess: () => {
      updateCurrentUser();
      router.push(`/${locale}`);
    },
  });

  const goToAdmin = () => {
    router.push(`/${locale}/admin`);
  };

  return (
    <div className="flex z-30 flex-col items-center justify-center mb-16 ] md:min-h-[calc(100vh-6rem)] font-drsans">
      <main
        className={`${
          currentUser?.is_admin ? "grid grid-cols-1 md:grid-cols-2" : "flex flex-row w-full md:w-2/3 xl:w-2/3 3xl:w-1/2s"
        } gap-4 items-center justify-center w-full h-full`}
      >
        {currentUser?.is_admin && (
          <div className="flex flex-col bg-white border border-drlight gap-8 rounded-md p-10 items-center justify-between w-full h-full">
            <label className="font-drserif font-bold w-full text-center text-lg">{t("admin-title")}</label>
            <p className="font-drsans text-sm">{t("admin-advice")}</p>
            <Button label={t("btn-admin")} type="button" icn="/window.svg" onClick={goToAdmin} />
          </div>
        )}
        <div className="flex flex-col bg-white border border-drlight gap-8 rounded-md p-10 items-center justify-between w-full h-full">
          {openDelete && <Popup click={() => doRequest} text={t("delete-advice")} show={() => setOpenDelete(false)} extendStyle="min-w-52" />}
          <label className="font-drserif font-bold w-full text-center text-lg">{t("form-title")}</label>
          <p className="font-drsans text-sm">{t("delete-advice")}</p>
          <Button label={t("btn-del")} type="button" icn="/del-usr-icn.svg" onClick={() => setOpenDelete(true)} />
        </div>
      </main>
    </div>
  );
}
