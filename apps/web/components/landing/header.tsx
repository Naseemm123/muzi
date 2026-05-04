import { SignIn, SignOut } from "@/components/signin";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";


export function Header({ session } : any) {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-6 md:px-6">
      <div className="flex items-center space-x-2 group cursor-pointer">
        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-white/20 bg-white/10 text-sm font-semibold text-white transition-all duration-300 group-hover:rotate-3 group-hover:bg-white/15">
          <span>M</span>
        </div>
        <span className="text-lg font-medium tracking-tight text-white">Muzi</span>
      </div>

      <div className="rounded-full border border-white/10 bg-black/30 px-2 py-1 shadow-[0_10px_24px_rgba(0,0,0,0.25)] backdrop-blur-xl">
        {session ? (
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              className="text-white/80 hover:text-white hover:bg-white/10"
              asChild
            >
              <Link href="/room">Rooms</Link>
            </Button>
            <SignOut />
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <SignIn />
          </div>
        )}
      </div>
    </header>
  );
}
