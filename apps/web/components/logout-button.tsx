"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@zharfa/ui";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="ghost" type="button" loading={loading} onClick={logout}>
      خروج
    </Button>
  );
}
