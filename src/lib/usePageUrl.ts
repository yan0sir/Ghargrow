"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Current page URL on the client; "" during SSR/hydration so markup matches. */
export function usePageUrl() {
  return useSyncExternalStore(
    subscribe,
    () => window.location.href,
    () => "",
  );
}
