import LpCard from "@/src/components/LpCard";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("landingpage");

  return (
    <main className="flex flex-col items-center justify-items-center min-h-screen p-8 font-[family-name:var(--font-roboto)]">
      <section className="flex flex-col px-10 md:px-28 3xl:px-56 gap-8 md:gap-12 row-start-2 items-center sm:items-start">
        <div className="flex flex-col gap-5 md:gap-10">
          <h1 className="text-2xl font-semibold text-[#262835] font-[family-name:var(--font-roboto-serif)]">{t("title")}</h1>
          <p className="text-lg">{t("subtitle")}</p>
        </div>

        <div className="w-full flex flex-col md:flex-row gap-5 justify-between items-center mb-20 md:mb-0">
          <LpCard type="parliament" />
          <LpCard type="promises" />
        </div>
      </section>
    </main>
  );
}
