"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
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
    <form action={formAction} className="space-y-4">
      <Input
        type="text"
        name="input"
        placeholder={`Enter ${type.toLowerCase()} details...`}
        className="w-full"
        required
      />
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? `${type}ing...` : type}
      </Button>
    </form>
  );
}
