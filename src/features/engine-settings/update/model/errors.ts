import { isAxiosError } from "axios";
import { getErrorMessage } from "@/shared/lib/errors";

// 422 от FastAPI приходит как detail: [{ loc, msg }] — собираем «поле: сообщение»
export function getEngineSettingsErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    const detail: unknown = (error.response?.data as { detail?: unknown } | undefined)?.detail;
    if (Array.isArray(detail) && detail.length) return describeIssues(detail);
  }
  return getErrorMessage(error, fallback);
}

function describeIssues(issues: unknown[]) {
  return issues
    .map((issue) => {
      if (typeof issue === "string") return issue;
      if (issue && typeof issue === "object") {
        const { loc, msg, message, field } = issue as Record<string, unknown>;
        const path = Array.isArray(loc) ? loc.filter((part) => part !== "body").join(".") : field;
        const text = typeof msg === "string" ? msg : typeof message === "string" ? message : JSON.stringify(issue);
        return path ? `${String(path)}: ${text}` : text;
      }
      return String(issue);
    })
    .join("; ");
}
