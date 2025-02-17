import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  // locales: ["en", "de", "es"],
  locales: ["es"],

  // Used when no locale matches
  defaultLocale: "es",
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
