import LpCard from "@/src/components/LpCard";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("landingpage");

  return (
    <main className="flex flex-col items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-roboto)]">
      <section className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-semibold text-[#262835] font-[family-name:var(--font-roboto-serif)]">
          {t("title")}
        </h1>
        <div className="w-full flex flex-col md:flex-row gap-5 justify-between items-center">
          <LpCard />
        </div>
      </section>
    </main>
  );
}
