import { isAxiosError } from "axios";

// Достаёт человекочитаемое сообщение из ошибки axios (detail/message/error) или Error
export function getErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    const responseData: unknown = error.response?.data;

    if (typeof responseData === "string" && responseData.trim()) {
      return responseData;
    }

    if (responseData && typeof responseData === "object") {
      const data = responseData as Record<string, unknown>;
      for (const key of ["detail", "message", "error"]) {
        const message = data[key];
        if (typeof message === "string" && message.trim()) return message;
      }
    }

    if (!error.response && error.message) return error.message;
    return fallback;
  }

  return error instanceof Error && error.message ? error.message : fallback;
}
