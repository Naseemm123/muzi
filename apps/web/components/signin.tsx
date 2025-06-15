import { signIn, signOut } from "@/auth";
import { Button } from "@workspace/ui/components/button";

export function SignIn() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn();
      }}
    >
      <Button type="submit">sign in</Button>
    </form>
  );
}

export function SignOut() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <Button type="submit">sign out</Button>
    </form>
  );
}
