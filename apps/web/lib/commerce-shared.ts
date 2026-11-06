export type GatewayView = {
  provider: "ZARINPAL" | "AQAYE_PARDAKHT";
  integrationStatus:
    | "IMPLEMENTED"
    | "IMPLEMENTED_BUT_CREDENTIALS_REQUIRED"
    | "DISABLED";
  technicalEnabled: boolean;
  checkoutVisible: boolean;
  isDefault: boolean;
  sandboxMode: boolean;
  credentialsStatus: "MISSING" | "PRESENT";
  usableAtCheckout: boolean;
};

export type CheckoutOptions = {
  course: {
    id: string;
    slug: string;
    title: string;
    offerKind: string;
    priceToman: number;
    priceLabel: string;
  };
  gateways: GatewayView[];
  purchaseEnabled: boolean;
  integrationNote: string | null;
};

export type PublicOrder = {
  id: string;
  status: string;
  paymentProvider: string | null;
  course: {
    id: string;
    slug: string;
    title: string;
    coverAsset: string | null;
    href: string;
  };
  listPriceToman: number;
  discountToman: number;
  amountToman: number;
  listPriceLabel: string;
  discountLabel: string | null;
  amountLabel: string;
  couponCode: string | null;
  paidAt: string | null;
  createdAt: string;
  latestTransaction: {
    id: string;
    status: string;
    provider: string;
    gatewayRefId: string | null;
    failureReason: string | null;
  } | null;
};

export function orderStatusLabel(status: string): string {
  switch (status) {
    case "PENDING":
      return "در انتظار";
    case "AWAITING_GATEWAY":
      return "در انتظار پرداخت";
    case "PAID":
      return "پرداخت‌شده";
    case "FAILED":
      return "ناموفق";
    case "CANCELED":
      return "لغوشده";
    case "REFUNDED":
      return "بازپرداخت";
    default:
      return status;
  }
}

export function providerLabel(provider: string | null): string {
  if (provider === "ZARINPAL") return "زرین‌پال";
  if (provider === "AQAYE_PARDAKHT") return "آقای پرداخت";
  return "—";
}
