"use client";

import { Button } from "@workspace/ui/components/button";
import { useActionState } from "react";

export default function Form({
  action,
  type,
}: {
  action: (prevState: unknown, formData: FormData) => void;
  type: string;
}) {
  const [state, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction}>
      <input type="text" />
      <Button type="submit">{isPending ? type + "ing..." : type}</Button>
    </form>
  );
}
