"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { completeWhatsAppSignupAction } from "@/app/actions";

type EmbeddedSignupResult = {
  type?: string;
  event?: string;
  data?: { waba_id?: string; phone_number_id?: string };
};

type FacebookLoginResponse = {
  authResponse?: { code?: string };
};

declare global {
  interface Window {
    FB?: {
      init(options: { appId: string; cookie: boolean; xfbml: boolean; version: string }): void;
      login(callback: (response: FacebookLoginResponse) => void, options: Record<string, unknown>): void;
    };
    fbAsyncInit?: () => void;
  }
}

export default function WhatsAppSignupButton({ appId, configId }: { appId: string; configId: string }) {
  const [state, action, pending] = useActionState(completeWhatsAppSignupAction, null);
  const [pin, setPin] = useState("");
  const [authorizationCode, setAuthorizationCode] = useState("");
  const [businessAccountId, setBusinessAccountId] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [flowError, setFlowError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    window.fbAsyncInit = () => window.FB?.init({ appId, cookie: true, xfbml: false, version: "v25.0" });
    if (!document.getElementById("facebook-jssdk")) {
      const script = document.createElement("script");
      script.id = "facebook-jssdk";
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const onMessage = (event: MessageEvent) => {
      try {
        const origin = new URL(event.origin).hostname;
        if (!origin.endsWith("facebook.com")) return;
        const payload = typeof event.data === "string" ? JSON.parse(event.data) as EmbeddedSignupResult : event.data as EmbeddedSignupResult;
        if (payload?.type !== "WA_EMBEDDED_SIGNUP") return;
        if (payload.event === "FINISH" && payload.data?.waba_id && payload.data?.phone_number_id) {
          setBusinessAccountId(payload.data.waba_id);
          setPhoneNumberId(payload.data.phone_number_id);
          setFlowError("");
        } else if (payload.event === "CANCEL") {
          setFlowError("WhatsApp signup was cancelled; the account remains disconnected.");
        } else if (payload.event === "ERROR") {
          setFlowError("Meta could not finish business signup. Check the app configuration and try again.");
        }
      } catch {
        return;
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [appId]);

  useEffect(() => {
    if (authorizationCode && businessAccountId && phoneNumberId && !submittedRef.current) {
      submittedRef.current = true;
      formRef.current?.requestSubmit();
    }
  }, [authorizationCode, businessAccountId, phoneNumberId]);

  function startSignup() {
    if (pin.length !== 6) {
      setFlowError("Enter the six-digit WhatsApp registration PIN first.");
      return;
    }
    if (!window.FB) {
      setFlowError("Meta signup is still loading. Try again in a moment.");
      return;
    }

    submittedRef.current = false;
    setAuthorizationCode("");
    setBusinessAccountId("");
    setPhoneNumberId("");
    setFlowError("");
    window.FB.login((response) => {
      const code = response.authResponse?.code;
      if (code) setAuthorizationCode(code);
      else setFlowError("Meta authorization did not return a signup code.");
    }, {
      config_id: configId,
      response_type: "code",
      override_default_response_type: true,
      extras: { setup: {} },
    });
  }

  return (
    <div className="whatsapp-signup">
      <form ref={formRef} action={action} className="form-stack">
        <input type="hidden" name="authorizationCode" value={authorizationCode} readOnly />
        <input type="hidden" name="businessAccountId" value={businessAccountId} readOnly />
        <input type="hidden" name="phoneNumberId" value={phoneNumberId} readOnly />
        <label>
          <span>WhatsApp two-step verification PIN</span>
          <input type="password" name="pin" inputMode="numeric" pattern="[0-9]{6}" minLength={6} maxLength={6} autoComplete="off" value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 6))} required />
        </label>
        <button type="button" className="primary-btn" onClick={startSignup} disabled={pending}>Continue with Meta Business</button>
        {pending && <p className="form-hint">Verifying the business account, registering its number, and subscribing webhooks...</p>}
        {(flowError || state?.error) && <p className="form-error" role="alert">{flowError || state?.error}</p>}
      </form>
    </div>
  );
}
