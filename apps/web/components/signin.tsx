'use client'

import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { signOut } from "@/lib/auth-client";
import { redirect } from "next/navigation";

export function SignIn() {
  // where user clicks button redirect to sign in page
  return (
    <Button
      type="submit"
      variant="ghost"
      className="cursor-pointer text-white/80 hover:bg-white/10 hover:text-white"
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
      onClick={async () => await signOut({
        fetchOptions: {
          onSuccess: () => {
            redirect("/");
          }
        }
      })}
      type="submit"
      variant="ghost"
      className="cursor-pointer text-white/80 hover:bg-white/10 hover:text-white"
    >
      Sign Out
    </Button>
  );
}
