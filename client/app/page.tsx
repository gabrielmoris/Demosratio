export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <blockquote className="text-xl italic font-semibold text-gray-900 dark:text-white">
          &quot;Demos Ratio: Veritas et Iustitia. Civis curiosus et vigilans iura sua novit. Demos Ratio, fons veritatis, ubi promissio et factum, lex
          et iustitia, sub oculis populi monstrantur.&quot;
        </blockquote>
        <iframe
          className="rounded-xl border-zinc-500 border-2"
          width="800"
          height="450"
          src="https://embed.figma.com/design/F2pp5p2nCPLgqh36NvqbPH/Demosratio--ui?node-id=0-1&embed-host=share"
        ></iframe>
      </main>
    </div>
  );
}
