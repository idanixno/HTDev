"use client";

import { useState } from "react";
import { Button, Notice } from "@zharfa/ui";
import type { AdminGateway } from "../../lib/admin";

export function PaymentGatewayAdminForm({
  gateways,
}: {
  gateways: AdminGateway[];
}) {
  const [items, setItems] = useState(gateways);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function save(provider: string, patch: Partial<AdminGateway>) {
    setBusy(provider);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/payments/gateways", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, ...patch }),
      });
      const data = (await res.json()) as {
        gateways?: AdminGateway[];
        message?: string | string[];
      };
      if (!res.ok) {
        const msg = Array.isArray(data.message)
          ? data.message.join("، ")
          : data.message;
        throw new Error(msg || "ذخیره ناموفق بود.");
      }
      if (data.gateways) setItems(data.gateways);
      setMessage(`تنظیمات ${provider} ذخیره شد.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="admin-panel" style={{ marginTop: "var(--zharfa-space-24)" }}>
      <h2>ویرایش پرچم‌ها</h2>
      {message ? (
        <Notice tone="success" title="ذخیره شد">
          {message}
        </Notice>
      ) : null}
      {error ? (
        <Notice tone="error" title="خطا">
          {error}
        </Notice>
      ) : null}
      <ul className="admin-gateway-forms">
        {items.map((g) => (
          <li key={g.provider} className="admin-gateway-forms__item">
            <h3>{g.provider}</h3>
            <label className="admin-check">
              <input
                type="checkbox"
                checked={g.technicalEnabled}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((x) =>
                      x.provider === g.provider
                        ? { ...x, technicalEnabled: e.target.checked }
                        : x,
                    ),
                  )
                }
              />
              فعال فنی
            </label>
            <label className="admin-check">
              <input
                type="checkbox"
                checked={g.checkoutVisible}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((x) =>
                      x.provider === g.provider
                        ? { ...x, checkoutVisible: e.target.checked }
                        : x,
                    ),
                  )
                }
              />
              نمایش در چک‌اوت
            </label>
            <label className="admin-check">
              <input
                type="checkbox"
                checked={g.isDefault}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((x) =>
                      x.provider === g.provider
                        ? { ...x, isDefault: e.target.checked }
                        : x,
                    ),
                  )
                }
              />
              پیش‌فرض
            </label>
            <label className="admin-check">
              <input
                type="checkbox"
                checked={g.sandboxMode}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((x) =>
                      x.provider === g.provider
                        ? { ...x, sandboxMode: e.target.checked }
                        : x,
                    ),
                  )
                }
              />
              سندباکس
            </label>
            <Button
              type="button"
              variant="secondary"
              disabled={busy === g.provider}
              onClick={() =>
                save(g.provider, {
                  technicalEnabled: g.technicalEnabled,
                  checkoutVisible: g.checkoutVisible,
                  isDefault: g.isDefault,
                  sandboxMode: g.sandboxMode,
                })
              }
            >
              {busy === g.provider ? "…" : "ذخیره"}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
