"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CleanUpUrlAndRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    let shouldRedirect = false;

    if (url.hash === "#_=_") {
      url.hash = "";
      shouldRedirect = true;
    }

    if (url.searchParams.get("error") === "Callback") {
      url.searchParams.delete("error");
      shouldRedirect = true;
    }

    if (shouldRedirect) {
      window.history.replaceState({}, document.title, url.pathname + url.search);
      router.push("/auth/signin");
    }
  }, [router]);

  return null;
}