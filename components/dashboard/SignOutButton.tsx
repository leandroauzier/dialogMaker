"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "@/components/icons";

export default function SignOutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/login" })} className="btn btn-secondary">
      <LogOut size={14} /> Sair
    </button>
  );
}
