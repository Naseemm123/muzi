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

  console.log("Session in Room page:", session);

  if(!session){
      redirect('/signin');
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="relative z-10 w-full max-w-md">
        <RoomForm session={session} error={error} />
      </div>
    </div>
  );
}
