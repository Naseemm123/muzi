import { auth } from "@/auth";
import Form from "./form";
import { test } from "@/actions";

export default async function Room() {
  const session = await auth();

  return (
    <>
      <h1 className="text-2xl font-bold text-center">this is protected page</h1>
      <br />
      <hr />
      <br />
      <h1 className="text-2xl font-bold text-center">
        Hey {session?.user?.name}, your email is {session?.user?.email} and access token is {session?.accessToken}
      </h1>
      <Form action={test} type="Join"></Form>
      <br />
      <Form action={test} type="Create"></Form>
    </>
  );
}
