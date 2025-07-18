'use client'

import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { signOut } from "@/lib/auth-client";

export function SignIn() {
  // where user clicks button redirect to sign in page
  return (
    <Button
      type="submit"
      variant="ghost"
      className="text-white/70 hover:text-white hover:bg-white/5 cursor-pointer"
    >
      <Link href={"/signin"}>
        Sign In
      </Link>
    </Button>
  );
}

export function SignOut() {
  return (
    <Button
      onClick={async () => await signOut()}
      type="submit"
      variant="ghost"
      className="text-white/70 hover:text-white hover:bg-white/5 cursor-pointer"
    >
      Sign Out
    </Button>
  );
}
