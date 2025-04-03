import type { Metadata } from "next";
import "../globals.css";
import { Roboto, Roboto_Serif } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "../../i18n/routing";
import Navbar from "@/src/components/Navbar";
import { UiProvider } from "@/src/context/uiContext";
import { AuthProvider } from "@/src/context/authContext";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const robotoSerif = Roboto_Serif({
  variable: "--font-roboto-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Demosratio - Verifica promesas y decisiones políticas",
  description: "Demosratio: Transparencia y participación ciudadana en la política. Verifica promesas, decisiones y participa en la democracia.",
  keywords: [
    "demosratio",
    "política",
    "transparencia",
    "participación ciudadana",
    "promesas electorales",
    "decisiones políticas",
    "votos congreso",
    "simulacros votación",
    "datos políticos",
    "rendición de cuentas",
    "democracia",
  ],
  authors: [{ name: "Gabriel C. Moris" }],
  openGraph: {
    title: "Demosratio - Verifica promesas y decisiones políticas",
    description: "Demosratio: Transparencia y participación ciudadana en la política. Verifica promesas, decisiones y participa en la democracia.",
    // url: "https://demosratio.com",
    siteName: "Demosratio",
    images: [
      {
        url: "/demosratio.png",
        width: 1024,
        height: 1024,
        alt: "Demosratio Logo",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Demosratio - Verifica promesas y decisiones políticas",
    description: "Demosratio: Transparencia y participación ciudadana en la política. Verifica promesas, decisiones y participa en la democracia.",
    images: ["/demosratio.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await Promise.resolve(params);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages({ locale: locale });
  return (
    <html lang={locale}>
      <body
        className={`${roboto.variable} ${robotoSerif.variable} h-full antialiased md:pl-14 flex flex-row items-start justify-center max-w-screen-sm md:max-w-screen-5xl`}
      >
        <AuthProvider>
          <UiProvider>
            <NextIntlClientProvider messages={messages}>
              <main className="py-10 h-full px-4 md:px-28 lg:px-48 3xl:px-56 w-full min-h-screen font-[family-name:var(--font-roboto)] flex flex-col items-center justify-items-center">
                <Navbar />
                {children}
              </main>
            </NextIntlClientProvider>
          </UiProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
