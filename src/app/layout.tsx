import localFont from "next/font/local";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import { AutoScrollProvider } from "../contexts/AutoScrollContext";
import { ProjectThemeProvider } from "../contexts/ProjectThemeContext";
import { PageWrapper } from "../components/PageWrapper";
import { Header } from "../components/Header";

const abcDiatype = localFont({
  src: "../../public/fonts/ABCDiatype-Medium.woff2",
  weight: "500",
  style: "normal",
  display: "swap",
  variable: "--font-abc-diatype",
});

export const metadata: Metadata = {
  title: "No Ideas",
  description: "Design and art direction studio."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={abcDiatype.variable}>
      <body>
        <ProjectThemeProvider>
          <AutoScrollProvider>
            <PageWrapper>
              <Header />
              <main className="flex-1 w-full">{children}</main>
            </PageWrapper>
          </AutoScrollProvider>
        </ProjectThemeProvider>
      </body>
    </html>
  );
}

