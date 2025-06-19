import { signIn } from "@/auth";
import { Button } from "@workspace/ui/components/button";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Sign In</h1>
        <form
          action={async () => {
            "use server";
            await signIn("github", {
              redirectTo: "/room",
            });
          }}
        >
          <Button type="submit" className="btn btn-primary">
            Sign in with GitHub
          </Button>
        </form>
        <form
          action={async () => {
            "use server";
            await signIn("google", {
              redirectTo: "/room",
            });
          }}
        >
          <Button type="submit" className="btn btn-primary">
            Sign in with Google
          </Button>
        </form>
        <form
          action={async () => {
            "use server";
            await signIn("spotify", {
              redirectTo: "/room",
            });
          }}
        >
          <Button type="submit" className="btn btn-primary">
            Sign in with Spotify
          </Button>
        </form>
      </div>
    </div>
  );
}
