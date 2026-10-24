import { ofetch } from "ofetch";

// §0–§1: single API client. baseURL = NEXT_PUBLIC_API_URL (…/api/v1),
// every request sends cookies (`credentials: "include"`).
// Envelope: { success, statusCode, message, data, meta? } — error shows success:false + message.
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000/api/v1";

// Token fallback: backend sets HttpOnly cookies, but if the browser drops
// them (port/host mismatch, CORS), we also carry the accessToken ourselves.
// Backend auth() accepts `Authorization: Bearer <token>` too.
const ACCESS_KEY = "accessToken";

export function saveAccessToken(token?: string | null) {
  try {
    if (typeof window === "undefined") return;
    if (token) localStorage.setItem(ACCESS_KEY, token);
  } catch { /* ignore */ }
}

export function clearAccessToken() {
  try {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_KEY);
  } catch { /* ignore */ }
}

function getAccessToken(): string | null {
  try {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_KEY);
  } catch {
    return null;
  }
}

/** Pull tokens out of a login/register/verify envelope and keep them. */
export function saveAuthFromResponse(res: unknown) {
  const data = (res as { data?: { accessToken?: string } } | null)?.data;
  if (data?.accessToken) saveAccessToken(data.accessToken);
}

const apiClient = ofetch.create({
  baseURL: BASE_URL,
  credentials: "include",
  onRequest({ options }) {
    const token = getAccessToken();
    if (token) {
      options.headers = new Headers(options.headers as HeadersInit);
      (options.headers as Headers).set("Authorization", `Bearer ${token}`);
    }
  },
});

/** Extract a human-readable message from an ofetch FetchError. */
export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  const err = error as {
    data?: { message?: string | string[]; success?: boolean };
    response?: { status?: number };
    status?: number;
    message?: string;
  };
  const msg = err?.data?.message;
  if (Array.isArray(msg)) return msg.join(", ");
  if (typeof msg === "string" && msg.length > 0) return msg;
  if (typeof err?.message === "string" && err.message.length > 0) {
    // ofetch FetchError message includes status text — prefer it over blank fallback.
    if (/^(fetch failed|network)/i.test(err.message)) return fallback;
    return err.message;
  }
  return fallback;
}

/** HTTP status from an ofetch FetchError (401/402/403/404/409 gates in §1–§2). */
export function getApiErrorStatus(error: unknown): number | undefined {
  const err = error as { status?: number; response?: { status?: number } };
  return err?.status ?? err?.response?.status;
}

/**
 * Easy PDF download through the shared client (keeps cookies + baseURL).
 *
 * A failed request comes back as a JSON error, but `responseType: "blob"`
 * turns it into a Blob — saving that as a .pdf would hand the user a corrupt
 * file and no explanation at all. So the error body is read back and
 * re-thrown as a normal error carrying the server's message.
 */
export async function downloadBlobFile(path: string, filename: string) {
  let blob: Blob;
  try {
    blob = (await apiClient(path, {
      responseType: "blob",
    } as never)) as unknown as Blob;
  } catch (error) {
    throw await toReadableDownloadError(error);
  }

  // Defensive: some servers answer 200 with a JSON body.
  if (blob.type && !blob.type.includes("pdf")) {
    throw await toReadableDownloadError(
      new Blob([await blob.text()], { type: "application/json" }),
    );
  }

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

/** Unwrap a blob/JSON error body into an Error that carries the server message. */
async function toReadableDownloadError(error: unknown): Promise<Error> {
  const err = error as {
    data?: unknown;
    status?: number;
    response?: { status?: number };
    message?: string;
  };

  let body: unknown = err?.data;
  if (body instanceof Blob) {
    const text = await body.text();
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  const message =
    (body as { message?: string } | undefined)?.message ??
    (typeof body === "string" && body.length > 0 ? body : undefined) ??
    err?.message ??
    "Download failed.";

  const wrapped = new Error(message) as Error & { status?: number; data?: unknown };
  wrapped.status = err?.status ?? err?.response?.status;
  wrapped.data = body;
  return wrapped;
}

export default apiClient;