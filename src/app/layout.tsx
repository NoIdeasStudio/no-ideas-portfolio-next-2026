import "./globals.css";
import type { Metadata } from "next";
import { cookies, draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { ReactNode } from "react";
import { AutoScrollProvider } from "../contexts/AutoScrollContext";
import { ProjectThemeProvider } from "../contexts/ProjectThemeContext";
import { PageWrapper } from "../components/PageWrapper";
import { Header } from "../components/Header";

export const metadata: Metadata = {
  title: "No Ideas",
  description: "Design and art direction studio."
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Ensures Draft Mode is read at request time so Presentation’s iframe gets `<VisualEditing />`
  // (a fully static layout shell can omit it when `draftMode()` was false at prerender).
  await cookies();
  const isDraftMode = (await draftMode()).isEnabled;

  return (
    <html lang="en">
      <body>
        <ProjectThemeProvider>
          <AutoScrollProvider>
            <PageWrapper>
              <Header />
              <main className="flex-1 w-full">{children}</main>
              <footer className="w-full py-4 px-4 sm:px-8 md:px-16 lg:px-24 text-[11px] text-[#666] text-[var(--foreground)]">
                No Ideas — {new Date().getFullYear()}
              </footer>
            </PageWrapper>
          </AutoScrollProvider>
        </ProjectThemeProvider>
        {isDraftMode ? <VisualEditing /> : null}
      </body>
    </html>
  );
}

