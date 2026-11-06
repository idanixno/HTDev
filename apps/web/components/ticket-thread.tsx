"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Badge, Button, Notice } from "@zharfa/ui";
import { authFetch } from "../lib/api-client";
import {
  ticketStatusBadge,
  ticketStatusLabel,
  type PublicTicket,
  type TicketStatus,
} from "../lib/ticket-shared";

export function TicketThread({
  ticket,
  isAdmin,
}: {
  ticket: PublicTicket;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onReply(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await authFetch(`/api/tickets/${ticket.id}/reply`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      setBody("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ارسال پاسخ ناموفق بود.");
    } finally {
      setPending(false);
    }
  }

  async function onStatus(status: TicketStatus) {
    setError(null);
    setPending(true);
    try {
      await authFetch(`/api/tickets/${ticket.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تغییر وضعیت ناموفق بود.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="ticket-thread">
      <header className="ticket-thread__head">
        <div>
          <h1 className="ticket-thread__title">{ticket.subject}</h1>
          <p className="ticket-thread__meta">
            {ticket.course ? (
              <>
                دوره: {ticket.course.title} ·{" "}
              </>
            ) : null}
            {new Date(ticket.createdAt).toLocaleString("fa-IR")}
            {ticket.telegramRef ? ` · تلگرام: ${ticket.telegramRef}` : null}
          </p>
        </div>
        <Badge status={ticketStatusBadge(ticket.status)}>
          {ticketStatusLabel(ticket.status)}
        </Badge>
      </header>

      {error ? (
        <Notice tone="error" title="خطا">
          {error}
        </Notice>
      ) : null}

      <div className="ticket-thread__messages">
        {(ticket.messages ?? []).map((m) => (
          <article
            key={m.id}
            className={
              "ticket-msg" +
              (m.authorRole === "ADMIN" ? " ticket-msg--admin" : "")
            }
          >
            <header>
              <strong>
                {m.authorRole === "ADMIN"
                  ? "پشتیبانی"
                  : (m.author?.displayName ?? "دانشجو")}
              </strong>
              <time dateTime={m.createdAt}>
                {new Date(m.createdAt).toLocaleString("fa-IR")}
              </time>
            </header>
            <p>{m.body}</p>
            {m.attachments?.length ? (
              <ul className="ticket-msg__files">
                {m.attachments.map((a) => (
                  <li key={a.id}>{a.fileName}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>

      {ticket.status !== "CLOSED" ? (
        <form className="ticket-form" onSubmit={onReply}>
          <label className="ticket-form__label" htmlFor="reply-body">
            پاسخ
          </label>
          <textarea
            id="reply-body"
            className="ticket-form__textarea"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            rows={4}
          />
          <Button type="submit" variant="primary" disabled={pending}>
            {pending ? "…" : "ارسال پاسخ"}
          </Button>
        </form>
      ) : (
        <Notice tone="information" title="بسته شده">
          این تیکت بسته است. در صورت نیاز می‌توانید بازگشایی کنید.
        </Notice>
      )}

      {ticket.allowedTransitions.length > 0 ? (
        <div className="ticket-thread__actions">
          <p>{isAdmin ? "تغییر وضعیت (ادمین)" : "اقدامات مجاز"}</p>
          <div className="ticket-thread__btns">
            {ticket.allowedTransitions.map((s) => (
              <Button
                key={s}
                type="button"
                variant="secondary"
                disabled={pending}
                onClick={() => onStatus(s)}
              >
                {ticketStatusLabel(s)}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
