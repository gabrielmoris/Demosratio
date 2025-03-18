import { useTranslations } from "next-intl";

export default function Loading() {
  const t = useTranslations("loading-component");

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-drPurple border-r-transparent border-b-drPurple border-l-transparent rounded-full animate-spin"></div>
        <div className="absolute top-2 left-2 w-12 h-12 border-4 border-t-drPurple/50 border-r-transparent border-b-drPurple/50 border-l-transparent rounded-full animate-spin-reverse"></div>
      </div>
      {/* Loading Text */}
      <p className="mt-4 text-lg font-medium text-drPurple animate-pulse">{t("loading-text")}</p>
    </div>
  );
}
