import dynamic from "next/dynamic";
import { Syne, Instrument_Sans } from "next/font/google";
const ToastProvider = dynamic(() => import("@/providers/ToastProvider"));
const Footer = dynamic(() => import("@/components/Footer"));

import "./globals.css";

const display = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
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
