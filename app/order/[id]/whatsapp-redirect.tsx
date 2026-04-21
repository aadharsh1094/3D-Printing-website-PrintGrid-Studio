"use client";

import { useEffect } from "react";

export function WhatsAppRedirect({ url }: { url: string }) {
  useEffect(() => {
    const t = setTimeout(() => {
      window.open(url, "_blank", "noopener,noreferrer");
    }, 600);
    return () => clearTimeout(t);
  }, [url]);
  return null;
}
