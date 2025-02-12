import type { Metadata } from "next";
import "../globals.css";
import { Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "../../i18n/routing";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Demosratio",
  description: "Created with love by gabrielcmoris",
};

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: "es" }>;
}

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await Promise.resolve(params); // Ensure locale is resolved from string

  if (locale && !routing.locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages({ locale: locale });
  return (
    <html lang={locale}>
      <body className={`${geistMono.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
