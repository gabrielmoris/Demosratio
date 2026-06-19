"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Loading from "@/src/components/Loading";
import { SubjectCard } from "@/src/components/Temas/SubjectCard";
import { SubjectWithStats } from "@/types/temas";

export default function TemasPage() {
  const t = useTranslations("temas");
  const [subjects, setSubjects] = useState<SubjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    fetch("/api/temas")
      .then((res) => res.json())
      .then((data) => {
        setSubjects(data.subjects || []);
        setLoading(false);
      })
      .catch(() => {
        setFetchError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loading />
        <p className="text-drgray text-sm">{t("loading")}</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-drerror text-sm">{t("error")}</p>
      </div>
    );
  }

  return (
    <main className="flex flex-col gap-8 pb-20 md:pb-8 font-drsans w-full max-w-5xl mx-auto">
      <div className="pt-4">
        <h1 className="text-2xl font-bold font-drserif text-contrast mb-2">{t("title")}</h1>
        <p className="text-drgray text-sm max-w-2xl">{t("subtitle")}</p>
      </div>

      {subjects.length === 0 ? (
        <p className="text-drgray text-sm">{t("no-data")}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      )}
    </main>
  );
}
