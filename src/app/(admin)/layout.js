import "./admin.css";

export const metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#0b1016" };

// The admin area has its own root layout: no site fonts, cursor, sound or page transitions.
export default function AdminRootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
