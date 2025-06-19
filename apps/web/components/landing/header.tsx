import { ModeToggle } from "@/components/mode";
import { SignIn, SignOut } from "@/components/signin";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { Session } from "next-auth";

interface HeaderProps {
  session: Session | null;
}

export function Header({ session }: HeaderProps) {
  return (
    <header className="relative z-10 flex justify-between items-center p-8 border-b border-white/5 backdrop-blur-xl animate-fadeInUp">
      <div className="flex items-center space-x-2 group cursor-pointer">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-105">
          <span className="text-black font-bold text-lg">M</span>
        </div>
        <span className="text-white font-medium text-xl tracking-tight">Muzi</span>
      </div>

      <div className="flex items-center space-x-4">
        {session ? (
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              className="text-white/70 hover:text-white hover:bg-white/5"
              asChild
            >
              <Link href="/room">Rooms</Link>
            </Button>
            <SignOut />
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <SignIn />
          </div>
        )}
      </div>
    </header>
  );
}