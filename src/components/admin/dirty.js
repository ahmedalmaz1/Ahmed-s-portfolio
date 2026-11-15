"use client";
import { createContext, useContext, useEffect } from "react";

// A tiny store shared through context so the menu can ask "is the page dirty?".
export function createDirtyStore() {
  let value = false;
  return { get: () => value, set: (v) => void (value = v) };
}

export const DirtyContext = createContext(createDirtyStore());

export const UNSAVED_MESSAGE = "You have unsaved changes. Leave this page and lose them?";

/** Warns before closing/reloading the tab, and before leaving via the admin menu, while `dirty` is true. */
export function useUnsavedChanges(dirty) {
  const store = useContext(DirtyContext);

  useEffect(() => {
    store.set(dirty);
    if (!dirty) return;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      store.set(false);
    };
  }, [dirty, store]);
}
