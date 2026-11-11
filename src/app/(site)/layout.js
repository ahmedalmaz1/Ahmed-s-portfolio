import { Archivo, DM_Sans } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";

import SmoothScroll from "@/components/SmoothScroll";
import PageTransition from "@/components/PageTransition";
import SoundManager from "@/components/SoundManager";
import SoundToggle from "@/components/SoundToggle";
import BackToHome from "@/components/BackTohome";
import Cursor from "@/components/Cursor";
import { PROJECTS } from "@/data/projects";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const display = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const TITLE = `${SITE_NAME} | 3D environment and cinematic artist`;
const DESCRIPTION =
  "3D environment and cinematic artist working in Unreal Engine 5 — real-time environments, lighting and cinematics.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    images: [PROJECTS[0].image],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [PROJECTS[0].image],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#050a0f",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <SmoothScroll>
          <PageTransition>{children}</PageTransition>
          <BackToHome />
        </SmoothScroll>
        <SoundManager />
        <SoundToggle />
        <Cursor />
      </body>
    </html>
  );
}
