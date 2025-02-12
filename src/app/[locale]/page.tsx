import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("landingpage");
  return (
    <div className="flex flex-col items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <blockquote className="text-xl italic font-semibold text-gray-900 dark:text-white">&quot;{t("title")}&quot;</blockquote>
        <iframe
          className="rounded-xl border-zinc-500 border-2 w-[50rem] h-[30rem]"
          src="https://embed.figma.com/design/F2pp5p2nCPLgqh36NvqbPH/Demosratio--ui?node-id=0-1&embed-host=share"
        ></iframe>
      </main>
    </div>
  );
}
