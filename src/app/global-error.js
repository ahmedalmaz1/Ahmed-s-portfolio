"use client";
import { useEffect } from "react";

// Last resort: replaces the root layout when the layout itself crashes, so it
// cannot rely on Tailwind or fonts and uses inline styles only.
export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const button = {
    padding: "10px 24px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,.25)",
    background: "#eef2f4",
    color: "#050a0f",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
  };

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100svh",
          display: "grid",
          placeItems: "center",
          background: "#050a0f",
          color: "#eef2f4",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        <main role="alert" style={{ padding: 24 }}>
          <h1 style={{ fontSize: 40, textTransform: "uppercase", margin: 0 }}>
            Something went wrong
          </h1>
          <p style={{ opacity: 0.6, margin: "16px 0 28px" }}>
            Please try again in a moment.
          </p>
          <button type="button" onClick={reset} style={button}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
