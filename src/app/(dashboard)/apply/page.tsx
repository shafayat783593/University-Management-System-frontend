import { redirect } from "next/navigation";

// Old path kept as an alias — Task 10B canonical path is /complete-profile.
export default function ApplyPage() {
  redirect("/complete-profile");
}
