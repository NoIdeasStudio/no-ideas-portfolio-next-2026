import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { ProjectThemeProvider } from "../contexts/ProjectThemeContext";
import { PageWrapper } from "../components/PageWrapper";
import { Header } from "../components/Header";

export const metadata: Metadata = {
  title: "No Ideas",
  description: "Design and art direction studio."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ProjectThemeProvider>
          <PageWrapper>
            <Header />
            <main className="flex-1 w-full">{children}</main>
            <footer className="w-full py-4 px-4 sm:px-8 md:px-16 lg:px-24 text-[11px] text-[#666] text-[var(--foreground)]">
              No Ideas — {new Date().getFullYear()}
            </footer>
          </PageWrapper>
        </ProjectThemeProvider>
      </body>
    </html>
  );
}

