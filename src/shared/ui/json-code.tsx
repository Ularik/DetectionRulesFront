import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

// JSON с номерами строк и подсветкой ключей/строк — блоки «Исходное событие» и «Результат» в макете
const TOKEN_RE = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;

function highlight(line: string) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of line.matchAll(TOKEN_RE)) {
    const index = match.index ?? 0;
    if (index > last) parts.push(line.slice(last, index));
    const [token, str, colon, literal, num] = match;
    if (str) {
      parts.push(
        <span key={index} className={colon ? "text-[#c2410c]" : "text-[#047857]"}>
          {str}
        </span>,
      );
      if (colon) parts.push(colon);
    } else if (literal) {
      parts.push(<span key={index} className="text-[#7c3aed]">{literal}</span>);
    } else if (num) {
      parts.push(<span key={index} className="text-[#1067c2]">{num}</span>);
    } else {
      parts.push(token);
    }
    last = index + token.length;
  }
  if (last < line.length) parts.push(line.slice(last));
  return parts;
}

export function JsonCode({ value, className }: { value: unknown; className?: string }) {
  const lines = (typeof value === "string" ? value : JSON.stringify(value, null, 2)).split("\n");
  return (
    <pre
      className={cn(
        "overflow-auto rounded-lg border border-line-muted bg-surface-muted py-2 font-mono text-[11px] leading-[18px] text-ink",
        className,
      )}
    >
      {lines.map((line, index) => (
        <div key={index} className="flex">
          <span className="w-8 shrink-0 pr-3 text-right text-ink-muted select-none">{index + 1}</span>
          <span className="whitespace-pre">{highlight(line)}</span>
        </div>
      ))}
    </pre>
  );
}
