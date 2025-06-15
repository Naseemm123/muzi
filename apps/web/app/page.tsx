import { ModeToggle } from "@/components/mode";
import { SignIn, SignOut } from "@/components/signin";
import { auth } from "@/auth";

export default async function Page() {
  const session = await auth();

  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Landing Page</h1>
        <ModeToggle />
        {!session ? <SignIn /> : <SignOut />}
      </div>
    </div>
  );
}
