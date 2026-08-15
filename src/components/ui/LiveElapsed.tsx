"use client";

import { useEffect, useState } from "react";
import { elapsed } from "@/lib/format";

/** Tiempo transcurrido que se actualiza solo (mesas abiertas, turno de caja). */
export function LiveElapsed({ since }: { since: string }) {
  const [, tick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

  return <>{elapsed(since)}</>;
}
