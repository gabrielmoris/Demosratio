import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["es", "ca", "eu", "gl", "en"],

  defaultLocale: "es",
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
