"use client";

import * as React from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { getTurnstileSiteKey, isTurnstileEnabled } from "@/lib/turnstile";

type AuthCaptchaContextValue = {
  enabled: boolean;
  token: string | null;
  setToken: (token: string | null) => void;
  reset: () => void;
  isReady: boolean;
  turnstileRef: React.RefObject<TurnstileInstance | null>;
};

const AuthCaptchaContext = React.createContext<AuthCaptchaContextValue | null>(
  null,
);

export function AuthCaptchaProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const enabled = isTurnstileEnabled();
  const [token, setToken] = React.useState<string | null>(null);
  const turnstileRef = React.useRef<TurnstileInstance>(null);

  const reset = React.useCallback(() => {
    turnstileRef.current?.reset();
    setToken(null);
  }, []);

  const value = React.useMemo<AuthCaptchaContextValue>(
    () => ({
      enabled,
      token,
      setToken,
      reset,
      isReady: !enabled || !!token,
      turnstileRef,
    }),
    [enabled, token, reset],
  );

  return (
    <AuthCaptchaContext.Provider value={value}>
      {children}
    </AuthCaptchaContext.Provider>
  );
}

export function useAuthCaptcha(): AuthCaptchaContextValue {
  const context = React.useContext(AuthCaptchaContext);

  if (!context) {
    throw new Error("useAuthCaptcha must be used within AuthCaptchaProvider");
  }

  return context;
}

export function AuthTurnstileField({ className }: { className?: string }) {
  const { enabled, setToken, turnstileRef } = useAuthCaptcha();
  const siteKey = getTurnstileSiteKey();

  if (!enabled || !siteKey) {
    return null;
  }

  return (
    <div
      className={
        className ??
        "flex justify-center overflow-hidden rounded-xl border border-border/60 bg-muted/30 p-1"
      }
    >
      <Turnstile
        ref={turnstileRef}
        siteKey={siteKey}
        onSuccess={setToken}
        onExpire={() => setToken(null)}
        onError={() => setToken(null)}
        options={{ theme: "auto", size: "flexible" }}
      />
    </div>
  );
}

/** Syncs Turnstile token into a hidden field for server actions. */
export function AuthCaptchaHiddenInput({
  name = "captchaToken",
}: {
  name?: string;
}) {
  const { enabled, token } = useAuthCaptcha();

  if (!enabled) {
    return null;
  }

  return <input type="hidden" name={name} value={token ?? ""} readOnly />;
}
