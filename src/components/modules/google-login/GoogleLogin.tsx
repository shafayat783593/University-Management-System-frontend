"use client";

import { toast } from "sonner";
import { useGoogleOAuth, ME_QUERY_KEY } from "@/hooks";
import { getMe } from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";

export default function GoogleLoginComponent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { mutate: googleLogin } = useGoogleOAuth();

  const handleGoogleSuccess = (credentialResponse: { credential?: string }) => {
    const idToken = credentialResponse.credential;

    if (!idToken) {
      toast.error("Google OAuth Failed", { description: "Something went wrong. Please try again" });
      return;
    }

    googleLogin(
      { idToken },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
          let home = "/";
          try {
            const me = await getMe();
            const role = me.data?.role;
            home =
              role === "STUDENT"
                ? "/student"
                : role === "INSTRUCTOR"
                  ? "/instructor"
                  : role === "ADMIN" || role === "SUPERADMIN"
                    ? "/admin/dashboard"
                    : "/";
          } catch {
            home = "/";
          }
          toast.success("Logged in Successfully", { description: "Welcome back" });
          router.push(home);
        },
        onError: (err) => {
          toast.error("Google OAuth Failed", { description: err.message || "Something went wrong. Please try again" });
        },
      },
    );
  };

  const handleGoogleError = () => {
    toast.error("Google OAuth Failed", { description: "Something went wrong. Please try again" });
  };

  return (
    <GoogleLogin
      theme="outline"
      shape="pill"
      text="continue_with"
      onSuccess={handleGoogleSuccess}
      onError={handleGoogleError}
    />
  );
}