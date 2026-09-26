"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useLogout } from "@/hooks";

export default function LogoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutate: logout, isPending, isError } = useLogout();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    logout(undefined, {
      onSuccess: () => {
        queryClient.clear();
        toast.success("Logged out", {
          description: "You have been logged out successfully.",
        });
        router.replace("/login");
      },
      onError: () => {
        // Even if the server call fails (e.g. already logged out),
        // clear local state and send the user to login.
        queryClient.clear();
        router.replace("/login");
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid min-h-svh place-items-center px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        {isError ? (
          <>
            <p className="text-[15px] font-semibold">Could not reach the server</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Your local session was cleared. You can safely go back to login.
            </p>
            <Link
              href="/login"
              className="inline-flex h-9 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Go to login
            </Link>
          </>
        ) : (
          <>
            <Spinner className="size-6" />
            <p className="text-[15px] font-semibold">
              {isPending ? "Logging you out…" : "Redirecting…"}
            </p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Please wait while we end your session.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
