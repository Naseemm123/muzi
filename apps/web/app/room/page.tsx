import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { RoomForm } from "./room-form";
import { redirect } from "next/navigation";

export default async function Room({ searchParams }: {  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;}) {

  const sp = await searchParams
  const error = sp.error as string | undefined;

  const session = await auth.api.getSession({
    headers: await headers() 
  });

  if(!session){
      redirect('/signin');
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/10 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          />
        ))}
        
        {/* Subtle Moving Lines */}
        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-slide-right"></div>
        <div className="absolute top-2/3 right-0 w-full h-px bg-gradient-to-l from-transparent via-primary/5 to-transparent animate-slide-left"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <RoomForm session={session} error={error} />
      </div>
    </div>
  );
}
