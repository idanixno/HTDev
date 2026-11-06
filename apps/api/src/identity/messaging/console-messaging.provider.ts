import { Injectable, Logger } from "@nestjs/common";
import type {
  EmailMessage,
  MessagingProvider,
  SmsMessage,
} from "./messaging.types";

/**
 * Dev/console messaging adapter.
 * Logs OTP / recovery messages instead of calling real SMS/email gateways.
 * Swap via MESSAGING_PROVIDER DI token when real providers exist.
 */
@Injectable()
export class ConsoleMessagingProvider implements MessagingProvider {
  private readonly logger = new Logger("Messaging/Console");

  async sendEmail(message: EmailMessage): Promise<void> {
    this.logger.log(
      `[EMAIL → ${message.to}] ${message.subject}\n${message.body}`,
    );
  }

  async sendSms(message: SmsMessage): Promise<void> {
    this.logger.log(`[SMS → ${message.to}] ${message.body}`);
  }
}
