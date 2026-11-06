import { TicketStatus } from "@zharfa/database";

/**
 * Allowed ticket status transitions.
 * Student replies from WAITING_FOR_USER auto-move toward IN_PROGRESS in service.
 */
const TICKET_TRANSITIONS: Record<TicketStatus, readonly TicketStatus[]> = {
  [TicketStatus.OPEN]: [
    TicketStatus.IN_PROGRESS,
    TicketStatus.WAITING_FOR_USER,
    TicketStatus.RESOLVED,
    TicketStatus.CLOSED,
  ],
  [TicketStatus.IN_PROGRESS]: [
    TicketStatus.WAITING_FOR_USER,
    TicketStatus.RESOLVED,
    TicketStatus.CLOSED,
    TicketStatus.OPEN,
  ],
  [TicketStatus.WAITING_FOR_USER]: [
    TicketStatus.IN_PROGRESS,
    TicketStatus.RESOLVED,
    TicketStatus.CLOSED,
    TicketStatus.OPEN,
  ],
  [TicketStatus.RESOLVED]: [TicketStatus.CLOSED, TicketStatus.OPEN],
  [TicketStatus.CLOSED]: [TicketStatus.OPEN],
};

export function canTransitionTicket(
  from: TicketStatus,
  to: TicketStatus,
): boolean {
  if (from === to) return true;
  return TICKET_TRANSITIONS[from].includes(to);
}

export function assertTicketTransition(
  from: TicketStatus,
  to: TicketStatus,
): void {
  if (!canTransitionTicket(from, to)) {
    throw new Error(`Invalid ticket status transition: ${from} → ${to}`);
  }
}

export function isTicketTerminal(status: TicketStatus): boolean {
  return status === TicketStatus.CLOSED;
}

export function allowedTransitionsFrom(
  from: TicketStatus,
): readonly TicketStatus[] {
  return TICKET_TRANSITIONS[from];
}
