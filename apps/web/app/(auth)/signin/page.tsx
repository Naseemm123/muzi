'use client'


import { Button } from "@workspace/ui/components/button";
import { signIn } from "@/lib/auth-client";

export default function SignInPage() {

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event?.preventDefault()

    await signIn.social({
      provider: "spotify",
      callbackURL: "/room",
    });

  }
  
  async function handleClick2(event: React.MouseEvent<HTMLButtonElement>) {
    event?.preventDefault()

    await signIn.social({
      provider: "github",
      callbackURL: "/room",
    });

  }


  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Sign In</h1>
          <Button onClick={handleClick} type="submit" className="btn btn-primary">
            Sign in with Spotify
          </Button>
          <Button onClick={handleClick2} type="submit" className="btn btn-primary">
            Sign in with Github
          </Button>
      </div>
    </div>
  );
}
