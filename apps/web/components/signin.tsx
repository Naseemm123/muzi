import { signOut } from "@/auth";
import { Button } from "@workspace/ui/components/button";
import { redirect } from "next/navigation";

export function SignIn() {
  // where user clicks button redirect to sign in page
  return (
    <form
      action={async () => {
        "use server";
        // redirect to sign in page
        redirect("/signin");
      }}
    >
           <Button 
              type="submit"
              variant="ghost" 
              className="text-white/70 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              Sign In
            </Button>
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
      <Button 
         type="submit"
         variant="ghost" 
         className="text-white/70 hover:text-white hover:bg-white/5 cursor-pointer"
      >
        Sign Out
      </Button>
    </form>
  );
}
