"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { getMe } from "@/api";
import { getApiErrorMessage, ME_QUERY_KEY, useLogin } from "@/hooks";

type AdminQuickLoginProps = {
  redirectTo?: string;
};

export default function AdminQuickLogin({
  redirectTo = "/admin/dashboard",
}: AdminQuickLoginProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutateAsync: login, isPending } = useLogin();

  const [isVerifying, setIsVerifying] = useState(false);
  const isLoading = isPending || isVerifying;

  const handleAdminLogin = async () => {
    try {
      await login({
        email: "testeradmin@gmail.com",
        password: "testerAdmin@admin12345",
      });

      await queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });

      setIsVerifying(true);
      let role: string | undefined;
      try {
        const me = await getMe();
        role = me.data?.role;
      } catch {
        toast.error("Unable to load user information.");
        return;
      } finally {
        setIsVerifying(false);
      }

      const normalizedRole = (role ?? "").toUpperCase();
      if (normalizedRole !== "ADMIN" && normalizedRole !== "SUPERADMIN") {
        toast.error("This account does not have admin access.");
        return;
      }

      toast.success("Admin login successful!");
      router.push(redirectTo);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Admin login failed"));
    }
  };

  return (
    <button
      type="button"
      onClick={handleAdminLogin}
      disabled={isLoading}
      className="
        w-full
        flex
        items-center
        justify-center
        gap-3
        rounded-2xl
        border
        border-primary/30
        bg-primary/5
        px-6
        py-4
        font-bold
        text-primary
        transition-all
        duration-300
        hover:border-primary/50
        hover:bg-primary/10
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
    >
      {isLoading ? (
        <>
          <Loader2 size={20} className="animate-spin" />
          Logging in as Admin...
        </>
      ) : (
        <>
          <ShieldCheck size={20} />
       Login as admin for testing
        </>
      )}
    </button>
  );
}
