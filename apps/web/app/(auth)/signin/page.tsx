'use client'

import { Button } from "@workspace/ui/components/button";
import { signIn } from "@/lib/auth-client";
import { createAuthClient } from "better-auth/react";
// import { checkPremium } from "@/utils/utils";
import { getSession } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export default function SignInPage() {

    const session =  useSession();


    if(session.data){
      redirect('/room');
    } 


  // signin in and redirect to /room 
  
  async function handeSignIn(event: React.MouseEvent<HTMLButtonElement>) {
    event?.preventDefault()

    await signIn.social(
      {
        provider: "spotify",
        callbackURL: "/room",
      }
    )

  }

  async function handeSignIn2(event: React.MouseEvent<HTMLButtonElement>) {
    event?.preventDefault()

    await signIn.social(
      {
        provider: "github",
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
          <Button onClick={handeSignIn2} type="submit" className="btn btn-primary">
            Sign in with Github
          </Button>
      </div>
    </div>
  );
}
