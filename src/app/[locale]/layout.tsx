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
  weight: ["400", "700"], // Add the weights you need
});

const robotoSerif = Roboto_Serif({
  variable: "--font-roboto-serif",
  subsets: ["latin"],
  weight: ["400", "700"], // Add the weights you need
});

export const metadata: Metadata = {
  title: "Demosratio",
  description: "Created with love by gabrielcmoris",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await Promise.resolve(params);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages({ locale: locale });
  return (
    <html lang={locale}>
      <body
        className={`${roboto.variable} ${robotoSerif.variable} antialiased md:pl-14 flex flex-row items-start justify-center max-w-screen-sm md:max-w-screen-5xl`}
      >
        <AuthProvider>
          <UiProvider>
            <NextIntlClientProvider messages={messages}>
              <main className="py-10 px-4 md:px-28 lg:px-48 3xl:px-56 min-h-screen font-[family-name:var(--font-roboto)] flex flex-col items-center justify-items-center">
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
