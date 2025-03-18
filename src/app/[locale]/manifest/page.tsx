import { getTranslations } from "next-intl/server";

export default async function Manifest() {
  const t = await getTranslations("manifest");

  return (
    <main className="flex flex-col g my-5apx-8 row-start-2 items-center sm:items-start p-4">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="text-lg">{t("intro")}</p>

      {/* Problem Section */}
      <section className="mt-4">
        <h2 className="text-xl font-semibold">{t("problemTitle")}</h2>
        <p>{t("problemDescription")}</p>
        <p className="mt-2">
          <strong>Ejemplo:</strong> {t("problemExample")}{" "}
          <a
            href="https://www.ipsos.com/es-es/espana-entre-los-paises-del-mundo-que-menos-confian-en-sus-politicos-y-politicas"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            (ipsos, 2023)
          </a>
        </p>
      </section>

      {/* How It Works Section */}
      <section className="my-4">
        <h2 className="text-xl font-semibold">{t("howItWorksTitle")}</h2>
        <p>{t("howItWorksDescription")}</p>
      </section>

      {/* Features Section */}
      <section className="my-4">
        <h2 className="text-xl font-semibold">{t("featuresTitle")}</h2>
        <ul>
          <li className="mb-2">{t("feature1")}</li>
          <li className="mb-2">{t("feature2")}</li>
          <li className="mb-2">{t("feature3")}</li>
          <li className="mb-2">{t("feature4")}</li>
          <li className="mb-2">{t("feature5")}</li>
        </ul>
      </section>

      {/* Personal Statement Section */}
      <section className="my-4">
        <h2 className="text-xl font-semibold">{t("personalStatementTitle")}</h2>
        <p>{t("personalStatement1")}</p>
        <blockquote className="italic text-sm my-5 px-8 text-gray-700" cite="https://es.wikiquote.org/wiki/Lord_Acton">
          <p>{t("quote1")}</p>
        </blockquote>
        <p className="mb-5">{t("personalStatement2")}</p>
        <p className="mb-5">{t("personalStatement3")}</p>
        <p>{t("personalStatement4")}</p>
        <blockquote className="italic text-sm my-5 px-8 text-gray-700" cite="https://es.wikiquote.org/wiki/George_Orwell">
          <p>{t("quote2")}</p>
        </blockquote>
        <p className="mb-5">{t("personalStatement5")}</p>
        <p>{t("personalStatement6")}</p>
        <blockquote className="italic text-sm my-5 px-8 text-gray-700" cite="https://es.wikiquote.org/wiki/Thomas_Jefferson">
          <p>{t("quote3")}</p>
        </blockquote>
        <p>{t("personalStatement7")}</p>
        <blockquote className="italic text-sm my-5 px-8 text-gray-700" cite="https://es.wikiquote.org/wiki/Jos%C3%A9_Ortega_y_Gasset">
          <p>{t("quote4")}</p>
        </blockquote>
        <p className="mb-5">{t("personalStatement8")}</p>
      </section>

      {/* Goal Section */}
      <section className="my-4">
        <h2 className="text-xl font-semibold">{t("goalTitle")}</h2>
        <p>{t("goalDescription")}</p>
      </section>
    </main>
  );
}
