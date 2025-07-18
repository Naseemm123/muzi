import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Room() {

 
const session = await auth.api.getSession({
    headers: await headers() 
})

  return (
    <>
      <h1 className="text-2xl font-bold text-center">this is protected page</h1>
      <br />
      <hr />
      <br />
      <h1 className="text-2xl font-bold text-center">
        Hey {session?.user?.name}, your email is {session?.user?.email} and access token is {session?.session.token}
      </h1>
      
    </>
  );
}
