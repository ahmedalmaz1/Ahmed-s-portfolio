"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePageTransition } from "@/components/PageTransition";

// Back button of the project page. The page transition keeps the in-app
// history and the scroll positions (see PageTransition.js).
export function useGoBack() {
  const router = useRouter();
  const transition = usePageTransition();

  return useCallback(() => {
    if (transition) transition.back();
    else router.push("/#projects");
  }, [transition, router]);
}
