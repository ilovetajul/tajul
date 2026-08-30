"use client";
import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-400 hover:bg-white/10"
    >
      Log Out
    </button>
  );
}
