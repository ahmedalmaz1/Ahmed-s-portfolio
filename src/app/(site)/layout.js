import dynamic from "next/dynamic";
import { Inter_Tight, DM_Sans } from "next/font/google";
const ToastProvider = dynamic(() => import("@/providers/ToastProvider"));
const Footer = dynamic(() => import("@/components/layout/Footer"));

import "./globals.css";

const display = Inter_Tight({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata = {
  title: "Ahmed Almaz | 3D environment and cinematic artist",
  description:
    "3D environment and cinematic artist working in Unreal Engine 5 — real-time environments, lighting and cinematics.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <ToastProvider>
          {children}
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
