import { NotificationEventType } from "@zharfa/database";

export type TemplateContext = {
  displayName?: string;
  subject?: string;
  courseTitle?: string;
  ticketId?: string;
  statusLabel?: string;
  orderId?: string;
  detail?: string;
};

export type RenderedTemplate = {
  templateKey: string;
  title: string;
  body: string;
  emailSubject: string;
  emailBody: string;
  smsBody: string;
};

const TEMPLATES: Record<
  NotificationEventType,
  (ctx: TemplateContext) => Omit<RenderedTemplate, "templateKey">
> = {
  [NotificationEventType.USER_REGISTERED]: (ctx) => ({
    title: "خوش آمدید به ژرفا",
    body: `${ctx.displayName ?? "کاربر"} عزیز، ثبت‌نام شما انجام شد.`,
    emailSubject: "ثبت‌نام در ژرفا",
    emailBody: `سلام ${ctx.displayName ?? ""},\n\nحساب شما در ژرفا ساخته شد. از پنل دانشجو می‌توانید دوره‌ها را ببینید.`,
    smsBody: `ژرفا: ثبت‌نام ${ctx.displayName ?? "شما"} موفق بود.`,
  }),
  [NotificationEventType.ORDER_PAID]: (ctx) => ({
    title: "پرداخت تأیید شد",
    body: `پرداخت سفارش${ctx.courseTitle ? ` «${ctx.courseTitle}»` : ""} تأیید شد.`,
    emailSubject: "تأیید پرداخت ژرفا",
    emailBody: `پرداخت شما${ctx.courseTitle ? ` برای دوره «${ctx.courseTitle}»` : ""} پس از verify درگاه تأیید شد.${ctx.orderId ? `\nشناسه سفارش: ${ctx.orderId}` : ""}`,
    smsBody: `ژرفا: پرداخت تأیید شد${ctx.courseTitle ? ` — ${ctx.courseTitle}` : ""}.`,
  }),
  [NotificationEventType.ORDER_FAILED]: (ctx) => ({
    title: "پرداخت ناموفق",
    body: `پرداخت سفارش${ctx.courseTitle ? ` «${ctx.courseTitle}»` : ""} ناموفق بود.`,
    emailSubject: "پرداخت ناموفق ژرفا",
    emailBody: `پرداخت شما تکمیل نشد.${ctx.detail ? `\n${ctx.detail}` : ""}\nمی‌توانید دوباره از صفحه دوره تلاش کنید.`,
    smsBody: `ژرفا: پرداخت ناموفق بود.`,
  }),
  [NotificationEventType.ACCESS_PROVISIONED]: (ctx) => ({
    title: "دسترسی دوره آماده شد",
    body: `لایسنس اسپات‌پلیر${ctx.courseTitle ? ` برای «${ctx.courseTitle}»` : ""} صادر شد.`,
    emailSubject: "صدور لایسنس اسپات‌پلیر",
    emailBody: `لایسنس دوره${ctx.courseTitle ? ` «${ctx.courseTitle}»` : ""} پس از پاسخ اسپات‌پلیر صادر شد. از پنل → دسترسی دوره‌ها کلید را ببینید.`,
    smsBody: `ژرفا: لایسنس دوره آماده شد.`,
  }),
  [NotificationEventType.ACCESS_PROVISION_FAILED]: (ctx) => ({
    title: "صدور لایسنس ناموفق",
    body: `صدور لایسنس${ctx.courseTitle ? ` «${ctx.courseTitle}»` : ""} ناموفق بود.`,
    emailSubject: "خطا در صدور لایسنس",
    emailBody: `درخواست لایسنس اسپات‌پلیر ناموفق ماند.${ctx.detail ? `\n${ctx.detail}` : ""}\nپرداخت در صورت انجام‌شده محفوظ است؛ پشتیبانی پیگیری می‌کند.`,
    smsBody: `ژرفا: صدور لایسنس ناموفق — پشتیبانی پیگیری می‌کند.`,
  }),
  [NotificationEventType.TICKET_CREATED]: (ctx) => ({
    title: "تیکت ثبت شد",
    body: `تیکت «${ctx.subject ?? "پشتیبانی"}» ثبت شد.`,
    emailSubject: "ثبت تیکت پشتیبانی ژرفا",
    emailBody: `تیکت شما با موضوع «${ctx.subject ?? ""}» ثبت شد.${ctx.ticketId ? `\nشناسه: ${ctx.ticketId}` : ""}`,
    smsBody: `ژرفا: تیکت پشتیبانی ثبت شد.`,
  }),
  [NotificationEventType.TICKET_REPLY]: (ctx) => ({
    title: "پاسخ جدید تیکت",
    body: `پاسخ جدیدی برای تیکت «${ctx.subject ?? "پشتیبانی"}» ثبت شد.`,
    emailSubject: "پاسخ تیکت پشتیبانی",
    emailBody: `پاسخ جدیدی روی تیکت «${ctx.subject ?? ""}» ثبت شد. از پنل → پشتیبانی مشاهده کنید.`,
    smsBody: `ژرفا: پاسخ جدید روی تیکت شما.`,
  }),
  [NotificationEventType.TICKET_STATUS_CHANGED]: (ctx) => ({
    title: "وضعیت تیکت تغییر کرد",
    body: `وضعیت تیکت «${ctx.subject ?? ""}» به ${ctx.statusLabel ?? "جدید"} تغییر کرد.`,
    emailSubject: "تغییر وضعیت تیکت",
    emailBody: `وضعیت تیکت «${ctx.subject ?? ""}» به «${ctx.statusLabel ?? ""}» تغییر کرد.`,
    smsBody: `ژرفا: وضعیت تیکت → ${ctx.statusLabel ?? ""}`,
  }),
  [NotificationEventType.SECURITY_RECOVERY_REQUESTED]: (ctx) => ({
    title: "درخواست بازیابی رمز",
    body: "درخواست بازیابی رمز عبور برای حساب شما ثبت شد.",
    emailSubject: "درخواست بازیابی رمز ژرفا",
    emailBody: `اگر این درخواست از طرف شما نبوده، رمز را تغییر دهید و با پشتیبانی تماس بگیرید.${ctx.detail ? `\n${ctx.detail}` : ""}`,
    smsBody: `ژرفا: درخواست بازیابی رمز ثبت شد.`,
  }),
  [NotificationEventType.SECURITY_PASSWORD_CHANGED]: (ctx) => ({
    title: "رمز عبور تغییر کرد",
    body: "رمز عبور حساب شما با موفقیت تغییر کرد.",
    emailSubject: "تغییر رمز عبور ژرفا",
    emailBody: `رمز عبور حساب شما تغییر کرد. اگر این کار را شما انجام نداده‌اید فوراً بازیابی را دوباره اجرا کنید.`,
    smsBody: `ژرفا: رمز عبور تغییر کرد.`,
  }),
};

export function renderTemplate(
  eventType: NotificationEventType,
  ctx: TemplateContext = {},
): RenderedTemplate {
  const rendered = TEMPLATES[eventType](ctx);
  return {
    templateKey: `notify.${eventType.toLowerCase()}`,
    ...rendered,
  };
}

export function ticketStatusLabelFa(status: string): string {
  switch (status) {
    case "OPEN":
      return "باز";
    case "IN_PROGRESS":
      return "در حال رسیدگی";
    case "WAITING_FOR_USER":
      return "در انتظار پاسخ شما";
    case "RESOLVED":
      return "حل‌شده";
    case "CLOSED":
      return "بسته";
    default:
      return status;
  }
}
