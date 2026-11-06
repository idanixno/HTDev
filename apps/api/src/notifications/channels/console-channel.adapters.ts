import { Injectable, Logger } from "@nestjs/common";

export type OutboundEmail = {
  to: string;
  subject: string;
  body: string;
};

export type OutboundSms = {
  to: string;
  body: string;
};

export interface EmailChannelAdapter {
  send(message: OutboundEmail): Promise<void>;
}

export interface SmsChannelAdapter {
  send(message: OutboundSms): Promise<void>;
}

export const EMAIL_CHANNEL = Symbol("EMAIL_CHANNEL");
export const SMS_CHANNEL = Symbol("SMS_CHANNEL");

/**
 * Dev/console email adapter — logs instead of calling a real provider.
 * Used when SMTP / ESP credentials are absent.
 */
@Injectable()
export class ConsoleEmailAdapter implements EmailChannelAdapter {
  private readonly logger = new Logger("Notify/Email/Console");

  async send(message: OutboundEmail): Promise<void> {
    this.logger.log(
      `[EMAIL → ${message.to}] ${message.subject}\n${message.body}`,
    );
  }
}

/**
 * Dev/console SMS adapter — logs instead of calling a real SMS gateway.
 */
@Injectable()
export class ConsoleSmsAdapter implements SmsChannelAdapter {
  private readonly logger = new Logger("Notify/SMS/Console");

  async send(message: OutboundSms): Promise<void> {
    this.logger.log(`[SMS → ${message.to}] ${message.body}`);
  }
}
