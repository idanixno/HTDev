export type EmailMessage = {
  to: string;
  subject: string;
  body: string;
};

export type SmsMessage = {
  to: string;
  body: string;
};

export interface MessagingProvider {
  sendEmail(message: EmailMessage): Promise<void>;
  sendSms(message: SmsMessage): Promise<void>;
}

export const MESSAGING_PROVIDER = Symbol("MESSAGING_PROVIDER");
