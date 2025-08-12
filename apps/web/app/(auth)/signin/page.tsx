'use client'


import { Button } from "@workspace/ui/components/button";
import { signIn } from "@/lib/auth-client";
import { checkPremium } from "@/utils/utils";

export default function SignInPage() {

  async function handeSignIn(event: React.MouseEvent<HTMLButtonElement>) {
    event?.preventDefault()

    await signIn.social(
      {
        provider: "spotify",
        callbackURL: "/room",
      }
    )

  }


  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Sign In</h1>
          <Button onClick={handeSignIn} type="submit" className="btn btn-primary">
            Sign in with Spotify
          </Button>
      </div>
    </div>
  );
}
