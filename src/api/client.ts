import axios, { type AxiosError } from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "https://localhost:7226";

// Temporary debug log: confirms the API base URL baked into the build (visible in DevTools).
console.log("VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Temporary debug log: prints the final URL of every outgoing API request.
apiClient.interceptors.request.use((config) => {
  console.log("API request:", `${config.baseURL ?? ""}${config.url ?? ""}`);
  return config;
});

/** Resolves a possibly-relative media path from the API to an absolute, openable URL. */
export function resolveMediaUrl(mediaUrl: string | undefined | null): string {
  if (!mediaUrl) return "";
  if (/^https?:\/\//i.test(mediaUrl)) return mediaUrl;
  return `${baseURL.replace(/\/+$/, "")}/${mediaUrl.replace(/^\/+/, "")}`;
}

/** Builds the URL that streams a stored file back with its original name (proper download). */
export function getMediaDownloadUrl(mediaUrl: string | undefined | null): string {
  if (!mediaUrl) return "";
  const fileName = mediaUrl.split("/").pop() ?? "";
  return `${baseURL.replace(/\/+$/, "")}/api/whatsapp/media/${encodeURIComponent(fileName)}`;
}

/** Shape of ASP.NET Core's default ValidationProblemDetails (400) response. */
export type ValidationProblemDetails = {
  title?: string;
  status?: number;
  errors?: Record<string, string[]>;
  detail?: string;
};

/** Extracts a human-readable message from any Axios/API error for display in toasts. */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ValidationProblemDetails | { message?: string; error?: string }>;
    const data = axiosError.response?.data;

    if (data && typeof data === "object") {
      if ("errors" in data && data.errors) {
        const messages = Object.values(data.errors).flat();
        if (messages.length > 0) return messages.join(" ");
      }
      if ("detail" in data && data.detail) return data.detail;
      if ("title" in data && data.title) return data.title;
      if ("error" in data && data.error) return data.error as string;
      if ("message" in data && data.message) return data.message as string;
    }

    if (axiosError.response?.status === 403) {
      return "You are not authorized to perform this action.";
    }
    if (axiosError.response?.status === 404) return "The requested resource was not found.";
    if (axiosError.code === "ERR_NETWORK") {
      return "Could not reach the API. Check that the backend is running and VITE_API_BASE_URL is correct.";
    }
    return axiosError.message || "An unexpected error occurred.";
  }

  if (error instanceof Error) return error.message;
  return "An unexpected error occurred.";
}
