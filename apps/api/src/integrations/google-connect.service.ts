import { Injectable } from "@nestjs/common";
import { IntegrationsService } from "./integrations.service";

/**
 * Honest Google Search Console / GA4 connect surface.
 * No synthetic metrics. Without OAuth client credentials → NOT_CONFIGURED.
 * With credentials but no linked property tokens → NOT_CONNECTED.
 */
@Injectable()
export class GoogleConnectService {
  constructor(private readonly integrations: IntegrationsService) {}

  async status() {
    const client = await this.integrations.resolveGoogleOAuthClient();
    const view = await this.integrations.get(
      // enum import inline to avoid circular issues in barrel
      (await import("@zharfa/database")).IntegrationProvider.GOOGLE_OAUTH,
    );

    if (!client) {
      return {
        code: "NOT_CONFIGURED" as const,
        message:
          "ابتدا Client ID و Client Secret گوگل را در یکپارچه‌سازی‌ها ذخیره کنید.",
        credentialsPresent: false,
        connected: false,
        metrics: null,
      };
    }

    if (!view.oauthConnected) {
      return {
        code: "NOT_CONNECTED" as const,
        message:
          "اعتبارنامه OAuth آماده است. اتصال ملک Search Console/GA4 هنوز انجام نشده.",
        credentialsPresent: true,
        connected: false,
        connectPath: "/admin/seo/google",
        metrics: null,
      };
    }

    return {
      code: "CONNECTED" as const,
      message: "حساب گوگل متصل است.",
      credentialsPresent: true,
      connected: true,
      // Real metrics would be fetched here after OAuth connect — never fabricated.
      metrics: null,
      note: "همگام‌سازی داده پس از اتصال فعال می‌شود.",
    };
  }

  /** Placeholder start URL builder — requires credentials. */
  async buildAuthorizeUrl(redirectUri: string): Promise<
    | { code: "NOT_CONFIGURED"; message: string }
    | { code: "READY"; authorizeUrl: string }
  > {
    const client = await this.integrations.resolveGoogleOAuthClient();
    if (!client) {
      return {
        code: "NOT_CONFIGURED",
        message: "OAuth client پیکربندی نشده است.",
      };
    }
    const scopes = [
      "https://www.googleapis.com/auth/webmasters.readonly",
      "https://www.googleapis.com/auth/analytics.readonly",
    ].join(" ");
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", client.clientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");
    url.searchParams.set("scope", scopes);
    return { code: "READY", authorizeUrl: url.toString() };
  }
}
