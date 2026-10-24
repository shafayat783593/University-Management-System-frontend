import { GraduationCap, LoaderCircle } from "lucide-react";

export default function AuthLoading({
  label = "Verifying account",
}: {
  label?: string;
}) {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-4 bg-gradient-to-b from-muted/50 via-background to-background px-4">
      <span className="relative grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
        <GraduationCap className="size-7" />
        <span className="absolute -inset-1.5 animate-ping rounded-2xl bg-primary/20" aria-hidden />
      </span>
      <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin text-primary" />
        {label}…
      </p>
    </div>
  );
}
