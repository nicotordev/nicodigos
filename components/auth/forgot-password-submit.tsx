"use client";

import { useFormStatus } from "react-dom";
import { useAuthCaptcha } from "@/components/auth/auth-turnstile";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function ForgotPasswordSubmit() {
  const { pending } = useFormStatus();
  const { isReady } = useAuthCaptcha();

  return (
    <Button
      type="submit"
      className="w-full"
      size="lg"
      disabled={pending || !isReady}
    >
      {pending ? (
        <>
          <Spinner />
          Enviando enlace…
        </>
      ) : (
        "Enviar enlace de recuperación"
      )}
    </Button>
  );
}
