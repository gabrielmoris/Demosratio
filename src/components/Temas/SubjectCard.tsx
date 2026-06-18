"use client";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/routing";
import { SubjectWithStats } from "@/types/temas";

interface SubjectCardProps {
  subject: SubjectWithStats;
}

export const SubjectCard = ({ subject }: SubjectCardProps) => {
  const t = useTranslations("temas");

  return (
    <Link
      href={`/temas/${subject.id}`}
      className="flex flex-col gap-3 bg-white border border-drPurple/20 rounded-lg p-5 hover:border-drPurple hover:shadow-sm transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold font-drserif text-contrast text-base group-hover:text-drPurple transition-colors duration-200">
          {subject.name}
        </h3>
        <svg
          className="w-5 h-5 text-drPurple opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      <p className="text-sm text-drgray line-clamp-2 flex-1">{subject.description}</p>

      <div className="flex gap-4 pt-2 border-t border-drlight">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-drPurple flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-xs text-drgray">
            <span className="font-semibold text-contrast">{subject.totalPromises}</span> {t("total-promises")}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-drPurple flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs text-drgray">
            <span className="font-semibold text-contrast">{subject.totalParties}</span> {t("parties-label")}
          </span>
        </div>
      </div>
    </Link>
  );
};
