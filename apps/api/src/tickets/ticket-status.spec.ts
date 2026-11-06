import { describe, expect, it } from "vitest";
import { TicketStatus } from "@zharfa/database";
import {
  assertTicketTransition,
  canTransitionTicket,
  isTicketTerminal,
  allowedTransitionsFrom,
} from "./ticket-status";

describe("ticket status transitions", () => {
  it("allows OPEN → IN_PROGRESS / WAITING_FOR_USER / RESOLVED / CLOSED", () => {
    expect(canTransitionTicket(TicketStatus.OPEN, TicketStatus.IN_PROGRESS)).toBe(
      true,
    );
    expect(
      canTransitionTicket(TicketStatus.OPEN, TicketStatus.WAITING_FOR_USER),
    ).toBe(true);
    expect(canTransitionTicket(TicketStatus.OPEN, TicketStatus.RESOLVED)).toBe(
      true,
    );
    expect(canTransitionTicket(TicketStatus.OPEN, TicketStatus.CLOSED)).toBe(
      true,
    );
  });

  it("allows WAITING_FOR_USER → IN_PROGRESS (student replied)", () => {
    expect(
      canTransitionTicket(
        TicketStatus.WAITING_FOR_USER,
        TicketStatus.IN_PROGRESS,
      ),
    ).toBe(true);
  });

  it("allows reopen CLOSED → OPEN only", () => {
    expect(canTransitionTicket(TicketStatus.CLOSED, TicketStatus.OPEN)).toBe(
      true,
    );
    expect(
      canTransitionTicket(TicketStatus.CLOSED, TicketStatus.IN_PROGRESS),
    ).toBe(false);
    expect(allowedTransitionsFrom(TicketStatus.CLOSED)).toEqual([
      TicketStatus.OPEN,
    ]);
  });

  it("forbids CLOSED → RESOLVED", () => {
    expect(canTransitionTicket(TicketStatus.CLOSED, TicketStatus.RESOLVED)).toBe(
      false,
    );
    expect(() =>
      assertTicketTransition(TicketStatus.CLOSED, TicketStatus.RESOLVED),
    ).toThrow(/Invalid ticket status transition/);
  });

  it("forbids RESOLVED → WAITING_FOR_USER", () => {
    expect(
      canTransitionTicket(TicketStatus.RESOLVED, TicketStatus.WAITING_FOR_USER),
    ).toBe(false);
  });

  it("treats same status as no-op ok", () => {
    expect(
      canTransitionTicket(
        TicketStatus.IN_PROGRESS,
        TicketStatus.IN_PROGRESS,
      ),
    ).toBe(true);
  });

  it("marks CLOSED terminal", () => {
    expect(isTicketTerminal(TicketStatus.CLOSED)).toBe(true);
    expect(isTicketTerminal(TicketStatus.RESOLVED)).toBe(false);
  });
});
