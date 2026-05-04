'use client'

import { Button } from "@workspace/ui/components/button";
import { signIn } from "@/lib/auth-client";
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
        provider: "google",
        callbackURL: "/room",
      }
    )

  }


  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Welcome to Muzi</h1>
          <p className="text-sm text-white/60">Sign in to create or join a room.</p>
        </div>
        <Button onClick={handeSignIn} type="submit" className="w-full rounded-full bg-white text-black hover:bg-white/90">
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}
