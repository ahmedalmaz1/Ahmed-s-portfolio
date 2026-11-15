"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

/** Loads `path` once; returns { data, setData, error, loading, reload }. */
export function useApi(path) {
  const [state, setState] = useState({ data: null, error: "", loading: true });

  const load = useCallback(
    async (signal) => {
      try {
        const data = await api(path, { signal });
        setState({ data, error: "", loading: false });
      } catch (err) {
        if (err.name !== "AbortError") setState({ data: null, error: err.message, loading: false });
      }
    },
    [path],
  );

  useEffect(() => {
    const controller = new AbortController();
    // deferred so no state is set synchronously inside the effect body
    const timer = setTimeout(() => load(controller.signal), 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [load]);

  const setData = useCallback((updater) => setState((s) => ({ ...s, data: typeof updater === "function" ? updater(s.data) : updater })), []);
  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: "" }));
    return load();
  }, [load]);

  return { ...state, setData, reload };
}
