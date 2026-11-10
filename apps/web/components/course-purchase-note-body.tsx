import Link from "next/link";
import type { ReactNode } from "react";

/** Renders note body with optional markdown links `[label](/path)`. */
export function CoursePurchaseNoteBody({ body }: { body: string }) {
  const nodes: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = re.exec(body)) !== null) {
    if (match.index > last) {
      nodes.push(body.slice(last, match.index));
    }
    const href = match[2]!;
    const label = match[1]!;
    const internal = href.startsWith("/");
    nodes.push(
      internal ? (
        <Link key={`n-${key++}`} href={href}>
          {label}
        </Link>
      ) : (
        <a key={`n-${key++}`} href={href} rel="noopener noreferrer">
          {label}
        </a>
      ),
    );
    last = match.index + match[0].length;
  }

  if (last < body.length) {
    nodes.push(body.slice(last));
  }

  return <>{nodes}</>;
}
