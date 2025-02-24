import { useTranslations } from "next-intl";

// import Link from "next/link";

export default function Parliament() {
  const t = useTranslations("login");

  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <form className="flex flex-col bg-white gap-8 rounded-md p-10 row-start-2 items-center sm:items-start">
        <label>{t("form-title")}</label>
      </form>
    </div>
  );
}
