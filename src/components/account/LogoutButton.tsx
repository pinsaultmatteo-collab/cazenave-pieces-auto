"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/lib/account/client";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await logout();
        router.refresh();
      }}
      className="rounded-full border border-line px-5 py-2.5 text-sm font-bold text-ink transition hover:border-red-300 hover:text-red-600"
    >
      Me déconnecter
    </button>
  );
}
