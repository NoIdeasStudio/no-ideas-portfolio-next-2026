import localFont from "next/font/local";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { ReactNode } from "react";
import { AutoScrollProvider } from "../contexts/AutoScrollContext";
import { ProjectThemeProvider } from "../contexts/ProjectThemeContext";
import { PageWrapper } from "../components/PageWrapper";
import { Header } from "../components/Header";
import { DisableDraftMode } from "../components/DisableDraftMode";
import { GoogleAnalytics } from "../components/GoogleAnalytics";
import { SiteJsonLd } from "../components/SiteJsonLd";
import { buildRootMetadata, getSiteSettings, resolveSiteUrl } from "../lib/metadata";
import { SanityLive } from "../sanity/lib/live";

const abcDiatype = localFont({
  src: "../../public/fonts/ABCDiatype-Medium.woff2",
  weight: "500",
  style: "normal",
  display: "swap",
  variable: "--font-abc-diatype",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return buildRootMetadata(settings);
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();
  const siteUrl = resolveSiteUrl(settings);
  const isDraftMode = (await draftMode()).isEnabled;
  const googleAnalyticsId = settings?.googleAnalyticsId?.trim();

  return (
    <html lang="en" className={abcDiatype.variable}>
      <body>
        {!isDraftMode && googleAnalyticsId && (
          <GoogleAnalytics measurementId={googleAnalyticsId} />
        )}
        <SiteJsonLd settings={settings} siteUrl={siteUrl} />
        <ProjectThemeProvider>
          <AutoScrollProvider>
            <PageWrapper>
              <Header />
              <main className="flex-1 w-full">{children}</main>
            </PageWrapper>
          </AutoScrollProvider>
        </ProjectThemeProvider>
        <SanityLive />
        {isDraftMode && (
          <>
            <DisableDraftMode />
            <VisualEditing />
          </>
        )}
      </body>
    </html>
  );
}

