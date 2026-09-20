import type { Metadata } from "next";
import { IBM_Plex_Sans, Newsreader } from "next/font/google";
import SiteNav from "@/components/SiteNav";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  weight: ["400", "500", "600"],
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
  display: "swap",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Varun Shiralkar",
    template: "%s · Varun Shiralkar",
  },
  description:
    "Personal website and blog of Varun Shiralkar — notes, experiments, and writing.",
  metadataBase: new URL("https://varunshiralkar.github.io"),
  openGraph: {
    title: "Varun Shiralkar",
    description:
      "Personal website and blog of Varun Shiralkar — notes, experiments, and writing.",
    url: "https://varunshiralkar.github.io",
    siteName: "Varun Shiralkar",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${ibmPlexSans.variable}`}
    >
      <body>
        <div className="site-shell">
          <SiteNav />
          <main className="site-main">{children}</main>
          <footer className="site-footer">
            <p>© {new Date().getFullYear()} Varun Shiralkar</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
