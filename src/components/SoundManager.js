"use client";
import { useEffect } from "react";
import { init } from "@/lib/ambient";

// mounted once in the layout; keeps the music logic alive across pages
export default function SoundManager() {
  useEffect(() => init(), []);
  return null;
}
