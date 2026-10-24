"use client";

import { useEffect } from "react";
import DashboardError from "./(dashboard)/error";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16">
      <DashboardError error={error} reset={reset} />
    </div>
  );
}
