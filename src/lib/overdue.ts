import { FetchError } from "ofetch";

export function isOverdueError(error: unknown): boolean {
  if (!(error instanceof FetchError)) return false;
  if (error.status !== 403) return false;
  const message = (error.data as { message?: unknown } | undefined)?.message;
  return typeof message === "string" && message.startsWith("Overdue payment");
}

export function getOverdueMessage(error: unknown): string {
  if (error instanceof FetchError) {
    const message = (error.data as { message?: unknown } | undefined)?.message;
    if (typeof message === "string") return message;
  }
  return "";
}